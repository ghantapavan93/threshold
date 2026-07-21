"use client";

import type { ReactNode } from "react";
import { useWalkthrough } from "./walkthrough";

/* Wraps a pipeline section and makes it physically react when the walkthrough
   lands on it: a teal glow ring draws in, a "· live" badge appears, and while the
   tour is running the OTHER sections gently dim — so the spotlight is visibly
   moving down the pipeline, stage by stage. Completed stages keep a faint teal
   edge so progress reads down the page. Purely a visual layer; the section keeps
   its own DOM id, so the walkthrough's scroll targets it unchanged.

   The active/dim/done state is applied as INLINE STYLE (not a JS-animation-library
   value), with a CSS transition for smoothness — so the resting look is correct
   even when requestAnimationFrame is throttled (e.g. a background tab), and it
   honours reduced-motion via `motion-reduce:transition-none`. */

const ACTIVE_SHADOW =
  "0 0 0 1.5px color-mix(in srgb, var(--c-teal) 55%, transparent), 0 12px 44px -12px color-mix(in srgb, var(--c-teal) 42%, transparent)";
const DONE_SHADOW = "0 0 0 1px color-mix(in srgb, var(--c-teal) 22%, transparent)";

export function StageSpotlight({ id, children }: { id: string; children: ReactNode }) {
  const { stages, activeIndex, walking } = useWalkthrough();

  const idx = stages.findIndex((s) => s.id === id);
  const isActive = idx >= 0 && idx === activeIndex;
  const isDone = idx >= 0 && activeIndex > idx;
  const dim = walking && !isActive;
  const short = idx >= 0 ? stages[idx]?.short ?? "" : "";

  return (
    <div
      className="relative rounded-2xl transition-all duration-500 ease-out motion-reduce:transition-none"
      style={{
        boxShadow: isActive ? ACTIVE_SHADOW : isDone ? DONE_SHADOW : "0 0 0 0 transparent",
        opacity: dim ? 0.6 : 1,
        transform: dim ? "scale(0.992)" : "scale(1)",
      }}
    >
      {isActive ? (
        <span className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-teal/50 bg-teal/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-teal backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
          {short} · live
        </span>
      ) : null}
      {children}
    </div>
  );
}
