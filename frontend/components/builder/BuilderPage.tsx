"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTheme } from "@/app/providers";

/* ────────────────────────────────────────────────────────────────────────────
   /builder — "How I'd Own the Rokt Builder Role".
   First-person, confident-but-humble narrative. NO live API data — every claim
   ties to something real in the Threshold repo or a clearly-labeled hypothesis.
   Same cinematic design system as /vision.
   ──────────────────────────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface-2/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted backdrop-blur">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal" />
      {children}
    </span>
  );
}

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
      className="rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs font-medium text-text transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
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
              THRESHOLD <span className="text-muted">· Builder</span>
            </p>
            <p className="text-xs text-muted">How I&apos;d own the work</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <nav aria-label="Primary" className="flex items-center gap-1">
            <Link
              href="/"
              className="rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              Console
            </Link>
            <Link
              href="/vision"
              className="rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              Vision
            </Link>
            <span
              aria-current="page"
              className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
            >
              Builder
            </span>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  const reduced = useReducedMotion();
  return (
    <section aria-label="Introduction" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-28 hidden h-[30rem] w-[30rem] lg:block"
      >
        <div className="thr-ring h-full w-full rounded-full opacity-70" />
        <div
          className="absolute inset-12 rounded-full opacity-60 blur-2xl animate-float-soft"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, rgba(34,230,200,0.3), transparent 60%), radial-gradient(circle at 70% 70%, rgba(91,140,255,0.22), transparent 60%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow>Junior SWE · Builder · Proof of work over credentials</Eyebrow>
        </motion.div>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.06 }}
          className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-tight sm:text-5xl lg:text-[3.4rem]"
        >
          {"I don't want to be handed a ticket. "}
          <span className="gradient-text">Here&apos;s how I&apos;d own the work.</span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.14 }}
          className="mt-6 max-w-3xl text-base leading-relaxed text-muted sm:text-lg"
        >
          Rokt&apos;s Junior SWE role is a <strong className="text-text">Builder</strong> — someone
          who grows across systems, software, data, and data science, ships to internet-scale, uses
          AI as leverage, and drives incremental revenue. I built Threshold to <em>show</em> that,
          not say it. Below: for each part of the role, what I already did — and how I&apos;d own it
          next.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.22 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <a
            href="#what-ill-do"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-glow-teal transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
          >
            See how I&apos;d own it <span aria-hidden>→</span>
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            Open the working proof
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── The role, as I read it ───────────────────────────────────────────────────
function RoleReading() {
  return (
    <section aria-labelledby="role-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="holo-card overflow-hidden rounded-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
            The role, as I read it
          </p>
          <h2
            id="role-title"
            className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            A Builder grows{" "}
            <span className="gradient-text">across systems, software, data, and data science.</span>
          </h2>
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
      </Reveal>
    </section>
  );
}

// ── What I'll do — the six cards ─────────────────────────────────────────────
type DoCard = {
  n: string;
  title: string;
  intent: string;
  proof: string;
  ownNext: string;
};

const DO_CARDS: DoCard[] = [
  {
    n: "1",
    title: "Design & build innovative products",
    intent: "Start from the customer and a verified seam, then ship the whole thing.",
    proof:
      "I found an adjacent, evidence-backed opportunity — a one-operator policy edit that silently widens a missing-attribute audience, grounded in Rokt's own audience docs — and built it end-to-end: deterministic engine, API, cinematic console, tests, docs, and a self-driving demo.",
    ownNext:
      "Ship next-gen Transaction-Moment features the same way: start from the customer and a verified seam, prototype one golden path, prove failure and recovery, then measure.",
  },
  {
    n: "2",
    title: "Accelerate development with AI",
    intent: "Use AI as real leverage — and know exactly when not to.",
    proof:
      "A multi-agent research + verification pipeline and an agent-built frontend gave me leverage, but I kept AI out of the correctness path and enforced that with an AST-based fitness test. The judgment of when not to reach for AI is the actual skill.",
    ownNext:
      "Bring that AI-as-copilot workflow to the team — faster coding, testing, and deploy — while holding deterministic guarantees wherever money and eligibility live.",
  },
  {
    n: "3",
    title: "Full-stack product ownership",
    intent: "Own the whole lifecycle, including the unglamorous parts.",
    proof:
      "I owned it solo, cradle-to-grave: ideation → research → prototype → implementation → 33 tests → docs → demo. Backend (FastAPI, deterministic engine, idempotency, tamper-evident audit), frontend (Next.js, cinematic console, real-API-only), and the story that ties them together.",
    ownNext:
      "Own features cradle-to-grave at Rokt — including migrations, observability, and rollback — not just the happy path.",
  },
  {
    n: "4",
    title: "Collaborate & innovate",
    intent: "Build for a conversation, not for a verdict.",
    proof:
      "The whole thing is built to be challenged: an honest LIMITATIONS.md, an interview Q&A, and a humble outreach note that literally says “tear it apart.” I framed it as a hypothesis, never a claim about Rokt's roadmap.",
    ownNext:
      "Partner with PM, design, and engineering; seek feedback early; make the trade-offs legible so the team decides with me, not around me.",
  },
  {
    n: "5",
    title: "Optimize & scale",
    intent: "Scale to billions without breaking the invariants.",
    proof:
      "The pure engine parallelizes trivially, and I documented the exact path from a synchronous MVP to 10B+ transactions — async workers → transactional outbox → batched evaluation → Kafka ingestion → read replicas — with the invariants that survive the jump.",
    ownNext:
      "Find bottlenecks with data, hold p99, add drift monitoring — scale the platform to billions of transactions without breaking the invariants that make it defensible.",
  },
  {
    n: "6",
    title: "Drive revenue growth",
    intent: "Protect the revenue engines before a change ships.",
    proof:
      "The thesis is revenue: as decisioning accelerates toward real-time relevance, the blast radius of a silent policy error grows — a deterministic pre-flight protects incrementality and loyalty economics, Rokt's own growth engines, before a change reaches a customer.",
    ownNext:
      "Build features that safely raise incremental revenue — and prove the lift with a holdout, never a claim.",
  },
];

function WhatIllDo() {
  return (
    <section
      id="what-ill-do"
      aria-labelledby="do-title"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
          What I&apos;ll do
        </p>
        <h2
          id="do-title"
          className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Six dimensions — <span className="gradient-text">proof, then ownership.</span>
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          For each part of the role: the intent, the proof already in Threshold, and how I&apos;d
          own it next at Rokt.
        </p>
      </Reveal>

      <ol className="relative mt-12 space-y-6 border-l border-border/70 pl-6 sm:pl-8">
        {DO_CARDS.map((c, i) => (
          <li key={c.n} className="relative">
            <span
              aria-hidden
              className="absolute -left-[calc(1.5rem+1px)] top-1.5 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-teal/60 bg-base font-mono text-sm font-semibold text-teal sm:-left-[calc(2rem+1px)]"
            >
              {c.n}
            </span>
            <Reveal delay={i * 0.03}>
              <div className="holo-card rounded-2xl p-5 sm:p-6">
                <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-1.5 text-sm italic leading-relaxed text-muted">{c.intent}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-teal/30 bg-teal/[0.05] p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wide text-teal">
                      Proof in Threshold
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-text">{c.proof}</p>
                  </div>
                  <div className="rounded-xl border border-offer-blue/30 bg-offer-blue/[0.05] p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wide text-offer-blue">
                      How I&apos;d own it next
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-text">{c.ownNext}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Who I am — five one-line proofs ──────────────────────────────────────────
const WHO: { label: string; proof: string }[] = [
  {
    label: "AI-enthusiast & quick learner",
    proof:
      "Learned Rokt's public platform deeply and built in the domain, using cutting-edge agentic workflows.",
  },
  {
    label: "Problem solver, first principles",
    proof:
      "Isolated the missing-attribute trap with a counterfactual — revert just the operator, watch the offer disappear — not a heuristic.",
  },
  {
    label: "Entrepreneurial ownership in ambiguity",
    proof: "No one asked me to build this. I found the seam and shipped it end-to-end.",
  },
  {
    label: "Collaborative by design",
    proof:
      "Honest limits, interview prep, and a “correct me” framing — made to be torn apart and improved.",
  },
  {
    label: "Driven & results-oriented",
    proof:
      "33 tests, deterministic verdicts, a tamper-evident audit, and an explicit list of what I didn't build.",
  },
];

function WhoIAm() {
  return (
    <section aria-labelledby="who-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">Who I am</p>
        <h2
          id="who-title"
          className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Five traits — <span className="gradient-text">one proof each.</span>
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {WHO.map((w, i) => (
          <Reveal key={w.label} delay={i * 0.04}>
            <div className="holo-card h-full rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <span aria-hidden className="text-teal">
                  ◆
                </span>
                <h3 className="text-sm font-semibold text-text">{w.label}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{w.proof}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── More opportunities I see — labeled hypotheses ────────────────────────────
const OPPS: { title: string; body: string; approach: string }[] = [
  {
    title: "Loyalty-safe changes (Shopper Rewards)",
    body:
      "As Rokt expands into loyalty and rewards, the same “silent policy change” risk now touches loyalty economics, not just offer eligibility.",
    approach:
      "Extend the pre-flight to reason about reward-eligibility changes before they ship — the same counterfactual, applied to reward rules.",
  },
  {
    title: "Data-quality guardrails for decisioning",
    body:
      "An AI agent is only as good as its data. Schema drift, missing-signal spikes, and stale identity quietly degrade decisions.",
    approach:
      "Deterministic input-quality checks that gate a change the way Threshold gates policy — pre-flight and explainable, not a dashboard you notice too late.",
  },
  {
    title: "Agentic-commerce safety",
    body:
      "As commerce goes agent-driven, agent-initiated transactions need the same discipline a human-reviewed change gets today.",
    approach:
      "Apply the fail-closed + tamper-evident-evidence pattern to agent actions, with a human kept on the irreversible steps.",
  },
  {
    title: "Developer experience for the SDK upgrade",
    body:
      "Partner integration safety is a product surface. Good tooling turns a risky upgrade into a boring one.",
    approach:
      "The runnable, contract-tested, honest-limitations tooling I built here — aimed at making partner SDK integrations safe by default.",
  },
];

function Opportunities() {
  return (
    <section aria-labelledby="opps-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
          More opportunities I see · senior-engineer lens
        </p>
        <h2
          id="opps-title"
          className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Adjacent bets — <span className="gradient-text">hypotheses, not claims.</span>
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          Drawn from Rokt&apos;s public 2025-26 direction and framed as things I&apos;d want to
          explore — never as gaps Rokt hasn&apos;t already considered. Each is a starting
          hypothesis I&apos;d validate with a Rokt engineer before building.
        </p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {OPPS.map((o, i) => (
          <Reveal key={o.title} delay={i * 0.04}>
            <div className="holo-card h-full rounded-2xl p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber">
                <span aria-hidden>◇</span> Hypothesis
              </span>
              <h3 className="mt-3 text-base font-semibold text-text">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{o.body}</p>
              <p className="mt-3 border-l-2 border-teal/50 pl-3 text-sm leading-relaxed text-text">
                <span className="font-semibold text-teal">How I&apos;d approach it: </span>
                {o.approach}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
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
        <h2
          id="own-title"
          className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          How I own a problem, <span className="gradient-text">end-to-end.</span>
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          The exact loop I ran for Threshold — and would run again.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LOOP.map((l, i) => (
          <Reveal key={l.n} delay={i * 0.03}>
            <div className="glass h-full rounded-2xl p-5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="thr-edge flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2/70 font-mono text-xs font-semibold text-teal"
                >
                  {l.n}
                </span>
                <h3 className="text-sm font-semibold text-text">{l.step}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{l.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.05}>
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            The same discipline, per layer
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Closing ask ──────────────────────────────────────────────────────────────
function ClosingAsk() {
  return (
    <section aria-label="The ask" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="thr-edge relative overflow-hidden rounded-3xl bg-surface/60 p-10 text-center backdrop-blur sm:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">The ask</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Ten minutes. <span className="gradient-text">Tear it apart.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            Ten minutes with a Rokt engineer. Tell me what I got right and — more usefully — what I
            got wrong. I want to be a long-term Builder, not collect a company name.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
            >
              <span aria-hidden>▶</span> Open the working console
            </Link>
            <Link
              href="/vision"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              Read the vision keynote
            </Link>
          </div>
        </div>
      </Reveal>
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
          <Hero />
          <RoleReading />
          <WhatIllDo />
          <WhoIAm />
          <Opportunities />
          <OwnEndToEnd />
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
