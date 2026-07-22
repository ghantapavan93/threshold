"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Magnetic } from "@/components/visual/Magnetic";
import { useTheme } from "@/app/providers";
import {
  ClipReveal,
  MaskText,
  Reveal,
  StaggerGroup,
} from "@/components/builder/anim";
import { BuilderHero } from "@/components/builder/BuilderHero";
import { Scenes } from "@/components/builder/Scenes";
import { Seams } from "@/components/builder/Seams";
import { MomentForgeTeaser } from "@/components/builder/MomentForgeTeaser";

/* ────────────────────────────────────────────────────────────────────────────
   /builder — "How I'd Own the Rokt Builder Role".
   First-person, confident-but-humble narrative. NO live API data — every claim
   ties to something real in the Threshold repo or a clearly-labeled hypothesis.

   WAVE 2: elevated into an Awwwards-grade, scroll-driven cinematic page with
   GSAP ScrollTrigger — pinned hero, masked text reveals, clip-path card wipes, a
   scrubbed "drawn spine" timeline, and staggered scene reveals. EVERY animation
   is gated on prefers-reduced-motion (see components/builder/anim.tsx).
   ──────────────────────────────────────────────────────────────────────────── */

// ── Top nav (Console · Vision · Builder) ────────────────────────────────────
function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
      title="Toggle theme"
      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs font-medium text-text transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
    >
      {mounted ? (resolved === "dark" ? "☾ Dark" : "☀ Light") : "◐ Theme"}
    </button>
  );
}

function BuilderNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="thr-edge flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 font-mono text-teal">
            ▚
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight sm:text-base">
              THRESHOLD <span className="text-muted">· Builder · Role case</span>
            </p>
            <p className="text-xs text-muted">The prose behind the keynote</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <nav aria-label="Primary" className="flex flex-wrap items-center justify-end gap-1">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
            >
              Console
            </Link>
            <Link
              href="/builder"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
            >
              Keynote
            </Link>
            <span
              aria-current="page"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal sm:min-h-0"
            >
              Role case
            </span>
            <Link
              href="/plan"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
            >
              The Role in Motion
            </Link>
            <Link
              href="/moment-forge"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
            >
              Moment Forge
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// ── The role, as I read it ───────────────────────────────────────────────────
function RoleReading() {
  return (
    <section aria-labelledby="role-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <ClipReveal>
        <div className="holo-card overflow-hidden rounded-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
            The role, as I read it
          </p>
          <MaskText
            as="h2"
            id="role-title"
            className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl"
            segments={[
              { text: "A Builder grows " },
              {
                text: "across systems, software, data, and data science.",
                className: "gradient-text",
              },
            ]}
          />
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Rokt frames its engineers as Builders — hands-on across a diversity of services, from
            internal tools through to internet-scale production systems, shipping features that
            directly drive the growth of the business. Hiring is moving to{" "}
            <strong className="text-text">proof of work over credentials</strong>: a documented,
            end-to-end project beats a list of bullet points. So I built one. Everything below maps a
            part of that role to something real in the Threshold repo — and to how I&apos;d carry it
            forward.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
            {["systems", "software", "data", "data-science", "internet-scale", "revenue"].map(
              (c) => (
                <span
                  key={c}
                  className="thr-edge rounded-md bg-surface-2/60 px-2.5 py-1 text-text"
                >
                  {c}
                </span>
              ),
            )}
          </div>
        </div>
      </ClipReveal>
    </section>
  );
}

// ── Who I am — five one-line proofs ──────────────────────────────────────────
const WHO: { label: string; proof: string }[] = [
  {
    label: "AI-enthusiast & quick learner",
    proof:
      "Learned Rokt's public platform deeply and built in the domain in days, with cutting-edge agentic workflows. I read arXiv weekly.",
  },
  {
    label: "Problem solver, first principles",
    proof:
      "Isolated the missing-attribute trap with a counterfactual — revert just the operator, watch the offer disappear — not a heuristic.",
  },
  {
    label: "Entrepreneurial ownership",
    proof: "No one asked me to build Threshold. I found the seam and shipped it end-to-end.",
  },
  {
    label: "Collaborative by design",
    proof:
      "Honest limits, interview prep, and a “correct me” framing — designed to be improved by a team.",
  },
  {
    label: "Driven & results-oriented",
    proof:
      "38 tests, deterministic verdicts, a tamper-evident audit, and an explicit list of what I didn't build.",
  },
];

function WhoIAm() {
  return (
    <section aria-labelledby="who-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">Who I am</p>
      </Reveal>
      <MaskText
        as="h2"
        id="who-title"
        className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        segments={[
          { text: "Five traits — " },
          { text: "one proof each.", className: "gradient-text" },
        ]}
      />
      <StaggerGroup className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {WHO.map((w) => (
          <div key={w.label} className="holo-card h-full rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-teal">
                ◆
              </span>
              <h3 className="text-sm font-semibold text-text">{w.label}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{w.proof}</p>
          </div>
        ))}
      </StaggerGroup>
    </section>
  );
}

