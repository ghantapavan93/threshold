"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pill, Scene, SceneHeadline, EASE } from "./stage";

/* 04 · The Machine — travel behind the interface into the machinery. One
   customer action moves through every accountable layer; scrub the slider and
   watch the active layer light up. The layers are the repo's real pipeline
   (evaluator → outbox → worker → audit); the scrub is illustrative, labelled. */

type Layer = {
  key: string;
  label: string;
  detail: string;
  repo: string;
};

const LAYERS: Layer[] = [
  { key: "ui", label: "React console", detail: "An operator submits a replay of the proposed change.", repo: "app/ · TanStack + Zod" },
  { key: "api", label: "API contract", detail: "The request is validated against the typed contract before anything runs.", repo: "routers/ · FastAPI + Pydantic" },
  { key: "evaluator", label: "Policy evaluator", detail: "The pure, deterministic decision function runs per session. No AI in this path.", repo: "domain/evaluator.py" },
  { key: "db", label: "DB transaction", detail: "The job and its events are written in one atomic transaction.", repo: "models.py · SQLAlchemy" },
  { key: "outbox", label: "Transactional outbox", detail: "Fan-out events are committed with the job — never a lossy dual write.", repo: "outbox.py" },
  { key: "worker", label: "Drain worker", detail: "A worker publishes events with capped backoff, dead-lettering on repeated failure.", repo: "outbox.drain_once" },
  { key: "trace", label: "Trace + audit", detail: "Every step is recorded in an append-only, HMAC-sealed audit trail.", repo: "audit.py · verify()" },
  { key: "verdict", label: "Verdict", detail: "A deterministic verdict: BLOCKED, INSUFFICIENT, or ELIGIBLE_FOR_HOLDOUT.", repo: "domain/verdict.py" },
];

function MachineEnvironment() {
  return (
    <div className="absolute inset-0 bg-[#04060c]">
      <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {Array.from({ length: 20 }, (_, i) => (
          <line key={i} x1={i * 55} y1={0} x2={i * 55} y2={640} stroke="var(--c-border)" strokeOpacity="0.12" strokeWidth="1" />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 55} x2={1000} y2={i * 55} stroke="var(--c-border)" strokeOpacity="0.12" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}

export function ChapterMachine() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const cur = LAYERS[active]!;

  const live = (
    <div>
      {/* the pipeline */}
      <div className="flex flex-wrap gap-1.5">
            {LAYERS.map((l, i) => {
              const on = i <= active;
              return (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className="press flex-1 rounded-lg border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                  style={{
                    minWidth: 92,
                    borderColor: i === active ? "var(--c-teal)" : on ? "color-mix(in srgb, var(--c-teal) 30%, transparent)" : "var(--c-border)",
                    background: i === active ? "color-mix(in srgb, var(--c-teal) 12%, transparent)" : "transparent",
                  }}
                >
                  <span className="font-mono text-[9px] uppercase tracking-wide" style={{ color: on ? "var(--c-teal)" : "var(--c-muted)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold leading-tight text-text">{l.label}</span>
                </button>
              );
            })}
          </div>

          {/* scrubber */}
          <input
            type="range"
            min={0}
            max={LAYERS.length - 1}
            value={active}
            onChange={(e) => setActive(Number(e.target.value))}
            aria-label="Scrub the transaction through the pipeline"
            className="mt-5 w-full cursor-ew-resize accent-teal"
          />

          {/* the active layer detail */}
          <motion.div
            key={cur.key}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="glass mt-5 rounded-2xl border border-teal/25 p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-semibold text-text" style={{ fontFamily: "var(--font-display)" }}>{cur.label}</h3>
              <span className="font-mono text-[11px] text-teal">{cur.repo}</span>
            </div>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">{cur.detail}</p>
          </motion.div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Layers are the real repo pipeline · the scrub is an illustration of one transaction&apos;s path
          </p>
    </div>
  );
  return (
    <Scene id="kc-machine" n="04" label="The Machine" accent="teal" clip="kc-machine" flip={false} environment={<MachineEnvironment />} live={live}>
      <div>
        <Pill accent="teal">One action · every layer accountable</Pill>
        <SceneHeadline className="mt-6">One customer action. Every layer accountable.</SceneHeadline>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">
          Travel behind the interface into the machine. Scrub the transaction and watch it move through every
          real layer of the Threshold pipeline — each one named, each one in the repo.
        </p>
      </div>
    </Scene>
  );
}
