"use client";

import { useState } from "react";

/* The Scale Chamber — Rokt runs 10B+ transactions a year (their public figure, not
   a claim about this prototype). Turn the traffic dial and the architecture
   physically evolves: a single node grows a worker and outbox, then partitioned
   replay, then regional failover and backpressure. What is impressive is not a
   huge number — it is knowing exactly where evidence ends and projection begins,
   so every tier is labelled MEASURED / MODELED / HYPOTHESIS. Only the local tier
   is measured; the rest is honest architecture, not a benchmark we have run. */

type Truth = "MEASURED" | "MODELED" | "HYPOTHESIS";
const TRUTH_TONE: Record<Truth, string> = {
  MEASURED: "var(--c-teal)",
  MODELED: "var(--c-amber)",
  HYPOTHESIS: "var(--c-muted)",
};

type Tier = {
  label: string;
  truth: Truth;
  adds: string; // what appears in the architecture at this tier
  p99: string;
  throughput: string;
  recovery: string;
};

const TIERS: Tier[] = [
  { label: "Local", truth: "MEASURED", adds: "One service · one database", p99: "1.9 ms / decision", throughput: "200 sessions, deterministic", recovery: "n/a — single node" },
  { label: "Team", truth: "MODELED", adds: "+ background worker + transactional outbox", p99: "~5 ms", throughput: "~1k decisions/s", recovery: "worker restart, bounded backoff" },
  { label: "Regional", truth: "MODELED", adds: "+ partitioned replay workers + queue control", p99: "~12 ms p99", throughput: "~50k decisions/s", recovery: "partition rebalance, no dup state" },
  { label: "Global", truth: "HYPOTHESIS", adds: "+ region ownership + failover + backpressure", p99: "~20 ms p99 (projected)", throughput: "10B+/yr envelope (Rokt public)", recovery: "region failover, async evidence" },
];

const COMPONENTS = ["API", "Policy core", "Replay", "Persistence", "Outbox", "Worker", "Partitions", "Failover"];
// how many of the components above are lit at each tier
const LIT_AT = [5, 6, 7, 8];

export function ScaleChamber() {
  const [t, setT] = useState(0);
  const tier = TIERS[t]!;
  const lit = LIT_AT[t]!;

  return (
    <div className="mx-auto max-w-3xl">
      {/* the dial */}
      <div className="flex flex-wrap items-center gap-2">
        {TIERS.map((tr, i) => {
          const on = i === t;
          return (
            <button
              key={tr.label}
              type="button"
              onClick={() => setT(i)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              style={on ? { borderColor: "var(--c-teal)", color: "var(--c-teal)", backgroundColor: "color-mix(in srgb, var(--c-teal) 12%, transparent)" } : { borderColor: "var(--c-border)", color: "var(--c-muted)" }}
            >
              {tr.label}
            </button>
          );
        })}
        <span
          className="ml-auto rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
          style={{ borderColor: TRUTH_TONE[tier.truth], color: TRUTH_TONE[tier.truth] }}
        >
          {tier.truth}
        </span>
      </div>

      {/* the architecture, evolving */}
      <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border border-border bg-base/50 p-4">
        {COMPONENTS.map((c, i) => {
          const on = i < lit;
          return (
            <span
              key={c}
              className="rounded-md border px-2.5 py-1 font-mono text-[11px] transition-all duration-300"
              style={{
                borderColor: on ? "color-mix(in srgb, var(--c-teal) 45%, transparent)" : "var(--c-border)",
                color: on ? "var(--c-text)" : "color-mix(in srgb, var(--c-muted) 55%, transparent)",
                backgroundColor: on ? "color-mix(in srgb, var(--c-teal) 8%, transparent)" : "transparent",
                opacity: on ? 1 : 0.4,
              }}
            >
              {c}
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">{tier.adds}</p>

      {/* readouts, each carrying the tier's truth label */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="decision p99" value={tier.p99} truth={tier.truth} />
        <Stat label="throughput" value={tier.throughput} truth={tier.truth} />
        <Stat label="recovery" value={tier.recovery} truth={tier.truth} />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Only <span style={{ color: "var(--c-teal)" }}>Local</span> is measured — a single-node
        deterministic replay. Everything above is architecture and projection, labelled honestly. The
        credible signal isn&apos;t a big number; it&apos;s knowing precisely where the evidence stops.
      </p>
    </div>
  );
}

function Stat({ label, value, truth }: { label: string; value: string; truth: Truth }) {
  return (
    <div className="rounded-xl border border-border bg-base/50 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{label}</span>
        <span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: TRUTH_TONE[truth] }}>{truth}</span>
      </div>
      <p className="mt-1.5 font-mono text-sm text-text">{value}</p>
    </div>
  );
}
