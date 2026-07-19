/* ────────────────────────────────────────────────────────────────────────────
   Moment Forge — domain content, sourced from research/rokt/27_DDD_DOMAIN_MODEL.md
   and 28_FUTURE_DOMAIN_EVOLUTION.md. Structure only; the render lives in the
   components. Names/patterns are modelling choices ([INFERENCE]); the seams are
   [VERIFIED-PUBLIC]. Nothing here fabricates numbers.
   ──────────────────────────────────────────────────────────────────────────── */

export type PatternKey =
  | "ACL"
  | "OpenHost"
  | "Conformist"
  | "CustomerSupplier"
  | "Partnership"
  | "SharedKernel"
  | "Published"
  | "SeparateWays";

export type PatternDef = {
  key: PatternKey;
  name: string;
  glyph: string;
  /** stroke dash pattern; "" = solid */
  dash: string;
  /** token color var */
  accent: string;
  line: "single" | "double" | "thick";
  oneLiner: string;
};

export const PATTERNS: Record<PatternKey, PatternDef> = {
  ACL: {
    key: "ACL",
    name: "Anticorruption Layer",
    glyph: "▛",
    dash: "",
    accent: "var(--c-teal)",
    line: "single",
    oneLiner: "downstream translates the supplier's model, refusing to be corrupted by it.",
  },
  OpenHost: {
    key: "OpenHost",
    name: "Open-Host Service",
    glyph: "⌾",
    dash: "",
    accent: "var(--c-offer-blue)",
    line: "double",
    oneLiner: "supplier publishes a stable, general protocol for many consumers.",
  },
  Published: {
    key: "Published",
    name: "Published Language",
    glyph: "≋",
    dash: "",
    accent: "var(--c-offer-blue)",
    line: "double",
    oneLiner: "a shared, documented interchange schema many producers write and one reads.",
  },
  Conformist: {
    key: "Conformist",
    name: "Conformist",
    glyph: "→",
    dash: "1 0",
    accent: "var(--c-amber)",
    line: "single",
    oneLiner: "downstream conforms to the upstream model as-is (no ACL) — the fragile default.",
  },
  CustomerSupplier: {
    key: "CustomerSupplier",
    name: "Customer–Supplier",
    glyph: "⇄",
    dash: "",
    accent: "var(--c-teal)",
    line: "single",
    oneLiner: "negotiated priorities; the supplier serves a customer that holds some veto.",
  },
  Partnership: {
    key: "Partnership",
    name: "Partnership",
    glyph: "⧓",
    dash: "",
    accent: "var(--c-teal)",
    line: "thick",
    oneLiner: "two contexts succeed or fail together; coordinated, co-governed change.",
  },
  SharedKernel: {
    key: "SharedKernel",
    name: "Shared Kernel",
    glyph: "▤",
    dash: "6 4",
    accent: "var(--c-amber)",
    line: "thick",
    oneLiner: "a small shared model both teams jointly own — high coupling, flagged.",
  },
  SeparateWays: {
    key: "SeparateWays",
    name: "Separate Ways",
    glyph: "∥",
    dash: "2 6",
    accent: "var(--c-muted)",
    line: "single",
    oneLiner: "intentionally no integration.",
  },
};

export type BC = {
  id: string;
  code: string; // BC-1
  name: string;
  kind: "core" | "supporting" | "generic" | "emerging";
  responsibility: string;
  language: string[];
  x: number;
  y: number;
};

