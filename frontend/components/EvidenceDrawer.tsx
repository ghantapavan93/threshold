"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api";
import { useAuditVerify } from "@/lib/hooks";
import { useConsole } from "./console-context";
import { Drawer } from "./ui/Drawer";
import { Button, Chip } from "./ui/primitives";
import { formatDateTime, shortHash } from "@/lib/utils";

function KeyVal({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-1.5 last:border-b-0">
      <dt className="text-muted">{k}</dt>
      <dd className="max-w-[60%] break-all text-right text-text">{v}</dd>
    </div>
  );
}

export function EvidenceDrawer() {
  const { evidence, closeEvidence, job } = useConsole();
  const verify = useAuditVerify();
  const [hmacToVerify, setHmacToVerify] = useState<string | null>(null);

  useEffect(() => {
    // Reset the verify result whenever the drawer target changes.
    verify.reset();
    setHmacToVerify(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evidence]);

  const title =
    evidence?.type === "audit"
      ? `Audit record #${evidence.record.seq}`
      : evidence?.type === "evaluation"
        ? `Evidence · ${evidence.evaluation.session_id}`
        : "Evidence";

  return (
    <Drawer
      open={Boolean(evidence)}
      onClose={closeEvidence}
      labelId="evidence-drawer-title"
      title={title}
      subtitle={
        evidence?.type === "audit" ? (
          <span>{evidence.record.event_type}</span>
        ) : evidence?.type === "evaluation" ? (
          <span>Decision record</span>
        ) : null
      }
    >
      {evidence?.type === "audit" ? (
        <div className="space-y-4">
          <dl className="rounded-lg border border-border bg-surface-2 p-3 font-mono text-xs">
            <KeyVal k="seq" v={evidence.record.seq} />
            <KeyVal k="event_type" v={evidence.record.event_type} />
            <KeyVal
              k="created_at"
              v={evidence.record.created_at ? formatDateTime(evidence.record.created_at) : "—"}
            />
            <KeyVal
              k="content_hmac"
              v={
                <span title={evidence.record.content_hmac}>
                  {shortHash(evidence.record.content_hmac)}
                </span>
              }
            />
          </dl>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Payload
            </p>
            <pre className="scroll-x max-h-60 overflow-auto rounded-lg border border-border bg-base/60 p-3 font-mono text-[11px] leading-relaxed text-text">
              {JSON.stringify(evidence.record.payload, null, 2)}
            </pre>
          </div>

          <VerifyPanel
            onVerify={() => {
              if (!job) return;
              setHmacToVerify(evidence.record.content_hmac);
              verify.mutate({ jobId: job.id });
            }}
            verify={verify}
            note={
              hmacToVerify
                ? `Verifying tamper-evident chain for record HMAC ${shortHash(hmacToVerify)}`
                : undefined
            }
          />
        </div>
      ) : evidence?.type === "evaluation" ? (
        <div className="space-y-4">
          <dl className="rounded-lg border border-border bg-surface-2 p-3 font-mono text-xs">
            <KeyVal k="session_id" v={evidence.evaluation.session_id} />
            <KeyVal
              k="policy_versions"
              v={`${job?.base_version} → ${job?.proposed_version}`}
            />
            <KeyVal k="event_time" v={formatDateTime(evidence.evaluation.event_time)} />
            <KeyVal k="change_kind" v={evidence.evaluation.change_kind} />
            <KeyVal
              k="base.decision"
              v={evidence.evaluation.base.decision}
            />
            <KeyVal
              k="proposed.decision"
              v={evidence.evaluation.proposed.decision}
            />
            <KeyVal
              k="fallback_reason"
              v={
                evidence.evaluation.proposed.fallback_reason ??
                evidence.evaluation.base.fallback_reason ??
                "—"
              }
            />
            <KeyVal
              k="violation"
              v={
                evidence.evaluation.violation
                  ? `${evidence.evaluation.violation.key} · ${evidence.evaluation.violation.attribute}`
                  : "—"
              }
            />
          </dl>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Inputs snapshot
            </p>
            <pre className="scroll-x max-h-48 overflow-auto rounded-lg border border-border bg-base/60 p-3 font-mono text-[11px] leading-relaxed text-text">
              {JSON.stringify(evidence.evaluation.attributes_snapshot, null, 2)}
            </pre>
          </div>

          <VerifyPanel
            onVerify={() => {
              if (!job) return;
              verify.mutate({ jobId: job.id });
            }}
            onTruncate={() => {
              if (!job) return;
              verify.mutate({ jobId: job.id, dropLast: 1 });
            }}
            verify={verify}
            note="Verifies the whole run's tamper-evident audit log against its signed head seal."
          />
        </div>
      ) : null}
    </Drawer>
  );
}

function VerifyPanel({
  onVerify,
  onTruncate,
  verify,
  note,
}: {
  onVerify: () => void;
  onTruncate?: () => void;
  verify: ReturnType<typeof useAuditVerify>;
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Integrity</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="primary" onClick={onVerify} disabled={verify.isPending}>
            {verify.isPending ? "Verifying…" : "Verify integrity"}
          </Button>
          {onTruncate ? (
            <Button size="sm" variant="danger" onClick={onTruncate} disabled={verify.isPending}>
              ✂ Drop the last record
            </Button>
          ) : null}
        </div>
      </div>
      {note ? <p className="mt-1 text-[11px] text-muted">{note}</p> : null}
      {onTruncate ? (
        <p className="mt-1 text-[11px] text-muted">
          Try the attack: dropping the tail leaves a valid shorter chain — but the signed head seal commits the count, so truncation is caught.
        </p>
      ) : null}

      <div aria-live="polite" className="mt-3">
        {verify.isError ? (
          <p className="text-xs text-crimson">
            ✕{" "}
            {verify.error instanceof ApiError && verify.error.isUnreachable
              ? "Backend unreachable"
              : verify.error.message}
          </p>
        ) : verify.data ? (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
            {verify.data.reason ? (
              <p className="text-[11px] text-crimson">{verify.data.reason}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-[11px] text-muted">
            Tamper-evident: records are hash-chained and sealed with a signed head — edits, deletion, reordering, and truncation all break verification.
          </p>
        )}
      </div>
    </div>
  );
}
