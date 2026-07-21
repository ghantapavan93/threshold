"use client";

import { TruthLabel } from "./ui/TruthLabel";

/* The Frontier — a deliberate divider between the verified Threshold gate above and
   the three built-but-speculative prototypes below. It frames them as one disciplined
   set: each is a deterministic engine you can run right now, but the FUTURE each one
   implies is a labelled hypothesis, not part of Threshold's verified thesis. */

const CONCEPTS = [
  {
    href: "#counterexample-forge",
    n: "13",
    title: "Counterexample Forge",
    question: "How do you find the failure modes you didn't imagine?",
    line: "A proposer enumerates adversarial fixtures; the real engine judges each — 0 gaps, or it says where.",
  },
  {
    href: "#trust-budget",
    n: "14",
    title: "Trust Budget",
    question: "How is “show nothing” a decision, not an accident?",
    line: "Attention as a scarce budget — SHOW, DEFER, or SUPPRESS from interaction history alone.",
  },
  {
    href: "#passport",
    n: "15",
    title: "Agentic Transaction Passport",
    question: "How do you use an AI agent's intent without letting it corrupt the transaction?",
    line: "An untrusted packet passes an anti-corruption layer — a customer-approved subset of intent, never more.",
  },
];

export function FrontierBand() {
  return (
    <section id="frontier" aria-labelledby="frontier-title" className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" aria-hidden />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">The Frontier</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" aria-hidden />
      </div>

      <div className="mb-5 max-w-3xl">
        <h2 id="frontier-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
          Three prototypes of where this domain could go — built, not just described.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Each runs against the backend right now, and each keeps the Threshold discipline: a deterministic
          core with property-tested laws and no LLM in the critical path — AI proposes, evidence decides. But
          they are labelled{" "}
          <span className="inline-flex translate-y-[1px]"><TruthLabel kind="HYPOTHESIS" /></span>{" "}
          on purpose: the future each one implies is speculative, and none of it claims to be a gap in Rokt&apos;s
          own systems. The verified gate is above; this is where it could grow.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {CONCEPTS.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="group glass flex flex-col gap-2 rounded-xl p-4 transition-colors hover:border-teal/50"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="thr-edge inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-2/70 font-mono text-[11px] font-semibold text-teal"
              >
                {c.n}
              </span>
              <span className="text-sm font-semibold text-text">{c.title}</span>
            </div>
            <p className="text-sm font-medium leading-snug text-text/90">{c.question}</p>
            <p className="mt-auto text-xs leading-relaxed text-muted">{c.line}</p>
            <span className="font-mono text-[10px] text-teal opacity-0 transition-opacity group-hover:opacity-100">
              run it below ↓
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
