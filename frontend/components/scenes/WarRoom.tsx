"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* The Living War Room — one simulated incident, not another feature. A V18 cohort
   is live at 5%, latency is climbing, an optional dependency is flaky, and
   duplicate deliveries are appearing while a cancellation is in flight. The
   reviewer works the questions an on-call engineer would, each revealing the
   honest read, and it resolves into a concise after-action report.

   It demonstrates how you think under uncertainty — the strongest interview
   conversation in the project. Deterministic and modelled; not a live incident. */

const BRIEF = [
  "V18 admitted to a 5% online holdout cohort",
  "Decision p99 climbing: 40 ms → 220 ms",
  "Optional offer dependency intermittently timing out",
  "Duplicate deliveries observed while a cancellation is in flight",
];

const QUESTIONS: { q: string; a: string; tone?: string }[] = [
  { q: "Is the customer transaction safe?", a: "Yes. The offer path is optional and fail-closed — it falls to No Offer Rendered; checkout never blocks.", tone: "var(--c-teal)" },
  { q: "Policy problem or infrastructure problem?", a: "Infrastructure. The decision is deterministic and unchanged; the latency and timeouts are in the optional dependency, not the gate.", tone: "var(--c-amber)" },
  { q: "Should exposure stop?", a: "Pause the cohort, not the platform. The gate stays up; only the 5% admission is halted until latency recovers.", tone: "var(--c-amber)" },
  { q: "Will recovery create duplicates?", a: "No. Business-state transitions are idempotent and deduped on a stable key; the retried deliveries collapse to one obligation.", tone: "var(--c-teal)" },
];

const REPORT: { k: string; v: string; tone?: string }[] = [
  { k: "What happened", v: "Optional offer dependency degraded under a 5% cohort; latency and duplicate deliveries rose." },
  { k: "Customer impact", v: "None. Checkout stayed green; the offer path fell to No Offer Rendered.", tone: "var(--c-teal)" },
  { k: "Detection", v: "Decision-p99 alarm + outbox queue growth, correlated to one trace." },
  { k: "Containment", v: "Cohort admission paused; gate left running." },
  { k: "Recovery", v: "Dependency returned; outbox drained under bounded backoff." },
  { k: "Evidence", v: "Idempotent dedupe key — zero duplicate business state after replay.", tone: "var(--c-teal)" },
  { k: "Root cause", v: "Infrastructure (dependency latency), not the deterministic decision." },
  { k: "Prevention", v: "Backpressure on the offer path + a per-cohort latency budget." },
  { k: "Remaining unknown", v: "Whether the dependency degradation was load- or region-specific.", tone: "var(--c-amber)" },
];

export function WarRoom() {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [report, setReport] = useState(false);
  const allAnswered = revealed.length === QUESTIONS.length;

  return (
    <div className="mx-auto max-w-3xl">
      {/* incident brief */}
      <div className="rounded-2xl border border-crimson/40 bg-crimson/5 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--c-crimson)" }}>
          ◆ Live incident · modeled
        </p>
        <ul className="mt-2 space-y-1 text-sm text-text">
          {BRIEF.map((b) => (
            <li key={b} className="flex gap-2">
              <span aria-hidden style={{ color: "var(--c-crimson)" }}>›</span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* triage questions */}
      <div className="mt-4 space-y-2">
        {QUESTIONS.map((item, i) => {
          const on = revealed.includes(i);
          return (
            <div key={i} className="rounded-xl border border-border bg-base/50">
              <button
                type="button"
                onClick={() => setRevealed((r) => (r.includes(i) ? r : [...r, i]))}
                aria-expanded={on}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                {item.q}
                <span aria-hidden className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">{on ? "" : "reveal"}</span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden border-t border-border px-4 py-3 text-sm leading-relaxed"
                    style={{ color: item.tone ?? "var(--c-text)" }}
                  >
                    {item.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setReport(true)}
        disabled={!allAnswered}
        className="press mt-4 rounded-lg px-4 py-2 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-40"
        style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
      >
        {allAnswered ? "Write the after-action report" : `Answer the questions (${revealed.length}/${QUESTIONS.length})`}
      </button>

      <AnimatePresence>
        {report && (
          <motion.dl
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2 rounded-2xl border border-border bg-surface/50 p-4 text-sm"
          >
            {REPORT.map((r) => (
              <div key={r.k} className="contents">
                <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">{r.k}</dt>
                <dd style={{ color: r.tone ?? "var(--c-text)" }}>{r.v}</dd>
              </div>
            ))}
          </motion.dl>
        )}
      </AnimatePresence>
    </div>
  );
}
