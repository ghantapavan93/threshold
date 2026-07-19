/* ────────────────────────────────────────────────────────────────────────────
   The Horizon — the eight future bounded-context HYPOTHESES, transcribed from
   research/rokt/28_FUTURE_DOMAIN_EVOLUTION.md (G1–G8). Sequenced as a rising
   four-movement arc (spec §2). No fabricated metric: every number is a cited
   G-fact or an experiment description; each idea is tagged HYPOTHESIS.
   ──────────────────────────────────────────────────────────────────────────── */

export type Movement = "I" | "II" | "III" | "IV";

export type Hypothesis = {
  id: string;
  h: string; // H-01
  arc: number; // 1..8
  movement: Movement;
  name: string;
  thesis: string;
  revenue: string;
  holdout: string;
  signal: string; // verified public, with G-refs
  events: string[];
  risk: string;
  substrate: string; // attaches at the edge via … / shipped substrate
};

export const MOVEMENTS: { key: Movement; eyebrow: string; line: string }[] = [
  { key: "I", eyebrow: "Movement I", line: "The moment learns restraint." },
  { key: "II", eyebrow: "Movement II", line: "The moment reaches the agents." },
  { key: "III", eyebrow: "Movement III", line: "The moment becomes a network." },
  { key: "IV", eyebrow: "Movement IV", line: "The moment becomes the unit of account." },
];

