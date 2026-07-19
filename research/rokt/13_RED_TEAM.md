# 13 — Red-Team Review of Proof-of-Work Concepts

**Reviewer stance:** Skeptical Rokt staff/principal engineer. Assume every idea below has already been argued in a Rokt planning doc. The job is to try to KILL each, then say honestly whether the top one clears the bar for an early-career candidate's proof-of-work.
**Date:** 2026-07-18
**Evidence base:** research files 01, 02, 03, 05, 08, 09, 10 (skim of others). Citations use those file IDs.

> Framing discipline inherited from the research corpus: nothing here asserts Rokt *lacks* a capability. The bar for a candidate concept is not "Rokt hasn't built this" — it is "this is a credible, defensible, demonstrable piece of engineering that starts a real technical conversation and doesn't pretend to fill a gap that isn't evidenced." I hold the concepts to that bar and try to break them.

---

## How I'm scoring

- **SURVIVES** — withstands the kill attempts; the smallest honest version is buildable by a junior, demoable in <2 min, and creates a real technical conversation without claiming Rokt is deficient.
- **WEAK** — has a defensible core but carries at least one objection sharp enough to sink it in a hostile review unless reframed.
- **KILL** — a structural problem (duplication, requires private data, another-dashboard, no AI necessity, or trust red line) that a skeptical reviewer can land cleanly.

---

# CONCEPT #1 — "Threshold" (WINNER CANDIDATE)

*Deterministic classical-ML transaction-moment decisioning; SHOW NOTHING as a first-class action; uplift-minus-fatigue objective under hard constraints; replayable hash-chained decision ledger; off-policy-safe policy changes; LLM only at the periphery for rationale/creative; fail-closed-to-silence recovery; demoable on synthetic Open-Bandit-style data.*

### The 18 questions

**1. Does Rokt/mParticle already publicly provide this?**
Partially, and this is the central danger. Rokt Brain already does real-time transaction-moment decisioning, already treats "show nothing" as first-class ("show the right content or show nothing" — 01 §3.1; "removing low relevance offers," suppression over saturation — 10 §G10), already runs experiments/holdouts (02 §11), already has a documented `PLACEMENT_FAILURE` fail path (02 §8). So the *decisioning engine* and *silence-as-action* are NOT novel to Rokt. What is not publicly evidenced as a productized, partner-visible artifact is the combination of **(a) an immutable, hash-chained, replayable decision ledger** and **(b) operator-facing off-policy evaluation that predicts a proposed policy change's value from logged data before it touches live traffic.** That specific pairing — *auditability + off-policy-safe change management as a governed operator surface* — is the only part that survives question 1. The decisioning core does not.

**2. Merely a renamed existing feature?**
The decisioning core, yes — "contextual bandit + uplift + calibrated propensity + constrained reranker" is a fair public description of what Rokt Brain plausibly already is (09 Part A/B). If the candidate pitches "Threshold" as *the decision engine*, it is a rename and dies. It is only non-duplicative if pitched as *the governance/replay/off-policy-change layer around* a decision engine.

**3. Requires private data to be meaningful?**
No — and this is its single strongest defense. 09 Part D rates contextual bandits, OPE via Open Bandit Pipeline, uplift/Qini, calibration, multi-objective, constraint-aware decisioning, and drift monitoring all **HIGH** for prototype-feasibility on synthetic/public data. The flagship prototype 09 recommends ("bandit → calibrated scores → multi-objective + hard-constraint reranker → OPE (SNIPS/DR) → drift monitor") is essentially this concept minus the ledger. So it is genuinely buildable without Rokt data. The *business claim* (that it lifts real Rokt revenue) does require private data, but the *artifact* does not.

**4. Is the claimed user pain evidence-supported?**
Mixed. The **off-policy-safety pain** is well-supported: 09 §6 explicitly frames OPE as "de-risk Rokt-style deployment" before A/B; 05 Pain 4 documents that experiment interpretation ("wait two weeks, 95% probability, watch secondary metrics") is pushed onto operators and invites error. The **replay/audit pain** is supported indirectly: 10 stresses auditability of automated decisioning (§G7 opt-out of automated decision-making; §3.2 "trust console"; §3.3 verifiable guarantees). What is NOT evidenced is that operators are today blocked from changing policy or blind to decisions — that would be a "Rokt is deficient" claim the corpus forbids. The honest pain is *governed change management is manual/statistical judgment* (05 Pain 4), not *Rokt can't change policy*.

