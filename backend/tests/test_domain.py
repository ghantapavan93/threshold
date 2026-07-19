"""Pure-domain unit tests (no DB): the correctness heart of Threshold."""
import copy
import json
from pathlib import Path

import pytest

from app.domain import failclosed
from app.domain.audit import AuditTrail, verify
from app.domain.constraints import evaluate_constraints
from app.domain.diff import diff_policies
from app.domain.evaluator import Decision, eval_rule, evaluate
from app.domain.policy import Policy, Rule
from app.domain.replay import run_replay
from app.domain.sessions import generate_sessions
from app.domain.verdict import decide

SEED_DIR = Path(__file__).resolve().parent.parent / "seed" / "policies"
SECRET = "test-secret"


def load(name: str) -> Policy:
    return Policy.model_validate(json.loads((SEED_DIR / name).read_text()))


# ---------- evaluator: the missing-attribute trap ----------

def _rule(op, value=None, attr="customer.cc_bin"):
    return Rule(id="r", attribute=attr, op=op, value=value)


def test_include_is_not_in_excludes_missing():
    r = _rule("include_is_not_in", ["411111"])
    assert eval_rule(r, {"customer.cc_bin": "222300"}) is True    # present, not in list -> included
    assert eval_rule(r, {"customer.cc_bin": "411111"}) is False   # present, in list -> excluded
    assert eval_rule(r, {}) is False                              # MISSING -> EXCLUDED


def test_exclude_is_in_includes_missing():
    r = _rule("exclude_is_in", ["411111"])
    assert eval_rule(r, {"customer.cc_bin": "222300"}) is True     # present, not in list -> included
    assert eval_rule(r, {"customer.cc_bin": "411111"}) is False    # present, in list -> excluded
    assert eval_rule(r, {}) is True                                # MISSING -> INCLUDED (the trap)


def test_scalar_ops_and_missing():
    assert eval_rule(_rule("equals", "premium", "s"), {"s": "premium"}) is True
    assert eval_rule(_rule("gte", 25, "a"), {"a": 30}) is True
    assert eval_rule(_rule("gte", 25, "a"), {"a": 18}) is False
    assert eval_rule(_rule("gte", 25, "a"), {}) is False  # missing -> fail


def test_evaluate_short_circuits_first_failure():
    p = load("aurora_v17.json")
    d = evaluate({"purchase.seat_type": "standard"}, p)  # r1 fails first
    assert d.decision == "no_offer" and d.failed_rule == "r1"


def test_evaluate_determinism():
    p = load("aurora_v18.json")
    attrs = {"purchase.seat_type": "premium", "customer.age": 40, "customer.loyalty_segment": "guest"}
    outs = {evaluate(attrs, p).as_dict()["decision"] for _ in range(100)}
    assert len(outs) == 1


# ---------- sessions ----------

def test_sessions_deterministic_and_have_missing_bin():
    a = generate_sessions(42, 200)
    b = generate_sessions(42, 200)
    assert a == b
    missing = [s for s in a if "customer.cc_bin" not in s["attributes"]]
    assert len(missing) > 0


# ---------- diff ----------

def test_diff_flags_missing_attribute_flip():
    d = diff_policies(load("aurora_v17.json"), load("aurora_v18.json"))
    risks = {c.get("risk") for c in d["changes"]}
    assert "missing_attribute_flip" in risks
    assert "frequency_increase" in risks
    assert "eligibility_widened" in risks  # age gte lowered


# ---------- constraints ----------

def _decisions(base, prop, sessions):
    bd = {s["session_id"]: evaluate(s["attributes"], base) for s in sessions}
    pd = {s["session_id"]: evaluate(s["attributes"], prop) for s in sessions}
    return bd, pd


def test_constraints_catch_trap_and_warn():
    base, prop = load("aurora_v17.json"), load("aurora_v18.json")
    sessions = generate_sessions(42, 200)
    bd, pd = _decisions(base, prop, sessions)
    results, viol = evaluate_constraints(base, prop, sessions, bd, pd, diff_policies(base, prop))
    by = {c.key: c for c in results}
    assert by["missing_attribute_semantics"].result == "FAIL"
    assert len(viol) > 0
    assert by["frequency_cap"].result == "WARN"
    assert by["holdout_required"].result == "PASS"


def test_constraints_all_pass_for_safe():
    base, prop = load("aurora_v17.json"), load("aurora_v18_safe.json")
    sessions = generate_sessions(42, 200)
    bd, pd = _decisions(base, prop, sessions)
    results, viol = evaluate_constraints(base, prop, sessions, bd, pd, diff_policies(base, prop))
    assert viol == set()
    assert all(c.result == "PASS" for c in results)


def test_only_missing_attribute_sessions_flagged():
    base, prop = load("aurora_v17.json"), load("aurora_v18.json")
    sessions = generate_sessions(7, 300)
    bd, pd = _decisions(base, prop, sessions)
    _, viol = evaluate_constraints(base, prop, sessions, bd, pd, diff_policies(base, prop))
    by_id = {s["session_id"]: s for s in sessions}
    for sid in viol:
        assert "customer.cc_bin" not in by_id[sid]["attributes"]  # only MISSING ones


# ---------- fail-closed ----------

@pytest.mark.parametrize("kind", ["timeout", "invalid_output", "stale_identity"])
def test_failclosed_always_no_offer(kind):
    p = load("aurora_v18.json")
    attrs = {"purchase.seat_type": "premium", "customer.age": 40, "customer.loyalty_segment": "guest"}
    proof = failclosed.prove(kind, attrs, p)
    assert proof["decision"] == "no_offer"
    assert proof["proof_valid"] is True
    assert proof["checkout_preserved"] is True
    assert proof["offer_state_created"] is False


# ---------- verdict ----------

def test_verdict_blocked_on_fail():
    from app.domain.constraints import ConstraintResult
    r = [ConstraintResult("missing_attribute_semantics", "FAIL", "x")]
    assert decide(r, [], changed_count=5, session_count=200)["value"] == "BLOCKED"


def test_verdict_insufficient_on_warn_only():
    from app.domain.constraints import ConstraintResult
    r = [ConstraintResult("frequency_cap", "WARN", "x")]
    assert decide(r, [], changed_count=5, session_count=200)["value"] == "INSUFFICIENT_EVIDENCE"


def test_verdict_eligible():
    v = decide([], [{"injection": "timeout", "proof_valid": True}], changed_count=5, session_count=200)
    assert v["value"] == "ELIGIBLE_FOR_HOLDOUT"
    assert v["holdout_config"]["control_pct"] == 5


# ---------- audit ----------

def test_audit_verify_and_tamper_detection():
    t = AuditTrail(secret=SECRET)
    t.append("A", {"x": 1})
    t.append("B", {"y": 2})
    recs = t.as_list()
    assert verify(recs, SECRET)["verified"] is True
    tampered = copy.deepcopy(recs)
    tampered[1]["payload"]["y"] = 999  # mutate after write
    out = verify(tampered, SECRET)
    assert out["verified"] is False and out["first_tampered_seq"] == 1


# ---------- replay determinism (end-to-end pure) ----------

def test_replay_deterministic():
    base, prop = load("aurora_v17.json"), load("aurora_v18.json")
    a = run_replay(base, prop, 42, 200, ["timeout"], SECRET)
    b = run_replay(base, prop, 42, 200, ["timeout"], SECRET)
    assert a["verdict"] == b["verdict"]
    assert a["replay_summary"] == b["replay_summary"]
    assert a["evaluations"] == b["evaluations"]
    assert a["verdict"]["value"] == "BLOCKED"
