# 16 — Top Five Opportunities (Pre-Red-Team)

**Author:** Product-discovery synthesis lead
**Date:** 2026-07-18
**Inputs:** research reports 01–12 (business map, architecture/SDK, SDK+/mParticle, customer journey, partner pain, case studies, hiring signals, competitive matrix, AI/decision-science, privacy, repo audit, reuse map).
**Status:** Finalist set submitted to the Senior-Engineer Red Team (`13_RED_TEAM.md`). Confidence figures are evidence-based, NOT certainty, and never assert Rokt lacks an internal version.

**Selection lens (weighted model, `15`):** evidence-backed pain (15) · Rokt-strategy alignment (15) · non-duplication (12) · business/customer value (12) · engineering depth (12) · 2-minute demo clarity (10) · prototype feasibility (8) · frontend storytelling (5) · responsible-AI fit (5) · privacy/trust (4) · authentic fit with Pavan (2).

The four cross-cutting truths every finalist had to respect:
1. **The uncontested white space is the *integration*** of (embedded transaction-moment serving surface) × (real-time first-party CDP) × (owned paid-demand network). Only Rokt+mParticle plausibly holds all three (`08`). Differentiate from **Rebuy Monetize** (embedded but rents Fluent demand, Shopify-only), Klarna/Afterpay (own-app inventory), and mParticle's own public features (Audience Agent, Next Best Action, Predictive Audiences, Match Boost).
2. **Classical decision-science beats LLMs in the real-time core** (`09`); LLMs earn value only at the periphery with human review; deterministic logic is the *correct* answer for money, eligibility, constraints, audit.
3. **Checkout completion is sacred** — never block/delay/divert, fail closed; **"show nothing" is first-class** (`10`).
4. **Highest-signal proof-of-work = a runnable demo with a visible failure→recovery→audit trail + AI-in-loop-with-human-verification + a measured outcome + honest limits** (`07`), which maps onto Pavan's strongest reusable patterns (`12`): idempotency at the irreversible boundary, transactional outbox + DLQ, hash-chained audit, deterministic-engine-decides/LLM-only-explains, reconciliation state machine, replay/recovery.

---

## #1 — THRESHOLD — Right-Moment, Trust-Aware Transaction-Moment Decisioning with a Replayable Decision Ledger
*(working name; alts: "Steward", "Quiet Signal")*

- **Thesis:** At the checkout-confirmation moment, decide *whether, when, and what* to place — treating **"show nothing" and long-term customer trust as first-class objectives** — and record every decision (including silence) as a tamper-evident, replayable ledger, so operators can safely change policy (off-policy-evaluated) and recover from failure without ever risking the merchant's primary conversion.
- **Evidence chain:** Offer fatigue/irrelevance/bad-timing is the top-evidence customer pain (`04`: 56–81% ignore irrelevant messages; fatigue tied to ignoring "context, intent, timing"). "Show the right content or nothing" is Rokt's own framing (`01`), and checkout-sacred/fail-closed + "show nothing" are hard guardrails (`10`). Incrementality matters commercially — brands pay outside agencies (Haus) to prove Rokt is net-new (`06`). Classical decision-science (bandits, uplift, off-policy SNIPS/DR, calibration, constrained reranking, drift) is high-value AND synthetic-demoable (`09`).
- **Why now:** Rokt Brain v4 + mParticle real-time profiles make a *profile-conditioned, trust-penalized* decision at the moment newly plausible (`03`); the industry is loudly worried about fatigue and message relevance (`04`).
- **Why Rokt:** Requires the triad no competitor assembles (`08`): a decision *at the merchant's confirmation moment*, informed by *real-time first-party data*, against *owned demand*. Rebuy can't (rented demand, thin data); CDPs "end at the pipe"; Klarna/Afterpay live in their own apps.
- **Why Pavan:** Deterministic-engine-decides / LLM-only-explains + "why this decision" UI (fanflow), idempotent event handling, hash-chained audit (Efficast), reconciliation/replay + fail-closed recovery (ShelfTrace/Dreamship) — a near-perfect reuse fit (`12`).
- **Core workflow:** confirmation event → real-time profile fetch → candidate generation → deterministic score (net-new − fatigue/trust penalty) → hard-constraint reranker → decide {monetized offer | fulfillment-relevant help | nothing} → LLM writes grounded "why" → serve → log immutable decision → convert/attribute (idempotent) → operator reviews/curates policy → off-policy eval of proposed change → versioned rollout.
- **Architecture:** FastAPI decision service + Postgres + transactional outbox worker (backoff/jitter/DLQ) + hash-chained audit + pure decision engine (bandit/uplift/reranker) + off-policy evaluator + drift monitor; Next.js operator console with a shopper-view simulator, "Why this / Why nothing" panel, incident/recovery timeline, and a policy-change review screen with off-policy predicted impact.
- **AI role:** Classical core (deterministic + tabular ML). LLM ONLY for the human-readable rationale (grounded, guardrailed) and optional creative copy for approval. **Useful with LLM off.**
- **Customer/operator value:** less fatigue, more relevance, protected checkout; operator gets safe, auditable control + failure recovery.
- **Business outcome:** predicted **net-new (incremental) value per session under a trust/fatigue guardrail**; primary-conversion never degraded.
- **Risks:** perceived overlap with internal Rokt fatigue/frequency management; must frame as adjacent hypothesis; must avoid drifting into "experimentation assistant" (off-policy eval is a *supporting* capability, not the thesis).
- **Staff-engineer challenge:** "We already do frequency capping and 'show nothing'." → The demonstrable, novel contribution is making the decision (incl. silence) *auditable, replayable, and operator-safely-changeable*, with fatigue/incrementality as *explicit* multi-objective terms and off-policy safety before rollout — a governance/trust layer, not the ranker.
- **2-day version:** one confirmation session; deterministic decide {offer|nothing} with a static fatigue penalty; "why" panel; immutable decision log; one injected model-timeout → fail-closed → audited.
- **1-week version:** contextual bandit + uplift on synthetic logged-bandit data; SNIPS/DR off-policy eval for a proposed policy change; drift monitor; full operator console; replay; hash-chained audit + verifier; scenario-fixtures-as-tests + one-command `verify`.
- **Production vision:** a Transaction-Moment "trust & governance" layer around Rokt Brain — every decision explainable, every policy change safe, every failure recoverable, at internet scale (what changes at scale documented honestly).

