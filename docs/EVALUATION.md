# Evaluation

How to know Threshold works — and where its evidence stops.

## What the prototype demonstrates (offline, deterministic)
- **Golden path correctness:** a proposed change is diffed, replayed over event-time sessions, and produces a verdict that matches the constraint results. *(pytest: test_api, test_domain)*
- **The missing-attribute trap is caught** and isolated to only the sessions truly affected (counterfactual). *(test_only_missing_attribute_sessions_flagged)*
- **Fail-closed proofs:** every injected failure resolves to No Offer Rendered with checkout preserved. *(test_failclosed_always_no_offer)*
- **Determinism:** same seed → identical evaluations + verdict + summary. *(test_replay_deterministic)*
- **Integrity:** audit verifies clean; a mutated record is detected with the right `first_tampered_seq`. *(test_audit_verify_and_tamper_detection)*
- **Idempotency & dedup:** repeated replay key → same job; repeated conversion → deduplicated. *(test_replay_idempotency, test_conversion_dedup)*

Run: `cd backend && ./verify.sh` (28 tests + two smokes).

## What only production can establish (stated plainly)
- **Causal impact / uplift:** out of scope by design. The verdict caps at `ELIGIBLE_FOR_HOLDOUT`. The **online holdout** (Rokt's verified 5%-control Page Holdout) is the only causal mechanism.
- **Real-world session distribution:** synthetic data exercises the logic, not the true population.
- **p99 latency / drift under load:** not measured; a real gate would add a latency-budget check on live traffic and drift monitoring.

## Metrics a real deployment would track
| Layer | Metric |
|---|---|
| Safety | # policy changes blocked pre-holdout; # missing-attribute widenings caught |
| Reliability | fail-closed trigger rate; checkout-preservation (must be 100%) |
| Process | time-from-proposal-to-holdout-eligible; % changes requiring a fix |
| Integrity | audit verification pass rate |

## Failure threshold / rollback
Any hard-constraint FAIL or any invalid fail-closed proof → `BLOCKED` (no holdout). A regression detected during the online holdout is the rollback trigger — Threshold gates entry to that holdout; it does not replace it.
