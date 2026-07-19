# 27 — The Transaction Moment as a Domain: A DDD Model ("Moment Forge")

**Date:** 2026-07-19 · **Retrieval date:** 2026-07-19
**Author lens:** senior domain modeller (Evans/Vernon lineage) building the "Moment Forge" page for the Threshold proof-of-work.
**Purpose:** Model Rokt's *Transaction Moment* as a business **domain** using Domain-Driven Design — core vs. supporting vs. generic subdomains, bounded contexts, a context map with Evans' real integration patterns, the ubiquitous-language collisions that cause silent corruption, domain events, invariants, the "Context Fracture" failure class, and Threshold reframed as a **Semantic Change Compiler**.

**Labeling (carried from the research corpus):**
- `[VERIFIED-PUBLIC]` — stated in Rokt's public docs/blog, cited here or in `research/rokt/*` / `docs/*`.
- `[REPO]` — already built and tested in this repository (file named).
- `[INFERENCE]` — reasoned from cited facts + standard domain knowledge.
- `[HYPOTHESIS]` — plausible, explicitly unverified, flagged for validation.

**DDD citations** are to Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (2003, "Blue Book"); Vernon, *Implementing Domain-Driven Design* (2013, "Red Book"); and Fowler's bliki (martinfowler.com). Pattern definitions were re-verified 2026-07-19 against martinfowler.com/bliki/BoundedContext.html and the ddd-crew/context-mapping catalog.

**Honest boundary that governs the whole document:** Rokt's *internal* domain model, service boundaries, and team topology are **not public**. This is **not** a reverse-engineering of Rokt's architecture. It is a *domain model I would defend in a design review*, built from the public seams in `02_PUBLIC_ARCHITECTURE_MAP.md`, `09_AI_AND_DECISION_SCIENCE.md`, `20_CHANGE_MANAGEMENT_DEEPDIVE.md`, `25_EXECUTABLE_ARCHITECTURES.md`, `26_OUT_OF_BOX_OPPORTUNITIES.md`, `docs/TRANSACTION_INVARIANTS.md`, and `docs/PRODUCT_THESIS.md`. Bounded-context *names* are my modelling choices, not Rokt's org chart.

---

## 0. Why model the Transaction Moment as a domain at all

`[VERIFIED-PUBLIC]` Rokt personalizes and monetizes the "Transaction Moment" (cart → confirmation), which Rokt frames as "over 90% of ancillary revenue potential," at 10B+ transactions/yr, 1.1B customers, 17 countries, sub-100ms decisioning (`09`, `25`, `26`). That is a *lot* of behaviour compressed into a few hundred milliseconds on someone else's checkout page.

The senior-engineering insight DDD supplies: the Transaction Moment is not one model. It is **several models that share a vocabulary but not a meaning**. "Conversion," "offer," "reward," "include," "impression" each denote *different things* to the decisioning engine, the measurement system, the loyalty ledger, and the agent layer. Evans' entire strategic-design apparatus — subdomains, bounded contexts, context maps, ubiquitous language — exists precisely to *name where those meanings diverge and to govern the translation across the seam*. Where the translation is left implicit, you get silent corruption. That silent corruption is exactly the failure Threshold was built to catch — so modelling the Moment in DDD terms is not decoration; it is the theoretical frame that makes Threshold's centerpiece (the missing-attribute inversion) legible as a *general class of defect*, not a one-off bug.

Evans, Blue Book: a model is only meaningful *within a boundary*; "total unification of the domain model for a large system will not be feasible or cost-effective" (Fowler, BoundedContext, quoting/paraphrasing Evans). The Moment is a textbook case for **strategic** DDD.

---

## 1. Subdomain classification — where the value actually lives

DDD (Evans, Part IV; Vernon, ch. 2) splits the problem space into **Core** (the differentiator you must build and must not outsource), **Supporting** (necessary, specific to you, but not the differentiator), and **Generic** (solved problems you should buy/adopt). The classification is a *business* judgement, not a technical one.

### 1.1 The Core Domain — the incrementality-proven, right-moment offer decision

**Claim:** Rokt's core domain is *deciding, per transaction and in real time, whether and which offer to surface such that the offer is **incrementally** valuable at that **specific moment** — and being able to **prove** that incrementality.* Two words carry the weight: **incrementality** and **moment**.

Why this is the core, argued from evidence:

- **It is the thing Rokt says is hard and proprietary.** `[VERIFIED-PUBLIC]` Rokt Brain "maximizes relevance through AI prediction" and determines "the next best action for every individual" in real time; the internal ranking mechanics are explicitly *not* publicly detailed (`02` Stage 5; `26`). Evans' test for a core domain is "the part your competitors can't just copy and that justifies the business" — Rokt guards exactly this.
- **The moment is the moat.** `[VERIFIED-PUBLIC]` The Transaction Moment is "over 90% of ancillary revenue potential" and is characterized by first-party context (cart, customer type, loyalty tier, UTM) available *only* at that instant (`02` Stage 3; `25`). The scarce asset is not "an ad" — it is the *decision made at the point of maximum intent and context*.
- **Incrementality is the standard Rokt is betting the category on.** `[VERIFIED-PUBLIC]` Rokt is standardizing on incrementality (Incrementality Performance Standard, StockX case; independent experiments with Haus) and the "Would Have Seen" holdout as the causal proof (`25`, `26`). A decision that lifts a metric is worthless to Rokt's thesis unless it lifts it *causally* — so "provable incrementality" is inside the core, not adjacent to it.
- **`09` corroborates the technical shape of the core:** it is a real-time **ranking + decisioning + auction** problem on tabular/behavioural signals under a <100ms budget — GBDT/bandits/uplift/OPE, *not* an LLM problem. The decision-science doc's entire thesis ("LLM is decorative in the hot path") is a statement about where the *core* lives: in calibrated, causal, deterministic-enough decisioning.

