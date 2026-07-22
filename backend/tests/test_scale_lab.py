"""Scale Lab smoke test: the decision-path timing produces sane, ordered
percentiles and a positive throughput over real generated sessions."""
from app.db import SessionLocal
from app.domain.sessions import generate_sessions
from app.routers.common import load_policy
from scripts.scale_lab import time_decision


def test_decision_timing_is_sane(client):
    db = SessionLocal()
    try:
        policy = load_policy(db, "aurora-tickets", "V18")
    finally:
        db.close()

    stats = time_decision(policy, generate_sessions(42, 50), repeats=5)
    assert stats["samples"] == 250
    assert stats["throughput_decisions_per_s"] > 0
    # percentiles are ordered
    assert stats["p50_us"] <= stats["p99_us"] <= stats["p999_us"]
