"use client";

import { ApiError } from "@/lib/api";
import { useAudit, useAuditVerify } from "@/lib/hooks";
import { useConsole } from "./console-context";
import { EvidenceDrawer } from "./EvidenceDrawer";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Section,
  Skeleton,
} from "./ui/primitives";
import { formatTime, shortHash } from "@/lib/utils";
import { IntegrityShield } from "./visual/illustrations";
import type { AuditEventType } from "@/lib/schemas";

const EVENT_COLOR: Record<AuditEventType, string> = {
  REPLAY_STARTED: "var(--c-offer-blue)",
  DECISION_RECORDED: "var(--c-muted)",
  CONSTRAINTS_EVALUATED: "var(--c-amber)",
  FAILCLOSED_PROVEN: "var(--c-teal)",
  VERDICT_ISSUED: "var(--c-crimson)",
};

export function EvidenceSection() {
  const { job, openEvidence } = useConsole();
  const audit = useAudit(job?.id ?? null);
  const verify = useAuditVerify();

  return (
    <Section
      id="evidence"
      index={9}
      title="Evidence Drawer"
      subtitle="Append-only, tamper-evident audit log. Each record is hash-chained — its HMAC commits the prior record's — and the whole log is sealed with a key-signed head, so edits, reordering, interior deletion, AND suffix truncation all break verification. Click any row for the full record; verify the log, or try to truncate it."
      actions={
        job ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="subtle"
              onClick={() => verify.mutate({ jobId: job.id })}
              disabled={verify.isPending}
            >
              {verify.isPending ? "Verifying…" : "Verify whole log"}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => verify.mutate({ jobId: job.id, dropLast: 1 })}
              disabled={verify.isPending}
              title="Verify a copy with the last record dropped — the signed head seal catches it"
            >
              ✂ Drop the last record
            </Button>
          </div>
        ) : undefined
      }
    >
      {!job ? (
        <EmptyState
          icon={<IntegrityShield className="w-16" />}
          title="No audit trail yet"
          hint="Run a Policy Diff Replay to generate the append-only, tamper-evident audit log. Each record is hash-chained to the one before it."
        />
      ) : (
        <div className="space-y-3">
          {verify.data ? (
            <div
              aria-live="polite"
              className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
            >
              <Chip
                color={verify.data.verified ? "var(--c-teal)" : "var(--c-crimson)"}
                icon={<span aria-hidden>{verify.data.verified ? "✓" : "✕"}</span>}
              >
                {verify.data.verified ? "verified: true" : "verified: false"}
              </Chip>
              <Chip color="var(--c-muted)">records {verify.data.records}</Chip>
              <Chip
                color={
                  verify.data.first_tampered_seq === null
                    ? "var(--c-muted)"
                    : "var(--c-crimson)"
                }
              >
                first_tampered_seq {String(verify.data.first_tampered_seq)}
              </Chip>
              {verify.data.reason ? (
                <p className="w-full text-[11px] text-crimson">{verify.data.reason}</p>
              ) : null}
            </div>
          ) : null}

          <Card className="overflow-hidden">
            {audit.isPending ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : audit.isError ? (
              <div className="p-3">
                <ErrorState
                  title={
                    audit.error instanceof ApiError && audit.error.isUnreachable
                      ? "Backend unreachable"
                      : "Could not load audit log"
                  }
                  detail={audit.error.message}
                  requestId={
                    audit.error instanceof ApiError ? audit.error.requestId : null
                  }
                  onRetry={() => audit.refetch()}
                />
              </div>
            ) : (audit.data?.length ?? 0) === 0 ? (
              <div className="p-3">
                <EmptyState title="Audit log is empty for this run." />
              </div>
            ) : (
              <div className="scroll-x">
                <table className="w-full min-w-[620px] border-collapse text-left font-mono text-xs">
                  <thead className="bg-surface-2 text-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">seq</th>
                      <th className="px-3 py-2 font-medium">event_type</th>
                      <th className="px-3 py-2 font-medium">created_at</th>
                      <th className="px-3 py-2 font-medium">content_hmac</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.data?.map((rec) => (
                      <tr
                        key={rec.seq}
                        tabIndex={0}
                        onClick={() => openEvidence({ type: "audit", record: rec })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openEvidence({ type: "audit", record: rec });
                          }
                        }}
                        className="cursor-pointer border-t border-border hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal"
                      >
                        <td className="px-3 py-1.5 text-muted">{rec.seq}</td>
                        <td className="px-3 py-1.5">
                          <span style={{ color: EVENT_COLOR[rec.event_type] }}>
                            {rec.event_type}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-muted">
                          {rec.created_at ? formatTime(rec.created_at) : "—"}
                        </td>
                        <td
                          className="px-3 py-1.5 text-muted"
                          title={rec.content_hmac}
                        >
                          {shortHash(rec.content_hmac)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      <EvidenceDrawer />
    </Section>
  );
}
