"use client";

import { useEffect } from "react";
import { Card, EmptyState, Section } from "./ui/primitives";
import { TruthLabel } from "./ui/TruthLabel";
import { useTrustBudget } from "@/lib/hooks";
import type { TrustAction, TrustStep } from "@/lib/schemas";

/* Trust Budget — attention as a scarce, deterministic budget. A stream of candidate
   offers is judged SHOW / DEFER / SUPPRESS by a pure function of the interaction
   history; "no experience" is an intentional decision, not an absence. The LLM never
   decides whether attention may be spent. Law: an optional experience must earn the
   right to consume attention. */

const ACTION_TONE: Record<TrustAction, string> = {
  SHOW: "var(--c-teal)",
  DEFER: "var(--c-offer-blue)",
  SUPPRESS: "var(--c-crimson)",
};

const ACTION_GLYPH: Record<TrustAction, string> = {
  SHOW: "✓",
  DEFER: "▸",
  SUPPRESS: "✕",
};

const REACTION_LABEL: Record<string, string> = {
  engaged: "engaged ♥",
  dismissed: "dismissed ✕",
};

function ActionBadge({ action }: { action: TrustAction }) {
  const tone = ACTION_TONE[action];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: tone, borderColor: tone, backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)` }}
    >
      <span aria-hidden>{ACTION_GLYPH[action]}</span>
      {action}
    </span>
  );
}

function StepRow({ step, max }: { step: TrustStep; max: number }) {
  const d = step.decision;
  const tone = ACTION_TONE[d.action];
  const availPct = Math.max(0, Math.min(100, (d.available / max) * 100));
  const costPct = Math.max(0, Math.min(100, (d.candidate_cost / max) * 100));
  return (
    <Card className="flex flex-col gap-2 p-3.5" style={{ borderColor: `color-mix(in srgb, ${tone} 35%, transparent)` }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="font-mono text-[11px] text-muted">t={step.event_time}s</span>
          <span className="truncate text-sm font-semibold text-text">{step.category}</span>
          <span className="font-mono text-[10px] text-muted">conf {step.confidence}</span>
          {step.reaction && REACTION_LABEL[step.reaction] ? (
            <span className="font-mono text-[10px] text-muted">· {REACTION_LABEL[step.reaction]}</span>
          ) : null}
        </div>
        <ActionBadge action={d.action} />
      </div>
      {/* attention budget bar: filled = available, tick = what showing would cost */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2/70">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${availPct}%`, backgroundColor: "color-mix(in srgb, var(--c-teal) 55%, transparent)" }} />
        <div className="absolute inset-y-[-2px] w-[2px] bg-amber" style={{ left: `${costPct}%` }} title={`cost ${d.candidate_cost}`} />
      </div>
      <p className="text-xs leading-relaxed text-muted">
        <span className="font-mono" style={{ color: tone }}>
          avail {Math.round(d.available)} / cost {Math.round(d.candidate_cost)}
          {d.frustration > 0 ? ` · frustration ${d.frustration}` : ""}
        </span>
        {" — "}
        {d.reason}
      </p>
    </Card>
  );
}

const SCENARIO_ORDER = ["healthy", "serial_dismisser", "category_spam", "sensitive_checkout", "recovery"];

export function TrustBudget() {
  const tb = useTrustBudget();
  const data = tb.data;
  const active = data?.scenario;

  // Self-demonstrate: run the most illustrative scenario on mount.
  useEffect(() => {
    tb.mutate({ scenario: "serial_dismisser" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scenarios = data?.scenarios ?? SCENARIO_ORDER;

  return (
    <Section
      id="trust-budget"
      index={14}
      title="Trust Budget"
      subtitle="A single offer can look relevant yet turn irritating after repeated exposures and rejections. Trust Budget treats attention as scarce: it depletes with exposure, depletes faster with rejection, recovers over time, and gates every optional experience — SHOW, DEFER, or SUPPRESS — with a deterministic decision."
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="LIVE" /> the gate decides each arrival now
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="MODELED" /> a deterministic attention model, no LLM in the path
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="HYPOTHESIS" /> an LLM could rank relevance — never spend attention
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {scenarios.map((name) => {
          const on = name === active;
          return (
            <button
              key={name}
              type="button"
              onClick={() => tb.mutate({ scenario: name })}
              disabled={tb.isPending}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                color: on ? "var(--c-teal)" : "var(--c-muted)",
                borderColor: on ? "var(--c-teal)" : "var(--c-border)",
                backgroundColor: on ? "color-mix(in srgb, var(--c-teal) 12%, transparent)" : "transparent",
              }}
            >
              {name.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>

      {tb.isError ? (
        <EmptyState title="Trust Budget could not reach the engine." hint="Start the backend on :8000 and pick a scenario." />
      ) : !data ? (
        <EmptyState title="Running a scenario…" hint="Attention as a budget: SHOW, DEFER, or SUPPRESS." />
      ) : (
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">{data.label}</p>
              <p className="mt-0.5 text-xs text-muted">{data.blurb}</p>
              {data.transaction_sensitivity > 0 ? (
                <p className="mt-1 font-mono text-[10px] text-amber">
                  transaction_sensitivity {data.transaction_sensitivity} — budget shrunk to protect the checkout
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2 font-mono text-xs">
              {(["SHOW", "DEFER", "SUPPRESS"] as TrustAction[]).map((a) => (
                <span
                  key={a}
                  className="rounded-md border px-2 py-1"
                  style={{ color: ACTION_TONE[a], borderColor: `color-mix(in srgb, ${ACTION_TONE[a]} 40%, transparent)` }}
                >
                  {a[0] + a.slice(1).toLowerCase()}{" "}
                  {data.summary[a.toLowerCase() as "show" | "defer" | "suppress"]}
                </span>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            {data.steps.map((s, i) => (
              <StepRow key={i} step={s} max={data.policy.max_budget} />
            ))}
          </div>

          <p className="border-l-2 border-teal/60 pl-3 text-sm font-medium text-text">
            {data.law}
          </p>
          <p className="max-w-[70ch] text-xs leading-relaxed text-muted">{data.note}</p>
        </div>
      )}
    </Section>
  );
}