// Deterministic, hand-authored layout on a 960×600 blueprint (Core center).
export const CONTEXTS: BC[] = [
  {
    id: "decisioning",
    code: "BC-1",
    name: "Decisioning / Brain",
    kind: "core",
    responsibility:
      "Decide whether and which offer to surface (including “show nothing”), ranked by expected incremental value under latency and constraint budgets.",
    language: ["relevance", "next best action", "candidate", "score / rank", "suppression"],
    x: 480,
    y: 300,
  },
  {
    id: "consent",
    code: "BC-6",
    name: "Consent / Eligibility",
    kind: "supporting",
    responsibility:
      "Resolve identity, enforce consent, and evaluate the hard eligibility / brand-safety / frequency constraints that scope who may be shown what.",
    language: ["eligible / ineligible", "include / exclude", "consent", "sensitive attribute", "frequency cap"],
    x: 168,
    y: 150,
  },
  {
    id: "changesafety",
    code: "BC-2",
    name: "Change-Safety (Threshold)",
    kind: "supporting",
    responsibility:
      "Before a policy change reaches a customer, prove it fails closed, preserves checkout, respects hard constraints, and is eligible only for a holdout.",
    language: ["policy version", "diff", "constraint result", "fail-closed proof", "verdict"],
    x: 150,
    y: 452,
  },
  {
    id: "measurement",
    code: "BC-5",
    name: "Integration / Measurement",
    kind: "supporting",
    responsibility:
      "Ingest conversion signals, attribute them to the originating decision, deduplicate, reconcile against partner systems, surface integration drift.",
    language: ["conversion (recorded)", "attribution", "match key", "reconciliation", "discrepancy"],
    x: 800,
    y: 168,
  },
  {
    id: "incrementality",
    code: "BC-3",
    name: "Incrementality / Holdout",
    kind: "core",
    responsibility:
      "Establish causal lift via controlled holdouts; assign and forever honor Would-Have-Seen membership; compute incremental revenue as treatment − control.",
    language: ["holdout", "control", "Would Have Seen", "persuadable", "uplift / Qini"],
    x: 792,
    y: 452,
  },
  {
    id: "loyalty",
    code: "BC-4",
    name: "Loyalty / Rewards",
    kind: "supporting",
    responsibility:
      "Define and honor reward economics at the moment — who earns, at what rate, who can redeem; issue rewards as financial liabilities with exactly-once semantics.",
    language: ["earn", "issue", "redeem", "tier", "liability"],
    x: 470,
    y: 552,
  },
  {
    id: "agent",
    code: "BC-7",
    name: "Agent-Mediation",
    kind: "emerging",
    responsibility:
      "When an LLM shopping agent is in the loop, verify its authorization envelope (AP2/ACP mandate chain), classify the mediation channel, check presentation integrity.",
    language: ["mandate", "envelope", "agent-mediated", "impression (degraded)", "conformance"],
    x: 150,
    y: 300,
  },
];

export type Edge = {
  from: string;
  to: string;
  pattern: PatternKey;
  why: string;
  /** true for the load-bearing dangerous seam (Shared Kernel that decays to Conformist) */
  danger?: boolean;
};

export const EDGES: Edge[] = [
  { from: "consent", to: "decisioning", pattern: "Published", why: "The eligibility rules are the published language the Brain consumes to scope candidates." },
  { from: "consent", to: "changesafety", pattern: "SharedKernel", danger: true, why: "The meaning of include_is_not_in vs exclude_is_in on MISSING values must be jointly owned — when it decays to an implicit Conformist, the Context Fracture opens." },
  { from: "changesafety", to: "decisioning", pattern: "ACL", why: "Threshold is an ACL for change itself — it refuses a translation that changes meaning before it reaches live decisioning." },
  { from: "decisioning", to: "measurement", pattern: "CustomerSupplier", why: "The Brain (supplier) produces decisions; Measurement (customer) consumes them and its drift alerts hold leverage." },
  { from: "measurement", to: "incrementality", pattern: "ACL", why: "Both say “conversion” — recorded-dedup vs causally-incremental. Without an ACL the lift number silently double-counts." },
  { from: "changesafety", to: "incrementality", pattern: "Partnership", why: "A positive verdict is only eligibility for a holdout — they co-govern release and cannot be decoupled." },
  { from: "incrementality", to: "loyalty", pattern: "Partnership", why: "“All future opportunities” for a WHS member now spans reward surfaces too — the exclusion kernel is jointly owned." },
  { from: "loyalty", to: "measurement", pattern: "ACL", why: "Reward earned/issued/redeemable must reconcile against recorded conversions without recording semantics defining liability." },
  { from: "agent", to: "decisioning", pattern: "ACL", why: "A signed mandate becomes a hard constraint on the offer decision; BC-7 conforms to a moving external standard, ACL into the core." },
];