---

## #2 — CONVERSION-SAFE — Transaction-Moment Placement Circuit Breaker
- **Thesis:** A control plane that *guarantees* Transaction-Moment placements never harm the merchant's primary conversion — real-time eligibility + fail-closed rendering + a circuit breaker keyed on placement failures that suppresses and preserves checkout, with audited recovery and replay.
- **Evidence chain:** Checkout-sacred / fail-closed is the load-bearing guardrail (`10`); `Selection.on()` exposes a documented `PLACEMENT_FAILURE` event (`02`); ~70% cart abandonment makes any checkout risk existential (`04`).
- **Why now / why Rokt:** As placements expand across surfaces (`01`), provable non-interference becomes a trust asset; the public `PLACEMENT_FAILURE` + CSP + consent flags give a real seam (`02`).
- **Why Pavan:** Circuit breaker, fail-closed, idempotency, DLQ, replay, audit — his strongest reliability patterns (`12`).
- **Core workflow:** eligibility check → render attempt → on failure/timeout, trip breaker → suppress → preserve checkout → record incident → recover → replay.
- **Architecture:** eligibility/circuit-breaker service + outbox/DLQ + hash-chained incident audit + a reliability console (breaker state, incident timeline, replay).
- **AI role:** minimal/none in the core (correctly deterministic); optional anomaly detection at the edge.
- **Business outcome:** conversion protected; time-to-detect/recover; zero checkout regressions.
- **Risks:** thesis skews toward **reliability/observability**, which the brief flags as a *supporting* capability, not a product; higher risk of "Rokt surely has internal safety for this."
- **Staff challenge:** "This is table-stakes SRE we already own." → Reframe as a *partner-facing trust guarantee* with provable, replayable evidence, not internal plumbing.
- **2-day:** eligibility + fail-closed + one injected failure + audited recovery. **1-week:** full breaker state machine, replay, incident console, tests. **Production:** a partner "conversion-safety SLA" surface.

---

