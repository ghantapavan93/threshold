"""Agentic Transaction Passport — an anti-corruption layer for AI-agent intent.

An AI shopping agent helps a customer discover and compare before checkout, then
hands the transaction platform a "passport": a short-lived packet of claimed intent
(party size, max additional spend, a time constraint, a location preference, a
dietary requirement). The two speak different languages, and the agent is UNTRUSTED —
it may be prompt-injected, stale, over-scoped, or simply wrong. The opportunity is
NOT "let the agent know everything." It is: translate a customer-APPROVED subset of
intent into safe transaction context, and nothing more.

This module is the anti-corruption layer (ACL). It is a PURE, deterministic function
of (passport, now, consent, secret) — no wall-clock, no RNG, no LLM. A field reaches
the transaction ONLY if it clears every gate, fail-closed:

    supported   — the key is in the transaction-context schema (unknown keys are
                  STRIPPED; the agent cannot invent context, e.g. "apply_discount").
    valid       — the value passes its typed validator (else REJECTED).
    confirmed   — the field carries an explicit customer confirmation (agent-asserted
                  but unconfirmed values are REJECTED — explicit customer control).
    unexpired   — the passport is within [issued_at, expires_at] (else NOTHING admits).
    provenanced — an HMAC over the whole passport verifies; tamper any field and the
                  passport is REJECTED wholesale.
    consented   — a sensitive field (dietary) needs an explicit consent grant, else
                  STRIPPED.

Laws that follow (see tests): the admitted set is always a SUBSET of the claimed
keys (the ACL never adds context); every admitted field was customer-confirmed;
an expired or tampered passport admits nothing; and any unsupported key — the shape
a prompt injection takes — can never be admitted.

Provenance reuses the audit HMAC discipline; like the audit trail it is tamper-
EVIDENT, not tamper-PROOF against a key holder.
"""
from __future__ import annotations

import hashlib
import hmac
from dataclasses import dataclass, field
from typing import Any, Callable

from .audit import canonical
from .money import Money, MoneyError, supported_currencies

# ── The supported transaction-context schema ──────────────────────────────────
# The ONLY keys that may ever reach the transaction. Anything else is stripped.


@dataclass(frozen=True)
class FieldSpec:
    validate: Callable[[Any], bool]
    sensitive: bool = False
    describe: str = ""


def _is_int(v: Any) -> bool:
    # bool is an int subclass — reject it explicitly (a boolean is not a count).
    return isinstance(v, int) and not isinstance(v, bool)


def _int_in(lo: int, hi: int) -> Callable[[Any], bool]:
    return lambda v: _is_int(v) and lo <= v <= hi


def _short_str(max_len: int) -> Callable[[Any], bool]:
    return lambda v: isinstance(v, str) and 0 < len(v) <= max_len


SUPPORTED: dict[str, FieldSpec] = {
    "party_size": FieldSpec(_int_in(1, 20), describe="how many people the transaction serves"),
    "max_additional_spend_minor": FieldSpec(
        lambda v: _is_int(v) and v >= 0, describe="spend ceiling in integer minor units (never a float)"),
    "time_constraint_minutes": FieldSpec(_int_in(1, 1440), describe="must complete within N minutes"),
    "location_preference": FieldSpec(_short_str(40), describe="a short location hint"),
    "dietary_requirement": FieldSpec(_short_str(40), sensitive=True,
                                     describe="a dietary need — sensitive, needs consent"),
    # Currency-aware spend ceiling: the agent may claim a MAJOR-unit amount plus a
    # currency; the ACL converts it via ISO 4217 (money.py), enforcing the exponent.
    "spend_currency": FieldSpec(
        lambda v: isinstance(v, str) and v.strip().upper() in supported_currencies(),
        describe="ISO 4217 currency for the spend ceiling"),
    "max_additional_spend": FieldSpec(
        _short_str(20),
        describe="spend ceiling in MAJOR units (e.g. '50.00'); converted per ISO 4217"),
}


# ── Passport model ────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class PassportField:
    key: str
    value: Any
    customer_confirmed: bool = False

    def as_dict(self) -> dict:
        return {"key": self.key, "value": self.value, "customer_confirmed": self.customer_confirmed}