// ── How I own a problem end-to-end ───────────────────────────────────────────
const LOOP: { n: string; step: string; detail: string }[] = [
  {
    n: "1",
    step: "Start with the customer + a verified seam",
    detail: "Read the primary docs; find real, evidenced friction — not an invented gap.",
  },
  {
    n: "2",
    step: "Prototype one golden path",
    detail: "The smallest end-to-end story that proves the idea is worth more.",
  },
  {
    n: "3",
    step: "Prove failure and recovery",
    detail: "Inject the failure; show it fails closed; keep the evidence.",
  },
  {
    n: "4",
    step: "Measure",
    detail: "A deterministic verdict or a real metric — never a vibe.",
  },
  {
    n: "5",
    step: "Be honest about limits",
    detail: "What's real vs. modeled, and what I'd change with internal data.",
  },
  {
    n: "6",
    step: "Iterate with feedback",
    detail: "Built to be challenged, then made better.",
  },
];

const LAYERS: { layer: string; body: string; accent: string }[] = [
  {
    layer: "Backend",
    body: "Deterministic core, idempotency at money boundaries, tamper-evident audit, invariants enforced by tests.",
    accent: "var(--c-teal)",
  },
  {
    layer: "Frontend",
    body: "Real-API-only, deliberately designed states, accessibility, and one clear story.",
    accent: "var(--c-offer-blue)",
  },
  {
    layer: "AI",
    body: "Leverage at the edges, deterministic in the core, enforced by a fitness test.",
    accent: "var(--c-amber)",
  },
  {
    layer: "Data",
    body: "Event-time snapshots, no future leakage, consent-aware by design.",
    accent: "var(--c-crimson)",
  },
];

function OwnEndToEnd() {
  return (
    <section aria-labelledby="own-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">My method</p>
      </Reveal>
      <MaskText
        as="h2"
        id="own-title"
        className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        segments={[{ text: "How I own a problem, " }, { text: "end-to-end.", className: "gradient-text" }]}
      />
      <Reveal delay={0.05}>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          The exact loop I ran for Threshold — and would run again.
        </p>
      </Reveal>

      {/* The 6-step loop animates step-by-step. Ordered list for a11y. */}
      <StaggerGroup
        as="ol"
        className="mt-10 grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.1}
      >
        {LOOP.map((l) => (
          <li key={l.n} className="glass h-full rounded-2xl p-5">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="thr-edge flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2/70 font-mono text-xs font-semibold text-teal"
              >
                {l.n}
              </span>
              <h3 className="text-sm font-semibold text-text">
                <span className="sr-only">Step {l.n}: </span>
                {l.step}
              </h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{l.detail}</p>
          </li>
        ))}
      </StaggerGroup>

      <div className="mt-8">
        <Reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            The same discipline, per layer
          </p>
        </Reveal>
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LAYERS.map((l) => (
            <div key={l.layer} className="holo-card h-full rounded-2xl p-5">
              <span
                className="inline-flex rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold"
                style={{
                  color: l.accent,
                  backgroundColor: `color-mix(in srgb, ${l.accent} 14%, transparent)`,
                }}
              >
                {l.layer}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-muted">{l.body}</p>
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

// ── Closing ask ──────────────────────────────────────────────────────────────
function ClosingAsk() {
  return (
    <section aria-label="The ask" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <ClipReveal scale={0.94} y={36}>
        <div className="thr-edge glow-teal-pulse relative overflow-hidden rounded-3xl bg-surface/60 p-10 text-center backdrop-blur sm:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">The ask</p>
          <MaskText
            as="h2"
            className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
            segments={[{ text: "Ten minutes. " }, { text: "Tear it apart.", className: "gradient-text" }]}
          />
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            Ten minutes with a Rokt engineer. Tell me what I got right and — more usefully — what I
            got wrong. I want to be a long-term Builder, not collect a company name.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Magnetic strength={0.35}>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal press focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
              >
                <span aria-hidden>▶</span> Open the working console
              </Link>
            </Magnetic>
            <Link
              href="/vision"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              Read the vision keynote
            </Link>
          </div>
        </div>
      </ClipReveal>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function BuilderPage() {
  return (
    <div className="relative min-h-screen text-text">
      <div className="aurora-threshold" aria-hidden />
      <div className="relative z-10">
        <BuilderNav />
        <main id="main">
          <BuilderHero />
          <RoleReading />
          <Scenes />
          <WhoIAm />
          <Seams />
          <OwnEndToEnd />
          <MomentForgeTeaser />
          <ClosingAsk />
        </main>
        <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
          THRESHOLD · Builder — a first-person case for ownership. Every claim ties to something real
          in the repo or a clearly-labeled hypothesis.
        </footer>
      </div>
    </div>
  );
}
