"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Pill, Scene, SceneHeadline, EASE } from "./stage";

/* 09 · The Afterglow — the theater is empty, the confirmation complete. Only a
   quiet transaction trace remains lit. The transaction ends; the evidence
   remains. Closing ask: inspect the evidence, not the promises. */

function EmptyTheater() {
  const rows = Array.from({ length: 6 }, (_, r) => ({ r, seats: 12 + r * 2, y: 320 + r * 34, scale: 0.5 + r * 0.08 }));
  return (
    <div className="absolute inset-0 bg-[#04060c]">
      <div
        className="absolute left-1/2 top-[14%] h-[30%] w-[54%] -translate-x-1/2 rounded-[40%] opacity-25 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--c-teal) 12%, transparent), transparent 70%)" }}
      />
      <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <polygon points="250,80 750,80 705,240 295,240" fill="none" stroke="var(--c-teal)" strokeOpacity="0.18" strokeWidth="1" />
        {rows.map((row) =>
          Array.from({ length: row.seats }, (_, s) => {
            const spacing = 900 / row.seats;
            const x = 50 + s * spacing + spacing / 2;
            return <rect key={`${row.r}-${s}`} x={x - 6 * row.scale} y={row.y} width={12 * row.scale} height={10 * row.scale} rx={2} fill="var(--c-border-strong)" opacity={0.18} />;
          }),
        )}
      </svg>
    </div>
  );
}

export function ChapterAfterglow() {
  const reduced = useReducedMotion();
  const closers = ["Every assumption visible.", "Every failure traceable.", "Every claim labelled.", "Every decision open to challenge."];
  return (
    <Scene id="kc-afterglow" n="09" label="The Afterglow" accent="teal" clip="kc-afterglow" environment={<EmptyTheater />}>
      <div className="mx-auto max-w-3xl text-center">
        <Pill accent="teal">After the transaction</Pill>
        <SceneHeadline className="mx-auto mt-6">
          The transaction ends. The evidence remains.
        </SceneHeadline>

        <div className="mx-auto mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {closers.map((c, i) => (
            <motion.span
              key={c}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
              className="font-mono text-sm text-muted"
            >
              <span aria-hidden className="mr-1.5 text-teal">▛</span>{c}
            </motion.span>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-text">
          Do not hire the promises. Inspect the evidence.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="press inline-flex min-h-[48px] items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
          >
            <span aria-hidden>▶</span> Challenge the build
          </Link>
          <Link
            href="/builder"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            Start a ten-minute review
          </Link>
        </div>
      </div>
    </Scene>
  );
}
