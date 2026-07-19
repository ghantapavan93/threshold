# 03 — SDK+ & mParticle: Rokt's Strategic Direction

**Author:** Agent 3 (SDK+ & mParticle Strategic-Direction Researcher)
**Retrieval date:** 2026-07-18
**Method:** Public primary sources (rokt.com, mparticle.com, docs.mparticle.com, PR Newswire, trade press). Every claim labeled `[VERIFIED-PUBLIC]`, `[INFERENCE]`, or `[HYPOTHESIS]`.

> Labeling contract: `[VERIFIED-PUBLIC]` = stated in a cited public source. `[INFERENCE]` = logically derived from cited facts. `[HYPOTHESIS]` = forward-looking possibility framed as opportunity, NOT a claimed gap. Per instructions, this report never asserts that Rokt/mParticle *lacks* a capability.

---

## 1. Executive Summary — The Strategic Signal

Rokt acquired mParticle in a **US$300M merger announced ~January 15–16, 2025**, forming "**mParticle by Rokt**" `[VERIFIED-PUBLIC]`. The thesis is explicit in Rokt CEO framing: Rokt historically had only "a moment — the time between when a purchase is made to when the confirmation or checkout page loads" to understand a customer; mParticle supplies "a live feed of data" `[VERIFIED-PUBLIC]`. Rokt **doubled total investment** into the CDP to accelerate the roadmap `[VERIFIED-PUBLIC]`.

On **June 25, 2026**, the combined entity launched the **Performance Engine, led by the Audience Agent** — turning first-party data into "measurable revenue lift" `[VERIFIED-PUBLIC]`.

**The direction:** Rokt is evolving from a checkout-moment decisioning company (Rokt Brain + Rokt Network) into a **full-lifecycle, identity-grounded relevance platform** — combining checkout decisioning with real-time first-party customer data (mParticle CDP) to act across acquisition, activation, retention, LTV, and churn `[INFERENCE]`.

---

## 2. Why Rokt Acquired mParticle

| Item | Detail | Label |
|---|---|---|
| Deal value | US$300 million strategic merger | `[VERIFIED-PUBLIC]` |
| Announced | ~Jan 15–16, 2025 | `[VERIFIED-PUBLIC]` |
| New entity | "mParticle by Rokt" | `[VERIFIED-PUBLIC]` |
| Investment signal | Rokt "doubled total investment" into the CDP to accelerate roadmap | `[VERIFIED-PUBLIC]` |
| Joint-client evidence | "up to 50% better consumer and business outcomes" across billions of transactions | `[VERIFIED-PUBLIC]` |

**Executive statements** `[VERIFIED-PUBLIC]`:
- **Bruce Buchanan (Rokt CEO):** "This merger will enable us to bring significant performance lift to all of our clients."
- **Michael Katz (mParticle CEO, retains role):** combining the two "will offer the best of both worlds" — real-time data activation while maintaining "complete first-party data ownership."
- **Leadership integration:** Andrew Katz becomes **Rokt CTO**; Jason Lynn remains mParticle CPO; all join Rokt's executive team.

**Rationale (synthesized):** Rokt's decisioning was constrained by a cold-start problem at the transaction peak — limited knowledge of *who* the shopper is. mParticle resolves fragmented signals into a real-time Customer 360, feeding richer identity and behavioral context into Rokt Brain's split-second decision `[INFERENCE]`.

---

## 3. Where Rokt Is Moving BEYOND the Checkout Transaction Moment

The Transaction Moment™ spans Selection, Cart/Review, Payment, and Confirmation, where Rokt Brain (trained on 6B+ transactions annually; 10B+ transactions across 1.1B customers) selects the next best action `[VERIFIED-PUBLIC]`. The strategic expansion beyond that single moment:

1. **Full customer-journey coverage.** Rokt's own product suite already spans pre-purchase (**Rokt Ads** — acquisition), at-purchase (**Rokt Upcart**), and post-purchase (**Rokt Aftersell**, **Rokt Thanks**) — "a full-journey commerce platform rather than a single-point checkout solution" `[VERIFIED-PUBLIC]`.
2. **CDP as always-on data layer.** mParticle "innovations extend relevance across the entire customer journey — acquisition, personalization, loyalty, and cross-channel engagement — rather than limiting functionality to transaction moments" `[VERIFIED-PUBLIC]`.
3. **Cross-channel activation.** 300+ native integrations push audiences to ad platforms (Google, Meta) and martech — action occurs off Rokt's own checkout surface `[VERIFIED-PUBLIC]`.
4. **Predictive lifecycle intelligence.** Predictive Audiences / Predictions score churn risk, LTV, and Next Best Action — retention and lifecycle use cases, not just the buy moment `[VERIFIED-PUBLIC]`.

**Conclusion:** The platform is moving from *one moment* to *continuous, identity-anchored relevance across the whole lifecycle*, with the Transaction Moment as the highest-intent activation point rather than the boundary `[INFERENCE]`.

---

## 4. Capabilities ALREADY PUBLIC (a prototype must NOT merely duplicate these)

All `[VERIFIED-PUBLIC]` unless noted. These are shipped or documented today.

