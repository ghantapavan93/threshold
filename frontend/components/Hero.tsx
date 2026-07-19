"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ApiError } from "@/lib/api";
import { useReplayJob } from "@/lib/hooks";
import type { Injection } from "@/lib/schemas";
import { useConsole } from "./console-context";
import { Parallax } from "./visual/Parallax";
import { TransactionMomentMotif } from "./visual/illustrations";
import { prefersReducedMotion, scrollToId } from "@/lib/scroll";

const DANGEROUS = "V18";
const SAFE = "V18-safe";
const INJECTIONS: Injection[] = ["timeout", "invalid_output", "stale_identity"];

type Phase = "idle" | "running" | "blocked" | "eligible" | "error";

const delay = (ms: number) =>
  new Promise((r) => setTimeout(r, prefersReducedMotion() ? 0 : ms));

/**
 * Self-driving demo. The Hero orchestrates the REAL replay mutation and writes
 * the shared job into console-context, so every section below reacts to live API
 * data. No fabricated numbers — captions read from the returned job.
 */
export function Hero() {
  const { proposedVersion, setProposedVersion, setJob } = useConsole();
  const replay = useReplayJob();
  const [phase, setPhase] = useState<Phase>("idle");
  const [caption, setCaption] = useState<string>("");
  const active = proposedVersion === SAFE ? SAFE : DANGEROUS;
  const reduced = useReducedMotion();

  const runVersion = useCallback(
    async (proposed: string) => {
      setProposedVersion(proposed);
      const res = await replay.mutateAsync({
        base_version: "V17",
        proposed_version: proposed,
        session_seed: 42,
        session_count: 200,
        injections: INJECTIONS,
      });
      setJob(res.job, res.requestId);
      return res.job;
    },
    [replay, setJob, setProposedVersion],
  );

  const fail = useCallback((e: unknown) => {
    setPhase("error");
    setCaption(
      e instanceof ApiError && e.isUnreachable
        ? "Backend unreachable — start the Threshold API on :8000, then press Play again."
        : "Something went wrong running the replay. Is the API on :8000?",
    );
  }, []);

  const playStory = useCallback(async () => {
    try {
      setPhase("running");
      setCaption("A one-operator edit — replaying V17 → V18 across 200 event-time sessions…");
      scrollToId("diff");
      const job = await runVersion(DANGEROUS);
      await delay(900);
      const widened = job.replay_summary.constraint_violation;
      scrollToId("heatmap");
      setCaption(`The r4 operator flip (include_is_not_in → exclude_is_in) silently widened ${widened} missing-cc_bin sessions.`);
      await delay(2200);
      scrollToId("verdict");
      setCaption(`Verdict: ${job.verdict.value}. Caught before a single customer — now watch the fix.`);
      setPhase("blocked");
    } catch (e) {
      fail(e);
    }
  }, [runVersion, fail]);

  const playFix = useCallback(async () => {
    try {
      setPhase("running");
      setCaption("Reverting just the operator (V18-safe) and re-running…");
      scrollToId("diff");
      const job = await runVersion(SAFE);
      await delay(1400);
      scrollToId("verdict");
      setCaption(`Verdict: ${job.verdict.value} — cleared only for a controlled 5% online holdout, never "safe to launch".`);
      setPhase("eligible");
    } catch (e) {
      fail(e);
    }
  }, [runVersion, fail]);

  const busy = phase === "running";

  const seg = (v: string, label: string, on: string, fg: string) => (
    <button
      type="button"
      onClick={() => setProposedVersion(v)}
      aria-pressed={active === v}
      disabled={busy}
      className="inline-flex min-h-[44px] flex-1 items-center justify-center px-3 py-2 text-center text-xs font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50 sm:px-4 sm:text-sm"
      style={active === v ? { backgroundColor: on, color: fg } : { color: "var(--c-muted)" }}
    >
      {label}
    </button>
  );

  const captionColor =
    phase === "blocked" || phase === "error"
      ? "var(--c-crimson)"
      : phase === "eligible"
        ? "var(--c-teal)"
        : "var(--c-muted)";

  return (
    <section
      aria-label="Overview"
      className="relative overflow-hidden border-b border-border/70"
    >
      {/* Hero motif — the Transaction Moment as a decision gate. Decorative,
          parallaxed, and clipped by the section's overflow-hidden. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-2 top-16 hidden w-[30rem] xl:w-[34rem] lg:block"
      >
        <div
          className="absolute -right-10 -top-10 h-[24rem] w-[24rem] rounded-full opacity-50 blur-2xl animate-float-soft"
          style={{
            background:
              "radial-gradient(circle at 45% 40%, rgba(34,230,200,0.26), transparent 60%), radial-gradient(circle at 75% 70%, rgba(91,140,255,0.2), transparent 60%)",
          }}
        />
        <Parallax speed={8} className="relative">
          <TransactionMomentMotif className="w-full" />
        </Parallax>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface-2/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted backdrop-blur"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal" />
          Rokt · Proof of Work · Deterministic core · No AI in the critical path
        </motion.p>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="max-w-4xl text-4xl font-bold leading-[1.02] tracking-tightest text-text sm:text-5xl lg:text-[3.6rem]"
        >
          Prove a checkout-policy change is safe{" "}
          <span className="gradient-text">before a single customer sees it.</span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
          className="mt-5 max-w-3xl text-sm leading-relaxed text-muted sm:text-base"
        >
          Threshold replays a proposed policy change over event-time sessions and proves it{" "}
          <strong className="text-text">fails closed</strong> to No Offer Rendered, preserves the
          merchant&apos;s checkout, respects hard constraints, and is eligible <em>only</em> for a
          controlled holdout. A one-operator edit that silently widens eligibility — caught in two
          minutes, with the exact Rokt doc it violates cited inline.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
          className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <button
            type="button"
            onClick={playStory}
            disabled={busy}
            className="press inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60"
            style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
          >
            <span aria-hidden>▶</span> {busy ? "Playing…" : "Play the story"}
          </button>

          {phase === "blocked" ? (
            <button
              type="button"
              onClick={playFix}
              className="press inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-text hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Now watch the fix <span aria-hidden>→</span>
            </button>
          ) : null}

          <div
            role="group"
            aria-label="Compare outcomes"
            className="thr-edge flex overflow-hidden rounded-lg sm:inline-flex"
          >
            {seg(DANGEROUS, "⚠ Dangerous edit · V18", "var(--c-crimson)", "#fff")}
            <span aria-hidden className="w-px self-stretch bg-border" />
            {seg(SAFE, "✓ Safe fix · V18-safe", "var(--c-teal)", "#04110d")}
          </div>
        </motion.div>

        <div aria-live="polite" className="mt-5 min-h-[1.25rem] text-sm">
          {caption ? (
            <span className="font-medium" style={{ color: captionColor }}>
              {caption}
            </span>
          ) : (
            <span className="text-muted">
              Comparing <span className="font-mono text-text">V17 → {proposedVersion}</span>. Press
              Play, or run the Policy Diff Replay below.
            </span>
          )}
        </div>

        {/* Scale strip — Rokt's verified public direction (context, not app data). */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            { figure: "33,000+", label: "clients" },
            { figure: "10B+", label: "transactions / year" },
            { figure: "17", label: "countries" },
          ].map((s) => (
            <div
              key={s.label}
              className="glass rounded-xl px-4 py-3"
            >
              <p className="font-mono text-xl font-semibold text-text sm:text-2xl">
                {s.figure}
              </p>
              <p className="mt-0.5 text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </motion.div>
        <p className="mt-2 max-w-3xl text-[11px] text-muted">
          Grounded in Rokt&apos;s public direction. As decisioning accelerates toward real-time
          relevance, the blast radius of a silent policy error grows — a deterministic pre-flight
          gets more valuable, not less.
        </p>
      </div>
    </section>
  );
}
