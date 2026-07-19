# ADR-004 — Tamper-evident (per-record HMAC), not tamper-proof (no chain)

**Status:** Accepted

**Context.** "Hash-chained / blockchain / tamper-proof audit" is a common junior over-claim. A local hash chain stored beside the data doesn't survive its own threat model — the actor who can edit a record can recompute the chain.

**Decision.** Use an **append-only** log where each record carries `HMAC-SHA256(server_secret, canonical_json(payload))`. A verify endpoint recomputes and reports the first altered record. Terminology is **"tamper-evident,"** never "tamper-proof"; the threat model is documented (protects against a non-privileged tamperer; a key-holder can forge; proves content integrity, not semantic truth).

**Consequences.** (+) Honest, minimal, genuinely useful. (+) A clean interview answer. (−) Not completeness/ordering-proof; production would anchor a chain head externally or publish a Merkle root — documented, not faked.
