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
from app.domain.evaluator import Decision, InvalidComparison, eval_rule, evaluate
from app.domain.policy import FrequencyCap, Offer, Policy, Rule


def _passes(rule: Rule, attrs: dict) -> bool:
    """Does a session pass this rule, using the SAME fail-closed semantics as
    evaluate()? eval_rule is not total — a gte/lte on a bad type raises
    InvalidComparison, which evaluate() treats as the rule failing. Eligibility
    means the rule passes without raising."""
    try:
        return bool(eval_rule(rule, attrs))
    except InvalidComparison:
        return False

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


# LAW 2b — POINT-IN-TIME / MINIMALITY. The decision reads ONLY the attributes the
# policy references. Adding attributes the policy never names — the stand-in for a
# field that didn't exist at event-time, or "future" data — can't change the
# decision. This is what makes replay off a point-in-time snapshot valid: no
# future/extra information can leak into a past decision.
extra_keys = st.text(alphabet="abcdefghijklmnopqrstuvwxyz_", min_size=4, max_size=10).map(lambda s: "extra_" + s)


@given(attrs=attrs_strategy, policy=policy_strategy, extra=st.dictionaries(extra_keys, attr_values, max_size=4))
def test_law_reads_only_referenced_attributes(attrs, policy, extra):
    # extra keys are prefixed "extra_" and never appear in KEYS, so no generated
    # rule references them. Adding them must be a no-op on the decision.
    assert evaluate(attrs, policy) == evaluate({**attrs, **extra}, policy)


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


# A rule using any operator EXCEPT the one dangerous flip (exclude_is_in). Every
# one of these fails closed on a missing attribute.
@st.composite
def conservative_rule(draw):
    key = draw(st.sampled_from(KEYS))
    if draw(st.booleans()):
        op = draw(st.sampled_from(["equals", "not_equals", "gte", "lte"]))
        return Rule(id="r", attribute=key, op=op, value=draw(st.one_of(st.integers(-100, 100), st.text(max_size=4))))
    op = draw(st.sampled_from(["in", "include_is_not_in"]))  # NOT exclude_is_in
    return Rule(id="r", attribute=key, op=op, value=draw(list_values))


# LAW 4b — DATA-LOSS-CANNOT-WIDEN, generalized. Under EVERY operator except
# exclude_is_in, eligibility REQUIRES the attribute present: if a rule passes, then
# removing its attribute makes it fail. So losing data can only narrow, never
# widen — the whole safety property, and exactly what the operator flip (LAW 4)
# violates. Non-vacuous: we only assert it on rules that actually passed.
@given(rule=conservative_rule(), attrs=attrs_strategy)
def test_law_conservative_eligibility_requires_presence(rule, attrs):
    if _passes(rule, attrs):  # the session is eligible under this rule
        without = dict(attrs)
        without.pop(rule.attribute, None)
        assert _passes(rule, without) is False  # remove the data -> excluded


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


# LAW 5b — SUFFIX TRUNCATION is caught by the signed head seal. A plain chain
# can't see a dropped tail (it leaves a valid shorter chain); the seal — a
# key-signed commitment to (count, head) — closes that gap. We prove both halves:
# without the seal truncation slips through, WITH it truncation fails verify.
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
def test_law_truncation_caught_by_seal(events):
    t = AuditTrail(secret=SECRET)
    for et, pl in events:
        t.append(et, pl)
    recs = t.as_list()
    s = t.seal()
    truncated = [copy.deepcopy(r) for r in recs[:-1]]  # drop the last record

    # Chain alone: truncation slips through (this is why the seal exists).
    assert verify(truncated, SECRET)["verified"] is True
    # With the signed head seal: truncation is caught.
    assert verify(truncated, SECRET, s)["verified"] is False
    # And the intact log still verifies against its seal.
    assert verify(recs, SECRET, s)["verified"] is True
