"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "@/app/providers";
import { FilmGrain } from "@/components/moment-forge/garnish";
import { ChapterRail } from "./stage";
import { ChapterMoment } from "./ChapterMoment";
import { ChapterChange } from "./ChapterChange";
import { ChapterCustomers } from "./ChapterCustomers";
import { ChapterFailure } from "./ChapterFailure";
import { ChapterMachine } from "./ChapterMachine";
import { ChapterEvidence } from "./ChapterEvidence";
import { ChapterExperiment } from "./ChapterExperiment";
import { ChapterFrontier } from "./ChapterFrontier";
import { ChapterHandoff } from "./ChapterHandoff";
import { ChapterAfterglow } from "./ChapterAfterglow";

/* /builder/keynote — the Builder role as a cinematic product film.
   One transaction, told as chapters, with the REAL Threshold engine living
   inside each scene. Built proof-first: chapters 00–02 here; 03–09 follow.
   Every environment is code-drawn today and accepts a generated ambient clip
   later via /media (see public/media/README.md). */

function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs font-medium text-text transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
    >
      {mounted ? (resolved === "dark" ? "☾ Dark" : "☀ Light") : "◐ Theme"}
    </button>
  );
}

function KeynoteNav() {
  const link =
    "inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0";
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-base/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="thr-edge flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 font-mono text-teal">▚</div>
          <p className="text-sm font-semibold tracking-tight">
            THRESHOLD <span className="text-muted">· Builder Keynote</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/" className={link}>Console</Link>
          <Link href="/builder/case" className={link}>Role case</Link>
          <Link href="/plan" className={link}>The Role in Motion</Link>
          <Link href="/moment-forge" className={link}>Moment Forge</Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left"
    >
      <div className="h-full w-full" style={{ background: "linear-gradient(to right, var(--c-teal), var(--c-offer-blue), var(--c-amber))" }} />
    </motion.div>
  );
}

export function KeynotePage() {
  return (
    <div className="relative min-h-screen bg-base text-text">
      <FilmGrain id="keynote" />
      <ScrollProgress />
      <KeynoteNav />
      <ChapterRail />
      <main id="main" className="pt-14">
        <ChapterMoment />
        <ChapterChange />
        <ChapterCustomers />
        <ChapterFailure />
        <ChapterMachine />
        <ChapterEvidence />
        <ChapterExperiment />
        <ChapterFrontier />
        <ChapterHandoff />
        <ChapterAfterglow />
      </main>
      <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
        THRESHOLD · Builder Keynote — a cinematic product film. The environments are composed; the engine,
        the replays, and every number inside them are real. Nothing fabricated.
      </footer>
    </div>
  );
}