// ── Ubiquitous-language collisions (the 3 the page runs through the Lens) ─────
export type Collision = {
  term: string;
  title: string;
  boundary: string;
  meanings: {
    context: string;
    gloss: string;
    connotation: string;
    shape: "gate" | "cart" | "record" | "coin" | "seal" | "ledger";
  }[];
  failure: string;
};

export const COLLISIONS: Collision[] = [
  {
    term: "include",
    title: "include / exclude — the missing-attribute inversion",
    boundary: "Consent / Eligibility  ↔  live Decisioning",
    meanings: [
      {
        context: "include_is_not_in",
        gloss: "Eligible only if the attribute is present and its value is not in the list. A MISSING attribute → EXCLUDED.",
        connotation: "conservative — absence keeps you out",
        shape: "gate",
      },
      {
        context: "exclude_is_in",
        gloss: "Excluded only if the attribute is present and in the list; otherwise eligible. A MISSING attribute → INCLUDED.",
        connotation: "permissive — absence lets you in",
        shape: "gate",
      },
    ],
    failure:
      "The two operators differ ONLY on MISSING values. Flipping them reads as cosmetic to a human and to a value-level diff — yet every session with no cc_bin silently flips from excluded to eligible. A silent eligibility-widening no test catches.",
  },
  {
    term: "conversion",
    title: "conversion — recorded vs revenue vs incremental",
    boundary: "Measurement  ↔  Incrementality  ↔  Loyalty",
    meanings: [
      {
        context: "Measurement",
        gloss: "A deduplicated recorded event, identity = conversiontype:confirmationref. Answers “have we already counted this?”",
        connotation: "bookkeeping — did it happen",
        shape: "record",
      },
      {
        context: "Loyalty",
        gloss: "A revenue / obligation event — a purchase that may earn a reward or create a liability.",
        connotation: "economic — what is owed",
        shape: "ledger",
      },
      {
        context: "Incrementality",
        gloss: "An incremental outcome — a conversion caused by the offer, net of who would-have-converted anyway.",
        connotation: "causal — did we cause it",
        shape: "seal",
      },
    ],
    failure:
      "Feed Measurement's recorded conversions straight into a lift calculation and you count non-incremental conversions as lift — the exact upward bias the incrementality standard exists to kill.",
  },
  {
    term: "reward",
    title: "reward — earned vs issued vs redeemable",
    boundary: "inside Loyalty, and Loyalty ↔ Measurement",
    meanings: [
      {
        context: "earned",
        gloss: "The shopper qualified for a reward by completing the action.",
        connotation: "a claim",
        shape: "coin",
      },
      {
        context: "issued",
        gloss: "The reward has been materialized (gift card generated, cashback posted) — a booked liability.",
        connotation: "a liability",
        shape: "ledger",
      },
      {
        context: "redeemable",
        gloss: "The reward is currently usable — not expired, not clawed back.",
        connotation: "a right",
        shape: "seal",
      },
    ],
    failure:
      "Treat the three as one field and partial failures make them silently diverge: earned-but-never-issued (an orphan → churn), or issued twice from one earn (double liability). “earned == issued == redeemable” is only true if a reconciliation replay proves it.",
  },
];

// ── Laws of the Moment (invariants) ──────────────────────────────────────────
export type Law = {
  n: string;
  title: string;
  body: string;
  motif: "failclosed" | "shield" | "widening" | "moment";
};

