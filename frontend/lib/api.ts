import { z } from "zod";
import {
  AuditLogSchema,
  AuditVerifySchema,
  CancellationResponseSchema,
  ConversionResponseSchema,
  ErrorEnvelopeSchema,
  HealthSchema,
  PolicyDiffSchema,
  PolicyDocumentSchema,
  OutboxListSchema,
  PolicyListSchema,
  ReplayJobSchema,
  ScenarioListSchema,
  ImpressionAuditSchema,
  ReconciliationAuditSchema,
  ReconciliationProofSchema,
  SemanticDeltaSchema,
  SimulationResultSchema,
  TranslationAuditSchema,
} from "./schemas";
import type {
  AuditRecord,
  AuditVerify,
  CancellationResponse,
  ConversionResponse,
  Health,
  Injection,
  OutboxEvent,
  PolicyDiff,
  PolicyDocument,
  ImpressionAudit,
  PolicyListItem,
  ReconciliationAudit,
  ReconciliationProof,
  ReplayJob,
  Scenario,
  SemanticDelta,
  SimulationResult,
  TranslationAudit,
} from "./schemas";

/** Moment Forge — Reconciliation Process request (all fields have server defaults). */
export type ReconciliationAuditInput = {
  seed?: number;
  count?: number;
  crash_fraction?: number;
  ambiguous_timeout_fraction?: number;
  hard_failure_fraction?: number;
};

/** Moment Forge — Whole-values / impression-fidelity request. */
export type ImpressionAuditInput = {
  term?: string;
  seed?: number;
  count?: number;
  agent_share?: number;
  degraded_fraction?: number;
};

/** Moment Forge — Translation Map request. */
export type TranslationAuditInput = {
  term: string;
  baseline_rate: number;
  seed?: number;
  count?: number;
};

/** Moment Forge — Semantic Change Compiler request. */
export type SemanticCompileInput = {
  base_version: string;
  proposed_version?: string;
  proposed_document?: unknown;
  muted_contexts?: string[];
};

/** Moment Forge — Domain Evolution Simulator request. */
export type SimulationInput = {
  base_version: string;
  proposed: {
    from_version?: string;
    document?: unknown;
    rule_overrides?: Array<{ id: string; op?: string; value?: unknown }>;
    muted_contexts?: string[];
  };
  session_seed?: number;
  session_count?: number;
  injections?: Injection[];
};

/** Base URL of the Threshold backend. Defaults per API_CONTRACT.md. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8000";

const THRESHOLD_USER = process.env.NEXT_PUBLIC_THRESHOLD_USER ?? "demo-operator";

/** Default merchant for the frozen demo (Aurora Tickets). */
export const MERCHANT_ID = "aurora-tickets";

/**
 * A first-class error carrying the correlation id and, when available, the
 * backend's structured error envelope. `kind` distinguishes a real HTTP error
 * response from a transport failure (backend unreachable) or a schema mismatch.
 */
export class ApiError extends Error {
  readonly kind: "http" | "network" | "validation";
  readonly status: number | null;
  readonly requestId: string | null;
  readonly code: string | null;
  override readonly cause: unknown;

