"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { useReplayJob, useScenarios } from "@/lib/hooks";
import { loadRecordedJob, RECORDED_REQUEST_ID } from "@/lib/replay-fixture";
import type { Injection, Scenario, VerdictValue } from "@/lib/schemas";
import { useConsole } from "./console-context";
import { useWalkthrough } from "./walkthrough";
import {
  EmptyState,
  ErrorState,
  Section,
  Skeleton,
} from "./ui/primitives";
import { VERDICT_COLOR, VERDICT_LABEL } from "@/lib/utils";
import { ScenarioGlyph } from "./ScenarioGlyph";
import { prefersReducedMotion, scrollToId } from "@/lib/scroll";

// Same replay parameters the Hero's self-driving demo uses — identical real path.
const INJECTIONS: Injection[] = ["timeout", "invalid_output", "stale_identity"];

/* A sixth card, grounded in Rokt's current direction: AI-referred / agent
   traffic (GEO) lands pre-checkout with thinner data, so the missing-attribute
   change widens THAT cohort most — the segment a mean hides. It runs the same
   real V17→V18 replay, then jumps to the by-traffic-source cohort breakdown. */
const AGENT_SCENARIO: Scenario = {
  id: "agent",
  base: "V17",
  proposed: "V18",
  title: "AI-referred widening (GEO / agent)",
  teaches:
    "Half of AI-referred sessions begin on product pages, pre-checkout — thin data. This change reads safe in aggregate yet quietly widens the AI-referred cohort. See which segment below.",
  expected_verdict: "BLOCKED",
  signature: false,
};

/** Verdict glow: crimson for BLOCKED, teal for ELIGIBLE_FOR_HOLDOUT. */
const VERDICT_GLOW: Record<VerdictValue, string> = {
  BLOCKED: "glow-crimson",
  ELIGIBLE_FOR_HOLDOUT: "glow-teal",
  INSUFFICIENT_EVIDENCE: "glow-amber",
};

function verdictGlyph(v: VerdictValue): string {
  return v === "BLOCKED" ? "⛔" : v === "ELIGIBLE_FOR_HOLDOUT" ? "✓" : "?";
}

function VerdictChip({ value }: { value: VerdictValue }) {
  const color = VERDICT_COLOR[value];
  return (
    <span
      className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] " + VERDICT_GLOW[value]}
      style={{
        color,
        borderColor: color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      <span aria-hidden>{verdictGlyph(value)}</span>
      {VERDICT_LABEL[value]}
    </span>
  );
}

const SPOTLIGHT_SHADOW =
  "0 0 0 1.5px color-mix(in srgb, var(--c-teal) 55%, transparent), 0 14px 46px -14px color-mix(in srgb, var(--c-teal) 45%, transparent)";

function ScenarioCard({
  scenario,
  selected,
  running,
  disabled,
  spotlight,
  onRun,
}: {
  scenario: Scenario;
  selected: boolean;
  running: boolean;
  disabled: boolean;
  spotlight: boolean;
  onRun: (s: Scenario) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onRun(scenario)}
      className={
        "holo-card flex h-full flex-col rounded-2xl p-5 text-left transition-all duration-500 active:scale-[0.985] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-60 " +
        (selected ? "border-teal " : "") +
        (spotlight ? "scn-live " : "")
      }
      style={{
        ...(selected ? { borderColor: "var(--c-teal)" } : {}),
        ...(spotlight
          ? { boxShadow: SPOTLIGHT_SHADOW, transform: "translateY(-3px)" }
          : {}),
      }}
    >
      <ScenarioGlyph id={scenario.id} />
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-text">
          {scenario.title}
        </h3>
        {scenario.signature ? (
          <span
            className="shrink-0 rounded-full border border-crimson/50 bg-crimson/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-crimson"
            title="Signature scenario — the trap this tool exists to catch"
          >
            ★ signature
          </span>
        ) : null}
      </div>

      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">
        {scenario.teaches}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted">
          {scenario.base} → {scenario.proposed}
        </span>
        <VerdictChip value={scenario.expected_verdict} />
      </div>

      <div className="mt-3 border-t border-border/60 pt-3 text-[11px] font-medium">
        {running ? (
          <span className="text-teal">▶ Running…</span>
        ) : selected ? (
          <span className="text-teal">✓ Loaded — see verdict below</span>
        ) : (
          <span className="text-muted">Run this scenario →</span>
        )}
      </div>
    </button>
  );
}

