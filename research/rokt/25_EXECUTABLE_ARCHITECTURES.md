# 25 — Executable Architectures for the Six Builder Ideas

**Date:** 2026-07-18 · **Author lens:** senior-architect / proof-of-work for a Rokt Junior SWE application.
**Purpose:** For each of the six "executable ideas" the `/builder` page pitches, give a *buildable* architecture — deep enough that a Rokt engineer nods, honest about what is assumed. Each reuses Threshold's real, shipped patterns where they fit (deterministic core, transactional outbox, HMAC audit, OPE support-guard).

**Labeling (carried from the research corpus):**
- `[VERIFIED-PUBLIC]` — stated in Rokt's public docs / blog, cited in `research/rokt/*`.
- `[REPO]` — already built and tested in this repository (file named).
- `[INFERENCE]` — reasoned from cited facts + standard domain knowledge.
- `[HYPOTHESIS]` — plausible, explicitly unverified, flagged for validation.

**No fabricated metrics.** The only numbers stated as fact are Rokt's public ones or this repo's test counts. Every performance target is labeled as a *budget/goal*, not a measured result.

---

## 0. The verified fact ledger these six are built on

Everything below reduces to a small set of public facts (full citations in `02_PUBLIC_ARCHITECTURE_MAP.md`, `20_CHANGE_MANAGEMENT_DEEPDIVE.md`, `09_AI_AND_DECISION_SCIENCE.md`, `22_ADDITIONAL_OPPORTUNITIES.md`):

