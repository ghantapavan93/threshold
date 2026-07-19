"""Deterministic policy evaluator — a PURE function of (session snapshot, policy).

No I/O, no randomness, no wall-clock, no external calls. This is the property that
makes replay bit-for-bit reproducible and safe. It evaluates ONLY the event-time
attributes captured in the session snapshot; it can never see "future" data.
"""
from __future__ import annotations

from dataclasses import dataclass

from .policy import Policy, Rule

MISSING = object()


@dataclass(frozen=True)
class Decision:
    decision: str  # "offer" | "no_offer"
    matched_rules: tuple[str, ...]
    failed_rule: str | None
    fallback_reason: str | None = None  # only set on injected failure paths

    def as_dict(self) -> dict:
        return {
            "decision": self.decision,
            "matched_rules": list(self.matched_rules),
            "failed_rule": self.failed_rule,
            "fallback_reason": self.fallback_reason,
        }


def _present(attrs: dict, key: str) -> bool:
    return key in attrs and attrs[key] is not None


def eval_rule(rule: Rule, attrs: dict) -> bool:
    """Return True if the rule PASSES (session remains eligible)."""
    present = _present(attrs, rule.attribute)
    value = attrs.get(rule.attribute) if present else MISSING

    if rule.op == "equals":
        return present and value == rule.value
    if rule.op == "not_equals":
        return present and value != rule.value
    if rule.op == "gte":
        return present and _num(value) >= _num(rule.value)
    if rule.op == "lte":
        return present and _num(value) <= _num(rule.value)
    if rule.op == "in":
        return present and value in rule.value
    if rule.op == "include_is_not_in":
        # Rokt "Include (is not in)": eligible ONLY if present AND not in list.
        # MISSING -> EXCLUDED.
        return present and value not in rule.value
    if rule.op == "exclude_is_in":
        # Rokt "Exclude (is in)": excluded only if present AND in list.
        # MISSING -> INCLUDED. Present & not in list -> INCLUDED.
        return (not present) or (value not in rule.value)
    raise ValueError(f"unknown operator: {rule.op}")


def _num(v):
    if isinstance(v, bool):  # guard: bool is a subclass of int
        raise ValueError("boolean used in numeric comparison")
    return v


def evaluate(attrs: dict, policy: Policy) -> Decision:
    """Evaluate rules in order. ALL must pass for an OFFER; else No Offer Rendered."""
    matched: list[str] = []
    for rule in policy.eligibility_rules:
        if eval_rule(rule, attrs):
            matched.append(rule.id)
        else:
            return Decision("no_offer", tuple(matched), failed_rule=rule.id)
    return Decision("offer", tuple(matched), failed_rule=None)
