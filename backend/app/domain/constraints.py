"""Deterministic hard-constraint validator.

Every check is grounded in a VERIFIED public Rokt fact (docs/VERIFIED_FACTS.md).
The centerpiece is `missing_attribute_semantics`, which catches the verified Rokt
trap where switching a rule from "Include (is not in)" to "Exclude (is in)" silently
makes every session with a MISSING attribute eligible. We isolate the trap with a
counterfactual: revert just that operator and see if the proposed OFFER disappears.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass

from .evaluator import Decision, _present, evaluate
from .policy import PROHIBITED_CATEGORIES, Policy, Rule

GROUNDING = {
    "latency_budget": 'Rokt publishes "sub-200ms latency"; <rokt-thank-you fallback-timeout> defaults to 5000ms.',
    "fallback_explicit": 'Rokt: "If no offer is eligible, the wrapped content renders normally." Fallback must be No Offer Rendered.',
    "consent": "Rokt exposes noFunctional/noTargeting consent flags; sensitive PII must be consent-gated.",
    "brand_safety": "Rokt Ads policies prohibit categories (gambling/alcohol/tobacco) without age gating.",
    "frequency_cap": "Frequency management: raising impression caps increases exposure/fatigue risk.",
    "holdout_required": 'Rokt One Platform Page Holdout: a recommended 5% control before rollout.',
    "requires_reapproval": 'Rokt: "Material changes to a campaign\'s privacy policy, disclaimers, or terms and conditions trigger the approval process."',
    "immutable_field_guard": 'Rokt Manage-a-campaign: objective/country/language/timezone cannot be edited — "you need to create a new campaign".',
    "plausibility": 'Operational guard (not a Rokt-doc rule): catch data-entry errors before subtler checks — inspired by ShelfTrace\'s execution-gate plausibility guard.',
    "missing_attribute_semantics": 'Rokt Audience targeting: "Include (is not in)" vs "Exclude (is in)" differ only on MISSING values.',
}

_IMMUTABLE_FIELDS = ["objective", "country", "language", "timezone"]


@dataclass
class ConstraintResult:
    key: str
    result: str  # PASS | WARN | FAIL
    detail: str

    def as_dict(self) -> dict:
        return {"key": self.key, "result": self.result, "detail": self.detail,
                "grounding": GROUNDING.get(self.key, "")}


def _has_age_gate(policy: Policy) -> bool:
    return any(r.attribute == "customer.age" and r.op == "gte" for r in policy.eligibility_rules)


def evaluate_constraints(
    base: Policy,
    proposed: Policy,
    sessions: list[dict],
    base_dec: dict[str, Decision],
    prop_dec: dict[str, Decision],
    diff: dict,
) -> tuple[list[ConstraintResult], dict[str, str]]:
    results: list[ConstraintResult] = []

    # latency_budget
    if proposed.latency_budget_ms <= base.latency_budget_ms:
        results.append(ConstraintResult("latency_budget", "PASS",
                                        f"Latency budget {proposed.latency_budget_ms}ms within current {base.latency_budget_ms}ms."))
    elif proposed.latency_budget_ms <= 500:
        results.append(ConstraintResult("latency_budget", "WARN",
                                        f"Latency budget raised {base.latency_budget_ms}ms -> {proposed.latency_budget_ms}ms."))
    else:
        results.append(ConstraintResult("latency_budget", "FAIL",
                                        f"Latency budget {proposed.latency_budget_ms}ms exceeds 500ms ceiling."))

    # fallback_explicit
    if proposed.fallback_action == "no_offer":
        results.append(ConstraintResult("fallback_explicit", "PASS", "Fallback is No Offer Rendered."))
    else:
        results.append(ConstraintResult("fallback_explicit", "FAIL",
                                        f"Fallback action '{proposed.fallback_action}' is not No Offer Rendered."))

    # consent
    bad_consent = [r.id for r in proposed.eligibility_rules if r.sensitive and not r.consent_required]
    if bad_consent:
        results.append(ConstraintResult("consent", "FAIL",
                                        f"Rule(s) {', '.join(bad_consent)} use sensitive attributes without consent_required."))
    else:
        results.append(ConstraintResult("consent", "PASS", "No sensitive attribute used without consent."))

    # brand_safety
    if proposed.offer.category in PROHIBITED_CATEGORIES and not _has_age_gate(proposed):
        results.append(ConstraintResult("brand_safety", "FAIL",
                                        f"Offer category '{proposed.offer.category}' requires an age gate."))
    else:
        results.append(ConstraintResult("brand_safety", "PASS",
                                        f"Offer category '{proposed.offer.category}' compliant."))

    # frequency_cap
    b_cap, p_cap = base.frequency_cap.max_impressions, proposed.frequency_cap.max_impressions
    if p_cap > b_cap:
        results.append(ConstraintResult("frequency_cap", "WARN",
                                        f"Impression cap raised {b_cap} -> {p_cap} per {proposed.frequency_cap.per_days}d."))
    else:
        results.append(ConstraintResult("frequency_cap", "PASS", f"Impression cap {p_cap} not increased."))

    # holdout_required
    if proposed.requires_holdout:
        results.append(ConstraintResult("holdout_required", "PASS", "Mandatory holdout retained."))
    else:
        results.append(ConstraintResult("holdout_required", "FAIL", "Policy change bypasses the mandatory holdout."))

    # requires_reapproval — a material-term change re-enters Rokt's manual approval queue
    if (base.disclaimers or "") != (proposed.disclaimers or ""):
        results.append(ConstraintResult("requires_reapproval", "WARN",
                                        "Material change to disclaimers — this change re-enters Rokt's manual approval queue."))
    else:
        results.append(ConstraintResult("requires_reapproval", "PASS", "No material-term change."))

    # immutable_field_guard — objective/country/language/timezone require a NEW campaign
    changed_immutable = [f for f in _IMMUTABLE_FIELDS if getattr(base, f) != getattr(proposed, f)]
    if changed_immutable:
        results.append(ConstraintResult("immutable_field_guard", "FAIL",
                                        f"Immutable field(s) {', '.join(changed_immutable)} changed; require a new campaign, not an edit."))
    else:
        results.append(ConstraintResult("immutable_field_guard", "PASS", "No immutable field changed."))

    # plausibility — catch fat-finger data-entry errors before the subtler checks
    issues: list[str] = []
    for r in proposed.eligibility_rules:
        if r.attribute == "customer.age" and r.op in ("gte", "lte"):
            try:
                v = float(r.value)
                if v < 13 or v > 100:
                    issues.append(f"age gate {r.value} is out of plausible range (13-100)")
            except (TypeError, ValueError):
                pass
    if proposed.frequency_cap.max_impressions > 20:
        issues.append(f"frequency cap {proposed.frequency_cap.max_impressions} is implausibly high")
    if proposed.latency_budget_ms < 10 or proposed.latency_budget_ms > 2000:
        issues.append(f"latency budget {proposed.latency_budget_ms}ms is implausible")
    if issues:
        results.append(ConstraintResult("plausibility", "FAIL",
                                        "; ".join(issues) + " — likely a data-entry error."))
    else:
        results.append(ConstraintResult("plausibility", "PASS", "Policy values within plausible ranges."))

    # NOTE on eligibility widening: a VISIBLE widening (a lowered age gate, a
    # grown membership list) is tagged in the diff (risk="eligibility_widened")
    # and is BY DESIGN a holdout question, not a block — ELIGIBLE_FOR_HOLDOUT
    # exists precisely to test a deliberate widening under a controlled control
    # group. What the gate BLOCKS is a SILENT/STRUCTURAL widening the operator
    # didn't intend — the missing-attribute flip below. The diff surfaces the
    # visible widening; the verdict does not rubber-stamp it away, it routes it to
    # the holdout.

    # missing_attribute_semantics (the star) — ATTRIBUTE-LEVEL, id-independent.
    # A rule "guards" an attribute against MISSING iff its op excludes when the
    # value is absent — every op except exclude_is_in. The trap is any attribute
    # the base guarded but the proposed no longer does: missing-attribute sessions
    # flip EXCLUDED -> ELIGIBLE. Detecting it at the attribute level catches the
    # flip however it is spelled — an in-place op change, a RENAMED rule, or a
    # remove+add — not just a same-id op tag, which a rename would evade. Each
    # flagged session is confirmed causally: re-guard that attribute against
    # missing and, if the proposed OFFER vanishes, the missing-value handling is
    # the necessary cause.
    def _guards_missing(pol: Policy, attr: str) -> bool:
        return any(r.attribute == attr and r.op != "exclude_is_in"
                   for r in pol.eligibility_rules)

    attrs = ({r.attribute for r in base.eligibility_rules}
             | {r.attribute for r in proposed.eligibility_rules})
    widened_attrs = sorted(a for a in attrs
                           if _guards_missing(base, a) and not _guards_missing(proposed, a))

    by_id = {s["session_id"]: s for s in sessions}
    violations: dict[str, str] = {}  # session_id -> the widened attribute
    for attr in widened_attrs:
        # An include_is_not_in rule with an empty list excludes exactly the
        # sessions whose value is absent, and is a no-op where it is present.
        guarded = proposed.model_copy(deep=True)
        guarded.eligibility_rules.append(
            Rule(id="__missing_guard__", attribute=attr, op="include_is_not_in", value=[]))
        for sid, pdec in prop_dec.items():
            s = by_id.get(sid)
            if s is None or _present(s["attributes"], attr):
                continue  # only missing-attribute sessions
            if pdec.decision == "offer" and base_dec[sid].decision == "no_offer":
                if evaluate(s["attributes"], guarded).decision == "no_offer":
                    violations.setdefault(sid, attr)

    if violations:
        by_attr = Counter(violations.values())
        detail = "; ".join(f"missing-'{a}': {n}" for a, n in sorted(by_attr.items()))
        results.append(ConstraintResult(
            "missing_attribute_semantics", "FAIL",
            f"Change flips missing-attribute sessions from EXCLUDED to ELIGIBLE ({detail} sessions silently widened)."))
    elif widened_attrs:
        results.append(ConstraintResult("missing_attribute_semantics", "WARN",
                                        f"Missing-value guard removed on {', '.join(widened_attrs)}, but no replayed session was affected."))
    else:
        results.append(ConstraintResult("missing_attribute_semantics", "PASS",
                                        "No missing-value semantics widening."))

    return results, violations
