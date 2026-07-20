"""Translation Map — the ACL seam made EXECUTABLE (Case A of the integration critique).

PURE, deterministic, no I/O / no LLM / no wall-clock — mirrors `sessions.py` /
`contexts.py` discipline exactly. This module closes the self-critique in
docs/MOMENT_FORGE_INTEGRATION_CASES.md §0: the shipped engine only ever demonstrated
a *within-context* operator flip; here the polysemic term **conversion** genuinely
means two different things in two different pieces of running code, and the corruption
happens in the translation step BETWEEN them.

The seam (Evans, Blue Book ch. 14):

    BC-5 Measurement            BC-3 Incrementality
    "a conversion is a          "a conversion is a causally-incremental outcome —
     deduplicated recorded       treatment minus who-would-have-converted-anyway"
     event"            ── ACL ──▶

Two translations across that seam:
  * `conformist_translate`  — THE BUG. Identity. Every RECORDED conversion is passed
    downstream as if it were INCREMENTAL, so would-have-converted-anyway conversions
    are silently counted as lift → the number inflates upward.
  * `acl_translate`         — THE CORRECT translation. Only conversions the treatment
    actually caused cross the seam as incremental; the baseline is removed (standard
    incrementality subtraction).

The demonstration reuses the engine's existing counterfactual move — "revert the ACL
to identity and show what leaks" is structurally the SAME counterfactual as "revert the
operator and show what widens" (constraints.py:155-168). One idea, two applications.

HONESTY (the one synthetic parameter, labelled exactly like sessions.py "~18% omit
cc_bin"): `incremental_fraction` is a SEEDED GROUND TRUTH for which recorded
conversions were truly caused by the offer. In the real world this split is
UNOBSERVABLE per event — that is precisely WHY incrementality needs a controlled
"Would Have Seen" holdout to ESTIMATE it. We seed it here only so the mechanism is
bit-for-bit replayable. The translation math (baseline removal) is standard
incrementality [VERIFIED-PUBLIC that Rokt bets on it]; the specific seam and the
baseline value are [INFERENCE]/synthetic and are labelled as such in every response.
NO Rokt-internal number is asserted; the two lift figures are computed live from this
labelled synthetic corpus, never hand-authored.
"""
from __future__ import annotations

import random
from dataclasses import dataclass
from enum import Enum
from typing import Sequence

# The seam this module models. `conversion` is authoritative in BOTH contexts; the
# ACL is the thing that keeps the two meanings straight.
SEAM = "BC-5 Measurement → BC-3 Incrementality"
UPSTREAM_MEANING = "deduplicated recorded event (identity conversiontype:confirmationref)"
DOWNSTREAM_MEANING = "causally-incremental outcome (treatment minus would-have-converted-anyway)"
PATTERN = "Anticorruption Layer"
GROUNDING = (
    "Rokt's dedup key is a de-facto Published Language for the RECORDED meaning "
    "(conversions.py:18); there is no published identity for the INCREMENTAL meaning, "
    "which is exactly where the Conformist leak hides."
)

# THE ONE SYNTHETIC INPUT — labelled like sessions.py "~18% of sessions omit cc_bin".
# Fraction of recorded conversions that were genuinely caused by the offer. The
# remainder (1 - fraction) would have converted anyway → the upward-bias leak.
DEFAULT_INCREMENTAL_FRACTION = 0.62

_SYNTHETIC_LABEL = (
    "[SYNTHETIC] ground-truth incremental fraction. Unobservable per-event in reality; "
    "a controlled holdout only ESTIMATES it. Seeded here for bit-for-bit replay — "
    "labelled exactly like the engine's '~18% omit cc_bin' synthetic. No Rokt-internal "
    "number is asserted."
)


class ConversionKind(str, Enum):
    """Whole-value discriminator (the §2.2 fix): the owning context is stamped in the
    type, so a cross-context assignment REQUIRES a translation instead of a silent copy."""

    RECORDED = "recorded"        # BC-5 Measurement — "have we already counted this?"
    INCREMENTAL = "incremental"  # BC-3 Incrementality — "did the offer CAUSE this?"