@dataclass(frozen=True)
class Passport:
    agent_id: str
    issued_at: int          # event-time seconds
    expires_at: int
    fields: list[PassportField] = field(default_factory=list)
    signature: str = ""

    def as_dict(self) -> dict:
        return {
            "agent_id": self.agent_id,
            "issued_at": self.issued_at,
            "expires_at": self.expires_at,
            "fields": [f.as_dict() for f in self.fields],
            "signature": self.signature,
        }


def _sign_material(agent_id: str, issued_at: int, expires_at: int,
                   fields: list[PassportField]) -> str:
    """Canonical bytes the signature covers — the WHOLE passport, so tampering any
    field (value or confirmation flag) or the validity window breaks it."""
    return canonical({
        "agent_id": agent_id,
        "issued_at": issued_at,
        "expires_at": expires_at,
        "fields": sorted(
            ([f.key, f.value, f.customer_confirmed] for f in fields),
            key=lambda x: x[0],
        ),
    })


def sign(agent_id: str, issued_at: int, expires_at: int,
         fields: list[PassportField], secret: str) -> str:
    material = _sign_material(agent_id, issued_at, expires_at, fields)
    return hmac.new(secret.encode(), material.encode(), hashlib.sha256).hexdigest()


def build_signed(agent_id: str, issued_at: int, expires_at: int,
                 fields: list[PassportField], secret: str) -> Passport:
    sig = sign(agent_id, issued_at, expires_at, fields, secret)
    return Passport(agent_id, issued_at, expires_at, fields, sig)


# ── The anti-corruption layer ─────────────────────────────────────────────────

# Per-field ledger statuses.
ADMITTED, STRIPPED, REJECTED = "ADMITTED", "STRIPPED", "REJECTED"


def admit(passport: Passport, now: int, consent: dict[str, bool], secret: str) -> dict:
    """Translate a claimed passport into safe transaction context. Deterministic.

    Returns the admitted context (a subset of claimed fields), a per-field ledger,
    and whether the passport itself is valid. A provenance or expiry failure admits
    NOTHING — those are whole-passport rejections."""
    ledger: list[dict] = []
    claimed_keys = [f.key for f in passport.fields]

    def result(admitted: dict, passport_valid: bool, reason: str | None,
               derived_spend: dict | None = None) -> dict:
        return {
            "passport_valid": passport_valid,
            "reason": reason,
            "admitted": admitted,
            # A DERIVED value (not a claimed key, so kept out of `admitted` to preserve
            # admitted ⊆ claimed): the currency-converted spend ceiling, when present.
            "derived_spend": derived_spend,
            "ledger": ledger,
            "claimed_keys": claimed_keys,
            "expires_in": passport.expires_at - now,
            "agent_id": passport.agent_id,
        }

    # 1) Provenance — verify the signature over the whole passport (constant-time).
    expected = sign(passport.agent_id, passport.issued_at, passport.expires_at,
                    passport.fields, secret)
    if not hmac.compare_digest(expected, passport.signature or ""):
        for f in passport.fields:
            ledger.append({"key": f.key, "status": REJECTED, "reason": "passport provenance invalid (signature mismatch)"})
        return result({}, False, "provenance invalid — the passport was not signed by a trusted issuer, or was altered after signing")

    # 2) Expiry window — an expired (or not-yet-valid) passport admits nothing.
    if now > passport.expires_at:
        for f in passport.fields:
            ledger.append({"key": f.key, "status": REJECTED, "reason": f"passport expired {now - passport.expires_at}s ago"})
        return result({}, False, "passport expired — short-lived intent must be re-confirmed")
    if now < passport.issued_at:
        for f in passport.fields:
            ledger.append({"key": f.key, "status": REJECTED, "reason": "passport not yet valid (issued in the future)"})
        return result({}, False, "passport not yet valid")

    # 3) Field-by-field — supported ∧ valid ∧ confirmed ∧ consented.
    admitted: dict[str, Any] = {}
    for f in passport.fields:
        spec = SUPPORTED.get(f.key)
        if spec is None:
            ledger.append({"key": f.key, "status": STRIPPED,
                           "reason": "unsupported key — not in the transaction-context schema (an agent cannot invent context)"})
            continue
        if not f.customer_confirmed:
            ledger.append({"key": f.key, "status": REJECTED,
                           "reason": "agent-asserted but not customer-confirmed — explicit confirmation required"})
            continue
        if not spec.validate(f.value):
            ledger.append({"key": f.key, "status": REJECTED,
                           "reason": f"value fails validation ({spec.describe})"})
            continue
        if spec.sensitive and not consent.get(f.key, False):
            ledger.append({"key": f.key, "status": STRIPPED,
                           "reason": "sensitive field without a consent grant — stripped"})
            continue
        admitted[f.key] = f.value
        ledger.append({"key": f.key, "status": ADMITTED, "reason": "supported, valid, customer-confirmed, in-window"})

    # 4) Currency-aware spend — ISO 4217 exponent enforcement at the seam. When the
    # agent claims a MAJOR-unit spend ceiling, convert it to minor units for its
    # currency, REFUSING more precision than that currency allows (¥5000.50 or
    # $12.345). A spend without a currency is meaningless and is rejected.
    def _relabel(key: str, status: str, reason: str) -> None:
        for row in ledger:
            if row["key"] == key:
                row["status"], row["reason"] = status, reason
                return

    derived_spend: dict | None = None
    if "max_additional_spend" in admitted:
        currency = admitted.get("spend_currency")
        if currency is None:
            admitted.pop("max_additional_spend")
            _relabel("max_additional_spend", REJECTED,
                     "a spend amount without a currency is meaningless — provide spend_currency")
        else:
            try:
                money = Money.from_major(admitted["max_additional_spend"], currency)
                derived_spend = money.as_dict()  # kept OUT of admitted (not a claimed key)
                _relabel("max_additional_spend", ADMITTED,
                         f"confirmed intent; converts to {money.format()} — {money.minor} minor "
                         f"units ({money.currency}, exponent {money.exponent})")
            except MoneyError as exc:
                admitted.pop("max_additional_spend")
                _relabel("max_additional_spend", REJECTED, f"currency check failed: {exc}")

    return result(admitted, True, None, derived_spend)