### Identity & Data Foundation
- **Real-Time / Advanced Identity Resolution** — "from Unknown User to Customer 360"; resolves fragmented signals across devices/platforms instantly.
- **Real-Time Account Disambiguation** — identifies which customer is active when multiple accounts share a device/browser.
- **Identity Observability** — visibility into how identities are created, linked, maintained (governance).
- **Customer Profiles / Customer 360** — unified actionable profiles.
- **Event Collection** — capture across digital + offline via SDKs, APIs, direct connectors.
- **Data Master** — collaborative data schemas/data plans defining how data is collected, managed, validated (UI, Data Plan Builder, Data Planning API).
- **Hybrid CDP** — activate via real-time pipelines *and* cloud warehouses in one system.

### Audience Intelligence & Performance Accelerators (Performance Engine, Jun 25 2026)
- **Audience Agent** — reasons through a brand's data to propose a stronger audience for marketer approval.
- **Match Boost** — appends privacy-compliant third-party identifiers; **25%+** match-rate lift (Hardee's +117% Google match rate; Carl's Jr. +62% Google / +22% Meta).
- **Audience Expansion** — ML lookalike modeling within first-party data; tune toward conversion or reach.
- **Household Reach** — groups household relationships for shared activation (family plans, shared subscriptions, home services).
- **Audience Insights** — pre/post-campaign size, reach, overlap visibility.
- **Real-Time Audiences** — instant segmentation; suppress converted/low-intent users.

### Predictive Suite (Cortex ML engine)
- **Predictive Audiences** — score or percentile likelihood of a future event.
- **Predictions** — Future Behavior, **Next Best Action** (which offer most likely converts), Similar Customer Predictions. (Tatcha: **8.5x revenue, 5x conversion**.)
- **Predictive Attributes** — e.g., "likelihood to purchase in next 7 days," high-value order propensity, real-time LTV signals.

### Activation / Conversions
- **Conversions API pathways** — Google Enhanced Conversions (Upload Click Conversions API), Google Marketing Platform/Floodlight, Facebook/Meta Offline Conversions.
- **300+ native integrations.**

### Privacy & Governance
- SOC 2 Type II, ISO 27001, GDPR/CCPA compliant.
- Encrypted clean rooms; data ownership retained by partners; no PII exchanged in clean-room model.
- Enterprise-grade observability / auditing.

### Decisioning (Rokt side)
- **Rokt Brain** — AI engine, 6B+ transactions/yr, 12+ yrs ML; Brain v4 referenced. Selects next best action in the Transaction Moment; enforces minimum reserve quality (may show no offer).
- **Rokt Network** — 33,000+ clients, 10B+ transactions annually.

> A prototype should **extend or connect** these, not re-implement identity resolution, audience building, predictive scoring, or match-rate boosting.

---

## 5. NEW Connective Opportunity Spaces (Non-Duplicative)

Framed strictly as `[HYPOTHESIS]` / `[INFERENCE]` — the novel value from **Rokt Brain (checkout decisioning) + mParticle (real-time first-party CDP)** now living under one roof. These are *opportunities*, not claimed gaps.

1. **Transaction-Moment → CDP closed feedback loop (real-time profile write-back).** Every Rokt Brain decision, impression, and in-moment response is a fresh, high-intent signal. Writing these back into the mParticle profile in real time could sharpen identity confidence and next-decision quality across the lifecycle. `[HYPOTHESIS]` — connects two existing public assets rather than duplicating either.

2. **Profile-conditioned checkout decisioning ("warm-start the Brain").** The stated cold-start pain — knowing a shopper in the confirmation-page moment — is directly addressable by conditioning Brain's auction on the mParticle Customer 360 + Predictive Attributes (LTV, churn, next-7-day purchase) at decision time. `[INFERENCE]` from the acquisition rationale; the *orchestration layer* between them is the opportunity space.

3. **Lifecycle orchestration triggered by the Transaction Moment.** Use the checkout signal as the trigger event for downstream retention/winback/loyalty journeys via the CDP's 300+ integrations — Next Best Action extended from "offer at checkout" to "next best action across the customer's next 30/60/90 days." `[HYPOTHESIS]`.

4. **Unified LTV/churn optimization objective spanning acquisition→retention.** Rokt Brain optimizes in-moment relevance; mParticle scores lifetime value and churn. A shared objective function that optimizes *predicted incremental LTV* (not just moment-level conversion) is a connective capability neither side ships standalone today. `[HYPOTHESIS]`.

5. **Agent-to-agent: Audience Agent ↔ Brain decisioning.** The Audience Agent reasons over data to build audiences; Rokt Brain reasons over the moment. A connective layer where the Audience Agent's segments and Brain's real-time context inform each other (household context, disambiguated identity, suppression of just-converted users) could compound outcomes. `[HYPOTHESIS]` — builds on both public agents.

6. **Household + identity-graph-aware checkout.** Household Reach and Real-Time Account Disambiguation exist for activation; applying that household/identity context *inside* the Transaction Moment (shared-plan upsells, avoiding cross-household mis-targeting) is a connective use case. `[HYPOTHESIS]`.

