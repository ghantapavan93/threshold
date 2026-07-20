"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";
import { FilmGrain } from "@/components/moment-forge/garnish";
import { ChapterRail } from "./stage";
import { ChapterMoment } from "./ChapterMoment";
import { ChapterChange } from "./ChapterChange";
import { ChapterCustomers } from "./ChapterCustomers";

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
          <Link href="/builder" className={link}>Builder</Link>
          <Link href="/moment-forge" className={link}>Moment Forge</Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/* A temporary end-cap while chapters 03–09 are in production — honest about
   what is built and pointing into the real app (the "hand-off" in miniature). */
function KeynoteEndCap() {
  return (
    <section className="relative border-t border-border/40 bg-base/80 px-5 py-24 text-center sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-teal">The story continues</p>
      <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(24px,4vw,40px)] font-semibold tracking-tightest text-text" style={{ fontFamily: "var(--font-display)" }}>
        Chapters 03–09 are in production. The engine underneath is already real.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
        The Failure, the Machine, the Evidence, the Experiment, the Frontier, the Hand-off, the Afterglow —
        each will wrap a live Threshold surface in its own cinematic scene. Until then, operate the real thing.
      </p>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
        Built beside Brain v4, not inside it — a deterministic gate for the 10B+ transactions Rokt runs in 2026,
        where a wrong change reaches a real customer only after it is proven safe.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="press inline-flex min-h-[48px] items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
        >
          <span aria-hidden>▶</span> Operate Threshold
        </Link>
        <Link
          href="/moment-forge"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          Inspect Moment Forge
        </Link>
      </div>
    </section>
  );
}

export function KeynotePage() {
  return (
    <div className="relative min-h-screen bg-base text-text">
      <FilmGrain id="keynote" />
      <KeynoteNav />
      <ChapterRail />
      <main id="main" className="pt-14">
        <ChapterMoment />
        <ChapterChange />
        <ChapterCustomers />
        <KeynoteEndCap />
      </main>
      <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
        THRESHOLD · Builder Keynote — a cinematic product film. The environments are composed; the engine,
        the replays, and every number inside them are real. Nothing fabricated.
      </footer>
    </div>
  );
}
