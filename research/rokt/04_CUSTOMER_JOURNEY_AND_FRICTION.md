# Customer & Shopper Journey — Friction Map (Rokt Ecosystem)

**Agent 4 — Customer & Shopper Journey Researcher**
**Retrieval date:** 2026-07-18
**Scope:** Public evidence only. Verticals — ticketing, retail, travel, financial services, QSR, media/entertainment, subscriptions.
**Evidence labels:** [VERIFIED-PUBLIC] = stated by Rokt/mParticle or a named source; [INDUSTRY-PROBLEM] = well-documented industry-wide friction; [INFERENCE] = reasoned from evidence; [HYPOTHESIS] = plausible, unverified.

> **Framing note (per task rules):** This report maps *customer problems* and where they sit in the journey. Where a problem sits "adjacent to a Rokt surface," that is a neutral observation about proximity — it is **not** a claim that Rokt fails to address it, nor that Rokt causes it.

---

## 1. Rokt's surfaces and the journey stages they touch

[VERIFIED-PUBLIC] Rokt frames its value around the **Transaction Moment™**, described as "a pivotal phase that unfolds across four critical touchpoints: the cart, payment, thank you, and confirmation pages," and claims this moment "drives over 90% of ancillary revenue potential" for verticals like travel, ticketing, retail, and media.
Surfaces named publicly:
- **Rokt Catalog** — "over 1.2 million third-party products from 4,600+ premium brands" into the Transaction Moment.
- **Rokt Upcart** — in-cart upsells, "up to 25% more revenue."
- **Rokt Pay+ / Pay** — payment step monetization.
- **Rokt Aftersell** — post-purchase upsells, "up to 30% more revenue."
- **Rokt Thanks** — monetizes the confirmation/thank-you page.
[VERIFIED-PUBLIC] Network scale claims: "more than 33,000 active clients," "10 billion transactions annually," "1.1 billion unique customers"; named clients include Live Nation, AMC Theatres, Fanatics, Macy's, PayPal, Uber, Hulu, Staples, Albertsons, HelloFresh.
Sources: rokt.com product overview / homepage / monetization pages (retrieved 2026-07-18).

**Journey-stage → surface adjacency (mapping):**

