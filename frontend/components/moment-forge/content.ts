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
      "Treat the three as one field and partial failures make them silently diverge: earned-but-never-issued (an orphan → churn), or issued twice from one earn (double liability), or an expired/clawed-back reward spent as if still a right. “earned == issued == redeemable” only holds if a replay proves it — and the live figure below does: issued ≠ redeemable, every illegal redemption refused.",
  },
];

// ── Laws of the Moment ───────────────────────────────────────────────────────
// The law statements + proofs now live in the backend prover (app/domain/laws.py)
// and render live via GET /laws in <LawsBoard>. Only the scenario mapping stays
// here — it tells the board which laws can be re-run in the Simulator.

/** Laws with a real seeded scenario are executable — clicking runs it live in the
 *  Simulator. Keyed by law number. Laws not listed here have no single scenario. */
export const LAW_SCENARIOS: Record<string, "trap" | "safe" | "fatfinger" | "consent" | "immutable"> = {
  "02": "safe", // Holdout is the only causal mechanism → clean change is eligible
  "05": "immutable", // Immutable policy versions → US→CA needs reapproval
  "07": "consent", // Single enforcement point for hard constraints → consent guard
  "08": "trap", // Missing-attribute safety → the inversion
  "14": "fatfinger", // Plausibility guard → age typed as 2
};

// ── The seven real policy operators (for the inline rule editor) ─────────────
export type OperatorInfo = { op: string; label: string; note: string };
export const OPERATORS: OperatorInfo[] = [
  { op: "equals", label: "equals", note: "present AND value equals exactly" },
  { op: "not_equals", label: "not equals", note: "present AND value differs" },
  { op: "gte", label: "≥ (at least)", note: "numeric lower bound" },
  { op: "lte", label: "≤ (at most)", note: "numeric upper bound" },
  { op: "in", label: "in", note: "present AND value in the list" },
  { op: "include_is_not_in", label: "include · is not in", note: "MISSING → EXCLUDED (conservative)" },
  { op: "exclude_is_in", label: "exclude · is in", note: "MISSING → INCLUDED (the trap)" },
];

// ── Tactical detail per bounded context (strategic ↔ tactical ↔ live) ─────────
// Sourced from research/rokt/27_DDD_DOMAIN_MODEL.md (§2 model boundaries, §5
// domain events, §6 invariants) and docs/MOMENT_FORGE_ALGORITHMS.md. Constraint
// keys marked `live` are enforced by the real engine (they appear in replay output).
export type TacticalConstraint = { key: string; note: string; live: boolean };
export type Tactical = {
  aggregate: string;
  invariants: string[];
  events: string[];
  constraints: TacticalConstraint[];
};

export const TACTICAL: Record<string, Tactical> = {
  decisioning: {
    aggregate: "Candidate → NextBestAction (incl. the null “show nothing” candidate)",
    invariants: [
      "Deterministic evaluation: a pure function of (event-time snapshot, policy).",
      "Suppression is a decision, not an absence — every No Offer records why.",
    ],
    events: ["OfferSelected", "NoOfferRendered", "PlacementFailed"],
    constraints: [
      { key: "evaluator", note: "the pure offer / no_offer decision function", live: true },
    ],
  },
  consent: {
    aggregate: "EligibilityRule · ConsentState (noFunctional / noTargeting)",
    invariants: [
      "Single enforcement point for all hard constraints; a FAIL blocks release.",
      "A sensitive attribute without consent_required fails closed.",
    ],
    events: ["PlacementRequested"],
    constraints: [
      { key: "consent", note: "sensitive attribute requires consent", live: true },
      { key: "brand_safety", note: "brand-safety gate", live: true },
      { key: "frequency_cap", note: "impression cap", live: true },
    ],
  },
  changesafety: {
    aggregate: "PolicyVersion (immutable) · PolicyDiff · Verdict · AuditTrail",
    invariants: [
      "Immutable policy versions; every decision references exactly one.",
      "Missing-attribute safety: the inversion is isolated by counterfactual.",
      "Append-only, tamper-evident audit (per-record HMAC).",
    ],
    events: ["PolicyChangeSubmitted", "PolicyChangeBlocked", "PolicyChangeEligibleForHoldout", "RequiresReapprovalDetected"],
    constraints: [
      { key: "missing_attribute_semantics", note: "counterfactual inversion check", live: true },
      { key: "immutable_field_guard", note: "protected fields (country, offer id…)", live: true },
      { key: "requires_reapproval", note: "material-term change re-enters the queue", live: true },
      { key: "plausibility", note: "implausible values (fat-finger) rejected", live: true },
    ],
  },
  measurement: {
    aggregate: "ConversionEvent · AttributionMatch · DedupKey (conversiontype:confirmationref)",
    invariants: [
      "Effectively-once financial state over at-least-once delivery.",
      "“Conversion” here means a deduplicated recorded event — not incremental lift.",
    ],
    events: ["ConversionRecorded", "ConversionDeduplicated", "IntegrationDriftDetected"],
    constraints: [],
  },
  incrementality: {
    aggregate: "Experiment · HoldoutAssignment · WHSMember · LiftEstimate",
    invariants: [
      "The holdout is the only causal mechanism; a verdict is only eligibility for it.",
      "WHS exclusion is global and permanent — fail-closed if the ledger can't confirm.",
    ],
    events: ["WHSMemberAssigned", "HeldOutMemberExcluded", "HoldoutMemberLeaked"],
    constraints: [
      { key: "holdout_required", note: "a holdout is mandatory", live: true },
      { key: "support-guard (ope.py)", note: "refuses to estimate on thin support", live: true },
    ],
  },
  loyalty: {
    aggregate: "RewardLedger (EarnedReward · IssuedReward · RedeemableReward)",
    invariants: [
      "“earned == issued == redeemable” only if a reconciliation replay proves it.",
      "Reward issuance is a booked liability with exactly-once semantics.",
    ],
    events: ["RewardEarned", "RewardIssued", "RewardRedeemed"],
    constraints: [],
  },
  agent: {
    aggregate: "AgentMandate {Intent, Cart, Payment} · AuthorizedActionEnvelope",
    invariants: [
      "A signed mandate bounds the offer decision; fail-closed to the consent-safe default.",
      "Model to the stable abstraction (a signed envelope), not one wire protocol.",
    ],
    events: ["MandateVerified", "MandateRejected"],
    constraints: [],
  },
};
