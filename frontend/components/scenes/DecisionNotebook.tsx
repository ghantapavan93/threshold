"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* The Decision Notebook — the engineering reasoning behind Threshold, in the open.
   Problem, invariants, architecture, decision records, rejected alternatives, threat
   model, the test/proof map, measured results, limitations, and the path to
   production. Every entry is defensible and honest; nothing here claims private
   Rokt knowledge or unproven impact. Accordion so a reviewer can scan or go deep. */

const T = "var(--c-teal)";
const A = "var(--c-amber)";
const C = "var(--c-crimson)";

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[0.92em] text-text">{children}</span>;
}

type Entry = { id: string; title: string; body: React.ReactNode };

const ENTRIES: Entry[] = [
  {
    id: "problem",
    title: "Problem & scope",
    body: (
      <>
        The space between <em>changing</em> a transaction policy and <em>proving</em> what the change
        means for customers. Threshold is a deterministic pre-release safety gate: compare current vs
        proposed policy, replay event-time session snapshots, and return{" "}
        <span style={{ color: T }}>ELIGIBLE FOR CONTROLLED EXPERIMENT</span>,{" "}
        <span style={{ color: A }}>INSUFFICIENT EVIDENCE</span>, or{" "}
        <span style={{ color: C }}>BLOCKED</span>. In scope: structural correctness and safety. Out of
        scope: business uplift, causal impact, and any live Rokt integration.
      </>
    ),
  },
  {
    id: "invariants",
    title: "Invariants (CORE / ENFORCED)",
    body: (
      <ul className="list-disc space-y-1 pl-4">
        <li>The decision is a pure function of <Mono>(event-time snapshot, policy)</Mono> — no clock, no network, no AI in the path.</li>
        <li>Suppression is a decision, not an absence — every <Mono>No Offer Rendered</Mono> records why.</li>
        <li>Failure of the optional experience can never block checkout (fail-closed).</li>
        <li>Repeated delivery yields one business-state transition (idempotent dedupe key).</li>
      </ul>
    ),
  },
  {
    id: "architecture",
    title: "Architecture",
    body: (
      <>
        A <strong className="text-text">pure deterministic core</strong> (evaluator, constraints, diff,
        verdict) wrapped by an <strong className="text-text">effectful shell</strong> (API, persistence,
        a transactional <Mono>outbox</Mono> drained by a background worker with backoff + dead-lettering).
        The cinematic layer only reads results from the engine — policy logic is never duplicated in an
        animation.
      </>
    ),
  },
  {
    id: "decisions",
    title: "Decision records",
    body: (
      <ul className="space-y-1.5">
        <li><Mono>DR-1</Mono> No AI in the critical path — a safety gate must be replayable and explainable.</li>
        <li><Mono>DR-2</Mono> At-least-once-compatible ingestion with idempotent, effectively-once business-state transitions (not exactly-once network delivery).</li>
        <li><Mono>DR-3</Mono> Money as whole minor units + ISO-4217 code, never floats.</li>
        <li><Mono>DR-4</Mono> Audit trail is tamper-<em>evident</em> (hash-chained + signed head), not tamper-proof.</li>
      </ul>
    ),
  },
  {
    id: "rejected",
    title: "Rejected alternatives",
    body: (
      <ul className="space-y-1.5">
        <li><span style={{ color: C }}>✗</span> Exactly-once delivery → at-least-once + idempotent dedupe.</li>
        <li><span style={{ color: C }}>✗</span> An LLM scoring each session → deterministic constraint catalog.</li>
        <li><span style={{ color: C }}>✗</span> Refund via a Cart API → confirmed cancellation through the documented flow (no invented endpoint).</li>
        <li><span style={{ color: C }}>✗</span> Threshold proves uplift → Threshold proves safety; a Would-Have-Seen holdout proves lift.</li>
      </ul>
    ),
  },
  {
    id: "threat",
    title: "Threat model",
    body: (
      <ul className="list-disc space-y-1 pl-4">
        <li>Edit / reorder / interior-delete a record → chain verification breaks.</li>
        <li>Truncate the tail → the signed head no longer matches.</li>
        <li>Replay one tenant&apos;s lineage into another → tenant-scope check fails.</li>
        <li>A silent widening that passes schema + review → caught by the replay, not the compiler.</li>
      </ul>
    ),
  },
  {
    id: "tests",
    title: "Test & proof map",
    body: (
      <ul className="space-y-1 font-mono text-[0.85rem]">
        <li>test_invariants · test_edge_cases · property-based (Hypothesis)</li>
        <li>test_outbox · test_recovery — backoff, dead-letter, no duplicate state</li>
        <li>test_governance — signed lifecycle, tamper, tenant isolation, key rotation</li>
        <li>test_money · test_reconciliation · test_redemption</li>
        <li>scripts/scale_lab — measured decision-path percentiles</li>
      </ul>
    ),
  },
  {
    id: "measured",
    title: "Measured results",
    body: (
      <>
        Local load test of the deterministic decision path (single core, 40k timed calls):{" "}
        <Mono>p50 2.2µs · p99 4.0µs · ≈545k decisions/s</Mono>; a 200-session replay in <Mono>~3.4ms</Mono>.
        Labelled <span style={{ color: T }}>MEASURED</span> — regional/global figures stay MODELED/HYPOTHESIS.
      </>
    ),
  },
  {
    id: "limits",
    title: "Limitations",
    body: (
      <ul className="list-disc space-y-1 pl-4">
        <li>No production Rokt integration; datasets are synthetic and labelled.</li>
        <li>Causal uplift is <span style={{ color: A }}>NOT PROVEN</span> — that needs a holdout.</li>
        <li>Global-scale numbers are architecture and projection, not benchmarks.</li>
        <li>Written from the outside; humbly missing internal context.</li>
      </ul>
    ),
  },
  {
    id: "prod",
    title: "Productionization path",
    body: (
      <>
        Read event-time snapshots from a governed warehouse / CDP with governance intact, hand a
        replays-clean cohort to a Would-Have-Seen holdout for the causal read, and run the gate in the
        deploy pipeline before the approval queue. Threshold proves structural safety; the holdout proves
        it moved the number.
      </>
    ),
  },
];

export function DecisionNotebook() {
  const [open, setOpen] = useState<string | null>("problem");
  return (
    <div className="mx-auto max-w-3xl divide-y divide-border/60 rounded-2xl border border-border">
      {ENTRIES.map((e, i) => {
        const isOpen = open === e.id;
        return (
          <div key={e.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : e.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 px-5 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <span className="shrink-0 font-mono text-[11px] text-teal">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-sm font-semibold text-text">{e.title}</span>
              <span aria-hidden className="text-muted">{isOpen ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pl-[3.25rem] text-sm leading-relaxed text-muted">{e.body}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
