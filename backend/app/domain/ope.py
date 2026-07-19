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
