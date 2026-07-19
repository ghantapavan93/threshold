"""Adversarial edge-case suite for the Threshold decision engine + Moment Forge.

Structure mirrors docs/MOMENT_FORGE_ALGORITHMS.md §3 (missing-attribute matrix) and
§4 (enumerated nasty edge cases E1-E14). Each test asserts the EXACT expected
behaviour and — where behaviour is correct-but-subtle rather than a bug — a comment
records WHY it is intentional so a reviewer poking the API is never surprised.

Real gaps fixed while writing this suite (see the module changes):
  G1  membership ops (`in`/`include_is_not_in`/`exclude_is_in`) crashed with an
      uncaught TypeError (HTTP 500) when `value` was not a list. Now: 422 at the
      boundary (Rule validator) AND fail-closed in the pure core (evaluate stays total).
  G2  an unknown injection kind was silently treated as "no injection", producing an
      arbitrary PASS/FAIL depending on the sample session. Now: 422.
  G3  a rule_override targeting a non-existent rule id was a silent no-op (the sim ran
      on a policy the operator never authored). Now: 422 naming the unknown id.
"""
import json
from pathlib import Path

import pytest

from app.domain.constraints import evaluate_constraints
from app.domain.diff import diff_policies
from app.domain.evaluator import Decision, InvalidComparison, eval_rule, evaluate
from app.domain.policy import Policy, Rule
from app.domain.sessions import generate_sessions

M = "/api/v1/merchants/aurora-tickets"
SEED_DIR = Path(__file__).resolve().parent.parent / "seed" / "policies"


def _load(name: str) -> Policy:
    return Policy.model_validate(json.loads((SEED_DIR / name).read_text()))


def _pol(rules, **over) -> Policy:
    base = dict(
        policy_version="Vx", merchant_id="m", name="n", latency_budget_ms=200,
        frequency_cap={"max_impressions": 1, "per_days": 30},
        offer={"id": "o", "category": "parking"},
        eligibility_rules=rules,
    )
    base.update(over)
    return Policy.model_validate(base)


def _r(op, value=None, attr="customer.cc_bin", rid="r"):
    return Rule(id=rid, attribute=attr, op=op, value=value)


# =========================================================================== #
# 1. ATTRIBUTE PRESENCE — null vs "" vs absent, per operator (§3 matrix, E10)
# =========================================================================== #
# `_present(attrs, a)` is true iff `a` is a key AND its value is not None. So absent
# and None collapse into MISSING; an empty string "" is PRESENT. This trio is the
# subtlest correctness surface in the whole engine (E10 / nastiest #1).

@pytest.mark.parametrize("attrs,present_expected", [
    ({"customer.cc_bin": "222300"}, True),   # normal present
    ({"customer.cc_bin": ""}, True),         # empty string is PRESENT
    ({"customer.cc_bin": None}, False),      # explicit None is MISSING
    ({}, False),                             # absent key is MISSING
])
def test_present_semantics_null_empty_absent(attrs, present_expected):
    from app.domain.evaluator import _present
    assert _present(attrs, "customer.cc_bin") is present_expected


# The include/exclude inversion must hold EXACTLY on MISSING and nowhere else.
@pytest.mark.parametrize("attrs,label", [
    ({"customer.cc_bin": "222300"}, "present_not_in_list"),
    ({"customer.cc_bin": "411111"}, "present_in_list"),
    ({"customer.cc_bin": ""}, "empty_string_present"),
])
def test_include_exclude_agree_on_all_present_inputs(attrs, label):
    inc = eval_rule(_r("include_is_not_in", ["411111", "511111"]), attrs)
    exc = eval_rule(_r("exclude_is_in", ["411111", "511111"]), attrs)
    # P3 present-invariance: the two operators are behaviourally identical on every
    # PRESENT input (including "" — the empty string is present, not missing).
    assert inc == exc, f"{label}: include={inc} exclude={exc} must agree when present"