export const LAWS: Law[] = [
  { n: "01", title: "Checkout independence / fail-closed", body: "Checkout has zero synchronous dependency on the offer path; any offer-side failure resolves to No Offer Rendered. An offer is never produced on a failure path.", motif: "failclosed" },
  { n: "02", title: "Holdout is the only causal mechanism", body: "A positive change-safety verdict is eligibility for a controlled online holdout — never “safe to launch.” Replay filters known harms; it does not establish causal safety.", motif: "moment" },
  { n: "03", title: "Deterministic evaluation", body: "For a given (event-time snapshot, policy) the decision is a pure function — no I/O, randomness, or wall-clock — so replay is bit-for-bit reproducible.", motif: "shield" },
  { n: "04", title: "No future-information leakage", body: "Replay evaluates only the event-time snapshot captured on the session; it never joins a later or current profile.", motif: "shield" },
  { n: "05", title: "Immutable policy versions", body: "A published version's document never changes; every decision references exactly one version.", motif: "shield" },
  { n: "06", title: "Effectively-once financial state", body: "Conversions (and, extended, reward earn/redeem) dedupe on conversiontype:confirmationref; a repeated delivery updates state exactly once — over at-least-once delivery.", motif: "shield" },
  { n: "07", title: "Single enforcement point for hard constraints", body: "Eligibility, consent, brand-safety, frequency, latency, holdout and the missing-attribute check live in one deterministic validator; a FAIL blocks release.", motif: "widening" },
  { n: "08", title: "Missing-attribute safety", body: "An operator change that flips missing-value behaviour is isolated by counterfactual and blocks release when any replayed missing-attribute session is silently widened.", motif: "widening" },
  { n: "09", title: "Append-only, tamper-evident audit", body: "Every run appends HMAC-carrying records; verification localizes post-write modification — integrity, not truth.", motif: "shield" },
  { n: "10", title: "Idempotent jobs", body: "A repeated Idempotency-Key returns the same job; it is never re-run.", motif: "shield" },
  { n: "11", title: "Tenant scoping", body: "All queries scoped by merchant_id; one merchant's data is never returned for another.", motif: "shield" },
  { n: "12", title: "WHS exclusion is global and permanent", body: "Once a shopper is a Would-Have-Seen member, they are excluded from all future opportunities across all surfaces — append-only, exactly-once, fail-closed.", motif: "moment" },
  { n: "13", title: "Suppression is a decision, not an absence", body: "Every No Offer Rendered records why. A deliberate “show nothing” is a first-class, audited core output — distinct from an integration failure.", motif: "failclosed" },
];

// ── Future bounded-context hypotheses (doc 28) ───────────────────────────────
export type Hypothesis = {
  name: string;
  premise: string;
  reframe?: string;
  signal: string;
  risk: string;
};

export const FUTURE_FEATURED: Hypothesis[] = [
  {
    name: "Attention Yield",
    premise: "Monetize restraint — treat a shopper's finite attention as inventory to yield-manage, where suppressing a low-value offer to protect a high-value moment is a priced, measurable product.",
    reframe: "Suppression is inventory — the decision not to show is a priced, yield-managed product.",
    signal: "Rokt: “Suppression becomes as valuable as exposure … unlocking incremental revenue,” and names restraint a 2026 advantage.",
    risk: "Forgone short-term revenue against an uncertain long-term gain; the LTV proof horizon is long and the holdout may stay underpowered for quarters.",
  },
  {
    name: "Agent Consideration Surface",
    premise: "Win the cart before checkout — decision which incremental offer a merchant surfaces into an agent's comparison step, where the cart is actually decided.",
    reframe: "The agent's comparison step, not just its checkout, is a Rokt surface.",
    signal: "OpenAI pivoted ACP from checkout to discovery (Walmart / Target / Sephora / Best Buy …); Rokt's Decisioning Layer is defined independently of where the experience renders.",
    risk: "A land-grab against the agent platforms' own discovery layers; consideration-stage economics are even less proven than checkout.",
  },
  {
    name: "Agent Offer Exchange",
    premise: "Become the incrementality-proven offer-decision API that shopping agents call at cart assembly — the decisioning layer the agent rails don't have.",
    reframe: "Rokt is positioned to be the decision layer agent rails don't have — protocol-agnostic, incrementality-proven.",
    signal: "UCP checkout is live at Nike / Sephora / Target / Walmart; Adyen Agentic brokers across UCP / ACP / AP2.",
    risk: "Agent-checkout economics are unproven (ACP's Instant Checkout died in ~5 months). Target the stable abstraction — a signed-mandate + offer-decision contract — not one wire format.",
  },
];

