"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/builder/anim";
import { PATH_A, PATH_B, type Station } from "./model";

/* The two live paths as numbered station timelines. The full route is always in
   the DOM (a11y + reduced-motion safe); Play advances an active highlight with an
   aria-live caption. Reduced-motion → no auto-play, manual Step only. */

const TONE: Record<Station["tone"], string> = {
  teal: "var(--c-teal)",
  "offer-blue": "var(--c-offer-blue)",
  amber: "var(--c-amber)",
  crimson: "var(--c-crimson)",
  muted: "var(--c-muted)",
};

function Route({ stations }: { stations: Station[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  useEffect(() => {
    if (!playing) return;
    if (active >= stations.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setActive((a) => Math.min(stations.length - 1, a + 1)), 1500);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, active, stations.length]);

  const cur = stations[active]!;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          className="press inline-flex min-h-[40px] items-center rounded-md border border-border px-3 py-1 font-mono text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
        >
          ◀ Step
        </button>
        {!reduced ? (
          <button
            type="button"
            onClick={() => {
              if (active >= stations.length - 1) setActive(0);
              setPlaying((p) => !p);
            }}
            aria-pressed={playing}
            className="press inline-flex min-h-[40px] items-center rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-mono text-xs font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
          >
            {playing ? "❚❚ Pause" : "▸ Play"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setActive((a) => Math.min(stations.length - 1, a + 1))}
          className="press inline-flex min-h-[40px] items-center rounded-md border border-border px-3 py-1 font-mono text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
        >
          Step ▶
        </button>
        <span className="font-mono text-[11px] text-muted">
          {active + 1} / {stations.length}
        </span>
      </div>

      <ol className="relative mt-4 space-y-2 border-l border-border/70 pl-6">
        {stations.map((s, i) => {
          const on = i === active;
          const done = i < active;
          const color = TONE[s.tone];
          return (
            <li key={s.n} className="relative">
              <span
                aria-hidden
                className="absolute -left-[calc(1.5rem+1px)] top-1 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border bg-base font-mono text-[11px] font-semibold transition-all"
                style={{
                  borderColor: on || done ? color : "var(--c-border-strong)",
                  color: on || done ? color : "var(--c-muted)",
                  boxShadow: on ? `0 0 0 3px color-mix(in srgb, ${color} 20%, transparent)` : undefined,
                }}
              >
                {s.n}
              </span>
              <div
                className="rounded-lg border p-3 transition-colors"
                style={{ borderColor: on ? color : "var(--c-border)", backgroundColor: on ? `color-mix(in srgb, ${color} 8%, transparent)` : "transparent" }}
              >
                <p className="text-sm font-semibold text-text">{s.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{s.caption}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <p aria-live="polite" className="sr-only">
        Step {active + 1}: {cur.title}. {cur.caption}
      </p>
    </div>
  );
}

export function PathAnimator() {
  const [tab, setTab] = useState<"A" | "B">("A");
  const [workers, setWorkers] = useState(1);
  return (
    <div>
      <div role="tablist" aria-label="Live paths" className="flex flex-wrap gap-2">
        {(["A", "B"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={
              "inline-flex min-h-[40px] items-center rounded-md border px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 " +
              (tab === t ? "border-teal/50 bg-teal/10 text-teal" : "border-border text-muted hover:text-text")
            }
          >
            {t === "A" ? "Path A · Synchronous decision" : "Path B · Asynchronous fan-out"}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {tab === "A"
          ? "Moment Forge compile / simulate — read-only, non-persisting: it never writes a PolicyVersionRow, ReplayJobRow, OutboxEventRow or ConversionRow."
          : "The authoritative replay job + transactional outbox — the job row and its fan-out events commit atomically, then a worker drains them with backoff, jitter and dead-lettering."}
      </p>

      <div className="mt-4">{tab === "A" ? <Route key="A" stations={PATH_A} /> : <Route key="B" stations={PATH_B} />}</div>

      {tab === "B" ? (
        <div className="mt-5 rounded-xl border border-border/60 bg-surface-2/25 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Scale-out · worker lanes</span>
            {[1, 2, 3].map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={workers === w}
                onClick={() => setWorkers(w)}
                className={
                  "inline-flex min-h-[36px] items-center rounded-md border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 " +
                  (workers === w ? "border-teal/50 bg-teal/10 text-teal" : "border-border text-muted hover:text-text")
                }
              >
                {w} worker{w > 1 ? "s" : ""}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: workers }).map((_, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-md border border-teal/40 bg-teal/[0.06] px-2.5 py-1 font-mono text-[11px] text-teal">
                <span aria-hidden>●</span> worker {i + 1} draining
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            <span className="font-semibold text-text">FOR UPDATE SKIP LOCKED (Postgres only)</span> lets N workers drain
            the same outbox table without colliding. On the SQLite local loop it degrades to a plain{" "}
            <span className="font-mono">SELECT … LIMIT 50</span> — one drain at a time. This is the honest scale-out proof
            (FUTURE_VISION Milestone B — already implemented).
          </p>
        </div>
      ) : null}
    </div>
  );
}
