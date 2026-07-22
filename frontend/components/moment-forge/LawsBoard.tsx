"use client";

import { useLaws } from "@/lib/hooks";
import type { LawResult } from "@/lib/schemas";
import { LAW_SCENARIOS } from "./content";
import type { ForgeScenario } from "./fixtures";

/* Laws of the Moment — proven, not asserted. This calls the backend, which CHECKS
   each invariant live over a deterministic battery (six seed policies × 200
   sessions) and returns PROVEN with the number of cases it stood up to. The prose
   codex is gone: the statements now come from the prover, and a law that ever
   falsified would show its counterexample here. Platform laws that live in the DB
   layer name the test that owns them rather than fake a green light. */

function StatusBadge({ law }: { law: LawResult }) {
  const tone =
    law.status === "PROVEN" ? "var(--c-teal)"
      : law.status === "FALSIFIED" ? "var(--c-crimson)"
        : "var(--c-offer-blue)";
  const glyph = law.status === "PROVEN" ? "✓" : law.status === "FALSIFIED" ? "✕" : "▪";
  const label = law.mode === "live" ? law.status : "PLATFORM";
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: tone, borderColor: tone, backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)` }}
    >
      <span aria-hidden>{glyph}</span>
      {label}
    </span>
  );
}

export function LawsBoard({ onRun }: { onRun: (s: ForgeScenario) => void }) {
  const q = useLaws();

  if (q.isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface-2/40" />
        ))}
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface/40 px-4 py-6 text-center text-sm text-muted">
        Couldn&apos;t reach the prover — start the backend on :8000 to run the laws live.
      </p>
    );
  }

  const { laws, summary, note } = q.data;

  return (
    <div className="space-y-4">
      {/* the meta-result: this is proof, with a real case count */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
        style={{ borderColor: summary.all_proven ? "color-mix(in srgb, var(--c-teal) 45%, transparent)" : "var(--c-crimson)" }}
      >
        <p className="text-sm font-semibold text-text">
          {summary.all_proven ? (
            <><span className="text-teal">{summary.proven} laws proven live</span> — checked over{" "}
              {summary.cases_checked.toLocaleString()} cases just now. Not a claim.</>
          ) : (
            <span className="text-crimson">{summary.falsified} law(s) falsified — see the counterexample below.</span>
          )}
        </p>
        <span className="font-mono text-xs text-muted">
          {summary.live} live · {summary.total - summary.live} platform (DB-enforced)
        </span>
      </div>

      <ol className="grid list-none gap-4 md:grid-cols-2">
        {laws.map((law) => {
          const scenario = LAW_SCENARIOS[law.n] as ForgeScenario | undefined;
          return (
            <li key={law.n}>
              <article className="holo-card relative flex h-full flex-col overflow-hidden rounded-2xl p-5">
                <span aria-hidden className="pointer-events-none absolute -right-2 -top-3 font-mono text-6xl font-bold text-text/[0.06]">
                  {law.n}
                </span>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="max-w-[70%] text-base font-semibold tracking-tight text-text">
                    <span className="sr-only">Law {law.n}: </span>
                    {law.title}
                  </h3>
                  <StatusBadge law={law} />
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{law.statement}</p>

                {law.mode === "live" ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-teal">
                      ✓ proven · {law.cases.toLocaleString()} case{law.cases === 1 ? "" : "s"} checked live
                    </span>
                    {law.status === "FALSIFIED" ? (
                      <span className="font-mono text-[11px] text-crimson">✕ {law.detail}</span>
                    ) : null}
                    {scenario ? (
                      <button
                        type="button"
                        onClick={() => onRun(scenario)}
                        className="press ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-teal/40 bg-teal/10 px-3 py-1.5 font-mono text-xs font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                      >
                        ▸ Run it <span aria-hidden>→</span>
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 font-mono text-[11px] text-muted">
                    platform invariant · {law.detail}
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ol>

      <p className="max-w-[72ch] text-xs leading-relaxed text-muted">{note}</p>
    </div>
  );
}