**5. Is AI genuinely necessary?**
Yes, but with a crucial inversion the candidate must own: the "AI" that is necessary is **classical ML + causal/counterfactual methods, and the LLM is explicitly NOT in the core loop** (09 Part C: "LLM as the offer ranker / decision-maker" is "decorative / actively harmful"). This is actually the concept's intellectual spine: it demonstrates that the candidate knows *when not to use an LLM*. Bandits/uplift/OPE are genuinely necessary (static rules never explore, can't estimate a new policy's value from logs — 09 §2, §6). So AI-necessity is satisfied, but only because the concept defines "AI" correctly. If a reviewer hears "AI checkout decisioning" and pictures an LLM, the candidate loses the room in 10 seconds — the framing must lead with "deterministic, LLM-off-by-default."

**6. Could simpler deterministic logic solve it?**
The hard constraints, frequency caps, brand-safety, fail-closed — YES, those ARE deterministic and the concept correctly makes them so (09 §14; 10 §G10–G12). But the *off-policy value estimate* and *explore/exploit under cold-start* cannot be done by rules (09 §2, §6). So the concept is honest about the deterministic/ML boundary — which is itself the differentiator. A reviewer who says "just use rules" is answered by "the rules ARE in there; OPE is the part rules can't do." Good.

**7. Is it another dashboard?**
Risk: HIGH. The operator-facing "propose change → see predicted impact → approve → versioned/audited" surface is a dashboard. The defense is that the dashboard is a thin skin over a real engine (OPE estimator + ledger), not the product itself. But in a demo it will *look* like a dashboard, and a hostile reviewer will call it one. Mitigation: lead the demo with the OPE number changing and the replay reproducing a past decision bit-for-bit, not with the UI chrome.

**8. Another chatbot?**
No. The LLM is explicitly peripheral (rationale text grounded in the score breakdown, discarded if it contradicts the decision) and the product "remains fully useful with the LLM OFF." This is a strength — it pre-empts the "everything is a chatbot now" reflex.

**9. Another generic recommender?**
Partially exposed. A contextual bandit selecting offers IS a recommender. The differentiators from a generic recommender are: (a) "SHOW NOTHING" as a first-class arm, (b) uplift/persuadables rather than raw pConvert, (c) an explicit fatigue/trust penalty in the objective, (d) OPE-gated changes. Those are real distinctions (09 §4 uplift, §6 OPE), but a skeptic can still say "it's a constrained recommender with an audit log." The candidate needs the uplift-minus-fatigue objective and the counterfactual-safety story crisp, or it collapses into "generic recommender + logging."

**10. Does it improve a real Rokt customer/partner/advertiser/eng outcome?**
Plausibly yes for **eng/ops and partner trust**: reproducible decisions (replay), safe policy rollout (OPE before live), and auditable automated decisioning map onto real needs (05 Pain 4; 10 §3.2, §3.8 non-interference SLA, §G7). It is weakest on *advertiser* outcome — it doesn't obviously help demand-side yield. Framed as an **operator-trust + change-safety** capability it improves a real outcome; framed as a revenue engine it competes with Brain and loses.

**11. Could it HARM checkout conversion or trust?**
This is the concept's best trust story and it is defensible. Fail-closed-to-silence is exactly the cardinal rule (10 §G10 "degrade gracefully (fail closed to 'show nothing')"; R7 never interfere with checkout). SHOW NOTHING as first-class action is pro-trust (10 §G12 suppression as user-respect). The one live risk: an OPE estimate with **insufficient support or tiny propensities** (09 §6 failure modes: "divide-by-zero," "100× weights from single clicks") could greenlight a bad policy that DOES harm conversion. The candidate MUST show they know OPE can be dangerously wrong and gate it (SNIPS + support checks + still requiring an online holdout). If they present OPE as a green light to skip A/B, that is an immediate-rejection-grade error.

**12. Can a junior candidate actually explain every architectural decision?**
This is the biggest practical risk. The concept spans contextual bandits, uplift/CATE, calibration, SNIPS/DR off-policy evaluation, multi-objective constrained reranking, hash-chained event sourcing, and drift monitoring. That is a LOT of surface for an early-career engineer to defend under adversarial questioning. If they can't explain *why SNIPS over vanilla IPS* (self-normalized, lower variance, no tuning — 09 §6), *why isotonic vs Platt calibration* (09 §8), or *why a bandit not full RL* (09 §3 "RL is often overkill; sample complexity brutal"), the depth becomes a liability. The scope is a double-edged sword: it creates a rich conversation (Q15) but only if the candidate has actually done the reading. **The scope should probably be cut to survive Q12** (see smallest honest version).

