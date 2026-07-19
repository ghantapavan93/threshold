# Threshold — Architecture (deep)

Every claim below maps to a file/function in this repo. Threshold is a **pre-release** safety gate; it never sits in the live serving path.

## Layered stack

```
┌──────────────────────────────────────────────────────────────────────┐
│  PRESENTATION — Operator Console (Next.js 14 App Router, TS, Tailwind) │
│  Hero self-driving demo · Policy Diff · Constraint Heatmap ·           │
│  Policy Diff Replay timeline · Fail-Closed Proof · Verdict · Evidence  │
│  lib/api.ts (typed client + Zod at the boundary) · TanStack Query      │
└───────────────────────────────┬──────────────────────────────────────┘
               HTTP (JSON, X-Request-ID, Idempotency-Key)
┌───────────────────────────────▼──────────────────────────────────────┐
│  API — FastAPI (app/main.py)                                          │
│  routers: policies · replay · conversions · cancellations · audit ·   │
│  health   ·   request-id middleware   ·   error envelope   ·   CORS   │
└───────────────────────────────┬──────────────────────────────────────┘
┌───────────────────────────────▼──────────────────────────────────────┐
│  DOMAIN ENGINE — pure, deterministic, side-effect-free (app/domain)   │
│  evaluator · constraints (incl. missing-attribute counterfactual) ·   │
│  sessions · diff · failclosed · verdict · audit (HMAC) · replay (orch) │
│  NO I/O · NO wall-clock · NO randomness · NO LLM  → bit-for-bit replay │
└───────────────────────────────┬──────────────────────────────────────┘
┌───────────────────────────────▼──────────────────────────────────────┐
│  PERSISTENCE — SQLAlchemy 2.0 · SQLite (local) / Postgres (docker)    │
│  policy_versions (immutable) · replay_jobs (result+audit JSON) ·      │
│  conversions (dedup)                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

The domain engine is the crown jewel: it is a **pure function of (session snapshot, policy)**. The API and DB are a thin, replaceable shell around it.

## The replay request lifecycle (`POST /api/v1/merchants/{m}/replay-jobs`)

Maps 1:1 to `app/routers/replay.py` → `app/domain/replay.py::run_replay`:

```
1. Idempotency-Key present & seen?  → return existing job (200)          [replay.py router]
2. load base & proposed immutable Policy documents                        [routers/common.load_policy]
3. generate_sessions(seed, count)   → deterministic event-time snapshots  [domain/sessions.py]
4. evaluate(base) & evaluate(proposed) per session (PURE)                 [domain/evaluator.py]
5. diff_policies(base, proposed)    → change list + risk tags             [domain/diff.py]
6. evaluate_constraints(...)        → 9 checks; missing-attribute via
      COUNTERFACTUAL isolation (revert just the flipped operator)         [domain/constraints.py]
7. build per-session evaluations + change_kind + violation                [domain/replay.py]
8. failclosed.prove(injection, sample, proposed) for each injection       [domain/failclosed.py]
9. decide(constraints, proofs, changed_count, session_count) → verdict     [domain/verdict.py]
10. append-only audit at every step, each record HMAC-signed               [domain/audit.py]
11. persist ReplayJobRow (result incl. _audit); unique (merchant, idem)    [models.py + replay.py]
12. return job payload (minus _audit) with 201                             [routers/common.job_response]
```

## Sequence — the BLOCKED golden path (V17 → V18)

```
Operator      Console        API            Domain engine                DB
   │  click Play   │             │                   │                    │
   │──────────────▶│ POST replay-jobs (V17→V18) ─────▶ run_replay          │
   │               │             │  gen 200 sessions (seed 42)             │
   │               │             │  evaluate base/proposed (pure)          │
   │               │             │  diff → r4 op flip = missing_attr_flip  │
   │               │             │  constraints → counterfactual:          │
   │               │             │     21 missing-cc_bin sessions widened  │
   │               │             │  → missing_attribute_semantics FAIL     │
   │               │             │  failclosed: timeout→no_offer (valid)   │
   │               │             │  verdict = BLOCKED ──────────── persist ▶│
   │◀──────────────│◀── job (BLOCKED, 9 constraints, evaluations, audit) ──│
   │  auto-scroll heatmap→verdict, captions from live job                  │
