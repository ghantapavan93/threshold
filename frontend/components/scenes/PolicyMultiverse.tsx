"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* The Policy Multiverse — the iconic scene. One field of 200 replayed sessions,
   two policies. Drag the divider and the same sessions decide differently: on the
   V18 side, 21 missing-attribute sessions the operator flip silently widens turn
   crimson. Click one to see the deterministic reason it flipped.

   The drama is the contrast between the smallness of the edit — one operator, "is
   not in" -> "is in" — and the size of the consequence. Numbers are real: the
   recorded V17 -> V18 run, 200 sessions, 21 widened. No 3D here on purpose; a
   compare-slider is the honest, legible medium for "same input, two worlds." */

const TOTAL = 200;
const COLS = 20;
const ROWS = TOTAL / COLS;
// The 21 sessions the V18 flip widens (missing cc_bin). Fixed, spread positions.
const WIDENED = [
  3, 7, 17, 24, 38, 52, 61, 79, 88, 96, 103, 112, 127, 134, 148, 155, 169, 176, 182, 190, 197,
];
const WIDENED_SET = new Set(WIDENED);

// column centre of a cell, as a 0–100 percentage across the field
const colPct = (i: number) => ((i % COLS) + 0.5) * (100 / COLS);

function Field({ side }: { side: "v17" | "v18" }) {
  return (
    <div
      className="grid h-full w-full gap-1.5 p-4"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
    >
      {Array.from({ length: TOTAL }, (_, i) => {
        const widened = WIDENED_SET.has(i);
        const crimson = side === "v18" && widened;
        return (
          <span
            key={i}
            className="rounded-[2px]"
            style={{
              backgroundColor: crimson
                ? "var(--c-crimson)"
                : "color-mix(in srgb, var(--c-teal) 20%, transparent)",
              boxShadow: crimson ? "0 0 7px -1px var(--c-crimson)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

export function PolicyMultiverse() {
  const [pct, setPct] = useState(52); // divider position; right of it shows V18
  const [picked, setPicked] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const revealed = useMemo(() => WIDENED.filter((i) => colPct(i) >= pct).length, [pct]);

  const moveTo = useCallback((clientX: number) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPct(Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    moveTo(e.clientX);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current) moveTo(e.clientX);
  };
  const onUp = () => {
    dragging.current = false;
  };

  // A widened cell is clickable only where the V18 side is visible (right of pct).
  const pickCell = (i: number) => {
    if (WIDENED_SET.has(i) && colPct(i) >= pct) setPicked(i);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span style={{ color: "var(--c-teal)" }}>V17 · include — “is not in”</span>
          <span className="text-muted">↔</span>
          <span style={{ color: "var(--c-crimson)" }}>V18 · exclude — “is in”</span>
        </div>
        <span className="font-mono text-xs text-muted">
          <span style={{ color: "var(--c-crimson)" }}>{revealed}</span> of {WIDENED.length} silently widened
        </span>
      </div>

      {/* the split field */}
      <div
        ref={wrap}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="relative aspect-[2/1] w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-base/60"
      >
        {/* base layer: V17 (the world before) */}
        <div className="absolute inset-0">
          <Field side="v17" />
        </div>

        {/* top layer: V18, revealed from the divider rightward */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pct}%)` }}>
          <Field side="v18" />
          {/* invisible hit targets over the widened cells, so a crimson dot is clickable */}
          <div
            className="absolute inset-0 grid gap-1.5 p-4"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
          >
            {Array.from({ length: TOTAL }, (_, i) =>
              WIDENED_SET.has(i) ? (
                <button
                  key={i}
                  type="button"
                  aria-label={`Widened session ${i}`}
                  onClick={() => pickCell(i)}
                  className="rounded-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  style={{ gridColumn: (i % COLS) + 1, gridRow: Math.floor(i / COLS) + 1 }}
                />
              ) : null,
            )}
          </div>
        </div>

        {/* the divider + handle */}
        <div className="absolute inset-y-0" style={{ left: `${pct}%` }}>
          <div className="absolute inset-y-0 -translate-x-1/2" style={{ width: 2, backgroundColor: "var(--c-border-strong)" }} />
          <button
            type="button"
            onPointerDown={onDown}
            aria-label="Drag to compare V17 and V18"
            className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border-strong bg-surface text-muted shadow-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <span aria-hidden className="text-xs">⇋</span>
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        Drag the divider — same 200 sessions, two policies. The right side is V18.
      </p>

      {/* deterministic evidence for a picked session */}
      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-xl border border-crimson/50 bg-crimson/10 p-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold" style={{ color: "var(--c-crimson)" }}>
                session s-{1000 + picked} · widened
              </span>
              <button type="button" onClick={() => setPicked(null)} className="text-muted hover:text-text" aria-label="Close">
                ✕
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted">
              <dt>attribute</dt>
              <dd className="text-text">cc_bin · missing</dd>
              <dt>V17 · “is not in”</dt>
              <dd style={{ color: "var(--c-teal)" }}>ineligible — no offer rendered (correct)</dd>
              <dt>V18 · “is in”</dt>
              <dd style={{ color: "var(--c-crimson)" }}>eligible — offer rendered (silently widened)</dd>
              <dt>why</dt>
              <dd className="text-text">a missing attribute is neither “in” nor “not in”; flipping the operator flips the default for the whole absent band.</dd>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
