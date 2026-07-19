"use client";

import { useEffect, useRef, useState } from "react";
import { MaskText } from "@/components/builder/anim";
import { HorizonBackdrop } from "./HorizonBackdrop";
import { VisionArc } from "./VisionArc";
import {
  ClosingBridge,
  HypothesisPlate,
  MovementHeader,
  OpeningBridge,
} from "./HypothesisPlate";
import { HYPOTHESES, MOVEMENTS } from "./horizon.data";

/* ────────────────────────────────────────────────────────────────────────────
   The Horizon (Fig. 08) — replaces the flat future-hypotheses gallery with a
   cinematic four-movement arc, bracketed by shipped reality (opening + closing
   bridges). The celestial backdrop is band-scoped (absolute inset-0), so it does
   not fight LivingBackground on other sections. Keeps the section id "sec-future"
   and heading id "future-h" so the existing PlateRail entry still targets it.
   Reduced-motion → the composed static frame + the arc fully drawn.
   ──────────────────────────────────────────────────────────────────────────── */
export function Horizon() {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reduced-motion → arc fully drawn immediately (still keyboard/scroll works).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(HYPOTHESES.length - 1);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.arc);
          if (!Number.isNaN(idx)) setActive((a) => Math.max(a, idx));
        }
      },
      { rootMargin: "-30% 0px -40% 0px" },
    );
    const nodes = rootRef.current?.querySelectorAll<HTMLElement>("[data-arc]") ?? [];
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <section id="sec-future" aria-labelledby="future-h" className="relative scroll-mt-24">
      {/* Opening bridge — still on the drafting grid, before the cosmos opens */}
      <div className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">Fig. 08 · The Horizon</p>
          <MaskText
            as="h2"
            id="future-h"
            className="mt-3 max-w-3xl text-3xl font-bold leading-[1.05] tracking-tightest sm:text-4xl"
            segments={[{ text: "Where the Transaction Moment " }, { text: "goes next.", className: "gradient-text" }]}
          />
        </div>
        <div className="mt-8">
          <OpeningBridge />
        </div>
      </div>

      {/* The cosmic band */}
      <div ref={rootRef} className="relative overflow-hidden">
        <HorizonBackdrop />
        <div className="relative z-10 pb-16">
          {/* the trajectory spine */}
          <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
            <VisionArc active={active} />
          </div>

          {MOVEMENTS.map((m) => {
            const hyps = HYPOTHESES.filter((h) => h.movement === m.key);
            return (
              <div key={m.key}>
                <MovementHeader eyebrow={m.eyebrow} line={m.line} />
                {hyps.map((h) => (
                  <div key={h.id} data-arc={h.arc - 1}>
                    <HypothesisPlate h={h} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Closing bridge — every horizon attaches at the edges */}
      <div className="py-14 sm:py-20">
        <ClosingBridge />
      </div>
    </section>
  );
}
