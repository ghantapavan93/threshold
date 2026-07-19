# 08 — Competitive & Adjacent-Platform Capability Matrix

**Agent 8 — Competitive & Adjacent-Platform Researcher**
**Retrieval date: 2026-07-18** · **Today's date: 2026-07-18**
**Purpose:** Map official, public capabilities of ~30 adjacent platforms to locate white space adjacent to Rokt (checkout-moment decisioning) + mParticle (real-time first-party CDP) — so we avoid proposing a clone.

## How to read this document

- Evidence labels: **[VERIFIED-PUBLIC]** = stated on the company's own site/docs/blog; **[INFERENCE]** = reasoned from their own stated data models, channels, or positioning; **[HYPOTHESIS]** = unconfirmed, flagged as such.
- All capability claims are drawn strictly from primary sources (company domains, official docs, official newsrooms/press). Third-party blogs were used only to locate primary pages, never as the basis for a capability claim.
- Caveat on "limitations": most vendor pages do not expose publication dates, and *absence of a claim on a marketing page is INFERENCE, not proof* a capability is missing. Hard confirmation that a vendor has *no* checkout-moment product would require an RFP-level check.

---

## 0. The yardstick — Rokt + mParticle (what we are comparing against)

**Rokt** [VERIFIED-PUBLIC — rokt.com]
- **Core:** Decisioning across the **Transaction Moment™** — the steps from *Selection → Cart/Review → Payment → Confirmation* — delivering the "next best action, message, or offer in a native, conversion-safe way."
- **Unique mechanism:** The **Rokt Brain**, a proprietary AI engine "trained on more than 6 billion transactions annually" / "analyzes 1.95+ trillion data points per year to deliver the next best action in real-time"; operates across "10 billion transactions yearly," 30,000+ brands.
- **Two-sided network:** A curated **premium advertiser/offer network** ("PayPal, Uber, Live Nation, AMC Theatres, Hulu," 4,600+ brands) monetizing the confirmation/payment surface — i.e., *third-party paid demand injected into the merchant's own checkout*, not just the merchant's own catalog.
- **Data governance:** "clients maintain 100% ownership and control of their data"; raw customer data "never shared."
- **Economics:** returns "$7 of every $8 in value generated back to partners."

**mParticle by Rokt** [VERIFIED-PUBLIC — rokt.com / mparticle.com / PRNewswire]
- Real-time first-party **CDP** (acquired by Rokt Jan 2025, ~$300M). 300+ pre-built connectors; real-time audience targeting cited to improve customer-acquisition cost by "nearly 25%."
- **"Hybrid CDP / Power of AND":** "Real-time pipelines and warehouse-native activation run side by side—and work together when it matters most" — i.e., it spans BOTH the real-time-ingesting-CDP camp (Segment/Tealium) AND the warehouse-native camp (Hightouch/RudderStack), which no single competitor in this scan does.

**The combined position to defend:** *checkout-moment offer decisioning* **AND** *real-time first-party data unification/activation* in one owned surface, with a two-sided paid-offer network. Every platform below has at most one of these three ingredients.

---

## 1. Capability matrix (all platforms)

Columns: **CO-MO** = decisions/serves offers at the ecommerce checkout/transaction moment · **1P-CDP** = real-time first-party customer-data unification + activation · **3P-DEMAND** = brings *third-party paid* advertiser demand (a media/offer network), not just the merchant's own catalog.

| Platform | Category | Primary surface | CO-MO | 1P-CDP | 3P-DEMAND | Key public limitation (their own positioning) |
|---|---|---|---|---|---|---|
| **Rokt + mParticle** | *(yardstick)* | Checkout Transaction Moment + CDP | **Yes** | **Yes (hybrid)** | **Yes (premium network)** | — |
| Dynamic Yield | Commerce personalization | Web/app/email experiences | No | Partial (ingests CRM/ESP/DMP) | No | Onsite/app/email experience optimization only |
| Bloomreach | Commerce personalization + CDP-ish | Search + owned-channel marketing | No | Closest (Engagement/Loomi) | No | Activates *owned* channels; catalog+pixel dependent |
| Constructor | Commerce search/discovery | Search/browse/recs ranking | No | No | No | Ranks the merchant's *own catalog*; no CDP |
| Nosto | Commerce personalization | Onsite storefront | No | No | No | Self-described "**on-site**" CXP |
| Algolia | Search API | Index-based search/ranking | No | No | No | Dev-integrated re-ranker; cold-start dependent |
| Amazon Personalize | ML recs API | Headless recommendation API | No | No | No | Building block; you build delivery + capture events |
| Segment (Twilio) | Real-time CDP | Data collection/routing | No | Yes | No | Pipes to destinations; predictions batch (7–30d) |
| Hightouch | Composable CDP | Warehouse reverse-ETL + AI Decisioning | No | Warehouse-native | No | 100% warehouse-dependent; syncs to *others'* channels |
| Census (Fivetran) | Reverse ETL | Warehouse → apps sync | No | Warehouse-native | No | Sync-only; no decisioning/serving |
| RudderStack | Warehouse-native CDP | Event stream + reverse-ETL | No | Warehouse-native | No | Routes data; no offer serving |
| Tealium | Real-time CDP | Collect/orchestrate/activate | No | Yes | No | Orchestrates to integrated systems; no checkout |
| Adobe RTCDP | Real-time CDP (enterprise) | Profiles + audience activation | No | Yes | No | Decisioning is a *separate* SKU (Journey Optimizer) |
| Amplitude | Analytics-native CDP | Behavioral audiences + activation | No | Yes | No | Syncs audiences; execution downstream |
| Braze | Engagement | Cross-channel messaging | No | Consumes 1P data | No | Serves only its *own owned channels* (email/SMS/push) |
| Iterable | Engagement | Cross-channel messaging | No | Relies on upstream CDP | No | Owned/marketing channels; needs source data |
| Optimizely | Experimentation | Web/feature A/B + bandits | No | No | No | Testing/flags; not a decisioning-of-offers surface |
| Statsig | Experimentation | Flags + warehouse-native stats | No | No | No | Experiment infra; no offers, no CDP |
| LaunchDarkly | Feature management | Guarded/progressive rollouts | No | No | No | Release safety, not customer offer decisioning |
| Eppo (Datadog) | Experimentation | Warehouse-native experiments | No | No | No | Analysis/flags in warehouse; no serving surface |
| Stripe | Payments | Checkout + payments | Adjacent (own upsells only) | No | No | "does not offer one-click **post-purchase** upsells natively" |
| Adyen | Payments | Auth-rate/risk ML on payments | No | No | No | Optimizes the *payment* (auth/fraud), not offers |
| Klarna | BNPL + retail media | App shopping feed + Ads Manager | Partial (app, not merchant checkout) | 1P transaction data | **Yes (ad network)** | Ads live in *Klarna's* app/search, not merchant's checkout |
| Afterpay (Cash App) | BNPL + retail media | Shop Directory + Afterpay Ads | Partial (app/directory) | 1P transaction data | **Yes (ad network)** | Discovery/ads in *Afterpay's* app, not merchant checkout |
| **Rebuy** | Checkout upsell + ads | Smart Cart + post-purchase (+**Monetize**) | **Yes (closest)** | Merchant catalog + Fluent graph | **Yes (via Fluent)** | Shopify-bound; ad demand is *Fluent's*, not owned |
| Recharge | Subscriptions/retention | Sub billing + churn prevention | No | Subscriber data | No | Subscription lifecycle; merchant's own offers only |
| Loop Returns | Returns/retention | Exchange-first returns + Checkout+ | No | Returns data | No | Returns flow; retains revenue, no offer network |
| Black Crow AI | Predictive AI | Real-time value prediction | No | 1P behavioral + ID | No | Predicts/optimizes; no offer network, no checkout serve |
| Wunderkind | Identity + triggered msg | Identity graph → email/text/ads | No | Identity graph (9B devices) | No | Serves *owned/triggered* channels, not checkout |
| Attentive | SMS/email + identity | Triggered messaging | No | Identity AI (1P) | No | Messaging channel; not checkout decisioning |
| Klaviyo | B2C CRM + marketing | Email/SMS + KDP data platform | No | Yes (real-time KDP) | No | Owned-channel marketing; not a checkout surface |

