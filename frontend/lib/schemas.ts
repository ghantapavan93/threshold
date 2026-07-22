import { z } from "zod";

/**
 * Zod schemas mirroring docs/API_CONTRACT.md (frozen v1) verbatim.
 * These validate EVERY response at the network boundary. TS types are inferred
 * from the schemas so the app never hand-writes a parallel type that can drift.
 */

// ---- Health ----------------------------------------------------------------
export const HealthSchema = z.object({
  status: z.string(),
  version: z.string(),
});
export type Health = z.infer<typeof HealthSchema>;

// ---- Policies --------------------------------------------------------------
export const PolicyListItemSchema = z.object({
  policy_version: z.string(),
  name: z.string(),
  created_at: z.string(),
});
export type PolicyListItem = z.infer<typeof PolicyListItemSchema>;
export const PolicyListSchema = z.array(PolicyListItemSchema);

export const RuleSchema = z.object({
  id: z.string(),
  attribute: z.string(),
  op: z.string(),
  // The engine's Rule.value is polymorphic: a scalar for equals/not_equals/gte/lte
  // (e.g. "premium", 25) and a list for the membership ops (in / include_is_not_in /
  // exclude_is_in). Accept both so GET /policies/{version} validates.
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))])
    .nullable()
    .optional(),
  sensitive: z.boolean().optional(),
  consent_required: z.boolean().optional(),
});
export type Rule = z.infer<typeof RuleSchema>;

export const PolicyDocumentSchema = z.object({
  policy_version: z.string(),
  merchant_id: z.string(),
  name: z.string(),
  latency_budget_ms: z.number(),
  fallback_action: z.string(),
  requires_holdout: z.boolean(),
  frequency_cap: z.object({
    max_impressions: z.number(),
    per_days: z.number(),
  }),
  offer: z.object({
    id: z.string(),
    category: z.string(),
  }),
  eligibility_rules: z.array(RuleSchema),
})
  // Preserve governance fields the schema doesn't enumerate (country, disclaimers,
  // language, objective, timezone, …). The inline rule editor round-trips this whole
  // document back to /simulations; stripping those fields would make the engine read
  // them as removed and trip spurious immutable-field / re-approval violations.
  .passthrough();
export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;

// ---- Policy diff -----------------------------------------------------------
export const DiffRiskSchema = z.enum([
  "missing_attribute_flip",
  "frequency_increase",
  "eligibility_widened",
  "eligibility_narrowed",
  "latency_increase",
]);
export type DiffRisk = z.infer<typeof DiffRiskSchema>;

export const DiffChangeKindSchema = z.enum(["added", "removed", "modified"]);

export const DiffChangeSchema = z.object({
  path: z.string(),
  kind: DiffChangeKindSchema,
  before: z.unknown().nullable().optional(),
  after: z.unknown().nullable().optional(),
  risk: DiffRiskSchema.nullable().optional(),
});
export type DiffChange = z.infer<typeof DiffChangeSchema>;

export const PolicyDiffSchema = z.object({
  changes: z.array(DiffChangeSchema),
  summary: z.object({
    added: z.number(),
    removed: z.number(),
    modified: z.number(),
  }),
});
export type PolicyDiff = z.infer<typeof PolicyDiffSchema>;

// ---- Constraint results ----------------------------------------------------
// INFO surfaces a deliberate, visible eligibility widening — a signal the verdict
// names and routes to the holdout, without gating on it (never a FAIL/WARN).
export const ConstraintResultValueSchema = z.enum(["PASS", "INFO", "WARN", "FAIL"]);
export type ConstraintResultValue = z.infer<typeof ConstraintResultValueSchema>;

export const ConstraintResultSchema = z.object({
  key: z.string(),
  result: ConstraintResultValueSchema,
  detail: z.string(),
  grounding: z.string(),
});
export type ConstraintResult = z.infer<typeof ConstraintResultSchema>;

// ---- Replay evaluations ----------------------------------------------------
export const ChangeKindSchema = z.enum([
  "unchanged",
  "nothing_to_offer",
  "offer_to_nothing",
  "constraint_violation",
]);
export type ChangeKind = z.infer<typeof ChangeKindSchema>;

