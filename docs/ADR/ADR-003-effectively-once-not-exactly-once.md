# ADR-003 — Effectively-once state over at-least-once delivery

**Status:** Accepted

**Context.** Conversion events arrive at-least-once. Naive language ("exactly-once") is imprecise and a red flag to distributed-systems reviewers.

**Decision.** Model **at-least-once delivery with idempotent, effectively-once state transitions**. Dedupe on the verified Rokt keys `conversiontype` + `confirmationref` via a unique DB constraint; a duplicate returns the existing record without creating a second obligation. Replay jobs are idempotent by `Idempotency-Key`.

**Consequences.** (+) Correct, precise vocabulary. (+) Maps to real Rokt dedup semantics. (−) Requires careful conflict handling (unique-constraint race → return existing), which is implemented and tested.
