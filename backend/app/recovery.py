"""Recovery drill — an operable proof that the transactional outbox survives
failure, not just a claim that it does.

It builds a backlog with the worker "down", then restores the worker against a
downstream dependency that is failing and later recovers, and shows three things
an on-call engineer actually cares about: the backlog drains under bounded
retries, nothing is lost, and no business state is duplicated. Deterministic and
exposed at GET .../recovery-drill, so the guarantee is evidence you can re-run.

This is an effectful ops concern (it drives the real outbox), so it lives beside
outbox.py, not in the pure domain.
"""
from __future__ import annotations

from datetime import timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from . import outbox
from .models import OutboxEventRow

DRILL_JOB = "recovery-drill"


def _pending(db: Session) -> int:
    return db.execute(
        select(func.count())
        .select_from(OutboxEventRow)
        .where(OutboxEventRow.job_id == DRILL_JOB, OutboxEventRow.status == "PENDING")
    ).scalar_one()


def _count(db: Session, status: str) -> int:
    return db.execute(
        select(func.count())
        .select_from(OutboxEventRow)
        .where(OutboxEventRow.job_id == DRILL_JOB, OutboxEventRow.status == status)
    ).scalar_one()


def run_recovery_drill(
    db: Session, *, batches: int = 4, per_batch: int = 12, outage_rounds: int = 3, max_rounds: int = 20
) -> dict:
    """Run the drill and return the evidence. `outage_rounds` must stay below
    outbox.MAX_ATTEMPTS so the outage is survived rather than dead-lettered."""
    # fresh slate — the drill owns its own job id, so it never touches real rows
    db.execute(delete(OutboxEventRow).where(OutboxEventRow.job_id == DRILL_JOB))
    db.commit()

    # 1) worker DOWN: enqueue batches and don't drain — the backlog grows.
    backlog_peak = 0
    for b in range(batches):
        outbox.enqueue(
            db,
            DRILL_JOB,
            "drill",
            [{"event_type": "DRILL_EVENT", "target": "partner", "payload": {"n": b * per_batch + i}} for i in range(per_batch)],
        )
        db.commit()
        backlog_peak = max(backlog_peak, _pending(db))
    total = batches * per_batch

    # 2) the dependency is DOWN for `outage_rounds` drains, then RECOVERS. Business
    #    state is the set of delivered ids, recorded only on a *successful* publish —
    #    so any double-delivery on retry would show up as a duplicate here.
    delivered: list[int] = []
    state = {"round": 0}

    def publisher(row: OutboxEventRow) -> None:
        if state["round"] < outage_rounds:
            raise RuntimeError("downstream dependency unavailable")
        delivered.append(row.id)

    # 3) RESTORE the worker: drain repeatedly, stepping time past the backoff each
    #    round so due rows are picked up regardless of the jitter in the backoff.
    base = outbox._now()
    rounds: list[dict] = []
    r = 0
    while _pending(db) and r < max_rounds:
        summary = outbox.drain_once(db, publisher=publisher, now=base + timedelta(seconds=r * 120))
        rounds.append(summary)
        state["round"] += 1
        r += 1

    published = _count(db, "PUBLISHED")
    dead = _count(db, "DEAD_LETTER")
    unique = len(set(delivered))
    duplicates = len(delivered) - unique
    retries = sum(x["retried"] for x in rounds)

    # clean up so the drill leaves no residue
    db.execute(delete(OutboxEventRow).where(OutboxEventRow.job_id == DRILL_JOB))
    db.commit()

    return {
        "enqueued": total,
        "backlog_peak": backlog_peak,
        "outage_rounds": outage_rounds,
        "drain_rounds": len(rounds),
        "retries": retries,
        "published": published,
        "dead_letter": dead,
        "business_state_delivered": unique,
        "duplicate_business_state": duplicates,
        "recovered": bool(published == total and dead == 0 and duplicates == 0),
        "rounds": rounds,
    }