| Stage | Primary Rokt-adjacent surface |
|---|---|
| Discovery / research / comparison | *(Pre-transaction — largely outside Rokt's stated surfaces)* [INFERENCE] |
| Cart | Upcart, Catalog |
| Payment | Pay+ |
| Confirmation / thank-you | Thanks, Aftersell |
| Fulfillment | *(Adjacent to Thanks/confirmation messaging)* [INFERENCE] |
| Cancellation / refund / store credit | *(Post-transaction — largely outside stated surfaces)* [INFERENCE] |
| Loyalty / repeat / churn-win-back | *(Aftersell/Thanks touch loyalty prompts)* [INFERENCE] |

---

## 2. Illustrative research seed — the movie-ticket post-purchase moment

**Scenario (Fandango / Alamo Drafthouse):** What happens *after* a customer buys a movie ticket?

[VERIFIED-PUBLIC] **Fandango** confirms it "may send you a confirmation via email and/or text" and "may also send one or more subsequent invitations" — post-purchase emails carrying promo codes for streaming, concessions links, entertainment bundles, and subscription offers (Fandango Ticket & Concessions Policy, retrieved 2026-07-18).
[VERIFIED-PUBLIC] **Alamo Drafthouse** confirms seat selection before purchase, QR-code in-seat food ordering ("scan the QR code on your seats… order goes directly to the kitchen"), app-based refunds "up to one hour before the showtime," and a caveat that "it is not until you receive a ticket at the applicable theater that the seat will be confirmed" (drafthouse.com "How Things Work" / mobile-ordering FAQ, retrieved 2026-07-18).

**Observed friction/opportunity in this moment (analysis):**
- [INFERENCE] The confirmation screen is a *high-intent, high-attention* dwell point: the customer has committed money and a future time-slot, and is now anticipating an experience. This is precisely the window Rokt Thanks/Aftersell are built for.
- [HYPOTHESIS] **Timing mismatch:** an offer for *concessions or parking* is relevant at confirmation (before arrival); an offer for a *future movie* competes with the excitement of the one just bought. The "right offer, wrong moment" risk is real here.
- [HYPOTHESIS] **Checkout distraction vs. reassurance:** at the ticketing confirmation, the customer's first job is to confirm "did my purchase go through?" (Fandango has a dedicated support article on exactly this question). An interstitial offer that obscures the confirmation status could *increase* anxiety rather than delight.
- [INFERENCE] **Genuine adjacency, not a solution:** post-ticket is a strong candidate moment for relevant offers (parking, rideshare, dining, streaming). Whether an offer *helps* depends on relevance and on not competing with the fulfillment/reassurance the customer needs first.

*Who experiences it:* every ticket buyer. *Evidence strength:* medium-high (behaviors documented by the merchants themselves). *Journey stage:* confirmation → fulfillment. *Rokt adjacency:* Thanks, Aftersell.

---

## 3. Genuine customer problems, mapped

### 3.1 Checkout distraction & the cost-transparency wall
[INDUSTRY-PROBLEM] Baymard: average cart-abandonment ≈ **70.19%**; **48%** abandon due to unexpected costs (shipping/tax/fees appearing late); the average checkout has **~23.5 form elements / ~14.9 fields** vs. an optimal 7–8. Baymard estimates **~$260B** recoverable in US/EU from better checkout UX (baymard.com/research/checkout-usability, retrieved 2026-07-18).
- *Who:* all shoppers, worst at payment step. *Stage:* cart → payment. *Rokt adjacency:* Upcart, Pay+. [INFERENCE] Any in-cart/at-payment content sits inside an *already-crowded, high-abandonment* moment — relevance and non-obstruction are the design constraint, not an optional nicety.

### 3.2 Mobile constraints
[INDUSTRY-PROBLEM] Mobile abandonment ≈ **80.0%** vs. desktop **66.4%** (Baymard, via multiple 2026 benchmark write-ups). Smaller viewport, tiny touch targets, and payment friction compound. *Who:* mobile majority. *Stage:* cart → payment → confirmation. *Rokt adjacency:* all surfaces render on mobile. [INFERENCE] The confirmation-page offer must fit a constrained screen without pushing the confirmation itself below the fold.

### 3.3 Accessibility
[INDUSTRY-PROBLEM] WCAG 2.1/2.2 require touch targets ≥ 44×44px and text resize to 200%; payment widgets frequently "trap keyboard focus or announce nothing to assistive technologies"; unlabeled fields and poor error handling drive abandonment for screen-reader/keyboard users and older adults (216digital, AEL Data, Vispero — retrieved 2026-07-18). *Who:* users with disabilities, older shoppers. *Stage:* payment, confirmation. *Rokt adjacency:* any injected offer UI inherits an accessibility obligation. [INFERENCE]

### 3.4 Offer fatigue & irrelevant incentives
[VERIFIED-PUBLIC] Optimove 2025 Marketing Fatigue Report: **56%** are bothered by frequent marketing *only when content is irrelevant*; **70%** unsubscribed from a brand in the past three months due to volume; **36%** of unsubscribes cite irrelevance. Attentive global study (Apr 2025): **81%** ignore irrelevant messages; **96%** likely to purchase from personalized messages; **93%** say a brand loses trust if it mishandles personal data.
- *Takeaway (quoted framing):* fatigue is "caused by marketing that ignores context, intent, and timing."
- *Who:* everyone receiving offers. *Stage:* confirmation, post-purchase, win-back. *Rokt adjacency:* Thanks, Aftersell — directly in the business of choosing *which* offer, which is the exact lever this evidence says matters. [INFERENCE]

### 3.5 Repeatedly-rejected offers / hesitation
[INFERENCE from 3.4] The same rejected or near-identical offer resurfacing across sessions is a specific fatigue driver; hesitation at an offer is a signal, not just a non-click. *Stage:* cart, confirmation, repeat purchase. *Rokt adjacency:* Brain (relevance engine), Aftersell. [HYPOTHESIS] Suppression of previously-declined offers is a plausible relevance need.

### 3.6 Post-purchase regret / hesitation
[VERIFIED-PUBLIC] StudyFinds/OnePoll: **74%** of US adults report buyer's remorse after online purchases; Consumer Reports: ~**60%** regret a purchase. Common causes: item less valuable than expected (39%), overspending (32%), impulse (42%). **63%** have forgotten they ordered something. *Who:* impulse and high-spend buyers. *Stage:* confirmation → post-purchase. *Rokt adjacency:* Thanks/Aftersell operate at the exact moment regret can form; an *additional* upsell into a regret-prone state is a genuine tension to design around. [INFERENCE]

### 3.7 Cancellation value loss, refunds & store credit
[VERIFIED-PUBLIC/INDUSTRY-PROBLEM] Subscription friction: **79%** frustrated by hidden fees (SWNS); **33%** cancelled a service in the past year over billing frustration (Solidgate); poor cancellation flows are "one of the most direct causes of subscription chargebacks." FTC "Click-to-Cancel" rule (proposed 2023) targets exactly this. Cancellation friction "eventually erodes trust, fostering resentment." *Who:* subscribers, refund seekers. *Stage:* cancellation → refund → store credit → churn. *Rokt adjacency:* mostly **outside** stated Rokt surfaces (post-transaction service flows), though win-back/retention offers are adjacent to Aftersell/Thanks. [INFERENCE] Store-credit and refund moments are an under-served, high-emotion opportunity space.

### 3.8 Identity fragmentation & cross-device continuity
[VERIFIED-PUBLIC] mParticle IDSync material: customers "aren't always logged-in on every device," and anonymous browsing data "may not be unified to the profile." A third-party review summary cites cross-device stitching leaving **20–35% of profiles fragmented** despite configuration (checkthat.ai review aggregation — treat as [INFERENCE]-grade, secondary). *Who:* multi-device shoppers. *Stage:* discovery → repeat purchase (spans all). *Rokt adjacency:* Rokt Brain relevance depends on identity; fragmentation degrades offer relevance everywhere. [INFERENCE] mParticle is now a Rokt company, making this squarely in-ecosystem.

### 3.9 Loyalty recognition
[VERIFIED-PUBLIC] Cross-channel loyalty gap: customers "make a purchase but don't see points sync… open the app and receive outdated offers." Antavo/industry stats: **49%** say earning takes too long, **41%** frustrated by expiring points; **83%** of marketers think members feel valued vs. only **56%** of consumers who agree. *Who:* loyalty members. *Stage:* loyalty, repeat, win-back. *Rokt adjacency:* Thanks/Aftersell loyalty prompts; recognition depends on identity (see 3.8). [INFERENCE]

### 3.10 Trust & transparency
[VERIFIED-PUBLIC] **93%** say mishandled data loses trust (Attentive); privacy is the top constraint on personalization. *Who:* all. *Stage:* payment, confirmation, any data-collection prompt. *Rokt adjacency:* every offer surface that uses first-party data. [INFERENCE] Transparency about *why* an offer appears is a trust lever.

### 3.11 Timing mismatch (cross-cutting)
[INFERENCE, grounded in 3.4 + §2] The fatigue evidence explicitly names *timing* as a fatigue driver. The strongest expression is the confirmation page: fulfillment-relevant offers (parking, concessions, delivery add-ons) fit; unrelated future-purchase offers compete with the just-completed purchase. *Stage:* confirmation → fulfillment. *Rokt adjacency:* Thanks, Aftersell.

---

## 4. Vertical journey notes (evidence-anchored)

- **Ticketing / media-entertainment:** [VERIFIED-PUBLIC] Fandango post-purchase emails; Alamo QR concessions & app refunds; Rokt clients include AMC, Live Nation. Post-ticket confirmation = strongest illustrative seed (§2). Friction: reassurance-vs-distraction, timing.
- **Travel:** [VERIFIED-PUBLIC] TravelPass + Rokt Thanks on the **booking confirmation page** → "$11,000 per 100,000 transactions," "5.1% average positive engagement rate," "25% uplift in value per transaction." Journey: booking → confirmation → trip fulfillment. Friction: cancellation/refund value loss is severe in travel [INFERENCE].
- **Retail:** [INDUSTRY-PROBLEM] Baymard cart/checkout friction is the retail baseline; Rokt Upcart/Catalog sit in cart. Friction: unexpected-cost wall, mobile.
- **Financial services:** [VERIFIED-PUBLIC] Rokt names PayPal as a client; FS confirmation pages (loan approval, card issuance, payment completion) are high-intent, high-trust moments. Friction: trust/transparency is paramount [INFERENCE]; regulated-offer relevance.
- **QSR:** [VERIFIED-PUBLIC] Rokt's own example — coffee-chain app prompts loyalty-point earning via a post-purchase survey. Friction: offer fatigue in high-frequency, low-ticket flows; loyalty recognition [INFERENCE].
- **Subscriptions:** [VERIFIED-PUBLIC/INDUSTRY-PROBLEM] Cancellation friction, hidden fees, FTC Click-to-Cancel. Friction cluster: cancellation value loss, churn/win-back. Largely post-transaction (outside core Rokt surfaces) but adjacent to win-back [INFERENCE].

---

## 5. Highest-evidence friction ranked by (a) evidence strength and (b) Rokt-surface adjacency

| Rank | Friction | Evidence | Rokt surface adjacency |
|---|---|---|---|
| 1 | Offer fatigue / irrelevance / bad timing | **Strong** (Optimove, Attentive named stats) | **High** — Thanks, Aftersell, Brain |
| 2 | Checkout distraction & cost-transparency wall | **Strong** (Baymard) | **High** — Upcart, Pay+ |
| 3 | Post-purchase regret at confirmation | **Strong** (StudyFinds, Consumer Reports) | **High** — Thanks, Aftersell |
| 4 | Mobile constraints | **Strong** (Baymard 80% mobile) | **High** — all surfaces |
| 5 | Identity fragmentation / cross-device | **Medium** (mParticle primary; % secondary) | **High** — Brain, mParticle in-ecosystem |
| 6 | Trust & transparency | **Strong** (Attentive 93%) | **Medium-High** |
| 7 | Loyalty recognition | **Medium** (industry stats) | **Medium** — Thanks/Aftersell prompts |
| 8 | Accessibility | **Strong** (WCAG) | **Medium** — offer UI obligation |
| 9 | Cancellation value loss / refund / store credit | **Strong** (subscription research, FTC) | **Low-Medium** — post-transaction, win-back adjacent |

---

## 6. Open questions / hypotheses for the team
- [HYPOTHESIS] Is the confirmation-page offer competing with the customer's need to *confirm the purchase went through*? (Fandango's "did my purchase go through?" support article suggests reassurance is a live anxiety.)
- [HYPOTHESIS] Do previously-declined offers resurface across sessions, and does suppression improve engagement? (Not verifiable from public sources.)
- [HYPOTHESIS] Refund / store-credit moments are high-emotion and under-served by offer surfaces — genuine opportunity or trust risk?
- [INFERENCE] Discovery/research/comparison stages sit largely *upstream* of Rokt's stated Transaction-Moment surfaces — a mapped gap in coverage of the *full* journey, not a product criticism.

