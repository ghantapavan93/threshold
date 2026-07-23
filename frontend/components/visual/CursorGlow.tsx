"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

/* A soft teal light that follows the cursor across the whole page — the ambient
   "premium interactive" cue used by every reference frontend (ShelfTrace
   CursorSpotlight, Dreamship cursor glow, SSC useMouseGlow). It ADDS light via
   mix-blend screen rather than overlaying a scrim, springs so it lags gracefully,
   never blocks pointers, and is off entirely on touch / reduced-motion. */

export function CursorGlow() {
  const reduced = useReducedMotion();
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 140, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 140, damping: 22, mass: 0.4 });
  const background = useTransform(
    [sx, sy],
    ([vx, vy]) =>
      `radial-gradient(560px circle at ${vx}px ${vy}px, rgba(34, 230, 200, 0.08), rgba(91, 140, 255, 0.05) 26%, transparent 60%)`,
  );

  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    if (!window.matchMedia?.("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      // drive the per-card spotlight: the card under the cursor tracks the pointer
      const card = (e.target as HTMLElement | null)?.closest?.(".holo-card, .spotlight") as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, x, y]);

  if (reduced) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[55] hidden md:block"
      style={{ background, mixBlendMode: "screen" }}
    />
  );
}
