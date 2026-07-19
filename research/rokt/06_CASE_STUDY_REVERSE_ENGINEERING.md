# 06 — Case-Study Reverse Engineering (Rokt + mParticle)

**Agent 6 — Case-Study Reverse Engineer**
**Retrieval date:** 2026-07-18
**Scope:** Public Rokt (rokt.com) and mParticle (mparticle.com / Rokt mParticle) customer case studies.

**Evidence labels used throughout:**
- `[VERIFIED-PUBLIC]` — stated explicitly on a primary public Rokt/mParticle page (or press release), quoted verbatim.
- `[INFERENCE]` — a reasonable read of what the case study implies but does not state outright.
- `[HYPOTHESIS]` — a forward-looking product/opportunity idea; not claimed by the source.

> **Method note / integrity guardrail:** Per instructions, I do **not** infer a product gap merely because a case study omits a detail. "Remaining pain" columns below list only pains that are (a) explicitly acknowledged in the source, or (b) structurally unavoidable given the described intervention. Where a case study is silent, the cell says "not addressed in source (no gap inferred)."

---

## Coverage summary

| # | Case study | Public? | Product line | Headline metric |
|---|-----------|---------|--------------|-----------------|
| 1 | Klarna | Yes | Rokt Thanks (monetization) | 111% YoY post-transaction ad-revenue growth |
| 2 | Afterpay (Block) | Yes | Rokt Thanks + Pay+ | 32% YoY revenue growth |
| 3 | Booking.com | Yes | Rokt Ads (acquisition) | 15% above-target ROAS |
| 4 | ClassPass | Yes | Rokt Ads | 12% CVR lift at flat CPA |
| 5 | Wine.com | Yes | Rokt Ads | 5.8x ROAS; +42% AOV |
| 6 | Flamingo | Yes | Rokt Ads | −60% CPA; +350% weekly conversions |
| 7 | Tails.com | Yes | Rokt Ads | +153% conversion uplift |
| 8 | Cozy Earth | Yes | Ads + Thanks + Aftersell | 3.4x attributed revenue vs. rivals |
| 9 | Backcountry | Yes | Rokt Thanks | $0.25–$0.35 incremental rev/transaction |
| 10 | ANINE BING | Yes | Rokt Catalog for Brands | $2.7M GMV; +568% May→Oct |
| 11 | Tatcha | Yes | Rokt mParticle (predictive) | 8.5x revenue vs. standard audience |
| 12 | onX | Yes | mParticle Cortex (Predictive Audiences) | 44% upsell-conversion lift |
| 13 | Marks & Spencer | Yes | Rokt mParticle (CDP) | £6.5M incremental yearly revenue |
| 14 | Joe & The Juice | Yes | Rokt mParticle (segmentation) | 75% YoY loyalty-revenue growth |
| 15 | Burger King | Yes | Rokt mParticle (CDP hub) | 6M app downloads (Whopper Detour) |
| 16 | Venmo | Yes | Rokt mParticle (data collection) | 130M+ events/day; +30% engagement |
| 17 | SoFi | Yes | Rokt mParticle (IDSync + feeds) | +30% data consistency; killed 30% data loss |
| 18 | Lulo Bank | Yes | Rokt mParticle (Analytics + Audiences) | −15% onboarding drop-off; −95% audience build time |
| 19 | HBO Max | Yes | Rokt mParticle (Audience Builder) | 1,000+ eng. hours saved; 7+ tools; 5+ regions |
| — | Cinemark | Yes (light) | Rokt Thanks + Ads | Qualitative only (new revenue stream, since 2022) |
| — | Ticketmaster | Named client; **no formal metric'd case study found** on rokt.com | Full suite (upsells) | n/a — see notes |
| — | Fandango | Blog only, no metrics | Rokt Ads (payment/confirmation) | n/a |
| — | JCPenney | Demo page only, no case study | Transaction Moment | n/a |
| — | HP | **No Rokt/mParticle case study found** | n/a | n/a |
| — | SHEIN Marketplace | Named only as a Canal/Rokt Catalog network retailer; no standalone case study | Rokt Catalog network | n/a |

