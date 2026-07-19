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
  value: z.array(z.union([z.string(), z.number()])).optional(),
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
});
export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;

// ---- Policy diff -----------------------------------------------------------
export const DiffRiskSchema = z.enum([
  "missing_attribute_flip",
  "frequency_increase",
  "eligibility_widened",
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
export const ConstraintResultValueSchema = z.enum(["PASS", "WARN", "FAIL"]);
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
  content_hmac: z.string(),
  created_at: z.string(),
});
export type AuditRecord = z.infer<typeof AuditRecordSchema>;
export const AuditLogSchema = z.array(AuditRecordSchema);

export const AuditVerifySchema = z.object({
  verified: z.boolean(),
  records: z.number(),
  first_tampered_seq: z.number().nullable(),
});
export type AuditVerify = z.infer<typeof AuditVerifySchema>;

// ---- Error envelope --------------------------------------------------------
export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    request_id: z.string().optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
