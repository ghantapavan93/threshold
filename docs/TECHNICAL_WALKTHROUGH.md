# 10-Minute Technical Walkthrough

For a conversation with a Rokt staff/senior engineer. Each section is ~1 minute. Lead with judgment, not features; invite challenge.

## 1. Framing (what it is / isn't)
Threshold is a **pre-release, deterministic policy-change safety gate** — not Rokt Brain, not a recommender, not an experimentation platform, not a live serving component. It validates that a *change* between two immutable policy versions is safe to put in front of a reviewer or a holdout. (`docs/WORKFLOW.md` for "the seam.")

## 2. Architecture
Four layers: Next.js console → FastAPI → a **pure deterministic domain engine** → Postgres/SQLite. The engine (`app/domain/*`) is a pure function of `(session snapshot, policy)` — no I/O, wall-clock, randomness, or LLM — which is what makes replay bit-for-bit reproducible. The API/DB are a thin, replaceable shell. (`docs/ARCHITECTURE.md`.)

## 3. The replay lifecycle (data flow)
`POST /replay-jobs` → load two immutable policies → generate seeded event-time sessions → evaluate base & proposed (pure) → diff → constraints → fail-closed proofs → verdict → append-only HMAC audit → persist. Synchronous, one transaction (MVP).

## 4. The signature check — missing-attribute isolation
Rokt's audience docs: "Include (is not in)" vs "Exclude (is in)" differ *only* on missing values. My constraint catches a `include_is_not_in → exclude_is_in` flip via a **counterfactual**: revert just that operator, re-evaluate, and flag a session only if (a) its attribute is missing, (b) base=no_offer & proposed=offer, and (c) reverting the operator makes the proposed offer disappear. So it flags exactly the sessions the flip is *necessary* for — no false positives from the age change. (`constraints.py`.)

## 5. State transitions & idempotency
Replay jobs are idempotent by `Idempotency-Key` (unique per merchant); a repeat returns the same job, never re-runs. Conversions dedupe on `conversiontype:confirmationref` (Rokt's verified keys) — **effectively-once state over at-least-once delivery**, not "exactly-once." (ADR-003.)

## 6. AI role (and where it's prohibited)
No AI in the critical path — by design. Rule evaluation, constraints, fail-closed, verdict, audit, dedup are all deterministic. LLMs are confined to off-path advisory text (a change summary) that degrades to nothing. OPE (SNIPS/DR) is interface-only and deferred because it needs logged propensities and must never replace the holdout. I enforce this with an **ast-based architecture fitness test** that fails the build if the engine ever imports an LLM/HTTP/DB module. (`AI_DESIGN.md`, `tests/test_architecture.py`.)

## 7. Failure modes
The governing invariant: `original_checkout_completion` never depends on `offer_service_success`. Injected timeout / invalid output / stale identity all resolve to "No Offer Rendered," checkout untouched. Duplicate/late events are handled by dedup + event-time evaluation. Insufficient replay evidence → `INSUFFICIENT_EVIDENCE`, not a false green. (`FAILURE_MODES.md`, 18-row matrix.)

## 8. Testing
33 tests: operator semantics incl. both missing-value ops; the counterfactual isolation; fail-closed for each injection; determinism (same seed → identical job); HMAC tamper detection with `first_tampered_seq`; idempotency + dedup; five scenarios each blocking for a distinct reason; and the architecture fitness test. One-command `verify` runs the suite + two smokes.

## 9. Security, privacy, observability
Tenant-scoped by `merchant_id`. Append-only **tamper-evident** audit (per-record HMAC; I'm explicit it's *not* tamper-proof and doesn't prove semantic truth — `THREAT_MODEL.md`). No real PII (synthetic sessions). Request-ID correlation on every response; structured JSON logs. Demo auth is a header — a real deployment needs SSO + per-tenant RBAC. (`SECURITY_PRIVACY.md`.)

## 10. Tradeoffs & scale
The MVP is synchronous (fine for a few hundred sessions). At Rokt scale: enqueue → async worker → transactional outbox → batched evaluation → single verdict commit, sessions from a read replica, Kafka ingestion. The pure evaluator parallelizes trivially. Invariants (idempotent job, atomic verdict, no future leakage) hold either way. (`FUTURE_VISION.md`, Milestone B.)

## 11. What I'd change with internal access
Replay against real anonymized event-time logs instead of synthetic; wire the actual One Platform policy schema; confirm the real change-management workflow + approval owners; add the OPE pre-screen with logged propensities; add live latency/drift monitoring; and — most importantly — **confirm which of these checks already exist internally so Threshold complements rather than duplicates.**

## 12. The honest close
The thing I'm least sure about is whether a standalone pre-flight surface is what a Rokt engineer wants versus folding these checks into existing CI/review. I've gathered partial public evidence (the "Save and Edit → approval queue" flow) and treat it as a hypothesis. Tell me where I'm wrong.
