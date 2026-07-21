"""Append-only, tamper-EVIDENT audit trail — hash-chained.

Each record's HMAC-SHA256 covers its own identity and payload AND the previous
record's HMAC, keyed by a server secret. Chaining is the point: independent
per-record HMACs detect modification of a stored record, but NOT deletion or
reordering. By committing the prior record's hash into each record, removing or
moving a record breaks the link to the next one, so a truncated or reshuffled
log fails verification too.

It is still explicitly NOT tamper-PROOF on two axes, and we name both rather than
imply coverage:
  1. A holder of the key (or a full app compromise) can forge a fresh,
     internally-valid chain.
  2. SUFFIX TRUNCATION — dropping the tail — leaves a valid shorter chain, so a
     plain chain cannot detect it on its own. Detecting truncation needs an
     external anchor: a separately-signed head hash + record count. (Interior
     deletion and reordering ARE detected, because they break a link or the
     seq/position match — see tests/test_invariants.py.)
See docs/THREAT_MODEL.md.
"""
from __future__ import annotations

import hashlib
import hmac
import json
from dataclasses import dataclass, field

# The prev-hash of the very first record — a fixed, well-known anchor so the
# genesis link is itself verifiable.
GENESIS = "0" * 64


def canonical(payload: dict) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def record_hmac(secret: str, seq: int, event_type: str, payload: dict, prev_hmac: str) -> str:
    """HMAC over the record's identity + content + the link to the prior record."""
    material = canonical(
        {"seq": seq, "event_type": event_type, "payload": payload, "prev_hmac": prev_hmac}
    )
    return hmac.new(secret.encode(), material.encode(), hashlib.sha256).hexdigest()


@dataclass
class AuditRecord:
    seq: int
    event_type: str
    payload: dict
    prev_hmac: str
    content_hmac: str


@dataclass
class AuditTrail:
    secret: str
    records: list[AuditRecord] = field(default_factory=list)

    def append(self, event_type: str, payload: dict) -> AuditRecord:
        seq = len(self.records)
        prev = self.records[-1].content_hmac if self.records else GENESIS
        h = record_hmac(self.secret, seq, event_type, payload, prev)
        rec = AuditRecord(seq, event_type, payload, prev, h)
        self.records.append(rec)
        return rec

    def as_list(self) -> list[dict]:
        return [
            {
                "seq": r.seq,
                "event_type": r.event_type,
                "payload": r.payload,
                "prev_hmac": r.prev_hmac,
                "content_hmac": r.content_hmac,
            }
            for r in self.records
        ]


def verify(records: list[dict], secret: str) -> dict:
    """Walk the chain. Catches content edits, deletion, and reordering; reports
    the first record where the chain breaks and why."""
    prev = GENESIS
    for i, r in enumerate(records):
        seq = r.get("seq")
        if seq != i:
            return {
                "verified": False,
                "records": len(records),
                "first_tampered_seq": seq,
                "reason": "sequence gap — a record was deleted or reordered",
            }
        if r.get("prev_hmac") != prev:
            return {
                "verified": False,
                "records": len(records),
                "first_tampered_seq": seq,
                "reason": "broken chain link — a record was deleted or reordered",
            }
        expected = record_hmac(secret, seq, r["event_type"], r["payload"], prev)
        if not hmac.compare_digest(expected, r.get("content_hmac", "")):
            return {
                "verified": False,
                "records": len(records),
                "first_tampered_seq": seq,
                "reason": "record content was altered after write",
            }
        prev = r["content_hmac"]
    return {"verified": True, "records": len(records), "first_tampered_seq": None, "reason": None}
