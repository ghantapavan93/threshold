"""Governance vault — who is allowed to change customer behaviour, and how we can
prove it.

A policy version earns trust through a fixed lifecycle: draft → reviewed →
approved → signed → shadow → cohort → live, with rollback reachable from the risky
stages. Each transition is HMAC-signed and chained to the previous signature (the
same tamper-evidence idea as the audit trail), carries the actor and a consent /
retention / redaction envelope, and is scoped to a tenant so one tenant's lineage
can never be replayed into another's. Keys rotate without breaking history —
retired keys still verify the records they signed.

Pure and deterministic (timestamps are passed in), so it is directly testable and
exposed at GET /api/v1/governance-demo as re-runnable evidence.
"""
from __future__ import annotations

import hashlib
import hmac
import json
from dataclasses import dataclass, field

# The only legal moves. Anything else is rejected — that is the governance.
LEGAL: dict[str, set[str]] = {
    "draft": {"reviewed"},
    "reviewed": {"approved", "draft"},      # reviewers can send it back
    "approved": {"signed"},
    "signed": {"shadow"},
    "shadow": {"cohort", "rolled_back"},
    "cohort": {"live", "rolled_back"},
    "live": {"rolled_back"},
    "rolled_back": set(),                    # terminal
}
GENESIS = "GENESIS"


class Keyring:
    """A signing keyring that supports rotation. Rotating adds a new active key but
    retains the old ones, so signatures made under a retired key still verify."""

    def __init__(self, keys: dict[str, str], active: str):
        self._keys = dict(keys)
        self.active = active

    def rotate(self, new_key_id: str, secret: str) -> None:
        self._keys[new_key_id] = secret
        self.active = new_key_id

    def sign(self, msg: bytes) -> tuple[str, str]:
        kid = self.active
        return kid, hmac.new(self._keys[kid].encode(), msg, hashlib.sha256).hexdigest()

    def verify(self, msg: bytes, key_id: str, sig: str) -> bool:
        secret = self._keys.get(key_id)
        if not secret:
            return False
        expected = hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, sig)


@dataclass
class Transition:
    tenant_id: str
    policy_version: str
    stage: str
    actor: str
    at: str
    prev_sig: str
    consent_basis: str
    retention_days: int
    redaction: str
    key_id: str = ""
    sig: str = ""

    def _signable(self) -> bytes:
        # everything except the signature itself, canonically ordered
        return json.dumps(
            {
                "tenant_id": self.tenant_id,
                "policy_version": self.policy_version,
                "stage": self.stage,
                "actor": self.actor,
                "at": self.at,
                "prev_sig": self.prev_sig,
                "consent_basis": self.consent_basis,
                "retention_days": self.retention_days,
                "redaction": self.redaction,
            },
            sort_keys=True,
        ).encode()

    def as_dict(self) -> dict:
        return {
            "stage": self.stage,
            "actor": self.actor,
            "at": self.at,
            "consent_basis": self.consent_basis,
            "retention_days": self.retention_days,
            "redaction": self.redaction,
            "key_id": self.key_id,
            "sig": self.sig[:16] + "…",
        }


class GovernanceVault:
    def __init__(self, keyring: Keyring, tenant_id: str, policy_version: str):
        self.keyring = keyring
        self.tenant_id = tenant_id
        self.policy_version = policy_version
        self.log: list[Transition] = []

    @property
    def stage(self) -> str | None:
        return self.log[-1].stage if self.log else None

    def transition(
        self,
        to_stage: str,
        actor: str,
        at: str,
        *,
        consent_basis: str = "n/a",
        retention_days: int = 0,
        redaction: str = "none",
    ) -> Transition:
        current = self.stage
        allowed = LEGAL.get(current, set()) if current is not None else {"draft"}
        if to_stage not in allowed:
            raise ValueError(f"illegal transition: {current} -> {to_stage}")
        prev = self.log[-1].sig if self.log else GENESIS
        t = Transition(
            tenant_id=self.tenant_id,
            policy_version=self.policy_version,
            stage=to_stage,
            actor=actor,
            at=at,
            prev_sig=prev,
            consent_basis=consent_basis,
            retention_days=retention_days,
            redaction=redaction,
        )
        t.key_id, t.sig = self.keyring.sign(t._signable())
        self.log.append(t)
        return t

    def verify(self) -> bool:
        prev = GENESIS
        for t in self.log:
            if t.tenant_id != self.tenant_id:            # tenant isolation
                return False
            if t.prev_sig != prev:                        # unbroken chain
                return False
            if not self.keyring.verify(t._signable(), t.key_id, t.sig):
                return False
            prev = t.sig
        return True


def run_governance_demo() -> dict:
    """Walk a full lifecycle deterministically and return the evidence: the signed
    lineage, a key rotation that history survives, an illegal transition that is
    refused, a rollback, and a tamper that verification catches."""
    keyring = Keyring({"k1": "governance-key-1"}, active="k1")
    vault = GovernanceVault(keyring, tenant_id="aurora-tickets", policy_version="V18")

    vault.transition("draft", "eng:pavan", "2026-07-01T09:00:00Z")
    vault.transition("reviewed", "eng:reviewer", "2026-07-01T11:00:00Z")
    vault.transition("approved", "lead:staff-eng", "2026-07-02T10:00:00Z", consent_basis="contract", retention_days=395)
    # rotate the signing key before the binding signature — history must still verify
    keyring.rotate("k2", "governance-key-2")
    vault.transition("signed", "release:key-k2", "2026-07-02T10:05:00Z", consent_basis="contract", retention_days=395, redaction="pii-masked")
    vault.transition("shadow", "system:shadow-replay", "2026-07-02T12:00:00Z")
    vault.transition("cohort", "system:5pct-holdout", "2026-07-03T09:00:00Z")
    verified_before_rollback = vault.verify()
    vault.transition("rolled_back", "oncall:eng", "2026-07-03T14:00:00Z")

    # a transition the lifecycle forbids
    illegal_rejected = False
    try:
        vault.transition("live", "someone", "2026-07-03T15:00:00Z")  # can't leave rolled_back
    except ValueError:
        illegal_rejected = True

    lineage = [t.as_dict() for t in vault.log]
    verified = vault.verify()

    # prove tamper-evidence: mutate one record's actor and re-verify
    original_actor = vault.log[2].actor
    vault.log[2].actor = "attacker"
    tamper_detected = not vault.verify()
    vault.log[2].actor = original_actor  # restore

    # prove tenant isolation: inject a foreign-tenant record
    foreign = Transition(
        tenant_id="other-merchant", policy_version="V18", stage="live", actor="x",
        at="2026-07-03T16:00:00Z", prev_sig=vault.log[-1].sig,
        consent_basis="n/a", retention_days=0, redaction="none",
    )
    foreign.key_id, foreign.sig = keyring.sign(foreign._signable())
    vault.log.append(foreign)
    tenant_isolation_holds = not vault.verify()
    vault.log.pop()  # restore

    return {
        "tenant_id": vault.tenant_id,
        "policy_version": vault.policy_version,
        "lineage": lineage,
        "verified": verified,
        "verified_before_rollback": verified_before_rollback,
        "key_rotated_mid_lifecycle": True,
        "illegal_transition_rejected": illegal_rejected,
        "tamper_detected": tamper_detected,
        "tenant_isolation_holds": tenant_isolation_holds,
        "trusted": bool(verified and illegal_rejected and tamper_detected and tenant_isolation_holds),
    }
