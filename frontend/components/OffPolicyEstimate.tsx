"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useOpeEstimate } from "@/lib/hooks";
import { Section } from "./ui/primitives";

/* Off-policy value estimate — the pre-holdout read a staff engineer asks for:
   "before you run an online test, can you estimate the change's value from
   logged data?" Yes, when the OLD policy's action probabilities were logged.
   This runs a real SNIPS / doubly-robust estimator (backend, tested) with an
   effective-sample-size gate that REFUSES when support is thin — and never
   replaces the mandatory Would-Have-Seen holdout. */

type Mode = "healthy" | "dr" | "skewed";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "healthy", label: "Adequate support", hint: "SNIPS over well-behaved weights" },
  { id: "dr", label: "With a reward model", hint: "doubly-robust estimate" },
  { id: "skewed", label: "Skewed weights", hint: "a few sessions dominate → refused" },
];

function makeSample(mode: Mode) {
  const N = 200;
  const rewards: number[] = [];
  const target_p: number[] = [];
  const logging_p: number[] = [];
  const reward_hat: number[] = [];
  for (let i = 0; i < N; i++) {
    const rewarded = i % 5 < 2 ? 1 : 0; // 40% base reward rate, deterministic
    rewards.push(rewarded);
    if (mode === "skewed") {
      target_p.push(i < 3 ? 0.9 : 0.002);
      logging_p.push(i < 3 ? 0.002 : 0.9);
    } else {
      logging_p.push(0.4);
      // the new policy shifts probability toward the rewarded action → lift
      target_p.push(rewarded ? 0.52 : 0.34);
    }
    reward_hat.push(rewarded ? 0.85 : 0.1); // deliberately imperfect model
  }
  return { rewards, target_p, logging_p, reward_hat: mode === "dr" ? reward_hat : null };
}

export function OffPolicyEstimate() {
  const [mode, setMode] = useState<Mode>("healthy");
  const ope = useOpeEstimate();
  const d = ope.data;
  const baseline = 0.4; // the sample's true base reward rate, for contrast

  return (
    <Section
      id="ope"
      index={12}
      title="Pre-holdout value estimate"
      subtitle="Before an online test, can you estimate a change's value from logged data? Yes — when the old policy's action probabilities were logged. This runs a real SNIPS / doubly-robust estimator with an effective-sample-size gate that refuses when support is thin. It narrows what to test; it never replaces the holdout."
    >
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3 font-mono text-xs text-muted">
          <span className="text-teal">ope$</span>
          <span>estimate</span>
          <div className="ml-1 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Estimator scenario">
            {MODES.map((m) => {
              const on = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setMode(m.id)}
                  className={`press min-h-[36px] rounded-md border px-2.5 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 ${on ? "border-teal/60 bg-teal/[0.1] text-teal" : "border-border text-muted"}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => ope.mutate(makeSample(mode))}
            disabled={ope.isPending}
            className="press ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
          >
            {ope.isPending ? "estimating…" : "▸ Estimate the new policy's value"}
          </button>
        </div>

        <div aria-live="polite" className="mt-4 min-h-[6rem]">
          {ope.isError ? (
            <p className="font-mono text-sm text-crimson">
              ✕ {ope.error instanceof ApiError && ope.error.isUnreachable ? "Estimator unreachable — start the API on :8000." : "Estimate failed."}
            </p>
          ) : !d ? (
            <p className="font-mono text-xs text-muted">
              200 logged decisions, deterministic. “{MODES.find((m) => m.id === mode)?.hint}”. The base reward rate is {baseline}.
            </p>
          ) : d.verdict === "ESTIMATED" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">estimated value · {d.method}</p>
                  <p className="mt-1 font-mono text-4xl font-bold text-teal">{d.estimate}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted">
                    95% CI [{d.ci95?.[0]}, {d.ci95?.[1]}] · vs base {baseline}
                  </p>
                </div>
                <div className="font-mono text-[11px] text-muted">
                  <p>ESS <span className="text-text">{d.ess}</span> / n {d.n}</p>
                  <p>SE <span className="text-text">{d.se}</span></p>
                  <p>min ESS {d.min_ess}</p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full border border-border/60">
                <span className="block h-full bg-teal" style={{ width: `${Math.min((d.estimate ?? 0) * 100, 100)}%` }} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber/40 bg-amber/[0.06] p-3">
              <p className="font-mono text-sm font-semibold text-amber">⚠ INSUFFICIENT_EVIDENCE — refused</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{d.reason}</p>
              <p className="mt-1.5 font-mono text-[11px] text-muted">ESS {d.ess} / n {d.n} · min {d.min_ess}</p>
            </div>
          )}
        </div>

        {d ? (
          <p className="mt-3 border-t border-border/60 pt-3 text-[11px] leading-relaxed text-muted">
            {d.note}
          </p>
        ) : null}
      </div>
    </Section>
  );
}
