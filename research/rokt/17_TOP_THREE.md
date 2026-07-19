# 17 — Top Three (Post-Red-Team)

**Date:** 2026-07-18 · **Inputs:** `14` (66 candidates), `15` (weighted scorecard), `13` (red team). Confidence is evidence-based, never certainty; nothing here claims Rokt lacks an internal version.

The independent scorecard (`15`) and my synthesis (`16`) converged: the top of the table is **not eight products but one flagship** — a *confirmation-moment decision-and-money-integrity layer* (feasible-set → boring reference rank → OPE-gated + holdout-gated rollout → fail-closed serving → tamper-evident decision provenance → idempotent revenue-share reconciliation), with verifiable consent receipts as the privacy wedge and LLMs confined to the periphery. The Red Team (`13`) then told us **how to scope and frame it** so it isn't dismissed as "Rokt Brain re-skinned."

---

## #1 (WINNER) — THRESHOLD — Transaction-Moment Change-Safety & Integrity Layer
*Scoped/reframed per Red Team. Working name; alts: "Steward", "Ledger".*

**One sentence:** A governance layer for the Transaction Moment that makes every offer decision — *including "show nothing"* — replayable and tamper-evident, lets operators evaluate a policy change **off-policy AND behind a mandatory online holdout** before it ships, and reconciles the resulting revenue-share **exactly once** — so the decision engine stays deliberately boring and the merchant's checkout is never at risk.

**What it is NOT:** not "AI checkout decisioning," not a better Rokt Brain, not a recommender. The reference decision engine is intentionally simple and deterministic; the *product* is the change-safety + replay + reconciliation + fail-closed layer around it.

