"use client";

import { Drawer } from "./ui/Drawer";
import { useConsole } from "./console-context";
import { Button, Chip } from "./ui/primitives";
import {
  CHANGE_KIND_COLOR,
  CHANGE_KIND_LABEL,
  formatDateTime,
  renderValue,
} from "@/lib/utils";
import type { Decision, Evaluation } from "@/lib/schemas";

function DecisionColumn({
  label,
  version,
  decision,
  highlightAttr,
}: {
  label: string;
  version: string | null;
  decision: Decision;
  highlightAttr?: string | null;
}) {
  const isOffer = decision.decision === "offer";
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">
          {label} · {version}
        </span>
        <Chip color={isOffer ? "var(--c-offer-blue)" : "var(--c-muted)"}>
          {isOffer ? "OFFER" : "No Offer Rendered"}
        </Chip>
      </div>
      <dl className="space-y-1 font-mono text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-muted">matched_rules</dt>
          <dd className="text-right text-text">
            {decision.matched_rules.length
              ? decision.matched_rules.join(", ")
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">failed_rule</dt>
          <dd className="text-right text-text">
            {decision.failed_rule ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">fallback_reason</dt>
          <dd className="text-right text-text">
            {decision.fallback_reason ?? "—"}
          </dd>
        </div>
      </dl>
      {highlightAttr ? (
        <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted">
          Divergence driven by{" "}
          <span className="font-mono text-crimson">{highlightAttr}</span>
        </p>
      ) : null}
    </div>
  );
}

export function SessionDrawer({
  evaluation,
  baseVersion,
  proposedVersion,
  onClose,
}: {
  evaluation: Evaluation | null;
  baseVersion: string | null;
  proposedVersion: string | null;
  onClose: () => void;
}) {
  const { openEvidence } = useConsole();
  const violationAttr = evaluation?.violation?.attribute ?? null;

  return (
    <Drawer
      open={Boolean(evaluation)}
      onClose={onClose}
      labelId="session-drawer-title"
      title={evaluation ? `Session ${evaluation.session_id}` : "Session"}
      subtitle={
        evaluation ? (
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-sm"
              style={{
                backgroundColor: CHANGE_KIND_COLOR[evaluation.change_kind],
              }}
            />
            {CHANGE_KIND_LABEL[evaluation.change_kind]} ·{" "}
            {formatDateTime(evaluation.event_time)}
          </span>
        ) : null
      }
    >
      {evaluation ? (
        <div className="space-y-4">
          {evaluation.violation ? (
            <div className="rounded-lg border border-crimson/50 bg-crimson/10 p-3">
              <div className="flex items-center gap-2">
                <span aria-hidden className="font-bold text-crimson">
                  ⚠
                </span>
                <span className="text-sm font-semibold text-crimson">
                  Constraint violation
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-text">
                {evaluation.violation.key} · attribute{" "}
                <span className="text-crimson">
                  {evaluation.violation.attribute}
                </span>
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3">
            <DecisionColumn
              label="Base"
              version={baseVersion}
              decision={evaluation.base}
            />
            <DecisionColumn
              label="Proposed"
              version={proposedVersion}
              decision={evaluation.proposed}
              highlightAttr={violationAttr}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Event-time attribute snapshot
            </p>
            <div className="rounded-lg border border-border">
              <table className="w-full border-collapse text-left font-mono text-xs">
                <tbody>
                  {Object.entries(evaluation.attributes_snapshot).map(
                    ([key, val]) => {
                      const isViolationAttr = key === violationAttr;
                      const isNull = val === null;
                      return (
                        <tr
                          key={key}
                          className="border-b border-border/60 last:border-b-0"
                        >
                          <td className="px-3 py-1.5 text-muted">{key}</td>
                          <td
                            className={
                              "px-3 py-1.5 text-right " +
                              (isViolationAttr
                                ? "font-semibold text-crimson"
                                : isNull
                                  ? "text-amber"
                                  : "text-text")
                            }
                          >
                            {renderValue(val)}
                            {isNull ? (
                              <span className="ml-1 text-[10px] uppercase text-amber">
                                missing
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                onClose();
                openEvidence({ type: "evaluation", evaluation });
              }}
            >
              Open full evidence record →
            </Button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
