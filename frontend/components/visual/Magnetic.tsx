"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/* Magnetic hover — the element leans toward the cursor and springs back on leave.
   The tactile Linear/Vercel cue used across the reference frontends (SSC/Dreamship/
   Fridge useMagnetic). Active only on fine pointers with motion allowed; otherwise
   the handlers are simply off and it rests at 0, so a touch tap never leans.

   One motion.div is rendered on both server and client (no conditional swap → no
   hydration mismatch, no mount-time remount); only the pointer handlers toggle. */

export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.5 });

  useEffect(() => {
    setActive(
      !reduced && (window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false),
    );
  }, [reduced]);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={active ? onMove : undefined}
      onPointerLeave={active ? reset : undefined}
      style={{ x: sx, y: sy }}
      className={"inline-block " + (className ?? "")}
    >
      {children}
    </motion.div>
  );
}