@pytest.mark.parametrize("attrs,label", [
    ({"customer.cc_bin": None}, "explicit_none"),
    ({}, "absent_key"),
])
def test_include_exclude_diverge_only_on_missing(attrs, label):
    inc = eval_rule(_r("include_is_not_in", ["411111"]), attrs)
    exc = eval_rule(_r("exclude_is_in", ["411111"]), attrs)
    # THE FLIP: on MISSING, include EXCLUDES (False) and exclude INCLUDES (True).
    assert inc is False and exc is True, f"{label}: expected the missing-attribute flip"


@pytest.mark.parametrize("op,attrs,expected", [
    # equals / not_equals fail CLOSED on MISSING (present-guarded) — intentional.
    ("equals", {}, False),
    ("equals", {"a": None}, False),
    ("not_equals", {}, False),          # not_equals on MISSING => rule FAILS (fail-closed)
    ("not_equals", {"a": None}, False),
    ("in", {}, False),
    ("in", {"a": None}, False),
    ("include_is_not_in", {}, False),
    ("exclude_is_in", {}, True),        # the only op that INCLUDES on missing
])
def test_every_operator_missing_semantics(op, attrs, expected):
    val = ["x"] if op in ("in", "include_is_not_in", "exclude_is_in") else "x"
    assert eval_rule(_r(op, val, attr="a"), attrs) is expected


def test_empty_string_is_included_under_include_is_not_in():
    # E10 subtlety: "" is PRESENT and "" not in the list, so include_is_not_in INCLUDES
    # it, whereas None (MISSING) is EXCLUDED. A serializer emitting "" for "unknown"
    # would flip the trap population — documented, not a bug.
    assert eval_rule(_r("include_is_not_in", ["411111"]), {"customer.cc_bin": ""}) is True
    assert eval_rule(_r("include_is_not_in", ["411111"]), {"customer.cc_bin": None}) is False


# =========================================================================== #
# 2. TYPE / COERCION
# =========================================================================== #

@pytest.mark.parametrize("bad", [True, False])
def test_boolean_in_numeric_compare_fails_closed(bad):
    # E8: bool is a subclass of int; `_num` rejects it so a truthy age can never
    # satisfy a numeric gate. Fails closed to no_offer (never raises out of evaluate).
    d = evaluate({"customer.age": bad}, _pol([_r("gte", 25, "customer.age")]))
    assert d.decision == "no_offer" and d.fallback_reason == "invalid_comparison"


def test_nonnumeric_string_in_gte_fails_closed():
    # E8b: "twenty" >= 25 would TypeError; the core catches it and fails the rule closed.
    d = evaluate({"customer.age": "twenty"}, _pol([_r("gte", 25, "customer.age")]))
    assert d.decision == "no_offer" and d.fallback_reason == "invalid_comparison"


def test_numeric_string_threshold_is_not_coerced_and_fails_closed():
    # INTENTIONAL (documented): the decision core does NOT coerce a numeric-STRING
    # threshold ("18") to a number. `20 >= "18"` raises TypeError -> fail closed. This
    # is SAFE (no incorrect offer) but subtle: a policy with value:"18" excludes
    # everyone. (Note diff.py DOES float()-coerce for widen-detection; the two are
    # independently defensible — evaluate never fabricates an offer from bad types.)
    d = evaluate({"customer.age": 20}, _pol([_r("gte", "18", "customer.age")]))
    assert d.decision == "no_offer" and d.fallback_reason == "invalid_comparison"


def test_gte_lte_use_exact_inclusive_compare_no_epsilon():
    # gte/lte are INCLUSIVE boundary gates compared exactly; no epsilon is needed or
    # wanted (an epsilon would make the boundary ambiguous and non-deterministic).
    assert eval_rule(_r("gte", 25, "a"), {"a": 25}) is True      # boundary included
    assert eval_rule(_r("gte", 25.0, "a"), {"a": 25}) is True    # int vs float exact
    assert eval_rule(_r("lte", 25, "a"), {"a": 25}) is True
    assert eval_rule(_r("lte", 24.9999999, "a"), {"a": 25}) is False
    assert eval_rule(_r("gte", 25.0000001, "a"), {"a": 25}) is False


