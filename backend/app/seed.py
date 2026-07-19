"""Seed immutable policy versions from backend/seed/policies/*.json (idempotent)."""
from __future__ import annotations

import json
from pathlib import Path

from .db import SessionLocal
from .models import PolicyVersionRow

SEED_DIR = Path(__file__).resolve().parent.parent / "seed" / "policies"


def seed_policies() -> int:
    added = 0
    db = SessionLocal()
    try:
        for f in sorted(SEED_DIR.glob("*.json")):
            doc = json.loads(f.read_text())
            mid, ver = doc["merchant_id"], doc["policy_version"]
            exists = (
                db.query(PolicyVersionRow)
                .filter_by(merchant_id=mid, policy_version=ver)
                .first()
            )
            if not exists:
                db.add(PolicyVersionRow(
                    merchant_id=mid, policy_version=ver, name=doc.get("name", ""), document=doc))
                added += 1
        db.commit()
    finally:
        db.close()
    return added