  constructor(params: {
    message: string;
    kind: ApiError["kind"];
    status?: number | null;
    requestId?: string | null;
    code?: string | null;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.kind = params.kind;
    this.status = params.status ?? null;
    this.requestId = params.requestId ?? null;
    this.code = params.code ?? null;
    this.cause = params.cause;
  }

  /** True when the backend could not be reached at all. */
  get isUnreachable(): boolean {
    return this.kind === "network";
  }
}

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  opts: RequestOptions = {},
): Promise<{ data: T; requestId: string | null }> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Threshold-User": THRESHOLD_USER,
    ...opts.headers,
  };
  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
      cache: "no-store",
    });
  } catch (cause) {
    throw new ApiError({
      kind: "network",
      message: `Backend unreachable at ${API_BASE}`,
      cause,
    });
  }

  const requestId = res.headers.get("X-Request-ID");

  const rawText = await res.text();
  let json: unknown = undefined;
  if (rawText.length > 0) {
    try {
      json = JSON.parse(rawText);
    } catch (cause) {
      throw new ApiError({
        kind: "validation",
        message: `Malformed JSON from ${path}`,
        status: res.status,
        requestId,
        cause,
      });
    }
  }

  if (!res.ok) {
    const parsed = ErrorEnvelopeSchema.safeParse(json);
    if (parsed.success) {
      throw new ApiError({
        kind: "http",
        message: parsed.data.error.message,
        code: parsed.data.error.code,
        status: res.status,
        requestId: parsed.data.error.request_id ?? requestId,
      });
    }
    throw new ApiError({
      kind: "http",
      message: `Request to ${path} failed (${res.status})`,
      status: res.status,
      requestId,
    });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError({
      kind: "validation",
      message: `Response from ${path} did not match the API contract`,
      status: res.status,
      requestId,
      cause: parsed.error,
    });
  }

  return { data: parsed.data, requestId };
}

/** Convenience wrapper returning only the validated body. */
async function requestData<T>(
  path: string,
  schema: z.ZodType<T>,
  opts?: RequestOptions,
): Promise<T> {
  return (await request(path, schema, opts)).data;
}

// ---------------------------------------------------------------------------
// Typed endpoint surface. One method per route in API_CONTRACT.md.
// ---------------------------------------------------------------------------

const base = (merchantId: string) => `/api/v1/merchants/${merchantId}`;

