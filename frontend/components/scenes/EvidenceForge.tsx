"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* The Evidence Forge — the AI story as a transformation, not a list of tool names.
   Proposals flow in; deterministic evidence decides what survives. Unsupported
   claims are rejected (crimson), over-reaching ones are refined (amber), and the
   ones that hold crystallise (teal). The point is orchestration, not autocomplete:
   AI creates possibilities, evidence is the judge, and the product comes out
   smaller and stronger.

   Every row is a real decision made building Threshold — the honest record of what
   an early AI proposal claimed and what it became once it had to survive. */

type Verdict = "rejected" | "refined" | "verified";
const TONE: Record<Verdict, string> = {
  rejected: "var(--c-crimson)",
  refined: "var(--c-amber)",
  verified: "var(--c-teal)",
};
const WORD: Record<Verdict, string> = { rejected: "Rejected", refined: "Refined", verified: "Verified" };

type Item = { claim: string; verdict: Verdict; became: string; why: string };

const ITEMS: Item[] = [
  { claim: "Exactly-once delivery", verdict: "rejected", became: "At-least-once + idempotent, deduplicated business-state transitions", why: "Exactly-once across a network is a myth; the honest guarantee is dedupe on a stable key." },
  { claim: "An LLM scores each session's risk", verdict: "rejected", became: "A deterministic constraint catalog — no AI in the critical path", why: "A safety gate must be replayable and explainable; a model in the hot path is neither." },
  { claim: "Refund handled through the Cart API", verdict: "rejected", became: "Confirmed cancellation through the documented cancellation flow", why: "No such Cart refund path exists; the invented API would have failed silently." },
  { claim: "Amounts as floating-point currency", verdict: "rejected", became: "Whole minor units + ISO-4217 currency code", why: "Floats lose cents at the seam; money is integer minor units with an explicit currency." },
  { claim: "Threshold proves the change lifted the number", verdict: "refined", became: "Threshold proves structural safety; a Would-Have-Seen holdout proves lift", why: "Structural safety and causal lift are different claims — don't conflate them." },
  { claim: "One shared session model across the whole platform", verdict: "refined", became: "Bounded contexts + anticorruption layers, translated at each seam", why: "A single ubiquitous model collapses under conflicting definitions of 'conversion'." },
  { claim: "Append-only, tamper-evident audit trail", verdict: "verified", became: "Hash-chained records sealed with a signed head — truncation-detectable", why: "This one held: it was implementable and it is implemented, and it verifies." },
];

export function EvidenceForge() {
  const [open, setOpen] = useState<number | null>(null);
  const counts = ITEMS.reduce(
    (a, it) => ({ ...a, [it.verdict]: a[it.verdict] + 1 }),
    { rejected: 0, refined: 0, verified: 0 } as Record<Verdict, number>,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <span>{ITEMS.length} proposals in →</span>
        {(["verified", "refined", "rejected"] as Verdict[]).map((v) => (
          <span key={v} style={{ color: TONE[v] }}>
            {counts[v]} {WORD[v].toLowerCase()}
          </span>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {ITEMS.map((it, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className="overflow-hidden rounded-xl border" style={{ borderColor: `color-mix(in srgb, ${TONE[it.verdict]} 40%, transparent)` }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                <span className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide" style={{ color: TONE[it.verdict], backgroundColor: `color-mix(in srgb, ${TONE[it.verdict]} 12%, transparent)` }}>
                  {WORD[it.verdict]}
                </span>
                <span className="min-w-0 flex-1 text-sm text-text">
                  <span className={it.verdict === "rejected" ? "line-through opacity-70" : ""}>{it.claim}</span>
                </span>
                <span aria-hidden className="text-muted">{isOpen ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="border-t px-4 py-3 text-sm"
                    style={{ borderColor: "var(--c-border)" }}
                  >
                    <p className="text-text">
                      <span className="text-muted">became → </span>
                      {it.became}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">{it.why}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        AI widened the search; deterministic evidence narrowed it. The product got smaller and stronger —
        that&apos;s orchestration, not autocomplete.
      </p>
    </div>
  );
}