export const DecisionSchema = z.object({
  decision: z.string(),
  fallback_reason: z.string().nullable(),
  matched_rules: z.array(z.string()),
  failed_rule: z.string().nullable().optional(),
});
export type Decision = z.infer<typeof DecisionSchema>;

export const ViolationSchema = z.object({
  key: z.string(),
  attribute: z.string(),
});
export type Violation = z.infer<typeof ViolationSchema>;

export const EvaluationSchema = z.object({
  session_id: z.string(),
  event_time: z.string(),
  base: DecisionSchema,
  proposed: DecisionSchema,
  changed: z.boolean(),
  change_kind: ChangeKindSchema,
  violation: ViolationSchema.nullable(),
  attributes_snapshot: z.record(z.string(), z.unknown()),
});
export type Evaluation = z.infer<typeof EvaluationSchema>;

export const ReplaySummarySchema = z.object({
  unchanged: z.number(),
  nothing_to_offer: z.number(),
  offer_to_nothing: z.number(),
  constraint_violation: z.number(),
  base_offers: z.number(),
  proposed_offers: z.number(),
});
export type ReplaySummary = z.infer<typeof ReplaySummarySchema>;

// ---- Fail-closed proofs ----------------------------------------------------
export const InjectionSchema = z.enum(["timeout", "invalid_output", "stale_identity"]);
export type Injection = z.infer<typeof InjectionSchema>;

export const FailClosedProofSchema = z.object({
  injection: InjectionSchema,
  decision: z.string(),
  fallback_reason: z.string().nullable(),
  checkout_preserved: z.boolean(),
  offer_state_created: z.boolean(),
  proof_valid: z.boolean(),
});
export type FailClosedProof = z.infer<typeof FailClosedProofSchema>;

// ---- Verdict ---------------------------------------------------------------
export const VerdictValueSchema = z.enum([
  "BLOCKED",
  "INSUFFICIENT_EVIDENCE",
  "ELIGIBLE_FOR_HOLDOUT",
]);
export type VerdictValue = z.infer<typeof VerdictValueSchema>;

export const HoldoutConfigSchema = z.object({
  control_pct: z.number(),
  primary_metric: z.string(),
  min_uplift_pct: z.number(),
  variant_options: z.array(z.string()),
  // Present when a deliberate widening was surfaced: the exact scope the control
  // group must confirm, so a visible widening reaches the holdout named, not blind.
  confirm_scope: z.array(z.string()).optional(),
});
export type HoldoutConfig = z.infer<typeof HoldoutConfigSchema>;

export const VerdictSchema = z.object({
  value: VerdictValueSchema,
  reasons: z.array(z.string()),
  holdout_config: HoldoutConfigSchema.nullable(),
});
export type Verdict = z.infer<typeof VerdictSchema>;

// ---- Replay job (the core object) ------------------------------------------
export const ReplayJobStatusSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
]);
export type ReplayJobStatus = z.infer<typeof ReplayJobStatusSchema>;

export const ReplayJobSchema = z.object({
  id: z.string(),
  merchant_id: z.string(),
  status: ReplayJobStatusSchema,
  base_version: z.string(),
  proposed_version: z.string(),
  session_count: z.number(),
  created_at: z.string(),
  diff: PolicyDiffSchema,
  constraint_results: z.array(ConstraintResultSchema),
  replay_summary: ReplaySummarySchema,
  evaluations: z.array(EvaluationSchema),
  failclosed_proofs: z.array(FailClosedProofSchema),
  verdict: VerdictSchema,
});
export type ReplayJob = z.infer<typeof ReplayJobSchema>;