def test_float_value_at_boundary_is_deterministic():
    r = _r("lte", 30, "a")
    outs = {eval_rule(r, {"a": 29.9999999}) for _ in range(50)}
    assert outs == {True}


def test_string_equals_is_case_sensitive_codepoint_exact():
    # E9: exact Python == ; no case-folding, no unicode normalization. Deterministic
    # by design — normalize at ingestion if case-insensitivity is desired.
    assert eval_rule(_r("equals", "premium", "s"), {"s": "Premium"}) is False
    assert eval_rule(_r("equals", "premium", "s"), {"s": "premium"}) is True
    # composed é (U+00E9) vs decomposed e+combining-acute differ codepoint-wise.
    assert eval_rule(_r("equals", "café", "s"), {"s": "café"}) is False


def test_string_in_list_is_codepoint_exact():
    assert eval_rule(_r("in", ["VIP", "member"], "seg"), {"seg": "VIP"}) is True
    assert eval_rule(_r("in", ["VIP"], "seg"), {"seg": "vip"}) is False


# --- G1: membership op with a non-list value ------------------------------- #
def test_membership_scalar_value_rejected_at_construction():
    # Boundary guard: a membership op whose value is not a list is a malformed policy
    # and must be rejected at Rule construction (surfaces as 422 at the endpoint),
    # never a 500 deep inside evaluate.
    for op in ("in", "include_is_not_in", "exclude_is_in"):
        with pytest.raises(Exception):
            _r(op, "not-a-list", attr="a")
        with pytest.raises(Exception):
            _r(op, None, attr="a")


def test_membership_nonlist_value_fails_closed_in_core():
    # Defense-in-depth: even a hand-built Rule that bypassed model validation must not
    # crash the pure core. eval_rule raises InvalidComparison; evaluate catches it.
    bad = Rule.model_construct(id="r", attribute="a", op="in", value=None)
    with pytest.raises(InvalidComparison):
        eval_rule(bad, {"a": "x"})
    d = evaluate({"a": "x"}, _pol([_r("equals", "x", "a")]))  # sanity: normal path fine
    assert d.decision == "offer"


# =========================================================================== #
# 3. DEGENERATE POLICIES (E1, E3)
# =========================================================================== #

def test_empty_eligibility_rules_offers_everyone():
    # E1: zero rules -> the for-loop runs zero times -> unconditional OFFER.
    d = evaluate({}, _pol([]))
    assert d == Decision("offer", (), None)
    d2 = evaluate({"anything": 1}, _pol([]))
    assert d2.decision == "offer"


def test_single_rule_policy():
    p = _pol([_r("equals", "premium", "purchase.seat_type")])
    assert evaluate({"purchase.seat_type": "premium"}, p).decision == "offer"
    assert evaluate({"purchase.seat_type": "standard"}, p).decision == "no_offer"


@pytest.mark.parametrize("age", [10, 22, 30, 100])
def test_contradictory_rules_always_no_offer(age):
    # E3: `age gte 25` AND `age lte 20` are unsatisfiable — no session passes both.
    # Deterministically no_offer for EVERY age; not an error, just an empty audience.
    p = _pol([_r("gte", 25, "customer.age", rid="lo"), _r("lte", 20, "customer.age", rid="hi")])
    assert evaluate({"customer.age": age}, p).decision == "no_offer"


def test_many_rules_short_circuit_and_determinism():
    # Upper-bound correctness: a long ordered rule list still short-circuits on the
    # FIRST failing rule and is deterministic.
    rules = [_r("gte", 1, "customer.age", rid=f"r{i}") for i in range(200)]
    rules[137] = _r("gte", 999, "customer.age", rid="r137")  # the one that fails
    p = _pol(rules)
    d = evaluate({"customer.age": 40}, p)
    assert d.decision == "no_offer" and d.failed_rule == "r137"
    # the 137 rules before it all matched, in order
    assert d.matched_rules == tuple(f"r{i}" for i in range(137))
    assert {evaluate({"customer.age": 40}, p).failed_rule for _ in range(20)} == {"r137"}


