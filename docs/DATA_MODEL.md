# Data Model

Grounded in `backend/app/models.py` (persistence) and `backend/app/domain/*` (the in-memory contracts).

## Entities & relationships
```
PolicyVersion (immutable, write-once)      1───*  (referenced by) ReplayJob
  id, merchant_id, policy_version, name, document(JSON), created_at
  UNIQUE(merchant_id, policy_version)

ReplayJob (one analysis of base→proposed)
  id, merchant_id, idempotency_key, base_version, proposed_version,
  verdict, result(JSON: diff, constraint_results, replay_summary,
                  evaluations[], failclosed_proofs[], verdict, _audit[]),
  created_at
  UNIQUE(merchant_id, idempotency_key)

Conversion (integrity demo)
  id, merchant_id, dedup_key, conversiontype, confirmationref, amount, currency, seq, created_at
  UNIQUE(merchant_id, dedup_key)   ← dedup_key = "conversiontype:confirmationref" (VERIFIED Rokt keys)

OutboxEvent (transactional outbox — written atomically with the ReplayJob)
  id, job_id, merchant_id, event_type(REPLAY_COMPLETED|VERDICT_ISSUED),
  target(analytics|billing|partner), payload(JSON),
  status(PENDING|PUBLISHED|DEAD_LETTER), attempts, next_attempt_at, created_at, published_at
```

**Transactional outbox (implemented, not just documented — the Milestone-B foundation):** a completed replay writes its fan-out events in the SAME transaction as the job, so the decision and its downstream notifications are atomic. A background worker (`app/outbox.py::drain_once`, started in the app lifespan) drains PENDING events with capped exponential backoff + jitter and dead-letters after 5 attempts; Postgres uses `FOR UPDATE SKIP LOCKED` for concurrent workers. Observable via `GET /replay-jobs/{id}/outbox`; tested in `tests/test_outbox.py`.

## In-memory domain contracts (not persisted as rows)
- **Session snapshot** `{ session_id, event_time, attributes{...} }` — event-time only; generated deterministically (`sessions.py`).
- **Decision** `{ decision, matched_rules[], failed_rule, fallback_reason }` (`evaluator.py`).
- **ConstraintResult** `{ key, result(PASS|WARN|FAIL), detail, grounding }` (`constraints.py`).
- **AuditRecord** `{ seq, event_type, payload, content_hmac }` (`audit.py`).

## Event contracts (the append-only audit stream, per replay)
`REPLAY_STARTED → CONSTRAINTS_EVALUATED → DECISION_RECORDED* → FAILCLOSED_PROVEN → VERDICT_ISSUED`
Each carries a deterministic payload + an HMAC over its canonical JSON.

## State transitions
- **ReplayJob:** created → COMPLETED (synchronous MVP; at scale: PENDING → RUNNING → COMPLETED|FAILED via a worker + outbox — FUTURE_VISION).
- **Verdict:** BLOCKED (any FAIL / invalid proof) · INSUFFICIENT_EVIDENCE (WARN or < min sessions) · ELIGIBLE_FOR_HOLDOUT (changes + all pass).
- **Conversion:** RECEIVED → PROCESSED | DEDUPLICATED.
- **Cancellation (modeled):** reserved → confirmed → canceled (terminal), linked by `itemReservationId`.

## Idempotency
- **Replay jobs:** `Idempotency-Key` → UNIQUE(merchant, key); a repeat returns the same job, never re-runs.
- **Conversions:** UNIQUE(merchant, dedup_key); a duplicate delivery updates state exactly once (effectively-once over at-least-once — ADR-003).
- Both handle the race (IntegrityError → return existing).

## Sensitive fields / privacy
- The demo stores **no real PII** — sessions are synthetic; `customer.cc_bin` is a fictional 6-digit prefix, `customer.age`/`loyalty_segment` are synthetic. See SECURITY_PRIVACY.md.
- A real deployment would treat identity/consent attributes as sensitive, encrypt at rest, and honor consent state at replay time (FUTURE_VISION Milestone E).

## Retention / tenancy
- **Tenant separation:** every table + query is scoped by `merchant_id`.
- **Retention (prototype):** unbounded local DB; a real deployment sets a retention window on replay results + audit, with the audit anchored externally for tamper-evidence (THREAT_MODEL).

## Seed data
`backend/seed/policies/*.json` — one merchant (`aurora-tickets`), three immutable versions:
- **V17** (baseline), **V18** (the dangerous edit: age 25→18, freq 1→3, r4 `include_is_not_in`→`exclude_is_in`, changed disclaimers), **V18-safe** (the fix). Loaded idempotently on startup (`seed.py`).
