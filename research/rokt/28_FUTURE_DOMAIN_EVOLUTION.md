# 28 — Domain Evolution: Future Bounded-Context Hypotheses

**Date:** 2026-07-19 · Retrieval 2026-07-19
**What this is.** Eight *ambitious-but-grounded* product hypotheses for where Rokt's domain could **evolve** — each framed as a new or evolving DDD **bounded context**, with a real revenue mechanism and a holdout that would prove it. First-principles ambition (a real bet, not a feature), held to honest discipline: **every idea is labeled HYPOTHESIS**, tied to a **verified public Rokt/industry signal**, with a concrete way it makes money and the incrementality experiment that would validate it (never a claimed lift).

**Discipline.** VERIFIED facts are cited and separated from my inference. Nothing here claims Rokt "lacks" anything — Rokt is sophisticated and very likely has internal thinking on all of it. These are *where I would push the domain next*, to pressure-test with a Rokt engineer.

**Relationship to prior docs (deliberately beyond them).**
- `22_ADDITIONAL_OPPORTUNITIES.md` and `docs/FUTURE_VISION.md` = "apply Threshold's pre-flight gate to new surfaces (loyalty, data, agents, incrementality, integrations)."
- `26_OUT_OF_BOX_OPPORTUNITIES.md` = eight *assurance/correctness layers* wrapped around probabilistic cores (WHS ledger, mandate verifier, reward idempotency, agent-code gate, cross-surface constraint, self-serve guardrail, clean-room certificate).
- **This doc is different in kind:** these are **revenue-generating product/domain bets** — new marketplaces, new demand, new surfaces, new pricing models — not safety gates. Where an idea sits on top of a doc-26 safety substrate, I say so explicitly and build the *money* layer above it.

---

## Grounding — NEW verified signals (mid-2026), beyond prior docs

