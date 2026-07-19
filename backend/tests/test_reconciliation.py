"""Reconciliation Process tests (W2): the cross-aggregate invariant, closed.

Three layers, mirroring the module:
 1. the pure lifecycle + reconciler over the seeded fault world,
 2. the property that matters — under the outbox, divergence is NEVER silent,
 3. the REAL-data lane over actual replay-job / outbox rows, plus the endpoints.
"""
from datetime import datetime, timedelta, timezone

from app import outbox
from app.db import SessionLocal
from app.domain.reconciliation import (
    DEAD_LETTER_FACT,
    EARNED_FACT,
    EXPECTED_FANOUT,
    ISSUED_FACT,
    FaultKind,
    LifecycleEvent,
    ReconClass,
    Strategy,
    audit_reconciliation,
    generate_fault_world,
    reconcile,
    reconcile_fanout,
    run_lifecycle,
)
from app.models import OutboxEventRow

M = "/api/v1/merchants/aurora-tickets"
BODY = {"base_version": "V17", "proposed_version": "V18", "session_count": 200}


# --------------------------------------------------------------------------- #
# 1. Pure core
# --------------------------------------------------------------------------- #
def test_fault_world_is_deterministic():
    assert generate_fault_world(42, 500) == generate_fault_world(42, 500)


def test_fault_fractions_must_sum_to_at_most_one():
    import pytest

    with pytest.raises(ValueError):
        generate_fault_world(1, 10, 0.5, 0.4, 0.2)


def test_audit_is_deterministic():
    assert audit_reconciliation(42, 300) == audit_reconciliation(42, 300)


def test_dual_write_diverges_silently():
    """With any faults present, dual-write produces orphans AND double-issues,
    and none of them leave a visible trace (no dead-letters at all)."""
    report = audit_reconciliation(42, 200)["strategies"][Strategy.DUAL_WRITE.value]
    assert report["classes"][ReconClass.ORPHANED_EARN.value] > 0
    assert report["classes"][ReconClass.DOUBLE_ISSUE.value] > 0
    assert report["classes"][ReconClass.VISIBLE_DEAD_LETTER.value] == 0
    assert report["silent_divergence"] > 0
    assert report["invariant_holds"] is False


def test_outbox_never_diverges_silently_across_seeds():
    """THE property (W2): under the transactional outbox, every earn is either
    issued exactly once or VISIBLY dead-lettered — for every seed in the sweep."""
    for seed in range(20):
        report = audit_reconciliation(seed, 200)["strategies"][Strategy.OUTBOX.value]
        assert report["silent_divergence"] == 0, f"seed {seed}"
        assert report["invariant_holds"] is True, f"seed {seed}"
        consistent = report["classes"][ReconClass.CONSISTENT.value]
        dead = report["classes"][ReconClass.VISIBLE_DEAD_LETTER.value]
        assert consistent + dead == report["total_earns"]


def test_outbox_hard_failures_become_visible_dead_letters():
    """The outbox does NOT hide failure — it converts it from silent to visible.
    Every downstream-hard-failure earn ends as a dead-letter, never an orphan."""
    world = generate_fault_world(7, 400)
    hard = sum(1 for f in world if f is FaultKind.DOWNSTREAM_HARD_FAILURE)
    report = reconcile(run_lifecycle(Strategy.OUTBOX, world))
    assert report["classes"][ReconClass.VISIBLE_DEAD_LETTER.value] == hard


def test_outbox_ambiguous_timeout_is_idempotent():
    """A blind retry under dual-write double-issues; the outbox consumer is keyed
    on earn_id (the conversions.py dedup discipline) so the same fault issues once."""
    world = [FaultKind.AMBIGUOUS_TIMEOUT]
    dual = reconcile(run_lifecycle(Strategy.DUAL_WRITE, world))
    outb = reconcile(run_lifecycle(Strategy.OUTBOX, world))
    assert dual["classes"][ReconClass.DOUBLE_ISSUE.value] == 1
    assert outb["classes"][ReconClass.CONSISTENT.value] == 1


def test_same_world_feeds_both_strategies():
    """Counterfactual isolation: the fault census is identical for both strategies —
    only the integration pattern differs."""
    audit = audit_reconciliation(42, 200)
    census = audit["fault_census"]
    assert sum(census.values()) == 200
    dual_total = audit["strategies"][Strategy.DUAL_WRITE.value]["total_earns"]
    outb_total = audit["strategies"][Strategy.OUTBOX.value]["total_earns"]
    assert dual_total == outb_total == 200


def test_reconciler_flags_issue_without_earn():
    """A real reconciler checks the 'impossible' direction too."""
    events = [LifecycleEvent("ghost-1", ISSUED_FACT, Strategy.DUAL_WRITE)]
    report = reconcile(events)
    assert report["classes"][ReconClass.ISSUE_WITHOUT_EARN.value] == 1
    assert report["invariant_holds"] is False


def test_reconciler_classifies_each_lifecycle():
    s = Strategy.OUTBOX
    events = [
        LifecycleEvent("a", EARNED_FACT, s), LifecycleEvent("a", ISSUED_FACT, s),
        LifecycleEvent("b", EARNED_FACT, s),
        LifecycleEvent("c", EARNED_FACT, s), LifecycleEvent("c", DEAD_LETTER_FACT, s),
        LifecycleEvent("d", EARNED_FACT, s),
        LifecycleEvent("d", ISSUED_FACT, s), LifecycleEvent("d", ISSUED_FACT, s),
    ]
    report = reconcile(events)
    assert report["classes"][ReconClass.CONSISTENT.value] == 1        # a
    assert report["classes"][ReconClass.ORPHANED_EARN.value] == 1     # b
    assert report["classes"][ReconClass.VISIBLE_DEAD_LETTER.value] == 1  # c
    assert report["classes"][ReconClass.DOUBLE_ISSUE.value] == 1      # d
    assert report["silent_divergence"] == 2  # b + d; c is visible, not silent