---

## 6. Lifecycle / Positioning Map

| Lifecycle stage | Public capability today | Connective opportunity |
|---|---|---|
| **Acquisition** | Rokt Ads; Audience Expansion; Match Boost | Warm-start Brain with CDP identity `[HYP]` |
| **Activation** | Real-Time Audiences; Audience Agent; Next Best Action | Transaction-Moment-triggered journeys `[HYP]` |
| **Retention/Churn** | Predictive Audiences (churn); suppression | Shared LTV objective across stages `[HYP]` |
| **LTV** | Real-time LTV signals; Predictive Attributes | Profile write-back from every Brain decision `[HYP]` |

---

## 7. Sources (retrieval date 2026-07-18)

1. mParticle — "Rokt and mParticle Merge to Redefine Real-Time Relevance." https://www.mparticle.com/news/rokt-and-mparticle-merge/ (Jan 2025) `[VERIFIED-PUBLIC]`
2. Rokt blog — "Redefining Real-Time Relevance with mParticle Merger." https://www.rokt.com/blog/redefining-real-time-relevance-with-mparticle-merger `[VERIFIED-PUBLIC]`
3. AdExchanger — "Rokt Acquires mParticle For $300 Million." https://www.adexchanger.com/commerce/rokt-acquires-mparticle-for-300-million/ `[VERIFIED-PUBLIC]`
4. PR Newswire — "Rokt and mParticle Merge to Redefine Real-Time Relevance." https://www.prnewswire.com/news-releases/rokt-and-mparticle-merge-to-redefine-real-time-relevance-302352650.html `[VERIFIED-PUBLIC]`
5. PR Newswire — "Rokt mParticle Launches Performance Engine, Led by Audience Agent." https://www.prnewswire.com/news-releases/rokt-mparticle-launches-performance-engine-led-by-audience-agent-302810947.html (Jun 25, 2026) `[VERIFIED-PUBLIC]`
6. Rokt — "Compound Outcomes with Real-Time Relevance | Rokt mParticle." https://www.rokt.com/products/rokt-mparticle `[VERIFIED-PUBLIC]`
7. Rokt blog — "Rokt mParticle Innovations: Building for What's Next." https://www.rokt.com/blog/rokt-mparticle-innovations-building-for-whats-next `[VERIFIED-PUBLIC]`
8. mParticle blog — "mParticle Innovations: Building for What's Next (2025)." https://www.mparticle.com/blog/rokt-mparticle-innovations-2025/ `[VERIFIED-PUBLIC]`
9. Rokt — "AI-Powered Ecommerce Relevance Platform | Rokt Brain & Rokt Network." https://www.rokt.com/products/rokt-brain-and-rokt-network `[VERIFIED-PUBLIC]`
10. Rokt — "Unlock More Value in the Transaction Moment | Product Overview." https://www.rokt.com/products/product-overview `[VERIFIED-PUBLIC]`
11. docs.mparticle.com — Predictive Audiences (Overview / Using). https://docs.mparticle.com/guides/segmentation/predictive-audiences/overview/ `[VERIFIED-PUBLIC]`
12. docs.mparticle.com — Predictions overview (Next Best Action). https://docs.mparticle.com/guides/customer-360/predictions/overview/ `[VERIFIED-PUBLIC]`
13. docs.mparticle.com — Data Master / Data Planning. https://docs.mparticle.com/guides/data-master/data-planning/ `[VERIFIED-PUBLIC]`
14. mParticle — Data Master platform page. https://www.mparticle.com/platform/detail/data-master/ `[VERIFIED-PUBLIC]`
15. docs.mparticle.com — Google Enhanced Conversions / conversion tracking. https://docs.mparticle.com/integrations/google-enhanced-conversions/ `[VERIFIED-PUBLIC]`
16. TipRanks — "Rokt Unveils Brain v4 AI Engine." https://www.tipranks.com/news/private-companies/rokt-unveils-brain-v4-ai-engine-to-enhance-transaction-moment-relevance `[VERIFIED-PUBLIC]`

---

## 8. Freshness & Confidence

- **Freshness:** Acquisition (Jan 2025) and Performance Engine (Jun 25, 2026) are both recent and current as of retrieval 2026-07-18. High freshness.
- **Confidence — HIGH:** Deal value/date, executive statements, named capabilities (Audience Agent, Match Boost, Audience Expansion, Household Reach, Predictive Audiences, Data Master, identity resolution), and performance metrics — all from primary/official sources.
- **Confidence — MEDIUM:** Exact "SDK+" branding was not isolated on a dedicated public page during this pass; SDK/event-collection capability is verified, but if "SDK+" is a specific named product, its standalone spec page should be confirmed. Brain v4 details are press-level.
- **Confidence — LABELED:** All Section 5 opportunity spaces are `[HYPOTHESIS]`/`[INFERENCE]` by design — forward-looking connective ideas, not verified roadmap and not claimed gaps.
- **No fabrication.** Where a capability page did not explicitly name a term (e.g., some pages omit "Data Master" / "Conversions API"), the term was verified from a *different* cited source rather than assumed.