| # | Verified fact (public) | Source |
|---|---|---|
| G1 | **The Modern Commerce Stack** — Rokt's own decomposition: a **Decisioning Layer** that "determines the next best action based on current session data and contextual signals" and an **Experience Layer** that "delivers relevant interactions directly within the purchase flow without disrupting the user experience." | [rokt.com/blog — The Modern Commerce Stack](https://www.rokt.com/blog/the-modern-commerce-stack-a-guide-for-leaders-building-whats-next) |
| G2 | **"Suppression becomes as valuable as exposure. This balance strengthens conversion while unlocking incremental revenue."** Also: **"The Transaction Moment generates some of the most predictive signals for future value,"** and "Brands can assess incremental outcomes by comparing behavior with and without relevant interventions." | [rokt.com/blog — Ecommerce Trends for 2026](https://www.rokt.com/blog/ecommerce-trends-for-2026-why-the-transaction-moment-decides-who-wins) |
| G3 | **Five 2026 Trends** (Rokt outlook, Jan 26 2026): (1) checkout is the most valuable moment; (2) **"smarter signals replace more impressions"** — first-party data, contextual relevance, real purchase intent; (3) commerce & media teams **converge** to manage "checkout, loyalty, onsite media, and customer experience holistically"; (4) loyalty expands from post-purchase to **"in-purchase" engagement**; (5) **white space / restraint** as competitive advantage. | [PRNewswire — 2026 Digital Commerce & Commerce Media Outlook](https://www.prnewswire.com/news-releases/2026-digital-commerce-and-commerce-media-outlook-five-trends-redefining-the-transaction-moment-302669716.html) |
| G4 | **Rokt Brain v4** — new evolution of the decisioning engine, "sharper architecture," "more scalable decisioning," to "better match offers and experiences to consumers in the transaction moment." | [TipRanks — Rokt Unveils Brain v4](https://www.tipranks.com/news/private-companies/rokt-unveils-brain-v4-ai-engine-to-enhance-transaction-moment-relevance) |
| G5 | **Rokt mParticle Performance Engine, led by the "Audience Agent"** (June 2026): an agent that "reasons through a brand's data to build a stronger audience than most marketers would reach on their own, **proposing it for the marketer's approval**"; "renders an audience definition, **showing its reasoning before anything is saved**"; **"nothing activates on its own"**; gains a real-time feedback loop as conversions return; targets "**eroding match rates**." | [PRNewswire — Performance Engine, Led by Audience Agent](https://www.prnewswire.com/news-releases/rokt-mparticle-launches-performance-engine-led-by-audience-agent-302810947.html) |
| G6 | **Agentic-commerce standards, mid-2026:** UCP-powered checkout **live** with Nike, Sephora, Target, Ulta, Walmart, Wayfair + Shopify merchants; OpenAI **killed Instant Checkout (Mar 2026, ~5 months, near-zero sales)** and pivoted ACP to product **discovery**; **AP2 v0.2** (FIDO-governed Apr 28 2026) adds **Human-Not-Present** payments and **Mandates with Open/Closed states** (w/ Mastercard); **Adyen Agentic** ships a universal translator across UCP/ACP/AP2 (Jun 16 2026). | [digitalapplied — Agentic Commerce Standards 2026](https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide) |
| G7 | Rokt Brain determines **"the next best action for every individual"** for "real-time relevance in the Transaction Moment"; scale **10B+ transactions, 1.1B customers, sub-100ms**; Transaction Moment drives **"over 90% of ancillary revenue potential."** | [Rokt Brain & Network product page](https://www.rokt.com/products/rokt-brain-and-rokt-network) · `FUTURE_VISION.md` verified block |
| G8 | **Gift with Purchase / Shopper Rewards:** shoppers "unlock a reward … by completing a simple action during checkout"; Brain analyzes "more than 1.95 trillion data points per year." | [Rokt — Gift with Purchase](https://www.rokt.com/blog/boosting-conversion-and-loyalty-with-rokts-gift-with-purchase) |

Everything below each idea's **Signal** line is **my inference / design**, not a Rokt statement.

---

## The eight hypotheses

Each: **thesis · verified signal · revenue mechanism · domain framing (context + new ubiquitous language / domain events + where determinism & safety live) · how a holdout proves it · honest risk.**

---

### 1. Agent Offer Exchange — become the incrementality-proven *offer-decision API that shopping agents call* [HYPOTHESIS]

**Thesis.** As LLM shopping agents assemble carts (UCP checkout is live at Nike/Sephora/Target/Walmart — G6), there is an unclaimed layer *between* the agent's cart and the payment rail: **which incremental offer or reward belongs in this agent-mediated transaction, and is it worth showing at all.** Rokt already owns exactly that decision for humans (G7); the bet is to expose it as a **server-to-server Offer Decision API that agents (and agent platforms like Adyen Agentic) call** at cart assembly — Rokt becomes the *decisioning layer for agentic checkout*, not a passenger on someone else's rail.

**Verified signal.** UCP checkout is live across major merchants and Adyen Agentic already brokers across protocols (G6); Rokt's own framing splits a **Decisioning Layer** from an **Experience Layer** (G1) — the Decisioning Layer is protocol-agnostic and does not require Rokt to own the agent's UI.

**Revenue mechanism.** A **new demand surface**: Rokt Network advertiser demand meets agent supply. Rokt earns incremental take on agent-mediated conversions it decisions, and opens inventory that today has no Rokt presence (agent checkouts happening off Rokt partners entirely). Positioned as "the decision layer the agent rails don't have," it monetizes the one thing Rokt is best in the world at — incrementality-proven next-best-action — on surfaces it doesn't currently touch.

**Domain framing.** New bounded context **"Agent Offer Exchange."** New ubiquitous language / domain events: `AgentSessionOpened`, `MandateEnvelopeReceived`, `OfferBidRequested`, `OfferDecisioned`, `DecisionReceiptIssued`, `OfferDeclined(reason=out_of_mandate|low_incremental|suppressed)`. **Determinism & safety:** a deterministic **mandate-conformance boundary** wraps the probabilistic Brain (only decision *within* the AP2 Intent/Cart envelope — G6); **fail-closed** to "no offer" on an unverifiable mandate or latency-budget miss; every decision emits a tamper-evident `DecisionReceipt` the agent can echo back. (The doc-26 #2 Mandate Verifier is the safety *substrate*; this is the *demand-marketplace* built on it.)

**How a holdout proves it.** Randomize agent carts into decisioned vs. un-decisioned at the mediation boundary; measure **incremental conversion / incremental revenue per agent channel** — never a claimed lift, only the holdout delta, reported per protocol (UCP vs ACP-discovery) because they are different causal objects.

**Honest risk.** Agent-checkout economics are *unproven* — ACP's Instant Checkout died in five months at near-zero sales (G6). The agent platforms (Google/OpenAI/Adyen) may build their own decision layer and disintermediate Rokt. And building to protocols still consolidating risks throwaway work — mitigate by targeting the *stable abstraction* (a signed-mandate + offer-decision contract), not any one wire format.

---

### 2. Attention Yield — sell the *decision not to show* [HYPOTHESIS · genuinely non-obvious]

**Thesis.** Rokt monetizes showing the right offer. The next frontier is monetizing **restraint**: treating a shopper's finite attention at the Transaction Moment as **inventory to be yield-managed**, where deliberately *suppressing* a low-value offer to protect a high-value moment is a priced, measurable product — not lost revenue.

**Verified signal.** Rokt says it plainly: **"Suppression becomes as valuable as exposure. This balance strengthens conversion while unlocking incremental revenue"** (G2), and names **white space / restraint** as a 2026 competitive advantage (G3, trend 5). This is Rokt asserting the thesis; the *product* around it is the open bet.

**Revenue mechanism.** Two concrete paths. (a) **Premium "clean moment" tier** — a partner pays for guaranteed uncluttered checkout on their highest-value shoppers, and Rokt still earns via the suppression contract instead of an impression. (b) **Attention yield optimization** — the Brain decisions *whether the marginal offer's expected incremental value exceeds the fatigue cost it imposes on future moments*; not burning a high-LTV shopper on a low-value offer raises **long-run incremental revenue per shopper**. Suppression stops being forgone revenue and becomes managed yield.

**Domain framing.** New bounded context **"Attention Yield."** New language / events: `MomentValueEstimated`, `SuppressionDecided`, `AttentionBudgetDebited`, `ForgoneImpressionPriced`, `FatigueCostAccrued`. **Determinism & safety:** the suppression *policy* is deterministic and audited (an auditable rule — "suppress when expected incremental value < fatigue-adjusted floor"), so "we chose to show nothing" is always explainable and reproducible, never a silent drop. This is where Threshold's discipline transfers: a suppression policy edit is exactly the kind of change that can silently widen or narrow who sees offers.

**How a holdout proves it.** Hold out the suppression logic; compare **long-run (e.g. 90-day) incremental revenue per shopper** and **opt-out / offer-fatigue rates** between suppression-on and suppression-off cohorts. The bet is validated only if showing *less* provably makes *more* over the horizon.

**Honest risk.** Suppression is forgone *short-term* revenue against an uncertain long-term gain — a genuinely hard internal and commercial sell ("we showed fewer ads and want credit for it"). The proof horizon is long and the LTV signal is noisy, so the holdout may stay underpowered for quarters. If fatigue effects are small at Rokt's relevance level, the product has no floor.

---

### 3. Future-Value Decisioning — optimize the moment for predicted *incremental lifetime value*, not the next click [HYPOTHESIS]

**Thesis.** Evolve the Decisioning Layer's objective from *immediate* next-best-action to **predicted incremental lifetime value** — choose the offer whose causal effect on the shopper's and partner's *future* value is highest, using only **consented first-party and contextual transaction signals** (no cross-web tracking).

**Verified signal.** Rokt states the Transaction Moment **"generates some of the most predictive signals for future value"** (G2) and that 2026 favors **"smarter signals … rooted in first-party data, contextual relevance, and real purchase intent"** over impression volume (G3, trend 2). Brain v4 already emphasizes scalable decisioning (G4).

**Revenue mechanism.** Unlocks **value-based pricing**: partners pay for *incremental value delivered* (retained, higher-LTV customers) rather than CPA/CPM — a higher and more defensible take than click pricing, and a differentiator no impression-based network can match. It also compounds idea #2: a future-value objective is what *justifies* suppression.

**Domain framing.** Evolving bounded context **"Value Decisioning"** (the Decisioning Layer, G1, with a new objective). New language / events: `FutureValueEstimated`, `ConsentScopedSignalAdmitted`, `ValueContributionAttributed`, `SignalRevoked→SignalExcluded`. **Determinism & safety:** the **consent-scoping boundary is deterministic and fail-closed** — a signal that isn't provably consented is excluded from the estimate, and revocation deterministically removes it from future decisions (ties to `FUTURE_VISION.md` Milestone E consent-aware replay). The probabilistic value model lives *inside* a hard consent envelope; the envelope is auditable.

**How a holdout proves it.** Value-optimized vs. conversion-optimized decisioning as parallel arms; measure **90-day incremental value per exposed cohort** (repeat purchase, retention, margin), not immediate conversion. The holdout is the only truth — no offline LTV claim counts.

**Honest risk.** LTV attribution is long-horizon and noisy; a value objective can *lose* on the immediate-conversion metric partners currently buy on, making adoption a chicken-and-egg problem. Consent-scoping legitimately *shrinks* the usable signal — the honest version accepts a smaller, cleaner feature set over a creepier, larger one, and that trade may reduce measurable lift.

---

### 4. Consented Intent Cooperative — a first-party signal network with a data-network-effect moat [HYPOTHESIS]

**Thesis.** Rokt sits at 10B+ transactions across 33k+ clients (G7). The evolution is a **consent-governed cooperative** where merchants opt to contribute first-party *transaction* signals into a shared, privacy-preserving intent graph that improves decisioning for all contributors — a data-network effect only an operator at Rokt's position can broker.

**Verified signal.** Rokt's 2026 thesis is **"smarter signals replace more impressions"** built on **first-party data** (G3, trend 2); the Performance Engine explicitly targets **"eroding match rates"** (G5) — the exact pain a consented cooperative addresses. This is a real, named industry problem, not invented.

**Revenue mechanism.** A **network-effect moat**: more consented contribution → better decisioning → higher incremental lift → more take, with a possible **contribution rev-share** (merchants earn against the lift their signal generates elsewhere). Match-rate recovery is directly monetizable — it's the difference between an activatable audience and a wasted one.

**Domain framing.** New bounded context **"Intent Cooperative."** New language / events: `ConsentedContributionAdmitted`, `CooperativeSignalDerived`, `ContributionCredited`, `MatchRateRecovered`, `ContributionRevoked→LineagePurged`. **Determinism & safety:** **consent lineage and contribution accounting are deterministic and revocable** — every derived signal traces to a consented source, and revocation provably purges downstream use (a replayable audit certifies "no revoked signal influenced any decision after time T"). Privacy thresholds (minimum-cohort, aggregation) are hard, deterministic gates.

**How a holdout proves it.** Contributor vs. non-contributor partners as arms; measure the **incremental-lift delta attributable to cooperative signal** — and separately prove, by replay, that revoked contributions left no residue.

**Honest risk.** The hardest *trust* sell here: competitively sensitive merchants may refuse to contribute signal that could help rivals, and antitrust/privacy scrutiny of any cross-party data pooling is real. This must be strictly **consented, first-party, revocable** — explicitly *not* web-scraping of users — which narrows contribution and raises the consent-engineering cost. Cold-start (a cooperative with few members has little edge) is a genuine chasm.

---

### 5. Assurance & Settlement — turn verified incremental lift into a portable credential and an outcome-based pricing rail [HYPOTHESIS]

**Thesis.** Make incrementality-proven lift a **portable, verifiable credential** that advertisers present to finance/audit — and build the **settlement layer** on top: outcome-based contracts where advertisers pay against *certified* incremental lift, not impressions.

**Verified signal.** Rokt frames incrementality as measurable by "comparing behavior with and without relevant interventions" (G2) and is publicly standardizing on incrementality (prior docs' verified Haus experiments; Incrementality Performance Standard). Brain v4's decisioning scale (G4) is the supply side; the demand side wants *provable* outcomes.

**Revenue mechanism.** **Premium measurement-assurance** (advertisers pay for a trust-minimized lift certificate) *and*, more ambitiously, a **new pricing model** — guaranteed-incremental / pay-for-verified-lift contracts that command higher take and differentiate Rokt from every CPM network. Verified lift becomes the *unit of account*.

**Domain framing.** New bounded context **"Assurance & Settlement"** (built *above* doc-26 #8's clean-room lift certificate and #1's WHS ledger). New language / events: `LiftCertificateIssued`, `SettlementTriggered`, `GuaranteedIncrementalMet|Missed`, `ClawbackApplied`. **Determinism & safety:** the certificate and settlement math are **deterministic, versioned, tamper-evident, and holdout-derived** — settlement can only fire on a certificate that binds {method version, consent-state snapshot, WHS-integrity ref, cohort sizes}; it **fails closed** (no valid certificate → no settlement). No model in the settlement path.

**How a holdout proves it.** The certificate *is* the holdout output. The *product* bet is proven by whether **certified-lift contracts win budget share** vs. CPM/CPA at equal or better realized ROI — a commercial holdout, not a claimed number.

**Honest risk.** Outcome-based pricing **shifts revenue risk onto Rokt** (guarantee a lift, eat the miss) and demands near-total trust in the measurement — a single disputed certificate is reputationally expensive. Doc 26 #8 already covers the *computation*; the novel and riskier part here is the **commercial/settlement model**, which may simply be premature if advertisers still prefer managed-service trust over verifiable contracts.

---

### 6. Unified Moment OS — one decisioning brain across checkout + rewards + onsite media + post-purchase, sold to the converging commerce-media team [HYPOTHESIS]

**Thesis.** Rokt's own trend call is that commerce and media teams **converge** to run "checkout, loyalty, onsite media, and customer experience holistically" (G3, trend 3). The domain evolution is a **Unified Moment** context that optimizes the *whole* shopper journey as one P&L with one brain — sold as an integrated operating layer to exactly that converged team.

**Verified signal.** G3 trend 3 (holistic management of checkout/loyalty/onsite media/CX) and the Modern Commerce Stack's Decisioning/Experience split (G1); the Transaction Moment drives "over 90% of ancillary revenue potential" (G7) — the prize for owning the unified surface is explicitly large.

**Revenue mechanism.** **Land-and-expand across surfaces** — each partner monetizes checkout offer + Shopper Rewards + onsite media + post-purchase through one Rokt layer, growing Rokt's share of that 90%+ ancillary potential and raising switching cost. One integration, many monetizable surfaces.

**Domain framing.** New bounded context **"Unified Moment"** (orchestration above the per-surface contexts). New language / events: `UnifiedMomentComposed`, `SurfaceArbitrated`, `JourneyPolicyApplied`, `MomentPnLAttributed`. **Determinism & safety:** **surface arbitration and global constraint composition are deterministic** — the doc-26 #6 Cross-Surface Exposure/Frequency integrity layer is the *substrate* (global frequency, consent, WHS exclusion composed correctly across surfaces); this idea is the **revenue/orchestration product** that sits on that safety floor. Arbitration invariants (a shopper is one person; global caps hold) are enforced deterministically.

**How a holdout proves it.** Unified-decisioning vs. siloed-per-surface as arms; measure **total incremental revenue per shopper journey** and cross-surface fatigue — the claim is that one brain beats the sum of siloed ones, and only the holdout can say so.

**Honest risk.** Enormous org and serving-architecture complexity — internal surfaces likely have separate P&Ls and teams, so "one brain, one journey" is as much a political bet as a technical one. If surfaces are near-independent, unification adds coordination cost without proportional lift. This is a multi-year platform bet, not a quarter's work.

---

### 7. Agent Consideration Surface — win the cart *before* checkout, in the agent's comparison step [HYPOTHESIS · genuinely non-obvious]

**Thesis.** Agent commerce's real 2026 center of gravity moved **upstream** — to *product discovery and comparison* (OpenAI pivoted ACP from checkout to discovery with Walmart/Target/Sephora/Nordstrom/Best Buy/Lowe's/Wayfair — G6). A new bounded context sits *before* the Transaction Moment: **decisioning which incremental offer or reward a merchant surfaces into an agent's comparison to win the cart.** Rokt extends from "close the moment" to "shape the consideration set that leads to the moment."

**Verified signal.** G6 — agents now *research and compare*, and the surviving ACP surface is **discovery**, not checkout; Rokt's Decisioning Layer is defined independently of where the experience renders (G1), so it can serve a pre-transaction agent query.

**Revenue mechanism.** A **brand-new surface with new demand**: advertisers bid to be the incrementality-proven **consideration offer** an agent sees (e.g., "add this reward/bundle and this cart wins"). It moves Rokt's decisioning earlier in the funnel where the cart is actually decided — net-new inventory that today has *no* Rokt presence, and a hedge if checkout itself gets commoditized by the agent rails.

**Domain framing.** New bounded context **"Agent Consideration."** New language / events: `AgentQueryReceived`, `ConsiderationOfferDecisioned`, `CartInfluenceBidPlaced`, `AgentReceiptIssued`, `MisrepresentationBlocked`. **Determinism & safety:** offers surfaced to an agent must be **provably truthful and mandate/consent-bounded** — a deterministic boundary blocks any misrepresentation to the agent (wrong price/terms) and fails closed to "no consideration offer" if truthfulness or consent can't be verified. Determinism lives in the *truthfulness + envelope* gate; the Brain proposes within it.

**How a holdout proves it.** Agents that receive Rokt-decisioned consideration offers vs. a holdout that doesn't; measure **incremental cart-win rate for the funding brand** and **incremental conversion for the host merchant** — per agent platform, since consideration behavior differs by agent.

**Honest risk.** This is a **land-grab against the agent platforms' own layers** (Google/OpenAI/UCP each want to own discovery) — Rokt could be structurally locked out of the agent's consideration step. Consideration-stage economics are even less proven than checkout, and if agents optimize purely on price, an "incremental offer" may have no room to influence the set. High-ceiling, high-uncertainty.

---

### 8. Reward Economy — a two-sided in-purchase rewards marketplace where brands fund acquisition currency the Brain places at checkout [HYPOTHESIS]

**Thesis.** Loyalty is moving from post-purchase to **"in-purchase"** (G3, trend 4). The domain evolution is to turn rewards into a **programmable two-sided economy**: brands seeking new customers *fund* rewards that are redeemed at *other* merchants' checkouts, and the Brain decisions the optimal reward to place in-purchase — rewards become a cross-brand **acquisition currency** transacted at the Transaction Moment.

**Verified signal.** Shopper Rewards / Gift with Purchase already issue "discount, cashback, or gift card … by completing a simple action during checkout" (G8), and Rokt explicitly forecasts loyalty shifting to in-purchase engagement (G3, trend 4). The primitive exists; the *marketplace* is the bet.

**Revenue mechanism.** **New demand + marketplace take.** Funding brands buy incremental customer acquisition by underwriting rewards; host merchants get a conversion-lifting reward at no direct cost; Rokt earns take on the reward economy and matches funders to moments via the Brain. It's a marketplace, not a feature — two-sided, with its own liquidity.

**Domain framing.** New bounded context **"Reward Economy."** New language / events: `RewardFunded`, `RewardOfferDecisioned`, `RedemptionCommitted`, `AcquisitionCredited`, `EconomyBalanceReconciled`. **Determinism & safety:** the economy's **balance, settlement, and exactly-once issuance are deterministic and reconciled** — doc-26 #4's Reward Liability Idempotency/Reconciliation is the *substrate* (no double-issue, no orphan; `earned == issued == redeemable`); this idea is the **marketplace/demand product** on that money-correct floor. Reward *eligibility* fails closed; anti-arbitrage rules are deterministic gates.

**How a holdout proves it.** Reward-economy placements vs. a holdout with none; measure **incremental acquisition for the funding brand** *and* **incremental conversion for the host merchant** — a reward only "works" if it's incremental on both sides, provable only by holdout.

**Honest risk.** Two-sided marketplace **cold-start** (no funders → no rewards → no hosts) is the classic chasm, and reward economies invite **arbitrage/gaming** (self-dealing, reward farming). Funding-brand ROI must be provably incremental or funders churn fast. And it competes with merchants' own loyalty programs, which may resist a cross-brand currency at their checkout.

---

## Cross-cutting pattern (why these hang together)

Where doc 26 built **assurance layers**, this doc builds **revenue surfaces** — but on the same DNA. Every one of the eight is a **new market or objective wrapped around Rokt's incrementality-proven Decisioning Layer**, where the *money* is probabilistic/marketplace and the *trust* is deterministic, fail-closed, consent-scoped, and holdout-proven:

- **Agentic expansion** (1 Agent Offer Exchange, 7 Agent Consideration) — extend the decision to where agents shop, upstream *and* at checkout.
- **New objective** (2 Attention Yield, 3 Future-Value) — monetize *restraint* and *future value*, not just the next impression — both grounded in Rokt's own 2026 words.
- **Network & assurance** (4 Intent Cooperative, 5 Assurance & Settlement) — a data-network-effect moat and lift-as-a-unit-of-account.
- **Unification & economy** (6 Unified Moment, 8 Reward Economy) — one brain across surfaces; rewards as a two-sided acquisition currency.

The senior-engineer "I hadn't framed it that way" reframes:
- **Suppression is inventory** — the decision *not to show* is a priced, yield-managed product (G2 verified; idea 2).
- **The agent's comparison step, not just its checkout, is a Rokt surface** — win the cart before the moment (G6 verified; idea 7).
- **Verified lift can be a unit of account** — settle contracts on certified incrementality, not impressions (idea 5).
- **Rokt is positioned to be the decision layer agent rails don't have** — protocol-agnostic, incrementality-proven (G1 + G6; idea 1).

## Honesty

All eight are **starting hypotheses** to validate with a Rokt engineer and, above all, with a **holdout** — never a claimed lift. Verified Rokt/industry facts are cited (G1–G8) and separated from my inference (everything below each **Signal** line). No fabricated metrics, no claimed partnerships, no assertion that Rokt lacks any of this. Several ideas deliberately sit on doc-26 safety substrates (mandate verifier → 1; cross-surface integrity → 6; reward idempotency → 8; clean-room certificate → 5) and say so — the contribution here is the **revenue/domain framing** above those floors, plus the two genuinely non-obvious bets (Attention Yield, Agent Consideration) that few would list first.