# --------------------------------------------------------------------------- #
# 2. Lockstep with the real outbox
# --------------------------------------------------------------------------- #
def test_expected_fanout_matches_events_for_job():
    """EXPECTED_FANOUT is a pure-module mirror of outbox.events_for_job — if the
    fan-out ever changes, this test forces the reconciler to change with it."""
    events = outbox.events_for_job({"jobs": 1}, {"value": "BLOCKED", "reasons": []})
    assert {(e["target"], e["event_type"]) for e in events} == set(EXPECTED_FANOUT)


def test_max_attempts_mirrors_outbox():
    from app.domain import reconciliation

    assert reconciliation.MAX_ATTEMPTS == outbox.MAX_ATTEMPTS


# --------------------------------------------------------------------------- #
# 3. Real-data lane + endpoints
# --------------------------------------------------------------------------- #
def _job_report(report: dict, job_id: str) -> dict:
    return next(j for j in report["jobs"] if j["job_id"] == job_id)


def test_reconciliation_proof_over_real_rows(client):
    """Run a real replay job, then prove ITS fan-out reconciles: IN_FLIGHT while
    PENDING, CONSISTENT after the worker drains. (Assertions are per-job — the
    session DB is shared across test files, so global counts aren't ours to claim.)"""
    job = client.post(f"{M}/replay-jobs", json=BODY).json()
    before = client.get(f"{M}/reconciliation").json()
    assert before["total_jobs"] >= 1
    mine = _job_report(before, job["id"])
    assert mine["class"] == "in_flight"  # PENDING is legal — visible, not silent
    assert mine["missing"] == []

    db = SessionLocal()
    try:
        outbox.drain_once(db)
    finally:
        db.close()

    after = client.get(f"{M}/reconciliation").json()
    assert _job_report(after, job["id"])["class"] == "consistent"


def test_reconciliation_proof_detects_missing_event(client):
    """Delete one fan-out row (the dual-write ghost, impossible via the outbox
    itself) and the reconciler must name the job and the missing edge."""
    job = client.post(f"{M}/replay-jobs", json=BODY).json()
    db = SessionLocal()
    try:
        db.query(OutboxEventRow).filter_by(job_id=job["id"], target="billing").delete()
        db.commit()

        report = client.get(f"{M}/reconciliation").json()
        assert report["classes"]["missing_event"] >= 1
        assert report["invariant_holds"] is False
        broken = _job_report(report, job["id"])
        assert broken["class"] == "missing_event"
        assert "billing:VERDICT_ISSUED" in broken["missing"]
    finally:
        # Restore the row so later tests see a consistent world.
        outbox.enqueue(db, job["id"], "aurora-tickets",
                       [{"event_type": "VERDICT_ISSUED", "target": "billing",
                         "payload": {"restored": True}}])
        db.commit()
        db.close()


def test_reconciliation_proof_surfaces_dead_letters(client):
    """A persistently failing publisher dead-letters a real job's fan-out; the
    proof classifies that job as VISIBLE divergence — degraded, but never silent,
    and never MISSING."""
    job = client.post(f"{M}/replay-jobs", json=BODY).json()
    db = SessionLocal()
    try:
        def boom(_row):
            raise RuntimeError("downstream unavailable")

        now = datetime.now(timezone.utc)
        for _ in range(outbox.MAX_ATTEMPTS + 1):
            outbox.drain_once(db, publisher=boom, now=now)
            now = now + timedelta(hours=1)

        report = client.get(f"{M}/reconciliation").json()
        mine = _job_report(report, job["id"])
        assert mine["class"] == "visible_dead_letter"
        assert mine["missing"] == []
        assert all(s == "DEAD_LETTER" for s in mine["event_statuses"])
    finally:
        db.close()


def test_reconciliation_audit_endpoint(client):
    r = client.post(f"{M}/reconciliation-audit", json={"seed": 42, "count": 200})
    assert r.status_code == 200
    body = r.json()
    assert body["strategies"]["outbox"]["silent_divergence"] == 0
    assert body["strategies"]["dual_write"]["silent_divergence"] > 0
    assert body["delta"]["caught_by_reconciliation"] > 0
    assert [s["name"] for s in body["synthetic_inputs"]] == [
        "crash_fraction", "ambiguous_timeout_fraction", "hard_failure_fraction"]

    # Determinism at the HTTP layer: same body → identical payload.
    r2 = client.post(f"{M}/reconciliation-audit", json={"seed": 42, "count": 200})
    assert r2.json() == body


def test_reconciliation_audit_rejects_bad_fractions(client):
    r = client.post(f"{M}/reconciliation-audit",
                    json={"crash_fraction": 0.6, "ambiguous_timeout_fraction": 0.5})
    assert r.status_code == 422

    r = client.post(f"{M}/reconciliation-audit", json={"count": 0})
    assert r.status_code == 422


def test_reconciliation_audit_writes_nothing(client):
    """READ-ONLY means read-only: an audit run must not add a single row."""
    db = SessionLocal()
    try:
        before = db.query(OutboxEventRow).count()
        client.post(f"{M}/reconciliation-audit", json={"seed": 1, "count": 500})
        assert db.query(OutboxEventRow).count() == before
    finally:
        db.close()
