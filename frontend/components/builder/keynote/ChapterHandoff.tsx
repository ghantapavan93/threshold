"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Magnetic } from "@/components/moment-forge/garnish";
import { Pill, Scene, SceneHeadline, EASE } from "./stage";

/* 08 · The Hand-off — the honest bridge. The cinematic story hands control to
   the real application: working FastAPI + SQLAlchemy services, persisted state,
   tests, and traces. Says plainly what is dramatized and what is real. */

const ACTIONS: { href: string; label: string; sub: string }[] = [
  { href: "/", label: "Operate Threshold", sub: "the live console — replay, inject, verdict" },
  { href: "/moment-forge", label: "Inspect Moment Forge", sub: "the domain model, run against the real engine" },
  { href: "/moment-forge/system", label: "Open engineering evidence", sub: "the system architecture volume" },
  { href: "/builder", label: "Read the role case", sub: "how I'd own the Builder role, in prose" },
];

export function ChapterHandoff() {
  const reduced = useReducedMotion();
  return (
    <Scene id="kc-handoff" n="08" label="The Hand-off" accent="teal" clip="kc-handoff" environment={<div className="absolute inset-0 bg-[#05080e]" />}>
      <div className="mx-auto max-w-3xl text-center">
        <Pill accent="teal">Story above · engine below</Pill>
        <SceneHeadline className="mx-auto mt-6">
          The story above is cinematic. The engine underneath it is real.
        </SceneHeadline>
        <p className="mx-auto mt-6 max-w-[54ch] text-lg leading-relaxed text-muted">
          Every replay, failure, duplicate, cancellation, and verdict in this film connects to working services,
          persisted state, 187 passing tests, and a tamper-evident audit trail. Don&apos;t take the film&apos;s
          word for it — operate the real thing.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
        {ACTIONS.map((a, i) => (
          <motion.div
            key={a.href}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
          >
            <Magnetic strength={8}>
              <Link
                href={a.href}
                className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-border/70 bg-surface/40 p-5 transition-colors hover:border-teal/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                <span>
                  <span className="block text-sm font-semibold text-text">{a.label}</span>
                  <span className="mt-1 block text-[12px] leading-snug text-muted">{a.sub}</span>
                </span>
                <span aria-hidden className="text-teal transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </Magnetic>
          </motion.div>
        ))}
      </div>
    </Scene>
  );
}
