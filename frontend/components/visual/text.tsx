"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* Per-character reveal — each letter rises out of a blur in reading order, the
   headline-writing cue from the ShelfTrace / Dreamship frontends. The text stays
   a single accessible string (aria-label); the animated glyphs are aria-hidden,
   so a screen reader hears the whole phrase, not a stutter of letters.

   Under reduced motion (or once revealed) it's just the plain text — no layout
   cost, fully legible. `immediate` animates on mount for above-the-fold headings
   where a scroll gate would never fire. */

export function CharReveal({
  text,
  className,
  delay = 0,
  stagger = 0.028,
  immediate = false,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const start = immediate || inView;

  // Settle net: if the per-letter tween never gets to run (a tab that loads in
  // the background pauses rAF), snap to the plain, fully-legible headline rather
  // than leave critical text stranded invisible at opacity 0.
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (reduced || !start) return;
    const total = (delay + text.length * stagger + 0.6) * 1000;
    const t = window.setTimeout(() => setDone(true), total);
    return () => window.clearTimeout(t);
  }, [start, reduced, delay, stagger, text.length]);

  if (reduced || done) {
    const Plain = Tag as "span";
    return <Plain className={className}>{text}</Plain>;
  }

  const MotionTag = motion[Tag];
  return (
    <MotionTag
      ref={ref as never}
      className={className}
      aria-label={text}
      initial="hidden"
      animate={start ? "shown" : "hidden"}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre will-change-transform"
          variants={{
            hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
            shown: {
              opacity: 1,
              y: "0em",
              filter: "blur(0px)",
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {ch}
        </motion.span>
      ))}
    </MotionTag>
  );
}

/* Glitter wordmark — a solid word with a bright sheen sweeping across it. Thin
   wrapper over the .text-shimmer CSS (pure-CSS so it survives a throttled tab).
   Use for brand marks in the header / footer. */
export function ShimmerText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={"text-shimmer " + className}>{children}</span>;
}
