"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { useSimulation } from "@/lib/hooks";
import type { Evaluation, SimulationResult } from "@/lib/schemas";
import { CHANGE_KIND_COLOR, CHANGE_KIND_LABEL } from "@/lib/utils";
import { simulateFixture } from "@/components/moment-forge/fixtures";
import { Pill, RoktEcho, Scene, SceneHeadline } from "./stage";

/* 02 · The Customers — the iconic scene. Every customer session is a seat in an
   enormous audience. A REAL policy replay (V17 → V18) sweeps across them; the
   seats whose decision silently changed light up. Click one to see why: a
   missing cc_bin that V17 excluded and V18 now lets through. The audience is
   code-drawn; the number that changes is real engine output, never asserted. */

type Status = "idle" | "loading" | "ok" | "error";

function AudienceGlow() {
  return (
    <div className="absolute inset-0 bg-[#05070e]">
      <div
        className="absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-40 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--c-offer-blue) 16%, transparent), transparent 70%)" }}
      />
    </div>
  );
}

function friendlyDecision(d: string): string {
  if (d === "offer") return "Eligible · offer shown";
  if (d === "no_offer") return "Not eligible · no offer";
  return d;
}

export function ChapterCustomers() {
  const reduced = useReducedMotion();
  const sim = useSimulation();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [selected, setSelected] = useState<Evaluation | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [err, setErr] = useState<ApiError | null>(null);
  const timer = useRef<number | null>(null);

  const evaluations = useMemo(() => result?.evaluations ?? [], [result]);
  const changedCount = useMemo(
    () => evaluations.filter((e) => e.changed).length,
    [evaluations],
  );

  // The sweep: reveal seats progressively once a result lands.
  useEffect(() => {
    if (status !== "ok" || evaluations.length === 0) return;
    if (reduced) {
      setRevealed(evaluations.length);
      return;
    }
    setRevealed(0);
    timer.current = window.setInterval(() => {
      setRevealed((r) => {
        const next = r + Math.max(1, Math.round(evaluations.length / 90));
        if (next >= evaluations.length) {
          if (timer.current) window.clearInterval(timer.current);
          return evaluations.length;
        }
        return next;
      });
    }, 32);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [status, evaluations.length, reduced]);

  const run = async () => {
    setStatus("loading");
    setErr(null);
    setSelected(null);
    const loadFixture = async () => {
      setResult(await simulateFixture("trap"));
      setUsedFixture(true);
      setStatus("ok");
    };
    try {
      const d = await sim.mutateAsync({
        base_version: "V17",
        proposed: { from_version: "V18" },
        session_seed: 42,
        session_count: 480,
        injections: [],
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
    <Scene id="kc-customers" n="02" label="The Customers" accent="offer-blue" clip="kc-customers" environment={<AudienceGlow />}>
      <div className="max-w-3xl">
        <Pill accent="offer-blue">The audience · a real replay</Pill>
        <SceneHeadline className="mt-6">
          {status === "ok" ? (
            <>
              Two tokens changed{" "}
              <span className="text-crimson">{changedCount}</span> customer decisions.
            </>
          ) : (
            <>Every customer is one seat. Watch the change find them.</>
          )}
        </SceneHeadline>
        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
          Replay V17 → V18 across {result ? evaluations.length : 480} real seeded sessions. The seats whose
          decision silently changed light up — click one to see the missing attribute that let it through.
          {status === "ok" ? (
            <span className="mt-1 block font-mono text-xs text-teal">
              {usedFixture ? "recorded" : "live"} engine output · every seat is a real evaluation
            </span>
          ) : null}
        </p>
        {status === "ok" ? (
          <div className="mt-7">
            <RoktEcho
              accent="offer-blue"
              quote="Show the right content, or show nothing."
              source="Rokt · Claire Southey, Chief AI Officer, 2026 · public"
            />
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted">
              Each lit seat is a shopper V17 would have shown nothing — now shown an offer. A silent widening is
              the opposite of &ldquo;show the right content.&rdquo; This is the exact drift a change-safety gate
              catches before it reaches a customer.
            </p>
          </div>
        ) : null}
        {status !== "ok" ? (
          <button
            type="button"
            onClick={run}
            disabled={status === "loading"}
            className="press mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60"
            style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
          >
            {status === "loading" ? "replaying across the audience…" : "▸ Replay the policy across 480 customers"}
          </button>
        ) : null}
        {status === "error" && err ? (
          <div role="alert" className="mt-6 rounded-lg border border-crimson/50 bg-crimson/10 p-4">
            <p className="font-mono text-sm font-semibold text-crimson">
              {err.isUnreachable ? "✕ Replay service unreachable — this is a live call." : "✕ Replay failed."}
            </p>
            {err.message ? <p className="mt-1 font-mono text-[11px] text-text">{err.message}</p> : null}
            <button type="button" onClick={run} className="press mt-3 rounded-md border border-border px-3 py-1 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">Retry</button>
          </div>
        ) : null}
      </div>

      {status === "ok" ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
          {/* the audience */}
          <div>
            <div
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(12px, 1fr))" }}
              role="group"
              aria-label={`${evaluations.length} customer sessions, ${changedCount} changed`}
            >
              {evaluations.map((e, i) => {
                const shown = i < revealed;
                const isSel = selected?.session_id === e.session_id;
                const color = e.changed ? CHANGE_KIND_COLOR[e.change_kind] : "var(--c-border-strong)";
                return (
                  <button
                    key={e.session_id}
                    type="button"
                    onClick={() => e.changed && setSelected(e)}
                    aria-label={`Session ${e.session_id}, ${CHANGE_KIND_LABEL[e.change_kind]}`}
                    tabIndex={e.changed ? 0 : -1}
                    className="aspect-square rounded-[2px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                    style={{
                      backgroundColor: color,
                      opacity: shown ? (e.changed ? 1 : 0.28) : 0.05,
                      transform: isSel ? "scale(1.6)" : shown && e.changed ? "scale(1)" : "scale(0.85)",
                      cursor: e.changed ? "pointer" : "default",
                      boxShadow: isSel ? `0 0 0 2px var(--c-text)` : e.changed && shown ? `0 0 6px ${color}` : "none",
                    }}
                  />
                );
              })}
            </div>
            {/* legend */}
            <div className="mt-4 flex flex-wrap gap-3 font-mono text-[11px] text-muted">
              {(["nothing_to_offer", "offer_to_nothing", "constraint_violation"] as const).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: CHANGE_KIND_COLOR[k] }} />
                  {CHANGE_KIND_LABEL[k]}
                </span>
              ))}
            </div>
          </div>

          {/* the seat context panel */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.aside
                key={selected.session_id}
                initial={reduced ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: 24 }}
                transition={{ type: "spring", stiffness: 240, damping: 28 }}
                className="glass rounded-2xl border border-crimson/30 p-5"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-crimson">Customer session</p>
                  <span className="font-mono text-[11px] text-muted">{selected.session_id}</span>
                </div>
                <div className="mt-4 rounded-lg border border-amber/40 bg-amber/10 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-amber">The missing attribute</p>
                  <p className="mt-1 font-mono text-sm text-text">
                    cc_bin: {String(selected.attributes_snapshot?.cc_bin ?? "— missing")}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-surface-2/40 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-muted">V17</p>
                    <p className="mt-1 text-sm text-text">{friendlyDecision(selected.base.decision)}</p>
                  </div>
                  <div className="rounded-lg border border-crimson/40 bg-crimson/[0.06] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-crimson">V18</p>
                    <p className="mt-1 text-sm text-text">{friendlyDecision(selected.proposed.decision)}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  With cc_bin absent, V17&apos;s <span className="font-mono text-text">include · is not in</span> excluded
                  this shopper. V18&apos;s flipped operator lets them through — a silent widening no compiler could catch.
                </p>
              </motion.aside>
            ) : (
              <motion.div
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl border border-border/60 p-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-offer-blue">Select a lit seat</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Each lit seat is a customer whose decision changed between V17 and V18. Click one to see the exact
                  reason — the same missing-attribute inversion the Threshold engine catches before it ships.
                </p>
                <p className="mt-4 font-mono text-3xl font-bold text-crimson">
                  {changedCount}
                  <span className="ml-2 text-sm font-normal text-muted">of {evaluations.length} changed</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </Scene>
  );
}
