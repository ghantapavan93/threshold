"""Policy Diff Replay orchestrator (deterministic, pure).

Ties the engine together: generate event-time-bounded sessions -> evaluate base &
proposed -> diff -> constraints (incl. missing-attribute trap) -> fail-closed proofs
-> verdict -> append-only tamper-evident audit. Returns the full ReplayJob payload
described in docs/API_CONTRACT.md (minus DB-assigned id).
"""
from __future__ import annotations

from . import failclosed
from .audit import AuditTrail
from .constraints import evaluate_constraints
from .diff import diff_policies
from .evaluator import evaluate
from .ope import support_guard
from .policy import Policy
from .sessions import generate_sessions
from .verdict import decide


def _change_kind(b: str, p: str, is_violation: bool) -> str:
    if is_violation:
        return "constraint_violation"
    if b == p:
        return "unchanged"
    if b == "no_offer" and p == "offer":
        return "nothing_to_offer"
    return "offer_to_nothing"


def run_replay(
    base: Policy,
    proposed: Policy,
    session_seed: int,
    session_count: int,
    injections: list[str],
    audit_secret: str,
) -> dict:
    sessions = generate_sessions(session_seed, session_count)
    audit = AuditTrail(secret=audit_secret)
    audit.append("REPLAY_STARTED", {
        "base_version": base.policy_version, "proposed_version": proposed.policy_version,
        "session_seed": session_seed, "session_count": session_count, "injections": injections,
    })

    base_dec = {s["session_id"]: evaluate(s["attributes"], base) for s in sessions}
    prop_dec = {s["session_id"]: evaluate(s["attributes"], proposed) for s in sessions}

    diff = diff_policies(base, proposed)
    constraint_results, violation_ids = evaluate_constraints(
        base, proposed, sessions, base_dec, prop_dec, diff)
    audit.append("CONSTRAINTS_EVALUATED", {"results": [c.as_dict() for c in constraint_results]})

    evaluations: list[dict] = []
    counts = {"unchanged": 0, "nothing_to_offer": 0, "offer_to_nothing": 0, "constraint_violation": 0}
    for s in sessions:
        sid = s["session_id"]
        b, p = base_dec[sid], prop_dec[sid]
        is_violation = sid in violation_ids
        ck = _change_kind(b.decision, p.decision, is_violation)
        counts[ck] += 1
        changed = b.decision != p.decision or is_violation
        evaluations.append({
            "session_id": sid,
            "event_time": s["event_time"],
            "base": b.as_dict(),
            "proposed": p.as_dict(),
            "changed": changed,
            "change_kind": ck,
            "violation": ({"key": "missing_attribute_semantics", "attribute": "customer.cc_bin"}
                          if is_violation else None),
            "attributes_snapshot": s["attributes"],
        })
        if changed:
            audit.append("DECISION_RECORDED", {
                "session_id": sid, "base": b.decision, "proposed": p.decision, "change_kind": ck})

    # fail-closed proofs on a representative premium/eligible-shaped session
    sample = next((s["attributes"] for s in sessions
                   if s["attributes"].get("purchase.seat_type") == "premium"),
                  sessions[0]["attributes"])
    failclosed_proofs = [failclosed.prove(k, sample, proposed) for k in injections]
    audit.append("FAILCLOSED_PROVEN", {"proofs": failclosed_proofs})

    base_offers = sum(1 for d in base_dec.values() if d.decision == "offer")
    proposed_offers = sum(1 for d in prop_dec.values() if d.decision == "offer")
    changed_count = sum(1 for e in evaluations if e["changed"])

    ope_prescreen = support_guard(changed_count, session_count)
    verdict = decide(constraint_results, failclosed_proofs, changed_count, session_count)
    audit.append("VERDICT_ISSUED", {"verdict": verdict, "ope_prescreen": ope_prescreen})

    replay_summary = {
        **counts,
        "base_offers": base_offers,
        "proposed_offers": proposed_offers,
        "changed": changed_count,
    }

    return {
        "base_version": base.policy_version,
        "proposed_version": proposed.policy_version,
        "session_count": session_count,
        "diff": diff,
        "constraint_results": [c.as_dict() for c in constraint_results],
        "replay_summary": replay_summary,
        "evaluations": evaluations,
        "failclosed_proofs": failclosed_proofs,
        "ope_prescreen": ope_prescreen,
        "verdict": verdict,
        "_audit": audit.as_list(),
    }
