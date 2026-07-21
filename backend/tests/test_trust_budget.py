"""Trust Budget — the law 'an optional experience must earn the right to consume
attention' as executable invariants: determinism, totality, budget conservation,
monotonic suppression under frustration, engagement earns trust, and recovery."""
from hypothesis import given, settings
from hypothesis import strategies as st

from app.domain.trust_budget import (
    SHOWINESS,
    BudgetPolicy,
    Candidate,
    Context,
    candidate_cost,
    decide,
    run_named_scenario,
)

P = BudgetPolicy()


def _hist(actions_at):
    """actions_at: list of (event_time, category, action)."""
    return [{"event_time": t, "category": c, "action": a} for (t, c, a) in actions_at]


# ---------- curated scenario behaviour ----------

def test_healthy_engager_keeps_showing():
    r = run_named_scenario("healthy")
    assert r["summary"]["show"] == 4 and r["summary"]["suppress"] == 0


def test_serial_dismisser_gets_suppressed():
    r = run_named_scenario("serial_dismisser")
    actions = [s["decision"]["action"] for s in r["steps"]]
    assert actions[0] == "SHOW"                       # first offer earns exposure
    assert "SUPPRESS" in actions                       # after the frustration cap, withdrawn
    assert r["summary"]["suppress"] >= 1


def test_category_fatigue_defers():
    r = run_named_scenario("category_spam")
    actions = [s["decision"]["action"] for s in r["steps"]]
    assert actions[:2] == ["SHOW", "SHOW"]             # first two of a category are fine
    assert "DEFER" in actions                           # then fatigue defers the rest
    # every DEFER names a concrete cooldown time.
    for s in r["steps"]:
        if s["decision"]["action"] == "DEFER":
            assert s["decision"]["defer_until"] is not None


def test_sensitive_checkout_raises_the_bar():
    r = run_named_scenario("sensitive_checkout")
    assert r["transaction_sensitivity"] == 0.8
    # a shrunk budget must NOT keep showing through dismissals.
    assert r["summary"]["show"] <= 1


def test_recovery_after_a_gap_shows_again():
    r = run_named_scenario("recovery")
    actions = [s["decision"]["action"] for s in r["steps"]]
    assert actions[-1] == "SHOW"                        # the long gap cleared the window
    assert "SUPPRESS" in actions[:-1]                   # but attention had been withdrawn first


# ---------- the laws ----------

def test_law_deterministic():
    h = _hist([(0, "parking", "shown"), (60, "parking", "dismissed")])
    c = Candidate("parking", 0.7, 0.0)
    ctx = Context(now=120)
    assert decide(h, c, ctx).as_dict() == decide(h, c, ctx).as_dict()


@given(
    n=st.integers(min_value=0, max_value=8),
    action=st.sampled_from(["shown", "dismissed", "engaged", "weird"]),
    conf=st.floats(min_value=0.0, max_value=1.0),
    sens=st.floats(min_value=0.0, max_value=1.0),
)
@settings(max_examples=150)
def test_law_total_and_budget_conserved(n, action, conf, sens):
    # Any history shape is handled without raising, and SHOW never fires when the
    # candidate costs more than the attention available (budget conservation).
    h = _hist([(i * 100, "parking", action) for i in range(n)])
    d = decide(h, Candidate("parking", conf, 0.0), Context(now=n * 100 + 1, transaction_sensitivity=sens))
    assert d.action in SHOWINESS
    if d.action == "SHOW":
        assert d.available >= d.candidate_cost - 1e-9


@given(extra_dismissals=st.integers(min_value=1, max_value=5))
@settings(max_examples=50)
def test_law_more_frustration_never_increases_showiness(extra_dismissals):
    # Adding dismissals to the history can only lower (never raise) the decision on
    # the showiness ladder SUPPRESS < DEFER < SHOW.
    base = _hist([(0, "parking", "shown")])
    worse = base + _hist([(10 + i, "dining", "dismissed") for i in range(extra_dismissals)])
    cand, ctx = Candidate("travel", 0.7, 0.0), Context(now=600)
    assert SHOWINESS[decide(worse, cand, ctx).action] <= SHOWINESS[decide(base, cand, ctx).action]


def test_law_engagement_costs_less_than_rejection():
    # A history of engagements must never leave you worse off than the same number
    # of rejections — engagement earns trust, rejection spends it.
    engaged = _hist([(i * 60, "parking", "engaged") for i in range(3)])
    dismissed = _hist([(i * 60, "parking", "dismissed") for i in range(3)])
    cand, ctx = Candidate("dining", 0.7, 0.0), Context(now=400)
    assert SHOWINESS[decide(engaged, cand, ctx).action] >= SHOWINESS[decide(dismissed, cand, ctx).action]


def test_law_frustration_cap_forbids_show():
    # At or above the frustration cap, the decision is never SHOW.
    h = _hist([(i * 30, "parking", "dismissed") for i in range(P.frustration_cap)])
    d = decide(h, Candidate("dining", 0.9, 0.0), Context(now=P.frustration_cap * 30 + 1))
    assert d.action != "SHOW" and d.frustration >= P.frustration_cap


def test_candidate_cost_rises_with_repetition_and_falls_with_confidence():
    assert candidate_cost(Candidate("p", 0.9), 0, P) < candidate_cost(Candidate("p", 0.2), 0, P)
    assert candidate_cost(Candidate("p", 0.7), 0, P) < candidate_cost(Candidate("p", 0.7), 3, P)