---

## 2. Platform profiles

Each profile: **Core · Target · Unique mechanism · Data · AI · Workflow · Value · PUBLIC limitation · Rokt does differently · Adapt into a Rokt-native capability · Why a direct copy would be weak.**

### 2A. Commerce personalization / search

**Dynamic Yield (by Mastercard)**
- **Core** [VERIFIED-PUBLIC]: Omnichannel personalization + experimentation "Experience OS," "1:1 personalized experiences in real-time." **Target:** enterprise ecommerce/media marketers & product teams. **Unique mechanism** [VERIFIED-PUBLIC]: "AdaptML" deep-learning stack (NextML/NLP, AffinityML/RNN, VisualML/Vision-Transformer) + "Shopping Muse" GenAI assistant. **Data** [VERIFIED-PUBLIC]: in-session + historic behavioral/contextual profile; merges CRM/ESP/DMP/APIs. **AI**: NLP + RNN deep learning. **Workflow**: WYSIWYG campaign editor, no dev needed. **Value**: differentiate/scale experiences with native A/B testing.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: delivery is "web, in emails, and via mobile apps" — onsite/app/email experience optimization; no third-party offer/ad decisioning at payment/confirmation.
- **Rokt does differently:** owns the transaction moment with a paid two-sided network, not just the merchant's own experiences. **Adapt:** Rokt could offer DY-style deep-learning affinity profiles *fed by mParticle real-time first-party data* to sharpen offer relevance at checkout. **Why copying is weak:** cloning onsite recs enters a crowded personalization market and abandons Rokt's differentiated monetized surface + advertiser demand.
- Sources: dynamicyield.com/ai/, /recommendations/, /enterprise-grade-personalization/.

**Bloomreach**
- **Core** [VERIFIED-PUBLIC]: Discovery (search/merchandising/recs) + Engagement (marketing automation, 13+ channels), unified by **Loomi AI**. **Target:** enterprise commerce. **Unique mechanism** [VERIFIED-PUBLIC]: "Loomi connects first-party customer and product data with business metrics"; Behavioral Sequence model trained on pixel-tracked interactions. **Data** [VERIFIED-PUBLIC]: catalog feed + pixel events + first-party customer data. **AI**: commerce-specific ranking + predictive AI, "5ms–2s." **Workflow**: connect catalog, implement pixel, configure in Personalization Studio. **Value** [VERIFIED-PUBLIC]: "up to a 40% increase in revenue generated from search."
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: Engagement channels are "email, SMS, RCS, WhatsApp, Web Personalization, Mobile App" — *owned* channels, not third-party offers at checkout confirmation.
- **Rokt does differently:** Bloomreach is the closest to first-party-data + activation, but activates the brand's owned media; Rokt monetizes checkout with external advertiser demand. **Adapt:** a Rokt "confirmation-page relevance" API that ingests a brand's Bloomreach first-party segments to target offers. **Why copying is weak:** Bloomreach already owns enterprise search+engagement; replicating it is a feature war Rokt would fight from behind, with no monetization edge.
- Sources: bloomreach.com/en; documentation.bloomreach.com/discovery.

