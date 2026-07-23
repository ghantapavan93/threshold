"use client";

import { useState } from "react";
import { logAction } from "@/lib/story-log";

/* Enter the Machine — follow one transaction through the whole system and watch
   every layer stay aligned to the same moment. Scrub the timeline; each component
   lights as the transaction reaches it, and the four lenses below answer, for that
   exact step: what did the customer see, what rule decided it, what ran, and what
   proves it happened.

   The point is synchronisation — four separate pages for frontend / backend / logs
   / evidence never let you feel that one decision moving through all of them at
   once. 2D on purpose: the understanding is in the alignment, not in a flythrough. */

type Stage = {
  key: string;
  label: string;
  customer: string; // what the customer saw
  domain: string; // which business rule decided
  runtime: string; // what service / store / queue ran
  evidence: string; // what proves it
};

const STAGES: Stage[] = [
  { key: "interface", label: "Interface", customer: "Checkout is confirming; the placement slot is still empty.", domain: "No decision yet — the moment has only just opened.", runtime: "Next.js client posts the replay request to the API.", evidence: "Request id minted; nothing appended yet." },
  { key: "api", label: "API boundary", customer: "Still confirming — the customer waits on nothing.", domain: "Request validated against the policy-change contract.", runtime: "FastAPI validates the payload; rejects malformed input fail-closed.", evidence: "Inbound request logged with its request id." },
  { key: "policy", label: "Policy domain", customer: "Sees only the transaction; the offer decision is invisible to them.", domain: "V17 vs V18 evaluated per session; the missing-attribute band is flagged.", runtime: "Deterministic core runs — no AI, no network, same input → same output.", evidence: "Per-session decision diff recorded." },
  { key: "replay", label: "Replay engine", customer: "Unaffected — this is historical sessions, replayed as-of a snapshot.", domain: "Constraint catalog checked; 21 sessions found silently widened.", runtime: "200 seeded sessions replayed at a fixed seed; failures injected.", evidence: "Constraint results + fail-closed proofs captured." },
  { key: "persistence", label: "Persistence", customer: "No customer-visible change.", domain: "The decision and its downstream intent form one unit of work.", runtime: "Decision + outbox rows committed in a single transaction.", evidence: "Row written; commit is atomic — all or nothing." },
  { key: "outbox", label: "Outbox", customer: "No customer-visible change.", domain: "Downstream obligations are intent, not yet delivery.", runtime: "Three fan-out events staged in the transactional outbox.", evidence: "Outbox rows pending, keyed for dedupe." },
  { key: "worker", label: "Worker", customer: "No customer-visible change.", domain: "Effectively-once: a retry must not double an obligation.", runtime: "Background worker drains with backoff + dead-lettering.", evidence: "Publish attempts + retry counts recorded." },
  { key: "evidence", label: "Evidence", customer: "No customer-visible change.", domain: "Every claim must trace to a record.", runtime: "Append-only log hash-chained and sealed with a signed head.", evidence: "Tamper-evident audit trail — edits and truncation both break it." },
  { key: "verdict", label: "Verdict", customer: "The change never reached them — it was caught pre-flight.", domain: "A gate outcome, never “safe to launch”.", runtime: "Verdict resolved: BLOCKED on the widened band.", evidence: "Verdict record links back to every constraint and proof above." },
];

const LENSES = [
  { key: "customer", label: "Customer", tone: "var(--c-offer-blue)" },
  { key: "domain", label: "Domain", tone: "var(--c-teal)" },
  { key: "runtime", label: "Runtime", tone: "var(--c-amber)" },
  { key: "evidence", label: "Evidence", tone: "var(--c-text)" },
] as const;

export function EnterMachine() {
  const [i, setI] = useState(0);
  const [lens, setLens] = useState<(typeof LENSES)[number]["key"]>("customer");
  const stage = STAGES[i]!;

  return (
    <div className="mx-auto max-w-3xl">
      {/* the pipeline — each node lights as the transaction reaches it */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-3 h-px" style={{ backgroundColor: "var(--c-border)" }} />
        <div
          className="absolute left-0 top-3 h-px transition-all duration-300"
          style={{ width: `${(i / (STAGES.length - 1)) * 100}%`, backgroundColor: "var(--c-teal)" }}
        />
        <ol className="scroll-x relative flex items-start justify-between gap-1 overflow-x-auto pb-1">
          {STAGES.map((s, idx) => {
            const done = idx < i;
            const on = idx === i;
            const tone = on || done ? "var(--c-teal)" : "var(--c-muted)";
            return (
              <li key={s.key} className="flex min-w-0 shrink-0 flex-col items-center" style={{ flex: "1 0 auto" }}>
                <button
                  type="button"
                  onClick={() => setI(idx)}
                  aria-current={on ? "step" : undefined}
                  className="flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <span
                    className="h-3 w-3 rounded-full border-2 transition-colors"
                    style={{
                      borderColor: tone,
                      backgroundColor: on ? "var(--c-teal)" : done ? "color-mix(in srgb, var(--c-teal) 30%, transparent)" : "var(--c-base)",
                      boxShadow: on ? "0 0 10px -1px var(--c-teal)" : "none",
                    }}
                  />
                  <span className="whitespace-nowrap px-1 text-[10px] font-medium" style={{ color: on ? "var(--c-text)" : "var(--c-muted)" }}>
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* scrubber */}
      <input
        type="range"
        min={0}
        max={STAGES.length - 1}
        value={i}
        onChange={(e) => setI(Number(e.target.value))}
        aria-label="Scrub the transaction through the system"
        className="mt-5 w-full accent-teal"
      />

      {/* the four synchronised lenses */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {LENSES.map((l) => {
          const active = lens === l.key;
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => { logAction("traced_the_machine"); setLens(l.key); }}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              style={
                active
                  ? { borderColor: l.tone, color: l.tone, backgroundColor: `color-mix(in srgb, ${l.tone} 12%, transparent)` }
                  : { borderColor: "var(--c-border)", color: "var(--c-muted)" }
              }
            >
              {l.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-[5rem] rounded-xl border border-border bg-surface/50 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          {stage.label} · {LENSES.find((l) => l.key === lens)!.label} lens
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text">{stage[lens]}</p>
      </div>
    </div>
  );
}