def test_all_pass_long_policy_offers():
    rules = [_r("gte", 1, "customer.age", rid=f"r{i}") for i in range(300)]
    assert evaluate({"customer.age": 40}, _pol(rules)).decision == "offer"


# =========================================================================== #
# 4. ENDPOINT INPUTS (§6 matrix, F-series)
# =========================================================================== #

# --- duplicate rule ids --------------------------------------------------- #
def test_compile_422_duplicate_rule_ids_in_document(client):
    doc = json.loads((SEED_DIR / "aurora_v18.json").read_text())
    doc["eligibility_rules"].append(dict(doc["eligibility_rules"][0]))  # dup id
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_document": doc})
    assert r.status_code == 422


def test_simulate_422_duplicate_rule_ids_without_overrides(client):
    # The unique-id guard must fire on the resolved document even with NO overrides.
    doc = client.get(f"{M}/policies/V18").json()
    doc["eligibility_rules"].append(dict(doc["eligibility_rules"][0]))
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"document": doc}})
    assert r.status_code == 422


# --- rule_overrides id resolution (G3) ------------------------------------ #
def test_simulate_422_override_unknown_rule_id(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18",
                                       "rule_overrides": [{"id": "r999", "op": "include_is_not_in"}]}})
    assert r.status_code == 422
    assert "r999" in r.json()["error"]["message"]


def test_simulate_422_override_missing_id(client):
    # An override with no `id` cannot target a rule -> 422 (not a silent no-op).
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18", "rule_overrides": [{"op": "in"}]}})
    assert r.status_code == 422


def test_simulate_422_override_invalid_operator(client):
    # An override that sets an out-of-contract operator fails the resolved-policy
    # validation (Operator Literal) -> 422.
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18",
                                       "rule_overrides": [{"id": "r4", "op": "regex_match"}]}})
    assert r.status_code == 422


def test_simulate_422_override_membership_op_scalar_value(client):
    # Override r4's value to a scalar under a membership op -> Rule validator -> 422
    # (the G1 boundary guard; would previously have 500'd inside evaluate).
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18",
                                       "rule_overrides": [{"id": "r4", "value": "411111"}]}})
    assert r.status_code == 422


def test_simulate_override_valid_id_applies(client):
    # Positive control: a valid override id is applied (reverts the trap).
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18",
                                       "rule_overrides": [{"id": "r4", "op": "include_is_not_in"}]},
                          "session_seed": 42, "session_count": 200})
    assert r.status_code == 200
    assert r.json()["semantic_delta"]["missing_attribute_inversion"] is None


# --- muted_contexts ------------------------------------------------------- #
def test_simulate_duplicate_muted_contexts_ok(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18", "muted_contexts": ["customer", "customer"]},
                          "session_seed": 42, "session_count": 200})
    assert r.status_code == 200
    assert r.json()["context_toggles_applied"] == ["customer", "customer"]
    # customer rules dropped -> the r4 flip disappears -> no inversion.
    assert r.json()["semantic_delta"]["missing_attribute_inversion"] is None


def test_simulate_all_contexts_muted_yields_unconditional_offer(client):
    # F9: muting every context drops all rules -> proposed offers EVERY session.
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18",
                                       "muted_contexts": ["purchase", "customer", "offer",
                                                          "delivery", "governance"]},
                          "session_seed": 42, "session_count": 200})
    assert r.status_code == 200
    body = r.json()
    assert body["replay_summary"]["proposed_offers"] == 200
    assert body["semantic_delta"]["missing_attribute_inversion"] is None


def test_compile_422_unknown_muted_context(client):
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_version": "V18",
                          "muted_contexts": ["nope"]})
    assert r.status_code == 422