**Sharper framing of the core (my modelling):** the core is not "ranking." Ranking is a *mechanism*. The core is the **judgement that a surfaced offer is net-new value at this moment and the causal apparatus that certifies it** — i.e., ranking *conditioned on* incrementality (uplift/persuadables) *conditioned on* trust/fatigue at the moment (`25` Idea 1: the "show nothing" decision is a first-class core output, not a failure). "Show nothing" being a *core decision* is the non-obvious part and the part a junior model gets wrong.

### 1.2 Supporting subdomains — necessary, Rokt-specific, but not the moat

| Subdomain | Why supporting (not core) | Why not generic | Evidence |
|---|---|---|---|
| **Loyalty / Shopper Rewards** | Drives conversion and stickiness but is *downstream* of and *in service to* the offer decision; the moat is the decision, not the reward mechanic. | Reward *economics at the Transaction Moment* (earn/issue/redeem tied to a live checkout, exactly-once) is Rokt-specific, not an off-the-shelf loyalty SaaS. | `[VERIFIED-PUBLIC]` Shopper Rewards / Gift-with-Purchase (Jul 2026); `25` Idea 2; `26` #4 |
| **Integration / Measurement** | Makes the core *usable and trustworthy* (attribution, reconciliation) but does not itself decide. | Attribution keyed to Rokt's own click/confirmation model + `unprocessedRecords`/dedup semantics is specific to Rokt's pipeline. | `[VERIFIED-PUBLIC]` Attribution, dedup, Integration Monitor (`02` Stages 10-11; `20`) |
| **Catalog / Offers / Demand** | The inventory the core selects *from*; essential, but interchangeable relative to the decision quality. | Advertiser campaigns, creatives, audience lists, Cart-API cross-sell providers are Rokt-shaped. | `[VERIFIED-PUBLIC]` Network/Catalog, provider fulfillment (`02` Stage 6) |
| **Identity / Consent / Eligibility** | Gates and scopes the decision; load-bearing for legality and trust, but a *constraint layer* around the core, not the differentiator. | Rokt's identifier set (raw email, emailsha256, E.164, Click ID) + `noFunctional`/`noTargeting` semantics are specific. | `[VERIFIED-PUBLIC]` Identity & consent flags (`02` Stages 3-4) |

`[INFERENCE]` These are "supporting" in Evans' precise sense: you *must* build them well and they *are* specific to Rokt, but a 10% improvement in any of them is worth less than a 10% improvement in decision incrementality. That relative-value test is the whole point of the core/supporting split.

### 1.3 Generic subdomains — solved elsewhere, adopt don't invent

- **Payments / authorization / settlement.** `[VERIFIED-PUBLIC]` Rokt's public surface deliberately stops at cart *state* (`reserve → confirm/release → cancel`) and hands fulfillment to providers; there is **no refund/settlement math** in the Cart API (`02` Stage 9). Money movement is a generic subdomain — buy it, conform to it. (Threshold mirrors this deliberately: it "models cancellation state transitions only, with no money math," `docs/PRODUCT_THESIS.md`.)
- **Encryption / key management / transport security.** `[VERIFIED-PUBLIC]` AES-256, RSA-OAEP client-side PII encryption, TLS 1.2, envelope encryption (`02` §5) — all standard primitives, correctly *adopted*, not invented.
- **Observability / feature-flagging / experimentation plumbing.** `[VERIFIED-PUBLIC]` Integration Monitor is built *on Workato*; the repo's stance names Datadog/LaunchDarkly/Statsig as the generic layer (`PRODUCT_THESIS.md` "IS NOT"). Generic infrastructure.

**One-line thesis for the page:** *Rokt's core is a provably-incremental, right-moment decision; loyalty, measurement, catalog, and consent are the supporting ring that makes that decision usable and trustworthy; payments, crypto, and observability are generic and adopted. Threshold sits deliberately **beside** the core — a deterministic safety gate on **changes** to the rules around the decision, never the decision itself* (`PRODUCT_THESIS.md`).

---

## 2. Bounded Contexts

A bounded context is "a central pattern in DDD [that] divides large models into separate contexts, each with its own unified model … you need a different model when the language changes" (Fowler, BoundedContext, 2026-07-19). Below: 7 contexts, each with its **responsibility**, its **model boundary** (what it is authoritative over), and the **language it owns** (terms that mean something *specific* inside it). Names are my modelling `[INFERENCE]`; the seams they wrap are `[VERIFIED-PUBLIC]`.

### BC-1 · Decisioning / Brain (the Core context)
- **Responsibility:** given event-time context, decide *whether and which* offer to surface (including "show nothing"), ranked by expected incremental value under latency and constraint budgets.
- **Model boundary:** owns `Candidate`, `Score`, `Ranking`, `NextBestAction`, the null/"no-offer" candidate, calibrated `p(engage)·E[value]`. Authoritative over *which offer*, never over *whether the change to the rules is safe*.
- **Language it owns:** "relevance," "next best action," "candidate," "score/rank," "suppression." `[VERIFIED-PUBLIC]` (`02` Stage 5; `26`). Internal model **opaque by design** — treat as a probabilistic black box everything else must wrap.

### BC-2 · Change-Safety / Approval (Threshold's context)
- **Responsibility:** before a **policy/eligibility change** reaches a customer, prove it fails closed, preserves checkout, respects hard constraints, and is *eligible only* for a holdout. This is Threshold. `[REPO]`
- **Model boundary:** owns `PolicyVersion` (immutable), `PolicyDiff`, `Constraint`, `Verdict {BLOCKED | INSUFFICIENT_EVIDENCE | ELIGIBLE_FOR_HOLDOUT}`, `AuditTrail`. Authoritative over *is this change safe to enter review/holdout* — never *which offer* and never *did it lift*.
- **Language it owns:** "policy version," "diff," "constraint result," "fail-closed proof," "verdict," "eligibility for a holdout" (a term that means something very specific and *narrow* here — see §4). `[REPO: policy.py, diff.py, constraints.py, verdict.py]`; grounded in Rokt's real "Save-and-Edit → manual approval queue" pipeline (`20`).

