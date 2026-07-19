# Threshold — Future Vision

> The prototype proves the mechanism on synthetic data. This is the credible path from that prototype to a capability that would matter at Rokt scale — grounded in Rokt's **public** direction, and honest about what changes and what stays invariant.

## The one connected story (8 seconds, for anyone)
*A checkout-policy change is one edit away from silently charging the wrong customers the wrong thing. Threshold replays that change before it ships, proves it can't harm checkout or quietly widen who gets an offer, and only lets it through to a controlled test. As Rokt grows, the same gate runs on real traffic, at scale, in the deploy pipeline — turning "we reviewed it" into "we proved it."*

## Where Rokt is heading (VERIFIED, rokt.com)
- "**AI-powered Brain and scaled global Network** deliver unmatched relevance and results"; "**real-time relevance in the Transaction Moment**."
- Scale: **"33,000+ clients," "10B+ transactions annually," "17 countries."** The Transaction Moment "drives **over 90% of ancillary revenue potential**."
- Data direction: mParticle enables **"real-time relevance"** and **"instant activation"**; emphasis on **incrementality**, with **loyalty and AI-driven personalization** framed as emerging growth engines.

Implication for Threshold: as decisioning gets faster and more data-driven, the **blast radius of a bad policy change grows** — a silent missing-attribute widening at 10B+ transactions is expensive and hard to see. A deterministic pre-flight gets *more* valuable, not less, as the platform accelerates.

## The deterministic core stays boring (on purpose)
Every future milestone plugs into the **same pure engine** (`app/domain/*`). The engine never learns, never calls an LLM, never gains a serving-path dependency. That is the invariant that keeps the whole thing auditable and defensible. New capabilities attach at the **edges**.

## Roadmap

### Milestone A — Real-data replay (weeks)
- Swap the seeded generator for **anonymized, event-time production logs** (the exact feature snapshot the decision saw), so replay reflects the real session population — not synthetic shape.
- Import the **real One Platform policy/audience schema** instead of the modeled JSON; auto-derive the diff.
- *Plugs in at:* `sessions.py` (log adapter) and `policy.py` (schema loader). Engine unchanged.

### Milestone B — Scale-out to 10B+ transactions (months)
- **Foundation already implemented:** a real **transactional outbox** (`app/outbox.py`) writes fan-out events atomically with each replay job, and a background worker drains them with capped exponential backoff + jitter and dead-lettering (`FOR UPDATE SKIP LOCKED` on Postgres). This is the proof that the async story isn't hand-waving — see `tests/test_outbox.py` and `GET /replay-jobs/{id}/outbox`.
- Next: replace the synchronous single-transaction replay with: **enqueue → async worker → (outbox) → batched evaluation → single verdict commit**, reading sessions from a **read replica**. The pure evaluator parallelizes trivially (no shared state).
- Streaming ingestion of event-time snapshots via **Kafka/Redpanda**; horizontal worker pool.
- *Invariants preserved:* idempotent job, atomic verdict, no partial results, no future-information leakage.
- *Plugs in at:* the router/worker layer; `replay.py` becomes a job the worker calls. Engine unchanged.

### Milestone C — Pre-flight as a deployment gate (months)
- Wire Threshold into the **change-management pipeline** (doc 20's verified `Save and Edit → approval queue`): a proposed change must pass the gate **before** it enters the manual approval queue — reducing reviewer load and holdout waste.
- Optional **edge validation** of the fail-closed contract close to the serving surface; a **latency-budget check on live traffic** (grounded in the verified "sub-200ms" / 5000ms `fallback-timeout`).
- *Plugs in at:* a CI/CD hook + the approval-queue integration. Engine unchanged.

### Milestone D — Intelligence at the periphery (deferred, honest)
- **OPE pre-screen** (IPS/SNIPS/DR) that estimates a change's value from logged propensities **and can return `INSUFFICIENT_EVIDENCE` / refuse on thin support** — and can **never** replace the mandatory holdout (ADR-005). Interface designed now, implemented only with real logged propensities.
- **Drift monitoring** on the input distribution feeding decisions.
- **LLM only for plain-language change summaries** in the audit/changelog — off the critical path, degrades to nothing (ADR-002).
- *Plugs in at:* new optional modules behind the verdict; the deterministic verdict remains authoritative.

### Milestone E — Platform fit & growth-engine tie (vision)
- **Consent-aware historical replay:** prove a replayed decision **excludes signals no longer legally usable** (revoked consent / deletion) — a compliance proof, grounded in mParticle's consent state.
- Integrate with **Integration Monitor** (verified: Workato + event validation + `unprocessedRecords`) so a change that would push events into `unprocessedRecords` is flagged pre-release.
- Tie to Rokt's **growth engines**: a policy change that widens a **loyalty**-recognized or **incrementality**-measured audience gets the same missing-attribute + fail-closed scrutiny before it can affect those metrics.

## Integration points (how the future attaches without touching the core)

```
                         ┌─────────────── DETERMINISTIC CORE (never changes) ───────────────┐
                         │  evaluator · constraints · diff · failclosed · verdict · audit    │
                         └───────▲───────────▲──────────────▲───────────────▲───────────────┘
   real event-time logs ────────┘           │              │               └──── consent-aware replay (E)
   One Platform schema (A) ──────────────────┘              │
   async worker + outbox + Kafka (B) ──────────────────────┘
   CI/CD deploy gate + edge latency check (C) ───────────────────────────────── OPE pre-screen / drift (D)
```

## What changes at scale vs. what is invariant
| Changes | Invariant |
|---|---|
| sync → async workers + outbox + batching | idempotent job; atomic verdict; no partial results |
| synthetic → real anonymized event-time logs | pure, deterministic evaluation; no future leakage |
| SQLite → Postgres + read replicas + Kafka | tenant isolation; append-only tamper-evident audit |
| add OPE/drift/LLM-summary at the edges | deterministic verdict is authoritative; no LLM in the hot path |
| standalone → deploy-pipeline + approval-queue gate | positive verdict = holdout eligibility, never "safe to launch" |

## North-star & guardrails
- **North-star:** policy changes that reach a reviewer/holdout are *provably* structurally safe — zero silent eligibility-widenings and zero checkout regressions escape pre-flight.
- **Guardrails:** checkout preservation is 100% (never a metric to trade); the holdout remains mandatory; the core stays deterministic and LLM-free.

## The honest gap this vision does not close
Whether Rokt wants this as a **standalone surface** vs. folding the same checks into its existing internal review/CI is the open question (LIMITATIONS.md). The vision is framed as *"here is how the mechanism scales,"* not *"Rokt lacks this."* The prototype's job is to make the mechanism undeniable; the vision's job is to show it was built by someone who thinks past the demo.
