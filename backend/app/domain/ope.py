"""Off-policy evaluation PRE-SCREEN (support guard) — pure, deterministic.

Honest scope (ADR-005): this is NOT a full OPE estimator. Real OPE (IPS / SNIPS /
Doubly-Robust) needs logged action propensities, which Rokt does not publicly
expose — and it must NEVER replace the mandatory online holdout. What we CAN do
deterministically is the *first and most important* gate of any responsible OPE
pipeline: measure whether a proposed change even has enough affected support to be
worth estimating, and REFUSE when support is thin, rather than emit a confident-
but-meaningless number.
"""
from __future__ import annotations

import math

MIN_ESS = 30  # below this, refuse to estimate; rely on the holdout


def support_guard(changed_count: int, session_count: int) -> dict:
    # With no logged propensities, the number of decisions that actually changed is
    # our support signal (a stand-in for effective sample size of the affected cohort).
    ess = changed_count
    coverage = round(changed_count / session_count, 4) if session_count else 0.0
    if ess == 0:
        support = "NONE"
    elif ess < MIN_ESS:
        support = "THIN"
    else:
        support = "SUFFICIENT"
    return {
        "ess": ess,
        "coverage": coverage,
        "support": support,
        "refuses_estimate": support in ("NONE", "THIN"),
        "min_ess": MIN_ESS,
        "note": ("Support-guard only, not a lift estimate. Real off-policy evaluation "
                 "needs logged action propensities; the online holdout remains mandatory."),
    }


# ── Real off-policy value estimator (when propensities ARE logged) ────────────
# When an operator logs the probability their OLD policy assigned each action
# (the "logging propensity"), we can estimate the NEW policy's value from that
# logged data alone — a pre-holdout read. Pure and deterministic; no numpy.
#
# Estimators, weakest to strongest:
#   IPS   — importance sampling: mean( (p_target/p_logging) * reward ). Unbiased
#           if the logging propensities are correct, but high-variance.
#   SNIPS — self-normalized IPS: divides by the sum of weights. Lower variance,
#           and invariant to a constant reward shift.
#   DR    — doubly-robust: a reward model + an IPS correction. Unbiased if EITHER
#           the reward model OR the propensities are correct — the double-robust
#           property. We use DR when a reward model is supplied, else SNIPS.
#
# The gate that matters most is honest refusal: if the effective sample size
# (Σw)²/Σw² is small — a few samples dominate the estimate — we return
# INSUFFICIENT_EVIDENCE rather than a confident-but-meaningless number. And an
# estimate here NEVER replaces the mandatory online holdout (ADR-005).


def _weights(target_p: list[float], logging_p: list[float]) -> list[float]:
    return [t / l for t, l in zip(target_p, logging_p)]


def effective_sample_size(weights: list[float]) -> float:
    s = sum(weights)
    s2 = sum(w * w for w in weights)
    return (s * s / s2) if s2 > 0 else 0.0


def snips(rewards: list[float], weights: list[float]) -> float:
    sw = sum(weights)
    return sum(w * r for w, r in zip(weights, rewards)) / sw if sw > 0 else 0.0


def doubly_robust(rewards: list[float], weights: list[float], reward_hat: list[float]) -> float:
    n = len(rewards)
    base = sum(reward_hat) / n
    correction = sum(w * (r - rh) for w, r, rh in zip(weights, rewards, reward_hat)) / n
    return base + correction


def offpolicy_estimate(
    rewards: list[float],
    target_p: list[float],
    logging_p: list[float],
    reward_hat: list[float] | None = None,
    ess_floor: int = MIN_ESS,
    clip: float | None = None,
) -> dict:
    """Estimate the target policy's mean reward from logged (reward, target_p,
    logging_p) tuples. Returns a point estimate + 95% interval when support is
    adequate, else INSUFFICIENT_EVIDENCE. Deterministic given its inputs."""
    n = len(rewards)
    if n == 0 or not (len(target_p) == len(logging_p) == n):
        return {
            "verdict": "INSUFFICIENT_EVIDENCE",
            "reason": "no logged decisions to estimate from",
            "n": n, "ess": 0.0, "estimate": None, "method": None,
            "ci95": None, "se": None, "min_ess": ess_floor,
            "note": _HOLDOUT_NOTE,
        }
    if any(l <= 0 for l in logging_p):
        return {
            "verdict": "INSUFFICIENT_EVIDENCE",
            "reason": "a logged propensity is <= 0 — importance weights are undefined (positivity violated)",
            "n": n, "ess": 0.0, "estimate": None, "method": None,
            "ci95": None, "se": None, "min_ess": ess_floor,
            "note": _HOLDOUT_NOTE,
        }

    w = _weights(target_p, logging_p)
    if clip is not None:
        w = [min(x, clip) for x in w]
    ess = effective_sample_size(w)
    if ess < ess_floor:
        return {
            "verdict": "INSUFFICIENT_EVIDENCE",
            "reason": f"effective sample size {ess:.1f} < {ess_floor} — the weights are too skewed; a few sessions dominate the estimate",
            "n": n, "ess": round(ess, 2), "estimate": None, "method": None,
            "ci95": None, "se": None, "min_ess": ess_floor,
            "note": _HOLDOUT_NOTE,
        }

    if reward_hat is not None and len(reward_hat) == n:
        point = doubly_robust(rewards, w, reward_hat)
        method = "doubly_robust"
    else:
        point = snips(rewards, w)
        method = "snips"

    # Self-normalized delta-method standard error for the (S)NIPS point.
    sw = sum(w)
    var = sum((wi * (ri - point)) ** 2 for wi, ri in zip(w, rewards)) / (sw * sw) if sw > 0 else 0.0
    se = math.sqrt(var)
    return {
        "verdict": "ESTIMATED",
        "reason": None,
        "method": method,
        "estimate": round(point, 4),
        "ci95": [round(point - 1.96 * se, 4), round(point + 1.96 * se, 4)],
        "se": round(se, 4),
        "ess": round(ess, 2),
        "n": n,
        "min_ess": ess_floor,
        "note": _HOLDOUT_NOTE,
    }


_HOLDOUT_NOTE = (
    "A pre-holdout estimate from logged propensities — NOT a substitute for the "
    "mandatory Would-Have-Seen holdout (ADR-005). It narrows what to test, it "
    "doesn't replace the test."
)
