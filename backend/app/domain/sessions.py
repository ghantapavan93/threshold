"""Deterministic synthetic session generator.

Seeded so a given (seed, count) always yields identical sessions -> replay is
reproducible. Sessions are event-time snapshots: each carries only the attributes
known at that moment. A meaningful fraction intentionally have a MISSING cc_bin so
the missing-attribute trap is exercised.

NB: synthetic data demonstrates the MECHANISM, not real-world efficacy. See
docs LIMITATIONS: only a controlled online holdout can establish causal impact.
"""
from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

# Fixed base instant keeps event_time deterministic (no wall-clock in the core).
_BASE = datetime(2026, 5, 12, 14, 0, 0, tzinfo=timezone.utc)
_KNOWN_BINS = ["411111", "511111", "601100", "222300", "377712"]


def generate_sessions(seed: int, count: int) -> list[dict]:
    rng = random.Random(seed)
    sessions: list[dict] = []
    for i in range(count):
        attrs: dict = {}
        attrs["purchase.seat_type"] = "premium" if rng.random() < 0.55 else "standard"
        attrs["customer.age"] = rng.randint(16, 70)
        r = rng.random()
        attrs["customer.loyalty_segment"] = (
            "VIP" if r < 0.08 else ("member" if r < 0.55 else "guest")
        )
        # ~18% of sessions have NO cc_bin captured (true missing attribute).
        if rng.random() < 0.18:
            pass  # key intentionally absent
        else:
            attrs["customer.cc_bin"] = rng.choice(_KNOWN_BINS)

        sessions.append(
            {
                "session_id": f"s-{i:04d}",
                "event_time": (_BASE + timedelta(seconds=i * 7)).isoformat(),
                "attributes": attrs,
            }
        )
    return sessions