**Constructor**
- **Core** [VERIFIED-PUBLIC]: AI-native product discovery (search/browse/recs/quiz/agents) — "a central Commerce Reasoning Engine that interprets behavior, context, and intent." **Target:** enterprise retailers (Sephora, Gap, REI). **Unique mechanism**: optimizes for "attractiveness…not only relevance" (ranks toward revenue KPIs). **Data**: clickstream + catalog. **AI** [VERIFIED-PUBLIC]: "transformers, LLMs…reinforcement learning." **Workflow**: ingest catalog+clickstream, engine ranks, merchandiser rules. **Value**: higher CTR/sales.
- **PUBLIC limitation** [INFERENCE]: ranks the *merchant's own catalog*; no CDP, no checkout-moment offer decisioning.
- **Rokt does differently:** Rokt places *third-party* offers optimized to incremental profit, not just self-catalog ordering. **Adapt:** borrow "optimize toward business KPI, not relevance" as the objective for checkout offer selection (already Rokt's ethos). **Why copying is weak:** discovery ranking is catalog-bound and doesn't unlock a new revenue line.
- Sources: constructor.com/how-it-works/collaborative-personalization/, /solutions/search.

**Nosto**
- **Core** [VERIFIED-PUBLIC]: "AI-powered **on-site** Commerce Experience Platform." **Target:** mid-market DTC on Shopify/Adobe/BigCommerce/SFCC. **Unique mechanism**: "experience.AI™" unifies intent data in one engine. **Data**: customer/product/content + real-time onsite behavior. **AI** [VERIFIED-PUBLIC]: Predictive, Semantic, Visual, Generative (integrates ChatGPT). **Workflow**: install tag, auto-serve recs/content/search. **Value** [VERIFIED-PUBLIC]: "average ROI of 15x."
- **PUBLIC limitation** [VERIFIED-PUBLIC]: explicitly "on-site" — session/onsite personalization; no third-party checkout offers, no cross-media CDP activation.
- **Rokt does differently:** transaction-moment monetization vs. onsite merchandising. **Adapt:** none core; at most Nosto-style visual/semantic AI to render native offer creative. **Why copying is weak:** onsite recs are commoditized in Rokt's SMB segment; no moat.
- Sources: nosto.com/commerce-experience-platform/.

**Algolia**
- **Core** [VERIFIED-PUBLIC]: Hosted AI search + browse + recommendations + personalization APIs. **Target:** developers/eng teams. **Unique mechanism**: personalization "refines…by changing the order of pre-sorted results"; vector embeddings + image fingerprints. **Data**: synced product index + streamed events. **AI** [VERIFIED-PUBLIC]: supervised ML affinity profiles. **Workflow**: sync index, stream events, integrate via API/SDK. **Value**: relevance → conversion.
- **PUBLIC limitation** [VERIFIED-PUBLIC]: cold-start dependent ("Personalization for users with enough data"); index-based re-ranker requiring eng integration; no CDP, no checkout offers.
- **Rokt does differently:** decisions a monetized offer, not a search result. **Adapt:** Algolia-style low-latency vector retrieval to match offers to intent signals at checkout. **Why copying is weak:** search is a saturated, developer-led category orthogonal to Rokt's business model.
- Sources: algolia.com/doc/guides/personalization/, /products/ai-recommendations.

**Amazon Personalize (AWS)**
- **Core** [VERIFIED-PUBLIC]: "fully managed ML service…item recommendations" + segmentation, real-time API + batch. **Target:** developers. **Unique mechanism**: domain recommenders + recipes (User-Personalization, Personalized-Ranking, Similar-Items). **Data** [VERIFIED-PUBLIC]: item-interaction CSV + real-time events + schemas. **AI**: ML recipes; model updates every ~2 hrs. **Workflow**: prepare CSV, train, call private inference API. **Value**: recs without building ML infra.
- **PUBLIC limitation** [VERIFIED-PUBLIC]: headless building block — "use an AWS service or third party service to send users personalized emails"; you build delivery; no CDP identity graph, no checkout offers.
- **Rokt does differently:** Rokt is an end-to-end decisioned + monetized surface, not a headless ID-ranking API. **Adapt:** the "recipes" mental model for pluggable offer-selection objectives. **Why copying is weak:** a headless API has no distribution or demand — the opposite of Rokt's asset.
- Sources: docs.aws.amazon.com/personalize/latest/dg/what-is-personalize.html.

### 2B. Customer data & activation (CDP / reverse-ETL / engagement)

**Segment (Twilio)**
- **Core** [VERIFIED-PUBLIC]: "Collect, clean and activate your customer data in any tool," 550–700+ destinations. **Target:** data teams/devs/marketers, 25,000+ companies. **Unique mechanism**: **Unify** real-time identity resolution ("1 trillion events/month…30ms response"). **Data**: first-party events web/mobile/server. **AI** [VERIFIED-PUBLIC]: CustomerAI Predictions — but "rebuilds the model every 30 days…refreshes scores every 7 days" (**batch**). **Workflow**: Connections→Unify→Engage→destinations. **Value**: unified real-time profile + activation.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: **pipes data to destinations; does not decide/serve offers**; predictions on a 7–30 day cycle, not per-transaction; no checkout surface.
- **Direct mParticle competitor.** **Rokt does differently:** mParticle is real-time AND (via Rokt) has an owned monetized decisioning surface; Segment stops at the pipe. **Adapt:** mParticle can out-position on *real-time-at-the-moment* activation + a native destination that is Rokt's checkout. **Why copying Segment is weak:** the pure-pipe CDP is commoditized and margin-pressured; Rokt's edge is the *serving* surface Segment lacks.
- Sources: twilio.com/en-us/segment; segment.com/docs/unify/Traits/predictions/.

**Hightouch**
- **Core** [VERIFIED-PUBLIC]: Composable/warehouse-native CDP — "activates data directly from your existing cloud data warehouse…instead of ingesting a separate copy." **Target:** marketers + data teams. **Unique mechanism**: reverse-ETL, no data duplication; **Streaming Reverse ETL** for low latency. **Data**: any warehouse data (hard warehouse dependency). **AI** [VERIFIED-PUBLIC]: **AI Decisioning** using "reinforcement learning" for "1:1 experiences" — it *decides*. **Workflow**: connect warehouse→model→audiences→sync 300+ destinations. **Value** [VERIFIED-PUBLIC]: onboarded "in days or weeks."
- **PUBLIC limitation** [VERIFIED-PUBLIC]: entirely warehouse-dependent; activation *syncs to external channels* — no owned transaction surface; standard reverse-ETL is scheduled/batch.
- **Rokt does differently:** mParticle's **hybrid** model does warehouse-native AND real-time; Rokt owns the serving surface Hightouch syncs to. **Adapt:** expose Rokt checkout as a first-class Hightouch/warehouse *destination* for AI-decisioned audiences. **Why copying is weak:** a warehouse-only CDP can't act in the sub-second checkout window without the owned surface.
- Sources: hightouch.com/platform/composable-cdp, /blog/announcing-streaming-reverse-etl.

**Census (Fivetran)**
- **Core** [VERIFIED-PUBLIC]: Reverse ETL syncing warehouse data into business apps; now part of Fivetran. **Target:** data/analytics + marketing (Audience Hub). **Unique mechanism**: 200+ destinations + **Live Syncs** ("zero latency"); AI Columns (LLM enrichment). **Data**: warehouse/lake. **AI**: LLM enrichment (not decisioning). **Workflow**: warehouse→transform→sync. **Value**: managed no-code pipelines.
- **PUBLIC limitation** [VERIFIED-PUBLIC]: sync-only — does not decide or serve offers; warehouse-dependent; no checkout surface.
- **Rokt does differently:** decisions + serves + monetizes. **Adapt:** be a certified Census destination for checkout activation. **Why copying is weak:** reverse-ETL is plumbing, not a demand-side business.
- Sources: getcensus.com/reverse-etl; fivetran.com/data-movement/activations.

**RudderStack**
- **Core** [VERIFIED-PUBLIC]: Warehouse-native CDP — "Turn your data cloud into a CDP"; "we don't store your data." **Target:** data teams/devs. **Unique mechanism**: real-time Event Stream + Profiles (identity resolution in the warehouse) + reverse-ETL. **Data**: first-party events + data cloud. **AI**: markets "Agentic CDP" (unspecified model). **Workflow**: stream→profiles→reverse-ETL. **Value** [VERIFIED-PUBLIC]: case study "4x ROAS."
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: routes identity-resolved data to destinations; no offer serving, no checkout surface.
- **Rokt does differently:** owns activation surface + demand. **Adapt:** interoperate as a real-time destination. **Why copying is weak:** same as Hightouch — plumbing without a surface.
- Sources: rudderstack.com/warehouse-native-cdp/, /product/event-stream/.

**Tealium**
- **Core** [VERIFIED-PUBLIC]: "data-first Customer Data Platform" (AudienceStream), real-time audience engagement. **Target:** enterprise marketing/ops. **Unique mechanism**: **patented visitor stitching** in real-time; 1,300+ integrations; "leading independent CDP." **Data**: web/mobile/server/IoT/offline. **AI** [VERIFIED-PUBLIC]: Tealium Predict (ML high/low-value). **Workflow**: collect→profiles→badges/segments→real-time actions→activate. **Value**: real-time personalization + budget optimization.
- **PUBLIC limitation** [VERIFIED-PUBLIC]: segments/orchestrates to integrated systems but does not independently decide offers; no checkout integration.
- **Direct mParticle competitor.** **Rokt does differently:** mParticle pairs the same real-time stitching with an owned monetized checkout. **Adapt:** lead with *transaction-moment* activation as the differentiator vs. Tealium's neutral-pipe stance. **Why copying is weak:** Tealium owns "independent neutral CDP"; Rokt's wedge is *acting* at checkout, not out-integrating 1,300 connectors.
- Sources: tealium.com/products/audiencestream-cdp/.

**Adobe Real-Time CDP**
- **Core** [VERIFIED-PUBLIC]: single customer view on Adobe Experience Platform + "personalized experiences in real-time." **Target:** enterprise (B2C/B2B/B2P). **Unique mechanism**: streaming segmentation ("qualify in the moment," "up to 1500 inbound events/sec"), XDM governance. **Data**: known + anonymous enterprise sources. **AI**: Adobe AI (propensity/lookalikes). **Workflow**: ingest→profiles→segment→activate to Experience Cloud + partners. **Value**: in-the-moment cross-channel personalization.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: RTCDP builds/activates audiences; **offer decisioning is a separate SKU (Adobe Journey Optimizer / Offer Decisioning)**; batch coexists; no ecommerce checkout surface.
- **Rokt does differently:** unifies data + decisioning + monetized serving in one motion; Adobe fragments these across SKUs. **Adapt:** a single integrated "data→offer→serve at checkout" loop as the anti-Adobe simplicity story. **Why copying is weak:** competing with the Adobe suite head-on is a losing enterprise-procurement battle; Rokt should specialize the moment.
- Sources: business.adobe.com/products/real-time-customer-data-platform/rtcdp.html; experienceleague.adobe.com/…/rtcdp.

**Amplitude**
- **Core** [VERIFIED-PUBLIC]: "insights-driven CDP" — collects + analyzes events with native product analytics; activation syncs audiences. **Target:** growth PMs/marketers. **Unique mechanism**: CDP tightly coupled to Amplitude Analytics. **Data**: event/behavioral + identity. **AI**: Predictive audiences (propensity). **Workflow**: define data→resolve identity→discover audiences→activate. **Value**: analytics-to-activation loop.
- **PUBLIC limitation** [VERIFIED-PUBLIC]: segments and syncs to destinations (email/ads/product) — does not decide/serve offers itself; no checkout surface.
- **Rokt does differently:** acts at the moment vs. analyzing + syncing. **Adapt:** Amplitude-style behavioral discovery to build checkout-offer audiences inside mParticle. **Why copying is weak:** analytics is a separate discipline; no monetization surface.
- Sources: amplitude.com/activation.

**Braze**
- **Core** [VERIFIED-PUBLIC]: customer **engagement** platform — cross-channel messaging + journeys (email/SMS/RCS/push/in-app/WhatsApp), 2,600+ brands. **Target:** mid-enterprise brands. **Unique mechanism**: real-time streaming decisioning; **BrazeAI Decisioning Studio** ("17.9B Personalized AI Decisions in 2025"). **Data**: first-party from warehouse/apps/backends. **AI**: BrazeAI. **Workflow**: Canvas journeys→segmentation→orchestration→analytics. **Value** [VERIFIED-PUBLIC]: claims +25% revenue / +48% conversions.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: **decides and serves — but only within its own owned channels** (email/SMS/push/in-app/web); no ecommerce checkout surface.
- **Rokt does differently:** serves at the transaction moment with third-party demand; Braze serves brand messages in owned channels. **Adapt:** Braze-style journey decisioning applied to the checkout surface, fed by mParticle. **Why copying is weak:** messaging is a mature category and lacks Rokt's monetized network.
- Sources: braze.com/product/overview.

**Iterable**
- **Core** [VERIFIED-PUBLIC]: "AI customer engagement platform built for real-time relevance," cross-channel. **Target:** enterprise marketing. **Unique mechanism**: "data to action architecture," composable on top of warehouses/CDPs. **Data**: "activate data from any source." **AI**: **Nova Intelligence** (agentic predict/decide/optimize). **Workflow**: ingest→activate→journeys→decisioning→measure. **Value**: link engagement to revenue.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: decides/serves messages but relies on an *upstream* CDP and executes in owned marketing channels; not a checkout surface.
- **Rokt does differently:** owns both the data (mParticle) and the moment. **Adapt:** agentic decisioning patterns for offer sequencing. **Why copying is weak:** duplicate of Braze positioning; no network.
- Sources: iterable.com/product/, /product/ai/.

### 2C. Experimentation / rollout

**Optimizely**
- **Core** [VERIFIED-PUBLIC]: AI-driven experimentation — Web + Feature Experimentation, A/B/MVT/**multi-armed bandits**. **Target:** product/eng/marketing teams. **Unique mechanism**: bandits auto-shift traffic to winners; server-side, no flicker; **Opal** AI generates variations/agents. **Data**: experiment events/metrics. **AI**: Opal + bandits. **Workflow**: build variations→target→analyze→roll out/back via flags. **Value**: reach significance faster.
- **PUBLIC limitation** [INFERENCE]: an experimentation/flagging platform "for websites, mobile apps, chatbots, APIs…" — it *tests* experiences; it is not a customer-offer decisioning or CDP surface.
- **Rokt does differently:** Rokt Brain runs perpetual, revenue-objective decisioning *in production at the moment* — experimentation is a built-in means, not the product. **Adapt:** expose bandit-style, self-optimizing offer allocation as a transparent merchant-facing capability. **Why copying is weak:** building a generic experimentation product diverts from the decisioning+network moat.
- Sources: optimizely.com/products/experimentation, /platform/experimentation/.

**Statsig**
- **Core** [VERIFIED-PUBLIC]: product-development platform — flags + experiments + analytics with a transparent stats engine (CUPED, sequential, holdouts). **Target:** fast-moving product/eng teams. **Unique mechanism**: **Warehouse Native** "zero-ETL" — hosts the stats engine *inside your warehouse*. **Data**: events/metrics (or existing warehouse tables). **AI**: stats engine (not GenAI-led). **Workflow**: connect exposures/metrics→run→results in minutes. **Value**: rigorous, transparent experimentation.
- **PUBLIC limitation** [INFERENCE]: experiment/analytics infra; no offer serving, no CDP, no checkout.
- **Rokt does differently:** applies rigorous experimentation *to monetized offer decisions* it also serves. **Adapt:** warehouse-native, auditable measurement of checkout-offer incrementality (a trust/transparency wedge for enterprise partners). **Why copying is weak:** experimentation tooling is not a demand business.
- Sources: statsig.com/, docs.statsig.com/statsig-warehouse-native/introduction.

**LaunchDarkly**
- **Core** [VERIFIED-PUBLIC]: feature management — flags, **progressive rollouts**, **guarded rollouts** with automatic regression detection/rollback. **Target:** engineering. **Unique mechanism**: sequential-testing-based regression detection; auto-rollback on metric regressions. **Data**: flag exposure + metrics (error/latency/business). **AI**: statistical guardrails. **Workflow**: attach metrics→guarded rollout→auto-pause/rollback. **Value**: safe releases.
- **PUBLIC limitation** [INFERENCE]: release-risk management for software, not customer offer decisioning; no CDP, no checkout offers.
- **Rokt does differently:** operates on *offers/revenue*, not code releases. **Adapt:** "guardrail" auto-rollback logic for offer campaigns that dip conversion — a conversion-safety promise at checkout. **Why copying is weak:** dev-tooling audience is orthogonal to Rokt's advertiser/merchant customers.
- Sources: launchdarkly.com/docs/home/releases/guarded-rollouts, /progressive-rollouts.

**Eppo (now Datadog Experiments)**
- **Core** [VERIFIED-PUBLIC]: warehouse-native feature flagging + experimentation with statistical rigor; "now Datadog Experiments." **Target:** product/data/ML teams. **Unique mechanism**: processes experiment data *inside your warehouse* ("no data leaves your system," full SQL transparency). **Data**: warehouse experiment data. **AI**: stats + ML/monetization use cases. **Workflow**: SDK for flags + analytics for analysis. **Value**: single-source-of-truth experimentation, no shadow warehouses.
- **PUBLIC limitation** [INFERENCE]: analysis/flag platform; no serving surface, no CDP, no checkout.
- **Rokt does differently:** decisioning + serving + monetization, with experimentation embedded. **Adapt:** warehouse-native, transparent incrementality reporting to prove Rokt's lift to CFO-level buyers. **Why copying is weak:** now inside Datadog's observability suite — not a market to enter.
- Sources: geteppo.com/, /warehouse.

### 2D. Payments / checkout / retention

**Stripe**
- **Core** [VERIFIED-PUBLIC]: payments + Checkout (135+ currencies, Adaptive Pricing); supports subscription **upsells** and product **cross-sells** at checkout. **Target:** developers/businesses. **Unique mechanism**: conversion-optimized checkout, dynamic payment methods. **Data**: transaction/payment. **AI**: Adaptive Pricing / conversion optimization. **Workflow**: integrate Checkout/Payment Links; configure upsells/cross-sells. **Value**: higher AOV/conversion.
- **PUBLIC limitation** [VERIFIED-PUBLIC]: "Stripe does **not** offer one-click **post-purchase** upsells natively…requires a tool built on top of Stripe." Upsells are the merchant's own products; no third-party offer network.
- **Rokt does differently:** Rokt *is* the decisioned post-purchase offer layer Stripe lacks, with third-party paid demand. **Adapt:** a Rokt module that plugs into Stripe/Payment-Element to own the post-payment moment for the long tail. **Why copying is weak:** Rokt is not a PSP; competing on payments is out of lane — the opportunity is the *offer* layer atop any PSP.
- Sources: docs.stripe.com/payments/checkout/upsells, /cross-sells; support.stripe.com/questions/adaptive-pricing.

**Adyen**
- **Core** [VERIFIED-PUBLIC]: enterprise payments; **RevenueAccelerate** (ML to boost auth rates) + **RevenueProtect** (ML fraud/risk) + Uplift. **Target:** enterprise merchants. **Unique mechanism**: direct scheme connectivity → transaction-level data → real-time ML routing/retry. **Data**: network-wide transaction data. **AI**: ML for auth optimization + fraud. **Workflow**: platform optimizes each payment in real time. **Value**: higher approvals, lower fraud/chargebacks.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: optimizes the *payment* (auth/fraud/cost), not customer offers; no offer/ad surface, no CDP.
- **Rokt does differently:** monetizes shopper *attention* at the moment; Adyen monetizes payment *approval*. Complementary, not competing. **Adapt:** partner-integrate at the payment step where Adyen already has real-time presence. **Why copying is weak:** payment optimization is a scale/bank-relationship game Rokt won't win.
- Sources: adyen.com/press-and-media/adyen-launches-revenueaccelerate, /uplift/protect.

**Klarna**
- **Core** [VERIFIED-PUBLIC]: BNPL + a fast-growing **retail media network** — sponsored search in the app, affiliate carousels, programmatic brand ads; Ads Manager (self-serve). **Target:** consumers (150M) + advertiser brands. **Unique mechanism**: monetizes "actual transaction data at the moment of purchase"; PubMatic partnership for programmatic scale. **Data**: first-party transaction + intent. **AI**: audience targeting/measurement. **Workflow**: brands buy sponsored placements/ads via Ads Manager. **Value**: ad business ~$180M in 2024 (~6% of revenue).
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: ads live inside **Klarna's own app/search feed**, at Klarna-mediated moments — not injected into the *merchant's* own checkout confirmation. It is a walled shopping destination, not an embeddable checkout-moment layer for any merchant.
- **Rokt does differently:** Rokt operates *inside the merchant's* checkout across 30,000+ brands, returning value to the partner; Klarna keeps shoppers in its app. **Adapt:** Klarna proves transaction-moment first-party data commands premium ad pricing — validates Rokt's thesis; Rokt's edge is *distribution across merchants' own surfaces*. **Why copying is weak:** building a consumer BNPL app + destination is a different, capital-heavy business; Rokt's asset is the embedded merchant network.
- Sources: klarna.com/us/business/marketing-solutions/ads-sponsored-content/; klarna.com/international/press/…creator-shops-and-ads-manager/.

**Afterpay (Cash App Afterpay)**
- **Core** [VERIFIED-PUBLIC]: BNPL + **Afterpay Ads** (sponsored listings/deals/collections, pay-for-performance) + Shop Directory (~1M referrals/day) + affiliate program; now "Cash App Afterpay" (50M+ monthly actives). **Target:** consumers + advertiser merchants. **Unique mechanism**: personalized shopping feed off first-party purchase data. **Data**: transaction/first-party. **AI**: personalized feed. **Workflow**: merchants buy sponsored placements. **Value**: incremental acquisition/referrals.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: discovery/ads live in **Afterpay's app/directory**, not the merchant's own checkout confirmation; a destination network, not an embeddable checkout-moment layer.
- **Rokt does differently:** embedded in the merchant's checkout vs. Afterpay's own app. **Adapt:** same as Klarna — validates demand for BNPL-adjacent, transaction-data-driven ads; Rokt's wedge is on-merchant placement. **Why copying is weak:** requires owning a BNPL + consumer app.
- Sources: afterpay.com/en-US/for-retailers/access/news/introducing-afterpay-ads; developers.afterpay.com/…/shop-directory.

**Rebuy** *(closest analog — read carefully)*
- **Core** [VERIFIED-PUBLIC]: AI personalization for Shopify — Smart Cart, cross-sell/upsell, and **post-purchase one-click offers** on Thank-You/Order-Status pages (payment on file, add in one click; up to 40 flows). **Target:** Shopify DTC merchants. **Unique mechanism**: real-time behavior + rules engine; **Rebuy Monetize (powered by Fluent)** — a *third-party post-purchase ad network* placed on the confirmation page. **Data**: shopper behavior + catalog; for Monetize, **Fluent's identity graph (200M+ first-party profiles)**. **AI**: recommendation ML + Fluent's ML. **Workflow**: install app, configure Smart Cart + post-purchase flows; opt into Monetize. **Value** [VERIFIED-PUBLIC]: Monetize pays merchants "$0.35+ in pure incremental profit per order"; "700%+ growth in active merchant adoption," "1M+ ad unit sessions in September."
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: **Shopify-bound**; the merchant-catalog upsell is the merchant's own products; and the *third-party paid demand is Fluent's network, not Rebuy's own* — Rebuy is the placement layer, dependent on a single external demand partner. No independent real-time CDP.
- **Rokt does differently:** Rokt owns its *own* premium two-sided advertiser network (4,600+ brands) + proprietary Rokt Brain trained on 6B+ transactions + mParticle real-time CDP, and spans the whole Transaction Moment (Selection→Confirmation), not just the Thank-You page — and is platform-agnostic (not Shopify-locked). Data governance: partner owns 100% of data.
- **Adapt:** the enterprise/mid-market answer to Rebuy Monetize — a checkout-moment offer network with *owned* demand, deeper AI, first-party CDP targeting, and multi-platform reach; and a merchant-facing self-serve controls layer (Rebuy's UX strength) so smaller merchants can adopt Rokt's network without heavy integration.
- **Why copying is weak:** simply cloning Rebuy's post-purchase widget without an owned demand network reduces Rokt to a placement tool dependent on others' ads (Rebuy's own dependency on Fluent). Rokt's moat is *being the demand network + the brain + the data*, not the widget.
- Sources: rebuyengine.com/product/post-purchase, /product/monetize; help.rebuyengine.com/en/articles/11204799; fluentco.com/newsroom/rebuy-monetize-powered-by-fluent; globenewswire.com (Fluent×Rebuy, 2025-05-08).

**Recharge**
- **Core** [VERIFIED-PUBLIC]: subscription management for Shopify — billing, scheduling, swaps, dunning, self-service; **churn prevention**. **Target:** subscription DTC brands. **Unique mechanism**: AI cancellation-prevention flows (surface discounts/skips/swaps at cancel) + churn-risk scoring; AI-timed payment retries across 20,000+ merchants / 1.3M daily orders. **Data**: subscriber + billing behavior. **AI**: churn-risk scoring, retry timing. **Workflow**: sits between storefront and fulfillment via Shopify Subscription APIs. **Value** [VERIFIED-PUBLIC]: "up to a 44% decrease in active churn."
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: subscription lifecycle; offers are the merchant's own retention incentives; no third-party offer network, no checkout-moment ad decisioning.
- **Rokt does differently:** Rokt monetizes the moment with external demand across one-time and subscription checkouts. **Adapt:** a "moment of cancellation / renewal" offer surface — apply Rokt decisioning to subscription save/renewal moments (an adjacent transaction moment). **Why copying is weak:** subscription plumbing is a deep, Shopify-specific product category.
- Sources: getrecharge.com/subscriptions/churn-prevention/.

**Loop Returns**
- **Core** [VERIFIED-PUBLIC]: returns/exchanges platform "built for retention" — steers refunds into exchanges/store credit (Instant Exchange, Shop Now), + **Checkout+** upsell (returns coverage) at checkout. **Target:** Shopify DTC brands. **Unique mechanism**: exchange-first flows + automated return workflows. **Data**: returns/order data. **AI**: rules/automation. **Workflow**: customer initiates return→steered to exchange/credit. **Value** [VERIFIED-PUBLIC]: merchants "retain around 50% of revenue from returns."
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: post-purchase *returns* surface; retains revenue via exchanges, not via a third-party offer network; Shopify-centric.
- **Rokt does differently:** monetizes attention with external demand; Loop retains internal revenue. **Adapt:** the *return/exchange confirmation* is another high-attention transaction moment Rokt could decision offers into. **Why copying is weak:** returns logistics is an operational product far from Rokt's competency.
- Sources: loopreturns.com/; help.loopreturns.com/en/articles/7907905 (Checkout+/upsell).

**Black Crow AI**
- **Core** [VERIFIED-PUBLIC]: full-funnel **predictive AI** for ecommerce (Shopify app) — real-time value/intent prediction. **Target:** DTC/ecommerce brands. **Unique mechanism**: ML interpreting "450+ signals across sessions," "custom predictions…before every page load," adds a "persistent identifier for every user in real-time." **Data**: first-party commerce + behavioral. **AI**: patented real-time value prediction. **Workflow**: predictions feed ads/site/email optimization. **Value** [VERIFIED-PUBLIC]: "increase revenue by 20%"; live on "100+ DTC sites."
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: a prediction/identity layer that *feeds other systems* (ads, storefront, messaging) — no owned offer network, no checkout-moment serving surface.
- **Rokt does differently:** Rokt both predicts (Rokt Brain) *and* serves the monetized decision at checkout; Black Crow predicts and hands off. **Adapt:** pre-page-load, first-party propensity scoring (à la Black Crow) inside mParticle to prime checkout-offer relevance. **Why copying is weak:** a prediction API without demand or a surface is a thin, integration-dependent business.
- Sources: blackcrow.ai/.

**Wunderkind**
- **Core** [VERIFIED-PUBLIC]: "Autonomous Marketing Platform" — proprietary **Identity Network** + agentic decisioning → triggered email/text/social/ads. **Target:** ecommerce brands. **Unique mechanism**: identity graph recognizing "9B consumer devices, 1B opted-in profiles, 2T events/yr"; identifies "up to 50% more site traffic"; deterministic+probabilistic, no third-party cookies. **Data**: identity graph + behavioral. **AI**: agentic decisioning. **Workflow**: recognize anonymous visitor→trigger best message. **Value**: convert anonymous traffic to revenue.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: serves *owned/triggered channels* (email/text/ads), not the checkout confirmation; identity-to-message, not a paid offer network at the transaction moment.
- **Rokt does differently:** Rokt monetizes the checkout with external demand; Wunderkind recovers the merchant's own conversions via messaging. **Adapt:** identity-resolution to recognize high-value shoppers at checkout for better offer targeting (mParticle already does identity). **Why copying is weak:** triggered-messaging + identity is a crowded space; no monetized surface.
- Sources: wunderkind.co/how-it-works/performance-marketing-solutions-for-ecommerce/.

**Attentive**
- **Core** [VERIFIED-PUBLIC]: AI-powered SMS + email marketing. **Target:** ecommerce/retail brands. **Unique mechanism**: **Identity AI** (recognizes more visitors, first-party capture), **Audiences AI** (dynamic high-intent audience adjustment), AI Journeys; trained on "1.4 trillion datapoints." **Data**: subscriber + behavior + product. **AI**: identity + audience + message personalization. **Workflow**: capture→identify→trigger 1:1 messages. **Value**: 43% more visitors identified (case study).
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: a *messaging channel* (SMS/email); not checkout-moment decisioning; no third-party offer network.
- **Rokt does differently:** decisions monetized offers at the moment; Attentive nurtures via SMS. **Adapt:** identity/audience-AI patterns to enrich checkout targeting. **Why copying is weak:** SMS marketing is saturated and channel-specific.
- Sources: attentive.com/ai-marketing-campaign-automation.

**Klaviyo**
- **Core** [VERIFIED-PUBLIC]: "autonomous **B2C CRM** and AI marketing platform" — unifies data + automates email/SMS/RCS/WhatsApp/push; **Klaviyo Data Platform (KDP)** unifies data in real time. **Target:** DTC/B2C brands. **Unique mechanism**: system-of-record + system-of-action + AI agents; real-time data layer feeding owned channels. **Data**: behavioral/transactional/engagement, real-time sync. **AI**: predictive (next purchase, pLTV, churn) + AI agents. **Workflow**: unify→segment→trigger campaigns→learn. **Value**: revenue-generating personalized campaigns.
- **PUBLIC limitation** [VERIFIED-PUBLIC/INFERENCE]: a data + owned-channel marketing platform; not a checkout-moment offer-decisioning surface; no third-party paid demand network.
- **Rokt does differently:** Rokt+mParticle brings the same real-time first-party data to a *monetized checkout surface*; Klaviyo activates owned email/SMS. **Adapt:** interoperate — let Klaviyo audiences target Rokt offers; lead where Klaviyo can't (the transaction moment). **Why copying is weak:** Klaviyo dominates B2C CRM/email; entering is a head-on suite fight with no monetization edge.
- Sources: klaviyo.com/platform, /platform/crm-with-ai.

---

## 3. White-space synthesis — where no single competitor plays

**Framing:** The scan resolves into three "ingredients." Almost every platform has one; a few have two; **only Rokt+mParticle plausibly holds all three**:
1. **Checkout/transaction-moment serving surface** (owned, embedded in the merchant's flow).
2. **Real-time first-party CDP** (unify + activate in the moment; ideally hybrid warehouse-native + streaming).
3. **Two-sided paid demand** (an *owned* third-party advertiser/offer network that turns the surface into a profit center).

| Player type | Has surface? | Has 1P CDP? | Has owned demand? |
|---|---|---|---|
| Commerce personalizers (DY, Bloomreach, Constructor, Nosto, Algolia, A.Personalize) | onsite only | partial (Bloomreach) | No |
| CDPs (Segment, Tealium, Adobe, Amplitude, Hightouch, Census, RudderStack) | No | **Yes** | No |
| Engagement (Braze, Iterable, Klaviyo, Attentive) | owned channels only | Yes (Klaviyo/Attentive 1P) | No |
| Experimentation (Optimizely, Statsig, LaunchDarkly, Eppo) | No | No | No |
| Payments (Stripe, Adyen) | checkout (payment only) | No | No |
| BNPL retail media (Klarna, Afterpay) | *their own app* | Yes (txn data) | **Yes** |
| Post-purchase upsell (Rebuy, Recharge, Loop) | **checkout (Rebuy)** | thin | **Yes but rented (Rebuy←Fluent)** |
| **Rokt + mParticle** | **Yes (embedded)** | **Yes (hybrid)** | **Yes (owned network)** |

**The adjacent white-space themes (all [INFERENCE] unless marked):**

1. **[INFERENCE] The "embedded, owned-demand, data-aware" triad is essentially uncontested.** The two players who monetize transaction-moment attention with *third-party* demand — Klarna and Afterpay — do it inside **their own app/destination**, not the merchant's checkout. The one player embedded in the merchant's checkout with third-party demand — **Rebuy Monetize** — **rents** its demand from Fluent and is Shopify-locked with only a thin data layer. Nobody combines *embedded-in-merchant-checkout* + *owned demand network* + *real-time first-party CDP*. That intersection is Rokt's to defend and widen.

2. **[HYPOTHESIS] "Decisioning-as-a-destination" for the CDP ecosystem.** Every CDP (Segment, Tealium, Adobe, Amplitude) and every warehouse-native tool (Hightouch, RudderStack, Census, Eppo) *ends at the pipe* — they sync audiences to someone else's channel and cannot act in the sub-second checkout window. A distinctly Rokt-native capability: position the **Rokt checkout surface as a first-class, real-time activation destination** that any CDP/warehouse can target — the one destination that both *decides and monetizes*. mParticle's hybrid (real-time + warehouse-native) architecture is the natural bridge; no competitor pairs a hybrid CDP with an owned serving+monetization surface.

3. **[HYPOTHESIS] Multi-moment expansion beyond the Thank-You page.** Adjacent high-attention "transaction moments" are each owned today by a narrow point tool that only retains *internal* revenue: subscription **cancellation/renewal** (Recharge), **returns/exchange** confirmation (Loop), **payment retry/decline** recovery (Adyen). None decision *third-party* offers into these moments. Rokt could extend its decisioning + owned demand into these adjacent moments — a portfolio of monetized micro-moments no competitor spans because each rival owns only one moment and lacks a demand network.

4. **[INFERENCE] Predict-and-serve, not predict-and-hand-off.** Predictive/identity players (Black Crow, Wunderkind, Attentive Identity AI, Segment/Amplitude predictions) generate scores and hand them to downstream channels; several are explicitly batch (Segment refreshes every 7–30 days). Rokt uniquely *predicts and serves the monetized decision in the same real-time motion*. White space: expose **pre-page-load, first-party propensity at the checkout moment** as a productized capability (mParticle real-time + Rokt Brain), which the hand-off players structurally cannot match.

5. **[INFERENCE] Trust/governance + incrementality as an enterprise wedge.** Warehouse-native experimentation (Statsig, Eppo) has normalized "no data leaves your warehouse" transparency; Rokt already promises partners "100% data ownership" and "$7 of every $8" returned. Combining *auditable, warehouse-native incrementality measurement* with a monetized surface is a position neither the CDPs (no surface) nor the ad networks (weaker governance story) can claim — a differentiated pitch to enterprise CFOs.

**Net:** The defensible white space is not any single feature above — it is the **integration**: an *embedded* checkout-moment decisioning surface, powered by a *hybrid real-time first-party CDP*, monetized by an *owned* premium demand network, with *warehouse-grade transparency*. Cloning any one competitor (a personalizer, a CDP, an experimentation tool, a Rebuy widget) would surrender exactly the integration that no competitor can assemble.

---

## 4. Sources (primary; retrieval date 2026-07-18)

**Rokt / mParticle (yardstick):**
- rokt.com — /blog/what-is-the-transaction-moment-tm; /blog/what-features-differentiate-rokt-from-other-ecommerce-monetization-tools; /solutions/use-case/monetization; /products/rokt-mparticle; /rokt-mparticle/platform
- mparticle.com/news/rokt-and-mparticle-merge/; prnewswire.com (Rokt–mParticle merge, 2025)

**Commerce personalization/search:**
- dynamicyield.com/ai/, /recommendations/, /enterprise-grade-personalization/
- bloomreach.com/en; documentation.bloomreach.com/discovery/docs
- constructor.com/how-it-works/collaborative-personalization/, /solutions/search
- nosto.com/commerce-experience-platform/ (+ /product-recommendations/, /personalized-search/)
- algolia.com/doc/guides/personalization/, /products/ai-recommendations, /products/features/personalization
- docs.aws.amazon.com/personalize/latest/dg/what-is-personalize.html; aws.amazon.com/personalize/

**CDP / activation / engagement:**
- twilio.com/en-us/segment; twilio.com/en-us/products/unify; segment.com/docs/unify/Traits/predictions/
- hightouch.com/platform/composable-cdp, /platform/reverse-etl, /blog/announcing-streaming-reverse-etl
- getcensus.com/reverse-etl; fivetran.com/data-movement/activations
- rudderstack.com/warehouse-native-cdp/, /product/event-stream/, /product/data-cloud-cdp/
- tealium.com/products/audiencestream-cdp/, /audiencestream-features/
- business.adobe.com/products/real-time-customer-data-platform/rtcdp.html; experienceleague.adobe.com/en/docs/experience-platform/rtcdp
- amplitude.com/activation; amplitude.com/blog/amplitude-customer-data-platform
- braze.com/product/overview, /product
- iterable.com/product/, /product/ai/

**Experimentation / rollout:**
- optimizely.com/products/experimentation, /platform/experimentation/; docs.developers.optimizely.com/feature-experimentation
- statsig.com/; docs.statsig.com/statsig-warehouse-native/introduction, /understanding-platform
- launchdarkly.com/docs/home/releases/guarded-rollouts, /progressive-rollouts
- geteppo.com/, /warehouse, /feature-flagging; docs.geteppo.com/

**Payments / checkout / retention:**
- docs.stripe.com/payments/checkout/upsells, /cross-sells; support.stripe.com/questions/adaptive-pricing; stripe.com/payments/checkout
- adyen.com/press-and-media/adyen-launches-revenueaccelerate; adyen.com/uplift/optimize, /uplift/protect
- klarna.com/us/business/marketing-solutions/ads-sponsored-content/; klarna.com/international/press/…creator-shops-and-ads-manager/
- afterpay.com/en-US/for-retailers/access/news/introducing-afterpay-ads; developers.afterpay.com/afterpay-online-developer/guides/marketing/shop-directory
- rebuyengine.com/product/post-purchase, /product/smart-cart, /product/monetize; help.rebuyengine.com/en/articles/11204799; fluentco.com/newsroom/rebuy-monetize-powered-by-fluent; globenewswire.com (Fluent–Rebuy partnership, 2025-05-08)
- getrecharge.com/subscriptions/churn-prevention/; apps.shopify.com/subscription-payments
- loopreturns.com/; help.loopreturns.com/en/articles/7907905
- blackcrow.ai/
- wunderkind.co/how-it-works/performance-marketing-solutions-for-ecommerce/
- attentive.com/, /ai-marketing-campaign-automation
- klaviyo.com/platform, /platform/crm-with-ai, /solutions/ai

---

## 5. Freshness & Confidence

- **Retrieval date:** 2026-07-18. All capability claims are from the companies' own domains/docs/newsrooms as of this date.
- **Freshness caveat:** Most vendor product/marketing pages do **not** expose a publication date; where a date was visible (e.g., Fluent×Rebuy press, 2025-05-08; Rokt–mParticle merger, Jan 2025) it is cited. Treat undated marketing claims as "current as of retrieval," not versioned.
- **Confidence by claim type:**
  - **High:** Direct capability/positioning quotes labeled [VERIFIED-PUBLIC] (pulled verbatim/near-verbatim from official pages).
  - **Medium:** [INFERENCE] gap claims (e.g., "no checkout-moment offer decisioning"). These rest on *absence of a stated capability* across official pages plus the vendor's stated data model/channels — reasoned, not proven. A vendor could ship an unannounced capability; RFP-level diligence would be needed for hard confirmation.
  - **Flagged/low:** [HYPOTHESIS] white-space theses (Section 3, items 2 & 3) are strategic hypotheses for the team to test, not established facts.
- **Coverage:** 29 competitors profiled across 4 categories (exceeds the 15–20 target). No paid/analyst sources used; no NDA/inside data. No fabrication — any field the primary source did not substantiate is either omitted or labeled [INFERENCE].
- **Known gaps:** Adobe's product page timed out once (facts taken from Adobe Experience League docs + official-page search snippet); RudderStack's specific AI model is undisclosed (marked [INFERENCE]); exact real-time-vs-batch latencies for Amplitude/Klaviyo activation are not detailed on public pages.