### BC-3 · Incrementality / Holdout (the "Would Have Seen" context)
- **Responsibility:** establish *causal* lift via controlled holdouts; assign and *forever honor* Would-Have-Seen (WHS) membership; compute incremental revenue as a treatment-minus-control gap.
- **Model boundary:** owns `Experiment`, `HoldoutAssignment`, `WHSMember`, `Uplift/CATE`, `LiftEstimate`, `OPE support`. Authoritative over *did it causally lift* and *who is held out* — the **only** context allowed to certify causal lift (`TRANSACTION_INVARIANTS.md` #12).
- **Language it owns:** "holdout," "control," "Would Have Seen," "persuadable," "incremental," "uplift/Qini," "support/refuse-to-estimate." `[VERIFIED-PUBLIC]` WHS mechanics ("once a member, always a member … excluded from all future opportunities," `26` #1); `[REPO: ope.py]` support-guard.

### BC-4 · Loyalty / Rewards (Shopper Rewards context)
- **Responsibility:** define and honor reward economics at the moment — who earns, at what rate, tiers, who can redeem; issue rewards as financial liabilities with exactly-once semantics.
- **Model boundary:** owns `RewardPolicy` (earn-rate, tier thresholds), `EarnedReward`, `IssuedReward`, `RedeemableReward`, `RewardLedger`. Authoritative over *reward state* — three states that can silently diverge (§4).
- **Language it owns:** "earn," "issue," "redeem," "tier," "earn-rate," "liability." `[VERIFIED-PUBLIC]` Gift-with-Purchase/Shopper Rewards (`25` Idea 2; `26` #4).

### BC-5 · Integration / Measurement (Attribution & reconciliation context)
- **Responsibility:** ingest conversion/engagement signals, attribute them to the originating decision, deduplicate, reconcile against partner systems, and surface integration drift.
- **Model boundary:** owns `ConversionEvent`, `AttributionMatch`, `DedupKey (conversiontype:confirmationref)`, `unprocessedRecords`, `IntegrationMonitor`. Authoritative over *what counts as a recorded conversion* and *whether the integration is healthy* — **not** over *incremental* conversion (that's BC-3).
- **Language it owns:** "conversion" (as a *dedup/recording* event), "attribution," "match key," "confirmation reference," "reconciliation," "discrepancy." `[VERIFIED-PUBLIC]` (`02` Stages 10-11; `20`); `[REPO: conversions.py]`.

### BC-6 · Consent / Eligibility (Identity & policy-gating context)
- **Responsibility:** resolve identity, enforce consent flags, and evaluate *hard* eligibility/brand-safety/frequency constraints that scope who may be shown what.
- **Model boundary:** owns `IdentityResolution`, `ConsentState (noFunctional/noTargeting)`, `EligibilityRule`, `Operator`, `FrequencyCap`, `BrandSafety`. Authoritative over *may this shopper be targeted at all* and *what the rule operators mean*.
- **Language it owns:** "eligible/ineligible," "include/exclude," "consent," "sensitive attribute," "frequency cap," "brand-safe." `[VERIFIED-PUBLIC]` (`02` Stages 3-4; `20` #7 — the Include/Exclude inversion lives here); `[REPO: policy.py Operator, constraints.py]`.

### BC-7 · Agent-Mediation (emerging context)
- **Responsibility:** when an LLM shopping agent is in the loop, verify its authorization envelope (AP2/ACP mandate chain), classify the mediation channel, and check presentation integrity of what was actually surfaced.
- **Model boundary:** owns `AgentMandate {Intent, Cart, Payment}`, `AuthorizedActionEnvelope`, `MediationClass {direct-human | agent-assisted | fully-agentic}`, `PresentationIntegrity`. Authoritative over *what the human actually authorized* and *whether the offer was faithfully presented*.
- **Language it owns:** "mandate," "envelope," "agent-mediated," "impression" (in a *degraded/echoed* sense — see §4), "conformance." `[VERIFIED-PUBLIC]` (checkout as "validation layer for AI-led journeys," AP2 mandates; `26` #2/#3). **`[HYPOTHESIS]` context** — low volume in 2026, modelled as a stable abstraction (a signed envelope), not a specific wire protocol.

> **Optional 8th (support/generic):** **Catalog / Demand** (advertiser campaigns, creatives, provider fulfillment; `02` Stage 6). Modelled as an upstream supplier to BC-1, kept out of the seven "core-adjacent" contexts because it is closer to a generic marketplace inventory concern. Include it on the page only if space allows.

---

## 3. Context Map — the relationships and the pattern governing each seam

Evans' context-map patterns (Blue Book, ch. 14; re-verified against ddd-crew/context-mapping, 2026-07-19):
- **Anticorruption Layer (ACL):** a client-side translator that prevents an upstream context's model/language from leaking into and corrupting the downstream model.
- **Open-Host Service (OHS):** publish a stable protocol/service for all integrators.
- **Published Language (PL):** a shared, documented interchange language at a seam.
- **Conformist:** downstream slavishly adopts the upstream model (no translation), accepting its terms.
- **Customer/Supplier:** upstream (supplier) prioritizes a downstream (customer) that has some veto power.
- **Shared Kernel:** two contexts share an explicitly bounded subset of the model, changed only by agreement.
- **Partnership:** two contexts succeed or fail together and coordinate closely.

```
                         THE TRANSACTION-MOMENT CONTEXT MAP  [INFERENCE on patterns; seams VERIFIED-PUBLIC]

   ┌────────────────────────┐        Published Language           ┌────────────────────────┐
   │ BC-6 Consent/Eligibility│  ── EligibilityRule / Operator ──▶ │  BC-1 Decisioning/Brain │
   │  (owns include/exclude) │      (the rule vocabulary)          │   (Core; opaque model)  │
   └───────────┬─────────────┘                                     └───────────┬────────────┘
               │ Shared Kernel (the Operator + missing-value semantics)         │ Customer/Supplier
               │  — the DANGEROUS seam; must be a Shared Kernel, is often        │  (Brain supplies the
               │    an implicit Conformist → this is the Context Fracture (§7)   │   decision; Measurement
               ▼                                                                 ▼   is the customer)
   ┌────────────────────────┐   Anticorruption Layer (Threshold)   ┌────────────────────────┐
   │ BC-2 Change-Safety      │ ◀── validates a CHANGE before it ── │  BC-5 Integration/      │
   │  (Threshold; ACL on     │      corrupts any downstream model  │   Measurement           │
   │   every policy change)  │                                     │  (owns "conversion" =   │
   └───────────┬─────────────┘                                     │   dedup/recording)      │
               │ Partnership                                        └───────────┬────────────┘
               │ (Change-Safety + Holdout: a positive verdict is                │ ACL required
               │  ONLY eligibility for the holdout — they co-govern release)    │ (dedup "conversion" ≠
               ▼                                                                 ▼  incremental "conversion")
   ┌────────────────────────┐        Partnership / Shared          ┌────────────────────────┐
   │ BC-3 Incrementality/    │ ◀────── WHS integrity ref ───────── │  BC-4 Loyalty/Rewards   │
   │  Holdout (the ONLY      │      (holdout exclusion must hold    │  (owns earn/issue/      │
   │   causal certifier)     │       across reward surfaces too)    │   redeem; a liability)  │
   └───────────┬─────────────┘                                     └────────────────────────┘
               │ Anticorruption Layer
               ▼
   ┌────────────────────────┐
   │ BC-7 Agent-Mediation    │  Conformist to external AP2/ACP/UCP standards (a MOVING upstream);
   │  (mandate + envelope)   │  ACL into BC-1 so a mandate constrains the offer decision.
   └────────────────────────┘
```

**Seam-by-seam, with the pattern and the *why*:**

1. **BC-6 Consent/Eligibility → BC-1 Brain — Published Language (the rule vocabulary).** The eligibility rules (`Operator`, `value`, `sensitive`, `consent_required`) are the *published language* the Brain consumes to scope candidates. `[REPO: policy.py]` `[INFERENCE]` on the pattern. Rationale: many producers (operators, audience tooling) write rules; one consumer (the decision) reads them; a published, documented rule schema is Evans' prescription for that fan-in.

2. **BC-6 ↔ BC-2 Change-Safety on the *Operator semantics* — Shared Kernel (and this is the load-bearing claim).** The meaning of `include_is_not_in` vs `exclude_is_in` — specifically *what happens to a **missing** attribute* — is a piece of model that Consent/Eligibility and Change-Safety **must agree on exactly**. Evans' Shared Kernel is the right pattern: an explicitly bounded, jointly-owned subset changed only by agreement. `[VERIFIED-PUBLIC]` the two operators "differ ONLY on MISSING values" (`policy.py` comment, grounded in Rokt Audience-targeting docs; `20` #7). **When this seam is *not* an explicit Shared Kernel, it silently degrades into a Conformist relationship** where a downstream just accepts whatever the operator "obviously" means — and that is exactly the Context Fracture (§7).

3. **BC-2 Change-Safety → everything downstream — Anticorruption Layer.** This is the cleanest DDD reframing of Threshold: **Threshold is an ACL for *change itself*.** Evans' ACL "prevents the server's BC concepts and language from penetrating into its BC." Threshold prevents a *semantically corrupt change* — one whose meaning shifts across a boundary — from penetrating into the live decisioning, loyalty, and measurement models. It sits at the boundary and *refuses translation that changes meaning*. `[REPO]` `[INFERENCE on the ACL framing]`.

4. **BC-1 Brain → BC-5 Measurement — Customer/Supplier.** The Brain (supplier) produces decisions; Measurement (customer) consumes them to attribute conversions and has veto-shaped feedback (integration drift alerts force upstream investigation). `[VERIFIED-PUBLIC]` Integration Monitor "can alert Rokt to conduct an investigation" (`02` Stage 11). Customer/Supplier fits: coordinated, with the downstream holding leverage.

5. **BC-5 Measurement ↔ BC-3 Incrementality — Anticorruption Layer (mandatory).** Both use the word "conversion," but Measurement means *deduplicated recorded event* and Incrementality means *causally-incremental outcome*. An ACL **must** translate between them or the lift number silently double-counts non-incremental conversions. This is the single most expensive missing ACL in the map (§4.2). `[VERIFIED-PUBLIC]` dedup keys (`02` Stage 10) vs. incremental-lift framing (`26` #1).

6. **BC-2 Change-Safety ⟷ BC-3 Holdout — Partnership.** They co-govern release and *cannot* be decoupled: a positive Threshold verdict is defined as "*eligibility for a controlled online holdout — never safe to launch*" (`TRANSACTION_INVARIANTS.md` #12; `verdict.py`). Neither certifies release alone — Change-Safety filters *known* harms, Holdout establishes *causal* safety. Evans' Partnership (mutual success/failure, tight coordination) is exact.

7. **BC-3 Holdout ⟷ BC-4 Loyalty — Partnership / shared WHS integrity.** "All future opportunities" for a WHS member now spans reward surfaces too (`26` #1/#6); the holdout-exclusion invariant must be honored *inside* the reward context. They share the WHS-integrity reference — a small, jointly-owned kernel of "who is excluded, globally."

8. **BC-4 Loyalty ← BC-5 Measurement — ACL.** Reward "earned/issued/redeemable" must reconcile against recorded conversions without letting Measurement's recording semantics silently define reward liability. `[REPO pattern: outbox.py, conversions.py]` `[HYPOTHESIS]` on the loyalty extension.

9. **BC-7 Agent-Mediation — Conformist upstream, ACL downstream.** Toward the external agent-payment standards (AP2/ACP/UCP), BC-7 is a **Conformist** to a *moving* upstream it cannot control (`26` #2 flags the protocol volatility: ACP's product died in 5 months). Toward BC-1, BC-7 installs an **ACL** so a signed mandate becomes a *hard constraint* on the offer decision. Modelling to the stable abstraction (a signed envelope) rather than a wire format is how you conform to a moving target without corrupting the core.

---

## 4. Ubiquitous-Language Collisions — the heart of the page

This is the section that earns the "senior" label. Evans: a word means what it means *inside a bounded context*; at the seam, "the same term … has subtly different meanings" and integration requires **explicit mapping between these polysemic concepts** (Fowler's "meter" example, BoundedContext). Where the mapping is *implicit*, meaning silently corrupts. Below, six collisions. For each: the two (or three) meanings, the boundary they collide at, and the failure if translation is left implicit.

### 4.1 "include / exclude" — the missing-attribute inversion (Threshold's centerpiece) ★
- **Meaning A (BC-6 Consent/Eligibility, operator `include_is_not_in`):** *eligible only if the attribute is **present** AND its value is not in the list.* A **missing** attribute ⇒ **EXCLUDED**. `[REPO: policy.py]`
- **Meaning B (BC-6, operator `exclude_is_in`):** *excluded only if the attribute is **present** AND its value is in the list; otherwise eligible.* A **missing** attribute ⇒ **INCLUDED**. `[VERIFIED-PUBLIC]` the two "differ ONLY on MISSING values" (Rokt Audience targeting; `20` #7).
- **Boundary:** BC-6 ↔ BC-2 (the Shared Kernel of Operator semantics), seam #2 above.
- **Failure if implicit:** an operator "just flipping include→exclude" reads as a *cosmetic* rewrite to a human and to a naive diff — same attribute, same value list. But every session with a **missing** value silently flips from excluded to eligible: a **silent eligibility-widening** that no test, no lint, and no value-level diff catches. It only manifests as more offers shown to people the policy author never intended to reach. **This is the canonical Context Fracture (§7):** a change *valid inside BC-6's own model* changes *meaning* the moment it crosses into live decisioning, because the seam lacked an ACL. Threshold catches it by **counterfactual isolation** — revert *just* that operator and check whether any missing-attribute session's offer disappears (`constraints.py::missing_attribute_semantics`; `TRANSACTION_INVARIANTS.md` #10).

### 4.2 "conversion" — dedup key vs. revenue vs. incremental ★
- **Meaning A (BC-5 Measurement):** a **deduplicated recorded event**, identity = `conversiontype:confirmationref`; the question it answers is "have we already counted this?" `[VERIFIED-PUBLIC]` (`02` Stage 10; `conversions.py`).
- **Meaning B (BC-4 Loyalty / commerce):** a **revenue/obligation event** — a purchase that may earn a reward or create a liability.
- **Meaning C (BC-3 Incrementality):** an **incremental** outcome — a conversion *caused* by the offer, i.e., treatment-minus-control, net of who would-have-converted-anyway. `[VERIFIED-PUBLIC]` (`26` #1).
- **Boundary:** BC-5 ↔ BC-3 (seam #5), and BC-5 ↔ BC-4 (seam #8).
- **Failure if implicit:** feed Measurement's *recorded* conversions straight into a lift calculation and you count non-incremental conversions as lift — the exact upward bias Rokt's incrementality standard exists to kill. Or feed a recorded conversion straight into reward issuance without the dedup translation and you double-issue a liability (`26` #4). Three meanings, one word: without an ACL at each seam, the number that leaves is not the number that was meant.

### 4.3 "reward" — earned vs. issued vs. redeemable ★
- **Meaning A (earned):** the shopper *qualified* for a reward by completing the action.
- **Meaning B (issued):** the reward has been *materialized* (gift card generated, cashback posted) — a booked liability.
- **Meaning C (redeemable):** the reward is *currently usable* (not expired, not clawed back).
- **Boundary:** internal to BC-4 Loyalty, and BC-4 ↔ BC-5 Measurement.
- **Failure if implicit:** treat the three as one field and partial failures make them silently diverge — a shopper *earned* but never *issued* (an orphan → support ticket, churn), or *issued* twice from one *earn* (double liability). "Earned == issued == redeemable" is only true if a reconciliation replay proves it; collapsing the words *assumes* the invariant instead of *checking* it. `[VERIFIED-PUBLIC]`/`[HYPOTHESIS]` (`26` #4).

### 4.4 "offer / placement"
- **Meaning A (BC-1 Brain):** an **offer** is a *candidate the decision ranks* (including the null candidate, "show nothing").
- **Meaning B (BC-6 / rendering):** a **placement** is a *slot/format* on the page (Overlay/Embedded/Interstitial) that may or may not be filled. `[VERIFIED-PUBLIC]` placement formats and `POST /v1/placements/any` "are there placements to display?" (`02` Stages 4,7).
- **Boundary:** BC-1 ↔ BC-6/rendering.
- **Failure if implicit:** conflate "no offer selected" (a *decision*) with "no placement available" (a *capability*) and you lose the ability to distinguish a deliberate trust-preserving "show nothing" from an integration failure — collapsing a core *decision* into an infrastructure *absence*. The `PLACEMENT_FAILURE` event and the No-Offer-Rendered fallback are different objects that a shared word tempts you to merge (`02` Stage 8; `TRANSACTION_INVARIANTS.md` #1-2).

### 4.5 "holdout member / Would-Have-Seen"
- **Meaning A (BC-3, statistical):** a member of the *control group* for a specific experiment window.
- **Meaning B (BC-3/BC-4/BC-6, systems-integrity):** a **WHS member** who is "*always a member and excluded from all future opportunities*" across *every* surface, forever — a global, append-only, exactly-once exclusion. `[VERIFIED-PUBLIC]` (`26` #1).
- **Boundary:** BC-3 ↔ BC-4 ↔ BC-6 (the WHS exclusion must hold in loyalty and eligibility too).
- **Failure if implicit:** treat WHS as a per-experiment statistical label and a single leaked exposure on *another* surface silently biases measured lift **upward**, with no dashboard showing it. Rokt's incrementality standard's *validity* rests on this being a distributed-systems invariant, not a stats footnote — "incrementality is a systems-integrity problem before it's a statistics problem" (`26` #1). The word "holdout" hides which of the two you mean.

### 4.6 "impression" — human vs. agent-mediated
- **Meaning A (BC-5/BC-1, classical):** an **impression** is a *faithful rendering* seen by a human — the atom incrementality assumes.
- **Meaning B (BC-7, agent-mediated):** an agent may "show" an offer while stripping imagery, truncating the value prop, reordering, or burying it — a **degraded/echoed impression**. Exposure ≠ exposure. `[VERIFIED-PUBLIC]` (`26` #3).
- **Boundary:** BC-7 ↔ BC-5/BC-1.
- **Failure if implicit:** measurement blends faithful and degraded impressions under one word, so lift silently drops for reasons attribution can't see, and "it converts" (for humans) is mistaken for "it converts through a bot" — the blunt lesson of Instant Checkout's near-zero sales (`26` #3). Without a presentation-integrity translation at the seam, the impression count lies.

**Why this section is the page's spine:** every one of the six is a place where a change that is *locally valid* becomes *globally wrong* because a shared word carried a different meaning across a seam with no ACL. That is the general disease; the missing-attribute inversion (4.1) is the one Threshold already diagnoses and treats.

---

## 5. Domain Events — what actually flows through the Moment

Modelled in the past tense (Vernon, Red Book ch. 8: domain events are named as *facts that have happened*). Each tagged with its **owning context** and evidence.

| Event | Owning BC | Meaning / trigger | Evidence |
|---|---|---|---|
| `PlacementRequested` | BC-6→BC-1 | funnel reaches the moment; context assembled; "are there placements?" | `[VERIFIED-PUBLIC]` `/v1/placements/any` (`02` S4) |
| `OfferSelected` | BC-1 | the Brain chose a non-null candidate | `[VERIFIED-PUBLIC]` decisioning (`02` S5) |
| `NoOfferRendered` | BC-1/BC-2 | deliberate "show nothing" **or** fail-closed fallback — *one event, two causes to keep distinct* | `[VERIFIED-PUBLIC]` fallback; `[REPO: failclosed.py]` |
| `PlacementFailed` | BC-1 rendering | unrecoverable render error | `[VERIFIED-PUBLIC]` `PLACEMENT_FAILURE` (`02` S8) |
| `OfferEngaged` / `PositiveEngagement` | BC-1→BC-5 | shopper interacted / accepted | `[VERIFIED-PUBLIC]` engagement events (`02` S8) |
| `CartItemReserved` / `Confirmed` / `Released` / `ConfirmationCanceled` | BC (commerce)/generic | Cart-API state transitions | `[VERIFIED-PUBLIC]` (`02` S9); `[REPO: cancellations.py]` |
| `ConversionRecorded` | BC-5 | deduped conversion booked (`conversiontype:confirmationref`) | `[VERIFIED-PUBLIC]`; `[REPO: conversions.py]` |
| `ConversionDeduplicated` | BC-5 | a repeat delivery collapsed to no-op | `[REPO]` |
| `RewardEarned` / `RewardIssued` / `RewardRedeemed` | BC-4 | the three distinct reward-state facts (§4.3) | `[VERIFIED-PUBLIC]`/`[HYPOTHESIS]` (`26` #4) |
| `HeldOutMemberExcluded` / `WHSMemberAssigned` | BC-3 | WHS assignment / a suppression enforced by the exclusion gate | `[VERIFIED-PUBLIC]` (`26` #1) |
| `HoldoutMemberLeaked` | BC-3 | integrity violation: a WHS member was exposed (the event you must be able to detect) | `[HYPOTHESIS]` (`26` #1) |
| `PolicyChangeSubmitted` | BC-2 | a proposed policy version enters the safety gate | `[REPO: replay.py]` |
| `PolicyChangeBlocked` / `PolicyChangeEligibleForHoldout` | BC-2 | verdict issued | `[REPO: verdict.py]` |
| `RequiresReapprovalDetected` | BC-2 | a material-term change re-enters Rokt's manual approval queue | `[VERIFIED-PUBLIC]` (`20` #3); `[REPO]` |
| `MandateVerified` / `MandateRejected` | BC-7 | agent authorization envelope validated / refused | `[VERIFIED-PUBLIC]`/`[HYPOTHESIS]` (`26` #2) |
| `IntegrationDriftDetected` | BC-5 | session/conversion discrepancy vs. GA | `[VERIFIED-PUBLIC]` Integration Monitor (`02` S11) |

`[REPO]` note: the outbox already emits `events_for_job(...)` atomically with the verdict commit (`outbox.py`, `replay.py`) — the event-flow model is not hypothetical for BC-2; it is shipped and tested (`test_outbox.py`).

---

## 6. Invariants — the "Laws of the Moment"

Always-true rules, each a domain invariant in Evans' sense (a rule the model must never violate). Grounded in `docs/TRANSACTION_INVARIANTS.md` unless noted.

1. **Checkout independence / fail-closed.** The merchant's checkout has zero synchronous dependency on the offer path; any offer-side failure resolves to `NoOfferRendered`; an offer is *never* produced on a failure path. (`TI` #1-2; `failclosed.py`) — *the first law; everything else is subordinate to not harming checkout.*
2. **Holdout is the only causal mechanism.** A positive change-safety verdict is *eligibility for a controlled online holdout*, never "safe to launch"; replay filters *known* violations, it does not establish causal safety. (`TI` #12; `verdict.py`)
3. **Deterministic evaluation.** For a given `(event-time snapshot, policy)` the decision is a pure function — no I/O, randomness, or wall-clock — so replay is bit-for-bit reproducible. (`TI` #3; `evaluator.py`)
4. **No future-information leakage.** Replay evaluates only the event-time snapshot captured on the session; it never joins a later/current profile. (`TI` #4)
5. **Immutable policy versions.** A published version's document never changes; every decision references exactly one version. (`TI` #5; `models.PolicyVersionRow`)
6. **Effectively-once financial state over at-least-once delivery.** Conversions (and, extended, reward earn/redeem) dedupe on `conversiontype:confirmationref`; a repeated delivery updates state exactly once. *Effectively-once state*, not "exactly-once delivery." (`TI` #6; `conversions.py`)
7. **Single enforcement point for hard constraints.** Eligibility/consent/brand-safety/frequency/latency/holdout + the missing-attribute check live in one deterministic validator; a FAIL blocks release. (`TI` #9; `constraints.py`)
8. **Missing-attribute safety.** An operator change that flips missing-value behaviour is isolated by counterfactual and blocks release when any replayed missing-attribute session is silently widened. (`TI` #10)
9. **Append-only, tamper-evident audit.** Every run appends HMAC-carrying records; verification localizes post-write modification — *integrity, not truth.* (`TI` #8; `audit.py`)
10. **Idempotent jobs.** A repeated `Idempotency-Key` returns the same job; it is never re-run. (`TI` #7; `replay.py`)
11. **Tenant scoping.** All queries scoped by `merchant_id`; one merchant's data is never returned for another. (`TI` #11)
12. **WHS exclusion is global and permanent.** `[VERIFIED-PUBLIC]`/`[HYPOTHESIS]` once a shopper is a Would-Have-Seen member for a brand/experiment, they are excluded from *all future opportunities across all surfaces* — an append-only, exactly-once, fail-closed exclusion (fail-closed = if the ledger can't confirm "not held out," treat as held out). (`26` #1)
13. **Suppression is a decision, not an absence.** Every `NoOfferRendered` records *why* (`hard_fail:consent | fatigue | below_value_threshold | fallback:*`) — a deliberate "show nothing" is a first-class, audited core output, distinct from an integration failure. (`25` Idea 1; `TI` #2)

---

## 7. Context Fracture — the missing-attribute trap as a *semantic* failure, generalized

**Definition (my modelling `[INFERENCE]`, built on Evans):** a **Context Fracture** is a change that is **valid and meaning-preserving inside its authoring context** but **changes meaning as it crosses a boundary that lacks an anticorruption layer** — so no local check can catch it, and the corruption only surfaces as wrong behaviour downstream. It is the strategic-DDD name for the class of bug Threshold exists to catch.

**The canonical fracture (missing-attribute inversion):** inside BC-6 Consent/Eligibility, flipping `include_is_not_in → exclude_is_in` is a valid operator edit — same attribute, same value list, passes schema validation, passes every value-level diff. But the BC-6↔live-decisioning seam is really a **Shared Kernel** over missing-value semantics (§3, seam #2), and when that seam is treated as an implicit **Conformist** (downstream "just uses" the operator), the missing-attribute cohort silently flips from EXCLUDED to ELIGIBLE. The meaning changed *at the boundary*; the author never saw it. `[VERIFIED-PUBLIC]` operator semantics; `[REPO]` detection.

**Two-to-three other plausible fractures (`[HYPOTHESIS]`/`[INFERENCE]`):**

- **F2 — "conversion" recorded→incremental (BC-5↔BC-3).** A change that alters what Measurement *records* as a conversion (e.g., a new `conversiontype`, a dedup-key change) is locally valid for attribution, but crossing into Incrementality *without an ACL* silently changes what "lift" counts — inflating or deflating the causal number that Rokt's performance standard is sold on. A recording change becomes a measurement lie at the seam.
- **F3 — reward earn→issue (BC-4 internal / BC-4↔BC-5).** A change to earn-rate or tier-threshold is locally a marketing tweak, but crossing into the issuance ledger *without the effectively-once ACL* silently changes projected liability — over-issuing (a booked loss) or stripping earned status (a trust/compliance event). Valid promo edit, silent economic widening. (`25` Idea 2; `26` #4)
- **F4 — WHS exclusion per-surface→global (BC-3↔BC-4/BC-6).** Adding a *new surface* (a reward placement, onsite media) is locally valid, but if the WHS-exclusion kernel isn't shared into that surface, a holdout member is excluded on surface A and exposed on surface B — the exclusion invariant fractures across the seam and the experiment's validity dies silently. (`26` #1/#6)

**The unifying senior insight:** each fracture is a *shared word* (include, conversion, reward, holdout) carrying a *different meaning* across a seam that *should* be a Shared Kernel or ACL but is implicitly a Conformist. Threshold is the ACL that makes the translation explicit and *refuses the ones that change meaning.*

---

## 8. The Semantic Change Compiler — Threshold reframed in DDD terms

**Reframe:** Threshold is not (only) a policy-diff tool. It is a **Semantic Change Compiler**: it takes a proposed change and *compiles it into its semantic delta across bounded contexts*, then **refuses or flags** any change whose meaning shifts across a seam. A compiler doesn't just check syntax (does the policy parse?) — it checks that the *meaning* the author intended is the meaning that survives translation into every downstream context. "Compiles" is the right verb because the output is a *typed, deterministic verdict*, not an opinion.

**Conceptual inputs → outputs (grounded in the shipped engine):**

| Compiler stage | Conceptual role | Repo reality `[REPO]` |
|---|---|---|
| **Source** | `(base PolicyVersion, proposed PolicyVersion)` — two immutable documents | `POST /policy-diff`, `POST /replay-jobs` (`policies.py`, `replay.py`) |
| **Parse / AST** | structural diff surfacing the *operator* change specifically | `diff.py::diff_policies` — tags `missing_attribute_flip`, `eligibility_widened/narrowed` |
| **Semantic analysis** | replay event-time sessions through base vs. proposed; *counterfactually isolate* the meaning-change (revert just the operator) | `evaluator.py` (pure) + `constraints.py::missing_attribute_semantics` |
| **Type/constraint checking** | one deterministic validator over the semantic seams (consent, brand-safety, frequency, latency, holdout, immutable fields, reapproval, plausibility) | `constraints.py` (11 checks, each grounded in a VERIFIED fact) |
| **Refuse-to-emit guard** | if affected support is thin, *refuse* to output a confident estimate | `ope.py::support_guard` (`refuses_estimate`) |
| **Codegen / output** | a typed verdict `{BLOCKED | INSUFFICIENT_EVIDENCE | ELIGIBLE_FOR_HOLDOUT}` + fail-closed proofs + tamper-evident evidence | `verdict.py`, `failclosed.py`, `audit.py` |
| **Link step** | atomic fan-out of the verdict as domain events (to approval queue / measurement) | `outbox.py` (transactional outbox, tested) |

**The compiler's guarantee (stated as it must be, honestly):** it proves a change *does not cross a known semantic seam in a meaning-changing way* and is therefore *eligible* to enter the human approval queue and the holdout. It does **not** prove the change is good — only the holdout (BC-3) can. That is the ACL discipline: refuse the corrupting translations you *can* name; defer the causal question to the one context allowed to answer it.

**Domain Evolution Simulator (`[INFERENCE]` extension for the page):** the same compiler, run *forward* over a hypothetical sequence of changes, answers "how does the meaning of this policy drift over N edits?" — a semantic-drift simulation. Conceptually it is `run_replay` iterated across a change chain, accumulating the semantic-delta set and flagging the edit at which a fracture is introduced. Inputs: a base version + an ordered list of proposed edits. Output: the first edit that opens a Context Fracture. **Executable today** via repeated `POST /replay-jobs` over a version chain (`replay.py`); the accumulation/visualization is the new (thin) layer.

---

## 9. Which existing Threshold backend endpoints make this executable

The DDD model is not just a diagram — the Semantic Change Compiler and Domain Evolution Simulator are **runnable on the endpoints already shipped and tested** (`[REPO]`, all under `/api/v1/merchants/{merchant_id}`):

- `POST /policy-diff` — the compiler's **parse/AST** stage (`policies.py` → `diff.py`): surfaces the operator-flip and eligibility-widening risks directly.
- `POST /replay-jobs` (+ `GET /replay-jobs/{id}`) — the **full compile**: semantic analysis + constraint checking + refuse-guard + verdict, idempotent, with the atomic outbox link step (`replay.py` → `run_replay`).
- `GET /replay-jobs/{id}/audit` and `POST /replay-jobs/{id}/audit/verify` — the **tamper-evident evidence** the compiler emits (`audit.py`).
- `GET /replay-jobs/{id}/outbox` — the **domain-event fan-out** (§5) as booked facts (`replay.py`).
- `GET /scenarios` — five curated base→proposed pairs, each a different fracture/clear (trap, safe, fat-finger, consent, immutable) — a ready-made **Moment Forge demo reel** (`scenarios.py`).
- `POST /conversions` and `POST /cancellations` — the **Measurement/commerce** invariants (effectively-once dedup; cancellation state transition) as live proofs of laws #6 and the Cart-state model (`conversions.py`, `cancellations.py`).
- The **Domain Evolution Simulator** is `POST /replay-jobs` iterated over a version chain — no new core needed; only an accumulation view.

---

## 10. Honesty ledger

- **What is VERIFIED-PUBLIC:** the Transaction-Moment framing and scale; Cart-API state machine; `/placements/any`; placement formats and `PLACEMENT_FAILURE`; identity/consent flags; attribution + dedup keys; Integration Monitor; the manual approval queue + material-change re-approval + immutable fields; the **Include/Exclude missing-value inversion**; WHS holdout mechanics; Shopper Rewards/Gift-with-Purchase; incrementality standard + Haus; agent-checkout framing + AP2 mandates. All cited to `research/rokt/*` and Rokt sources.
- **What is `[REPO]`:** the deterministic core (evaluator, diff, constraints incl. the counterfactual missing-attribute check, failclosed, verdict, audit, ope support-guard), the transactional outbox, idempotency/dedup, and every endpoint in §9 — built and tested (38-test suite referenced in `25`).
- **What is `[INFERENCE]`/`[HYPOTHESIS]` (mine, not Rokt's):** the *core/supporting/generic* classification; the *seven bounded-context names and boundaries*; **every context-map pattern assignment** (ACL/OHS/PL/Conformist/Customer-Supplier/Shared-Kernel/Partnership); the **Context Fracture** concept and F2-F4; the **Semantic Change Compiler / Domain Evolution Simulator** reframing; BC-7 Agent-Mediation as a context. These are *modelling claims a Rokt engineer might refine*, never assertions about Rokt's internal architecture.
- **What I explicitly do NOT claim:** that Rokt's real domain model looks like this; that Rokt *lacks* any capability modelled here; any performance number not published by Rokt or measured in this repo. Where the WHS exact wording is search-retrieved (canonical URL 404'd), the *concept* is Rokt-published and the *phrasing* is best-effort (`26` honesty note).

---

## Sources (DDD, retrieved 2026-07-19)
- Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (2003) — subdomains, bounded context, ubiquitous language, context-map patterns (ACL, OHS, Published Language, Conformist, Customer/Supplier, Shared Kernel, Partnership), domain events, invariants.
- Vernon, *Implementing Domain-Driven Design* (2013) — core/supporting/generic subdomain distinction; domain events as past-tense facts.
- Fowler, "BoundedContext" — https://martinfowler.com/bliki/BoundedContext.html (definition; "you need a different model when the language changes"; polysemy/"meter" example).
- ddd-crew/context-mapping — https://github.com/ddd-crew/context-mapping (context-map pattern catalog, cross-checked).
- Rokt facts: `research/rokt/02_PUBLIC_ARCHITECTURE_MAP.md`, `09_AI_AND_DECISION_SCIENCE.md`, `20_CHANGE_MANAGEMENT_DEEPDIVE.md`, `25_EXECUTABLE_ARCHITECTURES.md`, `26_OUT_OF_BOX_OPPORTUNITIES.md`; `docs/TRANSACTION_INVARIANTS.md`, `docs/PRODUCT_THESIS.md`; repo: `backend/app/domain/*`, `backend/app/routers/*`, `backend/app/outbox.py`.
