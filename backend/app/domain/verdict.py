"""Deterministic release verdict.

Only three outcomes. A positive verdict is ELIGIBILITY FOR A CONTROLLED ONLINE
HOLDOUT — never "safe to launch" or "guaranteed uplift". Replay filters KNOWN
violations; it does not establish causal safety. Only the online holdout can.
"""
from __future__ import annotations

from .constraints import ConstraintResult

# Verbatim from Rokt's One Platform Page Holdout page (VERIFIED).
HOLDOUT_CONFIG = {
    "control_pct": 5,
    "primary_metric": "conversion_rate",
    "min_uplift_pct": 2,
    "variant_options": [
        "Display the page without Rokt",
        "Display a Rokt layout to replicate an existing experience",
    ],
    "note": "Most experiments go live within five minutes; statistical significance still requires an adequate run.",
}

MIN_SESSIONS = 50


def decide(
    constraint_results: list[ConstraintResult],
    failclosed_proofs: list[dict],
    changed_count: int,
    session_count: int,
) -> dict:
    fails = [c for c in constraint_results if c.result == "FAIL"]
    invalid_proofs = [p for p in failclosed_proofs if not p["proof_valid"]]
    warns = [c for c in constraint_results if c.result == "WARN"]
    # INFO is a surfaced-but-non-gating signal (a deliberate, visible eligibility
    # widening). It never blocks or downgrades — but a positive verdict must NAME
    # it so a widening can't reach the holdout unseen.
    infos = [c for c in constraint_results if c.result == "INFO"]

    if fails or invalid_proofs:
        reasons = [f"{c.key} FAIL: {c.detail}" for c in fails]
        reasons += [f"fail-closed proof '{p['injection']}' did NOT resolve to No Offer Rendered" for p in invalid_proofs]
        return {"value": "BLOCKED", "reasons": reasons, "holdout_config": None}

    if warns or session_count < MIN_SESSIONS:
        reasons = [f"{c.key} WARN: {c.detail}" for c in warns]
        if session_count < MIN_SESSIONS:
            reasons.append(f"Only {session_count} sessions replayed (< {MIN_SESSIONS} minimum).")
        return {"value": "INSUFFICIENT_EVIDENCE", "reasons": reasons, "holdout_config": None}

    if changed_count > 0:
        reasons = [
            "All hard constraints passed.",
            "Fail-closed proofs validated (every injected failure resolved to No Offer Rendered).",
            f"{changed_count} decisions changed; online holdout required before rollout.",
        ]
        holdout_config = HOLDOUT_CONFIG
        if infos:
            reasons += [f"{c.key}: {c.detail}" for c in infos]
            # Name the widened scope in the holdout config so the control group is
            # pointed at exactly what changed — a deliberate widening confirmed, not
            # rubber-stamped. (Copy so the module-level config stays immutable.)
            holdout_config = {**HOLDOUT_CONFIG,
                              "confirm_scope": [c.detail for c in infos]}
        return {
            "value": "ELIGIBLE_FOR_HOLDOUT",
            "reasons": reasons,
            "holdout_config": holdout_config,
        }

    return {"value": "INSUFFICIENT_EVIDENCE",
            "reasons": ["No decisions changed between versions; nothing to validate in a holdout."],
            "holdout_config": None}