// ---- Scenario library ------------------------------------------------------
export const ScenarioSchema = z.object({
  id: z.string(),
  base: z.string(),
  proposed: z.string(),
  title: z.string(),
  teaches: z.string(),
  expected_verdict: VerdictValueSchema,
  signature: z.boolean(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;
export const ScenarioListSchema = z.array(ScenarioSchema);

// ---- Fan-out / transactional outbox ----------------------------------------
export const OutboxTargetSchema = z.enum(["analytics", "billing", "partner"]);
export type OutboxTarget = z.infer<typeof OutboxTargetSchema>;

export const OutboxStatusSchema = z.enum(["PENDING", "PUBLISHED", "DEAD_LETTER"]);
export type OutboxStatus = z.infer<typeof OutboxStatusSchema>;

export const OutboxEventSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  target: OutboxTargetSchema,
  status: OutboxStatusSchema,
  attempts: z.number(),
  created_at: z.string(),
  published_at: z.string().nullable(),
});
export type OutboxEvent = z.infer<typeof OutboxEventSchema>;
export const OutboxListSchema = z.array(OutboxEventSchema);

// ---- Conversion integrity --------------------------------------------------
export const ConversionResponseSchema = z.object({
  status: z.enum(["processed", "deduplicated"]),
  conversion_id: z.string(),
  dedup_key: z.string(),
});
export type ConversionResponse = z.infer<typeof ConversionResponseSchema>;

// ---- Cancellation ----------------------------------------------------------
export const CancellationResponseSchema = z.object({
  itemReservationId: z.string(),
  state_transition: z.array(z.string()),
  final_state: z.string(),
  reversible: z.boolean(),
});
export type CancellationResponse = z.infer<typeof CancellationResponseSchema>;

// ---- Audit -----------------------------------------------------------------
export const AuditEventTypeSchema = z.enum([
  "REPLAY_STARTED",
  "DECISION_RECORDED",
  "CONSTRAINTS_EVALUATED",
  "FAILCLOSED_PROVEN",
  "VERDICT_ISSUED",
]);
export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

export const AuditRecordSchema = z.object({
  seq: z.number(),
  event_type: AuditEventTypeSchema,
  payload: z.unknown(),
  // The prior record's HMAC, committed into this record — the chain link that
  // makes deletion/reordering detectable, not just per-record edits.
  prev_hmac: z.string().optional(),
  content_hmac: z.string(),
  // Backend audit is deterministic/seq-based and emits no created_at; optional so
  // both the /audit GET and the ephemeral simulation audit validate.
  created_at: z.string().optional(),
});
export type AuditRecord = z.infer<typeof AuditRecordSchema>;
export const AuditLogSchema = z.array(AuditRecordSchema);

export const AuditVerifySchema = z.object({
  verified: z.boolean(),
  records: z.number(),
  first_tampered_seq: z.number().nullable(),
  // Why the chain failed (content edit vs deletion/reorder), null when verified.
  reason: z.string().nullable().optional(),
});
export type AuditVerify = z.infer<typeof AuditVerifySchema>;

export const OpeEstimateSchema = z.object({
  verdict: z.enum(["ESTIMATED", "INSUFFICIENT_EVIDENCE"]),
  reason: z.string().nullable().optional(),
  method: z.string().nullable().optional(),
  estimate: z.number().nullable().optional(),
  ci95: z.tuple([z.number(), z.number()]).nullable().optional(),
  se: z.number().nullable().optional(),
  ess: z.number(),
  n: z.number(),
  min_ess: z.number().optional(),
  note: z.string().optional(),
  merchant_id: z.string().optional(),
});
export type OpeEstimate = z.infer<typeof OpeEstimateSchema>;

// ---- Counterexample Forge --------------------------------------------------
export const ForgeOutcomeSchema = z.enum(["CONTAINED", "SURFACED", "SAFE", "GAP"]);
export type ForgeOutcome = z.infer<typeof ForgeOutcomeSchema>;

export const ForgeCandidateSchema = z.object({
  id: z.string(),
  category: z.string(),
  target: z.string(),
  rationale: z.string(),
  outcome: ForgeOutcomeSchema,
  guard: z.string().nullable(),
  evidence: z.string(),
});
export type ForgeCandidate = z.infer<typeof ForgeCandidateSchema>;

export const ForgeResultSchema = z.object({
  merchant_id: z.string().optional(),
  base_version: z.string(),
  session_seed: z.number(),
  session_count: z.number(),
  candidates: z.array(ForgeCandidateSchema),
  summary: z.object({
    total: z.number(),
    contained: z.number(),
    surfaced: z.number(),
    safe: z.number(),
    gap: z.number(),
    no_gaps: z.boolean(),
  }),
  proposer: z.string(),
  note: z.string(),
});
export type ForgeResult = z.infer<typeof ForgeResultSchema>;

// ---- Trust Budget ----------------------------------------------------------
export const TrustActionSchema = z.enum(["SHOW", "DEFER", "SUPPRESS"]);
export type TrustAction = z.infer<typeof TrustActionSchema>;

export const TrustDecisionSchema = z.object({
  action: TrustActionSchema,
  reason: z.string(),
  available: z.number(),
  candidate_cost: z.number(),
  spent: z.number(),
  frustration: z.number(),
  category_recent: z.number(),
  defer_until: z.number().nullable(),
});

export const TrustStepSchema = z.object({
  event_time: z.number(),
  category: z.string(),
  confidence: z.number(),
  urgency: z.number(),
  reaction: z.string().nullable(),
  decision: TrustDecisionSchema,
});
export type TrustStep = z.infer<typeof TrustStepSchema>;

export const TrustBudgetResultSchema = z.object({
  merchant_id: z.string().optional(),
  scenarios: z.array(z.string()),
  scenario: z.string(),
  label: z.string(),
  blurb: z.string(),
  transaction_sensitivity: z.number(),
  steps: z.array(TrustStepSchema),
  summary: z.object({
    total: z.number(),
    show: z.number(),
    defer: z.number(),
    suppress: z.number(),
  }),
  law: z.string(),
  policy: z.object({
    max_budget: z.number(),
    window_seconds: z.number(),
    frustration_cap: z.number(),
    category_cap: z.number(),
  }),
  note: z.string(),
});
export type TrustBudgetResult = z.infer<typeof TrustBudgetResultSchema>;

// ---- Agentic Transaction Passport ------------------------------------------
export const PassportStatusSchema = z.enum(["ADMITTED", "STRIPPED", "REJECTED"]);
export type PassportStatus = z.infer<typeof PassportStatusSchema>;

export const PassportFieldSchema = z.object({
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  customer_confirmed: z.boolean(),
});

export const PassportLedgerRowSchema = z.object({
  key: z.string(),
  status: PassportStatusSchema,
  reason: z.string(),
});
export type PassportLedgerRow = z.infer<typeof PassportLedgerRowSchema>;

export const PassportResultSchema = z.object({
  merchant_id: z.string().optional(),
  scenarios: z.array(z.string()),
  scenario: z.string(),
  label: z.string(),
  blurb: z.string(),
  now: z.number(),
  consent: z.record(z.string(), z.boolean()),
  passport: z.object({
    agent_id: z.string(),
    issued_at: z.number(),
    expires_at: z.number(),
    fields: z.array(PassportFieldSchema),
    signature: z.string(),
  }),
  outcome: z.object({
    passport_valid: z.boolean(),
    reason: z.string().nullable(),
    admitted: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    // A derived (not claimed) value: the ISO 4217 currency-converted spend ceiling.
    derived_spend: z
      .object({
        minor: z.number(),
        currency: z.string(),
        exponent: z.number(),
        major: z.string(),
        display: z.string(),
      })
      .nullable()
      .optional(),
    ledger: z.array(PassportLedgerRowSchema),
    claimed_keys: z.array(z.string()),
    expires_in: z.number(),
    agent_id: z.string(),
  }),
  summary: z.object({
    claimed: z.number(),
    admitted: z.number(),
    stripped: z.number(),
    rejected: z.number(),
  }),
  law: z.string(),
  note: z.string(),
});
export type PassportResult = z.infer<typeof PassportResultSchema>;

// ---- Laws of the Moment (live proof board) ---------------------------------
export const LawResultSchema = z.object({
  n: z.string(),
  title: z.string(),
  statement: z.string(),
  mode: z.enum(["live", "platform"]),
  status: z.enum(["PROVEN", "FALSIFIED", "TESTED"]),
  cases: z.number(),
  detail: z.string(),
});
export type LawResult = z.infer<typeof LawResultSchema>;

export const LawsBoardSchema = z.object({
  merchant_id: z.string().optional(),
  laws: z.array(LawResultSchema),
  summary: z.object({
    total: z.number(),
    live: z.number(),
    proven: z.number(),
    falsified: z.number(),
    cases_checked: z.number(),
    all_proven: z.boolean(),
  }),
  note: z.string(),
});
export type LawsBoard = z.infer<typeof LawsBoardSchema>;

// ---- Error envelope --------------------------------------------------------
export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    request_id: z.string().optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

// ---- Moment Forge: semantic delta + domain simulation ----------------------
export const SeveritySchema = z.enum(["info", "warning", "critical"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const BoundedContextSchema = z.object({
  id: z.enum(["purchase", "customer", "offer", "delivery", "governance"]),
  label: z.string(),
  rule_ids: z.array(z.string()),
  change_count: z.number(),
  max_severity: SeveritySchema,
  muted: z.boolean(),
});
export type BoundedContext = z.infer<typeof BoundedContextSchema>;

export const ContextEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  relation: z.string(),
});
export type ContextEdge = z.infer<typeof ContextEdgeSchema>;

export const ContextMapSchema = z.object({
  contexts: z.array(BoundedContextSchema),
  edges: z.array(ContextEdgeSchema),
});
export type ContextMap = z.infer<typeof ContextMapSchema>;

export const MeaningChangeSchema = z.object({
  path: z.string(),
  risk: DiffRiskSchema.nullable(),
  context: z.string(),
  severity: SeveritySchema,
  before_semantics: z.string(),
  after_semantics: z.string(),
  explanation: z.string(),
  grounding: z.string(),
});
export type MeaningChange = z.infer<typeof MeaningChangeSchema>;

export const MissingAttrInversionSchema = z.object({
  detected: z.boolean(),
  rule_id: z.string(),
  attribute: z.string(),
  direction: z.string(),
  effect: z.string(),
});
export type MissingAttrInversion = z.infer<typeof MissingAttrInversionSchema>;

/** Core semantic delta (as nested inside a simulation — no version echoes). */
const SemanticDeltaCoreSchema = z.object({
  changes: z.array(DiffChangeSchema),
  summary: z.object({
    added: z.number(),
    removed: z.number(),
    modified: z.number(),
  }),
  context_map: ContextMapSchema,
  meaning_changes: z.array(MeaningChangeSchema),
  missing_attribute_inversion: MissingAttrInversionSchema.nullable(),
});

/** /semantic-compile response — the core delta plus the version echoes. */
export const SemanticDeltaSchema = SemanticDeltaCoreSchema.extend({
  base_version: z.string(),
  proposed_version: z.string(),
});
export type SemanticDelta = z.infer<typeof SemanticDeltaSchema>;

export const OpePrescreenSchema = z.object({
  ess: z.number(),
  coverage: z.number(),
  support: z.enum(["NONE", "THIN", "SUFFICIENT"]),
  refuses_estimate: z.boolean(),
  min_ess: z.number(),
  note: z.string(),
});
export type OpePrescreen = z.infer<typeof OpePrescreenSchema>;

/** /simulations response — a ReplayJob minus persistence fields, plus the
 *  semantic delta, OPE pre-screen, applied context toggles, and inline audit. */
export const SimulationResultSchema = ReplayJobSchema.omit({
  id: true,
  merchant_id: true,
  status: true,
  created_at: true,
}).extend({
  semantic_delta: SemanticDeltaCoreSchema,
  ope_prescreen: OpePrescreenSchema,
  context_toggles_applied: z.array(z.string()),
  audit: AuditLogSchema,
});
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

// ---- Moment Forge: Translation Map (conversion across an ACL) ---------------
// Mirrors the recorded fixture / POST /translation-audit response exactly. Core
// fields (§3.2 of MOMENT_FORGE_INTEGRATION_CASES) are required; enrichment fields
// are optional so a leaner real response still validates. A mismatch → validation
// error (never a silent fallback).
export const ConversionEventSchema = z.object({
  kind: z.string(),
  count: z.number(),
  seam: z.string(),
});
export type ConversionEvent = z.infer<typeof ConversionEventSchema>;

export const TranslationAuditSchema = z.object({
  term: z.string(),
  seam: z.string(),
  upstream_meaning: z.string(),
  downstream_meaning: z.string(),
  pattern: z.string(),
  conformist_result: ConversionEventSchema,
  acl_result: ConversionEventSchema,
  corruption: z.object({
    magnitude: z.number(),
    direction: z.string(),
    upward_bias_pct: z.number().optional(),
  }),
  grounding: z.string(),
  synthetic_inputs: z.array(
    z.object({
      name: z.string(),
      value: z.union([z.number(), z.string()]),
      label: z.string().optional(),
      note: z.string().optional(),
    }),
  ),
  // enrichment present in the recorded fixture (optional so a leaner live response still validates)
  seed: z.number().optional(),
  count: z.number().optional(),
  recorded_lift: z.number().optional(),
  incremental_lift: z.number().optional(),
  leaked_conversions: z.number().optional(),
  per_origin: z
    .object({ treatment_caused: z.number(), would_have_anyway: z.number() })
    .optional(),
  note: z.string().optional(),
});
export type TranslationAudit = z.infer<typeof TranslationAuditSchema>;

// ---- Moment Forge: Reconciliation Process (Case B, earned ⇒ issued) ----------
// Mirrors POST /reconciliation-audit and GET /reconciliation exactly. Core fields
// required; enrichment optional. A mismatch → validation error, never a silent
// fallback.
export const ReconStrategyReportSchema = z.object({
  total_earns: z.number(),
  classes: z.record(z.string(), z.number()),
  examples: z.record(z.string(), z.array(z.string())).optional(),
  silent_divergence: z.number(),
  visible_divergence: z.number(),
  invariant_holds: z.boolean(),
});
export type ReconStrategyReport = z.infer<typeof ReconStrategyReportSchema>;

export const ReconciliationAuditSchema = z.object({
  invariant: z.string(),
  pattern: z.string(),
  boundary: z.string(),
  seed: z.number(),
  count: z.number(),
  fault_census: z.record(z.string(), z.number()),
  strategies: z.object({
    dual_write: ReconStrategyReportSchema,
    outbox: ReconStrategyReportSchema,
  }),
  delta: z.object({
    silent_divergence_dual_write: z.number(),
    silent_divergence_outbox: z.number(),
    caught_by_reconciliation: z.number(),
    made_visible_by_outbox: z.number(),
  }),
  synthetic_inputs: z.array(
    z.object({
      name: z.string(),
      value: z.union([z.number(), z.string()]),
      label: z.string().optional(),
      note: z.string().optional(),
    }),
  ),
  grounding: z.string(),
  note: z.string().optional(),
});
export type ReconciliationAudit = z.infer<typeof ReconciliationAuditSchema>;

export const ReconciliationProofSchema = z.object({
  merchant_id: z.string().optional(),
  invariant: z.string(),
  pattern: z.string(),
  total_jobs: z.number(),
  classes: z.record(z.string(), z.number()),
  jobs: z.array(
    z.object({
      job_id: z.string(),
      verdict: z.string().nullable().optional(),
      class: z.string(),
      missing: z.array(z.string()),
      event_statuses: z.array(z.string()),
    }),
  ),
  silent_divergence: z.number(),
  invariant_holds: z.boolean(),
  grounding: z.string(),
});
export type ReconciliationProof = z.infer<typeof ReconciliationProofSchema>;

// ---- Moment Forge: Whole values (impression fidelity + the unit wall) --------
// Mirrors POST /impression-audit exactly. Core fields required; enrichment
// optional. A mismatch → validation error, never a silent fallback.
export const ImpressionAuditSchema = z.object({
  term: z.string(),
  seam: z.string(),
  upstream_meaning: z.string(),
  downstream_meaning: z.string(),
  pattern: z.string(),
  seed: z.number(),
  count: z.number(),
  per_channel: z.object({ human: z.number(), agent: z.number() }),
  per_fidelity: z.object({ faithful: z.number(), degraded: z.number() }),
  conformist_result: z.object({ kind: z.string(), count: z.number() }),
  acl_result: z.object({ counted: z.number(), refused: z.number() }),
  blended_units: z.number(),
  unit_wall: z.object({
    illegal: z.object({
      attempted: z.string(),
      raised: z.boolean(),
      error: z.string().optional(),
      message: z.string().optional(),
    }),
    legal: z.object({
      attempted: z.string(),
      result: z.object({ kind: z.string(), count: z.number() }),
    }),
  }),
  synthetic_inputs: z.array(
    z.object({
      name: z.string(),
      value: z.union([z.number(), z.string()]),
      label: z.string().optional(),
      note: z.string().optional(),
    }),
  ),
  grounding: z.string(),
  note: z.string().optional(),
});
export type ImpressionAudit = z.infer<typeof ImpressionAuditSchema>;
