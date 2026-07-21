"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { prefersReducedMotion } from "@/components/builder/anim";
import { useReplayJob, type ReplayJobInput } from "@/lib/hooks";
import { loadRecordedJob, RECORDED_REQUEST_ID } from "@/lib/replay-fixture";
import { useConsole } from "./console-context";
import { useStageActive } from "./walkthrough";
import { Button, Card, Chip, EmptyState, ErrorState, Section } from "./ui/primitives";
import { SessionDrawer } from "./SessionDrawer";
import {
  CHANGE_KIND_COLOR,
  CHANGE_KIND_LABEL,
  renderValue,
} from "@/lib/utils";
import type { ChangeKind, Evaluation, Injection } from "@/lib/schemas";

const ALL_INJECTIONS: ReadonlyArray<{ value: Injection; label: string }> = [
  { value: "timeout", label: "timeout" },
  { value: "invalid_output", label: "invalid_output" },
  { value: "stale_identity", label: "stale_identity" },
];

const KIND_ORDER: ChangeKind[] = [
  "unchanged",
  "nothing_to_offer",
  "offer_to_nothing",
  "constraint_violation",
];

function Legend() {
  return (
    <div className="flex flex-wrap gap-2">
      {KIND_ORDER.map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: CHANGE_KIND_COLOR[k] }}
          />
          {CHANGE_KIND_LABEL[k]}
        </span>
      ))}
    </div>
  );
}

