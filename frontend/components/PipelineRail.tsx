"use client";

import { useEffect, useRef, useState } from "react";
import { useWalkthrough } from "./walkthrough";
import { prefersReducedMotion } from "@/lib/scroll";

/* A fixed bottom "guided tour" bar. It appears the moment a run starts and shows
   the whole pipeline as ten steps — backend stage by backend stage — with the
   current step lit, completed steps checked, and a plain-language caption of what
   just happened. Click any step to jump there.

   Mobile: labels collapse to numbered dots so all ten fit, the active step
   auto-scrolls to centre as the walk advances (so you never lose your place on a
   narrow screen), the current stage NAME rides in the step chip, and the controls
   shorten. Desktop keeps the full labelled stepper. */

export function PipelineRail() {
  const { stages, activeIndex, caption, walking, goTo, stop } = useWalkthrough();
  const [hidden, setHidden] = useState(false);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Keep the active step in view within the horizontal stepper — essential on
  // mobile where only a few dots are visible at once. `block: nearest` avoids
  // nudging the page vertically.
  useEffect(() => {
    if (activeIndex < 0) return;
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeIndex]);

  // Only present once a run has begun.
  if (activeIndex < 0 || hidden) return null;

  const total = stages.length;
  const step = activeIndex + 1;
  const currentShort = stages[activeIndex]?.short ?? "";

  return (
    <div
      data-pipeline-rail
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-base/90 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-2 py-2 sm:px-6 sm:py-2.5">
        {/* stepper — dots on mobile, dots + labels on desktop */}
        <div className="scroll-x flex items-center gap-0.5 overflow-x-auto pb-1 sm:gap-1">
          {stages.map((s, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            const tone = active || done ? "var(--c-teal)" : "var(--c-muted)";
            return (
              <div key={s.id} className="flex shrink-0 items-center">
                <button
                  type="button"
                  ref={active ? activeRef : undefined}
                  onClick={() => goTo(s.id)}
                  aria-current={active ? "step" : undefined}
                  aria-label={s.title}
                  title={s.title}
                  className="group flex min-h-[36px] items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-2/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:px-2"
                >
                  <span
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-semibold transition-colors"
                    style={{
                      color: active ? "#04110d" : tone,
                      borderColor: tone,
                      backgroundColor: active
                        ? "var(--c-teal)"
                        : done
                          ? "color-mix(in srgb, var(--c-teal) 16%, transparent)"
                          : "transparent",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className="hidden whitespace-nowrap text-[11px] font-medium sm:inline"
                    style={{ color: active ? "var(--c-text)" : "var(--c-muted)" }}
                  >
                    {s.short}
                  </span>
                </button>
                {i < total - 1 ? (
                  <span
                    aria-hidden
                    className="mx-0.5 h-px w-1.5 shrink-0 sm:w-3"
                    style={{ backgroundColor: i < activeIndex ? "var(--c-teal)" : "var(--c-border)" }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* caption + controls */}
        <div className="mt-1 flex items-center gap-2 sm:gap-3">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-teal">
            {step}/{total}
            {/* on mobile the dots have no labels, so name the current stage here */}
            <span className="ml-1 normal-case text-text sm:hidden">· {currentShort}</span>
          </span>
          <p
            aria-live="polite"
            className="min-w-0 flex-1 truncate text-xs text-text sm:text-sm"
            title={caption}
          >
            {caption}
          </p>
          {walking ? (
            <button
              type="button"
              onClick={stop}
              className="inline-flex min-h-[36px] shrink-0 items-center rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-border-strong hover:text-text"
            >
              <span aria-hidden>❚❚</span>
              <span className="hidden sm:ml-1 sm:inline">Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo("release-verdict")}
              title="Jump to the verdict"
              className="inline-flex min-h-[36px] shrink-0 items-center rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-border-strong hover:text-text"
            >
              <span className="hidden sm:inline">Skip to verdict&nbsp;</span>
              <span className="sm:hidden">Skip&nbsp;</span>→
            </button>
          )}
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label="Hide the pipeline bar"
            className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:text-text"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