**13. Can core value be shown in <2 min?**
Yes if scoped correctly: one merchant, one shopper, one confirmation session; show (1) a decision incl. SHOW NOTHING, (2) the hash-chained ledger entry, (3) a proposed policy change with its SNIPS/DR predicted value + guardrail check, (4) a forced failure → fail-closed → replay. That is a tight 2-minute narrative. The danger is trying to show all seven ML techniques — that blows the budget. Demo discipline is required.

**14. Would a senior engineer learn anything about the candidate?**
Yes — more than either runner-up. It reveals whether the candidate understands the *deterministic/ML boundary*, *counterfactual reasoning*, *event-sourcing/replay*, and *fail-safe design* — and, critically, the maturity to keep the LLM out of the hot path. That is a strong signal set for a decision-science/platform role.

**15. Does it create a real technical conversation?**
Yes, the richest of the three. Natural senior questions: "How do you bound OPE variance?" "What happens when the new policy's support is zero?" "How is the ledger hash-chain verified and what's in the canonical event?" "Why uplift not pConvert, and how do you get treatment/control labels in synthetic data?" "How do you keep the LLM rationale from lying?" Every one of these is a legitimate staff-level probe.

**16. What would cause IMMEDIATE rejection?**
- Pitching it as "a better Rokt Brain" / the decision engine (duplication + implies deficiency).
- Presenting OPE as a way to *skip* online testing (statistically reckless; 09 §6, §22 offline↔online gap is "the recurring pitfall").
- The LLM creeping into the decision path (contradicts 09 Part C and the concept's own thesis).
- Claiming a revenue lift number it cannot support on synthetic data.
- Candidate unable to derive/explain SNIPS or the bandit update on a whiteboard.

**17. What evidence is still missing?**
- Any Rokt-specific evidence that operators *want* an off-policy-change console (05 Pain 4 supports the adjacent pain, not this exact artifact).
- Whether Rokt Brain already exposes replay/audit internally (unknowable from public docs — 02 §5 says internals "not publicly detailed"). The concept must be framed as "an illustrative, self-contained system," not "the thing Rokt is missing."
- Latency budget realism: the serving path is <~50–100ms (09 §1); the ledger write and any LLM rationale must be off the hot path. The candidate needs to state this explicitly.

**18. What is the smallest honest version?**
A single-session, synthetic-data demo of: **contextual bandit (with SHOW NOTHING arm) → calibrated score → hard-constraint reranker → hash-chained decision ledger → one OPE-evaluated proposed policy change (SNIPS + support check) → forced failure → fail-closed-to-silence → replay of the logged decision.** Drop full uplift/CATE, drift monitoring, and the LLM rationale to *optional stretch* modules. That is buildable on Open Bandit Pipeline (09 §6, Part D), demoable in 2 minutes, and every piece is explainable. This smallest version is essentially 09's "recommended flagship prototype" plus the ledger — which is the honest, defensible core.

### Verdict #1: **SURVIVES (conditionally)** — survives as the *governance + off-policy-change + replay layer around* a deterministic decision core, NOT as the decision core itself. Duplication risk on the core is real but avoidable with framing. Trust story is excellent. Scope is the liability.

---

# CONCEPT #2 — "Conversion-Safe" Placement Circuit Breaker

*A control plane guaranteeing transaction-moment placements never harm the merchant's primary conversion: real-time eligibility + fail-closed rendering + a circuit breaker keyed on `PLACEMENT_FAILURE` that suppresses and preserves checkout, with audited recovery + replay.*

### The 18 questions (compressed)

1. **Already provided?** Substantially, at the primitive level. `PLACEMENT_FAILURE` "describes whenever a placement encounters an error it cannot recover from" and the init script "loads the SDK asynchronously with fallback error handling" (02 §8). `/v1/placements/any` already lets partners "skip the upsell/cross-sell stage" (02 §4). Fail-closed-to-silence is already the stated posture (10 §G10). So the *primitives exist*; the concept assembles them into a named circuit-breaker pattern.
2. **Renamed feature?** Close to it. "Circuit breaker keyed on PLACEMENT_FAILURE" is arguably a wrapper around an event Rokt already emits and a behavior (suppress/preserve checkout) Rokt already guarantees. This is the sharpest kill vector.
3. **Requires private data?** No — demoable with a mock checkout + injected failures. Good.
4. **Pain evidence-supported?** The *checkout-sanctity* principle is strongly supported (10 §G10, R7; 08 notes conversion-safety as Rokt's promise). But evidence that the failure handling is *insufficient today* does not exist and would be a forbidden "deficiency" claim. The pain is real in the abstract (checkout must never break) but Rokt already answers it publicly.
5. **AI necessary?** NO. This is the concept's fatal flaw for a *decision-science* proof-of-work. It is deterministic control-plane engineering — LaunchDarkly-style guarded rollout / auto-rollback (08 profiles LaunchDarkly's "guarded rollouts with automatic regression detection/rollback"). 09 §14/§20 confirm this class is deterministic. Zero AI necessity.
6. **Simpler deterministic logic?** It *is* the deterministic logic — there is no ML layer to justify. That's fine for a reliability concept but means it showcases SRE/distributed-systems skill, not decision science.
7. **Another dashboard?** Partly — the audited recovery/replay view is a console. But the core is a state machine, not a dashboard, which is in its favor.
8. **Another chatbot?** No.
9. **Generic recommender?** No — and doesn't pretend to be.
10. **Real outcome?** Yes — checkout reliability is a genuine, high-value partner/eng outcome and maps directly to Rokt's cardinal rule (10 §G10, §3.8 "non-interference SLA"). Arguably the most *unambiguously aligned-with-Rokt-values* of the three.
11. **Harm checkout/trust?** It exists to *prevent* harm — lowest risk of the three. Strong.
12. **Junior can explain everything?** YES — easily. Circuit breaker, timeout, fallback, idempotent replay, state machine are standard, well-bounded engineering. This is its biggest advantage over #1: fully defensible by an early-career engineer.
13. **<2 min demo?** Yes, cleanly: inject a provider timeout → breaker trips → checkout preserved → recovery → replay. Very legible.
14. **Senior learns about candidate?** Yes, but a *narrower* signal: solid systems/reliability thinking, not decision science. Good for a platform/infra role, thinner for a Brain/decision-science role.
15. **Real technical conversation?** Yes — breaker thresholds, half-open state, idempotency keys, replay determinism, where state lives, blast radius. Legitimate but more junior-standard than #1.
16. **Immediate rejection?** If pitched as novel to Rokt ("Rokt can't protect checkout") — instant death, because 10 §G10 and 02 §8 show it's Rokt's existing stated posture. Survives ONLY as "here's how I'd engineer the conversion-safety guarantee, as a self-contained illustration."
17. **Missing evidence?** Any sign the current fallback is inadequate (doesn't exist / forbidden). Latency budget for the breaker check on the hot path.
18. **Smallest honest version?** A mock checkout + a Rokt-style placement iframe + an injected-failure harness + a circuit breaker that fails closed to silence and preserves the primary purchase, with an idempotent replay log. Buildable in a day or two.

### Verdict #2: **WEAK.** Rock-solid engineering, lowest trust risk, most junior-explainable, most obviously aligned with Rokt's cardinal rule — but **no AI necessity** and the closest to "renamed existing primitive" (`PLACEMENT_FAILURE` + fail-closed already exist publicly). As a *decision-science* proof-of-work it under-delivers signal; as a *platform-reliability* proof-of-work it's the safest bet. It survives only with careful "illustrative, not gap-filling" framing.

---

# CONCEPT #3 — Catalog EDI Reconciliation Exception Console

*Operator console for Rokt Catalog brand-supplier onboarding/3-way-match (846/850/856/810) exceptions: idempotent ingestion, dead-letter handling, replay, audited resolution.*

### The 18 questions (compressed)

1. **Already provided?** The *EDI pipeline and transaction dashboard* exist (05 Pain 5/6: 832/846/850/860/856/855/810 test scenarios, Orderful handoff, "transaction dashboard"). What 05 Pain 6 explicitly says is NOT publicly evidenced: "an automated discrepancy-detection layer." So the *exception-detection console* is the least-duplicative of all three concepts on question 1.
2. **Renamed feature?** No — 3-way-match exception detection is a distinct capability from a transaction list view.
3. **Requires private data?** No — EDI is a public standard; synthetic 850/856/810 sets with injected mismatches demo it fully. Good.
4. **Pain evidence-supported?** Strongest of the three. 05 Pain 6 grounds it: "Invoicing for quantities that differ from what was confirmed received in the 856 is the most common cause of invoice disputes"; 812 adjustments; commission (35–40%) reconciliation layered on top. This is a documented, labor-intensive, real B2B pain (05 Pain 5/6, [INDUSTRY-PROBLEM]).
5. **AI necessary?** NO — and this is the crux. 3-way matching is deterministic reconciliation (join on PO/qty/price, flag deltas). 09 doesn't even list it as an ML problem. Optional LLM for *root-cause explanation drafting* is peripheral, not necessary. Zero core-AI necessity.
6. **Simpler deterministic logic?** Yes — deterministic matching *is* the solution. Fine for an ops-tooling concept, but again no decision science.
7. **Another dashboard?** YES — it is literally "an operator console." This is the most on-the-nose "another dashboard" of the three. Hard to escape the label because a worklist of exceptions IS a dashboard.
8. **Chatbot?** No (unless the optional LLM explainer is over-sold).
9. **Generic recommender?** No.
10. **Real outcome?** Yes for **Catalog suppliers/finance** — reduces dispute rate and days-to-resolve (05 Pain 6). Narrow but real and measurable.
11. **Harm checkout/trust?** No — it's back-office, nowhere near the consumer checkout surface. Zero checkout risk, but also zero relationship to the Transaction Moment (Rokt's organizing concept, 01 §2). It's the most *peripheral to Rokt's core thesis* of the three.
12. **Junior can explain?** YES — idempotent ingestion, dead-letter queues, replay, 3-way match are standard data-engineering. Fully defensible.
13. **<2 min demo?** Yes — ingest feeds, show exceptions surfaced with root cause, resolve one, replay. Clean.
14. **Senior learns about candidate?** Yes — competent data-engineering/EDI/idempotency signal. But it's the *least differentiated intellectually* and says nothing about decisioning, ML, or the Transaction Moment.
15. **Real technical conversation?** Moderate — idempotency keys, exactly-once vs at-least-once, dead-letter replay, match tolerances. Solid but standard.
16. **Immediate rejection?** If the reviewer decides "this is a generic EDI reconciliation tool that happens to name-drop Rokt Catalog" — and that critique largely lands, because nothing about it is Rokt-specific beyond the 846/850/856/810 set any dropship marketplace uses. Also vulnerable: it's furthest from Rokt's AI/Transaction-Moment identity, so it may read as "didn't understand what Rokt is about."
17. **Missing evidence?** Rokt-specific evidence that Catalog suppliers lack exception tooling today (05 Pain 6 infers from industry norms, not Rokt disclosures).
18. **Smallest honest version?** Ingest synthetic 850/856/810 (+812), run the 3-way match, surface only exceptions as a prioritized worklist with likely root cause, idempotent + replayable, human resolves each. Exactly 05's Pain 6 [HYPOTHESIS] tool.

### Verdict #3: **WEAK (borderline KILL for this role).** Best-evidenced pain and least-duplicative on question 1, but **no AI necessity, unambiguously "another dashboard," and furthest from Rokt's decision-science/Transaction-Moment identity.** It's a competent ops-tooling proof-of-work that would impress for a data-engineering/integrations role and underwhelm for a Brain/decision-science role. Survives as an ops concept; killable as a decision-science proof-of-work.

---

# WINNER ASSESSMENT — "Threshold" (#1)

### Honest confidence (evidence-based)

**(a) Credible ADJACENT opportunity (not a "Rokt lacks it" claim): 68%.**
The decisioning *core* is not adjacent — it overlaps Rokt Brain directly (01 §3.1, 09). What IS credibly adjacent is the **replayable decision ledger + off-policy-safe operator change management + explicit uplift-minus-fatigue objective made legible**. That maps to real, evidenced adjacent pains (05 Pain 4 experiment/change judgment; 10 §3.2 trust console, §3.3 verifiable guarantees, §3.8 non-interference SLA). Confidence is capped below ~70% because the adjacency only holds if the candidate rigorously frames it as governance-around-decisioning, not decisioning; the concept as literally written leads with the core, which is the duplicative part.

**(b) Non-duplicative enough to be interesting: 62%.**
The ledger + OPE-gated change + SHOW-NOTHING-in-objective combination is not something Rokt documents publicly as a partner-facing artifact, and 08's white-space synthesis rewards *integration* over any single feature. But the individual ingredients are all standard (event sourcing, SNIPS/DR, bandits), so a determined skeptic can decompose it into known parts. It's interesting because of the *assembly and the trust framing*, not because any component is new.

**(c) Demonstrable/defensible by a junior eng: 60%.**
Demonstrable: HIGH — 09 Part D rates every core piece HIGH on synthetic data and even recommends almost exactly this as the flagship prototype. Defensible: the concern. Full scope (bandit + uplift + calibration + SNIPS/DR + multi-objective + hash-chain + drift + LLM rationale) is a lot for an early-career engineer to defend under staff-level questioning. Confidence rises to ~75% *if* scoped to the smallest honest version (Q18) and falls to ~45% if presented at full breadth.

**Blended honest confidence that Threshold is a strong winner: ~63%.** It is the best of the three for a decision-science proof-of-work, but it is not a slam-dunk — its strength (breadth/depth) is also its biggest execution risk.

### The single biggest reason it might be dismissed as generic

**"This is a constrained contextual recommender with an audit log — i.e., a description of Rokt Brain plus event sourcing."** A skeptical reviewer collapses the whole thing into "recommender + logging," notes that Brain already decides, already shows nothing, already experiments (01, 02), and concludes the candidate re-skinned the existing engine and implied Rokt was missing governance it may already have internally.

### The single sharpest reframing that best protects it

**Lead with the counterfactual, not the recommender:** *"The demoable artifact is a **decision-change safety system**: before any policy change touches live traffic, it predicts the change's value from logged data (SNIPS/Doubly-Robust) and blocks it if support is insufficient — and every decision, including silence, is replayable bit-for-bit. The decision engine is deliberately boring and deterministic; the interesting part is proving a policy change is safe *without* an A/B, and being able to reconstruct exactly why any past decision happened."* This reframes it from "another recommender" (duplicative, generic) to "off-policy-safe change management + audit/replay" (adjacent, novel-in-assembly, evidenced by 09 §6 and 10 §3), and foregrounds the exact skills — counterfactual reasoning, fail-safe design, event sourcing — that make a senior engineer lean in. Pair it with the explicit "LLM is OFF in the core loop" stance (09 Part C) so no one mistakes it for an LLM toy.

### Ranking recommendation

**Keep "Threshold" at #1** — with the reframing above and the scope cut to the smallest honest version. Rationale:
- It is the only one of the three that generates a **staff-level decision-science conversation** (Q14/Q15) and demonstrates the rare, valued judgment of *keeping the LLM out of the hot path* (09 Part C).
- #2 (Circuit Breaker) is the safest and most junior-defensible but has **no AI necessity** and hugs an existing Rokt primitive too closely — it's a strong *fallback* if the candidate's ML depth is shallow. **Recommendation: hold #2 as the hedge.** If in a mock defense the candidate cannot explain SNIPS/uplift/calibration cleanly, swap #2 to #1, because a flawlessly-defended reliability concept beats a shakily-defended decision-science concept.
- #3 (EDI console) is the best-evidenced pain but is **another dashboard with no AI and is peripheral to Rokt's Transaction-Moment identity** — keep at #3.

**Net:** #1 stays first *conditional on scope discipline and the counterfactual-first reframing*; #2 is the explicit safety-net if the candidate's decision-science depth doesn't hold up under questioning; #3 stays third.

---

## One-line verdicts

| # | Concept | Verdict | Core reason |
|---|---------|---------|-------------|
| 1 | Threshold | **SURVIVES (conditional)** | Adjacent governance/replay/OPE layer is defensible + synthetic-demoable; duplication risk on the decision core is real but framing-fixable; scope is the execution risk |
| 2 | Conversion-Safe Circuit Breaker | **WEAK** | Excellent, junior-defensible reliability engineering, lowest trust risk — but no AI necessity and closest to a renamed existing primitive |
| 3 | Catalog EDI Reconciliation Console | **WEAK** | Best-evidenced pain, least duplicative — but "another dashboard," no AI necessity, peripheral to Rokt's decision-science identity |