function RunControls({
  onRun,
  isPending,
}: {
  onRun: (input: Omit<ReplayJobInput, "base_version" | "proposed_version">) => void;
  isPending: boolean;
}) {
  const [seed, setSeed] = useState(42);
  const [count, setCount] = useState(200);
  const [injections, setInjections] = useState<Injection[]>([
    "timeout",
    "invalid_output",
    "stale_identity",
  ]);

  const toggleInjection = (inj: Injection) => {
    setInjections((prev) =>
      prev.includes(inj) ? prev.filter((i) => i !== inj) : [...prev, inj],
    );
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Session seed
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Session count
          <input
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          />
        </label>
        <fieldset className="col-span-1 flex flex-col gap-1 text-xs text-muted sm:col-span-2">
          <legend className="mb-1">Inject failures (fail-closed proof)</legend>
          <div className="flex flex-wrap gap-2">
            {ALL_INJECTIONS.map((inj) => {
              const active = injections.includes(inj.value);
              return (
                <button
                  key={inj.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleInjection(inj.value)}
                  className={
                    "inline-flex min-h-[44px] items-center rounded-md border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 " +
                    (active
                      ? "border-offer-blue/50 bg-offer-blue/15 text-offer-blue"
                      : "border-border bg-surface-2 text-muted hover:text-text")
                  }
                >
                  {active ? "✓ " : "+ "}
                  {inj.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <Button
          variant="primary"
          onClick={() => onRun({ session_seed: seed, session_count: count, injections })}
          disabled={isPending}
        >
          {isPending ? "Running replay…" : "Run Policy Diff Replay ▸"}
        </Button>
      </div>
    </Card>
  );
}

export function PolicyDiffReplay() {
  const {
    baseVersion,
    proposedVersion,
    job,
    setJob,
    selectedEvaluation,
    selectEvaluation,
  } = useConsole();
  const mutation = useReplayJob();

  // Playback state: how many marks are revealed, and whether it is playing.
  // `revealing` is true only during a user-triggered mark-by-mark replay, so the
  // pop animation never fires on plain job load (all marks shown at once).
  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  const evaluations = useMemo(() => job?.evaluations ?? [], [job]);

  useEffect(() => {
    // Reset playback when a new job arrives.
    if (job) {
      setRevealed(job.evaluations.length);
      setPlaying(false);
      setRevealing(false);
    }
  }, [job]);

  // When the walkthrough lands on this stage, auto-play the mark-by-mark reveal so
  // the sessions visibly count up — the backend "replaying," made legible. Reuses
  // the same reveal machinery as the "Replay marks" button.
  const { visits } = useStageActive("policy-diff-replay");
  useEffect(() => {
    if (visits === 0 || !job) return;
    if (reduced) {
      setRevealed(job.evaluations.length);
      return;
    }
    setRevealed(0);
    setRevealing(true);
    setPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits]);

  useEffect(() => {
    if (!playing) return;
    if (revealed >= evaluations.length) {
      setPlaying(false);
      setRevealing(false);
      return;
    }
    timer.current = window.setInterval(() => {
      setRevealed((r) => {
        if (r >= evaluations.length) return r;
        return Math.min(
          evaluations.length,
          r + Math.max(1, Math.round(evaluations.length / 80)),
        );
      });
    }, 40);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, revealed, evaluations.length]);

  const runReplay = (
    input: Omit<ReplayJobInput, "base_version" | "proposed_version">,
  ) => {
    if (!baseVersion || !proposedVersion) return;
    mutation.mutate(
      { base_version: baseVersion, proposed_version: proposedVersion, ...input },
      {
        onSuccess: ({ job: nextJob, requestId }) => setJob(nextJob, requestId, false),
        onError: async (e) => {
          // Unreachable API → recorded run so the panels still populate; the
          // banner makes clear it is a captured V17 → V18 replay, not this run.
          if (e instanceof ApiError && e.isUnreachable) {
            try {
              const job = await loadRecordedJob(proposedVersion);
              setJob(job, RECORDED_REQUEST_ID, true);
            } catch {
              /* fixture missing — leave the error state as-is */
            }
          }
        },
      },
    );
  };

  // Count over the REVEALED marks so the tallies climb during a reveal, then
  // settle on the true totals once every session is shown.
  const counts = useMemo(() => {
    const c: Record<ChangeKind, number> = {
      unchanged: 0,
      nothing_to_offer: 0,
      offer_to_nothing: 0,
      constraint_violation: 0,
    };
    for (const e of evaluations.slice(0, revealed)) c[e.change_kind] += 1;
    return c;
  }, [evaluations, revealed]);

  return (
    <Section
      id="policy-diff-replay"
      index={4}
      title="Policy Diff Replay"
      subtitle="Replays historical sessions through both policy versions. Each mark is one session, colored by how its decision changed. The hero is the diff, not a chart."
    >
      <div className="space-y-4">
        <RunControls onRun={runReplay} isPending={mutation.isPending} />

        {mutation.isError ? (
          <ErrorState
            title={
              mutation.error instanceof ApiError && mutation.error.isUnreachable
                ? "Backend unreachable"
                : "Replay job failed"
            }
            detail={mutation.error.message}
            requestId={
              mutation.error instanceof ApiError ? mutation.error.requestId : null
            }
          />
        ) : null}

        {!job ? (
          <EmptyState
            title="No replay has been run yet"
            hint="Configure a seed, count, and injections above, then run the replay to populate the decision-diff timeline, constraints, and verdict."
          />
        ) : (
          <Card className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <Legend />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => {
                    if (reduced) {
                      // Reduced motion: no timed reveal — everything, instantly.
                      setRevealed(evaluations.length);
                      return;
                    }
                    setRevealed(0);
                    setRevealing(true);
                    setPlaying(true);
                  }}
                >
                  ↻ Replay marks
                </Button>
                {!reduced ? (
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => setPlaying((p) => !p)}
                    aria-pressed={playing}
                  >
                    {playing ? "❚❚ Pause" : "▸ Play"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => {
                    setPlaying(false);
                    setRevealed((r) => Math.min(evaluations.length, r + 1));
                  }}
                >
                  ⇥ Step
                </Button>
              </div>
            </div>

            {/* Decision-diff timeline: one mark per session. */}
            <div
              className="scroll-x rounded-lg border border-border bg-base/40 p-3"
              aria-label="Decision-diff timeline"
            >
              <div className="flex flex-wrap gap-1">
                {evaluations.map((e, i) => {
                  const shown = i < revealed;
                  const isSelected = selectedEvaluation?.session_id === e.session_id;
                  const changed = e.change_kind !== "unchanged";
                  // During a mark-by-mark replay each mark pops as the playhead
                  // reaches it; changed marks (the story) pop harder and flash a
                  // ring in their own color (currentColor). On plain job load no
                  // pop fires — the timeline just IS.
                  const pop = shown && revealing ? (changed ? " mark-pop-changed" : " mark-pop") : "";
                  return (
                    <button
                      key={e.session_id}
                      onClick={() => selectEvaluation(e)}
                      title={`${e.session_id} · ${CHANGE_KIND_LABEL[e.change_kind]}`}
                      aria-label={`Session ${e.session_id}, ${CHANGE_KIND_LABEL[e.change_kind]}`}
                      className={
                        "h-4 w-4 rounded-[3px] transition-all duration-300 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
                        (shown ? "scale-100 opacity-100" : "scale-90 opacity-10") +
                        pop +
                        (isSelected ? " ring-2 ring-text" : "")
                      }
                      style={{
                        backgroundColor: CHANGE_KIND_COLOR[e.change_kind],
                        color: CHANGE_KIND_COLOR[e.change_kind],
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {KIND_ORDER.map((k) => (
                <Chip key={k} color={CHANGE_KIND_COLOR[k]}>
                  {CHANGE_KIND_LABEL[k]}: {counts[k]}
                </Chip>
              ))}
              <span className="ml-auto font-mono text-xs text-muted">
                {revealed}/{evaluations.length} revealed
              </span>
            </div>

            {/* Changed-only quick table for keyboard/scan access. */}
            <ChangedTable
              evaluations={evaluations}
              onSelect={selectEvaluation}
              selectedId={selectedEvaluation?.session_id ?? null}
            />
          </Card>
        )}
      </div>

      <SessionDrawer
        evaluation={selectedEvaluation}
        baseVersion={baseVersion}
        proposedVersion={proposedVersion}
        onClose={() => selectEvaluation(null)}
      />
    </Section>
  );
}

function ChangedTable({
  evaluations,
  onSelect,
  selectedId,
}: {
  evaluations: Evaluation[];
  onSelect: (e: Evaluation) => void;
  selectedId: string | null;
}) {
  const changed = evaluations.filter((e) => e.changed);
  if (changed.length === 0) {
    return (
      <p className="mt-3 text-xs text-muted">
        No sessions changed decision between these versions.
      </p>
    );
  }
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Changed sessions ({changed.length})
      </p>
      <div className="scroll-x rounded-lg border border-border">
        <table className="w-full min-w-[560px] border-collapse text-left font-mono text-xs">
          <thead className="bg-surface-2 text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">session</th>
              <th className="px-3 py-2 font-medium">change_kind</th>
              <th className="px-3 py-2 font-medium">base</th>
              <th className="px-3 py-2 font-medium">proposed</th>
              <th className="px-3 py-2 font-medium">violation</th>
            </tr>
          </thead>
          <tbody>
            {changed.map((e) => (
              <tr
                key={e.session_id}
                onClick={() => onSelect(e)}
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onSelect(e);
                  }
                }}
                className={
                  "cursor-pointer border-t border-border hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal " +
                  (selectedId === e.session_id ? "bg-surface-2" : "")
                }
              >
                <td className="px-3 py-1.5">{e.session_id}</td>
                <td
                  className="px-3 py-1.5"
                  style={{ color: CHANGE_KIND_COLOR[e.change_kind] }}
                >
                  {CHANGE_KIND_LABEL[e.change_kind]}
                </td>
                <td className="px-3 py-1.5 text-muted">{e.base.decision}</td>
                <td className="px-3 py-1.5 text-muted">{e.proposed.decision}</td>
                <td className="px-3 py-1.5">
                  {e.violation ? (
                    <span className="text-crimson">
                      {e.violation.key} · {renderValue(e.violation.attribute)}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
