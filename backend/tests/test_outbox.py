"""Transactional outbox tests: atomic enqueue, drain, backoff/dead-letter."""
import uuid
from datetime import datetime, timedelta, timezone

from app import outbox
from app.db import SessionLocal
from app.models import OutboxEventRow

M = "/api/v1/merchants/aurora-tickets"
BODY = {"base_version": "V17", "proposed_version": "V18", "session_count": 200}


def test_replay_enqueues_outbox_atomically(client):
    job = client.post(f"{M}/replay-jobs", json=BODY).json()
    events = client.get(f"{M}/replay-jobs/{job['id']}/outbox").json()
    # three fan-out targets, all PENDING immediately after commit
    assert {e["target"] for e in events} == {"analytics", "billing", "partner"}
    assert all(e["status"] == "PENDING" for e in events)


def test_drain_publishes(client):
    job = client.post(f"{M}/replay-jobs", json=BODY).json()
    db = SessionLocal()
    try:
        summary = outbox.drain_once(db)
        assert summary["published"] >= 3
    finally:
        db.close()
    events = client.get(f"{M}/replay-jobs/{job['id']}/outbox").json()
    assert all(e["status"] == "PUBLISHED" and e["published_at"] for e in events)


def test_backoff_then_dead_letter():
    """A publisher that always fails retries with backoff, then dead-letters."""
    db = SessionLocal()
    try:
        jid = str(uuid.uuid4())
        outbox.enqueue(db, jid, "aurora-tickets",
                       [{"event_type": "VERDICT_ISSUED", "target": "billing", "payload": {"v": 1}}])
        db.commit()

        def boom(_row):
            raise RuntimeError("downstream unavailable")

        # Force each attempt to be "due" by advancing `now`, until dead-lettered.
        now = datetime.now(timezone.utc)
        for _ in range(outbox.MAX_ATTEMPTS + 1):
            outbox.drain_once(db, publisher=boom, now=now)
            now = now + timedelta(hours=1)

        row = db.query(OutboxEventRow).filter_by(job_id=jid).first()
        assert row.status == "DEAD_LETTER"
        assert row.attempts >= outbox.MAX_ATTEMPTS
    finally:
        db.query(OutboxEventRow).filter_by(merchant_id="aurora-tickets").delete()
        db.commit()
        db.close()