---

## Section A — Monetization (post-transaction "Rokt Thanks / Pay+ / Aftersell")

### 1. Klarna `[VERIFIED-PUBLIC]`
- **Business problem:** Create meaningful post-checkout engagement across 14 international markets under varying regulatory/consent regimes, beyond transactional payments.
- **User/operator:** David Sykes, Chief Commercial Officer, Klarna.
- **Capability:** Rokt Thanks (AI/ML post-transaction offer engine).
- **Data inputs:** Customer preferences, transaction data, per-country compliance/consent rules.
- **Intervention:** Personalized post-checkout offers with country-specific offer/consent/data rules.
- **Outcome:** 168M transactions powered; **111% YoY** post-transaction ad-revenue growth; **5.2% US CTR** (34% above Rokt Network avg).
- **Quote:** "The power of the Rokt partnership is the ability to make every one of those transactions for every one of those consumers more personalized, more relevant, more meaningful." — David Sykes, CCO, Klarna.
- **Remaining pain (acknowledged/structural):** Multi-market consent/compliance is a recurring operational tax `[INFERENCE]`.
- **Adjacent product `[HYPOTHESIS]`:** A packaged "post-transaction compliance/consent orchestration" layer (per-geo offer + consent rulebook) sold as a standalone module to BNPL/fintech at scale.

### 2. Afterpay (Block) `[VERIFIED-PUBLIC]`
- **Problem:** Extend the post-transaction experience to drive incremental revenue *without eroding customer trust*.
- **User/operator:** Juliana Blazuk (Head of Ads Partnerships, Block); Ankit Dutta (Data Science Lead, Commerce, Block).
- **Capability:** Rokt Thanks + Rokt Pay+ (offer at payment-method selection).
- **Data inputs:** ML shopper-intent alignment; continuous A/B testing; support/CSAT signals.
- **Outcome:** **32% YoY** revenue growth; **4.6%** positive engagement vs. 3.8% network avg; no negative CSAT/support impact.
- **Quote:** "Customer-first thinking and business growth aren't just compatible—they're inseparable." — Juliana Blazuk, Block.
- **Remaining pain:** Trust/CSAT guardrail must be continuously monitored `[INFERENCE]`.
- **Adjacent product `[HYPOTHESIS]`:** "Trust-guardrail analytics" — a CSAT/brand-safety monitoring dashboard that gates offer aggressiveness in real time.

### 8. Cozy Earth `[VERIFIED-PUBLIC]`
- **Problem:** Running 10–20 performance channels; couldn't tell which drove *net-new* revenue vs. attribution overlap/inflation.
- **User/operator:** Emilie Nielson, Digital Media Buyer, Cozy Earth.
- **Capability:** Rokt Ads + Rokt Thanks + Rokt Aftersell (all three).
- **Data inputs:** Geo-lift incrementality tests (DMA exclusion) run by agency Haus across full paid mix; high-LTV lookalikes.
- **Outcome:** **3.4x** more attributed revenue than competing post-purchase channels; **~100%** higher ROAS at peak; **5.48%** Aftersell CVR; **$0.33** rev/transaction; **~$30K/mo** upsell revenue from a single product.
- **Quote:** "Rokt has been the best post-purchase channel we've tested so far…fully supports how we measure performance." — Emilie Nielson.
- **Remaining pain (acknowledged):** Incrementality/attribution ambiguity across a crowded channel mix — the *reason* they adopted geo-lift.
- **Adjacent product `[HYPOTHESIS]`:** A native **incrementality-measurement product** (geo-lift-as-a-service) baked into Rokt so advertisers don't need a third party like Haus. Strong recurring theme (see cross-cutting).

