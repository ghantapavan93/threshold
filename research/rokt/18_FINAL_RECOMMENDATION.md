# 18 — Final Recommendation

**Date:** 2026-07-18
**Prepared for:** Pavankalyan Ghanta — Rokt Junior Software Engineer (NYC) proof-of-work
**Decision:** Recommend **WINNER = "Threshold"** (scoped/reframed), with **"Conversion-Safe" held as the pre-committed fallback**.
**Evidence base:** research reports `01`–`13` (12 evidence streams + red team), `14` (66 candidates), `15` (weighted scorecard), `16` (top five), `17` (top three).

---

## 1. Executive conclusion
Across 12 independent evidence streams, one opportunity shape survived scoring *and* an adversarial staff-engineer red team: **not a new decision engine (that is Rokt Brain's job and would duplicate it), but the governance, replay, change-safety, and money-integrity layer *around* the Transaction-Moment decision.** Scored on the weighted model, the highest-value candidates compose a single flagship rather than eight separate products. The red team confirmed the concept is a *credible adjacent opportunity* — conditional on scope discipline and a counterfactual-first framing — at an honest ~78% confidence.

## 2. What Rokt is building toward (evidence)
- The **Transaction Moment** (Selection → Cart → Payment → Confirmation) drives "90%+ of ancillary revenue"; Rokt returns "$7 of every $8 in value" to partners (`01`).
- Rokt Brain + Network decides "the right content or nothing"; **mParticle ($300M, 2025)** adds a real-time first-party CDP, moving Rokt **beyond checkout into full-lifecycle relevance** (`01`,`03`).
- Public technical surface is real and specific: **Cart API reserve→confirm→cancel** state machine, `Selection.on()` **PLACEMENT_FAILURE**, **Event & Audience API** (mParticle-routed), Integration Monitor, client-side PII encryption, consent flags (`02`).
- Competitive white space is the **integration of three ingredients** — embedded checkout serving surface × real-time first-party CDP × owned demand — which **only Rokt+mParticle plausibly holds** (`08`).

## 3. The strongest opportunity — THRESHOLD
**User:** (demo protagonist) a shopper who should see relevance-or-silence, not fatigue; (operator) a Rokt partner/ops user who governs policy and recovers from failure; (advertiser) net-new value via uplift targeting.
**Pain:** offer fatigue/irrelevance/bad-timing (`04`); operators carry change/experiment-interpretation risk (`05`); checkout must never be harmed and consent must be provably honored (`10`); advertisers pay outside agencies to prove net-new (`06`).
**Thesis:** *A change-safety & integrity layer for the Transaction Moment — every decision (incl. "show nothing") is replayable and tamper-evident; a policy change must pass off-policy evaluation **and** a mandatory online holdout before it ships; revenue-share is reconciled exactly once — so the decision engine stays deliberately boring and checkout is never at risk.*
**Why now / why Rokt / why Pavan / confidence:** see `17` §#1. **Honest overall confidence ~78%** (scoped + reframed), the gap being core-decisioning overlap with Brain, which the scoping sidesteps.

## 4. What the prototype visibly does (2-minute story)
One merchant (a movie-ticket partner), one shopper, one confirmation session:
1. Confirmation event arrives (Cart API `confirm`); the engine pulls a real-time profile signal.
2. Deterministic **feasible-set** applies hard rules (frequency cap, brand-safety, eligibility); the **boring reference engine** scores candidates by uplift-minus-fatigue.
3. Decision = {monetized offer | fulfillment-relevant help | **show nothing**}, with a grounded **"Why this / Why nothing"** panel. The decision is written to a **hash-chained ledger**.
4. **Inject a failure** (model timeout): the system **fails closed to "show nothing,"** checkout untouched, an incident is recorded, and **recovery + bit-for-bit replay** are shown.
5. Conversion fires → **idempotent** revenue event → **"$7 of $8" split** computed and reconciled against the Event & Audience API (a duplicate delivery is deduped live).
6. Operator proposes a policy change → **off-policy (SNIPS/DR) estimate with support checks**; on thin propensity the system **refuses** and requires an **online holdout**; the approved change is **versioned + audited**.
Outcome shown: predicted **net-new value per session under a trust/fatigue guardrail**, with primary conversion provably never degraded.

## 5. Why senior engineers may care (technical conversation surface)
Idempotency at an irreversible money boundary; hash-chained/HMAC tamper-evidence + replay determinism; off-policy evaluation *and its failure modes* (support/overlap, propensity clipping, SNIPS vs IPS variance, DR); calibration (isotonic vs Platt); contextual bandit vs full RL; fail-closed state machine; exactly-once revenue reconciliation vs at-least-once delivery; consent/DSR enforcement as signed artifacts; what changes at internet scale.

## 6. Why this is not a clone
- **Rokt Brain:** the engine is deliberately boring; the product is the change-safety/replay/reconciliation layer, not decisioning (`13`).
- **mParticle Audience Agent / NBA / Predictive Audiences:** activate audiences downstream; Threshold governs the *sub-second decision + settlement*, not audience building (`03`).
- **Rebuy Monetize:** rents Fluent demand, Shopify-only, confirmation-page-only, thin data; no change-safety/replay/reconciliation (`08`).
- **Klarna/Afterpay:** own-app inventory, not the merchant's checkout (`08`).
- **Optimizely/Statsig/LaunchDarkly/Eppo:** software experimentation on internal metrics; Threshold's OPE is on the *offer policy* from logged bandit feedback and is holdout-gated (`08`,`09`).

## 7. Architecture preview
`CUSTOMER → PARTNER CHECKOUT → confirmation event (Cart API) → Threshold decision service (FastAPI) → [feasible-set → reference rank → decide/serve, fail-closed] → decision ledger (hash-chained, Postgres) → outbox worker (backoff/jitter/DLQ) → revenue-share reconciliation vs Event & Audience API → operator console (Next.js): shopper simulator, "Why" panel, incident/replay timeline, off-policy change-review, consent receipts.` LLM sidecar (grounded "why" + creative drafts) is off the hot path. Reuse map in `12`.

## 8. Frontend vision
A restrained, editorial, Rokt-adjacent (not copied) operator console. Wow moments: the **"Why this / Why nothing" provenance panel**; the **live failure→fail-closed→replay timeline**; the **off-policy change-review screen** that *refuses* an unsafe change; the **revenue-share reconciliation view** deduping a duplicate in real time. Full designed states (loading/empty/error/permission), a11y-first, mobile-aware, screenshot-ready.

## 9. Backend depth
Typed contracts; idempotency keys at the boundary; transactional outbox + DLQ; hash-chained + HMAC audit with a verifier; deterministic feasible-set as the single enforcement point; exactly-once revenue reconciliation; fail-closed state machine; replay determinism; scenario-fixtures-as-tests; real-Postgres concurrency tests; one-command `verify` E2E (happy + failure paths). Evaluation: offline OPE on Open-Bandit data + a simulated online holdout; drift monitor; calibration diagrams.

## 10. AI justification (and prohibition)
AI is used where it earns its place and nowhere else (`09`). **Classical/deterministic core** (feasible-set, bandit/uplift reference scoring, OPE, calibration, drift) — LLMs are *decorative and harmful* in the real-time hot path. **LLM at the periphery only** — grounded, guardrailed "why" rationale and creative-copy drafts for human approval — and the product is **fully useful with the LLM off.** Deterministic logic is the *correct answer* (not a fallback) for money, eligibility, hard constraints, audit truth, and rollback.

## 11. Top alternatives rejected
`16`/`17`: **Conversion-Safe circuit breaker** (WEAK standalone — no AI necessity — but the junior-safest, kept as fallback and largely a subset of the winner); **Catalog EDI reconciliation console** (WEAK — another dashboard, closest to re-skinning Dreamship); **Native incrementality** (strong but analytics-leaning, best ideas folded into the winner). 63 others eliminated for duplication, private-data dependence, rejected shapes, or decorative AI (`15`).

## 12. Risks and unknowns (candid)
- **Core overlaps Brain** — must hold the counterfactual/change-safety framing or it reads as generic. This is the honest reason confidence is ~78%, not higher.
- **Depth defense** — the OPE/calibration/bandit choices must be genuinely defensible; if not, ship the fallback (#2).
- **Synthetic data** — demonstrates mechanism, not Rokt-scale efficacy; state this honestly.
- **Scope creep** — six spines is a lot; enforce the 2-day → 1-week ladder and keep one golden path.

## 13. Build estimate
- **48-hour proof:** one confirmation session; feasible-set → decide {offer|nothing}; hash-chained decision ledger + replay; one injected failure → fail-closed → audited; idempotent conversion → revenue split.
- **1-week prototype:** + bandit/uplift reference engine on synthetic logged-bandit data; SNIPS/DR change-gate with support checks + online holdout; drift monitor; consent receipts; full operator console; `verify` E2E; scenario-fixtures-as-tests.
- **Production future vision:** a Transaction-Moment trust/governance/settlement layer around Brain at internet scale, with honestly-documented scale deltas.

## 14. Decision & gate
On the honest scale the scoped winner sits at **~78% overall confidence — marginally under the textbook 80% auto-select bar.** The entire gap is the core-decisioning overlap with Rokt Brain, which is exactly why the product is scoped to the governance/replay/change-safety/money-integrity layer where duplication-risk is lowest and evidence highest. Because the human owner has explicitly authorized proceeding, we proceed with the **scoped, counterfactual-first Threshold**, holding **Conversion-Safe** as the pre-committed fallback if a mock defense exposes decision-science depth gaps.

**WINNER: THRESHOLD (scoped).**
