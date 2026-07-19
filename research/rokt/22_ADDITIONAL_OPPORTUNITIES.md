# 22 — Additional Opportunities (senior-engineer lens, 2025-26 direction)

**Date:** 2026-07-18 · Retrieval 2026-07-18 · Source: rokt.com/blog + rokt.com (public).
**Discipline:** framed as *adjacent* opportunities / hypotheses, never as gaps Rokt hasn't considered. Rokt is sophisticated; these are "where I'd want to explore," to be validated with a Rokt engineer.

## Fresh public signals (2025-26)
| Signal | Source | Quote/date |
|---|---|---|
| **Shopper Rewards by Rokt** (new loyalty product) | rokt.com/blog | "Shopper Rewards by Rokt" — announced **July 2026**; "What Really Keeps Shoppers Coming Back" |
| **Data quality for AI** | rokt.com/blog | "Why Your AI Agent Is Only As Good As Its Data" |
| **Transaction-Moment is the next phase of commerce media** | rokt.com/blog | "Commerce Media's Next Phase Will Be Won at the Transaction Moment™" |
| **SDK platform upgrade** | rokt.com/blog | "What Is SDK — Inside Rokt's Biggest Platform Upgrade" |
| **Incrementality Performance Standard** | rokt.com/blog | StockX case study; shift from conversion → incrementality |
| **Agentic commerce** direction | rokt.com | positioning around agent-driven commerce |
| **Gartner recognition** | rokt.com/blog | "2026 Gartner Market Guide for Retail and Commerce Media Networks" |

## Adjacent opportunities (hypotheses)

**A. Loyalty-safe change control (Shopper Rewards).**
As Rokt expands into loyalty/rewards, the same "a small policy edit silently changes who qualifies" risk now touches **reward economics** (who earns/redeems, at what rate). *Approach:* extend Threshold's pre-flight to reason about reward-eligibility and earn-rate changes before they ship — fail closed, isolate silently-widened cohorts, gate to a holdout. Directly compounds Threshold.

**B. Data-quality guardrails for decisioning ("your AI agent is only as good as its data").**
Rokt publicly ties AI performance to data quality. *Approach:* a deterministic **input-quality pre-flight** — schema drift, missing-signal spikes, stale identity, distribution shifts — that gates a *data* change the way Threshold gates a *policy* change: explainable, pre-release, no model in the loop. Same discipline, new surface. (Grok's hiring research independently flagged data quality + MLOps as a Rokt investment.)

**C. Agentic-commerce safety rails.**
As commerce becomes agent-driven, irreversible actions (purchases, cancellations) initiated by agents need the same **fail-closed + tamper-evident-evidence + human-on-irreversible-steps** discipline. *Approach:* a governance layer proving an agent flow can't harm checkout or produce an invalid financial state — Threshold's invariants applied to agent transactions.

**D. Incrementality-native change scoring.**
Rokt is standardizing on **incrementality** (Incrementality Performance Standard). *Approach:* make "will this change help *incremental* revenue?" a first-class, holdout-gated question in the pre-flight — never estimating lift offline (that's the holdout's job), but flagging changes whose only effect is to widen exposure without a plausible incremental case.

**E. Partner-integration safety for the SDK upgrade (DevEx).**
A "biggest platform upgrade" to the SDK means partners re-integrate. *Approach:* the kind of runnable, contract-tested, honest-limitations tooling I built here — a pre-flight that proves a partner's integration change preserves checkout and event integrity (ties to the verified Integration Monitor / `unprocessedRecords`).

## How these connect to Threshold
Threshold's core — *deterministic pre-flight, fail-closed, isolate silent widening, tamper-evident evidence, holdout-only verdict* — is a **reusable safety pattern**. A→E are the same pattern pointed at loyalty, data, agents, incrementality, and integrations. That's the "own a problem class, not a ticket" story: one disciplined idea, several surfaces, each validated before building.

## Honesty
Every item is a **starting hypothesis** from public signals. Rokt very likely has internal thinking on all of these. The value is the *approach* and the demonstrated ability to find an evidenced seam and own it end-to-end — not a claim about Rokt's roadmap.
