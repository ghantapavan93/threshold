"""Regression tests for the bug-hunt findings — each pins a fix so the bug can't
silently return. Named for what would break if the fix regressed.
"""
from __future__ import annotations

import json
from pathlib import Path

from app.domain.constraints import evaluate_constraints
from app.domain.diff import diff_policies
from app.domain.evaluator import Decision, evaluate
from app.domain.ope import offpolicy_estimate
from app.domain.policy import Policy, Rule
from app.domain.replay import run_replay
from app.domain.sessions import generate_sessions

SEED = Path(__file__).resolve().parent.parent / "seed" / "policies"
SECRET = "test-secret"


def _v17() -> Policy:
    return Policy.model_validate(json.loads((SEED / "aurora_v17.json").read_text()))


def _flip_on_cc(base: Policy, *, new_id: str | None, remove_only: bool = False) -> Policy:
    """Build the missing-attribute trap on customer.cc_bin, but spelled to evade a
    same-id detector: either rename the flipped rule, or just remove the guard."""
    cc = [r for r in base.eligibility_rules if r.attribute == "customer.cc_bin"][0]
    prop = base.model_copy(deep=True)
    prop.eligibility_rules = [r for r in prop.eligibility_rules if r.id != cc.id]
    if not remove_only:
        prop.eligibility_rules.append(
            Rule(id=new_id, attribute="customer.cc_bin", op="exclude_is_in", value=cc.value))
    prop.policy_version = "V18-evasion"
    return prop


def _run_constraints(base: Policy, prop: Policy):
    sessions = generate_sessions(42, 200)
    bd = {s["session_id"]: evaluate(s["attributes"], base) for s in sessions}
    pd = {s["session_id"]: evaluate(s["attributes"], prop) for s in sessions}
    results, viol = evaluate_constraints(base, prop, sessions, bd, pd, diff_policies(base, prop))
    return {c.key: c for c in results}, viol


# #1 — the critical fail-open: the trap must be caught even when the flipped rule
# is RENAMED (no same-id op tag exists), and when the guard is simply REMOVED.
def test_rename_evasion_is_caught():
    base = _v17()
    prop = _flip_on_cc(base, new_id="renamed_cc_v2")
    d = diff_policies(base, prop)
    assert not any(c.get("risk") == "missing_attribute_flip" for c in d["changes"])  # no same-id tag
    by, viol = _run_constraints(base, prop)
    assert by["missing_attribute_semantics"].result == "FAIL"
    assert len(viol) > 0


def test_remove_guard_evasion_is_caught():
    base = _v17()
    prop = _flip_on_cc(base, new_id=None, remove_only=True)
    by, viol = _run_constraints(base, prop)
    assert by["missing_attribute_semantics"].result == "FAIL"
    assert len(viol) > 0


# #4 — the per-session violation record must name the REAL flipped attribute, not
# a hardcoded customer.cc_bin.
def test_violation_names_the_real_attribute():
    base = _v17()
    # flip on a non-cc_bin attribute: guard email_domain in base, drop it in prop
    base = base.model_copy(deep=True)
    base.eligibility_rules.append(
        Rule(id="g_email", attribute="customer.email_domain", op="include_is_not_in", value=["spam.test"]))
    prop = base.model_copy(deep=True)
    prop.eligibility_rules = [r for r in prop.eligibility_rules if r.id != "g_email"]
    prop.policy_version = "V-email-flip"
    out = run_replay(base, prop, 42, 200, [], SECRET)
    viol_attrs = {e["violation"]["attribute"] for e in out["evaluations"] if e["violation"]}
    assert viol_attrs == {"customer.email_domain"}  # the real attr, not hardcoded cc_bin


# #3 — a membership list change that widens must be TAGGED eligibility_widened.
def test_diff_flags_membership_widening():
    base = _v17()
    prop = base.model_copy(deep=True)
    cc = [r for r in prop.eligibility_rules if r.attribute == "customer.cc_bin"][0]
    for r in prop.eligibility_rules:
        if r.id == cc.id:
            r.value = cc.value[:-1]  # shrink the include_is_not_in exclusion list -> widens
    risks = {c.get("risk") for c in diff_policies(base, prop)["changes"]}
    assert "eligibility_widened" in risks


# #6 — evaluate must stay TOTAL even on an unknown operator (a hand-built Rule
# that bypassed the Literal validator): fail closed, don't raise.
def test_evaluate_total_on_unknown_operator():
    bad = Rule.model_construct(id="r", attribute="x", op="bogus_op", value=None)
    p = Policy.model_construct(
        policy_version="V", merchant_id="m", name="n", latency_budget_ms=200,
        fallback_action="no_offer", requires_holdout=True,
        frequency_cap=None, offer=None, eligibility_rules=[bad])
    d = evaluate({"x": 1}, p)
    assert isinstance(d, Decision) and d.decision == "no_offer"


# #8 — the estimator refuses non-finite values and a mismatched reward model.
def test_ope_refuses_nonfinite_and_bad_reward_hat_length():
    n = 40
    r = [1.0] * n
    p = [0.5] * n
    assert offpolicy_estimate([float("nan")] * n, p, p)["verdict"] == "INSUFFICIENT_EVIDENCE"
    assert offpolicy_estimate(r, [float("inf")] * n, p)["verdict"] == "INSUFFICIENT_EVIDENCE"
    assert offpolicy_estimate(r, p, p, reward_hat=[0.5] * (n - 1))["verdict"] == "INSUFFICIENT_EVIDENCE"