| Fact | Label | Used by |
|---|---|---|
| Transaction Moment = cart→confirmation decisioning; "maximizes relevance through AI prediction"; internal ranking not public | `[VERIFIED-PUBLIC]` | 1, 4, 5, 6 |
| Cart API `/v1/*`: `reserve → release/confirm → confirmation/cancel`, auto-release on timeout; headers `rokt-api-key`, `rokt-tag-id` | `[VERIFIED-PUBLIC]` | 1, 4, 5 |
| `POST /v1/placements/any` — "are there placements to display?" (partners can short-circuit the offer stage) | `[VERIFIED-PUBLIC]` | 1, 4 |
| Interstitial wrapped in `<rokt-thank-you>`; init script "loads the SDK asynchronously with fallback error handling"; `PLACEMENT_FAILURE` is the documented unrecoverable-error event | `[VERIFIED-PUBLIC]` | 1, 4 |
| `fallback-timeout` ~5000ms on the thank-you element; sub-200ms real-time relevance is Rokt's public framing | `[VERIFIED-PUBLIC]` (brief) / `[INFERENCE]` on exact p99 | 1, 4, 5 |
| Save-and-Edit → **manual approval queue** (Rokt operations); "every upsell, creative, campaign, audience is submitted into an approvals platform and checked for compliance"; material changes re-trigger approval; some fields immutable | `[VERIFIED-PUBLIC]` | 2, 3 |
| Custom audience rules Rokt-staff-only; **Include/Exclude invert per-rule logic**; the CC-BIN missing-value divergence is verbatim (Threshold's centerpiece) | `[VERIFIED-PUBLIC]` | 2 |
| Experiments + **holdout tests**; Page Holdout ~5% control | `[VERIFIED-PUBLIC]` | 4, 6 |
| Integration Monitor (Workato + GA reconciliation + alerting); Event validation exposes `unprocessedRecords`; conversion dedup = `conversiontype`+`confirmationref` | `[VERIFIED-PUBLIC]` | 3, 5 |
| Event & Audience API `POST /v2/events` via mParticle (`s2s.us2.mparticle.com`); 202 accepted; ~270 batches/s, 256 KB max; backoff+jitter recommended | `[VERIFIED-PUBLIC]` | 5 |
| **Shopper Rewards by Rokt** (loyalty, announced Jul 2026); **Incrementality Performance Standard** (StockX case) | `[VERIFIED-PUBLIC]` | 2, 6 |
| Scale framing: 33,000+ clients, 10B+ transactions/yr, 17 countries; Transaction Moment "over 90% of ancillary revenue potential" | `[VERIFIED-PUBLIC]` | 5, 6 |
| Core-loop technique guidance: GBDT / contextual bandits / uplift / OPE dominate; **LLM decorative in the hot path** | `[VERIFIED-PUBLIC]`/`[INFERENCE]` (doc 09) | all |

**Honest boundary that governs all six:** Rokt's *internal* Brain architecture, model features, retraining cadence, and the exact serving-path SLA are **not publicly documented**. None of these designs claim to be what Rokt runs. They are *what I would build*, grounded in the public seams above, and each names the first thing I'd validate with a Rokt engineer.

---

## Reusable primitive library (the spine every idea shares)

Four patterns already exist in this repo and are lifted, not reinvented, across the six. This is the "own a problem class, not a ticket" thesis made concrete.

1. **Deterministic core** `[REPO: app/domain/*]` — a pure function of `(snapshot, policy) → Decision`. No I/O, no wall-clock, no randomness, no LLM. This is what makes any evaluation bit-for-bit replayable (`test_replay_deterministic`) and is the *only* place money/eligibility decisions are made. ADR-002 forbids an LLM anywhere on this path.
2. **Transactional outbox** `[REPO: app/outbox.py]` — fan-out events are `INSERT`ed in the **same transaction** as the authoritative write; a worker drains them with capped exponential backoff + jitter and dead-letters after `MAX_ATTEMPTS=5`, using `FOR UPDATE SKIP LOCKED` on Postgres so N workers drain concurrently. Guarantees "the side-effects happen iff the commit happened," at-least-once delivery, no dual-write hole.
3. **HMAC append-only audit** `[REPO: app/domain/audit.py]` — every decision step appends a record carrying a per-record HMAC; `verify()` locates the first tampered sequence number. Integrity, not truth (THREAT_MODEL). This is the evidence trail that turns "we reviewed it" into "here is the signed proof of what was decided and why."
4. **OPE support-guard** `[REPO: app/domain/ope.py]` — the *first gate* of any responsible off-policy pipeline: measure whether a change has enough affected support (`ess = changed_count`, `MIN_ESS=30`) and **refuse** (`refuses_estimate=true`) on thin support rather than emit a confident-but-meaningless lift number. Per ADR-005 it can *never* replace the mandatory holdout.

Two invariants sit above all six (from `TRANSACTION_INVARIANTS.md`):
- **Checkout independence + fail-closed.** The merchant checkout has zero synchronous dependency on the offer/decision path; any offer-side failure resolves to *No Offer Rendered* and checkout completes. An offer/reward is never produced on a failure path.
- **Holdout is the only causal mechanism.** A positive verdict is *eligibility for a controlled online holdout*, never "safe to launch."

---

## Idea 1 — Right-moment, trust-aware Transaction-Moment layer

> Decide *whether/when* to place an offer (including "show nothing"), scoring net-new value minus a fatigue penalty.

### Customer problem
On the confirmation page, showing an offer to a shopper who is fatigued, mid-cognitive-load, or low-propensity is a *negative*: it spends trust and attention for little revenue and can sour the merchant relationship. The interesting decision is not only *which* offer but *whether to place one at all, right now* — a "show nothing" that protects the moment. `[VERIFIED-PUBLIC]` Rokt already exposes exactly this seam: `POST /v1/placements/any` lets a partner "skip the upsell/cross-sell stage." I would make that skip *intelligent and trust-aware* instead of static.

### Component / dataflow architecture

**Request (hot) path — budget: a few ms of the offer path, strictly off the checkout path** `[INFERENCE on budget]`
```
confirmation page (<rokt-thank-you>, fallback-timeout ~5s)   [VERIFIED-PUBLIC]
        │  identify + context (customer type, loyalty tier, cart, UTM)  [VERIFIED-PUBLIC attrs]
        ▼
placement-gate service  ── "should we place at all, right now?"
  1. HARD eligibility/consent/brand-safety/frequency  → deterministic filter   [REPO pattern: constraints.py]
  2. fatigue state         → Redis counters (exposure count, last-seen, recent dismissals)  [INFERENCE]
  3. propensity + value    → GBDT p(engage)·E[value]  (calibrated)   [09: LTR/GBDT]
  4. net-value gate        → place iff  E[value | placement] − λ·fatigue_penalty > θ_show
        │                                              else → "show nothing"
        ▼
if place:  /experiences → Rokt Brain ranking (existing)   |   if not: return no-placement (like /placements/any = none)
```
- **Determinism is enforced at step 1 and step 4.** Steps 2–3 are *scores*; the **gate arithmetic** (`> θ_show`, the hard-constraint filter, the "show nothing" fallback) is a pure, auditable function of those scores. The score can be a model; the *decision to suppress* is deterministic and logged. This mirrors `constraints.py` (ML proposes a number, a deterministic rule decides).
- **AI/ML method:** a **calibrated GBDT** (LightGBM/XGBoost) for `p(engage)` and `E[value]` — the doc-09 "right tool for a tabular, <100ms, auditable problem"; **probability calibration** (isotonic) so `E[value]` is trustworthy in the threshold math; a **frequency-cap + time-decay fatigue model** (largely deterministic per doc-09 #13, with an optional learned decay refinement). **No LLM on this path** (ADR-002). LLM allowed only offline to enrich messy offer metadata into features (doc-09 #18, structured outputs).
- **Async path:** engagement/dismissal events → transactional outbox `[REPO: outbox.py]` → feature store update + label collection for retraining. Fatigue counters updated async; hot path only *reads* them.
- **Storage:** Redis for per-user fatigue counters (TTL'd); a Feast-style feature store `[HYPOTHESIS on Feast fit]` for offline features; the model artifact served via ONNX/Triton for low-latency scoring.

### Key invariants
- **Checkout independence / fail-closed** (top-level): if the gate service times out or errors → default to **"show nothing"** (the safe, trust-preserving default), never "show something." `[REPO pattern: failclosed.py]`
- **Suppression is auditable:** every "show nothing" writes a signed reason (`hard_fail:consent` | `fatigue` | `below_value_threshold`). `[REPO: audit.py]`
- **Calibration invariant:** `E[value]` must be calibrated before it enters the threshold, or the "net-new minus fatigue" comparison is meaningless (doc-09 #8).

### Scale / latency
- Score is a single GBDT eval + a Redis read → microsecond-to-low-ms class `[INFERENCE]`. The gate must fit inside the offer path with wide margin under the ~5s `fallback-timeout` and Rokt's sub-200ms framing; it must add **zero** synchronous cost to checkout.
- Fatigue counters are read-hot / write-async so the request path never blocks on write.

### Failure modes + fail-closed
| Failure | Behavior |
|---|---|
| Gate service timeout / model unavailable | **show nothing**; log `fallback:gate_unavailable` |
| Fatigue store (Redis) unreachable | treat as *maximally fatigued* → bias toward "show nothing" (conservative) `[INFERENCE]` |
| Calibration drift detected | fall back to a conservative fixed `θ_show`; alert |
| Consent flags (`noTargeting`/`noFunctional`) | deterministic hard-suppress, before any scoring `[VERIFIED-PUBLIC consent flags]` |

### Assumptions / what I'd validate first
- **[Validate first]** Does Rokt want "whether/when" as a *distinct pre-ranking gate*, or is suppression already folded into the Brain's ranking (a "null offer" candidate)? If the latter, this becomes a *feature* of ranking, not a service. This is the single biggest design fork.
- `[HYPOTHESIS]` that a fatigue penalty materially improves long-run trust/revenue — this is only knowable via a holdout, not offline.
- `[ASSUMPTION]` I have per-user exposure history durably enough to compute fatigue; if identity is thin/anonymous, fatigue degrades to per-session.

---

## Idea 2 — Loyalty-safe change control as Shopper Rewards grows

> Threshold's pre-flight generalized from *eligibility* policy to *loyalty/reward* state.

### Customer problem
`[VERIFIED-PUBLIC]` Shopper Rewards by Rokt launched Jul 2026. Loyalty introduces *economic* state: who earns, who redeems, at what rate, tier thresholds. The exact risk Threshold already isolates — **a one-operator edit silently widening who qualifies** — now touches money directly: a mis-set earn-rate or a flipped tier operator can silently over-issue rewards (a liability) or silently strip earned status (a trust and possibly compliance event). `[VERIFIED-PUBLIC]` Include/Exclude already "invert the logic for that particular rule," and material changes re-trigger approval — the same operator-flip surface Threshold was built around.

### Component / dataflow architecture
This is Threshold with a **loyalty-aware policy schema** and **two new constraint families**; the core is unchanged (that is the point — see FUTURE_VISION Milestone E).
```
proposed reward-policy change (earn-rate, tier threshold, eligibility rule)
        │
        ▼   POST /replay-jobs  (idempotency-key)   [REPO: routers/replay.py]
run_replay (PURE)                                  [REPO: domain/replay.py]
  1. load base + proposed immutable policy versions        [REPO: models.PolicyVersionRow]
  2. generate/replay event-time member snapshots (tier, points, spend)   [REPO: sessions.py adapter]
  3. evaluate(base) vs evaluate(proposed) per member       [REPO: evaluator.py]
  4. diff → reward-risk tags (earn_rate_flip, tier_threshold_widened, redemption_widened)
  5. constraints (NEW, deterministic):
       • reward_economics_guard   — Σ projected earn under proposed vs base;
                                     block if silent over-issuance beyond a set band
       • tier_integrity_guard     — no member silently loses/gains tier via a
                                     missing-value flip (counterfactual isolation)   [REPO: constraints.py pattern]
       • redemption_eligibility_guard — missing-attribute widening on "can redeem"
  6. fail-closed proofs: a reward-path failure → no reward mutation, member state intact  [REPO: failclosed.py]
  7. verdict: BLOCKED / INSUFFICIENT_EVIDENCE / ELIGIBLE_FOR_HOLDOUT   [REPO: verdict.py]
  8. HMAC audit at every step                                          [REPO: audit.py]
  9. persist job; outbox fan-out to approval-queue + billing            [REPO: outbox.py]
```
- **Determinism / AI method:** *No model needed and none wanted.* Reward economics is exactly the doc-09 "hard constraints MUST be deterministic and auditable" case (#14). The **counterfactual isolation** that is Threshold's centerpiece — revert *just* the flipped operator and see which members' reward state changes *because of that edit* — transfers verbatim. LLM allowed only for a plain-language change summary in the audit (ADR-002, off-path).
- **Storage:** immutable `policy_versions` (write-once) already models this; add a `reward_snapshot` shape to the session generator/log adapter (Milestone A pattern). The whole job result + audit persists as one JSON document `[REPO: replay_jobs]`.

### Key invariants
- **Effectively-once reward mutation over at-least-once delivery** — reuse the conversion dedup invariant (`conversiontype:confirmationref`) applied to earn/redeem events so a replayed delivery never double-issues points. `[REPO invariant #6]`
- **No silent economic widening:** a change that increases projected issuance or widens redemption eligibility without an operator explicitly intending it → BLOCKED.
- **Immutable versions + tamper-evident audit** carry over unchanged.

### Scale / latency
- Pre-release/offline, exactly like Threshold — *not* on the serving path, so latency is generous. At loyalty scale the async story is identical to Idea 5: enqueue → worker → batched member-snapshot evaluation → single verdict commit from a read replica (FUTURE_VISION Milestone B, already scaffolded by the outbox).

### Failure modes + fail-closed
| Failure | Behavior |
|---|---|
| Member-snapshot source unavailable | job cannot certify → **INSUFFICIENT_EVIDENCE** (never a pass) |
| Reward-mutation service failure at runtime | no reward written, member state unchanged, `fallback_reason` logged |
| Projected-issuance calc ambiguous | fail closed → BLOCKED, route to human |

### Assumptions / what I'd validate first
- **[Validate first]** The real Shopper Rewards policy/edit surface and whether earn-rate/tier edits flow through the *same* Save-and-Edit → approval queue as campaigns (documented for campaigns/audiences; loyalty mapping is `[INFERENCE]`).
- `[ASSUMPTION]` "projected issuance" can be computed from a representative member population snapshot; if reward economics depend on future behavior, the guard becomes a *bound*, not a point estimate — I'd state that honestly.
- `[HONEST GAP]` Whether Rokt wants this standalone vs. folded into existing loyalty QA — same open question as Threshold (LIMITATIONS.md).

---

## Idea 3 — Team dev-velocity loop that ships fast without non-determinism in money/eligibility

> Agentic coding + PR-review agents + eval gates + LLM observability — speed *with* a guarantee that no LLM leaks into the correctness path.

### Customer problem
The 2026 default is "wrap it in an LLM," and it is easy to let non-determinism creep into money/eligibility code while chasing velocity. The team needs to move fast (agentic coding, AI PR review) *and* mechanically prove that the correctness core stays deterministic and LLM-free — the discipline Rokt's regulated, auditable decisioning demands (doc-09 #14; ADR-002).

### Component / dataflow architecture (a CI/CD pipeline, not a serving system)
```
dev + agent (Claude Code / Cursor)          ── author change
        │  PR
        ▼
CI pipeline (GitHub Actions):
  Stage A  unit/integration/property tests   ── includes the 38 Threshold tests   [REPO: tests/]
  Stage B  DETERMINISM FITNESS GATE (the load-bearing one):
             • AST scan: no llm/openai/requests/random/datetime.now import
               reachable from app/domain/*   → fail the build   [REPO: enforced-in-repo pattern, BUILDER_ROLE.md]
             • replay-equality test: run_replay(seed) == run_replay(seed)   [REPO: test_replay_deterministic]
  Stage C  LLM-artifact EVAL GATES (only for the *peripheral* LLM uses):
             • promptfoo / Ragas suites on prompts (change-summaries, metadata enrichment)
             • gate on schema-validity rate + groundedness, block regressions   [09 #17/#18]
  Stage D  AI PR-review agent  ── advisory comments; NEVER an auto-merge authority on money/eligibility diffs
        │  merge
        ▼
runtime: LLM observability (Langfuse + OpenTelemetry traces) on the PERIPHERAL LLM calls only
```
- **Determinism is enforced in Stage B** — an **AST-based fitness function** that fails the build if any non-deterministic import (LLM, network, clock, RNG) becomes reachable from the domain package. This is the mechanical guarantee: correctness *cannot* depend on a model because CI won't let it compile-through. `[REPO: this is the "ast-based fitness test enforces no LLM in the correctness path" claim in BUILDER_ROLE.md]`
- **AI/ML method:** the AI here is *tooling*, not decisioning — agentic coding, an LLM PR reviewer, promptfoo/Ragas eval harnesses, DSPy for prompt optimization, Langfuse/OTel for traces. All of it lives *around* the deterministic core, never inside it.
- **Storage / observability:** trace store (Langfuse) for LLM calls; eval results as CI artifacts gating the merge; standard OTel spans for the peripheral services.

### Key invariants
- **Determinism boundary is machine-checked, not convention:** the AST gate is the invariant. A human forgetting is not enough to break it.
- **AI review is advisory on the money path:** an agent can *comment*, never *approve-and-merge* an eligibility/settlement diff. Human-on-irreversible-steps (Efficast's "LLM proposes, never actuates" pattern, BUILDER_ROLE.md).
- **Eval gates are regression gates:** a prompt change that drops schema-validity/groundedness below threshold fails CI just like a broken test.

### Scale / latency
- CI-time concern, not serving. Scales with team size and PR volume; eval suites parallelize; the AST gate is near-instant. The value is *throughput of safe changes*, not request latency.

### Failure modes + fail-closed
| Failure | Behavior |
|---|---|
| Someone adds an LLM/network import into `app/domain/*` | **build fails** at Stage B (fail-closed by construction) |
| Prompt eval flaky / provider down | eval gate fails closed → PR blocked until green, not merged on a skip |
| AI reviewer hallucinates a "fix" | advisory only; human review is the gate on correctness diffs |

### Assumptions / what I'd validate first
- **[Validate first]** Rokt's existing CI and where the deterministic/ML boundary is currently drawn — this loop should *plug into* their pipeline, not replace it (same "standalone vs. fold-in" honesty as Threshold).
- `[ASSUMPTION]` The correctness core is separable enough to fence with a static-analysis rule. In a codebase where ML scoring and hard rules are deeply interleaved, the fence line needs negotiation.
- `[HYPOTHESIS]` promptfoo/Ragas thresholds map cleanly onto Rokt's peripheral-LLM uses; I'd calibrate them against real prompts before gating on them.

---

## Idea 4 — Own a Transaction-Moment feature end-to-end, from customer problem to the holdout that proves it

> The full lifecycle: idea → prototype → tests → ship → measured lift. Not the happy path only.

### Customer problem (worked example: a "smart suppression / right-moment" placement improvement)
Take Idea 1's "show nothing when net-value is negative" and own it *cradle to grave*. The point of this idea is the **ownership discipline**, so the architecture here is the *lifecycle machinery* around a feature, not a new algorithm.

### Component / dataflow architecture (feature lifecycle, end to end)
```
1. PROBLEM  ── customer/merchant pain, framed from a real seam (/placements/any, PLACEMENT_FAILURE)  [VERIFIED-PUBLIC]
2. DESIGN   ── deterministic gate + calibrated GBDT score (Idea 1); write the invariants FIRST  [REPO: TRANSACTION_INVARIANTS.md]
3. BUILD    ── FastAPI service · Next.js operator view · Postgres · Redis · outbox · OTel   [REPO stack]
4. TEST     ── property tests (determinism), fail-closed proofs, N+1 guards, real-DB concurrency
5. SHIP     ── behind a flag; wired into the confirmation flow WITHOUT touching checkout's critical path
6. MEASURE  ── Page Holdout (~5% control): treatment (smart suppression) vs control (status quo)   [VERIFIED-PUBLIC holdout]
              → report net-new revenue/trust delta, NOT a claimed lift
7. RECOVER  ── rollback path, dead-letter drain, drift alert → back to step 2
```
- **The holdout is the proof, and it is the *only* proof.** No offline number is allowed to stand in for causal lift (ADR-005). The feature ships to *eligibility for the holdout*; the holdout decides.
- **AI/ML method:** as Idea 1 (calibrated GBDT + deterministic gate). What is new here is the *measurement architecture*: treatment/control assignment, guardrail metrics (checkout completion must not regress — a hard guardrail, never a metric to trade), and a pre-registered success metric.
- **Storage:** experiment assignment + outcomes; conversion signals deduped on `conversiontype:confirmationref` `[VERIFIED-PUBLIC]` so the measurement itself is effectively-once.
- **Async path / observability:** outbox fan-out of experiment events to analytics; OTel traces across the feature; Integration-Monitor-style reconciliation (Idea 5) to catch measurement drift.

### Key invariants
- **Checkout completion is a hard guardrail, never a KPI to trade.** If treatment regresses checkout, the experiment auto-stops. `[REPO: guardrail from FUTURE_VISION]`
- **Holdout integrity:** assignment is stable per user, logged, and tamper-evident; no peeking-driven early calls.
- **Effectively-once outcome counting** via the verified dedup keys.

### Scale / latency
- The feature obeys Idea 1's latency budget on the hot path. The measurement layer is async/offline. Nothing about proving lift is allowed onto the serving critical path.

### Failure modes + fail-closed
| Failure | Behavior |
|---|---|
| Feature errors in treatment | fail-closed to control behavior (show-nothing or status quo), checkout unaffected |
| Assignment service down | default to control; log; do not contaminate the holdout |
| Guardrail (checkout) regresses | auto-halt experiment, roll back flag |
| Conversion double-count | dedup key prevents it `[VERIFIED-PUBLIC]` |

### Assumptions / what I'd validate first
- **[Validate first]** Access to run a real Page Holdout and the guardrail-metric definitions Rokt uses (checkout completion, downstream retention). The whole idea's credibility rests on the holdout being real, not simulated.
- `[ASSUMPTION]` I can instrument treatment/control without touching the merchant's checkout path — consistent with the verified async init + `<rokt-thank-you>` boundary, but to be confirmed per integration.
- `[HONEST]` On synthetic data I can prove the *mechanism* and the *measurement design*; I cannot prove a *lift number* — and I will not claim one.

---

## Idea 5 — Scale decisioning to billions

> enqueue → async worker → transactional outbox → batched evaluation → single commit from a read replica; sub-200ms p99; drift monitoring.

### Customer problem
`[VERIFIED-PUBLIC]` 10B+ transactions/yr, 17 countries, sub-200ms real-time relevance framing. A synchronous, single-transaction evaluation (fine for the Threshold MVP's few-hundred sessions) does not survive that. The blast radius of any correctness bug also grows with scale (FUTURE_VISION). The task: scale *without* losing idempotency, atomic verdicts, no-partial-results, or no-future-leakage.

### Component / dataflow architecture (this is FUTURE_VISION Milestone B, made concrete)
```
ingress: event-time snapshots  ── Kafka/Redpanda topic (partitioned by merchant/user)   [09/FUTURE_VISION]
        │
        ▼
enqueue job  ── idempotency-key; job row = PENDING                         [REPO: routers/replay.py idempotency]
        │
        ▼
async worker pool (horizontal; stateless; pure evaluator parallelizes trivially — no shared state)
  read sessions from a READ REPLICA (never the primary)                    [FUTURE_VISION]
  BATCH evaluations  ── the pure evaluator maps over batches (Ray/worker pool)  [REPO: evaluator.py is pure]
  accumulate per-batch results in the worker, commit NOTHING until all batches done
        │  all batches complete
        ▼
SINGLE verdict commit (one transaction): write verdict + audit + outbox events atomically  [REPO: outbox.py]
        │
        ▼
transactional outbox worker drains fan-out (analytics/billing/partner) with backoff+jitter,
  FOR UPDATE SKIP LOCKED so N workers drain concurrently, dead-letter after 5 attempts   [REPO: outbox.py]
        │
        ▼
drift monitoring sidecar: PSI/KS on the input feature distribution feeding decisions (Evidently)  [09 #20/#21]
```
- **Determinism at scale:** the evaluator is pure, so batching and parallelism are *safe by construction* — `run_replay(seed) == run_replay(seed)` regardless of how the work is sharded (`test_replay_deterministic`). Order of batch completion cannot change the verdict.
- **Atomic verdict / no partial results:** nothing is externally visible until the single final commit; the outbox guarantees fan-out happens iff that commit happened (no dual-write hole). `[REPO: outbox.py]`
- **AI/ML method:** the *decisioning* model (GBDT/bandit) is served via ONNX/Triton/vLLM-class low-latency serving for the hot path; the *scale machinery* here is systems, not ML. Drift detection is deterministic statistics (PSI > 0.2 threshold, KS), not a model (doc-09 #21).
- **Storage:** primary Postgres for the authoritative job/verdict + immutable policy versions; **read replicas** for session/feature reads; Kafka for ingestion; a feature store for online features; Redis for counters. SKIP-LOCKED outbox on Postgres.

### Key invariants (preserved from MVP → scale — the whole point)
- **Idempotent job** (repeat key → same job, never re-run) `[REPO invariant #7]`.
- **Atomic verdict, no partial results.**
- **No future-information leakage** (evaluate only the event-time snapshot) `[REPO invariant #4]`.
- **Effectively-once financial state** over at-least-once Kafka delivery (dedup on the verified keys) `[REPO invariant #6]`.
- **Tenant isolation** across all replica reads `[REPO invariant #11]`.

### Scale / latency
- Hot-path *decisioning* targets Rokt's sub-200ms framing (budget, not a measured claim `[INFERENCE]`) via compact GBDT/bandit serving; the *replay/certification* path (Threshold-style) is async and generous.
- Horizontal worker scaling is linear because the core is stateless and pure. Read replicas absorb the read fan-out; the primary only takes the single verdict commit + outbox insert.
- Backpressure: Kafka partitions + a bounded worker pool; jobs queue rather than overload the primary.

### Failure modes + fail-closed
| Failure | Behavior |
|---|---|
| Worker dies mid-batch | job stays PENDING (nothing committed); another worker re-runs deterministically — safe because pure |
| Downstream fan-out fails | outbox retries w/ backoff+jitter; dead-letters after 5, alerts; **authoritative verdict already durable** |
| Read replica lag / stale snapshot | evaluate event-time snapshot only (no "current profile" join), so replica lag cannot cause future-leakage; if snapshot missing → INSUFFICIENT_EVIDENCE |
| Input drift (PSI spike) | drift sidecar alerts; does not silently keep serving a degraded model |
| Primary DB pressure | only the final commit hits primary; reads are on replicas → primary load bounded |

### Assumptions / what I'd validate first
- **[Validate first]** Whether Rokt's real serving path is decision-per-request (hot) vs. the certification/replay batch path (async) — this design cleanly separates the two, but the exact boundary and the real p99 budget are internal. I'd confirm before committing the topology.
- `[ASSUMPTION]` event-time snapshots are available in the log/stream with the exact features the decision saw (FUTURE_VISION Milestone A dependency).
- `[HONEST]` The outbox + backoff + dead-letter + SKIP-LOCKED path is *already built and tested* (`tests/test_outbox.py`, `GET /replay-jobs/{id}/outbox`); the Kafka/replica/Ray layer is designed, not built — I would not claim otherwise.

---

## Idea 6 — Incremental-revenue features targeted at persuadables, gated by a real holdout

> Uplift on persuadables; an off-policy pre-screen that *refuses on thin support*; never a claimed lift, always a measured one.

### Customer problem
`[VERIFIED-PUBLIC]` Rokt is standardizing on **incrementality** (Incrementality Performance Standard, StockX case). Targeting shoppers who would convert anyway wastes offers and inflates vanity metrics; the money is in **persuadables** — shoppers whose behavior the offer *changes*. And any offline estimate of a new targeting policy is dangerous if it is emitted confidently on thin data. The discipline: model uplift, pre-screen with OPE that can *refuse*, and let the holdout be the only thing that certifies lift.

### Component / dataflow architecture
```
OFFLINE (targeting model build):
  uplift/CATE model (causalml / scikit-uplift; T-learner or causal forest)
     ── trained on treatment/control outcomes from prior holdouts   [09 #4]
     ── evaluated with Qini/AUUC, NOT accuracy                       [09 #4]
     ── scores each shopper's INCREMENTAL response, → persuadable segment

PRE-SCREEN (before any online test — the refuse-able gate):
  OPE support-guard (deterministic)                                  [REPO: app/domain/ope.py]
     ess = affected/changed count;  coverage = changed/total
     support ∈ {NONE, THIN, SUFFICIENT};  refuses_estimate if < MIN_ESS(30)
     → on THIN/NONE support: REFUSE to emit an estimate, route to holdout only  [ADR-005]
  (future, with logged propensities) full IPS→SNIPS→DR estimator behind the SAME guard  [09 #6]

ONLINE (the only causal proof):
  Page Holdout ~5% control: persuadable-targeted treatment vs control   [VERIFIED-PUBLIC]
     → measured incremental revenue = the NET-NEW gap, reported honestly (no hockey-stick)
```
- **Determinism / refusal is enforced in the pre-screen.** The support-guard is pure and already built (`ope.py`): it computes effective support and **refuses** (`refuses_estimate=true`) rather than emit a confident-but-meaningless number on thin support. This is the doc-09 #6 failure mode ("insufficient support → divide-by-zero / 100× variance from tiny propensities") turned into a hard gate.
- **AI/ML method:** **uplift modeling / CATE** (the doc-09 "statistical backbone of incrementality," #4) — no LLM, no accuracy metric, Qini/AUUC only. **OPE (IPS/SNIPS/DR)** as the pre-screen *when logged propensities exist*, always behind the refuse-able support-guard. Calibration + propensity scoring as supporting pieces (#8, #9).
- **Storage:** prior-holdout outcome tables (treatment/control/outcome/features) for uplift training; logged contexts+actions+rewards (+propensities if available) for OPE; experiment assignment + outcomes for the holdout.
- **Async path:** outbox fan-out of experiment + conversion events; dedup on `conversiontype:confirmationref` so incremental-revenue accounting is effectively-once. `[VERIFIED-PUBLIC]`

### Key invariants
- **Holdout is the only causal mechanism** — OPE never replaces it (ADR-005). A positive pre-screen = *eligible for holdout*, never "proven lift."
- **Refuse-on-thin-support** — no lift number is emitted below `MIN_ESS`. `[REPO: ope.py]`
- **Honest measurement** — report the treatment-minus-control *net-new gap*, never a raw treatment curve as if it were incremental.
- **Effectively-once revenue counting** via the verified dedup keys.

### Scale / latency
- Uplift scoring is cheap and precomputable (doc-09 #4) → persuadable segments are batch-materialized, read-hot at decision time. OPE and holdout analysis are fully offline. Nothing here is on the serving critical path.

### Failure modes + fail-closed
| Failure | Behavior |
|---|---|
| Thin/absent affected support | support-guard **refuses** to estimate; holdout-only path `[REPO: ope.py]` |
| Tiny propensities → variance blow-up (when OPE runs) | SNIPS/clipping + the guard; refuse rather than report a 100×-weighted artifact `[09 #6]` |
| SUTVA violation / cannibalization across offers | flagged as a known uplift risk (doc-09 #4); holdout measures net marketplace effect, not per-offer fiction |
| Uplift model degradation | drift monitor on input distribution; re-validate on next holdout |

### Assumptions / what I'd validate first
- **[Validate first]** Whether Rokt exposes **logged action propensities**. Without them, the full IPS/SNIPS/DR estimator cannot run and only the deterministic support-guard is honest — which is exactly why the repo ships the guard, not a fake estimator (ADR-005). This is the load-bearing assumption of the whole idea.
- `[ASSUMPTION]` prior holdouts provide enough treatment/control data to train a credible uplift model; if not, the first holdout *is* the training data and the model is v2.
- `[HONEST]` On synthetic RCTs I can demo Qini curves and the refuse-on-thin-support gate convincingly (doc-09 #4/#6, HIGH feasibility); I cannot and will not claim a real incremental-revenue number without Rokt's holdout.

---

## Cross-cutting honesty ledger (what is real vs. designed vs. assumed)

| Layer | Real in this repo `[REPO]` | Designed here (not built) | Load-bearing assumption |
|---|---|---|---|
| Deterministic core | evaluator, constraints, diff, failclosed, verdict, audit, replay; 38 tests | loyalty/fatigue/uplift-specific constraint families | correctness core is fence-able from ML |
| Async / scale | transactional outbox + worker + backoff + dead-letter + SKIP-LOCKED (`test_outbox.py`) | Kafka ingestion, read replicas, Ray batch pool | event-time snapshots are available with the features the decision saw |
| Determinism guarantee | idempotency, dedup, replay-equality, immutable versions | AST fitness gate wired into a real CI (described in BUILDER_ROLE.md) | the ML/rule boundary is statically separable |
| Evidence | HMAC append-only audit + `verify()` tamper localization | signed change-summaries via off-path LLM | integrity ≠ truth (THREAT_MODEL) |
| Causal / incrementality | OPE support-guard that refuses on thin support (`ope.py`) | full IPS/SNIPS/DR estimator; uplift model | Rokt exposes logged propensities; a real Page Holdout is runnable |
| Serving path | *nothing* — Threshold is deliberately off the live path | right-moment gate, GBDT scoring, low-latency serving | the sub-200ms budget and the gate-vs-ranking boundary |

**One sentence for a Rokt engineer:** *Every one of these six is the same disciplined spine — a deterministic, auditable core with ML strictly at the edges, fail-closed on every failure, and a mandatory holdout as the only thing allowed to claim causal lift — pointed at six different Transaction-Moment surfaces, each honest about the one internal fact I'd need to confirm before building it for real.*
