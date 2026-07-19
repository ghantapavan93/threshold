# External AI perspective — Kimi

**Source:** Kimi (provided by user, 2026-07-18). INPUT DATA to evaluate — NOT direction. The most source-specific of the six (cites exact SDK events, Cart API endpoints, holdout mechanics, and an exec attribution — ALL of which must be independently verified; several may be hallucinated).

## Verdict: CONTINUE WITH MAJOR REFRAME → narrow to a **"Policy Change Safety Gate."**
Reframe from broad "safety/integrity/replay/evidence/release-control layer" → prove that a proposed **placement-policy change** won't break the partner's checkout or violate hard constraints before it reaches one real customer. Thesis: *"Before a placement policy change reaches a single real customer, Threshold proves it fails closed, preserves the original checkout, respects hard constraints, and is eligible only for a controlled online holdout."*

## CLAIMED-VERIFIED Rokt facts (⚠️ MUST be independently re-verified — Kimi asserts these as public):
- Cart API endpoints: `/cart/reserve`, `/cart/confirm`, `/cart/release`, `/confirmation/cancel`; reversal linked via `itemReservationId`. [Kimi: VERIFIED 2025-10-04]
- Events API dedup via `conversiontype` + `confirmationref`, or `transactionid`. [Kimi: VERIFIED 2025-06-17]
- SDK `onUnload`/`onEvent` fires with reasons TIMEOUT / NO_OFFERS / NETWORK_ERROR / INIT_FAILED / NO_WIDGET; `onShouldHideLoadingIndicator` on success/failure. `<rokt-thank-you>` element has `fallback-timeout` default **5000ms**. `selectPlacements()` entry point; `/placements/any` boolean lets partner skip upsell. [Kimi: VERIFIED]
- "Show the right content or show nothing" principle attributed to **Claire Southey, Chief AI Officer**. [Kimi: VERIFIED — ⚠️ exec name/title/quote must be checked]
- Rokt Brain: "thousands of signals / 30+ real-time signals / sub-200ms latency / minimum reserve quality threshold." [Kimi: VERIFIED]
- One Platform **Page Holdout Experiments**: 5% control recommendation; variants "display page without Rokt" vs "display Rokt layout to replicate"; success + secondary metrics + min uplift %; "live within 5 minutes." [Kimi: VERIFIED]
- Audience targeting Include(is not in)/Exclude(is in) **CC BIN** semantics are subtle/error-prone; custom attribute rules require Rokt staff (implies internal approval workflow). [Kimi: VERIFIED 2019-10-26 for targeting]
- Sandbox follows production config, doesn't charge advertisers; "contact your account manager" recurs. mParticle consent + IDSync. Public GitHub 70+ repos, no policy-mgmt/experimentation OSS. [Kimi: VERIFIED]
- **Absence:** no public docs for a policy-versioning system, shadow-replay engine, explicit fail-closed serving contract, action-propensity logging, or a unified policy safety gate. [Kimi: INFERENCE/absence]

## Contradictions Kimi flagged (useful):
1. Sandbox is manual + needs account manager → no automated policy replay/diff publicly = the gap Threshold fills.
2. Audience targeting: standard rules self-service but custom rules require Rokt staff → an internal approval workflow plausibly exists (persona plausible-but-unverified).
3. Holdout "live in 5 minutes" = deployment speed, NOT statistical significance (industry: 30+ days). Don't conflate.

## Primary user: **Placement Policy Engineer** (backend/decision-platform eng at Rokt or a major partner). Decision: "Will this change break any partner's checkout, violate consent, or degrade conversion?" Reframe persona broadly = "anyone who changes One Platform policy configs"; position **partner-facing self-service** to dodge "internal-tool" objection.

## Novelty: LIMITED (45% novelty confidence). Novelty is domain-specific *integration* of known patterns for checkout-embedded placement policies, NOT new CS. Must compensate with engineering rigor + storytelling. Hash-chained ledger explicitly "not novel."

