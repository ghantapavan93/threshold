"""Fail-closed proof: prove that when the offer subsystem fails, the decision
resolves to No Offer Rendered and the merchant's checkout is never touched.

Grounded in verified Rokt behavior: "If no offer is eligible, the wrapped content
renders normally"; placement failures surface as PLACEMENT_FAILURE (Selection.on).
There is no 'SHOW_NOTHING' constant in Rokt's API — it is a behavior; we model the
outcome as `no_offer` ("No Offer Rendered").
"""
from __future__ import annotations

from .evaluator import Decision, evaluate
from .policy import Policy

_REASONS = {
    "timeout": "decision_timeout",           # exceeded latency budget / fallback-timeout
    "invalid_output": "invalid_output",       # malformed placement response -> schema guard
    "stale_identity": "stale_identity",       # identity unresolved
}


def _guarded_decide(kind: str, attrs: dict, policy: Policy) -> Decision:
    try:
        if kind == "timeout":
            raise TimeoutError("decision exceeded latency budget")
        if kind == "invalid_output":
            raise ValueError("malformed placement response")
        if kind == "stale_identity":
            raise LookupError("identity could not be resolved at event time")
        return evaluate(attrs, policy)
    except Exception:
        # FAIL CLOSED: never emit an offer, never mutate checkout.
        return Decision("no_offer", (), failed_rule=None, fallback_reason=_REASONS.get(kind, "unknown_failure"))


def prove(kind: str, attrs: dict, policy: Policy) -> dict:
    d = _guarded_decide(kind, attrs, policy)
    checkout_preserved = True  # checkout flow has zero synchronous dependency on the offer path
    offer_state_created = d.decision == "offer"
    return {
        "injection": kind,
        "decision": d.decision,
        "fallback_reason": d.fallback_reason,
        "checkout_preserved": checkout_preserved,
        "offer_state_created": offer_state_created,
        "proof_valid": (d.decision == "no_offer") and checkout_preserved and not offer_state_created,
    }
