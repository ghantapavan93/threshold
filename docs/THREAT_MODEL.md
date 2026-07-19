# Threat Model — the tamper-evident audit

A common failure in junior projects is invoking "hash-chained / tamper-proof / blockchain audit" without a threat model. This documents exactly what Threshold's audit does and does **not** protect, so the claim is honest.

## What we build
Each audit record carries `content_hmac = HMAC-SHA256(server_secret, canonical_json(payload))`. Records are **append-only**. A verify endpoint recomputes each HMAC and reports the first record whose stored content no longer matches.

## What it protects against
- **Post-write modification by a party without the key.** If someone edits a stored record's payload (e.g., a read-access DB actor, a backup tamperer, a leaked dump), `content_hmac` will not match on recompute, and `verify` returns `{verified:false, first_tampered_seq:N}`. This is genuine **tamper-evidence**.
- **Accidental corruption** of stored payloads.

## What it explicitly does NOT protect against (and we say so)
- **A holder of `server_secret`** (or a fully compromised application) can forge valid HMACs for fabricated records. This is **not tamper-proof**.
- **Semantic truth.** The HMAC proves a record's *content was not altered after write* — not that the recorded event was *correct*. Garbage in is faithfully preserved garbage.
- **Ordering/deletion by a privileged actor.** A single per-record HMAC (no external anchor) does not prove that no record was removed. A production system would anchor a chain head in an independent, append-only store (or a Merkle root published externally). We deliberately did **not** fake that here.

## Why this design (not a hash chain) for the MVP
A local hash chain stored in the same database does not survive its own threat model — the same actor who can edit a record can recompute the chain. It reads as decorative cryptography. A per-record HMAC keyed by a secret the DB actor lacks is the honest, minimal thing that provides real value. See `docs/ADR/ADR-004-tamper-evident-not-tamper-proof.md`.

## Terminology
We use **"tamper-evident,"** never "tamper-proof," and never "blockchain." The verify endpoint's contract is: *proves per-record content integrity against a non-privileged tamperer; does not prove semantic correctness or completeness.*
