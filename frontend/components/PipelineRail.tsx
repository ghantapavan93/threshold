"use client";

import { useState } from "react";
import { useWalkthrough } from "./walkthrough";

/* A fixed bottom "guided tour" bar. It appears the moment a run starts and shows
   the whole pipeline as ten steps — backend stage by backend stage — with the
   current step lit, completed steps checked, and a plain-language caption of what
   just happened. Click any step to jump there. This is what turns a wall of static
   sections into one legible flow a first-timer can follow. */

export function PipelineRail() {
  const { stages, activeIndex, caption, walking, goTo, stop } = useWalkthrough();
  const [hidden, setHidden] = useState(false);

  // Only present once a run has begun.
  if (activeIndex < 0 || hidden) return null;

  const total = stages.length;
  const step = activeIndex + 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-base/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6">
        {/* stepper */}
        <div className="scroll-x flex items-center gap-1 overflow-x-auto pb-1">
          {stages.map((s, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            const tone = active ? "var(--c-teal)" : done ? "var(--c-teal)" : "var(--c-muted)";
            return (
              <div key={s.id} className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  aria-current={active ? "step" : undefined}
                  className="group flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-surface-2/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                  title={s.title}
                >
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px] font-semibold transition-colors"
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
                    className="whitespace-nowrap text-[11px] font-medium"
                    style={{ color: active ? "var(--c-text)" : "var(--c-muted)" }}
                  >
                    {s.short}
                  </span>
                </button>
                {i < total - 1 ? (
                  <span
                    aria-hidden
                    className="mx-0.5 h-px w-3 shrink-0"
                    style={{ backgroundColor: i < activeIndex ? "var(--c-teal)" : "var(--c-border)" }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* caption + controls */}
        <div className="mt-1 flex items-center gap-3">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-teal">
            Step {step}/{total}
          </span>
          <p aria-live="polite" className="min-w-0 flex-1 truncate text-xs text-text sm:text-sm" title={caption}>
            {caption}
          </p>
          {walking ? (
            <button
              type="button"
              onClick={stop}
              className="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-border-strong hover:text-text"
            >
              ❚❚ Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo("release-verdict")}
              className="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-border-strong hover:text-text"
              title="Jump to the verdict"
            >
              Skip to verdict →
            </button>
          )}
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label="Hide the pipeline bar"
            className="shrink-0 rounded-md px-1.5 py-1 text-muted transition-colors hover:text-text"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
