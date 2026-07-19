# 14 — Opportunity Universe (Rokt Proof-of-Work)

**Synthesizer:** Opportunity Synthesis Lead
**Date:** 2026-07-18
**Inputs:** Reports 01–07, 09–12 (08 not on disk; COMPETITIVE FINDINGS block used for competitor/non-duplication fields).
**Purpose:** A broad, even-handed universe of ≥60 distinct candidate concepts for a Rokt-specific proof-of-work project (research/synthesis only — no product code proposed here). Companion scorecard: `15_WEIGHTED_SCORECARD.md`.

## How to read this

- **Evidence tags:** `VERIFIED` (stated in a Rokt/mParticle public source or the verified competitive block), `INDUSTRY` (documented industry-wide problem), `INFERENCE` (reasoned from evidence), `HYPOTHESIS` (plausible, unverified).
- Every block cites a **real public integration surface** (Cart API reserve/release/confirm/cancel, `/v1/placements/any`, `Selection.on()` events incl. `PLACEMENT_FAILURE`, Event & Audience API `/v2/events`, Integration Monitor, `noFunctional`/`noTargeting`, Data Deletion API, Custom Audience Import, Network Controls, Data Master violation reports, Experiments/holdouts).
- **Guardrail contract respected throughout:** checkout completion is sacred (never block/delay/divert; fail closed to "show nothing"); partner owns first-party data; tenant isolation; consent enforced; deterministic logic is the *correct* answer for money/eligibility/legal/brand-safety; LLMs live only at the periphery (copy w/ review, metadata enrichment, internal RAG).
- This document does **not** assert Rokt lacks any capability. "New" fields describe what a *prototype* would make visible/legible, framed against public capability and competitor precedent — Rokt very likely has internal versions of much of this.

**Category index (22):** shopper experience · checkout relevance · payment · post-purchase · catalog · advertising · customer data · identity · lifecycle activation · retention · cancellation · loyalty · privacy · brand safety · partner operations · experimentation · AI decisioning · developer platform · reliability · marketplace economics · accessibility · agentic workflows.

---

## SHOPPER EXPERIENCE

### C01 — "Why am I seeing this?" consumer transparency panel
- **Thesis:** A one-tap, per-placement disclosure that shows, in plain language, the (non-PII) signals that made this offer relevant and a live opt-out toggle.
- **User:** End shopper on the confirmation/thank-you page. **Pain:** 93% say mishandled data erodes trust; personalization is opaque and feels like surveillance (04 §3.10; 10 §3.1). `VERIFIED/INDUSTRY`
- **Nearby Rokt capability:** Rokt Brain decisioning; `noTargeting`/`noFunctional` consent flags. **Competitor precedent:** Ad "AdChoices" icons exist but are generic; no confirmation-moment "why this offer + reason codes" panel from Rebuy/Klarna/Afterpay. **New:** reason codes derived from a deterministic score breakdown, shown to the *consumer* at the moment.
- **Why Rokt owns it:** Rokt already enforces "show the right content or nothing"; exposing the reason turns a guardrail into a trust signal. **AI method:** deterministic (score-component breakdown); LLM may phrase the sentence with human-reviewed templates. **Data:** offer features + consent state; synthetic suffices. **Privacy:** strictly positive — no new PII; surfaces existing basis. **Integration:** `Selection.on()` render events + consent flags. **2-min story:** toggle personalization off → offer set visibly changes → reason codes update → audit logs the consent change. **Metric:** opt-in retention / engagement-quality. **Guardrail:** never fabricate a reason; fail to a generic "relevance" statement. **Depth:** medium. **Reject reason:** thin backend; risks being a UI-only artifact.

### C02 — Timing-fit gate for confirmation offers (reassurance-first)
- **Thesis:** Suppress "future-purchase" offers until the purchase-confirmation status is visibly rendered, prioritizing fulfillment-relevant offers (parking, delivery add-on) first.
- **User:** Shopper anxious about "did my order go through?" (04 §2, Fandango support article). **Pain:** confirmation offer competes with reassurance need; buyer's remorse forms here (74% remorse). `VERIFIED/INFERENCE`
- **Nearby capability:** Smart Interactions suppression; frequency caps. **Competitor precedent:** none published; Rebuy/Afterpay fire offers immediately. **New:** an explicit reassurance-priority ordering rule tied to render state.
- **Why Rokt owns it:** confirmation moment is Rokt's home surface. **AI method:** deterministic ordering rules; optional fatigue decay model. **Data:** page-state + offer taxonomy; synthetic OK. **Privacy:** low. **Integration:** `PLACEMENT_READY`/`PLACEMENT_INTERACTIVE` events; `/v1/placements/any`. **2-min story:** show confirmation renders first, then fulfillment offer, then (later session) a cross-sell — vs a naive "offer-first" control. **Metric:** positive-engagement rate; complaint rate. **Guardrail:** never obscure confirmation. **Depth:** medium. **Reject reason:** hard to prove "reassurance" value on synthetic data.

### C03 — Declined-offer suppression memory
- **Thesis:** Remember offers a shopper explicitly declined and suppress near-duplicates across sessions to cut fatigue.
- **User:** Repeat shopper. **Pain:** 36% of unsubscribes cite irrelevance; re-showing rejected offers is a named fatigue driver (04 §3.4–3.5). `VERIFIED/HYPOTHESIS`
- **Nearby capability:** frequency caps (72h window). **Competitor precedent:** basic frequency caps everywhere; cross-session *decline-semantic* suppression not published. **New:** decline as a first-class negative signal with a decay.
- **Why Rokt owns it:** network-wide exposure history. **AI method:** deterministic counters + decay; embedding similarity optional. **Data:** exposure/decline logs; synthetic OK. **Privacy:** exposure counters, low-risk; must be per-tenant. **Integration:** `OFFER_ENGAGEMENT`/`PLACEMENT_CLOSED` events. **2-min story:** decline offer → it (and look-alikes) vanish next session; audit shows the suppression rule. **Metric:** engagement per impression; fatigue proxy. **Guardrail:** tenant isolation (never leak decline across partners). **Depth:** medium. **Reject reason:** overlaps existing frequency management.

---

## CHECKOUT RELEVANCE

### C04 — Warm-start decisioning conditioned on the CDP profile
- **Thesis:** At the moment of decision, condition offer eligibility/ranking on the mParticle Customer 360 (LTV, churn, next-7-day propensity) to fix the confirmation-page cold-start.
- **User:** Shopper; partner monetization team. **Pain:** Rokt historically had "only a moment" to know the shopper — the explicit merger rationale (03 §2). `VERIFIED`
- **Nearby capability:** Rokt Brain + mParticle Predictive Attributes (this is the merger thesis). **Competitor precedent:** Black Crow scores per-brand but doesn't own the paid moment; mParticle ships Predictive Attributes but not the checkout conditioning layer. **New:** the *orchestration seam* that passes profile features into the in-moment auction with latency budget + fallback.
- **Why Rokt owns it:** only Rokt has both the moment and the CDP under one roof. **AI method:** GBDT/propensity features feeding a ranker; deterministic eligibility on top. **Data:** profiles + impression logs; synthetic profiles OK. **Privacy:** first-party only; consent-gated features. **Integration:** Event & Audience API identity + `/experiences`. **2-min story:** identical shopper, cold-start vs warm-start → offer relevance and RPM differ; latency stays in budget; fall back to cold-start on profile miss. **Metric:** value per transaction (Rokt claims up to +30%). **Guardrail:** fail to cold-start, never block. **Depth:** high. **Reject reason:** closest to "better Rokt Brain" — must foreground the seam/fallback, not ranker quality.