## #3 — CATALOG RECONCILIATION — EDI 3-Way-Match Exception Console
- **Thesis:** An operator console for Rokt Catalog brand-supplier onboarding and the 846/850/856/810 three-way-match, turning silent reconciliation failures into idempotent, replayable, audited exceptions an operator can resolve.
- **Evidence chain:** Catalog onboarding requires a full EDI test battery across Catalog + Orderful with a documented 3-way-match dispute surface and silent-failure modes (`05`); Catalog is Merchant-of-Record with real fulfillment/returns/payout ops (`01`).
- **Why Pavan:** This is *exactly* his Dreamship/ShelfTrace domain (order-exception, EDI-like reconciliation, replay, DLQ, row-locking) (`11`,`12`).
- **Core workflow:** ingest EDI docs (idempotent) → reconcile (deterministic state machine) → mismatch → exception queue → operator resolves → replay → audited.
- **Architecture:** ingestion + reconciliation state machine + outbox/DLQ + audit + exception console.
- **AI role:** LLM optional to *explain* an exception / suggest a resolution (human-approved); core is deterministic.
- **Risks:** **closest to re-skinning Dreamship** — the brief explicitly warns against cloning his order-exception dashboard; least "internet-scale consumer decisioning"; back-office rather than the marquee Transaction Moment.
- **Staff challenge:** "This is a generic EDI reconciliation tool with a Rokt logo." → Must tie tightly to a Catalog-specific dispute and show something above a generic order dashboard.
- **2-day:** ingest + reconcile + one exception + resolve. **1-week:** full state machine + replay + console + tests. **Production:** Catalog-for-Brands reconciliation ops suite.

---

## #4 — INCREMENTALITY-NATIVE — Decisioning with Built-In Net-New Proof
- **Thesis:** A decision layer that targets *persuadables* (uplift/CATE) and produces built-in incrementality proof (holdout/geo) so partners see net-new value without paying an outside agency.
- **Evidence chain:** Brands pay Haus to prove Rokt is net-new (`06`); uplift/causal inference are high-value + synthetic-demoable (`09`).
- **Why Rokt:** Closed-loop measurement is already a Rokt asset (`01`); owning incrementality closes a credibility gap.
- **Risks:** measurement-heavy → risk of "analytics dashboard" (a rejected direction) and needing data credibility; the decision loop is harder to make visceral in 2 minutes than Threshold.
- **AI role:** uplift/CATE + causal estimators + calibration; LLM optional for readout narration (human-reviewed).
- **2-day:** uplift targeting + Qini on synthetic RCT. **1-week:** + holdout proof surface + calibration + drift. **Production:** native incrementality guarantee.
- *(Note: strongest ideas here are folded into Threshold's "net-new" objective; standalone it leans analytics.)*

---

## #5 — COMPLIANCE LINTER — Pre-Submission Creative & Offer Policy Linter
- **Thesis:** Before an advertiser submits a creative, a linter cites the *specific* at-risk Rokt policy rules (deterministic rules + LLM explanation with human review), cutting the ~24h approve/reject churn.
- **Evidence chain:** Every creative needs manual Rokt approval (~24h) against dense, vertical-specific rules; overlooking one triggers rejection + re-review (`05`).
- **Why Pavan / AI fit:** Textbook **AI-in-loop-with-human-verification** (`07`): deterministic rules flag, LLM explains, human decides; grounding guardrail discards ungrounded rationale (fanflow pattern, `12`).
- **Risks:** lower engineering depth and distinctiveness; adjacent to generic "policy linter"; not the marquee decisioning surface; smaller technical-conversation surface than Threshold.
- **2-day:** rules engine + cited violations on seeded creatives. **1-week:** + LLM grounded explanations + human-review queue + audit. **Production:** self-serve pre-submission compliance for Rokt Ads.

---

## Why these five (and not the other candidates)
The full universe (`14`) spans 22 categories. The five above dominate because each pairs **evidence-backed pain** with a **Rokt-distinctive surface** and **genuine engineering depth Pavan can own and explain**. Recurring reasons other candidates fell short (detailed in `15`):
- **Duplication:** most "recommendation engine / better Brain / CDP / audience / next-best-action / experimentation-assistant" ideas duplicate public Rokt/mParticle features or incumbents (Rebuy, Optimizely, Statsig, Klaviyo) — non-duplication is a 12% weight and a red-team kill trigger.
- **Needs private data:** many decisioning ideas only impress with Rokt's real transaction data; the five above all demo convincingly on synthetic data.
- **Rejected shapes:** generic dashboards, RAG chatbots, AI copilots, digital twins, SDK validators, observability labs — explicitly weak; where useful, they survive only as *supporting* capabilities inside a larger thesis.
- **Demo clarity / AI honesty:** ideas whose value can't be shown in 2 minutes, or where the LLM is decorative (`09`), scored down hard.

**Provisional ranking into the Red Team: #1 Threshold, then #2 Conversion-Safe / #3 Catalog Reconciliation as the credible fallbacks if the winner is judged too close to internal Rokt capability.**
