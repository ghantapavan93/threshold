# Failure Modes

How Threshold behaves under each failure. The governing rule: **fail closed** — a failure never produces an offer and never touches checkout.

| Failure | Threshold behavior | Where |
|---|---|---|
| **Model / decision timeout** | Guarded → `no_offer`, `fallback_reason=decision_timeout`; checkout preserved; proof recorded | `failclosed.py`, `test_failclosed_always_no_offer` |
| **Invalid structured output** (malformed placement) | Guarded → `no_offer`, `fallback_reason=invalid_output` | `failclosed.py` |
| **Stale / unresolved identity** | Guarded → `no_offer`, `fallback_reason=stale_identity` | `failclosed.py` |
| **Duplicate conversion event** (at-least-once delivery) | Deduped on `conversiontype:confirmationref`; exactly one obligation; returns existing id | `conversions.py`, `test_conversion_dedup` |
| **Duplicate replay request** | `Idempotency-Key` → same job, never re-run | `replay.py`, `test_replay_idempotency` |
| **Out-of-order / late event** | Replay is event-time-bounded; evaluation uses only the snapshot's event-time attributes — ordering can't corrupt a decision | `sessions.py` + `evaluator.py` |
| **Missing attribute** (e.g., absent `cc_bin`) | First-class: `include_is_not_in` excludes it, `exclude_is_in` includes it; an operator flip that silently widens missing-attribute sessions → **BLOCKED** | `evaluator.py`, `constraints.py` |
| **Incorrect / widened eligibility** | Counterfactual isolation flags exactly the silently-widened sessions → FAIL | `constraints.py`, `test_only_missing_attribute_sessions_flagged` |
| **Partial success across sessions** | Every session is independently evaluated; the verdict aggregates; no partial job is persisted (atomic write) | `replay.py`, `models.py` |
| **Privacy / consent rule violation** | A sensitive attribute used without `consent_required` → consent FAIL → BLOCKED | `constraints.py` |
| **Change re-enters approval unexpectedly** | Material-term change flagged (`requires_reapproval` WARN) so it's not a surprise in the queue | `constraints.py` (grounded, doc 20) |
| **Illegal edit to an immutable field** | objective/country/language/timezone change → `immutable_field_guard` FAIL ("requires a new campaign") | `constraints.py` (grounded, doc 20) |
| **Provider / DB failure mid-write** | Synchronous transaction rolls back; no partial job. (At scale: outbox + worker retry with a status guard — FUTURE_VISION) | `replay.py`, `db.py` |
| **Audit tampering** | `verify()` recomputes each HMAC and returns the first tampered `seq` | `audit.py`, `test_audit_verify_and_tamper_detection` |
| **UI / API unreachable** | Console shows an explicit error state ("Backend unreachable at …"); **never fabricates data** | frontend `BackendBanner` + error states |
| **Insufficient replay evidence** | < min sessions or only WARNs → `INSUFFICIENT_EVIDENCE` (not a false green) | `verdict.py` |
| **Operator wants to override a BLOCK** | Not offered — a FAIL blocks entry to the holdout; the operator must fix and re-run. A real deployment would add an audited, dual-control override | `verdict.py` (by design) |
| **Rollback / regression during the holdout** | Out of Threshold's scope by design — Threshold gates *entry* to the holdout; the holdout + Rokt's tooling own live rollback | EVALUATION.md |

## The invariant under all of the above
`original_checkout_completion` never depends on `offer_service_success`. Every failure path resolves to **No Offer Rendered** with the checkout untouched. (TRANSACTION_INVARIANTS #1–#2.)
