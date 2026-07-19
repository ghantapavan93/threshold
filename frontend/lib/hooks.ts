"use client";

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api, ApiError, MERCHANT_ID } from "./api";
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
  PolicyListItem,
  ReplayJob,
  Scenario,
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