### 9. Backcountry `[VERIFIED-PUBLIC]`
- **Problem:** Profitable checkout revenue without compromising brand safety; prior competitors lacked advertiser diversity/relevance/merchant control.
- **User/operator:** John St. Juliana, SVP Marketing, Backcountry.
- **Capability:** Rokt Thanks (piloted on Steep & Cheap, scaled to Motosport, Competitive Cyclist, Level 9 Sports, Backcountry); exploring Pay+ and Catalog.
- **Outcome:** **$0.25–$0.35** incremental revenue/transaction; monetized previously untapped confirmation pages.
- **Quote:** "It's pure profit. Especially on the order receipt page—these were pages we just hadn't been able to monetize before." — John St. Juliana.
- **Remaining pain:** Merchant wants curation/control over offers — satisfied here `[VERIFIED-PUBLIC]`.
- **Adjacent product `[HYPOTHESIS]`:** Self-serve "offer curation console" for multi-brand portfolios (approve/block advertisers per sub-brand).

### — Cinemark `[VERIFIED-PUBLIC, light]`
- New revenue stream via Rokt Thanks (1st + 3rd-party offers post-purchase) since 2022; also a customer-acquisition channel for its Movie Club. Qualitative only; no hard metric published.

---

## Section B — Acquisition ("Rokt Ads")

### 3. Booking.com `[VERIFIED-PUBLIC]`
- **Problem:** New acquisition channels to directly drive bookings beyond existing methods.
- **Capability:** Rokt Ads (confirmation-page placements on complementary ecommerce sites, e.g., event-ticket buyers).
- **Data inputs:** Verified audience data (travel-ready), multiple offer formats for testing.
- **Outcome:** **15%** above-target ROAS; **150%** CTR increase via offer testing; live in **14** markets.
- **Remaining pain:** Not addressed in source (no gap inferred).
- **Adjacent product `[HYPOTHESIS]`:** Cross-category "intent bridge" targeting (e.g., ticket-buyer → travel) productized as prebuilt audience bundles.

### 4. ClassPass `[VERIFIED-PUBLIC]`
- **Problem:** Grow new-member acquisition efficiency without raising CPA.
- **User/operator:** Stefano Ziller, Sr. Director Growth Marketing, ClassPass.
- **Capability:** Rokt Ads + experimentation tooling (landing-page / checkout-flow A/B tests).
- **Outcome:** **12%** CVR lift at flat CPA; faster checkout.
- **Quote:** "Simplifying our post-click experience delivered immediate gains. We saw higher conversion without increasing acquisition costs." — Stefano Ziller.
- **Adjacent product `[HYPOTHESIS]`:** A hosted **post-click landing-page/checkout optimizer** (CRO-as-a-service) for advertisers, distinct from the ad buy.

### 5. Wine.com `[VERIFIED-PUBLIC]`
- **Problem:** Increase retention + profitability while scaling acquisition; reach lapsed customers unreachable via email.
- **Capability:** Rokt Ads (native/viewable ads on premium confirmation pages).
- **Data inputs:** Custom lapsed-customer audience lists; segment-specific messaging; landing-page experiments.
- **Outcome:** **5.8x** ROAS; **+42%** AOV vs. other channels.
- **Quote:** "Wine.com is excited to diversify their acquisition strategy and discover new, incremental audiences through Rokt Ads." (unattributed).
- **Adjacent product `[HYPOTHESIS]`:** "Win-back/lapsed-customer reactivation" as a named audience product using advertiser-supplied CRM lists.

### 6. Flamingo `[VERIFIED-PUBLIC]`
- **Problem:** Declining efficiency on mainstream channels; needed cheaper conversion-ready reach.
- **Capability:** Rokt Ads (confirmation-page native ads + ML audience optimization).
- **Outcome:** **−60%** CPA vs. benchmark; **+80%** CVR; **+350%** weekly conversions.
- **Adjacent product `[HYPOTHESIS]`:** Automated audience-discovery ("find high-converting segments I hadn't considered") surfaced as an explicit recommendation feature.

