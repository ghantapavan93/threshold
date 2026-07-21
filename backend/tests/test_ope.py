"""Off-policy value estimator — the ML sanity properties that must hold, or the
number is meaningless. Pure and deterministic, so these are exact, not fuzzy.
"""
from __future__ import annotations

from app.domain.ope import (
    doubly_robust,
    effective_sample_size,
    offpolicy_estimate,
    snips,
)


def test_snips_unbiased_when_no_distribution_shift():
    # target == logging -> all weights are 1 -> the estimate is just mean(reward).
    r = [1.0, 0.0, 1.0, 1.0, 0.0] * 12
    p = [0.5] * len(r)
    out = offpolicy_estimate(r, p, p)
    assert out["verdict"] == "ESTIMATED" and out["method"] == "snips"
    assert abs(out["estimate"] - (sum(r) / len(r))) < 1e-9


def test_dr_is_exact_when_reward_model_is_perfect():
    # The double-robust property: if the reward model is exact, DR equals the true
    # mean reward regardless of how wrong the propensities are.
    r = [1.0, 0.0, 1.0, 0.0, 1.0] * 12
    target = [0.7] * len(r)
    logging = [0.2] * len(r)  # deliberately mismatched propensities
    rhat = list(r)  # perfect reward model
    out = offpolicy_estimate(r, target, logging, reward_hat=rhat)
    assert out["verdict"] == "ESTIMATED" and out["method"] == "doubly_robust"
    assert abs(out["estimate"] - (sum(r) / len(r))) < 1e-9


def test_dr_equals_ips_when_reward_model_is_zero():
    # And the other half of double-robustness: a useless (zero) reward model
    # collapses DR back to the IPS/SNIPS-style importance estimate.
    r = [1.0, 0.0, 1.0, 1.0] * 12
    target = [0.6] * len(r)
    logging = [0.6] * len(r)  # weights = 1
    zero = [0.0] * len(r)
    dr = offpolicy_estimate(r, target, logging, reward_hat=zero)["estimate"]
    assert abs(dr - (sum(r) / len(r))) < 1e-9


def test_refuses_on_skewed_weights():
    # One session dominates -> tiny effective sample size -> refuse to estimate.
    n = 40
    r = [1.0] * n
    target = [0.99] + [0.0005] * (n - 1)
    logging = [0.0005] + [0.99] * (n - 1)
    out = offpolicy_estimate(r, target, logging)
    assert out["verdict"] == "INSUFFICIENT_EVIDENCE"
    assert out["estimate"] is None and out["ess"] < 30


def test_refuses_on_positivity_violation_and_empty():
    assert offpolicy_estimate([], [], [])["verdict"] == "INSUFFICIENT_EVIDENCE"
    out = offpolicy_estimate([1.0] * 40, [0.5] * 40, [0.0] * 40)
    assert out["verdict"] == "INSUFFICIENT_EVIDENCE" and "positivity" in out["reason"]


def test_effective_sample_size_bounds():
    # Uniform weights -> ESS == n. All mass on one -> ESS -> 1.
    assert abs(effective_sample_size([1.0] * 50) - 50) < 1e-9
    assert effective_sample_size([100.0] + [0.0001] * 49) < 2.0


def test_deterministic():
    r = [1.0, 0.0, 1.0] * 15
    t = [0.6] * len(r)
    lg = [0.4] * len(r)
    assert offpolicy_estimate(r, t, lg) == offpolicy_estimate(list(r), list(t), list(lg))


def test_snips_and_dr_helpers_are_consistent():
    r = [1.0, 0.0, 1.0, 0.0] * 10
    w = [1.0] * len(r)
    assert abs(snips(r, w) - (sum(r) / len(r))) < 1e-9
    assert abs(doubly_robust(r, w, list(r)) - (sum(r) / len(r))) < 1e-9


def test_refuses_impossible_propensities():
    # Propensities are probabilities; impossible values must be refused, not
    # silently turned into a confident estimate.
    n = 40
    r = [1.0] * n
    assert offpolicy_estimate(r, [1.5] * n, [0.4] * n)["verdict"] == "INSUFFICIENT_EVIDENCE"
    assert offpolicy_estimate(r, [-0.2] * n, [0.4] * n)["verdict"] == "INSUFFICIENT_EVIDENCE"
    assert offpolicy_estimate(r, [0.4] * n, [1.5] * n)["verdict"] == "INSUFFICIENT_EVIDENCE"
    # a valid boundary (target=1.0, logging=1.0) still estimates
    assert offpolicy_estimate(r, [1.0] * n, [1.0] * n)["verdict"] == "ESTIMATED"