export const HYPOTHESES: Hypothesis[] = [
  {
    id: "attention-yield",
    h: "H-01",
    arc: 1,
    movement: "I",
    name: "Attention Yield",
    thesis: "Sell the decision not to show — suppression as yield-managed inventory.",
    revenue:
      "A premium “clean moment” tier a partner pays for on its highest-value shoppers, plus attention-yield optimization: not burning a high-LTV shopper on a low-value offer raises long-run incremental revenue per shopper. Suppression stops being forgone revenue and becomes managed yield.",
    holdout:
      "Hold out the suppression logic; compare long-run (≈90-day) incremental revenue per shopper and offer-fatigue rates between suppression-on and suppression-off cohorts. Validated only if showing less provably makes more over the horizon.",
    signal:
      "G2 — Rokt: “Suppression becomes as valuable as exposure … unlocking incremental revenue.” G3 trend 5 — restraint / white space as a 2026 advantage.",
    events: ["MomentValueEstimated", "SuppressionDecided", "AttentionBudgetDebited", "ForgoneImpressionPriced", "FatigueCostAccrued"],
    risk: "Forgone short-term revenue against an uncertain long-term gain; the proof horizon is long and the LTV signal is noisy, so the holdout may stay underpowered for quarters.",
    substrate: "A deterministic, audited suppression policy — Threshold's silent-widening scrutiny applies: a suppression edit is exactly a policy change.",
  },
  {
    id: "future-value",
    h: "H-02",
    arc: 2,
    movement: "I",
    name: "Future-Value Decisioning",
    thesis: "Optimize the moment for predicted incremental lifetime value, not the next click.",
    revenue:
      "Unlocks value-based pricing: partners pay for incremental value delivered (retained, higher-LTV customers) rather than CPA/CPM — a higher, more defensible take no impression-based network can match. It also justifies suppression (H-01).",
    holdout:
      "Value-optimized vs. conversion-optimized decisioning as parallel arms; measure 90-day incremental value per exposed cohort (repeat purchase, retention, margin), not immediate conversion. The holdout is the only truth.",
    signal:
      "G2 — the Transaction Moment “generates some of the most predictive signals for future value.” G3 trend 2 — smarter first-party signals over impression volume.",
    events: ["FutureValueEstimated", "ConsentScopedSignalAdmitted", "ValueContributionAttributed", "SignalRevoked→SignalExcluded"],
    risk: "LTV attribution is long-horizon and noisy; a value objective can lose on the immediate-conversion metric partners buy on today, and consent-scoping legitimately shrinks the usable signal.",
    substrate: "A consent-scoping boundary, deterministic and fail-closed — FUTURE_VISION Milestone E consent-aware replay.",
  },
  {
    id: "agent-consideration",
    h: "H-03",
    arc: 3,
    movement: "II",
    name: "Agent Consideration Surface",
    thesis: "Win the cart before checkout, in the agent's comparison step.",
    revenue:
      "A brand-new surface with new demand: advertisers bid to be the incrementality-proven consideration offer an agent sees. It moves Rokt's decisioning earlier in the funnel where the cart is actually decided — net-new inventory with no Rokt presence today, and a hedge if checkout is commoditized by agent rails.",
    holdout:
      "Agents that receive Rokt-decisioned consideration offers vs. a holdout that doesn't; measure incremental cart-win rate for the funding brand and incremental conversion for the host merchant — per agent platform.",
    signal:
      "G6 — OpenAI pivoted ACP from checkout to discovery (Walmart / Target / Sephora / Best Buy / Wayfair). G1 — Rokt's Decisioning Layer is defined independently of where the experience renders.",
    events: ["AgentQueryReceived", "ConsiderationOfferDecisioned", "CartInfluenceBidPlaced", "AgentReceiptIssued", "MisrepresentationBlocked"],
    risk: "A land-grab against the agent platforms' own discovery layers; consideration-stage economics are even less proven than checkout, and if agents optimize purely on price an incremental offer may have no room.",
    substrate: "A truthfulness + envelope gate — the same fail-closed contract as the shipped verdict; fails closed to no consideration offer.",
  },
  {
    id: "agent-offer-exchange",
    h: "H-04",
    arc: 4,
    movement: "II",
    name: "Agent Offer Exchange",
    thesis: "Become the incrementality-proven offer-decision API that shopping agents call.",
    revenue:
      "A new demand surface: Rokt Network advertiser demand meets agent supply. Rokt earns incremental take on agent-mediated conversions it decisions, and opens inventory that has no Rokt presence today — the decision layer the agent rails don't have.",
    holdout:
      "Randomize agent carts into decisioned vs. un-decisioned at the mediation boundary; measure incremental conversion / revenue per agent channel — reported per protocol (UCP vs ACP-discovery), because they are different causal objects.",
    signal:
      "G6 — UCP checkout is live at Nike / Sephora / Target / Walmart; Adyen Agentic brokers across UCP / ACP / AP2. G1 — Decisioning Layer vs Experience Layer split.",
    events: ["AgentSessionOpened", "MandateEnvelopeReceived", "OfferBidRequested", "OfferDecisioned", "DecisionReceiptIssued", "OfferDeclined"],
    risk: "Agent-checkout economics are unproven (ACP's Instant Checkout died in ~5 months); the agent platforms may build their own decision layer. Target the stable abstraction (a signed-mandate + offer-decision contract), not one wire format.",
    substrate: "A mandate-conformance boundary + tamper-evident DecisionReceipt — doc-26 #2 Mandate Verifier; the core stays deterministic, fail-closed.",
  },
  {
    id: "intent-cooperative",
    h: "H-05",
    arc: 5,
    movement: "III",
    name: "Consented Intent Cooperative",
    thesis: "A first-party signal co-op with a data-network-effect moat.",
    revenue:
      "A network-effect moat: more consented contribution → better decisioning → higher incremental lift → more take, with a possible contribution rev-share. Match-rate recovery is directly monetizable — the difference between an activatable audience and a wasted one.",
    holdout:
      "Contributor vs. non-contributor partners as arms; measure the incremental-lift delta attributable to cooperative signal — and separately prove, by replay, that revoked contributions left no residue.",
    signal:
      "G3 trend 2 — “smarter signals replace more impressions,” built on first-party data. G5 — the Performance Engine explicitly targets “eroding match rates.”",
    events: ["ConsentedContributionAdmitted", "CooperativeSignalDerived", "ContributionCredited", "MatchRateRecovered", "ContributionRevoked→LineagePurged"],
    risk: "The hardest trust sell: competitively sensitive merchants may refuse to contribute; antitrust/privacy scrutiny of any cross-party pooling is real. Strictly consented, first-party, revocable — and cold-start is a genuine chasm.",
    substrate: "Deterministic consent lineage + revocation purge — a replayable audit certifies “no revoked signal influenced any decision after time T.”",
  },
  {
    id: "reward-economy",
    h: "H-06",
    arc: 6,
    movement: "III",
    name: "Reward Economy",
    thesis: "A two-sided in-purchase rewards marketplace; rewards as acquisition currency.",
    revenue:
      "New demand + marketplace take: funding brands underwrite rewards redeemed at other merchants' checkouts; host merchants get a conversion-lifting reward at no direct cost; Rokt earns take and matches funders to moments via the Brain. A marketplace, not a feature.",
    holdout:
      "Reward-economy placements vs. a holdout with none; measure incremental acquisition for the funding brand and incremental conversion for the host merchant — a reward only works if it's incremental on both sides.",
    signal:
      "G8 — Shopper Rewards / Gift with Purchase already issue rewards at checkout. G3 trend 4 — loyalty shifting to in-purchase engagement.",
    events: ["RewardFunded", "RewardOfferDecisioned", "RedemptionCommitted", "AcquisitionCredited", "EconomyBalanceReconciled"],
    risk: "Two-sided cold-start (no funders → no rewards → no hosts) and reward arbitrage / gaming; funding-brand ROI must be provably incremental or funders churn; competes with merchants' own loyalty programs.",
    substrate: "Exactly-once issuance, reconciled balance — doc-26 #4 Reward Idempotency / Reconciliation (earned == issued == redeemable only if proven).",
  },
  {
    id: "unified-moment-os",
    h: "H-07",
    arc: 7,
    movement: "IV",
    name: "Unified Moment OS",
    thesis: "One brain across checkout + rewards + onsite media + post-purchase.",
    revenue:
      "Land-and-expand across surfaces: each partner monetizes checkout offer + Shopper Rewards + onsite media + post-purchase through one Rokt layer, growing Rokt's share of that 90%+ ancillary potential and raising switching cost. One integration, many monetizable surfaces.",
    holdout:
      "Unified-decisioning vs. siloed-per-surface as arms; measure total incremental revenue per shopper journey and cross-surface fatigue — the claim is that one brain beats the sum of siloed ones.",
    signal:
      "G3 trend 3 — commerce and media teams converge to run the moment holistically. G7 — the Transaction Moment drives “over 90% of ancillary revenue potential.”",
    events: ["UnifiedMomentComposed", "SurfaceArbitrated", "JourneyPolicyApplied", "MomentPnLAttributed"],
    risk: "Enormous org and serving-architecture complexity — surfaces likely have separate P&Ls and teams, so one brain, one journey is as much a political bet as a technical one. A multi-year platform bet.",
    substrate: "Deterministic surface arbitration + global constraint composition — doc-26 #6 Cross-Surface Exposure / Frequency integrity.",
  },
  {
    id: "assurance-settlement",
    h: "H-08",
    arc: 8,
    movement: "IV",
    name: "Assurance & Settlement",
    thesis: "Turn verified incremental lift into a portable credential and settle contracts on it.",
    revenue:
      "Premium measurement-assurance (a trust-minimized lift certificate) and, more ambitiously, a new pricing model: guaranteed-incremental / pay-for-verified-lift contracts that command higher take and differentiate Rokt from every CPM network. Verified lift becomes the unit of account.",
    holdout:
      "The certificate is the holdout output. The product bet is proven by whether certified-lift contracts win budget share vs. CPM/CPA at equal or better realized ROI — a commercial holdout, not a claimed number.",
    signal:
      "G2 — incrementality measurable by “comparing behavior with and without relevant interventions.” The Incrementality Performance Standard (verified Haus experiments).",
    events: ["LiftCertificateIssued", "SettlementTriggered", "GuaranteedIncrementalMet|Missed", "ClawbackApplied"],
    risk: "Outcome-based pricing shifts revenue risk onto Rokt (guarantee a lift, eat the miss) and demands near-total trust in the measurement — a single disputed certificate is reputationally expensive; may be premature if advertisers prefer managed-service trust.",
    substrate: "A holdout-derived, tamper-evident certificate — doc-26 #8 clean-room certificate; the WHS ledger.",
  },
];

export const OPENING_BRIDGE = {
  eyebrow: "The moment we already hold",
  lines: [
    "The pure deterministic engine (app/domain/*), enforced by an AST fitness test.",
    "The tamper-evident HMAC audit spine.",
    "The real transactional outbox + draining worker (outbox.py, test_outbox.py, GET /replay-jobs/{id}/outbox).",
    "The holdout-only verdict — eligibility, never “safe to launch.”",
  ],
  hero: "Everything past this line is a hypothesis. Everything before it runs.",
};

export const CLOSING_BRIDGE = {
  eyebrow: "Every horizon attaches at the edges",
  rows: HYPOTHESES.map((h) => ({ name: h.name, substrate: h.substrate })),
  line:
    "The core never learns, never calls an LLM, never joins the serving path. The money is probabilistic; the trust is deterministic. That is the one invariant the horizon does not move.",
};
