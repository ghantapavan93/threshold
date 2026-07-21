"use client";

import { motion } from "framer-motion";
import { useConsole } from "./console-context";
import { useStageActive } from "./walkthrough";
import { Button, Card, Chip, EmptyState, Section } from "./ui/primitives";
import { VERDICT_COLOR, VERDICT_LABEL } from "@/lib/utils";
import type { HoldoutConfig } from "@/lib/schemas";

function exportHoldoutConfig(config: HoldoutConfig, jobId: string) {
  // Export the verified config verbatim as returned by the backend.
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `holdout-config-${jobId}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const VERDICT_GLOW: Record<string, string> = {
  ELIGIBLE_FOR_HOLDOUT: "glow-teal",
  INSUFFICIENT_EVIDENCE: "glow-amber",
  BLOCKED: "glow-crimson",
};

export function ReleaseVerdict() {
  const { job } = useConsole();
  const verdict = job?.verdict ?? null;
  // The final beat: re-stamp the emblem each time the walkthrough lands here (and
  // on every new verdict). Keying the block on this remounts it, replaying the
  // CSS stamp animation.
  const { visits } = useStageActive("release-verdict");
  const stampKey = `${verdict?.value ?? "none"}-${visits}`;

  return (
    <Section
      id="release-verdict"
      index={8}
      title="Release Verdict"
      subtitle="A deterministic gate outcome — never “safe to launch”. A positive verdict is only eligibility for a controlled online holdout."
    >
      {!verdict ? (
        <EmptyState
          title="No verdict yet"
          hint="Run a Policy Diff Replay to produce a release verdict."
        />
      ) : (
        <motion.div
          key={verdict.value}
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card
            className={"overflow-hidden " + (VERDICT_GLOW[verdict.value] ?? "")}
            style={{ borderColor: VERDICT_COLOR[verdict.value] }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-4 p-6"
              style={{
                background: `linear-gradient(180deg, color-mix(in srgb, ${VERDICT_COLOR[verdict.value]} 12%, transparent), transparent)`,
              }}
            >
              <div key={stampKey} className="verdict-stamp flex items-center gap-4">
                <span
                  aria-hidden
                  className="flex h-14 w-14 items-center justify-center rounded-xl border text-2xl font-bold"
                  style={{
                    borderColor: VERDICT_COLOR[verdict.value],
                    color: VERDICT_COLOR[verdict.value],
                  }}
                >
                  {verdict.value === "BLOCKED"
                    ? "⛔"
                    : verdict.value === "ELIGIBLE_FOR_HOLDOUT"
                      ? "✓"
                      : "?"}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">
                    Release verdict
                  </p>
                  <p
                    className="text-2xl font-bold tracking-tight sm:text-3xl"
                    style={{
                      color: VERDICT_COLOR[verdict.value],
                      textShadow: `0 0 26px color-mix(in srgb, ${VERDICT_COLOR[verdict.value]} 55%, transparent)`,
                    }}
                    aria-live="polite"
                  >
                    {VERDICT_LABEL[verdict.value]}
                  </p>
                </div>
              </div>

              {verdict.value === "ELIGIBLE_FOR_HOLDOUT" && verdict.holdout_config ? (
                <Button
                  variant="primary"
                  onClick={() =>
                    exportHoldoutConfig(verdict.holdout_config as HoldoutConfig, job!.id)
                  }
                >
                  ⇩ Export Holdout Config
                </Button>
              ) : null}
            </div>

            <div className="border-t border-border p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Reasons
              </p>
              {verdict.reasons.length === 0 ? (
                <p className="text-sm text-muted">No reasons provided.</p>
              ) : (
                <ul className="space-y-1.5">
                  {verdict.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span
                        aria-hidden
                        style={{ color: VERDICT_COLOR[verdict.value] }}
                      >
                        •
                      </span>
                      <span className="font-mono text-xs leading-relaxed text-text">
                        {r}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {verdict.holdout_config ? (
                <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Verified holdout config (5% control)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Chip color="var(--c-teal)">
                      control_pct {verdict.holdout_config.control_pct}%
                    </Chip>
                    <Chip color="var(--c-muted)">
                      primary_metric {verdict.holdout_config.primary_metric}
                    </Chip>
                    <Chip color="var(--c-muted)">
                      min_uplift_pct {verdict.holdout_config.min_uplift_pct}%
                    </Chip>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Variant options (verbatim)
                  </p>
                  <ul className="mt-1 space-y-1 font-mono text-xs text-text">
                    {verdict.holdout_config.variant_options.map((v, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden className="text-muted">
                          {i + 1}.
                        </span>
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Card>
        </motion.div>
      )}
    </Section>
  );
}
