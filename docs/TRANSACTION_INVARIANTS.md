# Transaction Invariants

The properties Threshold enforces or asserts. These are the spine of the design and the best surface for a senior-engineer conversation. (Where an invariant maps to a test, the test file is named.)

1. **Checkout independence.** The merchant's checkout has **zero synchronous dependency** on the offer path. Any offer-side failure resolves to *No Offer Rendered*; checkout completes regardless. *(failclosed.py; test_domain::test_failclosed_always_no_offer)*

2. **Fail closed, never open.** Timeout, invalid output, or unresolved identity → `no_offer` with a recorded `fallback_reason`. An offer is **never** produced on a failure path. *(failclosed.py)*

3. **Deterministic evaluation.** For a given (session snapshot, policy) the decision is a pure function — no I/O, randomness, or wall-clock. This is what makes replay bit-for-bit reproducible. *(evaluator.py; test_domain::test_evaluate_determinism, test_replay_deterministic)*

4. **No future-information leakage.** Replay evaluates only the event-time attribute snapshot captured on the session; it never joins a later/current profile. *(sessions.py + evaluator.py by construction)*

5. **Immutable policy versions.** A published policy version's document never changes; every decision references exactly one version. *(models.PolicyVersionRow; seed is write-once)*

6. **Effectively-once financial state over at-least-once delivery.** Conversions dedupe on `conversiontype:confirmationref`; a repeated delivery updates state exactly once (unique DB constraint + graceful conflict handling). We say *effectively-once state*, not "exactly-once delivery." *(conversions.py; test_api::test_conversion_dedup)*

7. **Idempotent replay jobs.** A repeated `Idempotency-Key` returns the same job; it is never re-run. *(replay.py router; test_api::test_replay_idempotency)*

8. **Append-only, tamper-evident audit.** Every run appends records carrying a per-record HMAC; verification detects post-write modification (integrity, not truth — see THREAT_MODEL). *(audit.py; test_domain::test_audit_verify_and_tamper_detection)*

9. **Single enforcement point for hard constraints.** Eligibility/consent/brand-safety/frequency/latency/holdout and the missing-attribute check live in one deterministic validator; a FAIL blocks release. *(constraints.py)*

10. **Missing-attribute safety.** A rule-operator change that flips missing-value behavior (e.g. `include_is_not_in` → `exclude_is_in`) is isolated via a **counterfactual** (revert just that operator) and blocks release when any replayed missing-attribute session is silently widened. *(constraints.py; test_domain::test_only_missing_attribute_sessions_flagged)*

11. **Tenant scoping.** All queries are scoped by `merchant_id`; one merchant's data is never returned for another. *(routers)*

12. **Holdout is the only causal mechanism.** A positive verdict is *eligibility for a controlled online holdout* — never "safe to launch." Replay filters **known** violations; it does not establish causal safety. *(verdict.py)*
