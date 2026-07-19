"use client";

import { useMemo, useState } from "react";
import { usePolicyDiff } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { useConsole } from "./console-context";
import {
  Card,
  Chip,
  EmptyState,
  ErrorState,
  SegmentedToggle,
  Section,
  Skeleton,
} from "./ui/primitives";
import { renderValue } from "@/lib/utils";
import type { DiffChange, DiffRisk } from "@/lib/schemas";

const RISK_LABEL: Record<DiffRisk, string> = {
  missing_attribute_flip: "missing-attribute risk",
  frequency_increase: "frequency increase",
  eligibility_widened: "eligibility widened",
  latency_increase: "latency increase",
};

function RiskTag({ risk }: { risk: DiffRisk }) {
  const isTrap = risk === "missing_attribute_flip";
  return (
    <Chip
      color={isTrap ? "var(--c-crimson)" : "var(--c-amber)"}
      icon={<span aria-hidden>⚠</span>}
      title={
        isTrap
          ? "Operator change flips MISSING-value behavior — silent scope expansion"
          : RISK_LABEL[risk]
      }
      className="ml-2"
    >
      {RISK_LABEL[risk]}
    </Chip>
  );
}

function DiffRow({ change }: { change: DiffChange }) {
  const kindColor =
    change.kind === "added"
      ? "var(--c-teal)"
      : change.kind === "removed"
        ? "var(--c-crimson)"
        : "var(--c-amber)";
  const sign =
    change.kind === "added" ? "+" : change.kind === "removed" ? "−" : "~";

  return (
    <div className="grid grid-cols-1 gap-px border-b border-border/60 last:border-b-0 md:grid-cols-2">
      {/* Base column */}
      <div className="flex items-start gap-2 bg-crimson/[0.04] px-3 py-1.5 font-mono text-xs">
        <span aria-hidden style={{ color: kindColor }} className="select-none">
          {change.kind === "added" ? " " : sign}
        </span>
        <div className="min-w-0">
          <span className="text-muted">{change.path}</span>
          {change.kind !== "added" ? (
            <span className="ml-2 break-all text-crimson">
              {renderValue(change.before)}
            </span>
          ) : (
            <span className="ml-2 text-muted">—</span>
          )}
        </div>
      </div>
      {/* Proposed column */}
      <div className="flex flex-wrap items-start gap-2 bg-teal/[0.04] px-3 py-1.5 font-mono text-xs">
        <span aria-hidden style={{ color: kindColor }} className="select-none">
          {change.kind === "removed" ? " " : sign}
        </span>
        <div className="min-w-0">
          <span className="text-muted">{change.path}</span>
          {change.kind !== "removed" ? (
            <span className="ml-2 break-all text-teal">
              {renderValue(change.after)}
            </span>
          ) : (
            <span className="ml-2 text-muted">—</span>
          )}
          {change.risk ? <RiskTag risk={change.risk} /> : null}
        </div>
      </div>
    </div>
  );
}

export function PolicyDiffSection() {
  const { baseVersion, proposedVersion } = useConsole();
  const [filter, setFilter] = useState<"all" | "modified">("all");
  const diff = usePolicyDiff(baseVersion, proposedVersion);

  const visible = useMemo(() => {
    const changes = diff.data?.changes ?? [];
    if (filter === "modified") {
      return changes.filter((c) => c.kind === "modified");
    }
    return changes;
  }, [diff.data, filter]);

  return (
    <Section
      id="policy-diff"
      index={2}
      title="Policy Diff"
      subtitle={`Structural changes from ${baseVersion} to ${proposedVersion}. The r4 operator change is flagged as a missing-attribute risk.`}
      actions={
        <SegmentedToggle<"all" | "modified">
          ariaLabel="Filter policy diff rows"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All rules" },
            { value: "modified", label: "Modified only" },
          ]}
        />
      }
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 border-b border-border bg-surface-2 text-xs font-semibold uppercase tracking-wide text-muted md:grid-cols-2">
          <div className="px-3 py-2">Base · {baseVersion}</div>
          <div className="border-t border-border px-3 py-2 md:border-l md:border-t-0">
            Proposed · {proposedVersion}
          </div>
        </div>

        {diff.isPending ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full" />
            ))}
          </div>
        ) : diff.isError ? (
          <div className="p-3">
            <ErrorState
              title={
                diff.error instanceof ApiError && diff.error.isUnreachable
                  ? "Backend unreachable"
                  : "Could not load policy diff"
              }
              detail={diff.error.message}
              requestId={
                diff.error instanceof ApiError ? diff.error.requestId : null
              }
              onRetry={() => diff.refetch()}
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-3">
            <EmptyState
              title="No changes to show"
              hint={
                filter === "modified"
                  ? "No modified fields between these versions."
                  : "These two policy versions are identical."
              }
            />
          </div>
        ) : (
          <div className="scroll-x" role="table" aria-label="Policy diff">
            {visible.map((c) => (
              <DiffRow key={`${c.path}-${c.kind}`} change={c} />
            ))}
          </div>
        )}

        {diff.data ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-2 px-3 py-2 text-xs text-muted">
            <Chip color="var(--c-teal)">+{diff.data.summary.added} added</Chip>
            <Chip color="var(--c-crimson)">
              −{diff.data.summary.removed} removed
            </Chip>
            <Chip color="var(--c-amber)">
              ~{diff.data.summary.modified} modified
            </Chip>
          </div>
        ) : null}
      </Card>
    </Section>
  );
}
