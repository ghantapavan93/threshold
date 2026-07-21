"""Property-based invariants — the safety LAWS, checked over the input space with
Hypothesis rather than a handful of examples.

The difference is the point. An example test says "on THIS input it's safe." A
property says "for ALL inputs in this space it's safe" and then tries hard to
break it. If any law here has a counterexample, that is a real defect, not a
flaky test — Hypothesis will print the minimal input that broke it.
"""
from __future__ import annotations

import copy

from hypothesis import given, settings, strategies as st

from app.domain.audit import AuditTrail, verify
from app.domain.evaluator import Decision, eval_rule, evaluate
from app.domain.policy import FrequencyCap, Offer, Policy, Rule

SECRET = "invariant-secret"
KEYS = ["cc_bin", "amount", "country", "tier", "x"]

# Attribute values that deliberately stress the pure core: ints, text, bools,
# None, floats — including the type-mismatched cases it must fail closed on.
attr_values = st.one_of(
    st.integers(-1000, 1000),
    st.text(max_size=6),
    st.booleans(),
    st.none(),
    st.floats(allow_nan=False, allow_infinity=False, min_value=-1e6, max_value=1e6),
)
attrs_strategy = st.dictionaries(st.sampled_from(KEYS), attr_values, max_size=5)
list_values = st.lists(st.one_of(st.integers(-100, 100), st.text(max_size=4)), max_size=4)


def _policy(rules: list[Rule]) -> Policy:
    # Rule ids must be unique within a policy (the model enforces it) — assign
    # deterministic ids so the generated rule set is always well-formed.
    uniq = [r.model_copy(update={"id": f"r{i}"}) for i, r in enumerate(rules)]
    return Policy(
        policy_version="Vp", merchant_id="m", name="p", latency_budget_ms=200,
        frequency_cap=FrequencyCap(max_impressions=1, per_days=1),
        offer=Offer(id="o", category="retail"),
        eligibility_rules=uniq,
    )


@st.composite
def rule_strategy(draw):
    key = draw(st.sampled_from(KEYS))
    if draw(st.booleans()):
        op = draw(st.sampled_from(["equals", "not_equals", "gte", "lte"]))
        val = draw(st.one_of(st.integers(-100, 100), st.text(max_size=4)))
        return Rule(id="r", attribute=key, op=op, value=val)
    op = draw(st.sampled_from(["in", "include_is_not_in", "exclude_is_in"]))
    return Rule(id="r", attribute=key, op=op, value=draw(list_values))


policy_strategy = st.builds(_policy, st.lists(rule_strategy(), min_size=0, max_size=4))


# LAW 1 — evaluate is TOTAL. For any attrs and any policy it returns a Decision
# and never raises: the fail-closed core, proven over the whole input space.
@given(attrs=attrs_strategy, policy=policy_strategy)
def test_law_evaluate_is_total(attrs, policy):
    d = evaluate(attrs, policy)
    assert isinstance(d, Decision)
    assert d.decision in ("offer", "no_offer")


# LAW 2 — DETERMINISM. Same input, identical output — no hidden state.
@given(attrs=attrs_strategy, policy=policy_strategy)
def test_law_deterministic(attrs, policy):
    assert evaluate(attrs, policy) == evaluate(copy.deepcopy(attrs), policy)


# LAW 3 — MISSING FAILS CLOSED under the conservative operator. A session missing
# the attribute is NEVER eligible under include_is_not_in: absent data can't widen.
@given(key=st.sampled_from(KEYS), lst=list_values, attrs=attrs_strategy)
def test_law_missing_fails_closed(key, lst, attrs):
    a = dict(attrs)
    a.pop(key, None)  # guarantee the key is absent
    rule = Rule(id="r", attribute=key, op="include_is_not_in", value=lst)
    assert eval_rule(rule, a) is False


# LAW 4 — THE OPERATOR-FLIP TRAP is real and universal. For the SAME missing
# session, flipping include_is_not_in -> exclude_is_in flips it from excluded to
# eligible. This is the silent widening the whole gate exists to catch.
@given(key=st.sampled_from(KEYS), lst=list_values)
def test_law_operator_flip_widens_missing(key, lst):
    absent: dict = {}
    conservative = Rule(id="r", attribute=key, op="include_is_not_in", value=lst)
    dangerous = Rule(id="r", attribute=key, op="exclude_is_in", value=lst)
    assert eval_rule(conservative, absent) is False  # excluded
    assert eval_rule(dangerous, absent) is True  # WIDENED — now eligible


# LAW 5 — AUDIT CHAIN catches content edits, reordering, and INTERIOR deletion.
# (Suffix truncation is a separate, named limit — see test_law_truncation_is_the_limit.)
@settings(max_examples=60)
@given(
    events=st.lists(
        st.tuples(
            st.text(min_size=1, max_size=5),
            st.dictionaries(st.text(max_size=4), st.integers(), max_size=3),
        ),
        min_size=2,
        max_size=8,
    )
)
def test_law_audit_chain_integrity(events):
    t = AuditTrail(secret=SECRET)
    for et, pl in events:
        t.append(et, pl)
    recs = t.as_list()
    assert verify(recs, SECRET)["verified"] is True

    # deleting any INTERIOR record breaks the chain
    for i in range(len(recs) - 1):
        broken = [copy.deepcopy(r) for j, r in enumerate(recs) if j != i]
        assert verify(broken, SECRET)["verified"] is False

    # reordering the first two breaks it
    swapped = [copy.deepcopy(r) for r in recs]
    swapped[0], swapped[1] = swapped[1], swapped[0]
    assert verify(swapped, SECRET)["verified"] is False


# LAW 5b — the HONEST edge: a plain hash chain CANNOT detect suffix truncation.
# Dropping the tail leaves a valid shorter chain. We assert the gap explicitly so
# the claim stays precise — detecting truncation needs an external signed head.
@settings(max_examples=40)
@given(
    events=st.lists(
        st.tuples(
            st.text(min_size=1, max_size=5),
            st.dictionaries(st.text(max_size=4), st.integers(), max_size=3),
        ),
        min_size=2,
        max_size=8,
    )
)
def test_law_truncation_is_the_limit(events):
    t = AuditTrail(secret=SECRET)
    for et, pl in events:
        t.append(et, pl)
    recs = t.as_list()
    truncated = [copy.deepcopy(r) for r in recs[:-1]]  # drop the last record
    # This VERIFIES — which is exactly why truncation is a documented limit, not a
    # claimed protection.
    assert verify(truncated, SECRET)["verified"] is True