### 7. Tails.com `[VERIFIED-PUBLIC]`
- **Problem:** Stagnating demand + rising media costs + channel fatigue in saturated pet-food/subscription category.
- **Capability:** Rokt Ads (Transaction Moment targeting + iterative offer refinement).
- **Outcome:** **+153%** conversion uplift after offer refinement; **+3pp** first→second box retention; higher LTV:CAC vs. other partners.
- **Remaining pain (acknowledged):** Subscription retention (box-to-box churn) — partially improved.
- **Adjacent product `[HYPOTHESIS]`:** Subscription-specific "second-order retention" offers (post-first-box nudge) as a productized flow for DTC subscription brands.

---

## Section C — Marketplace / Distribution ("Rokt Catalog for Brands", ex-Canal)

### 10. ANINE BING `[VERIFIED-PUBLIC]`
- **Problem:** Expand into premium marketplaces as a 3rd-party assortment *without* operational overhead of individual retailer partnerships; keep product/pricing/inventory accurate.
- **User/operator:** Meaghan Ramientos, Director of eCommerce Marketplaces, ANINE BING.
- **Capability:** Rokt Catalog for Brands (AI product-data enrichment across Rokt Network placements).
- **Data inputs:** Product descriptions, pricing, inventory availability.
- **Outcome:** **$2.7M** GMV since May 2025 launch; **+568%** GMV May→Oct; **37%** avg MoM GMV growth.
- **Quote:** "Rokt Catalog opened access to premium demand in commerce moments…without needing to manage multiple one-off partnerships." — Meaghan Ramientos.
- **Context:** Rokt acquired Canal (July 2025) to launch Rokt Catalog; Canal network cited as ~1,900 retailers/DTC brands incl. Macy's, **SHEIN**, True Classic, Jonathan Adler.
- **Adjacent product `[HYPOTHESIS]`:** A **brand-side marketplace-ops suite** (feed health, pricing/inventory sync, discoverability analytics) — the natural companion to Catalog distribution.

### — SHEIN Marketplace
- Only referenced as a retailer *in* the Canal/Rokt Catalog network — no standalone metric'd case study found. Do not treat as a published SHEIN case study.

---

## Section D — Rokt mParticle (CDP / data / AI)

### 11. Tatcha `[VERIFIED-PUBLIC]`
- **Problem:** Scale personalized experiences without building AI/ML in-house.
- **User/operator:** Jacqueline Supman (Dir. Product Mgmt); Shannon Jörgenfelt (Sr. Email & Retention Mgr), Tatcha.
- **Capability:** Rokt mParticle predictive insights / propensity scoring.
- **Data inputs:** Unified behavior data; propensity to complete "Ritual Finder" quiz; vs. Standard Audience (engaged, 90-day active).
- **Intervention:** Targeted email to high-propensity segment (≥90% completion likelihood) rather than broad engaged base.
- **Outcome:** **8.5x** revenue vs. standard audience; **3x** CTR; **5x** CVR; **60%** of campaign revenue from a segment 1/6 the size.
- **Quote:** "…seeing the predictive audience outperform our most engaged cohort—and exceed industry benchmarks…was incredible." — Shannon Jörgenfelt.
- **Adjacent product `[HYPOTHESIS]`:** Packaged "quiz/zero-party-data → propensity model" template for beauty/retail (productized Ritual-Finder pattern).

### 12. onX `[VERIFIED-PUBLIC]`
- **Problem:** Raise LTV:CAC and ASP by driving membership-tier upgrades without fatigue/uninstalls.
- **User/operator:** Toni Kljucevic (Lifecycle Mktg Mgr); Brad Williams (Sr. Mktg Ops Mgr), onX.
- **Capability:** mParticle Predictive Audiences on Cortex AI engine.
- **Data inputs:** Historical purchase, trial, upgrade-decision data → per-user upgrade likelihood.
- **Intervention:** Target 95th-percentile+ upgrade-likelihood users; automated, self-adjusting; tested vs. heuristic control.
- **Outcome:** **44%** upsell-conversion lift vs. control; statistically significant within a month; no rise in cancellations/uninstalls.
- **Quote:** "We saw a 44% lift in upsell conversions after using predictive attributes to deliver upgrade offers." — Toni Kljucevic.
- **Adjacent product `[HYPOTHESIS]`:** "Upgrade-propensity" as a pre-trained vertical model for subscription/freemium apps.

