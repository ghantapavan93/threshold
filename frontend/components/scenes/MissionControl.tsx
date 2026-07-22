"use client";

import { Fragment, useState } from "react";

/* Mission Control — could an engineer operate this at 2 a.m.? One correlated view
   of a single failed session across trace, policy, customer outcome, decision
   duration, the constraint responsible, outbox status, retries, and evidence — no
   hunting across unrelated panels. Then three operational conditions prove the
   observability is diagnostic, not decorative: Healthy flows; Degraded grows the
   queue and latency while checkout stays protected; Recovering drains the backlog
   with no duplicate business state.

   The numbers here are MODELED illustrations of the shape, not a live production
   feed — labelled as such, in keeping with the project's honesty discipline. */

type Cond = "healthy" | "degraded" | "recovering";

const CONDS: { key: Cond; label: string; tone: string }[] = [
  { key: "healthy", label: "Healthy", tone: "var(--c-teal)" },
  { key: "degraded", label: "Degraded", tone: "var(--c-amber)" },
  { key: "recovering", label: "Recovering", tone: "var(--c-offer-blue)" },
];

const METRICS: Record<Cond, { p99: string; queue: string; errBudget: string; checkout: string; dupes: string }> = {
  healthy: { p99: "38 ms", queue: "0", errBudget: "100%", checkout: "protected", dupes: "0" },
  degraded: { p99: "210 ms", queue: "1,840 ↑", errBudget: "94%", checkout: "protected", dupes: "0" },
  recovering: { p99: "72 ms", queue: "310 ↓", errBudget: "97% ↑", checkout: "protected", dupes: "0" },
};

// The correlated record for one caught session — the thing you'd want in one place.
const RECORD: { k: string; v: string; tone?: string }[] = [
  { k: "trace", v: "4b9f…a1c2" },
  { k: "policy version", v: "V17 → V18" },
  { k: "customer result", v: "No Offer Rendered", tone: "var(--c-teal)" },
  { k: "decision", v: "1.9 ms · deterministic" },
  { k: "constraint", v: "missing-attribute-semantics", tone: "var(--c-crimson)" },
  { k: "outbox", v: "3 staged · 3 published" },
  { k: "retries", v: "1 (backoff, then ack)" },
  { k: "evidence", v: "record #212 · hash-chained" },
];

export function MissionControl() {
  const [cond, setCond] = useState<Cond>("degraded");
  const m = METRICS[cond];
  const tone = CONDS.find((c) => c.key === cond)!.tone;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center gap-2">
        {CONDS.map((c) => {
          const on = cond === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCond(c.key)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              style={on ? { borderColor: c.tone, color: c.tone, backgroundColor: `color-mix(in srgb, ${c.tone} 12%, transparent)` } : { borderColor: "var(--c-border)", color: "var(--c-muted)" }}
            >
              {c.label}
            </button>
          );
        })}
        <span className="ml-auto rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
          modeled
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* live metrics for the chosen condition */}
        <div className="rounded-2xl border border-border bg-base/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Operational signal</p>
          <dl className="mt-3 space-y-2 font-mono text-xs">
            <Row k="decision p99" v={m.p99} />
            <Row k="outbox queue" v={m.queue} tone={cond === "degraded" ? "var(--c-amber)" : cond === "recovering" ? "var(--c-offer-blue)" : "var(--c-teal)"} />
            <Row k="error budget" v={m.errBudget} />
            <Row k="checkout" v={m.checkout} tone="var(--c-teal)" />
            <Row k="duplicate business state" v={m.dupes} tone="var(--c-teal)" />
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            {cond === "healthy" && "Everything flows. Nothing to do."}
            {cond === "degraded" && "Latency and the queue climb — but the checkout stays protected and no obligation is doubled."}
            {cond === "recovering" && "The dependency returned; the backlog drains under bounded retries, still zero duplicates."}
          </p>
        </div>

        {/* one correlated record — no searching */}
        <div className="rounded-2xl border p-4" style={{ borderColor: `color-mix(in srgb, ${tone} 40%, transparent)` }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">One caught session · correlated</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
            {RECORD.map((r) => (
              <Fragment key={r.k}>
                <dt className="text-muted">{r.k}</dt>
                <dd className="text-right" style={{ color: r.tone ?? "var(--c-text)" }}>{r.v}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{k}</dt>
      <dd style={{ color: tone ?? "var(--c-text)" }}>{v}</dd>
    </div>
  );
}
