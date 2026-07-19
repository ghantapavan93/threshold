"""Deterministic policy evaluator — a PURE function of (session snapshot, policy).

No I/O, no randomness, no wall-clock, no external calls. This is the property that
makes replay bit-for-bit reproducible and safe. It evaluates ONLY the event-time
attributes captured in the session snapshot; it can never see "future" data.
"""
from __future__ import annotations

from dataclasses import dataclass

from .policy import Policy, Rule

MISSING = object()


class InvalidComparison(Exception):
    """Raised inside `eval_rule` when a `gte`/`lte` rule is applied to a value that
    is not comparable as a number (a bool, or a non-numeric string). It is caught
    by `evaluate`, which fails the rule closed (no_offer) rather than letting the
    exception escape the pure core. See E8/E8b in docs/MOMENT_FORGE_ALGORITHMS.md."""


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
        if not present:
            return False
        return _num_compare(value, rule.value, "gte")
    if rule.op == "lte":
        if not present:
            return False
        return _num_compare(value, rule.value, "lte")
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


def _num_compare(value, threshold, op: str) -> bool:
    """Compare `value <op> threshold` numerically, failing CLOSED on bad data.

    A bool or a non-numeric string is not a valid numeric operand; rather than let
    the underlying ValueError/TypeError escape `evaluate`, we surface it as
    `InvalidComparison` so the core can deterministically fail the rule."""
    try:
        a, b = _num(value), _num(threshold)
        return a >= b if op == "gte" else a <= b
    except (TypeError, ValueError) as exc:
        raise InvalidComparison(str(exc)) from exc


def evaluate(attrs: dict, policy: Policy) -> Decision:
    """Evaluate rules in order. ALL must pass for an OFFER; else No Offer Rendered.

    Fail-closed core: if a `gte`/`lte` rule is fed a non-numeric/boolean value the
    rule is treated as FAILING and we return `no_offer` with
    `fallback_reason="invalid_comparison"` — the exception never escapes (E8/E8b)."""
    matched: list[str] = []
    for rule in policy.eligibility_rules:
        try:
            passed = eval_rule(rule, attrs)
        except InvalidComparison:
            return Decision("no_offer", tuple(matched), failed_rule=rule.id,
                            fallback_reason="invalid_comparison")
        if passed:
            matched.append(rule.id)
        else:
            return Decision("no_offer", tuple(matched), failed_rule=rule.id)
    return Decision("offer", tuple(matched), failed_rule=None)
