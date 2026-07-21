"""Counterexample Forge — the adversarial harness must catch what it should,
surface what it should, stay quiet where there's no harm, and remain honest that
its GAP verdict is reachable (not rigged to always report 'caught')."""
import json
from pathlib import Path

from app.domain.counterexample import (
    _classify,
    forge,
    missing_attr_harm,
)
from app.domain.evaluator import evaluate
from app.domain.policy import Policy, Rule
from app.domain.sessions import generate_sessions

SEED_DIR = Path(__file__).resolve().parent.parent / "seed" / "policies"


def base() -> Policy:
    return Policy.model_validate(json.loads((SEED_DIR / "aurora_v17.json").read_text()))


def _by_id(run):
    return {c["id"]: c for c in run["candidates"]}


def test_forge_finds_no_gaps_on_the_current_engine():
    run = forge(base())
    gaps = [c for c in run["candidates"] if c["outcome"] == "GAP"]
    assert gaps == [], f"forge found unguarded harm: {[g['id'] for g in gaps]}"
    assert run["summary"]["no_gaps"] is True
    assert run["summary"]["total"] == len(run["candidates"])


def test_forge_contains_the_trap_spelled_three_ways():
    # The silent missing-attribute widening, however it is written, must be CONTAINED.
    by = _by_id(forge(base()))
    for cid in ("operator_flip", "rename_evasion", "remove_guard"):
        assert by[cid]["outcome"] == "CONTAINED", cid
        assert by[cid]["guard"] == "missing_attribute_semantics", cid


def test_forge_surfaces_visible_and_soft_signals():
    by = _by_id(forge(base()))
    assert by["visible_widening"]["outcome"] == "SURFACED"
    assert by["visible_widening"]["guard"] == "eligibility_scope"
    assert by["frequency_spike"]["outcome"] == "SURFACED"


def test_forge_contains_every_hard_guard_and_fault():
    by = _by_id(forge(base()))
    for cid in ("consent_gap", "brand_safety", "immutable_country", "fat_finger_age",
                "latency_blowout", "holdout_bypass", "poison_type",
                "fault_timeout", "fault_stale_identity", "fault_invalid_output"):
        assert by[cid]["outcome"] == "CONTAINED", cid


def test_forge_late_attribute_is_safe_not_a_false_alarm():
    # A rule on a never-logged field can only narrow; it must not read as a widening.
    c = _by_id(forge(base()))["late_attribute"]
    assert c["outcome"] == "SAFE"
    assert c["guard"] is None


def test_gap_branch_is_reachable_the_detector_is_not_rigged():
    # The GAP verdict is real: with genuine harm present but the guard NOT firing
    # (a regressed detector), the classifier MUST say GAP. Prove the harm is real via
    # the independent oracle, then show the classifier's honest ruling.
    b = base()
    sessions = generate_sessions(42, 200)
    # rename-evasion silent widening — real harm the oracle sees regardless of any guard.
    renamed = b.model_copy(deep=True)
    renamed.eligibility_rules = [r for r in b.eligibility_rules if r.id != "r4"] + [
        Rule(id="r9", attribute="customer.cc_bin", op="exclude_is_in", value=["411111", "511111"])]
    harmed = missing_attr_harm(b, renamed, sessions, "customer.cc_bin")
    assert harmed, "expected the oracle to see real silent widening"
    # guard fired -> CONTAINED; guard regressed (did not fire) with the SAME real harm -> GAP.
    assert _classify(guard_fired=True, soft_signal=False, harm_present=True) == "CONTAINED"
    assert _classify(guard_fired=False, soft_signal=False, harm_present=True) == "GAP"


def test_classify_precedence():
    assert _classify(True, True, True) == "CONTAINED"    # a guard beats everything
    assert _classify(False, True, True) == "GAP"         # real harm, no guard
    assert _classify(False, True, False) == "SURFACED"   # visible, no harm
    assert _classify(False, False, False) == "SAFE"      # nothing to do


def test_forge_is_deterministic():
    assert forge(base()) == forge(base())
    assert forge(base(), 7, 300) == forge(base(), 7, 300)
