"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useSimulation } from "@/lib/hooks";
import type { SimulationResult } from "@/lib/schemas";
import { simulateFixture } from "@/components/moment-forge/fixtures";
import { Pill, RoktEcho, Scene, SceneHeadline, EASE } from "./stage";

/* 06 · The Experiment — correctness earns the right to LEARN, not to claim
   impact. The clean change (V17 → V18-safe) passes every safety gate and the
   only positive verdict is ELIGIBLE_FOR_HOLDOUT — impact stays unproven until a
   controlled experiment. Live via /simulations; recorded fixture offline. */

type Status = "idle" | "loading" | "ok" | "error";

function FieldEnvironment() {
  return (
    <div className="absolute inset-0 bg-[#05080e]">
      <div
        className="absolute left-1/2 top-1/2 h-[60%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-30 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--c-teal) 14%, transparent), transparent 70%)" }}
      />
    </div>
  );
}

export function ChapterExperiment() {
  const reduced = useReducedMotion();
  const sim = useSimulation();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);

  const verdict = result?.verdict;
  const constraintsPass = (result?.constraint_results ?? []).every((c) => c.result !== "FAIL");
  const failClosed = (result?.failclosed_proofs ?? []).every((p) => p.checkout_preserved);

  const gates = [
    { label: "Semantic correctness", pass: constraintsPass, note: "no critical constraint tripped" },
    { label: "Customer transaction safety", pass: failClosed, note: "checkout preserved on every fault" },
    { label: "Conversion integrity", pass: !!verdict && verdict.value !== "BLOCKED", note: "no silent widening" },
    { label: "Incremental revenue impact", pass: false, note: "unproven — that is what the holdout is for", honest: true },
  ];

  const run = async () => {
    setStatus("loading");
    setErr(null);
    const loadFixture = async () => {
      setResult(await simulateFixture("safe"));
      setUsedFixture(true);
      setStatus("ok");
    };
    try {
      const d = await sim.mutateAsync({
        base_version: "V17",
        proposed: { from_version: "V18-safe" },
        session_seed: 42,
        session_count: 200,
        injections: ["timeout", "invalid_output", "stale_identity"],
      });
      setResult(d);
      setUsedFixture(false);
      setStatus("ok");
    } catch (e) {
      const ae = e instanceof ApiError ? e : new ApiError({ kind: "network", message: String(e) });
      if (ae.isUnreachable) {
        try {
          await loadFixture();
        } catch (e2) {
          setErr(e2 instanceof ApiError ? e2 : ae);
          setStatus("error");
        }
      } else {
        setErr(ae);
        setStatus("error");
      }
    }
  };

  return (
    <Scene id="kc-experiment" n="06" label="The Experiment" accent="teal" clip="kc-experiment" environment={<FieldEnvironment />}>
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <Pill accent="teal">Eligible to learn — not to claim</Pill>
          <SceneHeadline className="mt-6">
            Correctness earns the right to learn. It does not earn the right to claim impact.
          </SceneHeadline>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">
            The clean change passes every safety gate. But the only honest positive verdict is{" "}
            <span className="text-teal">eligible for a controlled experiment</span> — a real online holdout, not
            a claimed number.
          </p>
          <div className="mt-7">
            <RoktEcho
              accent="teal"
              quote="Was this moment meaningful?"
              source="Rokt · 2026 Commerce Outlook · public"
            />
          </div>
          {status !== "ok" ? (
            <button
              type="button"
              onClick={run}
              disabled={status === "loading"}
              className="press mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60"
              style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
            >
              {status === "loading" ? "running the gates…" : "▸ Run the safety gates"}
            </button>
          ) : null}
          {status === "error" && err ? <p role="alert" className="mt-4 font-mono text-[12px] text-crimson">✕ {err.message}</p> : null}
        </div>

        <div className="glass rounded-2xl border border-border/60 p-5" aria-live="polite">
          {status === "idle" ? (
            <p className="font-mono text-xs text-muted">Run the clean change through every gate and read the honest verdict.</p>
          ) : null}
          {status === "loading" ? (
            <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-9 w-full animate-pulse-soft rounded bg-surface-2/60" />)}</div>
          ) : null}
          <AnimatePresence>
            {status === "ok" && verdict ? (
              <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                <p className="font-mono text-[11px] text-teal">{usedFixture ? "recorded" : "live"} engine output</p>
                <ul className="mt-3 space-y-2">
                  {gates.map((g) => (
                    <li key={g.label} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: g.pass ? "color-mix(in srgb, var(--c-teal) 40%, transparent)" : g.honest ? "color-mix(in srgb, var(--c-amber) 40%, transparent)" : "color-mix(in srgb, var(--c-crimson) 40%, transparent)" }}>
                      <div>
                        <p className="text-sm font-medium text-text">{g.label}</p>
                        <p className="text-[11px] text-muted">{g.note}</p>
                      </div>
                      <span className={`font-mono text-[11px] ${g.pass ? "text-teal" : g.honest ? "text-amber" : "text-crimson"}`}>
                        {g.pass ? "▛ passed" : g.honest ? "◌ unproven" : "✕ failed"}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-lg border border-teal/40 bg-teal/10 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Verdict</p>
                  <p className="mt-1 font-mono text-lg font-bold text-teal">{verdict.value.replace(/_/g, " ")}</p>
                  {verdict.holdout_config ? (
                    <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-muted">
                      {verdict.holdout_config.control_pct}% control · metric {verdict.holdout_config.primary_metric} · min uplift {verdict.holdout_config.min_uplift_pct}%
                    </p>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </Scene>
  );
}