# ── Curated scenarios — each teaches one ACL behaviour ─────────────────────────

_NOW = 1_000_000  # a fixed event-time anchor so the demo is bit-for-bit reproducible


def _base_fields() -> list[PassportField]:
    return [
        PassportField("party_size", 2, True),
        PassportField("max_additional_spend_minor", 4000, True),  # $40.00 in cents
        PassportField("time_constraint_minutes", 90, True),
        PassportField("location_preference", "near the venue", True),
    ]


def scenarios(secret: str) -> dict[str, dict]:
    """Named (passport, now, consent) fixtures. Each returns a fully-formed passport
    plus the context in which the ACL judges it."""
    out: dict[str, dict] = {}

    out["clean"] = {
        "label": "Clean passport",
        "blurb": "Well-formed, customer-confirmed, signed, in-window — every field is admitted as safe context.",
        "now": _NOW, "consent": {},
        "passport": build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, _base_fields(), secret),
    }

    injected = _base_fields() + [
        PassportField("apply_discount_pct", 50, True),   # the agent tries to control price
        PassportField("internal_priority", "override", True),
    ]
    out["prompt_injection"] = {
        "label": "Prompt injection",
        "blurb": "The agent slips in transaction-controlling keys (apply_discount_pct, internal_priority). Unsupported keys are stripped; the honest fields still pass.",
        "now": _NOW, "consent": {},
        "passport": build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, injected, secret),
    }

    unconfirmed = [
        PassportField("party_size", 2, True),
        PassportField("max_additional_spend_minor", 25000, False),  # $250 the customer never confirmed
        PassportField("location_preference", "downtown", True),
    ]
    out["unconfirmed"] = {
        "label": "Unconfirmed spend",
        "blurb": "The agent guesses a $250 spend ceiling the customer never confirmed — rejected. Only confirmed intent influences the transaction.",
        "now": _NOW, "consent": {},
        "passport": build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, unconfirmed, secret),
    }

    out["expired"] = {
        "label": "Expired passport",
        "blurb": "Short-lived intent past its expiry admits nothing — it must be re-confirmed, not replayed.",
        "now": _NOW, "consent": {},
        "passport": build_signed("shopping-agent-7", _NOW - 600, _NOW - 30, _base_fields(), secret),
    }

    # sign a valid passport, then tamper a value AFTER signing.
    good = build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, _base_fields(), secret)
    tampered_fields = [
        PassportField("party_size", 2, True),
        PassportField("max_additional_spend_minor", 999999, True),  # inflated after signing
        PassportField("time_constraint_minutes", 90, True),
        PassportField("location_preference", "near the venue", True),
    ]
    out["tampered"] = {
        "label": "Tampered after signing",
        "blurb": "A value was changed after the passport was signed. Provenance fails, and the whole passport is rejected.",
        "now": _NOW, "consent": {},
        "passport": Passport("shopping-agent-7", _NOW - 60, _NOW + 300, tampered_fields, good.signature),
    }

    dietary = _base_fields() + [PassportField("dietary_requirement", "nut allergy", True)]
    out["sensitive_no_consent"] = {
        "label": "Sensitive field, no consent",
        "blurb": "A confirmed dietary requirement is present but consent wasn't granted — it's stripped; the non-sensitive fields still pass.",
        "now": _NOW, "consent": {},
        "passport": build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, dietary, secret),
    }
    out["sensitive_with_consent"] = {
        "label": "Sensitive field, consent granted",
        "blurb": "The same dietary requirement, now with an explicit consent grant — admitted.",
        "now": _NOW, "consent": {"dietary_requirement": True},
        "passport": build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, dietary, secret),
    }

    bad_range = [
        PassportField("party_size", 500, True),                     # out of range
        PassportField("max_additional_spend_minor", 12.5, True),    # a float, not minor units
        PassportField("time_constraint_minutes", 60, True),
    ]
    out["out_of_range"] = {
        "label": "Invalid values",
        "blurb": "party_size 500 and a fractional spend fail their validators (the Unit Wall: minor units are integers) — rejected. The valid field passes.",
        "now": _NOW, "consent": {},
        "passport": build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, bad_range, secret),
    }

    jpy = [
        PassportField("party_size", 2, True),
        PassportField("max_additional_spend", "5000", True),  # major units — whole yen
        PassportField("spend_currency", "JPY", True),
    ]
    out["foreign_currency"] = {
        "label": "Foreign currency (JPY)",
        "blurb": "The agent claims a ¥5000 ceiling. JPY has no minor unit (ISO 4217 exp 0), so the ACL converts '5000' → 5000 minor and admits it.",
        "now": _NOW, "consent": {},
        "passport": build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, jpy, secret),
    }

    bad_precision = [
        PassportField("party_size", 2, True),
        PassportField("max_additional_spend", "5000.50", True),  # yen has no sub-unit
        PassportField("spend_currency", "JPY", True),
    ]
    out["currency_precision"] = {
        "label": "Impossible precision",
        "blurb": "The agent claims ¥5000.50 — but JPY has no minor unit. The ACL refuses the amount instead of silently mis-scaling it.",
        "now": _NOW, "consent": {},
        "passport": build_signed("shopping-agent-7", _NOW - 60, _NOW + 300, bad_precision, secret),
    }

    return out


def run_named_scenario(name: str, secret: str) -> dict:
    specs = scenarios(secret)
    spec = specs.get(name)
    if spec is None:
        raise KeyError(name)
    passport: Passport = spec["passport"]
    outcome = admit(passport, spec["now"], spec["consent"], secret)
    counts = {"ADMITTED": 0, "STRIPPED": 0, "REJECTED": 0}
    for row in outcome["ledger"]:
        counts[row["status"]] += 1
    return {
        "scenario": name,
        "label": spec["label"],
        "blurb": spec["blurb"],
        "now": spec["now"],
        "consent": spec["consent"],
        "passport": passport.as_dict(),
        "outcome": outcome,
        "summary": {"claimed": len(passport.fields), **{k.lower(): v for k, v in counts.items()}},
        "law": "Translate a customer-approved subset of intent into safe transaction context — never more.",
        "note": ("The passport is untrusted agent output; the anti-corruption layer is a pure, "
                 "deterministic gate. A field reaches the transaction only if it is supported, valid, "
                 "customer-confirmed, in-window, and (if sensitive) consented. The admitted context is "
                 "always a subset of what was claimed — the agent can never invent or inflate context."),
    }