## Removals (ruthless): OPE (IPS/SNIPS/DR) — no propensity logging, can't validate; hash-chained ledger → append-only + DB immutability; revenue settlement/financial state → keep only Cart API confirm/cancel; LLM even peripheral → "No AI in Critical Path" as a stated design principle; "Shadow Replay" causal language → rename **"Policy Diff Replay"** (decision diffing + constraint checking + fail-closed proof only); "tamper-proof" → drop.

## Keep (transaction-specific): policy diff; constraint validator (latency/consent/brand-safety/frequency/fallback/holdout); synthetic session generator; decision replay V17 vs V18; fail-closed injector (timeout/invalid/stale-identity → NO_OFFER, checkout continues); conversion dedup (confirmationref+conversiontype); cancellation state transition (itemReservationId); verdict engine (BLOCKED / INSUFFICIENT_EVIDENCE / ELIGIBLE_FOR_HOLDOUT); append-only decision audit log.

## Boundary: IS a policy-change safety gate + fail-closed validator + constraint verifier + holdout-eligibility checker + diff/replay viewer. IS NOT Brain replacement / recommender / experimentation platform / observability / GDPR-compliance platform / settlement system / chatbot.

## Better alternatives (5, scored): Consent-Aware Placement Validator (78, stronger cross-product novelty); Cart Reservation Integrity Monitor (72); Placement Latency Guardian (75); Partner Self-Service Policy Sandbox (80, higher business value/defensibility); Conversion Event Reconciliation Bridge (74). Kimi notes Partner Self-Service Sandbox (80) actually out-scores base Threshold — worth weighing.

## Signature screenshot: **Policy Diff + Constraint Heatmap** (V17 vs V18 with a green "Fail-Closed Proof" panel). Frontend: single scrollable page (diff → constraint grid → replay timeline → failure injection → conversion demo → verdict card). Desktop-first.

## Backend: FastAPI + Postgres + SQLAlchemy; PolicyVersion (immutable, unique partner+version), DecisionEvent (append-only), constraint engine (6 checks pass/warn/fail), fail-closed injector, conversion dedup via dedup_key, verdict engine. State machines: policy DRAFT→VALIDATED→HOLDOUT_ELIGIBLE→HOLDOUT_RUNNING→ROLLED_OUT|BLOCKED; decision EVALUATING→OFFER/NO_OFFER→FALLBACK; conversion RECEIVED→DEDUPLICATED→PROCESSED→CONFIRMED→CANCELED. OTel traces, structured logs, correlation_id. (Kimi supplied full example code for models/constraints/fail-closed/conversion/verdict.)

## Scorecard: 79.2/100 base → **85.6/100 after reframe**. Confidence: evidence 65→75%, novelty 45→60%, build 80→85%, defensibility 60→70%, overall 62%.

## 48h: policy diff engine; constraint validator (6); synthetic session generator (seeded, ~50); replay V1 vs V2; fail-closed injector (3 modes); dedup demo (confirmationref); cancellation state demo (itemReservationId); verdict engine; append-only audit log; Next.js single page; FastAPI+Postgres+Docker+GH Actions. NOT: OPE, hash-chain, settlement, LLM, streaming, real mParticle (mock only), general experimentation.
## 1-week: mock mParticle consent API into validator; partner-specific constraint profiles; historical replay interface (if data given); batch validation; holdout-config export.

## Terminology corrections Kimi insists on: "Shadow Replay"→"Policy Diff Replay"; "Evidence Ledger"→"Decision Audit Log"; "SHOW_NOTHING"→"No Offer Rendered" (match SDK NO_OFFERS); "tamper-proof"→append-only immutability; Threshold = safety *gate*, not platform.

## Message to Implementation Agent (Kimi's, not user direction): Build the Policy Change Safety Gate; cinema/ticketing story (AMC post-purchase parking V17→V18); DO NOT build OPE/hash-chain/settlement/LLM/general-experimentation; make the diff+constraint-heatmap the hero; every architectural choice explainable against public Rokt docs; "Build this. Defend this. Do not overreach."