```

## Sequence — the fail-closed proof (injected failure)

```
prove("timeout", attrs, proposed)          [domain/failclosed.py]
  guarded_decide raises TimeoutError → caught → Decision("no_offer", reason="decision_timeout")
  → { decision:no_offer, checkout_preserved:true, offer_state_created:false, proof_valid:true }
Invariant: the checkout timeline has ZERO synchronous dependency on the offer path.
```

## Component responsibilities

| Module | Responsibility | Purity |
|---|---|---|
| `domain/policy.py` | Policy/Rule schema; the 7 operators incl. the two missing-value ops | pure |
| `domain/evaluator.py` | `evaluate(attrs, policy) → Decision`; short-circuit on first failing rule | pure, deterministic |
| `domain/sessions.py` | seeded event-time session generator; ~18% missing cc_bin | pure (seeded RNG) |
| `domain/diff.py` | structural diff + risk classification (`missing_attribute_flip`, …) | pure |
| `domain/constraints.py` | 9 hard checks; **counterfactual isolation** of the missing-attribute trap | pure |
| `domain/failclosed.py` | inject timeout/invalid_output/stale_identity → prove No Offer Rendered | pure |
| `domain/verdict.py` | BLOCKED / INSUFFICIENT_EVIDENCE / ELIGIBLE_FOR_HOLDOUT | pure |
| `domain/audit.py` | append-only, per-record HMAC; `verify()` locates first tampered seq | pure |
| `domain/replay.py` | orchestrator; assembles the job payload + audit | pure |
| `routers/*` + `models.py` | HTTP boundary, idempotency, dedup, tenant scoping, persistence | effectful (thin) |

## Data model (ERD)

```
policy_versions (immutable, write-once)          replay_jobs
  id (uuid, pk)                                    id (uuid, pk)
  merchant_id ─┐                                   merchant_id
  policy_version │ UNIQUE(merchant, version)       idempotency_key ─ UNIQUE(merchant, key)
  name           │                                 base_version, proposed_version
  document (JSON)─┘                                 verdict
  created_at                                        result (JSON: diff, constraint_results,
                                                        replay_summary, evaluations,
conversions                                            failclosed_proofs, verdict, _audit)
  id (uuid, pk)                                     created_at
  merchant_id
  dedup_key ─ UNIQUE(merchant, dedup_key)   ← conversiontype:confirmationref (VERIFIED keys)
  conversiontype, confirmationref, amount, currency, seq, created_at
```

Design choice: a replay job stores its **entire** result (evaluations + audit) as one JSON document. For an offline, immutable, reproducible analysis this is simpler and safer than normalizing 200 evaluation rows; the audit lives inside the same record it describes.

## Why replay is trustworthy
- **Determinism:** the evaluator is a pure function; sessions are seeded; no wall-clock. `run_replay(seed) == run_replay(seed)` (test_replay_deterministic).
- **No future leakage:** evaluation reads only the event-time attribute snapshot on the session.
- **Counterfactual honesty:** the missing-attribute FAIL isolates exactly the sessions the operator flip is *necessary* for (revert-the-operator check), not those widened by unrelated edits.

## Scale & performance (honest)
- **MVP:** synchronous, one transaction per replay (fine for a few hundred sessions; ~sub-second on SQLite).
- **At Rokt scale (10B+ transactions):** the request path becomes: enqueue job → async worker pulls via a **transactional outbox** → **batch** evaluations (the pure evaluator parallelizes trivially) → write the verdict once all batches commit → read sessions from a **read replica**. The invariants (idempotent job, atomic verdict, no partial results) are preserved. See FUTURE_VISION.md.

## What's real vs modeled (say it up front)
✅ Real: the deterministic engine, the 9 grounded constraints, idempotency, dedup, tamper-evident audit + verify, the full API, 28 tests, the wired console.
🟡 Modeled (clearly fictional, no fabrication): "Aurora Tickets" merchant, seeded synthetic sessions (mechanism not efficacy), the policy-as-code publish surface (mapped from Rokt's verified campaign/audience approval flow — see WORKFLOW.md).
❌ Not built (by design): live serving-path integration, real One Platform policy import, OPE, settlement math. All are documented, not faked.
