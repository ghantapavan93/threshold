"use client";

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  api,
  ApiError,
  MERCHANT_ID,
  type ImpressionAuditInput,
  type ReconciliationAuditInput,
  type SemanticCompileInput,
  type SimulationInput,
  type TranslationAuditInput,
} from "./api";
import { uuid } from "./utils";
import type {
  AuditVerify,
  CancellationResponse,
  ConversionResponse,
  Health,
  Injection,
  PolicyDiff,
  OutboxEvent,
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

/** Do not retry contract-validation or 4xx errors; they will not self-heal. */
function retryPolicy(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.kind === "validation") return false;
    if (error.status !== null && error.status >= 400 && error.status < 500) {
      return false;
    }
  }
  return failureCount < 2;
}

export function useHealth(): UseQueryResult<Health, ApiError> {
  return useQuery<Health, ApiError>({
    queryKey: ["health"],
    queryFn: ({ signal }) => api.health(signal),
    refetchInterval: 15_000,
    retry: retryPolicy,
  });
}

export function usePolicies(
  merchantId: string = MERCHANT_ID,
): UseQueryResult<PolicyListItem[], ApiError> {
  return useQuery<PolicyListItem[], ApiError>({
    queryKey: ["policies", merchantId],
    queryFn: ({ signal }) => api.listPolicies(merchantId, signal),
    retry: retryPolicy,
  });
}

export function useScenarios(
  merchantId: string = MERCHANT_ID,
): UseQueryResult<Scenario[], ApiError> {
  return useQuery<Scenario[], ApiError>({
    queryKey: ["scenarios", merchantId],
    queryFn: ({ signal }) => api.listScenarios(merchantId, signal),
    retry: retryPolicy,
  });
}

export function usePolicy(
  policyVersion: string | null,
  merchantId: string = MERCHANT_ID,
): UseQueryResult<PolicyDocument, ApiError> {
  return useQuery<PolicyDocument, ApiError>({
    queryKey: ["policy", merchantId, policyVersion],
    queryFn: ({ signal }) => api.getPolicy(merchantId, policyVersion as string, signal),
    enabled: Boolean(policyVersion),
    retry: retryPolicy,
  });
}

export function usePolicyDiff(
  baseVersion: string | null,
  proposedVersion: string | null,
  merchantId: string = MERCHANT_ID,
): UseQueryResult<PolicyDiff, ApiError> {
  return useQuery<PolicyDiff, ApiError>({
    queryKey: ["policy-diff", merchantId, baseVersion, proposedVersion],
    queryFn: ({ signal }) =>
      api.policyDiff(
        merchantId,
        { base_version: baseVersion as string, proposed_version: proposedVersion as string },
        signal,
      ),
    enabled: Boolean(baseVersion && proposedVersion),
    retry: retryPolicy,
  });
}

export type ReplayJobInput = {
  base_version: string;
  proposed_version: string;
  session_seed: number;
  session_count: number;
  injections: Injection[];
};

export type ReplayJobResult = { job: ReplayJob; requestId: string | null };

/**
 * The core mutation. A fresh Idempotency-Key uuid is minted per invocation so a
 * retried submit is safe; callers may re-run to create a new job.
 */