export function ScenarioLibrary() {
  const { setBaseVersion, setProposedVersion, setJob } = useConsole();
  const { walk } = useWalkthrough();
  const scenarios = useScenarios();
  const replay = useReplayJob();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  // Ambient auto-cycle: a teal spotlight steps card→card so the library reads as a
  // live, inviting set rather than a static grid. It pauses the moment the viewer
  // engages — a run, a hover, once a scenario is chosen — is off-screen, or has
  // reduced motion. The spotlight only *invites*; the click still does the work.
  const gridRef = useRef<HTMLDivElement>(null);
  const [cycle, setCycle] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(true);
  const cardCount = (scenarios.data?.length ?? 0) + 1; // +1 for the agent card
  const busyRun = runningId !== null;
  const cyclePaused =
    busyRun ||
    selectedId !== null ||
    hovering ||
    !inView ||
    !scenarios.data ||
    cardCount <= 1 ||
    (typeof window !== "undefined" && prefersReducedMotion());

  useEffect(() => {
    if (cyclePaused) return;
    const t = setInterval(() => setCycle((c) => (c + 1) % cardCount), 2200);
    return () => clearInterval(t);
  }, [cyclePaused, cardCount]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const run = useCallback(
    async (s: Scenario) => {
      setSelectedId(s.id);
      setRunningId(s.id);
      setStatus(`Running ${s.title}…`);
      // Reuse the EXACT real-replay path the Hero uses: set the versions in
      // console-context, drive the useReplayJob mutation, publish the returned
      // job, and scroll to the verdict. No fabricated results.
      setBaseVersion(s.base);
      setProposedVersion(s.proposed);
      try {
        const res = await replay.mutateAsync({
          base_version: s.base,
          proposed_version: s.proposed,
          session_seed: 42,
          session_count: 200,
          injections: INJECTIONS,
        });
        setJob(res.job, res.requestId, false);
        setStatus(`Running ${s.title} — walking the pipeline below…`);
        await walk(res.job);
        setStatus(`Verdict: ${res.job.verdict.value} — ${s.teaches}`);
      } catch (e) {
        if (e instanceof ApiError && e.isUnreachable) {
          try {
            const job = await loadRecordedJob(s.proposed);
            setJob(job, RECORDED_REQUEST_ID, true);
            await walk(job);
            setStatus(`Recorded verdict: ${job.verdict.value} — ${s.teaches}`);
          } catch {
            setStatus("Backend unreachable and the recorded run couldn't load — start the API on :8000.");
          }
        } else {
          setStatus("Scenario run failed. Is the API on :8000?");
        }
      } finally {
        setRunningId(null);
      }
    },
    [replay, walk, setBaseVersion, setProposedVersion, setJob],
  );

  // The agent card runs the same real replay, then drives the by-traffic-source
  // cohort breakdown so the viewer sees which segment the change widens.
  const runAgent = useCallback(
    async (s: Scenario) => {
      setSelectedId(s.id);
      setRunningId(s.id);
      setStatus("Running AI-referred widening…");
      setBaseVersion(s.base);
      setProposedVersion(s.proposed);
      try {
        const res = await replay.mutateAsync({
          base_version: s.base,
          proposed_version: s.proposed,
          session_seed: 42,
          session_count: 200,
          injections: INJECTIONS,
        });
        setJob(res.job, res.requestId, false);
      } catch (e) {
        if (e instanceof ApiError && e.isUnreachable) {
          try {
            const job = await loadRecordedJob(s.proposed);
            setJob(job, RECORDED_REQUEST_ID, true);
          } catch {
            /* fixture missing — the cohort demo below is still self-contained */
          }
        }
      } finally {
        setRunningId(null);
        // demonstrate the cohort concentration in Bring-your-own-data
        window.dispatchEvent(new CustomEvent("threshold:run-byod"));
        scrollToId("byod");
        setStatus("BLOCKED in aggregate — the cohort breakdown below shows which segment it widens.");
      }
    },
    [replay, setBaseVersion, setProposedVersion, setJob],
  );

  const busy = runningId !== null;
  const statusIsError = status.startsWith("Backend unreachable") || status.startsWith("Scenario run failed");

  return (
    <Section
      id="scenario-library"
      index={1}
      title="Scenario Library"
      subtitle="Six curated policy changes, each teaching one failure mode — including one grounded in Rokt's AI-referred traffic. Click any card to run it end-to-end through the real replay; the constraints, fail-closed proofs, and verdict below update from live API data."
    >
      {scenarios.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : scenarios.isError ? (
        <ErrorState
          title={
            scenarios.error instanceof ApiError && scenarios.error.isUnreachable
              ? "Backend unreachable"
              : "Could not load the scenario library"
          }
          detail={scenarios.error.message}
          requestId={
            scenarios.error instanceof ApiError ? scenarios.error.requestId : null
          }
          onRetry={() => scenarios.refetch()}
        />
      ) : (scenarios.data?.length ?? 0) === 0 ? (
        <EmptyState title="No scenarios are available for this merchant." />
      ) : (
        <div className="space-y-4">
          <div
            ref={gridRef}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {scenarios.data?.map((s, i) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                selected={selectedId === s.id}
                running={runningId === s.id}
                disabled={busy && runningId !== s.id}
                spotlight={!cyclePaused && cycle === i}
                onRun={run}
              />
            ))}
            <ScenarioCard
              key={AGENT_SCENARIO.id}
              scenario={AGENT_SCENARIO}
              selected={selectedId === AGENT_SCENARIO.id}
              running={runningId === AGENT_SCENARIO.id}
              disabled={busy && runningId !== AGENT_SCENARIO.id}
              spotlight={!cyclePaused && cycle === (scenarios.data?.length ?? 0)}
              onRun={runAgent}
            />
          </div>

          <div
            aria-live="polite"
            className="min-h-[1.25rem] text-sm font-medium"
            style={{
              color: statusIsError
                ? "var(--c-crimson)"
                : busy
                  ? "var(--c-muted)"
                  : status
                    ? "var(--c-teal)"
                    : "var(--c-muted)",
            }}
          >
            {status || "Pick a scenario to drive the console from a real replay."}
          </div>
        </div>
      )}
    </Section>
  );
}