# --- proposed_document shape (extra:ignore / missing required) ------------- #
def test_compile_extra_unknown_keys_ignored(client):
    doc = json.loads((SEED_DIR / "aurora_v18.json").read_text())
    doc["totally_unknown_key"] = {"nested": [1, 2, 3]}
    doc["another_extra"] = 42
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_document": doc})
    assert r.status_code == 200  # extra keys tolerated (model_config extra=ignore)
    assert r.json()["missing_attribute_inversion"]["detected"] is True


def test_compile_422_missing_required_fields(client):
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17",
                          "proposed_document": {"policy_version": "onlythis"}})
    assert r.status_code == 422


# --- session_count boundaries (1 / 5000 / out of range) -------------------- #
def test_simulate_session_count_lower_boundary_1(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "V18-safe"},
                          "session_count": 1})
    assert r.status_code == 200
    # 1 < MIN_SESSIONS(50) -> INSUFFICIENT_EVIDENCE, never a green verdict.
    assert r.json()["verdict"]["value"] == "INSUFFICIENT_EVIDENCE"


def test_simulate_session_count_upper_boundary_5000(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "V18-safe"},
                          "session_count": 5000})
    assert r.status_code == 200
    assert r.json()["session_count"] == 5000


@pytest.mark.parametrize("count", [0, -1, 5001, 100000])
def test_simulate_422_session_count_out_of_range(client, count):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "V18"},
                          "session_count": count})
    assert r.status_code == 422


# --- injections (empty / unknown) — G2 ------------------------------------ #
def test_simulate_empty_injections_list_ok(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "V18-safe"},
                          "session_seed": 42, "session_count": 200, "injections": []})
    assert r.status_code == 200
    assert r.json()["failclosed_proofs"] == []
    # no proofs to invalidate -> a safe policy is still ELIGIBLE.
    assert r.json()["verdict"]["value"] == "ELIGIBLE_FOR_HOLDOUT"


@pytest.mark.parametrize("bad", ["bogus", "timeoutt", "DROP TABLE", ""])
def test_simulate_422_unknown_injection(client, bad):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "V18-safe"},
                          "injections": [bad]})
    assert r.status_code == 422


def test_simulate_known_injection_subset_ok(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "V18-safe"},
                          "session_seed": 42, "session_count": 200,
                          "injections": ["timeout"]})
    assert r.status_code == 200
    assert [p["injection"] for p in r.json()["failclosed_proofs"]] == ["timeout"]


# =========================================================================== #
# 5. COUNTERFACTUAL HONESTY — zero missing-attribute sessions => WARN, not FAIL
# =========================================================================== #

def test_flip_with_no_missing_sessions_warns_not_fails():
    # E14 / item #5: if the operator flips but the corpus has ZERO missing-cc_bin
    # sessions, the trap is latent — the honest result is WARN, never a false FAIL.
    base, prop = _load("aurora_v17.json"), _load("aurora_v18.json")
    # A corpus where cc_bin is ALWAYS present (and never in the excluded list).
    sessions = [
        {"session_id": f"s-{i}", "event_time": "t",
         "attributes": {"purchase.seat_type": "premium", "customer.age": 40,
                        "customer.loyalty_segment": "guest", "customer.cc_bin": "222300"}}
        for i in range(60)
    ]
    bd = {s["session_id"]: evaluate(s["attributes"], base) for s in sessions}
    pd = {s["session_id"]: evaluate(s["attributes"], prop) for s in sessions}
    results, viol = evaluate_constraints(base, prop, sessions, bd, pd,
                                         diff_policies(base, prop))
    by = {c.key: c for c in results}
    assert by["missing_attribute_semantics"].result == "WARN"  # NOT FAIL
    assert viol == set()