export function useReplayJob(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<ReplayJobResult, ApiError, ReplayJobInput> {
  return useMutation<ReplayJobResult, ApiError, ReplayJobInput>({
    mutationKey: ["replay-job", merchantId],
    mutationFn: (input) => api.createReplayJob(merchantId, input, uuid()),
  });
}

export type ConversionInput = {
  conversiontype: string;
  confirmationref: string;
  amount: number;
  currency: string;
  idempotencyKey?: string;
};

/** Moment Forge — Semantic Change Compiler mutation (real backend). */
export function useSemanticCompile(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<SemanticDelta, ApiError, SemanticCompileInput> {
  return useMutation<SemanticDelta, ApiError, SemanticCompileInput>({
    mutationKey: ["semantic-compile", merchantId],
    mutationFn: (input) => api.semanticCompile(merchantId, input),
    retry: retryPolicy,
  });
}

/** Moment Forge — Domain Evolution Simulator mutation (real backend). */
export function useSimulation(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<SimulationResult, ApiError, SimulationInput> {
  return useMutation<SimulationResult, ApiError, SimulationInput>({
    mutationKey: ["simulation", merchantId],
    mutationFn: (input) => api.simulate(merchantId, input),
    retry: retryPolicy,
  });
}

/** Moment Forge — Translation Map mutation (real backend). */
export function useTranslationAudit(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<TranslationAudit, ApiError, TranslationAuditInput> {
  return useMutation<TranslationAudit, ApiError, TranslationAuditInput>({
    mutationKey: ["translation-audit", merchantId],
    mutationFn: (input) => api.translationAudit(merchantId, input),
    retry: retryPolicy,
  });
}

/** Moment Forge — Whole-values / impression-fidelity mutation (real backend). */
export function useImpressionAudit(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<ImpressionAudit, ApiError, ImpressionAuditInput> {
  return useMutation<ImpressionAudit, ApiError, ImpressionAuditInput>({
    mutationKey: ["impression-audit", merchantId],
    mutationFn: (input) => api.impressionAudit(merchantId, input),
    retry: retryPolicy,
  });
}

/** Moment Forge — Reconciliation Process mutation (real backend). */
export function useReconciliationAudit(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<ReconciliationAudit, ApiError, ReconciliationAuditInput> {
  return useMutation<ReconciliationAudit, ApiError, ReconciliationAuditInput>({
    mutationKey: ["reconciliation-audit", merchantId],
    mutationFn: (input) => api.reconciliationAudit(merchantId, input),
    retry: retryPolicy,
  });
}

/** Moment Forge — Reconciliation proof over the real fan-out rows. On-demand
 *  (button-triggered), so a mutation shape despite being a GET. */
export function useReconciliationProof(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<ReconciliationProof, ApiError, void> {
  return useMutation<ReconciliationProof, ApiError, void>({
    mutationKey: ["reconciliation-proof", merchantId],
    mutationFn: () => api.reconciliationProof(merchantId),
    retry: retryPolicy,
  });
}

export function useConversion(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<ConversionResponse, ApiError, ConversionInput> {
  return useMutation<ConversionResponse, ApiError, ConversionInput>({
    mutationKey: ["conversion", merchantId],
    mutationFn: ({ idempotencyKey, ...body }) =>
      api.createConversion(merchantId, body, idempotencyKey),
  });
}

export function useCancellation(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<CancellationResponse, ApiError, { itemReservationId: string }> {
  return useMutation<CancellationResponse, ApiError, { itemReservationId: string }>({
    mutationKey: ["cancellation", merchantId],
    mutationFn: (body) => api.createCancellation(merchantId, body),
  });
}

export function useAuditVerify(
  merchantId: string = MERCHANT_ID,
): UseMutationResult<AuditVerify, ApiError, { jobId: string }> {
  return useMutation<AuditVerify, ApiError, { jobId: string }>({
    mutationKey: ["audit-verify", merchantId],
    mutationFn: ({ jobId }) => api.verifyAudit(merchantId, jobId),
  });
}

/**
 * Transactional-outbox observability. Polls every 2s WHILE any event is still
 * PENDING (the background worker is draining), and stops the moment every event
 * is PUBLISHED or DEAD_LETTER — nothing left to drain. Only enabled once a
 * replay job exists.
 */
export function useOutbox(
  jobId: string | null,
  merchantId: string = MERCHANT_ID,
): UseQueryResult<OutboxEvent[], ApiError> {
  return useQuery<OutboxEvent[], ApiError>({
    queryKey: ["outbox", merchantId, jobId],
    queryFn: ({ signal }) => api.getOutbox(merchantId, jobId as string, signal),
    enabled: Boolean(jobId),
    retry: retryPolicy,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2_000; // keep polling until the first page arrives
      const draining = data.some((e) => e.status === "PENDING");
      return draining ? 2_000 : false;
    },
  });
}

export function useAudit(
  jobId: string | null,
  merchantId: string = MERCHANT_ID,
): UseQueryResult<Awaited<ReturnType<typeof api.getAudit>>, ApiError> {
  return useQuery<Awaited<ReturnType<typeof api.getAudit>>, ApiError>({
    queryKey: ["audit", merchantId, jobId],
    queryFn: ({ signal }) => api.getAudit(merchantId, jobId as string, signal),
    enabled: Boolean(jobId),
    retry: retryPolicy,
  });
}
