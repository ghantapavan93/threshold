"""Recovery drill: a backlog built with the worker down, then drained against a
dependency that fails and recovers — proving bounded retries, no loss, and no
duplicate business state."""
from app.db import SessionLocal
from app.recovery import run_recovery_drill


def test_recovery_drill_recovers_without_loss_or_duplicates(client):
    db = SessionLocal()
    try:
        r = run_recovery_drill(db)
    finally:
        db.close()

    # a real backlog was built while the worker was "down"
    assert r["backlog_peak"] == r["enqueued"] > 0

    # every event eventually published; nothing dead-lettered
    assert r["published"] == r["enqueued"]
    assert r["dead_letter"] == 0

    # the dependency outage caused retries — one full pass per outage round
    assert r["retries"] == r["outage_rounds"] * r["enqueued"]

    # the whole point: business state landed exactly once, no duplicates on retry
    assert r["business_state_delivered"] == r["enqueued"]
    assert r["duplicate_business_state"] == 0
    assert r["recovered"] is True


def test_recovery_drill_endpoint(client):
    r = client.get("/api/v1/recovery-drill").json()
    assert r["recovered"] is True
    assert r["duplicate_business_state"] == 0
