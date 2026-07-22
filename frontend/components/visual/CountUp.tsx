"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/* A number that counts up when it scrolls into view — the metrics-console signature
   in the reference frontends (SSC/Dreamship/Fridge animated counters). One-shot,
   transform-free (just text), and under reduced motion it renders the final value
   immediately. */

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.3,
  immediate = false,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  /** Animate on mount instead of on scroll-into-view — for always-visible
   *  (above-the-fold) numbers, where an IntersectionObserver gate is fragile. */
  immediate?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const start = immediate || inView;
  const [val, setVal] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced || !start) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
      onComplete: () => setVal(to),
    });
    // Robustness: rAF fully pauses in a background tab, which would strand the
    // counter at 0 (worse than the static number). Timers only THROTTLE, so this
    // guarantees the final value lands even if the tween never got to run.
    const settle = window.setTimeout(() => setVal(to), (duration + 0.5) * 1000);
    return () => {
      controls.stop();
      window.clearTimeout(settle);
    };
  }, [start, reduced, to, duration]);

  const shown =
    decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-US");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