def test_flip_with_missing_sessions_fails():
    # Positive control: with missing sessions present, the same flip FAILs (blast
    # radius proven). Guards against the WARN test passing for the wrong reason.
    base, prop = _load("aurora_v17.json"), _load("aurora_v18.json")
    sessions = generate_sessions(42, 200)
    bd = {s["session_id"]: evaluate(s["attributes"], base) for s in sessions}
    pd = {s["session_id"]: evaluate(s["attributes"], prop) for s in sessions}
    results, viol = evaluate_constraints(base, prop, sessions, bd, pd,
                                         diff_policies(base, prop))
    by = {c.key: c for c in results}
    assert by["missing_attribute_semantics"].result == "FAIL"
    assert len(viol) > 0


def test_no_operator_change_is_clean_pass():
    # No flip at all -> PASS (not a false WARN/FAIL): honest counterfactual.
    base = _load("aurora_v17.json")
    sessions = generate_sessions(42, 100)
    bd = {s["session_id"]: evaluate(s["attributes"], base) for s in sessions}
    results, viol = evaluate_constraints(base, base, sessions, bd, bd,
                                         diff_policies(base, base))
    by = {c.key: c for c in results}
    assert by["missing_attribute_semantics"].result == "PASS"
    assert viol == set()


# =========================================================================== #
# 6. DETERMINISM — byte-identical output incl. overrides + mutes
# =========================================================================== #

def test_simulate_determinism_with_overrides_and_mutes(client):
    body = {"base_version": "V17",
            "proposed": {"from_version": "V18",
                         "rule_overrides": [{"id": "r2", "value": 21}],
                         "muted_contexts": ["delivery"]},
            "session_seed": 7, "session_count": 250}
    a = client.post(f"{M}/simulations", json=body)
    b = client.post(f"{M}/simulations", json=body)
    assert a.status_code == 200 and a.content == b.content


def test_evaluate_determinism_repeated():
    p = _load("aurora_v18.json")
    attrs = {"purchase.seat_type": "premium", "customer.age": 40,
             "customer.loyalty_segment": "guest", "customer.cc_bin": "222300"}
    outs = {evaluate(attrs, p).as_dict()["decision"] for _ in range(200)}
    assert outs == {"offer"}


# =========================================================================== #
# 7. FAIL-CLOSED INVARIANT — no input path yields an offer / green on uncertainty
# =========================================================================== #

def test_membership_crash_path_is_422_not_500(client):
    # The former 500 (uncaught TypeError) is now a clean 422 envelope: an uncertain
    # input resolves to a 4xx, never a served offer or a crash.
    doc = client.get(f"{M}/policies/V18").json()
    doc["eligibility_rules"][3]["value"] = None  # membership op, non-list value
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"document": doc}})
    assert r.status_code == 422
    assert r.json()["error"]["request_id"]


def test_trap_always_blocks_never_green(client):
    # The documented Rokt trap must ALWAYS resolve to BLOCKED — never ELIGIBLE.
    for seed in (1, 42, 99):
        r = client.post(f"{M}/simulations",
                        json={"base_version": "V17", "proposed": {"from_version": "V18"},
                              "session_seed": seed, "session_count": 200})
        assert r.status_code == 200
        assert r.json()["verdict"]["value"] == "BLOCKED"


def test_gte_lte_missing_never_raises_and_fails_closed():
    # A None/absent numeric attribute must fail the gate closed, never raise.
    assert eval_rule(_r("gte", 25, "customer.age"), {"customer.age": None}) is False
    assert eval_rule(_r("lte", 25, "customer.age"), {}) is False
    d = evaluate({"customer.age": None}, _pol([_r("gte", 25, "customer.age")]))
    assert d.decision == "no_offer"


@pytest.mark.parametrize("seed_file", [
    "aurora_v18.json", "aurora_v18_consent.json", "aurora_v18_fatfinger.json",
    "aurora_v18_immutable.json",
])
def test_all_unsafe_seeds_block(client, seed_file):
    # Every seed authored to be unsafe must BLOCK — a green verdict on any of them
    # would be a fail-open regression.
    ver = json.loads((SEED_DIR / seed_file).read_text())["policy_version"]
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": ver},
                          "session_seed": 42, "session_count": 200})
    assert r.status_code == 200
    assert r.json()["verdict"]["value"] == "BLOCKED"
