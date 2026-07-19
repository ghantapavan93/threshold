"""Append-only, tamper-EVIDENT audit trail.

Each record carries an HMAC-SHA256 over its canonical-JSON payload keyed by a
server secret. This detects modification of a stored record by a party WITHOUT the
key. It is explicitly NOT tamper-PROOF (a holder of the key, or a full app
compromise, can forge records) and it does NOT prove semantic truth — only that a
stored record's content was not altered after write. See docs/THREAT_MODEL.md.
"""
from __future__ import annotations

import hashlib
import hmac
import json
from dataclasses import dataclass, field


def canonical(payload: dict) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def content_hmac(secret: str, payload: dict) -> str:
    return hmac.new(secret.encode(), canonical(payload).encode(), hashlib.sha256).hexdigest()


@dataclass
class AuditRecord:
    seq: int
    event_type: str
    payload: dict
    content_hmac: str


@dataclass
class AuditTrail:
    secret: str
    records: list[AuditRecord] = field(default_factory=list)

    def append(self, event_type: str, payload: dict) -> AuditRecord:
        seq = len(self.records)
        rec = AuditRecord(seq, event_type, payload, content_hmac(self.secret, payload))
        self.records.append(rec)
        return rec

    def as_list(self) -> list[dict]:
        return [{"seq": r.seq, "event_type": r.event_type, "payload": r.payload,
                 "content_hmac": r.content_hmac} for r in self.records]


def verify(records: list[dict], secret: str) -> dict:
    """Recompute each HMAC; report the first record whose content was altered."""
    for r in records:
        expected = content_hmac(secret, r["payload"])
        if not hmac.compare_digest(expected, r.get("content_hmac", "")):
            return {"verified": False, "records": len(records), "first_tampered_seq": r["seq"]}
    return {"verified": True, "records": len(records), "first_tampered_seq": None}