---

## Sources (retrieved 2026-07-18)
1. Rokt — Product overview / homepage / monetization. https://www.rokt.com/products/product-overview , https://www.rokt.com/ , https://www.rokt.com/solutions/use-case/monetization
2. Rokt — Post-purchase marketing examples (blog). https://www.rokt.com/blog/post-purchase-marketing-examples-to-create-delightful-customer-experiences
3. Rokt — TravelPass case study. https://www.rokt.com/case-studies/travelpass-partners-with-rokt-to-generate-an-additional-11k-in-profit-for-every-100k-transactions
4. Baymard Institute — Checkout usability research. https://baymard.com/research/checkout-usability
5. Fandango — Ticket & Concessions Policy. https://www.fandango.com/policies/ticket-and-concessions-policy ; "Did my ticket purchase go through?" https://support.fandango.com/fandangosupport/s/article/Did-my-ticket-purchase-go-through
6. Alamo Drafthouse — How Things Work / Mobile ordering FAQ. https://drafthouse.com/about/how-things-work , https://drafthouse.com/news/our-shift-to-qr-ordering
7. Optimove — 2025/2026 Marketing Fatigue Report. https://optimove.com/blog/less-is-more-in-marketing-fatigued-consumers-say
8. Attentive — Global personalization study (Apr 2025). https://www.attentive.com/press-releases/new-global-study-reveals-consumers-demand-more-personalization-in-marketing-81-ignore-irrelevant-messages-while-personalized-experiences-drive-loyalty-and-sales
9. StudyFinds/OnePoll — buyer's remorse. https://studyfinds.org/buyers-remorse-shopping-online/ ; Ipsos. https://www.ipsos.com/en-us/many-americans-have-experienced-buyers-remorse
10. Subscription cancellation friction — P&C Global, Chargeback Gurus, FTC Click-to-Cancel coverage. https://www.pandcglobal.com/research-insights/the-subscription-model-reckoning-winning-back-trust/ , https://www.chargebackgurus.com/blog/what-causes-subscription-chargebacks
11. mParticle — IDSync / identity resolution. https://www.mparticle.com/blog/flexible-identity-resolution/ , https://www.mparticle.com/blog/what-is-identity-resolution/
12. Loyalty recognition — Antavo 254 stats; CMSWire; Open Loyalty trends. https://antavo.com/blog/customer-loyalty-statistics/ , https://www.cmswire.com/customer-experience/the-loyalty-program-illusion-why-points-dont-equal-preference/
13. Accessibility — 216digital, AEL Data, Vispero, technology.org (WCAG mobile). https://216digital.com/accessible-checkout-experience-optimization-reducing-friction-and-legal-risk/ , https://aeldata.com/shopping-cart-accessibility/
14. Cart abandonment benchmarks (mobile vs desktop) — Zipchat/Eightx 2026 compilations citing Baymard. https://www.zipchat.ai/blog/cart-abandonment-benchmarks-and-causes , https://eightx.co/blog/average-ecommerce-cart-abandonment-rate-by-vertical-2026

## Freshness & Confidence
- **Freshness:** All URLs retrieved 2026-07-18. Rokt/mParticle/Fandango/Alamo pages are current-state primary sources. Baymard headline stats (70.19% abandonment, 48% unexpected-cost, mobile 80%) are widely echoed in 2025–2026 write-ups; direct Baymard page paywalls some detail, so a few figures are triangulated from secondary compilations (flagged).
- **Confidence — High:** Rokt surface definitions and journey placement; Baymard checkout-friction figures; offer-fatigue and buyer's-remorse survey stats; TravelPass metrics; Fandango/Alamo post-purchase behaviors.
- **Confidence — Medium:** the 20–35% identity-fragmentation figure (secondary review aggregation, not mParticle primary); loyalty-recognition percentages (industry compilations); vertical inferences about FS/subscription adjacency.
- **Confidence — Low / Hypothesis:** confirmation-page reassurance-vs-distraction tension; declined-offer suppression; refund/store-credit as offer opportunity. These are reasoned, not sourced.
- **No fabrication:** All quoted numbers trace to a listed source; unsourced reasoning is labeled [INFERENCE] or [HYPOTHESIS].
