"use client";

import { motion, useReducedMotion } from "framer-motion";

/* A full-screen kinetic statement — used ONLY at a major transition, never as
   decoration. Monumental type, one line per beat, the meaning-bearing words tinted
   by system state. Reduced motion drops the stagger but keeps every word. */

type Line = { text: string; tone?: string };
const EASE = [0.16, 1, 0.3, 1] as const;

export function StatementBand({ lines }: { lines: Line[] }) {
  const reduced = useReducedMotion();
  return (
    <section
      aria-label="Statement"
      className="mx-auto flex min-h-[52vh] max-w-5xl flex-col justify-center px-4 py-20 sm:px-6"
    >
      <div className="space-y-1">
        {lines.map((l, i) => (
          <div key={i} className="overflow-hidden">
            <motion.p
              initial={reduced ? false : { y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
              className="text-4xl font-bold leading-[1.02] tracking-tightest sm:text-6xl"
              style={{ color: l.tone ?? "var(--c-text)", fontFamily: "var(--font-display)" }}
            >
              {l.text}
            </motion.p>
          </div>
        ))}
      </div>
    </section>
  );
}