class CausalOrigin(str, Enum):
    """Ground-truth cause of a recorded conversion (the seeded synthetic label)."""

    TREATMENT_CAUSED = "treatment_caused"    # would NOT have converted without the offer
    WOULD_HAVE_ANYWAY = "would_have_anyway"  # baseline — converts regardless (the leak)


class UnitMismatchError(TypeError):
    """Raised when two quantities with DIFFERENT owning contexts are combined
    without a translation. This is the Whole Value / Quantity discipline made
    enforceable (Cunningham CHECKS; Evans Value Object): `recorded + incremental`
    must not silently type-check into a number — the silent copy IS the disease."""


@dataclass(frozen=True)
class ConversionEvent:
    """A typed whole-value carrying its meaning across the seam. `origin` is the seeded
    ground truth on corpus events; it is None on translation RESULTS (aggregates).

    Whole-value algebra (the W3 fix): adding two events of the SAME kind merges
    them; adding across kinds raises `UnitMismatchError`. A cross-context
    assignment therefore REQUIRES a translation function (the ACL) — an implicit
    Conformist becomes a runtime error at the seam instead of a silent copy."""

    kind: ConversionKind
    count: int
    seam: str
    origin: CausalOrigin | None = None

    def __add__(self, other: object) -> "ConversionEvent":
        if not isinstance(other, ConversionEvent):
            return NotImplemented
        if other.kind is not self.kind:
            raise UnitMismatchError(
                f"cannot add {self.kind.value} + {other.kind.value}: the two counts "
                "belong to different bounded contexts and mean different things. "
                "Translate across the seam first (acl_translate), or the sum is a lie."
            )
        return ConversionEvent(kind=self.kind, count=self.count + other.count, seam=self.seam)


def demonstrate_unit_wall() -> dict:
    """Actually PERFORM the illegal cross-kind addition and report what the type
    system did about it — real runtime output, never a hand-written claim. Also
    performs the legal same-kind merge for contrast."""
    recorded = ConversionEvent(kind=ConversionKind.RECORDED, count=10, seam=SEAM)
    incremental = ConversionEvent(kind=ConversionKind.INCREMENTAL, count=6, seam=SEAM)
    try:
        recorded + incremental  # type: ignore[expression-not-assigned]  # noqa: B018
        blocked: dict = {"raised": False}
    except UnitMismatchError as exc:
        blocked = {"raised": True, "error": type(exc).__name__, "message": str(exc)}
    legal = recorded + ConversionEvent(kind=ConversionKind.RECORDED, count=5, seam=SEAM)
    return {
        "illegal": {"attempted": "recorded(10) + incremental(6)", **blocked},
        "legal": {
            "attempted": "recorded(10) + recorded(5)",
            "result": {"kind": legal.kind.value, "count": legal.count},
        },
    }


# --------------------------------------------------------------------------- #
# The seeded corpus (reuses the sessions.py seeding discipline)
# --------------------------------------------------------------------------- #
def generate_conversion_corpus(
    seed: int, count: int, incremental_fraction: float = DEFAULT_INCREMENTAL_FRACTION,
) -> list[ConversionEvent]:
    """Deterministic corpus of RECORDED conversions, each tagged with its ground-truth
    causal origin. Same (seed, count, fraction) → identical corpus → replayable."""
    rng = random.Random(seed)
    corpus: list[ConversionEvent] = []
    for _ in range(count):
        origin = (
            CausalOrigin.TREATMENT_CAUSED
            if rng.random() < incremental_fraction
            else CausalOrigin.WOULD_HAVE_ANYWAY
        )
        corpus.append(
            ConversionEvent(kind=ConversionKind.RECORDED, count=1, seam=SEAM, origin=origin)
        )
    return corpus


