"use client";

import { useMemo } from "react";
import { Card, EmptyState, Section } from "./ui/primitives";
import { TruthLabel } from "./ui/TruthLabel";
import { ConceptSpec, type Concept } from "./ui/ConceptSpec";
import { useCounterexamples } from "@/lib/hooks";
import type { ForgeCandidate, ForgeOutcome } from "@/lib/schemas";

/* Counterexample Forge — the Builder Vision's strongest AI addition, kept honest.
   A proposer enumerates adversarial fixtures; the REAL deterministic engine judges
   each one. This component only renders the engine's ruling — it decides nothing.
   AI proposes, evidence decides, and the LLM never touches the critical path. */

const OUTCOME_TONE: Record<ForgeOutcome, string> = {
  CONTAINED: "var(--c-teal)",
  SURFACED: "var(--c-offer-blue)",
  SAFE: "var(--c-muted)",
  GAP: "var(--c-crimson)",
};

const OUTCOME_GLYPH: Record<ForgeOutcome, string> = {
  CONTAINED: "✓",
  SURFACED: "▸",
  SAFE: "○",
  GAP: "✕",
};

const OUTCOME_BLURB: Record<ForgeOutcome, string> = {
  CONTAINED: "a hard guard fired — the attack was blocked",
  SURFACED: "seen and routed, not blocked (the holdout's job)",
  SAFE: "no guard needed — the engine's own semantics prevent harm",
  GAP: "real harm with no guard — a genuine bug",
};

const ORDER: ForgeOutcome[] = ["GAP", "CONTAINED", "SURFACED", "SAFE"];

const CONCEPT: Concept = {
  user: "Threshold's own release reviewers — a standing red-team over the gate.",
  problem: "You only test the failure modes you imagined; production breaks on the ones nobody enumerated.",
  boundedContext: "The policy-change safety gate — the context that owns eligibility.",
  data: "The existing policy plus synthetic event-time sessions. No customer data.",
  aiRole: "PROPOSE adversarial fixtures. Today a reproducible enumerator; an LLM proposer is the hypothesis. It never judges.",
  enforcement: "The real deterministic engine judges every fixture; an independent oracle detects silent widening even if a guard regresses.",
  privacy: "Synthetic sessions only — no PII ever enters the harness.",
  guardrail: "It protects customers indirectly: silent eligibility widenings are caught before a single one ships.",
  businessHypothesis: "Fewer escaped policy regressions → fewer bad exposures → protected conversion and trust.",
  experiment: "The harness is the test. A regression flips a green board to a GAP — no separate experiment needed.",
  failure: "Fail-loud: if the engine regresses, a GAP appears. The harness never silently passes.",
};

function OutcomeBadge({ outcome }: { outcome: ForgeOutcome }) {
  const tone = OUTCOME_TONE[outcome];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: tone, borderColor: tone, backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)` }}
    >
      <span aria-hidden>{OUTCOME_GLYPH[outcome]}</span>
      {outcome}
    </span>
  );
}

function CandidateTile({ c }: { c: ForgeCandidate }) {
  const tone = OUTCOME_TONE[c.outcome];
  return (
    <Card className="flex flex-col gap-2 p-4" style={{ borderColor: `color-mix(in srgb, ${tone} 40%, transparent)` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted">{c.category}</p>
          <p className="truncate font-mono text-sm font-semibold text-text">{c.id}</p>
        </div>
        <OutcomeBadge outcome={c.outcome} />
      </div>
      <p className="text-sm leading-relaxed text-muted">{c.rationale}</p>
      <div className="mt-auto scroll-x overflow-x-auto rounded-md border border-border/60 bg-base/60 px-2.5 py-1.5">
        <code className="whitespace-nowrap font-mono text-[10px] text-muted">
          <span style={{ color: tone }}>judge ▸</span> {c.evidence}
        </code>
      </div>
    </Card>
  );
}

export function CounterexampleForge() {
  const forge = useCounterexamples();
  const data = forge.data;

  const ordered = useMemo(() => {
    if (!data) return [];
    return [...data.candidates].sort(
      (a, b) => ORDER.indexOf(a.outcome) - ORDER.indexOf(b.outcome),
    );
  }, [data]);

  const s = data?.summary;

  return (
    <Section
      id="counterexample-forge"
      index={13}
      title="Counterexample Forge"
      subtitle="A proposer enumerates adversarial fixtures — each probing one invariant — and the real deterministic engine judges every one. The proposer suggests what to try; only the engine rules on safety. AI proposes, evidence decides, and no model sits in the critical path."
      actions={
        <button
          type="button"
          onClick={() => forge.mutate({})}
          disabled={forge.isPending}
          className="rounded-lg border border-teal/50 bg-teal/10 px-3 py-1.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/20 disabled:opacity-50"
        >
          {forge.isPending ? "Judging…" : data ? "Re-run the forge" : "Run the forge"}
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="LIVE" /> the engine judges each fixture now
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="MODELED" /> proposer is a reproducible enumerator, not an LLM
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="HYPOTHESIS" /> an LLM proposer is a labelled future extension
        </span>
      </div>

      {forge.isError ? (
        <EmptyState title="The forge could not reach the engine." hint="Start the backend on :8000 and run it again." />
      ) : !data ? (
        <EmptyState
          title="Run the forge to red-team the live engine."
          hint="16 adversarial fixtures across every invariant class — each judged by the real decision path."
        />
      ) : (
        <div className="space-y-4">
          {/* The meta-invariant, front and center. */}
          <Card
            className="flex flex-wrap items-center justify-between gap-3 p-4"
            style={{ borderColor: s!.no_gaps ? "color-mix(in srgb, var(--c-teal) 45%, transparent)" : "var(--c-crimson)" }}
          >
            <div>
              <p className="text-sm font-semibold text-text">
                {s!.no_gaps ? (
                  <>
                    <span className="text-teal">No gaps.</span> Every adversarial fixture was contained, surfaced, or provably safe.
                  </>
                ) : (
                  <>
                    <span className="text-crimson">{s!.gap} gap(s) found.</span> An adversarial fixture produced harm with no guard.
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-muted">
                The GAP verdict is real: an independent ground-truth oracle sees silent widening even if a guard regresses. This is the class of bug the rename-evasion fail-open once was.
              </p>
            </div>
            <div className="flex shrink-0 gap-2 font-mono text-xs">
              {ORDER.slice().reverse().map((o) => (
                <span
                  key={o}
                  className="rounded-md border px-2 py-1"
                  style={{ color: OUTCOME_TONE[o], borderColor: `color-mix(in srgb, ${OUTCOME_TONE[o]} 40%, transparent)` }}
                  title={OUTCOME_BLURB[o]}
                >
                  {o[0] + o.slice(1).toLowerCase()} {s![o.toLowerCase() as "contained" | "surfaced" | "safe" | "gap"]}
                </span>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ordered.map((c) => (
              <CandidateTile key={c.id} c={c} />
            ))}
          </div>

          <p className="max-w-[70ch] text-xs leading-relaxed text-muted">{data.note}</p>
        </div>
      )}
      <div className="mt-4">
        <ConceptSpec spec={CONCEPT} />
      </div>
    </Section>
  );
}