### C05 — Deterministic eligibility + frequency + constraint pre-filter ("feasible set builder")
- **Thesis:** Before any ML ranking, compute the feasible offer set from hard rules (advertiser caps, exclusivity, geo/legal eligibility, sensitive-category limit, frequency caps) — auditable and ~0 violation.
- **User:** Partner brand-safety + advertiser ops. **Pain:** hard constraints must be deterministic/auditable; an LLM here is a liability (09 #14; 10 G11/G12). `VERIFIED`
- **Nearby capability:** Network Controls, "one offer per sensitive category per auction," frequency caps. **Competitor precedent:** every network filters, but few expose an auditable feasible-set trace. **New:** an explainable, testable constraint layer with per-decision provenance.
- **Why Rokt owns it:** contractual advertiser/partner rules live in Rokt. **AI method:** deterministic (the correct answer). **Data:** constraint defs + budget state; synthetic OK. **Privacy:** business rules, low. **Integration:** Network Controls + `/v1/placements/any`. **2-min story:** flip a constraint (exclusivity, age-gate) → offer disappears from the feasible set → violation-rate stays 0 → audit shows which rule fired. **Metric:** constraint-violation rate (~0) + fill. **Guardrail:** infeasible → "show nothing." **Depth:** high (Pavan-shaped: reconciliation-style single enforcement point). **Reject reason:** unglamorous vs a "smart" ranker — but that's the point.

### C06 — Multi-objective constrained reranker (revenue × relevance × advertiser ROAS)
- **Thesis:** Re-rank the feasible set to balance partner revenue, shopper relevance, and advertiser goals via constrained scalarization/Pareto, with the trade-off weights inspectable.
- **User:** Partner + advertiser. **Pain:** conflicting objectives; single-metric gaming (09 #7). `VERIFIED`
- **Nearby capability:** Rokt Brain optimization. **Competitor precedent:** internal to most networks; constraint-aware reranking literature reports +6.8% RPM/+4.9% CTR. **New:** a visible Pareto front + weight sliders as an *operator* artifact.
- **Why Rokt owns it:** owns both sides of the auction. **AI method:** constrained optimization + calibration; deterministic constraints. **Data:** multi-label synthetic offers; synthetic OK. **Privacy:** low. **Integration:** decisioning layer; experiments for online check. **2-min story:** slide "revenue vs relevance" → offer order + projected KPIs move along a Pareto curve. **Metric:** per-objective A/B lift. **Guardrail:** hard constraints never traded away. **Depth:** high. **Reject reason:** can look like generic recsys tuning if constraints/audit under-emphasized.

---

## PAYMENT

### C07 — Pay+ "share-of-wallet" offer decisioning with conversion-neutrality guard
- **Thesis:** Decide which payment-method incentive (BNPL, wallet, cashback, card) to surface at the payment step while a guard proves zero negative impact on primary conversion.
- **User:** Shopper at payment; partner. **Pain:** payment step has the worst abandonment (Baymard 48% unexpected-cost wall); Rokt's own Pay+ pitch is "0 negative impact on conversion" (01 §3.5; 04 §3.1). `VERIFIED`
- **Nearby capability:** Rokt Pay+ (Klarna partner). **Competitor precedent:** Klarna/Afterpay place offers in *their* apps; Stripe/Adyen leave the page whitespace. **New:** an in-checkout conversion-neutrality monitor gating offer aggressiveness in real time.
- **Why Rokt owns it:** Pay+ is a live owned surface. **AI method:** bandit for incentive selection; deterministic conversion-guard. **Data:** synthetic checkout sessions; synthetic OK. **Privacy:** payment context is sensitive — minimize. **Integration:** Embedded placement (required for Pay+); Cart API. **2-min story:** offer aggressiveness auto-throttles when a conversion dip is detected; audit shows the throttle. **Metric:** incremental profit/1M txns with conversion held flat. **Guardrail:** conversion is the veto metric. **Depth:** high. **Reject reason:** payment data sensitivity; harder to demo credibly.

### C08 — Deterministic payment-incentive eligibility & disclosure engine
- **Thesis:** Enforce regulated payment-offer rules (BNPL affordability disclosures, cashback cost disclaimers, credit-card protected-class targeting bans) before a payment offer can render.
- **User:** Payment partner + compliance. **Pain:** Rokt Ads policy already mandates cashback disclaimers and bans protected-class credit targeting (05 PAIN 1; 10 G11/R11). `VERIFIED`
- **Nearby capability:** Rokt Ads policies; sensitive-vertical gating. **Competitor precedent:** none productized as a checkout-moment disclosure engine. **New:** disclosure-as-code tied to offer render.
- **Why Rokt owns it:** owns the payment surface + the policy set. **AI method:** deterministic. **Data:** policy rules; synthetic OK. **Privacy:** low. **Integration:** Pay+ Embedded placement. **2-min story:** a cashback offer without a cost disclaimer is blocked from rendering; audit cites the rule. **Metric:** disclosure-compliance rate. **Guardrail:** block non-compliant render, not checkout. **Depth:** medium-high. **Reject reason:** narrow; strongest as a sub-capability of C05.

### C09 — Refund/chargeback-aware payment reconciliation signal
- **Thesis:** Reconcile payment-method offer acceptances against downstream refund/chargeback events so incentive economics reflect *net* not gross.
- **User:** Payment partner finance; Rokt billing. **Pain:** refunds exist via Web SDK commerce events but Cart API has no refund endpoint (02 §Stage 9). `VERIFIED/INFERENCE`
- **Nearby capability:** Web SDK refund events; `/confirmation/cancel`. **Competitor precedent:** payment processors reconcile but not for offer-incentive economics. **New:** net-of-refund incentive ledger. **Why Rokt owns it:** sits on both the offer and the conversion signal. **AI method:** deterministic reconciliation. **Data:** synthetic txn+refund streams; synthetic OK. **Privacy:** low. **Integration:** Web SDK refund events + Event & Audience API. **2-min story:** a refund flows in → incentive payout auto-reverses → audit shows the correction. **Metric:** payout accuracy. **Guardrail:** idempotent reversal. **Depth:** high (Pavan-shaped). **Reject reason:** overlaps C54 marketplace ledger.

---

## POST-PURCHASE

### C10 — Post-purchase "regret-safe" offer policy
- **Thesis:** Detect regret-prone contexts (impulse, high-spend, first-time) and shift the post-purchase moment from upsell to reassurance/education, monetizing only when regret risk is low.
- **User:** Shopper post-confirmation. **Pain:** 74% buyer's remorse; an extra upsell into a regret state harms trust (04 §3.6). `VERIFIED/INFERENCE`
- **Nearby capability:** Rokt Thanks/Aftersell; Smart Interactions. **Competitor precedent:** Rebuy/Aftersell maximize upsell unconditionally. **New:** regret-risk as a suppression input. **Why Rokt owns it:** owns the post-purchase surface + intent signals. **AI method:** GBDT regret-risk score; deterministic suppression. **Data:** synthetic orders; synthetic OK. **Privacy:** behavioral, minimize. **Integration:** Aftersell/Thanks placement. **2-min story:** high-regret order → no upsell, shows order-support content; low-regret → upsell. **Metric:** long-run engagement / complaint rate. **Guardrail:** never dark-pattern the hesitant buyer (R1). **Depth:** medium-high. **Reject reason:** "regret" is hard to label on synthetic data.

### C11 — Fulfillment-window offer relevance (parking/rideshare/concessions)
- **Thesis:** Map the gap between purchase and fulfillment (movie, flight, event) and surface time-appropriate offers (parking now, concessions before arrival) instead of future-purchase offers.
- **User:** Ticketing/travel shopper. **Pain:** timing mismatch — right offer, wrong moment (04 §2, §3.11; TravelPass case). `VERIFIED`
- **Nearby capability:** Rokt Thanks (TravelPass $11k/100k txns). **Competitor precedent:** none published at this granularity. **New:** fulfillment-clock-aware offer taxonomy. **Why Rokt owns it:** confirmation moment + vertical clients (AMC, Live Nation). **AI method:** deterministic time-window rules + relevance score. **Data:** synthetic event tickets; synthetic OK. **Privacy:** low. **Integration:** Thanks Interstitial `<rokt-thank-you>`. **2-min story:** movie ticket bought → parking/concessions offered now; "future movie" offer deferred. **Metric:** positive-engagement rate. **Guardrail:** fulfillment reassurance first. **Depth:** medium. **Reject reason:** rule-heavy; limited eng depth.

### C12 — Post-purchase order-support deflection + offer blend
- **Thesis:** Blend "where's my order / manage my purchase" self-service into the confirmation moment, using it as the trust anchor around which offers are placed.
- **User:** Shopper; partner CX. **Pain:** confirmation anxiety; 63% forget they ordered something (04 §2, §3.6). `VERIFIED/INFERENCE`
- **Nearby capability:** Thanks/Aftersell. **Competitor precedent:** none; post-purchase channels are pure monetization. **New:** support-first confirmation surface. **Why Rokt owns it:** owns the page. **AI method:** deterministic; RAG for support FAQ (periphery). **Data:** synthetic; synthetic OK. **Privacy:** low. **Integration:** Thanks placement + `Selection.on()`. **2-min story:** confirmation shows order status + one relevant offer, not a wall of ads. **Metric:** support-ticket deflection + engagement. **Guardrail:** don't impersonate partner brand (R8). **Depth:** medium. **Reject reason:** drifts toward partner CX tooling, not Rokt-core.

---

## CATALOG

### C13 — Catalog feed-health & silent-failure guard for brands
- **Thesis:** Validate a brand's product feed against Catalog's exact format (CSV/EDI 832/846) *before* upload, catching the "edit the CSV and the upload silently fails" trap, with a confidence ladder.
- **User:** Catalog brand (supplier) ops/IT. **Pain:** CSV format edits "cause the upload to fail" silently; EDI onboarding is multi-system (05 PAIN 5). `VERIFIED`
- **Nearby capability:** Catalog AI ingestion; Orderful handoff. **Competitor precedent:** generic feed tools (Feedonomics) exist but not Catalog-native. **New:** Rokt-Catalog-specific pre-validation + go-live gate tracking. **Why Rokt owns it:** owns the ingestion spec. **AI method:** deterministic validation; LLM metadata enrichment (periphery). **Data:** synthetic feeds; synthetic OK. **Privacy:** low. **Integration:** Catalog CSV/EDI import; Custom Audience Import pattern. **2-min story:** malformed feed row → flagged with the exact rule + fix, before Orderful. **Metric:** upload-rejection rate; time-to-live. **Guardrail:** advisory; human uploads. **Depth:** high (Pavan's NexusWatch/ShelfTrace intake+ladder). **Reject reason:** "integration checker" risk — must be a supporting capability, not the thesis.

### C14 — Catalog discoverability & assortment-fit analytics
- **Thesis:** Show a brand where its Catalog products win/lose placements across the network and which attributes drive discoverability.
- **User:** Catalog brand marketplace lead (ANINE BING persona). **Pain:** brands want distribution "without operational overhead" and accurate product data (06 §10, §Catalog). `VERIFIED`
- **Nearby capability:** Catalog for Brands; AI enrichment. **Competitor precedent:** marketplace analytics (Amazon-style) but not Catalog-native. **New:** cross-network assortment-fit view. **Why Rokt owns it:** owns the placement data. **AI method:** analytics + deterministic; LLM attribute enrichment. **Data:** synthetic catalog + placements; synthetic OK. **Privacy:** tenant-isolated. **Integration:** Catalog placement logs. **2-min story:** brand sees "your product loses to X on attribute Y." **Metric:** GMV per SKU. **Guardrail:** no cross-brand data leakage (R10). **Depth:** medium. **Reject reason:** borders generic ecommerce dashboard.

### C15 — Catalog 3-way-match reconciliation (850/856/810) exception worklist
- **Thesis:** Ingest a brand's PO/ASN/invoice EDI chain, run the 3-way match, and surface only exceptions (short-ships, price deltas, missing ASNs, commission-payout deltas) with likely root cause.
- **User:** Catalog brand finance/AP. **Pain:** invoice-vs-ASN mismatches are "the most common cause of invoice disputes"; commission (35–40%) layered on top (05 PAIN 6). `VERIFIED/INDUSTRY`
- **Nearby capability:** Catalog transaction dashboard. **Competitor precedent:** EDI reconciliation tools (Celigo) but not Rokt-Catalog-commission-aware. **New:** commission-aware 3-way match. **Why Rokt owns it:** owns the transaction set + commission terms. **AI method:** deterministic reconciliation. **Data:** synthetic EDI corpus (ShelfTrace-style); synthetic OK. **Privacy:** tenant-isolated finance data. **Integration:** Catalog order EDI (850/855/856/810/812). **2-min story:** short-ship invoice → flagged with 812-adjustment suggestion; clean rows pass. **Metric:** dispute rate; days-to-resolve. **Guardrail:** finance approves each resolution. **Depth:** high (Pavan-shaped reconciliation state machine). **Reject reason:** EDI is niche; demo realism needs strong fixtures.

---

## ADVERTISING

### C16 — Cross-category "intent-bridge" audience builder
- **Thesis:** Build prebuilt advertiser audiences from complementary purchase intent (ticket-buyer → travel; pet-food → subscription) as reusable bundles.
- **User:** Advertiser/campaign operator. **Pain:** advertisers hunt for high-converting segments they hadn't considered (Booking.com intent-bridge, Flamingo discovery) (06 §B). `VERIFIED`
- **Nearby capability:** Rokt Ads; Audience Expansion. **Competitor precedent:** lookalikes everywhere; cross-category *intent* bridges at the transaction moment are Rokt-distinctive. **New:** intent-bridge bundles as a first-class product. **Why Rokt owns it:** network sees cross-category transactions. **AI method:** affinity mining; uplift for persuadability. **Data:** synthetic cross-category logs; synthetic OK. **Privacy:** first-party, consent-gated. **Integration:** Custom Audience Import; Event & Audience API. **2-min story:** "ticket-buyers → travel" bundle projected reach + uplift. **Metric:** ROAS vs generic lookalike. **Guardrail:** no protected-class proxies. **Depth:** medium-high. **Reject reason:** overlaps mParticle Audience Expansion — must foreground the cross-category-at-moment angle.

### C17 — Native incrementality (geo-lift) measurement service
- **Thesis:** A first-party incrementality product (geo-lift / holdout) so advertisers can prove Rokt drove *net-new* revenue without hiring an outside agency.
- **User:** Advertiser (Cozy Earth hired Haus; the single most-repeated buyer pain). **Pain:** attribution overlap/inflation anxiety across 10–20 channels (06 §Cross-cutting #1). `VERIFIED`
- **Nearby capability:** Experiments + holdout tests; closed-loop measurement. **Competitor precedent:** Haus/measured; not native to the offer network. **New:** incrementality baked into Rokt's own reporting. **Why Rokt owns it:** owns the exposure logs + holdout mechanism. **AI method:** causal inference (DiD/geo-lift, DML) + refutations. **Data:** synthetic DGP w/ known effect; synthetic OK (high feasibility). **Privacy:** aggregate-friendly, low. **Integration:** Experiments/holdouts + Event & Audience API. **2-min story:** recover a known-truth lift from synthetic logs; refutation tests pass; naive attribution overstates it. **Metric:** measured incremental ROAS. **Guardrail:** honest CIs; no p-hacking. **Depth:** high. **Reject reason:** measurement, not a consumer surface — but strategically core to Rokt's "measurement-first" push.

### C18 — Advertiser pacing & budget-integrity monitor
- **Thesis:** Deterministically enforce advertiser budget/pacing/exclusivity against live spend state, with tamper-evident spend accounting and auto-pause on breach.
- **User:** Advertiser ops; Rokt ad ops. **Pain:** stale budget state → overspend/underdelivery; constraint enforcement must be exact (09 #14). `VERIFIED/INFERENCE`
- **Nearby capability:** campaign caps; CPC/CPA/ROAS optimization. **Competitor precedent:** all ad servers pace; few expose an auditable integrity trail. **New:** spend ledger with idempotent debits + reconciliation. **Why Rokt owns it:** owns the auction. **AI method:** deterministic + pacing control. **Data:** synthetic spend streams; synthetic OK. **Privacy:** low. **Integration:** decisioning + Reporting API. **2-min story:** duplicate conversion event → spend debited once (idempotent); breach → auto-pause + audit. **Metric:** overspend rate (~0). **Guardrail:** never double-charge; fail closed. **Depth:** high (Pavan idempotency/outbox). **Reject reason:** overlaps C54; keep distinct as the *advertiser-facing* view.

---

## CUSTOMER DATA

### C19 — Transaction-moment → CDP profile write-back loop
- **Thesis:** Write every Brain decision/impression/in-moment response back into the mParticle profile in real time so the next decision (and the whole lifecycle) is sharper.
- **User:** Partner data team; the Brain. **Pain:** the merger's explicit opportunity — close the loop between the moment and the always-on profile (03 §5.1). `HYPOTHESIS/INFERENCE`
- **Nearby capability:** mParticle Customer 360; Event & Audience API. **Competitor precedent:** CDPs ingest events; the *decision-write-back* from an owned offer moment is Rokt-distinctive vs Klaviyo/Segment. **New:** decision provenance as a profile signal. **Why Rokt owns it:** only Rokt has decision + profile together. **AI method:** deterministic write pipeline; feeds ML downstream. **Data:** synthetic profiles + decisions; synthetic OK. **Privacy:** first-party, purpose-limited (G2), tenant-isolated. **Integration:** Event & Audience API `/v2/events`. **2-min story:** decision made → profile updated → next decision reflects it; DSR deletes it end-to-end. **Metric:** next-decision quality / identity confidence. **Guardrail:** no cross-tenant combination (R5/R10). **Depth:** high. **Reject reason:** must not duplicate mParticle Real-Time Audiences; the write-back semantics + audit are the wedge.

### C20 — Data-quality triage over Data Master violation reports
- **Thesis:** Cluster recurring mParticle data-plan violations, classify root cause (implementation bug vs plan gap), draft the plan diff or dev ticket, and simulate blast radius before enabling blocking.
- **User:** Data governance + engineering. **Pain:** violation triage is continuous; "blocking can lead to data loss… you cannot replay blocked data" (05 PAIN 7). `VERIFIED`
- **Nearby capability:** Data Master / Data Plans; violation reports (5-min refresh). **Competitor precedent:** CDP governance dashboards exist; the pre-block blast-radius simulator is new. **New:** guardrail against the irreversible-block trap. **Why Rokt owns it:** owns Data Master. **AI method:** clustering + deterministic classification; LLM drafts tickets (periphery, reviewed). **Data:** synthetic violation streams; synthetic OK. **Privacy:** metadata, low. **Integration:** Data Planning API; violation reports. **2-min story:** propose a block → simulator shows N events/day would be lost → human declines. **Metric:** violation-recurrence; MTTR. **Guardrail:** never auto-enable blocking. **Depth:** high. **Reject reason:** near "generic data-quality dashboard" unless the blast-radius sim + failure→recovery is central.

### C21 — Consent-scoped feature availability resolver
- **Thesis:** A deterministic resolver that, per shopper, computes which profile features are *usable* given live consent (`noFunctional`/`noTargeting`, DSR state), so decisioning never uses withheld data.
- **User:** Decisioning + privacy teams. **Pain:** browser opt-outs don't cover email/phone; consent must be enforced at decision time (10 G6/G8). `VERIFIED`
- **Nearby capability:** consent flags; mParticle consent propagation. **Competitor precedent:** consent-mode exists (Google) but not a checkout-moment feature-eligibility resolver. **New:** consent-as-a-feature-gate with proof. **Why Rokt owns it:** owns the decision + consent state. **AI method:** deterministic. **Data:** synthetic consent states; synthetic OK. **Privacy:** core-positive. **Integration:** `noFunctional`/`noTargeting`; Data Deletion API. **2-min story:** withdraw consent → targeting features drop from the decision; audit proves non-use. **Metric:** consent-enforcement coverage. **Guardrail:** default-deny on unknown consent. **Depth:** high. **Reject reason:** overlaps C33; keep as the data-side counterpart.

---

## IDENTITY

### C22 — Real-time account disambiguation at the shared-device moment
- **Thesis:** When multiple accounts share a device/browser, disambiguate which shopper is active *before* the offer decision to avoid cross-household mis-targeting.
- **User:** Shopper on a shared device; partner. **Pain:** 20–35% of profiles fragmented; shared devices misattribute (04 §3.8; 03 §4). `VERIFIED/INFERENCE`
- **Nearby capability:** mParticle Real-Time Account Disambiguation; Household Reach. **Competitor precedent:** identity graphs (Wunderkind 9B devices) but not applied inside the paid checkout moment. **New:** disambiguation *gating* the offer. **Why Rokt owns it:** decision + identity together. **AI method:** probabilistic identity scoring; deterministic fallback to anonymous. **Data:** synthetic multi-user sessions; synthetic OK. **Privacy:** re-identification risk — high care, consent-gated. **Integration:** identity in Event & Audience API. **2-min story:** wrong-user signal → offer falls back to household-safe/anonymous; audit logs the choice. **Metric:** mis-targeting rate. **Guardrail:** when unsure, treat as anonymous. **Depth:** high. **Reject reason:** risks duplicating mParticle's shipped disambiguation — foreground the in-moment gate.

### C23 — Identity-confidence-aware decisioning
- **Thesis:** Attach an identity-confidence score to every decision and degrade personalization gracefully as confidence drops (anonymous → tentative → resolved).
- **User:** Decisioning team. **Pain:** fragmented identity degrades relevance everywhere; over-personalizing a low-confidence match is a trust risk (04 §3.8). `INFERENCE`
- **Nearby capability:** Identity Observability; Customer 360. **Competitor precedent:** identity resolution is common; confidence-graded *decision behavior* is the new bit. **New:** confidence tiers as a first-class decision input. **Why Rokt owns it:** owns both. **AI method:** deterministic tiering over a probabilistic match score. **Data:** synthetic; synthetic OK. **Privacy:** minimizes over-reach. **Integration:** identity layer + `/experiences`. **2-min story:** low-confidence → generic offer; high-confidence → personalized; boundary is visible. **Metric:** relevance vs mis-targeting trade-off. **Guardrail:** conservative default. **Depth:** medium-high. **Reject reason:** subtle to demo.

### C24 — Identity observability & lineage explorer
- **Thesis:** A legible view of how a profile's identifiers were created/linked/merged over time, with a "how do we know this is one person?" trail.
- **User:** Data governance; privacy. **Pain:** identity governance is opaque; mParticle names "Identity Observability" as a capability (03 §4). `VERIFIED`
- **Nearby capability:** Identity Observability. **Competitor precedent:** identity graph tools; lineage-as-audit is the wedge. **New:** hash-chained identity-event lineage. **Why Rokt owns it:** owns IDSync. **AI method:** deterministic. **Data:** synthetic identity events; synthetic OK. **Privacy:** governance-positive. **Integration:** IDSync events. **2-min story:** trace a merge; a bad merge is detected + reversible; audit localizes it. **Metric:** identity-error detection time. **Guardrail:** reversible merges. **Depth:** high (Pavan hash-chain audit). **Reject reason:** overlaps mParticle's named feature — the tamper-evident lineage is the differentiator.

---

## LIFECYCLE ACTIVATION

### C25 — Transaction-moment-triggered lifecycle journeys
- **Thesis:** Use the checkout signal as the trigger event that launches downstream retention/winback/loyalty journeys via the CDP's 300+ integrations — "next best action" extended from checkout to the next 30/60/90 days.
- **User:** Lifecycle marketer. **Pain:** the moment is a one-shot today; the merger enables it to seed the lifecycle (03 §5.3). `HYPOTHESIS`
- **Nearby capability:** Next Best Action; Real-Time Audiences; 300+ integrations. **Competitor precedent:** Braze/Klaviyo trigger journeys but not from an owned paid-offer moment. **New:** the moment as a lifecycle trigger. **Why Rokt owns it:** owns the highest-intent trigger. **AI method:** deterministic orchestration + per-step propensity. **Data:** synthetic journeys; synthetic OK. **Privacy:** consent-gated activation. **Integration:** Event & Audience API → downstream connectors. **2-min story:** purchase → triggers a winback sequence scheduled + suppressed correctly. **Metric:** journey-level incremental conversion. **Guardrail:** frequency caps across journey. **Depth:** medium-high. **Reject reason:** journey orchestration is MED feasibility on synthetic data (09 #12).

### C26 — First-order → second-order retention nudge (subscription)
- **Thesis:** For subscription/DTC, a productized post-first-purchase nudge flow that targets box-to-box churn at the highest-leverage moment.
- **User:** DTC subscription brand (Tails.com +3pp first→second box). **Pain:** box-to-box churn is the make-or-break retention point (06 §7). `VERIFIED`
- **Nearby capability:** Rokt Ads Transaction-Moment targeting; Predictive Audiences. **Competitor precedent:** retention tools generic; second-order-at-moment is specific. **New:** a named second-order retention flow. **Why Rokt owns it:** owns the post-purchase moment. **AI method:** uplift/CATE for persuadable churners. **Data:** synthetic subscription cohorts; synthetic OK. **Privacy:** behavioral, minimize. **Integration:** Aftersell/Thanks + Event & Audience API. **2-min story:** persuadable churner gets the nudge; the always-loyal and always-lost don't. **Metric:** first→second retention. **Guardrail:** no coercive urgency (R2). **Depth:** medium-high. **Reject reason:** overlaps mParticle Predictive Audiences.

---

## RETENTION

### C27 — Persuadable-only retention targeting (uplift, not churn score)
- **Thesis:** Target retention offers to persuadables (uplift/CATE), not to those who'd stay anyway or churn regardless — the incrementality backbone.
- **User:** Retention marketer. **Pain:** churn scores waste spend on the inevitable/loyal; uplift is the correct tool (09 #4, #10). `VERIFIED`
- **Nearby capability:** Predictive Audiences (churn). **Competitor precedent:** most tools score churn, not uplift. **New:** uplift-first retention. **Why Rokt owns it:** rich transaction signal. **AI method:** uplift/CATE (Qini curves). **Data:** synthetic RCT; synthetic OK (HIGH feasibility). **Privacy:** behavioral. **Integration:** Custom Audience Import. **2-min story:** Qini curve shows uplift targeting beats churn-score targeting at equal spend. **Metric:** incremental retention per $. **Guardrail:** randomized holdout preserved. **Depth:** high. **Reject reason:** close to mParticle predictive suite — the uplift (vs propensity) framing is the wedge.

### C28 — Cross-session offer-fatigue governor
- **Thesis:** A deterministic fatigue governor (frequency caps + exposure-response decay) that suppresses when marginal value drops, tuned per user.
- **User:** Shopper; partner. **Pain:** 70% unsubscribed over volume; fatigue is timing/relevance-driven (04 §3.4). `VERIFIED`
- **Nearby capability:** frequency caps; Smart Interactions. **Competitor precedent:** frequency caps universal; learned decay is the refinement. **New:** exposure-response decay atop caps. **Why Rokt owns it:** network exposure history. **AI method:** deterministic-first, small decay model (09 #13 — "deterministic first"). **Data:** synthetic exposure curves; synthetic OK. **Privacy:** counters, low. **Integration:** `Selection.on()` exposure events. **2-min story:** show the CTR-vs-exposure decay curve and the suppression point. **Metric:** long-run engagement. **Guardrail:** attention is finite. **Depth:** medium. **Reject reason:** mostly deterministic; risks being "just frequency caps."

---

## CANCELLATION

### C29 — Cancellation/refund-moment winback with symmetric-exit guarantee
- **Thesis:** At cancellation/refund — a high-emotion, under-served moment — offer a genuinely relevant winback or store-credit option while guaranteeing cancellation is as easy as signup (FTC-compliant, no roach-motel).
- **User:** Cancelling subscriber. **Pain:** 33% cancelled over billing friction; poor cancellation flows erode trust; FTC click-to-cancel principles live (04 §3.7; 10 R3). `VERIFIED`
- **Nearby capability:** win-back adjacent to Aftersell/Thanks (mostly outside stated surfaces). **Competitor precedent:** retention "save" flows are notorious dark-pattern territory — the *anti*-dark-pattern framing is the differentiator. **New:** a trust-safe cancellation offer surface. **Why Rokt owns it:** relevance engine + trust posture. **AI method:** uplift for winback; deterministic exit-symmetry enforcement. **Data:** synthetic cancellation flows; synthetic OK. **Privacy:** sensitive moment, minimize. **Integration:** Nurture Unsubscribe API; Event & Audience API. **2-min story:** cancel path stays one-click; a relevant credit offer appears once, non-coercively; audit proves symmetric exit. **Metric:** winback rate without complaint spike. **Guardrail:** cancellation never obstructed (R3). **Depth:** medium-high. **Reject reason:** high dark-pattern risk — only viable with the guarantee as the core.

### C30 — Involuntary-churn (failed-payment) recovery at the moment
- **Thesis:** Detect failed/expired-payment involuntary churn and surface a frictionless update path plus a retention incentive, distinct from voluntary cancellation.
- **User:** Subscriber with a failed renewal. **Pain:** involuntary churn is a silent revenue leak; hidden-fee/billing frustration (04 §3.7). `INDUSTRY/INFERENCE`
- **Nearby capability:** Pay+ payment surface. **Competitor precedent:** dunning tools (Stripe Billing) but not tied to an offer moment. **New:** dunning + relevance at the moment. **Why Rokt owns it:** payment surface + decisioning. **AI method:** deterministic dunning state machine + incentive selection. **Data:** synthetic billing events; synthetic OK. **Privacy:** payment-sensitive. **Integration:** Pay+ + Web SDK refund/commerce events. **2-min story:** failed renewal → update-payment prompt + small incentive → recovered; audit shows the retry ladder. **Metric:** involuntary-churn recovery rate. **Guardrail:** transparent, no fake urgency. **Depth:** high (Pavan token-lifecycle/state-machine). **Reject reason:** overlaps payment tooling.

---

## LOYALTY

### C31 — Real-time loyalty recognition at checkout
- **Thesis:** Recognize loyalty status/points in the transaction moment so members see synced points and status-appropriate offers instead of outdated ones.
- **User:** Loyalty member. **Pain:** points don't sync; 49% say earning is too slow; recognition depends on identity (04 §3.9). `VERIFIED`
- **Nearby capability:** Thanks/Aftersell loyalty prompts; identity. **Competitor precedent:** loyalty platforms (Yotpo) but not at the paid checkout moment. **New:** real-time recognition + offer conditioning. **Why Rokt owns it:** moment + identity + CDP. **AI method:** deterministic recognition; offer ranking. **Data:** synthetic loyalty profiles; synthetic OK. **Privacy:** first-party. **Integration:** Event & Audience API identity + Thanks. **2-min story:** recognized member sees synced points + a tier offer; unrecognized sees generic. **Metric:** loyalty engagement / repeat rate. **Guardrail:** no "Hello, Gold member" if unsure (R9-adjacent). **Depth:** medium. **Reject reason:** integration-dependent; thin without a loyalty backend.

### C32 — Trigger-based loyalty offers (Joe & The Juice pattern)
- **Thesis:** Fire behavior-triggered loyalty offers (e.g., 30% coupon on the 3rd purchase in 30 days) via a no-code-style trigger model, productized for high-frequency retail.
- **User:** QSR/food loyalty marketer. **Pain:** loyalty adoption despite signal loss; Joe & The Juice hit 75% YoY loyalty-revenue growth (06 §14). `VERIFIED`
- **Nearby capability:** mParticle real-time segmentation + triggered offers. **Competitor precedent:** Braze triggers; not tied to the transaction moment + owned offers. **New:** transaction-triggered loyalty at the moment. **Why Rokt owns it:** real-time checkout data. **AI method:** deterministic triggers + propensity. **Data:** synthetic purchase streams; synthetic OK. **Privacy:** first-party. **Integration:** Real-Time Audiences + Event & Audience API. **2-min story:** 3rd purchase in 30 days → coupon auto-fires; suppressed if over-messaged. **Metric:** purchase frequency (2.4x benchmark). **Guardrail:** frequency caps. **Depth:** medium. **Reject reason:** overlaps mParticle triggered-offers directly.

---

## PRIVACY

### C33 — Verifiable consent + DSR propagation with receipts
- **Thesis:** Turn consent-state propagation and DSR forwarding into a partner-facing product that proves opt-outs were enforced end-to-end (deletion receipts, "your data was never combined" proofs).
- **User:** Partner privacy/compliance team. **Pain:** consent must propagate in real time and be enforced; trust must be *verifiable*, not assumed (10 §3.3, §3.5, G6). `VERIFIED/HYPOTHESIS`
- **Nearby capability:** mParticle consent management + DSR forwarding; Data Deletion API. **Competitor precedent:** OneTrust manages consent; cryptographic *proof of enforcement* at the offer moment is new. **New:** consent/DSR receipts as tamper-evident artifacts. **Why Rokt owns it:** owns the flow + the decision. **AI method:** deterministic. **Data:** synthetic consent/DSR events; synthetic OK. **Privacy:** the whole point. **Integration:** Data Deletion API; consent flags; Event & Audience API. **2-min story:** submit a deletion → data purged across stack → signed receipt; attempt to use deleted data → blocked + audited. **Metric:** DSR SLA compliance; enforcement coverage. **Guardrail:** default-deny; fail closed. **Depth:** high (Pavan hash-chain/HMAC audit). **Reject reason:** none major — strong trust wedge; risk is scope creep.

### C34 — Clean-room-style outcome collaboration without raw-data movement
- **Thesis:** Let a partner and advertiser collaborate on aggregate outcomes (overlap, lift) where user-level records never cross the boundary — "clean-room results without clean-room complexity."
- **User:** Partner + advertiser data teams. **Pain:** raw PII must never cross parties; clean rooms are costly/complex (10 R13, §3.4). `VERIFIED`
- **Nearby capability:** encrypted clean rooms; mParticle "data ownership without clean-room complexity." **Competitor precedent:** Snowflake/Decentriq clean rooms; the wedge is simplicity + offer-moment relevance. **New:** aggregation-only collaboration tied to decisioning. **Why Rokt owns it:** trusted-intermediary posture. **AI method:** deterministic aggregation + privacy thresholds (k-anonymity). **Data:** synthetic two-party sets; synthetic OK. **Privacy:** core. **Integration:** Event & Audience API; Custom Audience Import. **2-min story:** compute audience overlap; attempt to extract a user-level row → blocked. **Metric:** collaboration value with zero record crossing. **Guardrail:** aggregate-only, min-count thresholds. **Depth:** high. **Reject reason:** cryptographic PETs are hard to make convincing on synthetic data.

### C35 — "Data was never combined" tenant-isolation attestation
- **Thesis:** Continuously attest and prove multi-tenant isolation — that partner A's data never touched partner B's — via an auditable access trail.
- **User:** Partner security/procurement. **Pain:** purpose-limitation + no-combination are legally binding; isolation must be provable (10 G1/G2/G4/R10). `VERIFIED`
- **Nearby capability:** logical+physical AWS separation; per-client envelope encryption. **Competitor precedent:** SOC2 attestations exist; continuous, queryable isolation proof is new. **New:** isolation-as-attestation. **Why Rokt owns it:** owns the multi-tenant plane. **AI method:** deterministic. **Data:** synthetic access logs; synthetic OK. **Privacy:** core. **Integration:** access/audit layer. **2-min story:** a fitness test proves no cross-tenant read path exists; a seeded violation attempt is caught. **Metric:** cross-tenant leakage (0). **Guardrail:** the invariant is the product. **Depth:** high (Pavan `test_tenancy`/fitness-function tests). **Reject reason:** infra-facing; weak consumer story.

---

## BRAND SAFETY

### C36 — Creative pre-submission compliance linter
- **Thesis:** Check a draft creative against the published Rokt Ads policy rules *before* submission — flagging the exact rule at risk with a citation and required vertical disclaimers — to cut rejection round-trips.
- **User:** Advertiser/campaign operator. **Pain:** dozens of conditional, vertical-specific rules; one miss → ~24h re-review (05 PAIN 1). `VERIFIED`
- **Nearby capability:** Rokt ops manual approval (~24h). **Competitor precedent:** ad-policy linters exist (Google Ads) but not Rokt-policy-specific. **New:** Rokt-policy-as-code linter. **Why Rokt owns it:** owns the policy. **AI method:** deterministic rule checks + LLM explanation of *why* (periphery, human decides). **Data:** synthetic creatives + policy rules; synthetic OK. **Privacy:** low. **Integration:** pre-submission to Rokt Ads. **2-min story:** "title is 3 words and contains a first-name token" flagged with the policy citation before submit. **Metric:** rejection-rate before/after. **Guardrail:** advisory — Rokt ops still decides. **Depth:** medium-high (deterministic engine + LLM-explains, Pavan-shaped). **Reject reason:** must not present as auto-approval.

### C37 — Partner controls-hygiene advisor
- **Thesis:** Periodically surface reviewable "controls hygiene" suggestions — new brand domains matching an existing block pattern, competitor domains not yet blocked, categories driving complaints — that the partner accepts/rejects.
- **User:** Ecommerce partner governance team. **Pain:** block lists drift stale as new advertisers enter; balancing revenue vs brand safety is ongoing (05 PAIN 2). `VERIFIED`
- **Nearby capability:** Network Controls; brand domain blocking. **Competitor precedent:** brand-safety vendors (DoubleVerify) but not Rokt-network-native. **New:** proactive controls recommendations with human approval. **Why Rokt owns it:** sees network entrants + partner performance. **AI method:** deterministic pattern-match + light scoring; LLM explanation optional. **Data:** synthetic network + block lists; synthetic OK. **Privacy:** tenant-scoped. **Integration:** Network Controls. **2-min story:** new competitor domain appears → advisor suggests block → partner approves → audit logs it. **Metric:** revenue-per-impression + complaint-rate delta. **Guardrail:** every change partner-approved + logged. **Depth:** medium. **Reject reason:** advisory tools can feel light without a strong failure→recovery arc.

### C38 — Sensitive-category auction integrity enforcer
- **Thesis:** Deterministically enforce sensitive-vertical rules in the auction (age-gating, targeting limits, disclosures, one-offer-per-sensitive-category) with a provable no-violation trail.
- **User:** Partner + Rokt ad ops. **Pain:** betting/credit/alcohol/etc. carry hard targeting/age/disclosure rules; violations are legal risk (10 G11/R11). `VERIFIED`
- **Nearby capability:** "Sensitive Categories blocked by default; one offer per sensitive category per auction." **Competitor precedent:** ad-policy engines; the auction-level provable enforcement is the wedge. **New:** sensitive-category integrity as auditable code. **Why Rokt owns it:** owns the auction. **AI method:** deterministic (required). **Data:** synthetic auctions; synthetic OK. **Privacy:** low. **Integration:** decisioning + Network Controls. **2-min story:** two gambling offers in one auction → second suppressed; under-age context → gambling filtered; audit cites the rule. **Metric:** sensitive-category violation rate (0). **Guardrail:** fail closed. **Depth:** high. **Reject reason:** overlaps C05/C38 with C05's feasible-set; keep as the sensitive-vertical specialization.

---

## PARTNER OPERATIONS

### C39 — Audience prep + freshness assistant
- **Thesis:** Pre-validate custom-audience/suppression lists against Rokt's exact format rules (single column, no header, UTF-8, hashed lowercase, no mixed plain/hashed), normalize+hash client-side, and flag stale suppression lists.
- **User:** Data/lifecycle marketer; ad ops. **Pain:** fragile formats → silent file rejection; freshness decays continuously; 7 import pathways (05 PAIN 3). `VERIFIED`
- **Nearby capability:** Custom Audience Import; 7 import paths. **Competitor precedent:** generic list tools; not Rokt-format-specific. **New:** Rokt-format pre-validation + freshness tracking. **Why Rokt owns it:** owns the ingestion spec. **AI method:** deterministic. **Data:** synthetic lists; synthetic OK. **Privacy:** hashing before upload is privacy-positive. **Integration:** Custom Audience Import; SFTP path. **2-min story:** mixed plain/hashed file → caught client-side with the fix; stale suppression list → flagged. **Metric:** file-rejection rate; suppression-freshness lag. **Guardrail:** human confirms every upload. **Depth:** medium. **Reject reason:** "SDK validator" risk — supporting capability, not thesis.

### C40 — Integration-health checker (close-the-loop verification)
- **Thesis:** Validate on a partner's staging/confirmation page that `selectPlacements` fires with all required attributes well-formed, `<rokt-thank-you>` is wired, and close-the-loop cart messages round-trip — replacing manual devtools spot-checks.
- **User:** Partner engineering; advertiser eng (attribution). **Pain:** correct integration = right attributes, right pages, right order; misses silently degrade match rates + attribution (05 PAIN 8). `VERIFIED`
- **Nearby capability:** Integration Monitor (Workato+GA); manual `experiences` network check. **Competitor precedent:** tag auditors (ObservePoint); not Rokt-SDK-specific. **New:** Rokt-integration-specific health report. **Why Rokt owns it:** owns the SDK contract. **AI method:** deterministic. **Data:** synthetic staging pages; synthetic OK. **Privacy:** low. **Integration:** `Selection.on()` events; `experiences` call; Integration Monitor. **2-min story:** missing `billingzipcode` → flagged with downstream match-rate impact. **Metric:** attribution match-rate; defect-escape rate. **Guardrail:** advisory. **Depth:** medium. **Reject reason:** explicitly a "supporting capability, not the thesis" per steers — dev-experience/integration-safety must not be the product.

### C41 — Experiment-readout companion
- **Thesis:** Given a running Rokt experiment, state plainly whether the 95%/two-week gates are met, flag premature calls, check secondary metrics for regressions, and draft a plain-language interpretation.
- **User:** Advertiser/partner running experiments/holdouts. **Pain:** Bayesian "probability to beat" + credible intervals are easy to misread; peeking/early-calls are classic errors (05 PAIN 4). `VERIFIED/INDUSTRY`
- **Nearby capability:** Experiments + holdout tests. **Competitor precedent:** Statsig/Eppo readouts; not Rokt-experiment-native. **New:** guardrailed readout tied to Rokt's stated gates. **Why Rokt owns it:** owns the experiment framework. **AI method:** deterministic stats + LLM plain-language draft (reviewed). **Data:** synthetic experiment streams; synthetic OK. **Privacy:** low. **Integration:** Experiments. **2-min story:** operator tries to call at day 8 → blocked ("two-week gate unmet; secondary metric down 3%"). **Metric:** regretted-rollout rate. **Guardrail:** advises; human decides rollout. **Depth:** medium. **Reject reason:** "generic experimentation assistant" is rejected — must add CUPED/guarded-rollout depth to differentiate (see C42).

---

## EXPERIMENTATION

### C42 — Off-policy evaluation "safe-rollout" gate
- **Thesis:** Before any new offer/ranking policy serves live traffic, estimate its value from existing logs (IPS → SNIPS → Doubly-Robust) and block rollout if support/variance is insufficient — de-risking exactly Rokt's deployment shape.
- **User:** Decision-science + ad ops. **Pain:** offline↔online gap is *the* RecSys pitfall; shipping a bad policy risks revenue + trust (09 #6, #22). `VERIFIED`
- **Nearby capability:** Experiments/holdouts; "measurement-first." **Competitor precedent:** Statsig/Eppo do experimentation stats; turnkey OPE gates on the *offer* policy are Rokt-distinctive. **New:** OPE as a mandatory pre-flight gate with an auditable verdict. **Why Rokt owns it:** owns logged policies + propensities. **AI method:** off-policy evaluation (SNIPS/DR); deterministic gate. **Data:** Open Bandit Pipeline synthetic + ZOZO logs; synthetic OK (HIGH feasibility). **Privacy:** log-based, standard. **Integration:** Experiments; decisioning. **2-min story:** propose a policy → OPE estimates lift with CIs → insufficient support (divide-by-zero region) → rollout blocked + audited → then a supported policy passes and graduates to A/B. **Metric:** regretted-rollout rate; offline↔online alignment. **Guardrail:** fail closed on low support. **Depth:** high. **Reject reason:** measurement-heavy; needs a crisp visual to land in 2 min.

### C43 — Variance-reduced experiment engine (CUPED + guarded rollouts)
- **Thesis:** Speed up Rokt experiments with CUPED variance reduction and add guardrail-metric-gated progressive rollouts (auto-rollback on secondary-metric regression).
- **User:** Experimentation team. **Pain:** two-week minimums are slow; secondary metrics silently regress (05 PAIN 4). `VERIFIED/INDUSTRY`
- **Nearby capability:** Experiments. **Competitor precedent:** Statsig/Eppo/Optimizely ship CUPED + guarded rollouts — this is *adjacent tooling*, so novelty comes only from tying it to the offer surface + audit. **New:** guardrail auto-rollback tied to the offer decision. **Why Rokt owns it:** owns the surface. **AI method:** deterministic stats (CUPED). **Data:** synthetic experiments; synthetic OK. **Privacy:** low. **Integration:** Experiments. **2-min story:** CUPED narrows CIs faster; a guardrail breach auto-rolls-back + audits. **Metric:** time-to-decision; guardrail catches. **Guardrail:** auto-rollback. **Depth:** medium-high. **Reject reason:** duplicates Statsig/Eppo/Optimizely — lower non-duplication score.

### C44 — Holdout-based incrementality dashboard for partners
- **Thesis:** Give partners a legible always-on holdout that shows the *incremental* value Rokt adds to their surface (not just gross engagement).
- **User:** Partner monetization lead. **Pain:** partners need to trust Rokt is net-positive to their conversion (10 §3.8 non-interference SLA). `VERIFIED/INFERENCE`
- **Nearby capability:** holdout tests. **Competitor precedent:** incrementality vendors; partner-facing always-on holdout is the wedge. **New:** continuous partner-side incrementality. **Why Rokt owns it:** owns the holdout mechanism. **AI method:** causal/holdout analysis. **Data:** synthetic; synthetic OK. **Privacy:** aggregate. **Integration:** holdout tests + Reporting API. **2-min story:** partner sees "+$X incremental, conversion held flat." **Metric:** incremental value; conversion-neutrality. **Guardrail:** honest CIs. **Depth:** medium. **Reject reason:** overlaps C17 (advertiser) — keep as partner-facing.

---

## AI DECISIONING

### C45 — Decision-provenance spine ("why this offer," tamper-evident)
- **Thesis:** Record every offer decision as an immutable, hash-chained, HMAC-signed event capturing the feasible set, scores, constraints fired, and chosen offer — so any decision is reconstructable and tamper-evident.
- **User:** Rokt ad ops, partners, auditors, regulators. **Pain:** money + partner revenue-share must be reconstructable; automated-decisioning needs an opt-out + explainability basis (10 G7; 12 §A3). `VERIFIED/INFERENCE`
- **Nearby capability:** Rokt Brain decisioning (internals proprietary). **Competitor precedent:** none expose a tamper-evident per-decision provenance spine. **New:** decision provenance as a verifiable artifact. **Why Rokt owns it:** owns the decision. **AI method:** deterministic capture; LLM only phrases the human-readable rationale (guardrailed). **Data:** synthetic decisions; synthetic OK. **Privacy:** metadata; tenant-isolated. **Integration:** `Selection.on()` decision events; decisioning layer. **2-min story:** replay a decision; tamper with a log row → `verify_audit_chain()` localizes the break. **Metric:** auditability coverage; tamper-detection. **Guardrail:** LLM rationale can never contradict the deterministic choice (`mentionsWrongOffer`-style). **Depth:** high (Pavan Efficast hash-chain audit + fanflow explain guardrail). **Reject reason:** must not read as "generic explainability dashboard" — the tamper-evidence + failure→recovery is the differentiator.

### C46 — Calibrated-score decisioning with drift monitor
- **Thesis:** Calibrate predicted probabilities (isotonic/Platt) so expected-value math and bidding are trustworthy, and monitor calibration drift (PSI/KS) to catch silent degradation.
- **User:** Decision-science team. **Pain:** GBDTs distort probabilities; miscalibration breaks downstream bidding; models drift silently (09 #8, #20, #21). `VERIFIED`
- **Nearby capability:** Rokt Brain optimization. **Competitor precedent:** Black Crow scores in <20ms but calibration/drift transparency isn't the product; monitoring tools (Evidently) are generic. **New:** calibration + drift as a decisioning-integrity layer. **Why Rokt owns it:** owns the serving models. **AI method:** calibration + statistical drift (deterministic tests). **Data:** synthetic drifting streams; synthetic OK (HIGH feasibility). **Privacy:** aggregate stats, low. **Integration:** decisioning + Integration Monitor. **2-min story:** reliability diagram before/after; inject drift → PSI>0.2 fires → alert + audit. **Metric:** ECE/Brier; drift-detection lead time. **Guardrail:** alert, don't auto-retrain blindly. **Depth:** high. **Reject reason:** can look like "generic monitoring" unless tied to the offer decision.

### C47 — Contextual-bandit cold-start offer selector with regret accounting
- **Thesis:** A contextual bandit (LinUCB/Thompson) that explores new offers/users while earning, with visible cumulative-regret accounting and OPE replay.
- **User:** Decision-science; new-offer onboarding. **Pain:** cold-start on new offers/users; static rules never explore (09 #2). `VERIFIED`
- **Nearby capability:** Rokt Brain. **Competitor precedent:** bandits are standard; the wedge is tying explore/exploit to the *owned offer moment* + audit + fail-safe. **New:** exploration with an auditable safety envelope. **Why Rokt owns it:** owns the moment + demand. **AI method:** contextual bandit + OPE. **Data:** Open Bandit Pipeline synthetic; synthetic OK (HIGH). **Privacy:** standard behavioral. **Integration:** decisioning; Experiments. **2-min story:** regret curve vs a static baseline; a new offer is discovered; exploration is capped by constraints. **Metric:** cumulative regret; new-offer discovery. **Guardrail:** exploration bounded by C05 feasible set. **Depth:** high. **Reject reason:** "generic recommendation engine" risk — differentiate via the bounded/audited exploration envelope.

---

## DEVELOPER PLATFORM

### C48 — Offer-decision sandbox & scenario replay harness
- **Thesis:** A local harness that replays scripted shopper/offer/consent scenarios through the decisioning + constraint + audit stack, doubling as the test suite (scenario fixtures = tests).
- **User:** Rokt/partner engineers building on the decision layer. **Pain:** decisioning is a black box to integrators; hard to reason about edge cases (07 hiring signal: runnable demo > spec). `INFERENCE`
- **Nearby capability:** dev/testing tooling; `isDevelopmentMode`. **Competitor precedent:** feature-flag SDKs (LaunchDarkly) offer local eval; offer-decision replay is the wedge. **New:** decision replay as a first-class dev artifact. **Why Rokt owns it:** owns the decision contract. **AI method:** deterministic. **Data:** scenario fixtures; synthetic OK. **Privacy:** low. **Integration:** decisioning; `Selection.on()`. **2-min story:** run a scenario corpus (clean → edge → hostile) → every decision explained + audited; one command. **Metric:** edge-case coverage. **Guardrail:** N/A. **Depth:** high (Pavan `verify.sh` + scenario corpus). **Reject reason:** "observability/replay lab as THE product" is explicitly rejected — only as supporting capability.

### C49 — SDK integration simulator with fault injection
- **Thesis:** Simulate SDK init/attribute/close-the-loop flows with injected faults (missing attributes, `PLACEMENT_FAILURE`, timeouts) so integrators see failure → recovery before production.
- **User:** Partner engineers. **Pain:** integration errors silently degrade attribution; verification is manual devtools (05 PAIN 8; 02 §8). `VERIFIED`
- **Nearby capability:** Integration Monitor. **Competitor precedent:** none Rokt-specific. **New:** fault-injection for the Rokt SDK contract. **Why Rokt owns it:** owns the SDK. **AI method:** deterministic. **Data:** synthetic; synthetic OK. **Privacy:** low. **Integration:** `Selection.on()` incl. `PLACEMENT_FAILURE`. **2-min story:** inject a placement failure → SDK degrades gracefully, checkout unaffected, audit records it. **Metric:** defect-escape rate. **Guardrail:** N/A. **Depth:** medium-high. **Reject reason:** dev-experience must be supporting, not the thesis.

### C50 — First-party domain / identity-durability config assistant
- **Thesis:** Help partners set up `ROKT_DOMAIN` first-party subdomain routing correctly and measure identity-durability/match-rate impact.
- **User:** Partner engineering + marketing ops. **Pain:** third-party blocking degrades identity; `ROKT_DOMAIN` CNAME routing helps but is a manual setup (02 §7). `VERIFIED`
- **Nearby capability:** `ROKT_DOMAIN` routing. **Competitor precedent:** first-party-domain setups (server-side tagging) generic. **New:** Rokt-specific durability measurement. **Why Rokt owns it:** owns the routing feature. **AI method:** deterministic. **Data:** synthetic; synthetic OK. **Privacy:** identity-positive. **Integration:** `ROKT_DOMAIN`; Web SDK migration. **2-min story:** before/after match-rate with first-party routing. **Metric:** match-rate lift. **Guardrail:** consent still enforced. **Depth:** low-medium. **Reject reason:** narrow config utility; weak proof-of-work.

---

## RELIABILITY

### C51 — Fail-closed placement resilience layer ("checkout is sacred")
- **Thesis:** A resilience layer guaranteeing that any decisioning/render failure degrades to "show nothing" and never blocks, delays, or diverts checkout — with every `PLACEMENT_FAILURE` audited and recovered.
- **User:** Partner (their conversion is at stake); Rokt SRE. **Pain:** the cardinal guardrail — placements must never interfere with primary conversion; fail closed (10 G10/R7; 02 §8). `VERIFIED`
- **Nearby capability:** `PLACEMENT_FAILURE` event; async SDK load w/ fallback; reservation auto-release. **Competitor precedent:** none productizes a provable non-interference SLA. **New:** non-interference as a measured, audited guarantee. **Why Rokt owns it:** owns the placement + the guardrail. **AI method:** deterministic. **Data:** synthetic failure injection; synthetic OK. **Privacy:** low. **Integration:** `Selection.on()` `PLACEMENT_FAILURE`; Cart API reserve/release timeout. **2-min story:** inject decisioning outage → offer silently absent, checkout completes, audit shows fail-closed path. **Metric:** checkout-completion under failure (100%); non-interference SLA. **Guardrail:** the product *is* the guardrail. **Depth:** high (Pavan circuit-breaker + fail-closed + audit). **Reject reason:** none major — directly hits the cardinal rule + Pavan's failure→recovery→audit strength.

### C52 — Reservation lifecycle integrity (reserve → confirm/release → cancel)
- **Thesis:** Enforce Cart API transactional integrity — idempotent reserve/confirm, auto-release on timeout, safe cancel — so cross-sell fulfillment never double-books or strands a reservation.
- **User:** Partner + provider fulfillment. **Pain:** cross-sell items move through reserve→confirm→cancel with provider handoffs; retries risk double-fulfillment (02 §Stage 9). `VERIFIED`
- **Nearby capability:** Cart API v1 (reserve/release/confirm/cancel). **Competitor precedent:** order state machines exist; Rokt-Cart-API-specific integrity is the wedge. **New:** idempotent Cart API state machine with replay/recovery. **Why Rokt owns it:** owns the Cart API. **AI method:** deterministic. **Data:** synthetic cart transactions; synthetic OK. **Privacy:** low. **Integration:** Cart API reserve/release/confirm/`confirmation/cancel`. **2-min story:** retried confirm → idempotent no double-book; timeout → auto-release; provider failure → recover + audit. **Metric:** double-fulfillment rate (0). **Guardrail:** terminal-state guard. **Depth:** high (Pavan Dreamship replay orchestrator). **Reject reason:** none major — maps directly to a public transactional surface + Pavan's signature pattern.

### C53 — Conversion-signal replay & recovery
- **Thesis:** When conversion events fail delivery (429/5xx), reliably retry with backoff+jitter, dead-letter the unrecoverable, and replay from a durable log so no conversion is lost or double-counted.
- **User:** Rokt billing/attribution; partner/advertiser. **Pain:** Event API returns 400/401/403/429/5xx; docs demand backoff+jitter + "data never lost" (02 §8). `VERIFIED`
- **Nearby capability:** Event & Audience API (202 accepted; `Retry-After`); Integration Monitor. **Competitor precedent:** generic queue/DLQ; not tied to Rokt conversion integrity. **New:** conversion-integrity replay with dedup. **Why Rokt owns it:** owns the conversion pipeline. **AI method:** deterministic. **Data:** synthetic conversion streams w/ injected failures; synthetic OK. **Privacy:** low. **Integration:** Event & Audience API `/v2/events`; dedup by `transactionid`/`confirmationref`. **2-min story:** downstream 5xx storm → events retried, some dead-lettered + alerted, replay recovers them, no double-count. **Metric:** conversion loss (0); duplicate rate (0). **Guardrail:** idempotent dedup. **Depth:** high (Pavan outbox+backoff+DLQ). **Reject reason:** overlaps C54 — keep as the delivery/recovery-focused sibling.

---

## MARKETPLACE ECONOMICS

### C54 — Idempotent revenue-share reconciliation ledger
- **Thesis:** A tamper-evident ledger that records offer-served/conversion/revenue events exactly once, computes the "$7 of $8" partner split, and reconciles against the Event & Audience API so no revenue is double-counted or lost.
- **User:** Rokt billing/finance; partner revenue teams. **Pain:** revenue events arrive at-least-once; money must be reconstructable + tamper-evident; the single highest-value pattern for a Rokt build (12 §A1–A3). `VERIFIED/INFERENCE`
- **Nearby capability:** closed-loop measurement; "$7 of $8" partner share. **Competitor precedent:** Rebuy Monetize (~$0.20–0.35/order) outsources demand to Fluent and doesn't own an auditable split ledger; none expose tamper-evident reconciliation. **New:** verifiable revenue-share accounting. **Why Rokt owns it:** owns the money flow + both sides. **AI method:** deterministic. **Data:** synthetic revenue streams w/ duplicates/refunds; synthetic OK. **Privacy:** tenant-isolated finance data. **Integration:** Event & Audience API; dedup keys; Reporting API. **2-min story:** duplicate conversion → counted once; refund → split reversed; tamper a ledger row → chain verification localizes it; reconcile vs source. **Metric:** payout accuracy; reconciliation exceptions. **Guardrail:** idempotency + immutable audit; never client-trusted amounts. **Depth:** high (Pavan's strongest cluster). **Reject reason:** none major — most authentic fit + strongest evidence (money); risk is "backend-only" storytelling.

### C55 — Advertiser outcome-billing verifier (CPC→CPA/ROAS/LTV)
- **Thesis:** Verify that outcome-based charges (CPC/CPA/ROAS) match attributed, deduplicated conversions before billing, catching over/under-charge before it hits an advertiser.
- **User:** Advertiser finance; Rokt billing. **Pain:** "pay only for outcomes" requires airtight attribution↔billing matching (01 §3.8; 02 §Attribution). `VERIFIED/INFERENCE`
- **Nearby capability:** dynamic CPC; closed-loop measurement; dedup by `transactionid`/`confirmationref`. **Competitor precedent:** ad-billing reconciliation internal; verifiable outcome-billing is the wedge. **New:** billing-integrity verification tied to attribution. **Why Rokt owns it:** owns attribution + billing. **AI method:** deterministic 3-way match (conversion↔attribution↔charge). **Data:** synthetic; synthetic OK. **Privacy:** low. **Integration:** Event & Audience API; Reporting API. **2-min story:** a mis-attributed conversion → charge flagged before billing; audit shows the match. **Metric:** billing-dispute rate. **Guardrail:** never charge on unverified conversions. **Depth:** high. **Reject reason:** overlaps C54/C18 — keep as advertiser-billing-facing.

### C56 — Catalog commission & payout reconciliation
- **Thesis:** Reconcile Catalog Merchant-of-Record commissions (18–25% partner / 35–40% brand) against orders/returns/chargebacks so payouts are net-accurate.
- **User:** Catalog partner + brand finance. **Pain:** commission + fulfillment-time commitments layered over goods reconciliation; returns/chargebacks complicate payout (01 §3.2; 05 PAIN 6). `VERIFIED`
- **Nearby capability:** Catalog MoR model; transaction dashboard. **Competitor precedent:** marketplace payout tools; not Catalog-commission-native. **New:** commission-aware net payout ledger. **Why Rokt owns it:** owns the MoR commission terms. **AI method:** deterministic. **Data:** synthetic Catalog orders+returns; synthetic OK. **Privacy:** tenant-isolated. **Integration:** Catalog transaction data; EDI 810/812. **2-min story:** a return after payout → commission clawed back correctly; audit shows it. **Metric:** payout accuracy. **Guardrail:** idempotent adjustments. **Depth:** high. **Reject reason:** overlaps C15/C54; keep as the payout-economics view.

---

## ACCESSIBILITY

### C57 — WCAG-certified placement compliance harness
- **Thesis:** An automated + manual harness that verifies every consumer-facing placement meets WCAG 2.1/2.2 AA (contrast, keyboard operability, focus management, no focus traps, touch-target size, screen-reader semantics) — closing a documented public gap.
- **User:** Shoppers with disabilities/older adults; partners in regulated/public sectors. **Pain:** payment widgets "trap keyboard focus or announce nothing"; Rokt ad/CX policies don't explicitly cite WCAG (04 §3.3; 10 G15). `VERIFIED/INFERENCE`
- **Nearby capability:** overlay/embedded/interstitial placements. **Competitor precedent:** overlay a11y is a known failure area; a "WCAG-certified placements" commitment is a differentiator. **New:** accessibility-as-a-trust-guarantee for placements. **Why Rokt owns it:** owns the embed. **AI method:** deterministic (axe-style checks) + manual. **Data:** synthetic placements; synthetic OK. **Privacy:** N/A. **Integration:** placement render surfaces; `Selection.on()`. **2-min story:** a placement with a focus trap → flagged + fixed; keyboard-only journey works end-to-end. **Metric:** WCAG conformance; a11y defect rate. **Guardrail:** accessibility is non-negotiable. **Depth:** medium-high. **Reject reason:** may read as QA tooling unless paired with a decisioning/trust narrative.

### C58 — Adaptive placement for constrained contexts (mobile/reduced-motion/low-vision)
- **Thesis:** Adapt placement layout/format to constrained contexts (small viewport, `prefers-reduced-motion`, large text) so the offer never pushes the confirmation below the fold or breaks on mobile.
- **User:** Mobile-majority shoppers (80% mobile abandonment). **Pain:** confirmation offer must fit constrained screens without obscuring confirmation (04 §3.2). `VERIFIED/INDUSTRY`
- **Nearby capability:** responsive placements; Smart Interactions. **Competitor precedent:** responsive ads generic; confirmation-preserving adaptation is the wedge. **New:** confirmation-priority responsive rules. **Why Rokt owns it:** owns the placement. **AI method:** deterministic layout rules. **Data:** synthetic viewports; synthetic OK. **Privacy:** low. **Integration:** placement render; `PLACEMENT_RESIZE`. **2-min story:** on mobile, confirmation stays above the fold; reduced-motion honored. **Metric:** confirmation-visibility rate; mobile engagement. **Guardrail:** confirmation always visible. **Depth:** medium. **Reject reason:** presentation-heavy; limited backend depth.

---

## AGENTIC WORKFLOWS

### C59 — Internal ops agent for compliance/recall/eligibility research
- **Thesis:** A bounded internal agent that answers multi-hop ops questions (e.g., "which offers reference brands with open recalls or expiring licensing in 90 days?") by chaining catalog lookup → regulatory/policy search → synthesis, with citations and human sign-off.
- **User:** Rokt ad ops / policy team. **Pain:** genuine multi-hop internal research is manual; this is where agents add real value (09 #16). `VERIFIED`
- **Nearby capability:** Rokt Ads policy set; Catalog metadata. **Competitor precedent:** internal copilots generic; recall/licensing-eligibility chaining is bounded + specific. **New:** eligibility-research agent scoped to Rokt policy. **Why Rokt owns it:** owns the policy + catalog. **AI method:** agentic (real value here — internal, not serving) + RAG; deterministic eligibility verdicts. **Data:** synthetic catalog + policy corpus; synthetic OK. **Privacy:** access-controlled corpus. **Integration:** internal only (not the serving path). **2-min story:** agent finds offers at recall/licensing risk, cites sources, routes to a human. **Metric:** research time saved; catch rate. **Guardrail:** agent proposes; human approves; never in the real-time loop. **Depth:** medium-high. **Reject reason:** "multi-agent/agentic" is rejected as a differentiator by itself — must earn value via a real bounded internal task, not the offer loop.

### C60 — Creative-copy generation with human-review gate
- **Thesis:** Generate/vary compliant ad-creative copy (respecting Rokt Ads policy: 3-word titles, no all-caps, no coercive language) with structured outputs, then route to mandatory human review.
- **User:** Advertiser/campaign operator. **Pain:** creative production at scale is slow; policy compliance is dense (05 PAIN 1; 09 Part C). `VERIFIED`
- **Nearby capability:** Brain "dynamically generates creatives." **Competitor precedent:** ad-copy generators (Jasper) generic; Rokt-policy-aware generation + review gate is the wedge. **New:** policy-constrained generation with a review-and-audit gate. **Why Rokt owns it:** owns the policy + demand. **AI method:** LLM (legitimate periphery use) + deterministic policy lint (C36) + HITL. **Data:** synthetic briefs; synthetic OK. **Privacy:** low. **Integration:** pre-submission to Rokt Ads. **2-min story:** generate 5 variants → policy lint auto-rejects the all-caps one → human approves 2 → audit trail. **Metric:** creative throughput; rejection rate. **Guardrail:** human always reviews; never auto-publish (explicit-permission action). **Depth:** medium. **Reject reason:** LLM-copy tools are commodity — value is the policy-lint + review + audit wrapper.

### C61 — Offer-metadata enrichment pipeline (unstructured → structured)
- **Thesis:** Enrich messy merchant/offer metadata into structured attributes (category, eligibility flags, brand) via LLM structured outputs, feeding the deterministic ranker — an *offline* feature-prep sidecar, never in the serving loop.
- **User:** Rokt catalog/decisioning data team. **Pain:** unstructured offer/merchant metadata degrades ranking; enrichment is manual (09 #18; ANINE BING data-accuracy). `VERIFIED`
- **Nearby capability:** Catalog AI product-data enrichment. **Competitor precedent:** product-feed enrichment tools; the wedge is the structured-output bridge into a tabular ranker with validation. **New:** validated enrichment feeding decisioning. **Why Rokt owns it:** owns catalog + decisioning. **AI method:** LLM structured outputs (periphery) + deterministic schema validation. **Data:** synthetic messy metadata; synthetic OK. **Privacy:** depends on input; low. **Integration:** offline feature pipeline → decisioning. **2-min story:** messy offer text → validated {category, attributes}; schema-invalid output rejected; ranker consumes the clean features. **Metric:** schema-validity; field accuracy vs gold. **Guardrail:** silent-wrong-but-valid fields flagged; never in serving path. **Depth:** medium-high. **Reject reason:** enrichment is supporting infra; strongest as a sidecar to a decisioning thesis.

---

## ADDITIONAL CANDIDATES (breadth)

### C62 — Non-interference SLA monitor (contractual conversion guarantee)
- **Category:** reliability. **Thesis:** Continuously measure and prove that Rokt placements never reduce a partner's primary conversion, turning the cardinal guardrail into a contractual, monitored SLA. **User:** partner exec. **Pain:** partners lend their highest-intent surface and fear conversion harm (10 §3.8). `VERIFIED/HYPOTHESIS` **Nearby:** holdouts; Smart Interactions. **Competitor precedent:** none productizes a non-interference SLA. **New:** measured conversion-neutrality guarantee. **AI:** causal/holdout + deterministic alerting. **Data:** synthetic; OK. **Privacy:** aggregate. **Integration:** holdouts + Reporting API. **2-min story:** a config that would dip conversion → auto-flagged and rolled back. **Metric:** conversion-neutrality; SLA breaches. **Guardrail:** the SLA is the product. **Depth:** medium-high. **Reject:** overlaps C51/C44 — keep as the contractual/measurement framing.

### C63 — Household-aware checkout decisioning
- **Category:** identity. **Thesis:** Apply household/identity-graph context inside the transaction moment (shared-plan upsells, avoid cross-household mis-targeting). **User:** shopper in a shared household. **Pain:** household context exists for activation but not applied in-moment (03 §5.6). `HYPOTHESIS` **Nearby:** Household Reach. **Competitor precedent:** household graphs exist; in-moment application is the wedge. **New:** household context as a decision input. **AI:** deterministic household rules + identity confidence. **Data:** synthetic households; OK. **Privacy:** high care (household inference). **Integration:** identity + `/experiences`. **2-min story:** family-plan upsell shown to the plan owner only. **Metric:** household-relevant conversion. **Guardrail:** never reveal one member's data to another (R10). **Depth:** medium. **Reject:** duplicates mParticle Household Reach unless in-moment gate is central.

### C64 — Lapsed-customer reactivation audience product
- **Category:** lifecycle activation. **Thesis:** A named win-back product using advertiser-supplied lapsed-customer CRM lists to reach customers unreachable by email (Wine.com pattern). **User:** advertiser/retention. **Pain:** lapsed customers unreachable via email; Wine.com hit 5.8x ROAS (06 §5). `VERIFIED` **Nearby:** Custom Audience Import; Rokt Ads. **Competitor precedent:** win-back campaigns generic; transaction-moment reach is the wedge. **New:** productized lapsed-reactivation at the moment. **AI:** uplift for reactivatable segments. **Data:** synthetic lapsed lists; OK. **Privacy:** suppression + consent. **Integration:** Custom Audience Import; suppression lists. **2-min story:** lapsed list → reachable at others' checkout moments; uplift targets the reactivatable. **Metric:** reactivation ROAS. **Guardrail:** honor suppression/consent. **Depth:** medium. **Reject:** close to standard audience marketing.

### C65 — Zero-party-data quiz → propensity template
- **Category:** customer data. **Thesis:** A packaged "quiz/zero-party-data → propensity model" pattern (Tatcha Ritual Finder: 8.5x revenue) for beauty/retail. **User:** DTC lifecycle marketer. **Pain:** brands want propensity models without building AI in-house (06 §11). `VERIFIED` **Nearby:** Predictive Audiences/Cortex. **Competitor precedent:** quiz tools (Octane AI) + separate modeling; the integrated template is the wedge. **New:** zero-party→propensity as a reusable template. **AI:** GBDT propensity. **Data:** synthetic quiz responses; OK. **Privacy:** zero-party is consent-clean. **Integration:** Event & Audience API. **2-min story:** quiz completion propensity → high-propensity segment outperforms the engaged base. **Metric:** revenue per segment. **Guardrail:** zero-party only. **Depth:** medium. **Reject:** duplicates mParticle predictive suite — template packaging is the only novelty.

### C66 — KYC/onboarding-funnel recovery for fintech
- **Category:** lifecycle activation. **Thesis:** A vertical onboarding-funnel-recovery flow targeting KYC/identity-verification drop-off (Lulo: 18% never open a savings account) distinct from generic cart abandonment. **User:** neobank/fintech growth (Lulo persona). **Pain:** KYC drop-off is a distinct, high-value regulated failure point (06 §18). `VERIFIED` **Nearby:** mParticle Analytics + Audiences. **Competitor precedent:** funnel tools generic; KYC-specific recovery is the wedge. **New:** regulated-onboarding recovery template. **AI:** funnel analysis + retargeting propensity. **Data:** synthetic onboarding funnels; OK. **Privacy:** KYC data is sensitive — minimize. **Integration:** Event & Audience API; Audiences. **2-min story:** identity-verification abandoner → targeted recovery; funnel shows the drop-off stage. **Metric:** onboarding-completion lift. **Guardrail:** no sensitive-data misuse. **Depth:** medium. **Reject:** overlaps mParticle Analytics; vertical framing is the novelty.

---

## Distribution check (category coverage)

| Category | Candidates |
|---|---|
| shopper experience | C01, C02, C03 |
| checkout relevance | C04, C05, C06 |
| payment | C07, C08, C09 |
| post-purchase | C10, C11, C12 |
| catalog | C13, C14, C15 |
| advertising | C16, C17, C18 |
| customer data | C19, C20, C21, C65 |
| identity | C22, C23, C24, C63 |
| lifecycle activation | C25, C26, C64, C66 |
| retention | C27, C28 |
| cancellation | C29, C30 |
| loyalty | C31, C32 |
| privacy | C33, C34, C35 |
| brand safety | C36, C37, C38 |
| partner operations | C39, C40, C41 |
| experimentation | C42, C43, C44 |
| AI decisioning | C45, C46, C47 |
| developer platform | C48, C49, C50 |
| reliability | C51, C52, C53, C62 |
| marketplace economics | C54, C55, C56 |
| accessibility | C57, C58 |
| agentic workflows | C59, C60, C61 |

**Total: 66 candidates across all 22 categories.**

---

## Synthesis note (honest, even-handed)

The candidates cluster into four postures. (1) **Decision-integrity / money-integrity** (C45, C51, C52, C53, C54, C55, C56, C42) — strongest evidence (money + the cardinal checkout guardrail), deepest engineering, and the most authentic fit with Pavan's idempotency/outbox/audit/reconciliation DNA; these show FAILURE→RECOVERY→AUDIT, the top hiring differentiator (07 §5). (2) **Trust-made-visible** (C01, C33, C34, C35, C57) — turns Rokt's load-bearing trust posture into a verifiable artifact; genuinely novel but some risk of thin backends. (3) **Right-tool decisioning** (C04, C05, C06, C46, C47, C27, C17, C44) — respects the "classical ML/deterministic beats LLM in the core loop" steer, but several skirt "generic recommendation engine"/"better Brain" and must foreground the *seam, constraint, or safety envelope*, not ranker quality. (4) **Operator/periphery tooling** (C36, C37, C39, C40, C41, C59, C60, C61, C13, C15, C20) — real pain, human-in-the-loop, but the steers explicitly demote dev-experience/observability/integration/testing to *supporting* capabilities, not the thesis.

The most defensible flagship space is the intersection: **a confirmation-moment decision-and-money-integrity layer** — deterministic eligibility/constraint/frequency enforcement (C05) wrapping a bandit/calibrated ranker (C47/C46), gated by off-policy safe-rollout (C42), guaranteed fail-closed (C51), recorded on a tamper-evident "why this offer" provenance spine (C45), with idempotent conversion/revenue reconciliation (C53/C54) — all demonstrable on synthetic/Open-Bandit data, with LLM only at the periphery (C60/C61). This is the space the scorecard (`15_WEIGHTED_SCORECARD.md`) weights toward, while keeping genuinely different ideas (trust, accessibility, cancellation, catalog economics) in contention.