### 13. Marks & Spencer `[VERIFIED-PUBLIC]`
- **Problem:** Fragmented data across tools blocked unified journeys and real-time personalization.
- **User/operator:** Alex Williams, Head of Online Trading & Growth, M&S.
- **Capability:** Rokt mParticle CDP (real-time unification, identity resolution, multi-channel activation).
- **Data inputs:** App + web + in-store POS kiosk + 3rd-party vendor data + Sparks loyalty.
- **Outcome:** **£6.5M** incremental yearly revenue; **17%** incremental CRM revenue growth (Free Basket Award campaign the main driver).
- **Quote:** "Our marketing team is being empowered to do and think differently. Rokt mParticle allows our teams to access real-time data and run tests across channels more easily." — Alex Williams.
- **Adjacent product `[HYPOTHESIS]`:** Online↔in-store (omnichannel) identity-stitching module for large retailers with physical footprints.

### 14. Joe & The Juice `[VERIFIED-PUBLIC]`
- **Problem:** Grow loyalty-app adoption/engagement despite signal loss & anonymous usage.
- **User/operator:** Miguel Martin, Global Head of Digital Marketing, Joe & The Juice.
- **Capability:** Rokt mParticle real-time segmentation + triggered offers.
- **Data inputs:** Real-time store checkout data; 30-day purchase frequency; product-affinity segments (coffee/sandwich lovers); store-visit location.
- **Intervention:** Trigger offers on behavior — e.g., 30% loyalty coupon at a customer's 3rd purchase in 30 days.
- **Outcome:** **75%** YoY loyalty-revenue growth; **2.4x** purchase frequency; **2.7x** spend; **74%** open rate; **5.5%** click-to-open.
- **Quote:** "Any digital marketer with a little bit of knowledge…can create really advanced funnels and campaigns using Rokt mParticle." — Miguel Martin.
- **Adjacent product `[HYPOTHESIS]`:** No-code "trigger builder" for physical-retail loyalty (QSR/food) sold as a vertical template pack.

