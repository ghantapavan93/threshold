"""Transactional outbox worker (effectful shell — NOT part of the pure domain).

Pattern: events are written in the same DB transaction as the replay job, then a
worker drains them with capped exponential backoff + jitter and dead-letters after
MAX_ATTEMPTS. In production these would fan out to billing/analytics/partner
systems; here `publish` is a no-op that a test can force to fail.
"""
from __future__ import annotations

import logging
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import OutboxEventRow

log = logging.getLogger("threshold.outbox")
MAX_ATTEMPTS = 5
BATCH = 50


def _now() -> datetime:
    return datetime.now(timezone.utc)


def enqueue(db: Session, job_id: str, merchant_id: str, events: list[dict]) -> None:
    """Add outbox rows to the CURRENT transaction (caller commits — that's what
    makes it transactional with the job)."""
    for e in events:
        db.add(OutboxEventRow(
            job_id=job_id, merchant_id=merchant_id,
            event_type=e["event_type"], target=e["target"], payload=e["payload"]))


def _backoff_seconds(attempts: int) -> float:
    base = min(0.5 * (2 ** attempts), 30.0)          # capped exponential
    return base + random.uniform(0, base * 0.2)       # + jitter


def _default_publish(row: OutboxEventRow) -> None:
    """Represents a successful fan-out to a downstream system."""
    return None


def drain_once(db: Session, publisher=None, now: datetime | None = None) -> dict:
    """Drain due PENDING events once. Returns a counts summary. Deterministic and
    directly testable (pass a `publisher` that raises to exercise dead-lettering)."""
    now = now or _now()
    publish = publisher or _default_publish

    stmt = (
        select(OutboxEventRow)
        .where(OutboxEventRow.status == "PENDING", OutboxEventRow.next_attempt_at <= now)
        .limit(BATCH)
    )
    # Postgres: skip locked rows so multiple workers can drain concurrently.
    if db.bind and db.bind.dialect.name == "postgresql":
        stmt = stmt.with_for_update(skip_locked=True)

    rows = db.execute(stmt).scalars().all()
    published = retried = dead = 0
    for r in rows:
        try:
            publish(r)
            r.status = "PUBLISHED"
            r.published_at = now
            published += 1
        except Exception:  # noqa: BLE001 — any downstream failure is retryable
            r.attempts += 1
            if r.attempts >= MAX_ATTEMPTS:
                r.status = "DEAD_LETTER"
                dead += 1
                log.warning("outbox event %s dead-lettered after %s attempts", r.id, r.attempts)
            else:
                r.next_attempt_at = now + timedelta(seconds=_backoff_seconds(r.attempts))
                retried += 1
    db.commit()
    return {"scanned": len(rows), "published": published, "retried": retried, "dead_letter": dead}


def events_for_job(job_summary: dict, verdict: dict) -> list[dict]:
    """The fan-out a completed replay produces (analytics + billing + partner)."""
    return [
        {"event_type": "REPLAY_COMPLETED", "target": "analytics", "payload": job_summary},
        {"event_type": "VERDICT_ISSUED", "target": "billing",
         "payload": {"verdict": verdict.get("value")}},
        {"event_type": "VERDICT_ISSUED", "target": "partner",
         "payload": {"verdict": verdict.get("value"), "reasons": verdict.get("reasons", [])}},
    ]