export const FUTURE_COMPACT: Hypothesis[] = [
  {
    name: "Future-Value Decisioning",
    premise: "Optimize the moment for predicted incremental lifetime value, not the next click — using only consented first-party and contextual signals.",
    signal: "Rokt: the Transaction Moment “generates some of the most predictive signals for future value.”",
    risk: "LTV attribution is long-horizon and noisy; consent-scoping legitimately shrinks the usable signal.",
  },
  {
    name: "Consented Intent Cooperative",
    premise: "A consent-governed cooperative where merchants contribute first-party transaction signal into a shared, privacy-preserving intent graph — a data-network moat.",
    signal: "Rokt's Performance Engine explicitly targets “eroding match rates.”",
    risk: "Competitively sensitive merchants may refuse to contribute; cold-start and privacy scrutiny are real.",
  },
  {
    name: "Assurance & Settlement",
    premise: "Turn verified incremental lift into a portable credential and an outcome-based pricing rail — settle contracts on certified lift, not impressions.",
    signal: "Rokt is publicly standardizing on incrementality (Incrementality Performance Standard, Haus experiments).",
    risk: "Outcome-based pricing shifts revenue risk onto Rokt; a single disputed certificate is reputationally expensive.",
  },
  {
    name: "Unified Moment OS",
    premise: "One decisioning brain across checkout + rewards + onsite media + post-purchase, sold to the converging commerce-media team.",
    signal: "Rokt's own 2026 trend: commerce and media teams converge to run the moment holistically.",
    risk: "Enormous org and serving-architecture complexity; as much a political bet as a technical one.",
  },
  {
    name: "Reward Economy",
    premise: "A two-sided in-purchase rewards marketplace where brands fund acquisition currency the Brain places at checkout.",
    signal: "Shopper Rewards / Gift-with-Purchase already issue rewards at checkout; Rokt forecasts loyalty shifting in-purchase.",
    risk: "Two-sided cold-start and reward arbitrage/gaming; competes with merchants' own loyalty programs.",
  },
];

// ── Implementation-evidence cross-links (§9) ─────────────────────────────────
export type Evidence = { subject: string; where: string; kind: "SHIPPED" | "DESIGNED" };
export const EVIDENCE: Evidence[] = [
  { subject: "Missing-attribute inversion (Law 08)", where: "Console — Constraint Heatmap · constraints.py counterfactual", kind: "SHIPPED" },
  { subject: "Fail-closed / No Offer Rendered (Law 01, 13)", where: "Console — Fail-Closed Proof · failclosed.py", kind: "SHIPPED" },
  { subject: "Deterministic verdict (Law 02, 03)", where: "Console — Release Verdict · verdict.py", kind: "SHIPPED" },
  { subject: "Tamper-evident audit (Law 09)", where: "Console — Evidence Drawer · audit.py (HMAC)", kind: "SHIPPED" },
  { subject: "Effectively-once state (Law 06)", where: "Console — Conversion Integrity · conversions.py", kind: "SHIPPED" },
  { subject: "Transactional outbox / domain events (§5)", where: "Console — Fan-out & Outbox · outbox.py", kind: "SHIPPED" },
  { subject: "Semantic Change Compiler (§8)", where: "This page, Fig. 04 — POST /semantic-compile", kind: "SHIPPED" },
  { subject: "Domain Evolution Simulator", where: "This page, Fig. 07 — POST /simulations", kind: "SHIPPED" },
  { subject: "Scale-out (async / outbox / Kafka)", where: "Builder — Optimize & scale · Vision roadmap B", kind: "DESIGNED" },
  { subject: "Agent-mediation contexts (BC-7, future)", where: "Builder — Seams · this page, Fig. 08", kind: "DESIGNED" },
];