### 15. Burger King — Whopper Detour `[VERIFIED-PUBLIC]`
- **Problem:** Drive redesigned mobile-app adoption in a crowded QSR market.
- **User/operator:** Fernando Machado, Global CMO, Burger King (agency FCB NY).
- **Capability:** mParticle as central data hub connecting Radar (geofence), Braze (push), Amplitude (analytics), Branch (deep-link), Tillster (mobile POS).
- **Data inputs:** Real-time geolocation (within 600 ft of McDonald's), app engagement, deep-link behavior.
- **Outcome:** **6M** total app downloads (1.5M in the 9-day campaign, +37.5%); **300%** increase in mobile order value; **40x** coupon-redemption rate; **$15M** expected annual spend; **37:1** ROI.
- **Quote:** "It's not easy to convince people to download mobile apps from fast-food brands…" — Fernando Machado.
- **Adjacent product `[HYPOTHESIS]`:** Pre-integrated "location-triggered campaign" bundle (CDP + geofence + push + POS) as a packaged QSR play.

### 16. Venmo `[VERIFIED-PUBLIC]`
- **Problem:** Data-eng/analytics teams overwhelmed by mobile-data-collection requests; data fragmented across warehouses/tools; manual reconciliation.
- **User/operator:** Data engineering & analytics teams (serving marketing/product).
- **Capability:** Rokt mParticle centralized mobile data collection.
- **Data inputs:** iOS/Android/web events; anonymous + logged-in identifiers; multiple warehouses.
- **Outcome:** **130M+** events collected/connected daily; a modeling exercise led to a social-feed change producing **+30%** engagement.
- **Adjacent product `[HYPOTHESIS]`:** "Data-request self-service" portal so product/marketing pull events without eng tickets (quantified eng-time savings is a recurring selling point).

### 17. SoFi `[VERIFIED-PUBLIC]`
- **Problem:** Fragmented customer data; manual pipelines causing **30% data loss** (Optimizely workflow); siloed event collection.
- **User/operator:** David Colletta, Sr. PM Growth, SoFi.
- **Capability:** Rokt mParticle (IDSync unification; Branch + Braze feeds; 300+ integrations).
- **Outcome:** **+30%** data consistency; thousands of eng hours saved; eliminated prior 30% data loss.
- **Quote:** "Rokt mParticle makes it easier for us to create a 360-degree view of the customer and use that data to improve targeting and personalization in our email communications." — David Colletta.
- **Adjacent product `[HYPOTHESIS]`:** Data-quality/observability layer ("catch the 30% you're losing") as a named CDP add-on.

### 18. Lulo Bank `[VERIFIED-PUBLIC]`
- **Problem:** No visibility into onboarding drop-off; manage CAC in competitive LatAm fintech.
- **User/operator:** Jorge Uribe, Media Lead, Lulo Bank (Bogotá).
- **Capability:** Rokt mParticle Analytics (funnels) + Audiences → Facebook Ads.
- **Data inputs:** Real-time app/web events (sign-up forms, identity-verification steps).
- **Intervention:** Funnel analysis to find drop-off; dynamic retargeting segments for abandoners.
- **Outcome:** **−15%** onboarding drop-off; **−95%** audience-creation time; found **18%** of installers never open a savings account.
- **Quote:** "Using Rokt mParticle works really well for us because we can build dashboards we need in just a few clicks without needing to code." — Jorge Uribe.
- **Adjacent product `[HYPOTHESIS]`:** Vertical "onboarding-funnel recovery" template for fintech/neobanks (KYC/identity-verification drop-off is a distinct, recurring failure point).

### 19. HBO Max `[VERIFIED-PUBLIC]`
- **Problem:** Marketing couldn't access data without engineering; S3 + SQL bottleneck; manual audience uploads/refreshes per tool.
- **User/operator:** HBO Max marketing team + data-eng org.
- **Capability:** Rokt mParticle CDP — Events API, IDSync, Audience Builder, 75+ audience integrations.
- **Data inputs:** iOS/Android/web engagement; email campaign performance.
- **Intervention:** Marketers independently build/activate audiences; real-time sync to 7+ tools.
- **Outcome:** **1,000+** engineering hours saved; **7+** tools powered; **5+** new regions launched; marketing self-sufficiency.
- **Adjacent product `[HYPOTHESIS]`:** "Marketer autonomy" positioning is repeated across HBO Max, SoFi, Venmo, Lulo, M&S → an opportunity for a **self-serve audience/analytics tier** priced/packaged for the marketing buyer, not IT.

---

## Section E — Named but NOT full published case studies (do not over-claim)

- **Ticketmaster** — Cited as a Rokt client using the "full product suite" for upsells (5M+ daily active users referenced in secondary/portfolio material). The most detailed narrative found (zero/negative uplift → trust-driven UX fixes, native-CTA swap) comes from a **third-party designer portfolio (veenybhatt.com), not a primary Rokt source** — treat as `[INFERENCE]`/unverified, not a Rokt-published result.
- **Fandango** — Only a Rokt **blog** ("the ticket to putting the customer first"); relevant-offer narrative, **no published metrics.**
- **JCPenney** — Only an interactive **demo page** (rokt.com/customers/demos/jcpenney) + a marketing video-series mention; no metric'd case study.
- **HP** — **No Rokt or mParticle case study found.** (Search returns HP's own unrelated 3D-printing/workforce content.) Do not attribute.

---

## Cross-Cutting Patterns

### Verticals that recur
1. **Financial services / fintech / BNPL** — Klarna, Afterpay, SoFi, Venmo, Lulo Bank (5). Split use: BNPL uses **monetization** (Thanks/Pay+); neobanks/fintech use **mParticle data/onboarding**.
2. **DTC / retail ecommerce** — Wine.com, Flamingo, Tails.com, Cozy Earth, Backcountry, ANINE BING, Tatcha, Beach Bunny, Honeylove, Virgin Wines (many). The volume core.
3. **Travel/entertainment/experiences** — Booking.com, ClassPass, Cinemark, Fandango, Ticketmaster, HBO Max.
4. **Food / QSR / loyalty** — Joe & The Juice, Burger King.
5. **Outdoors/subscription** — onX, Tails.com, Backcountry.

### Outcomes Rokt sells most (frequency of the headline)
1. **Incremental revenue / ROAS** (monetization + Ads): Klarna 111% YoY, Afterpay 32%, Backcountry $0.25–0.35/txn, Wine.com 5.8x, Booking 15%, Cozy Earth 3.4x. **Most common pitch.**
2. **Conversion/CPA efficiency at flat or lower cost:** ClassPass 12%, Flamingo −60% CPA, Tails 153%, onX 44%. "Only pay for outcomes" framing.
3. **Predictive/AI audience lift** (mParticle Cortex): Tatcha 8.5x, onX 44%, NY Post 40%.
4. **Engineering-hours saved / marketer autonomy** (mParticle CDP): HBO Max 1,000+ hrs, SoFi thousands of hrs, Venmo 130M events/day, Lulo −95% build time. A distinct *operational-efficiency* value prop aimed at the data/eng + marketing buyer.
5. **New distribution/GMV** (Catalog): ANINE BING $2.7M / +568% — newest storyline (post-Canal acquisition, 2025).

### Structural narrative arc (repeats verbatim across studies)
Fragmented data / untapped moment / channel fatigue → apply Rokt ML relevance or mParticle unification → measured lift **without harming CX/CSAT** ("trust" appears in Afterpay, Backcountry, Klarna). "Customer-first + revenue are inseparable" is the throughline.

### Most credible adjacent-opportunity themes `[HYPOTHESIS]`
1. **Native incrementality measurement (geo-lift-as-a-service).** Cozy Earth *and* others hire outside agencies (Haus) or run their own tests to prove Rokt is net-new. Attribution/overlap anxiety is the single most-repeated buyer pain. A first-party incrementality product would remove Rokt's own measurement-credibility gap and lock in performance budgets. **Highest confidence.**
2. **Self-serve "marketer-autonomy" CDP tier.** HBO Max, SoFi, Venmo, Lulo, M&S all sell the same win: marketers act without engineering. Packaging this as a lighter, no-code, marketing-owned tier (vs. enterprise IT sale) is a clear expansion path — and matches the merger thesis of Rokt + mParticle "real-time relevance."
3. **Vertical predictive-model templates (pre-trained).** Tatcha (quiz→propensity), onX (upgrade propensity), NY Post (membership) all rebuild similar propensity models. Shipping pre-trained vertical models (upgrade-propensity, churn/box-retention, KYC-onboarding-completion) shortcuts the "we don't want to build AI in-house" objection that appears repeatedly.
4. **Onboarding/KYC funnel-recovery for fintech.** Lulo's 18%-never-open-savings and identity-verification drop-off is a specific, high-value, regulated failure mode distinct from generic e-commerce cart abandonment — a focused fintech product.
5. **Brand-side marketplace-ops suite (Catalog companion).** ANINE BING wants distribution *without* operational overhead. Feed health, pricing/inventory sync, and discoverability analytics are the obvious next SKU on top of Catalog-for-Brands, especially post-Canal.

---

## Sources (all retrieved 2026-07-18)

**Rokt case studies (primary):**
- https://www.rokt.com/clients/case-studies (index)
- https://www.rokt.com/case-studies/klarna-unlocks-scalable-growth-with-rokt
- https://www.rokt.com/case-studies/afterpay-drives-incremental-revenue-while-protecting-customer-trust-with-rokt
- https://www.rokt.com/case-studies/how-rokt-ads-drives-bookings-for-booking-dot-com
- https://www.rokt.com/case-studies/classpass-increases-conversion-efficiency-with-rokt-ads
- https://www.rokt.com/case-studies/wine-com-achieves-a-5-8x-roas-with-rokt-ads
- https://www.rokt.com/case-studies/flamingo-shaves-off-their-cpa-by-60-with-rokt-ads-2
- https://www.rokt.com/case-studies/tails-com-achieves-153-uplift-in-conversions-with-rokt-ads
- https://www.rokt.com/case-studies/cozy-earth
- https://www.rokt.com/case-studies/case-studies-backcountry-incremental-revenue-rokt-thanks
- https://www.rokt.com/case-studies/anine-bing-scales-marketplace-growth-with-rokt-catalog
- https://www.rokt.com/case-studies/how-tatcha-elevates-personalization-and-revenue-with-rokt-mparticle
- https://www.rokt.com/case-studies/marks-spencer-drives-revenue-growth-with-real-time-segmentation-using-rokt-mparticle
- https://www.rokt.com/case-studies/how-joe-the-juice-grows-its-loyalty-program-with-real-time-data-insights-from-rokt-mparticle
- https://www.rokt.com/case-studies/burger-king-drove-6mm-app-downloads-with-rokt-mparticle-powering-real-time-engagement
- https://www.rokt.com/case-studies/venmo-simplified-mobile-data-collection-with-rokt-mparticle
- https://www.rokt.com/case-studies/sofi-powers-personalized-email-campaigns-with-high-quality-customer-data-using-rokt-mparticle
- https://www.rokt.com/case-studies/lulo-bank-improves-customer-onboarding-with-actionable-insights-from-rokt-mparticle
- https://www.rokt.com/case-studies/hbo-max-powers-smarter-reengagement-with-rokt-mparticle
- https://www.rokt.com/case-studies/cinemark-utilizes-rokts-solutions-to-drive-incremental-revenue-and-acquire-new-customers

**mParticle customer stories (primary):**
- https://www.mparticle.com/customers/ (index)
- https://www.mparticle.com/customers/onx/
- https://www.mparticle.com/customers/tatcha/
- https://www.mparticle.com/customers/joe-and-the-juice/
- https://www.mparticle.com/customers/lulo-bank/
- https://www.mparticle.com/customers/venmo-campaign/
- https://www.mparticle.com/customers/new-york-post/

**Context / secondary (labeled where used):**
- https://www.rokt.com/blog/rokt-acquires-canal-to-launch-rokt-catalog-expanding-ecommerce-offering (Canal acquisition, SHEIN in network)
- https://www.pymnts.com/acquisitions/2025/rokt-acquires-canal-to-bolster-ecommerce-offering/
- https://www.prnewswire.com/news-releases/rokt-and-mparticle-merge-to-redefine-real-time-relevance-302352650.html
- https://www.rokt.com/blog/fandango-x-rokt-the-ticket-to-putting-the-customer-first (Fandango, no metrics)
- https://www.rokt.com/customers/demos/jcpenney (JCPenney demo only)
- https://www.veenybhatt.com/work/upsells (Ticketmaster — THIRD-PARTY portfolio, unverified, not a Rokt source)

---

## Freshness / Confidence

- **Freshness:** All primary pages fetched live on **2026-07-18**. Metrics reflect whatever Rokt/mParticle currently display; several pages carry no visible publication date, so absolute recency of each metric is **unknown** (medium risk of a stat being refreshed since capture).
- **Confidence — HIGH:** All 19 metric'd case studies above are verbatim from primary rokt.com / mparticle.com pages, cross-checked against search snippets. Metrics and named quotes/speakers are reliable.
- **Confidence — MEDIUM:** Exact publication dates (none of the case-study pages state them explicitly); ANINE BING/Catalog framing depends partly on the 2025 Canal-acquisition context.
- **Confidence — LOW / flagged:** Ticketmaster narrative (third-party portfolio, not Rokt-published); HP (no case study exists — do not attribute); SHEIN (network mention only, not a case study); Fandango/JCPenney (no published metrics).
- **No fabrication:** Where a metric, date, quote, or speaker was not present in-source, this report says so rather than inventing one. Product-gap "hypotheses" are labeled `[HYPOTHESIS]` and were not derived merely from omissions.
