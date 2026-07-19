"""Deterministic hard-constraint validator.

Every check is grounded in a VERIFIED public Rokt fact (docs/VERIFIED_FACTS.md).
The centerpiece is `missing_attribute_semantics`, which catches the verified Rokt
trap where switching a rule from "Include (is not in)" to "Exclude (is in)" silently
makes every session with a MISSING attribute eligible. We isolate the trap with a
counterfactual: revert just that operator and see if the proposed OFFER disappears.
"""
from __future__ import annotations

from dataclasses import dataclass

from .evaluator import Decision, _present, evaluate
from .policy import PROHIBITED_CATEGORIES, Policy

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
) -> tuple[list[ConstraintResult], set[str]]:
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

    # missing_attribute_semantics (the star) — counterfactual isolation
    violation_ids: set[str] = set()
    flip_rule_ids = [
        c["path"].split(".")[1]
        for c in diff["changes"]
        if c.get("risk") == "missing_attribute_flip" and c["path"].endswith(".op")
    ]
    attr_for_detail = None
    for rid in flip_rule_ids:
        prule = proposed.rule_by_id(rid)
        brule = base.rule_by_id(rid)
        if not prule or not brule:
            continue
        attr = prule.attribute
        attr_for_detail = attr
        # revert ONLY this operator; if the proposed OFFER vanishes for a
        # missing-attribute session, the flip is the necessary cause.
        reverted = proposed.model_copy(deep=True)
        for r in reverted.eligibility_rules:
            if r.id == rid:
                r.op = brule.op
        by_id = {s["session_id"]: s for s in sessions}
        for sid, pdec in prop_dec.items():
            s = by_id[sid]
            if _present(s["attributes"], attr):
                continue  # only missing-attribute sessions are affected
            if pdec.decision == "offer" and base_dec[sid].decision == "no_offer":
                if evaluate(s["attributes"], reverted).decision == "no_offer":
                    violation_ids.add(sid)

    if violation_ids:
        results.append(ConstraintResult(
            "missing_attribute_semantics", "FAIL",
            f"Rule op change flips missing-'{attr_for_detail}' sessions from EXCLUDED to ELIGIBLE: "
            f"{len(violation_ids)} sessions silently widened."))
    elif flip_rule_ids:
        results.append(ConstraintResult("missing_attribute_semantics", "WARN",
                                        "Operator change alters missing-value behavior, but no replayed session was affected."))
    else:
        results.append(ConstraintResult("missing_attribute_semantics", "PASS",
                                        "No missing-value semantics change."))

    return results, violation_ids