export const api = {
  base: API_BASE,

  health(signal?: AbortSignal): Promise<Health> {
    return requestData("/health", HealthSchema, { signal });
  },

  listPolicies(merchantId: string, signal?: AbortSignal): Promise<PolicyListItem[]> {
    return requestData(`${base(merchantId)}/policies`, PolicyListSchema, { signal });
  },

  listScenarios(merchantId: string, signal?: AbortSignal): Promise<Scenario[]> {
    return requestData(`${base(merchantId)}/scenarios`, ScenarioListSchema, { signal });
  },

  getPolicy(
    merchantId: string,
    policyVersion: string,
    signal?: AbortSignal,
  ): Promise<PolicyDocument> {
    return requestData(
      `${base(merchantId)}/policies/${policyVersion}`,
      PolicyDocumentSchema,
      { signal },
    );
  },

  policyDiff(
    merchantId: string,
    body: { base_version: string; proposed_version: string },
    signal?: AbortSignal,
  ): Promise<PolicyDiff> {
    return requestData(`${base(merchantId)}/policy-diff`, PolicyDiffSchema, {
      method: "POST",
      body,
      signal,
    });
  },

  /** Idempotent core call. Surfaces the request id alongside the job. */
  async createReplayJob(
    merchantId: string,
    body: {
      base_version: string;
      proposed_version: string;
      session_seed: number;
      session_count: number;
      injections: Injection[];
    },
    idempotencyKey: string,
    signal?: AbortSignal,
  ): Promise<{ job: ReplayJob; requestId: string | null }> {
    const { data, requestId } = await request(
      `${base(merchantId)}/replay-jobs`,
      ReplayJobSchema,
      {
        method: "POST",
        body,
        headers: { "Idempotency-Key": idempotencyKey },
        signal,
      },
    );
    return { job: data, requestId };
  },

  getReplayJob(
    merchantId: string,
    id: string,
    signal?: AbortSignal,
  ): Promise<ReplayJob> {
    return requestData(`${base(merchantId)}/replay-jobs/${id}`, ReplayJobSchema, {
      signal,
    });
  },

  getOutbox(
    merchantId: string,
    jobId: string,
    signal?: AbortSignal,
  ): Promise<OutboxEvent[]> {
    return requestData(
      `${base(merchantId)}/replay-jobs/${jobId}/outbox`,
      OutboxListSchema,
      { signal },
    );
  },

  createConversion(
    merchantId: string,
    body: {
      conversiontype: string;
      confirmationref: string;
      amount: number;
      currency: string;
    },
    idempotencyKey?: string,
    signal?: AbortSignal,
  ): Promise<ConversionResponse> {
    return requestData(`${base(merchantId)}/conversions`, ConversionResponseSchema, {
      method: "POST",
      body,
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      signal,
    });
  },

  createCancellation(
    merchantId: string,
    body: { itemReservationId: string },
    signal?: AbortSignal,
  ): Promise<CancellationResponse> {
    return requestData(
      `${base(merchantId)}/cancellations`,
      CancellationResponseSchema,
      { method: "POST", body, signal },
    );
  },

  /** Moment Forge — Semantic Change Compiler (stateless, pure, no sessions). */
  semanticCompile(
    merchantId: string,
    body: SemanticCompileInput,
    signal?: AbortSignal,
  ): Promise<SemanticDelta> {
    return requestData(`${base(merchantId)}/semantic-compile`, SemanticDeltaSchema, {
      method: "POST",
      body,
      signal,
    });
  },

  /** Moment Forge — Domain Evolution Simulator (ephemeral, non-persisting). */
  simulate(
    merchantId: string,
    body: SimulationInput,
    signal?: AbortSignal,
  ): Promise<SimulationResult> {
    return requestData(`${base(merchantId)}/simulations`, SimulationResultSchema, {
      method: "POST",
      body,
      signal,
    });
  },

  /** Moment Forge — Translation Map: "conversion" across an ACL (read-only, pure). */
  translationAudit(
    merchantId: string,
    body: TranslationAuditInput,
    signal?: AbortSignal,
  ): Promise<TranslationAudit> {
    return requestData(`${base(merchantId)}/translation-audit`, TranslationAuditSchema, {
      method: "POST",
      body,
      signal,
    });
  },

  /** Moment Forge — Reconciliation Process: dual-write vs outbox over the same
   *  seeded fault world, reconciled side by side (read-only, pure). */
  reconciliationAudit(
    merchantId: string,
    body: ReconciliationAuditInput,
    signal?: AbortSignal,
  ): Promise<ReconciliationAudit> {
    return requestData(`${base(merchantId)}/reconciliation-audit`, ReconciliationAuditSchema, {
      method: "POST",
      body,
      signal,
    });
  },

  /** Moment Forge — Whole values: impression fidelity + the live unit wall
   *  (read-only, pure). */
  impressionAudit(
    merchantId: string,
    body: ImpressionAuditInput,
    signal?: AbortSignal,
  ): Promise<ImpressionAudit> {
    return requestData(`${base(merchantId)}/impression-audit`, ImpressionAuditSchema, {
      method: "POST",
      body,
      signal,
    });
  },

  /** Moment Forge — Reconciliation proof over the REAL replay-job fan-out rows. */
  reconciliationProof(
    merchantId: string,
    signal?: AbortSignal,
  ): Promise<ReconciliationProof> {
    return requestData(`${base(merchantId)}/reconciliation`, ReconciliationProofSchema, {
      signal,
    });
  },

  getAudit(
    merchantId: string,
    jobId: string,
    signal?: AbortSignal,
  ): Promise<AuditRecord[]> {
    return requestData(
      `${base(merchantId)}/replay-jobs/${jobId}/audit`,
      AuditLogSchema,
      { signal },
    );
  },

  verifyAudit(
    merchantId: string,
    jobId: string,
    dropLast = 0,
    signal?: AbortSignal,
  ): Promise<AuditVerify> {
    const q = dropLast > 0 ? `?drop_last=${dropLast}` : "";
    return requestData(
      `${base(merchantId)}/replay-jobs/${jobId}/audit/verify${q}`,
      AuditVerifySchema,
      { method: "POST", signal },
    );
  },
};
