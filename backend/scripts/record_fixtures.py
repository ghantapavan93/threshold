"""Record REAL Moment Forge engine output as offline fallback fixtures.

Runs the two new endpoints through FastAPI's TestClient (deterministic, no running
server, seeded corpus) for the canonical demo pairs and writes the byte-for-byte
response JSON into frontend/lib/fixtures/momentforge/. These are the offline
fallback the frontend loads when the backend is unreachable — REAL engine output,
never hand-authored.

Usage:  python -m scripts.record_fixtures      (from the backend/ directory)
"""
from __future__ import annotations

import json
import os
import pathlib

# Isolate to a throwaway DB and seed on startup, exactly like the test harness.
os.environ.setdefault("DATABASE_URL", "sqlite:///./record_fixtures.db")
os.environ.setdefault("SEED_ON_STARTUP", "1")
os.environ.setdefault("OUTBOX_WORKER", "0")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

MERCHANT = "aurora-tickets"
BASE = f"/api/v1/merchants/{MERCHANT}"
SEED, COUNT = 42, 200

OUT_DIR = (pathlib.Path(__file__).resolve().parent.parent.parent
           / "frontend" / "lib" / "fixtures" / "momentforge")

CASES = [
    # (scenario, proposed_version) — one per real seeded law the engine enforces.
    ("trap", "V18"),               # missing-attribute inversion  → BLOCKED
    ("safe", "V18-safe"),          # the clean change             → ELIGIBLE_FOR_HOLDOUT
    ("fatfinger", "V18-fatfinger"),# plausibility guard (age = 2) → BLOCKED
    ("consent", "V18-consent"),    # consent guard (sensitive)    → BLOCKED
    ("immutable", "V18-immutable"),# immutable-field guard        → BLOCKED
]


def _write(name: str, content: bytes) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    # Pretty-print the real bytes for a readable, diffable fixture (still the exact
    # engine output — we round-trip the parsed JSON, no fabrication).
    path.write_text(json.dumps(json.loads(content), indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path}  ({len(content)} raw bytes)")


def main() -> None:
    with TestClient(app) as client:
        for scenario, proposed_version in CASES:
            compile_resp = client.post(
                f"{BASE}/semantic-compile",
                json={"base_version": "V17", "proposed_version": proposed_version,
                      "muted_contexts": []},
            )
            compile_resp.raise_for_status()
            _write(f"compile.{scenario}.json", compile_resp.content)

            simulate_resp = client.post(
                f"{BASE}/simulations",
                json={
                    "base_version": "V17",
                    "proposed": {"from_version": proposed_version,
                                 "rule_overrides": [], "muted_contexts": []},
                    "session_seed": SEED,
                    "session_count": COUNT,
                    "injections": ["timeout", "invalid_output", "stale_identity"],
                },
            )
            simulate_resp.raise_for_status()
            _write(f"simulate.{scenario}.json", simulate_resp.content)

        # Translation Map (§3): the ACL seam made executable. One canonical fixture at
        # the demo seed — REAL engine output over the seeded conversion corpus.
        translation_resp = client.post(
            f"{BASE}/translation-audit",
            json={"term": "conversion", "seed": SEED, "count": COUNT},
        )
        translation_resp.raise_for_status()
        _write("translation-audit.json", translation_resp.content)


if __name__ == "__main__":
    main()