**Composed spines (scorecard IDs):**
- **C51 Fail-closed serving (89.5)** — every decisioning/render failure degrades to "show nothing"; checkout never blocked/delayed/diverted; audited.
- **C45 Tamper-evident, replayable decision ledger (87.8)** — hash-chained "why this / why nothing" per decision; bit-for-bit replay of any historical decision.
- **C42 Off-policy-safe change gate (80.8)** — a proposed policy change must pass SNIPS/Doubly-Robust estimation **with explicit support/overlap checks** and is **still gated behind an online holdout**; the system *refuses to estimate* when propensity support is insufficient (directly answers Red-Team objection #2).
- **C54 Idempotent revenue-share reconciliation (88.0)** — offer/conversion/revenue events recorded exactly once; computes the "$7 of $8" partner split; reconciled against the Event & Audience API; tamper-evident.
- **C05 Deterministic feasible-set (80.6)** — hard caps/eligibility/brand-safety/frequency as the single enforcement point (~0 violations, provenance per decision).
- **C33 Verifiable consent/DSR receipts (81.0)** — privacy wedge: signed, provable "blocked reuse of deleted data" artifacts.
- **Reference objective:** uplift-minus-fatigue scoring on the reference engine — demonstrates decision-science literacy, explicitly framed as a *reference*, not a claim to beat Brain.
- **LLM periphery only (C60/C61):** grounded, guardrailed "why" rationale + creative-copy drafts for human approval; **OFF in the hot path**; product fully useful with LLM disabled.

**Evidence chain:** fatigue/timing/"show nothing" (`04`,`01`,`10`); checkout-sacred/fail-closed + consent enforcement (`10`); operator change/experiment-interpretation pain (`05` Pain 4); "$7 of $8" + closed-loop measurement (`01`); classical decision-science + OPE all rated HIGH-feasibility on synthetic Open-Bandit data (`09` Part D) — this is nearly report 09's own recommended flagship prototype.

**Why Rokt / not a clone:** requires the uncontested triad — decision *at the merchant's confirmation moment* × *real-time first-party data* × *owned demand* (`08`). Rebuy rents Fluent demand (Shopify-only); CDPs "end at the pipe"; Klarna/Afterpay live in their own apps; mParticle Audience Agent/NBA activate downstream, not the sub-second decision + change-safety + reconciliation. The novelty is the **counterfactual change-safety + replay + money-integrity** layer, which no competitor exposes.

**Why Pavan (authentic fit, `12`):** idempotency at the irreversible boundary, transactional outbox + DLQ, hash-chained/HMAC audit, deterministic-engine-decides/LLM-only-explains + "why" UI, reconciliation state machine, replay/recovery — a near-1:1 reuse map. The visible **failure→recovery→audit** story is his signature and Rokt's top hiring signal (`07`).

**Honest confidence (Red Team, scoped + reframed): ~78% overall** — adjacent-opportunity ~70%, non-duplicative ~70% (money-integrity + change-safety spines are low-duplication and high-evidence), junior-defensible ~75% given the deliberately-boring core. The ~22% gap is almost entirely the *core-decisioning overlap with Rokt Brain*, which the scoping explicitly sidesteps. **Marginally under the textbook 80% auto-select bar; see `18` for the honest reconciliation and the human go-ahead.**

**Three objections Pavan must answer crisply (from `13`):**
1. *"Constrained recommender + audit log = Brain re-skin."* → The engine is deliberately boring; the product is counterfactual change-safety + replay + reconciliation, not decisioning.
2. *"OPE lets you skip A/B — reckless."* → No: OPE is a *pre-filter* with support/overlap checks that refuses on thin propensity; an online holdout is still mandatory. (Shows he knows `09` §6 failure modes.)
3. *Depth:* SNIPS vs IPS (variance/self-normalization), isotonic vs Platt calibration, contextual bandit vs full RL — the build + docs must make these defensible.

**Smallest honest version (2-day):** one confirmation session; deterministic feasible-set → decide {offer|nothing}; hash-chained decision ledger with replay; one injected model-timeout → fail-closed → audited recovery; idempotent conversion → revenue-share split. **1-week:** + bandit/uplift reference engine on synthetic logged-bandit data, SNIPS/DR change-gate with support checks + holdout, drift monitor, consent receipts, full operator console, `verify` one-command E2E. **Production vision:** a Transaction-Moment trust/governance/settlement layer around Brain at internet scale (scale deltas documented honestly).

---

## #2 (SAFETY-NET) — CONVERSION-SAFE — Placement Circuit Breaker + Revenue-Integrity Core
**One sentence:** Guarantee placements never harm the merchant's primary conversion — real-time eligibility + fail-closed rendering + a `PLACEMENT_FAILURE`-keyed circuit breaker that suppresses and preserves checkout — paired with the idempotent revenue-share reconciliation ledger.
**Red-Team verdict:** WEAK as a *standalone thesis* (no AI necessity; hugs a public primitive), but it is the **most junior-defensible, lowest-checkout-risk** concept and is largely a **subset of the winner** (spines C51 + C54). **Role:** explicit fallback — if decision-science depth doesn't hold up in a mock defense, ship this flawlessly rather than the ML story shakily. A perfectly-defended reliability build beats a wobbly ML one.
**2-day/1-week/production:** eligibility + fail-closed + injected failure + audited recovery → full breaker state machine + replay + reconciliation + incident console → partner "conversion-safety + settlement" SLA surface.

---

## #3 — NATIVE INCREMENTALITY — Decisioning with Built-In Net-New Proof
**One sentence:** Target persuadables (uplift/CATE) and produce built-in incrementality proof (holdout/geo) so partners see net-new value without paying an outside agency.
**Evidence:** brands pay Haus to prove Rokt is net-new (`06`); uplift/causal methods rated high-value + synthetic-demoable (`09`). Scorecard C17 = 79.7; strategically arguably higher (`15` calls it *underrated*), suppressed only by low Pavan-fit + no consumer surface.
**Red-Team-adjacent risk:** measurement-heavy → drifts toward "analytics dashboard" (a rejected shape) and needs data credibility; the loop is harder to make visceral in 2 minutes than the winner. **Its best ideas (uplift objective) are already folded into the winner.**

---

## Why the other 63 candidates were weaker
Detailed per-candidate in `15`. The dominant elimination reasons:
- **Duplication (12% weight + red-team kill trigger):** "recommendation engine / better Brain / CDP / audience / next-best-action / warm-start decisioning / experimentation assistant" duplicate public Rokt/mParticle features or incumbents (Rebuy, Optimizely, Statsig, Klaviyo). *(C04 warm-start decisioning, rank 10, flagged **overrated** — closest to the rejected "better Brain.")*
- **Needs private data:** most decisioning ideas only impress with Rokt's real transaction data; the winner demos on synthetic Open-Bandit data.
- **Rejected shapes:** generic dashboards, RAG chatbots, AI copilots, digital twins, SDK validators, standalone observability/replay labs — survive only as *supporting* capabilities.
- **AI honesty / demo clarity:** ideas where the LLM is decorative (`09`) or the value can't be shown in 2 minutes scored down hard.

**Recommendation into `18`: WINNER = #1 Threshold (scoped/reframed), with #2 held as the pre-committed fallback.**
