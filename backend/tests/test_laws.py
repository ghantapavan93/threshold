"""The live Laws board — every invariant proven over the battery, and a check that
the prover actually catches a broken property (it isn't rigged to say PROVEN)."""
from app.domain import laws as L
from app.domain.evaluator import Decision
from app.domain.laws import run_laws


def test_every_live_law_is_proven_and_platform_laws_tested():
    r = run_laws()
    assert r["summary"]["total"] == 14
    assert r["summary"]["falsified"] == 0
    assert r["summary"]["all_proven"] is True
    assert r["summary"]["cases_checked"] > 1000  # real volume, not a token pass
    live = [x for x in r["laws"] if x["mode"] == "live"]
    assert len(live) == 11
    for law in live:
        assert law["status"] == "PROVEN", law["n"]
        assert law["cases"] >= 1
    platform = [x for x in r["laws"] if x["mode"] == "platform"]
    assert len(platform) == 3
    for law in platform:
        assert law["status"] == "TESTED" and law["detail"]  # names its owning test


def test_run_laws_is_deterministic():
    assert run_laws() == run_laws()


def test_prover_catches_a_broken_property(monkeypatch):
    # Break determinism inside the module and confirm the determinism law FALSIFIES,
    # with a counterexample — proof the board reflects reality, not a hard-coded pass.
    real = L.evaluate
    calls = {"n": 0}

    def flaky(attrs, policy):
        calls["n"] += 1
        d = real(attrs, policy)
        if calls["n"] % 2 == 0:  # flip every other call → non-deterministic
            flipped = "offer" if d.decision == "no_offer" else "no_offer"
            return Decision(flipped, d.matched_rules, d.failed_rule, d.fallback_reason)
        return d

    monkeypatch.setattr(L, "evaluate", flaky)
    policies, sessions = L._battery()
    cases, counter = L._c_deterministic(policies, sessions)
    assert counter is not None  # the prover saw the broken determinism