# --------------------------------------------------------------------------- #
# The two translations across BC-5 Measurement → BC-3 Incrementality
# --------------------------------------------------------------------------- #
def conformist_translate(recorded: Sequence[ConversionEvent]) -> ConversionEvent:
    """THE BUG (Conformist). Identity across the seam: downstream inherits every
    RECORDED conversion as if it were INCREMENTAL. The would-have-converted-anyway
    ones ride along and are counted as lift → the number inflates upward."""
    total = sum(e.count for e in recorded)
    return ConversionEvent(kind=ConversionKind.INCREMENTAL, count=total, seam=SEAM)


def acl_translate(recorded: Sequence[ConversionEvent]) -> ConversionEvent:
    """THE ACL (correct). Only conversions the treatment actually caused cross the seam
    as incremental; the would-have-converted-anyway baseline is removed — standard
    incrementality subtraction. An ACL can only ever REMOVE non-incremental counts, so
    acl_result.count <= conformist_result.count always."""
    incremental = sum(
        e.count for e in recorded if e.origin is CausalOrigin.TREATMENT_CAUSED
    )
    return ConversionEvent(kind=ConversionKind.INCREMENTAL, count=incremental, seam=SEAM)


def _event_dict(event: ConversionEvent) -> dict:
    return {"kind": event.kind.value, "count": event.count, "seam": event.seam}


# --------------------------------------------------------------------------- #
# The audit: run BOTH translations over the seeded corpus and return the delta
# --------------------------------------------------------------------------- #
def audit_translation(
    seed: int, count: int, incremental_fraction: float = DEFAULT_INCREMENTAL_FRACTION,
) -> dict:
    """Run both translations over the seeded corpus and return the upward-bias leak:
    how many recorded-but-non-incremental conversions the Conformist path counts as
    lift that the ACL path correctly excludes.

    `leaked_conversions == recorded_lift - incremental_lift` is EXACTLY the
    would-have-converted-anyway set — a real number from real code, not asserted.
    Reverting the ACL to `conformist_translate` (identity) IS the counterfactual; the
    leak is what escapes when the ACL is absent.
    """
    corpus = generate_conversion_corpus(seed, count, incremental_fraction)

    conformist = conformist_translate(corpus)  # identity — the bug
    acl = acl_translate(corpus)                 # causal — the correct translation

    recorded_lift = conformist.count
    incremental_lift = acl.count
    leaked = recorded_lift - incremental_lift    # the non-incremental (baseline) set

    treatment_caused = sum(
        1 for e in corpus if e.origin is CausalOrigin.TREATMENT_CAUSED
    )
    would_have_anyway = sum(
        1 for e in corpus if e.origin is CausalOrigin.WOULD_HAVE_ANYWAY
    )
    # How much the Conformist path inflates the TRUE (incremental) lift.
    upward_bias_pct = (
        round(leaked / incremental_lift * 100.0, 2) if incremental_lift else 0.0
    )

    return {
        "term": "conversion",
        "seam": SEAM,
        "upstream_meaning": UPSTREAM_MEANING,
        "downstream_meaning": DOWNSTREAM_MEANING,
        "pattern": PATTERN,
        "seed": seed,
        "count": count,
        "conformist_result": _event_dict(conformist),
        "acl_result": _event_dict(acl),
        "recorded_lift": recorded_lift,
        "incremental_lift": incremental_lift,
        "leaked_conversions": leaked,
        "corruption": {
            "magnitude": leaked,
            "direction": "inflation",
            "upward_bias_pct": upward_bias_pct,
        },
        "per_origin": {
            "treatment_caused": treatment_caused,
            "would_have_anyway": would_have_anyway,
        },
        "synthetic_inputs": [
            {
                "name": "incremental_fraction",
                "value": incremental_fraction,
                "label": _SYNTHETIC_LABEL,
            }
        ],
        "grounding": GROUNDING,
        "note": (
            "Conformist (identity ACL) counts the would-have-converted-anyway set as "
            f"lift: {leaked} of {recorded_lift} recorded conversions inflate the true "
            f"incremental lift of {incremental_lift} upward by {upward_bias_pct}%. The "
            "translation math is standard incrementality; the seam and baseline are "
            "[INFERENCE]/synthetic; the numbers are computed live, not asserted."
        ),
    }
