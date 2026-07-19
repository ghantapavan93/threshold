"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { prefersReducedMotion } from "@/components/builder/anim";
import { COLLISIONS, type Collision } from "./content";

/* ────────────────────────────────────────────────────────────────────────────
   Ubiquitous-Language Collision — the Language Lens (Fig. 03).
   Take one word and move it across a bounded-context boundary; its definition,
   concept-shape, and connotation mutate at the seam. Keyboard-first: the token
   is role="slider" (←/→ across boundaries), fully announced via aria-live.
   Reduced-motion → a static comparison table (insight survives with zero motion).
   ──────────────────────────────────────────────────────────────────────────── */

const SHAPE = "var(--c-teal)";

function ConceptShape({ shape }: { shape: string }) {
  const common = { fill: "none", stroke: SHAPE, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden>
      {shape === "gate" && (
        <>
          <line x1="12" y1="8" x2="12" y2="40" {...common} />
          <line x1="36" y1="8" x2="36" y2="40" {...common} />
          <path d="M12 20 h24 M12 28 h24" {...common} strokeOpacity={0.6} />
        </>
      )}
      {shape === "cart" && (
        <>
          <path d="M8 12 h6 l4 18 h16 l4 -12 h-22" {...common} />
          <circle cx="20" cy="38" r="2.5" {...common} />
          <circle cx="32" cy="38" r="2.5" {...common} />
        </>
      )}
      {shape === "record" && (
        <>
          <rect x="12" y="8" width="24" height="32" rx="2" {...common} />
          <path d="M17 16 h14 M17 22 h14 M17 28 h9" {...common} strokeOpacity={0.7} />
        </>
      )}
      {shape === "coin" && (
        <>
          <circle cx="24" cy="24" r="14" {...common} />
          <text x="24" y="29" textAnchor="middle" fontSize="14" fill={SHAPE} fontFamily="var(--font-mono, monospace)">★</text>
        </>
      )}
      {shape === "seal" && (
        <>
          <path d="M24 8 l14 6 v10 c0 10 -7 15 -14 18 c-7 -3 -14 -8 -14 -18 V14 Z" {...common} />
          <path d="M18 24 l4 4 l8 -9" {...common} />
        </>
      )}
      {shape === "ledger" && (
        <>
          <rect x="10" y="10" width="28" height="28" rx="2" {...common} />
          <path d="M24 10 v28 M10 20 h28 M10 30 h28" {...common} strokeOpacity={0.6} />
        </>
      )}
    </svg>
  );
}

function Slab({ collision, i }: { collision: Collision; i: number }) {
  const m = collision.meanings[i]!;
  return (
    <div key={i} className="thr-rise rounded-xl border border-teal/30 bg-teal/[0.05] p-5">
      <div className="flex items-center gap-3">
        <ConceptShape shape={m.shape} />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-teal">{m.context}</p>
          <p className="text-[11px] text-muted">{m.connotation}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-text">{m.gloss}</p>
    </div>
  );
}

export function LanguageLens() {
  const [termIdx, setTermIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  const collision = COLLISIONS[termIdx]!;
  const n = collision.meanings.length;
  const clampedPos = Math.min(pos, n - 1);
  const current = collision.meanings[clampedPos]!;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setPos((p) => Math.min(n - 1, p + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setPos((p) => Math.max(0, p - 1));
    } else if (e.key === "Home") {
      setPos(0);
    } else if (e.key === "End") {
      setPos(n - 1);
    }
  };

  const pickTerm = (i: number) => {
    setTermIdx(i);
    setPos(0);
  };

  return (
    <div>
      {/* Term switcher */}
      <div role="radiogroup" aria-label="Choose a colliding term" className="flex flex-wrap gap-2">
        {COLLISIONS.map((c, i) => {
          const on = i === termIdx;
          return (
            <button
              key={c.term}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => pickTerm(i)}
              className={
                "inline-flex min-h-[40px] items-center rounded-full border px-3.5 py-1 font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 " +
                (on ? "border-teal/60 bg-teal/10 text-teal" : "border-border bg-surface-2/50 text-muted hover:text-text")
              }
            >
              {c.term}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{collision.title}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        boundary: {collision.boundary}
      </p>

      {reduced ? (
        // Reduced-motion: comparison table (no drag, full insight)
        <div className="mt-5 grid gap-3" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
          {collision.meanings.map((_, i) => (
            <Slab key={i} collision={collision} i={i} />
          ))}
        </div>
      ) : (
        <>
          {/* The seam + travelling token */}
          <div className="mt-6">
            <div className="relative h-20">
              {/* boundary stops */}
              <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between">
                {collision.meanings.map((m, i) => (
                  <span key={i} className="flex flex-col items-center gap-1" style={{ width: `${100 / n}%` }}>
                    <span aria-hidden className="h-8 w-px bg-border-strong" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{m.context}</span>
                  </span>
                ))}
              </div>
              {/* seam glyphs between stops */}
              <div aria-hidden className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-around text-muted">
                {Array.from({ length: n - 1 }).map((_, i) => (
                  <span key={i} className="font-mono text-sm">∥</span>
                ))}
              </div>
              {/* the token */}
              <button
                type="button"
                role="slider"
                aria-label={`Term “${collision.term}” across ${n} contexts`}
                aria-valuemin={0}
                aria-valuemax={n - 1}
                aria-valuenow={clampedPos}
                aria-valuetext={`Now in ${current.context}: ${current.gloss}`}
                onKeyDown={onKey}
                className="absolute top-0 z-10 flex h-11 min-w-[44px] -translate-x-1/2 items-center justify-center rounded-full border border-teal bg-teal/15 px-4 font-mono text-sm font-semibold text-teal shadow-glow-teal transition-[left] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                style={{ left: `${n === 1 ? 50 : (clampedPos / (n - 1)) * 100}%` }}
              >
                {collision.term}
              </button>
            </div>
            <div className="mt-2 flex justify-center gap-2">
              {collision.meanings.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPos(i)}
                  aria-label={`Move term to ${m.context}`}
                  className={
                    "h-2.5 w-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
                    (i === clampedPos ? "bg-teal" : "bg-border-strong hover:bg-muted")
                  }
                />
              ))}
            </div>
          </div>

          {/* current meaning slab (crossfades on move) */}
          <div className="mt-5" aria-live="polite">
            <Slab collision={collision} i={clampedPos} />
          </div>
        </>
      )}

      <p className="mt-5 rounded-lg border border-crimson/25 bg-crimson/[0.05] p-4 text-sm leading-relaxed text-text">
        <span className="font-semibold text-crimson">Same word, different model. </span>
        {collision.failure}
      </p>
    </div>
  );
}
