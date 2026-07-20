"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   Garnish — the cinematic finish layer, ported from the ShelfTrace vision
   grammar (cinematic.tsx) and re-grounded in Threshold's tokens and laws:
   • FilmGrain        — full-page photographic grain (static SVG noise).
   • Tilt3D           — pointer-tracked 3D card tilt on spring physics.
   • Magnetic         — CTAs lean toward the cursor and spring home.
   • CelebrationBurst — a one-shot particle burst when a REAL result lands;
                        celebration is tied to proof, never decoration alone.
   Every effect is a no-op under prefers-reduced-motion and none of them
   carry meaning alone (no color-alone, no information in motion).
   ──────────────────────────────────────────────────────────────────────────── */

export function FilmGrain({ id = "mf" }: { id?: string }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full opacity-[.035] mix-blend-overlay"
    >
      <filter id={`grain-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${id})`} />
    </svg>
  );
}

/** Pointer-tracked 3D tilt (spring-damped). Mouse-only by construction —
 *  touch devices never fire mousemove streams, so phones are unaffected. */
export function Tilt3D({
  children,
  max = 6,
  className = "",
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, (v) => -v * max), { stiffness: 200, damping: 22 });
  const ry = useSpring(useTransform(x, (v) => v * max), { stiffness: 200, damping: 22 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 1200 }}
      className={className}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}

/** The wrapped element leans toward the cursor and springs back on leave.
 *  Kept subtle (12px max) so buttons feel alive, not slippery. */
export function Magnetic({
  children,
  strength = 12,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set(((e.clientX - r.left) / r.width - 0.5) * strength);
    y.set(((e.clientY - r.top) / r.height - 0.5) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, display: "inline-block" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** One-shot radial particle burst. Fires whenever `fireKey` CHANGES to a new
 *  non-null value — wire it to a run counter so the celebration marks a real
 *  engine result landing, never idle decoration. Absent under reduced motion
 *  (purely celebratory; no information is lost). */
export function CelebrationBurst({
  fireKey,
  color = "rgba(34,230,200,.85)",
  count = 12,
}: {
  fireKey: string | number | null;
  color?: string;
  count?: number;
}) {
  const reduced = useReducedMotion();
  const [burstId, setBurstId] = useState(0);
  const prev = useRef<string | number | null>(null);

  useEffect(() => {
    if (fireKey !== null && fireKey !== prev.current) {
      setBurstId((n) => n + 1);
    }
    prev.current = fireKey;
  }, [fireKey]);

  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + Math.random() * 0.6,
        distance: 70 + Math.random() * 60,
        size: 2 + Math.random() * 2.5,
      })),
    // Regenerate the constellation for every burst so no two look identical.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, burstId],
  );

  if (reduced || burstId === 0) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      <AnimatePresence>
        {dots.map((d, i) => (
          <motion.span
            key={`${burstId}-${i}`}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: d.size,
              height: d.size,
              background: color,
              boxShadow: `0 0 ${d.size * 4}px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(d.angle) * d.distance,
              y: Math.sin(d.angle) * d.distance,
              opacity: 0,
              scale: 0.4,
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
