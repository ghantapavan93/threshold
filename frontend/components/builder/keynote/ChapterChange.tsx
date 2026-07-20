"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CursorSpotlight, Pill, RoktEcho, Scene, SceneHeadline, EASE } from "./stage";

/* 01 · The Change — a dark decision chamber. The current and proposed policy
   hang in the scene as physical slabs, not dashboard panels. One rule flips a
   single operator — the change that compiles successfully and is dangerous
   anyway. Code-drawn chamber: converging perspective lines + a floor grid. */

function ChamberEnvironment() {
  return (
    <div className="absolute inset-0 bg-[#05070e]">
      <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {/* converging perspective lines toward a vanishing point */}
        {Array.from({ length: 13 }, (_, i) => {
          const x = (i / 12) * 1000;
          return <line key={`v${i}`} x1={x} y1={0} x2={500} y2={320} stroke="var(--c-border)" strokeOpacity="0.25" strokeWidth="1" />;
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const y = 340 + i * i * 6;
          return <line key={`h${i}`} x1={0} y1={y} x2={1000} y2={y} stroke="var(--c-border)" strokeOpacity="0.2" strokeWidth="1" />;
        })}
        <circle cx="500" cy="320" r="180" fill="var(--c-crimson)" opacity="0.05" />
      </svg>
    </div>
  );
}

function RuleSlab({
  version,
  op,
  tone,
  delay,
}: {
  version: string;
  op: string;
  tone: "muted" | "crimson";
  delay: number;
}) {
  const reduced = useReducedMotion();
  const color = tone === "crimson" ? "var(--c-crimson)" : "var(--c-muted)";
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 30, rotateY: tone === "crimson" ? -8 : 8 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ type: "spring", stiffness: 110, damping: 20, delay }}
      className="glass rounded-2xl p-5"
      style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, perspective: 1000 }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xl font-bold" style={{ color, fontFamily: "var(--font-display)" }}>{version}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">eligibility rule r4</span>
      </div>
      <div className="mt-4 rounded-lg border border-border/60 bg-base/50 p-3 font-mono text-sm">
        <span className="text-muted">customer.cc_bin </span>
        <span style={{ color }}>{op}</span>
      </div>
    </motion.div>
  );
}

export function ChapterChange() {
  const reduced = useReducedMotion();
  return (
    <Scene id="kc-change" n="01" label="The Change" accent="crimson" clip="kc-change" environment={<ChamberEnvironment />}>
      <CursorSpotlight accent="crimson">
        <div className="mx-auto max-w-3xl text-center">
          <Pill accent="crimson">One operator, flipped</Pill>
          <SceneHeadline className="mx-auto mt-6">
            Most dangerous changes compile successfully.
          </SceneHeadline>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-muted"
          >
            V17 to V18 changes a single operator on one rule. It passes every type check, every test, every
            review. And it silently widens who is eligible.
          </motion.p>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            className="mx-auto mt-8 flex justify-center"
          >
            <RoktEcho
              accent="crimson"
              quote="A unified, AI-driven software platform."
              source="Rokt · Sam Dozor, CTO, 2026 · public"
            />
          </motion.div>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.28 }}
            className="mx-auto mt-5 max-w-[52ch] text-sm leading-relaxed text-muted"
          >
            As Rokt unifies Brain v4 and the mParticle data platform into one system, every change crosses more
            seams — and more seams is exactly where a change like this hides. Threshold sits <em>beside</em> the
            Brain, guarding changes to the rules around the decision, never the decision itself.
          </motion.p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
          <RuleSlab version="V17" op="include · is not in" tone="muted" delay={0.1} />
          <motion.span
            aria-hidden
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
            className="mx-auto font-mono text-2xl text-crimson"
          >
            →
          </motion.span>
          <RuleSlab version="V18" op="exclude · is in" tone="crimson" delay={0.25} />
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
          className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-crimson/50 bg-crimson/10 px-5 py-3 text-sm font-semibold text-crimson transition-colors hover:bg-crimson/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
          >
            Approve it blindly <span aria-hidden>→</span>
          </Link>
          <a
            href="#kc-customers"
            className="press inline-flex min-h-[48px] items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
          >
            Replay it first <span aria-hidden>↓</span>
          </a>
        </motion.div>
      </CursorSpotlight>
    </Scene>
  );
}
