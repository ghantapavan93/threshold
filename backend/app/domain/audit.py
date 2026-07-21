"""Append-only, tamper-EVIDENT audit trail — hash-chained.

Each record's HMAC-SHA256 covers its own identity and payload AND the previous
record's HMAC, keyed by a server secret. Chaining is the point: independent
per-record HMACs detect modification of a stored record, but NOT deletion or
reordering. By committing the prior record's hash into each record, removing or
moving a record breaks the link to the next one, so a truncated or reshuffled
log fails verification too.

Suffix truncation — dropping the tail — would leave a valid shorter chain, so
the chain alone can't see it. That gap is closed by a SEAL: a key-signed
commitment to the log's head (its record count + final HMAC), stored alongside
the log. Drop the tail and the count/head no longer match the seal, and forging
a seal for a shorter log needs the secret. So verification now catches content
edits, reordering, interior deletion, AND truncation.

It is still explicitly NOT tamper-PROOF against a holder of the key (or a full
app compromise), who can forge a fresh chain and a matching seal — and it does
not prove semantic truth, only that the stored sequence is intact. See
docs/THREAT_MODEL.md.
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


def compute_seal(secret: str, records: list[dict]) -> dict:
    """A key-signed commitment to the log's HEAD — its record count and final
    HMAC. Stored beside the log, it is the external anchor that makes SUFFIX
    TRUNCATION detectable: drop the tail and count/head stop matching the seal,
    and re-signing a shorter log needs the secret."""
    count = len(records)
    head = records[-1]["content_hmac"] if records else GENESIS
    sig = hmac.new(secret.encode(), f"{count}:{head}".encode(), hashlib.sha256).hexdigest()
    return {"count": count, "head": head, "sig": sig}


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

    def seal(self) -> dict:
        """The signed head anchor for this log — store it beside the records."""
        return compute_seal(self.secret, self.as_list())


def verify(records: list[dict], secret: str, seal: dict | None = None) -> dict:
    """Walk the chain, then check the signed head anchor if one is supplied.
    Catches content edits, reordering, interior deletion, AND — via the seal —
    suffix truncation. Reports the first place integrity breaks and why."""
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

    # The signed head anchor: catches truncation/extension the chain can't see.
    if seal is not None:
        expected_sig = hmac.new(
            secret.encode(), f"{seal['count']}:{seal['head']}".encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected_sig, seal.get("sig", "")):
            return {
                "verified": False,
                "records": len(records),
                "first_tampered_seq": None,
                "reason": "audit seal signature is invalid — the anchor itself was tampered",
            }
        head = records[-1]["content_hmac"] if records else GENESIS
        if len(records) != seal["count"] or head != seal["head"]:
            return {
                "verified": False,
                "records": len(records),
                "first_tampered_seq": max(len(records) - 1, 0),
                "reason": f"log truncated or extended — {len(records)} records present, the sealed head commits {seal['count']}",
            }

    return {"verified": True, "records": len(records), "first_tampered_seq": None, "reason": None}
