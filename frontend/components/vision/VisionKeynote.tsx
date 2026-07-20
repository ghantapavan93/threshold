"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useTheme } from "@/app/providers";
import { Reveal } from "@/components/visual/Reveal";
import { Parallax } from "@/components/visual/Parallax";
import { SceneMedia } from "@/components/visual/SceneMedia";
import {
  TransactionMomentMotif,
  SilentWideningDiagram,
  FailClosedLaneMotif,
  IntegrityShield,
} from "@/components/visual/illustrations";
import {
  MaskedLines,
  IllustrationReveal,
  useGsapScene,
  MOTION_OK,
} from "@/components/vision/motion";

/* ────────────────────────────────────────────────────────────────────────────
   /vision — Threshold cinematic keynote (GSAP + ScrollTrigger).
   Narrative/keynote content sourced from docs/FUTURE_VISION.md. The scale
   figures and Rokt direction are Rokt's verified public statements (rokt.com),
   presented as context — this page renders no application/API data.

   Motion model:
     • GSAP ScrollTrigger scenes: a PINNED hero with scrubbed parallax depth,
       masked line-by-line heading reveals, clip-path wipes on illustrations,
       a SCRUBBED roadmap spine that draws as you scroll (milestones pop in
       sequence), and an integration diagram that ASSEMBLES piece by piece.
     • Every animation lives behind (prefers-reduced-motion: no-preference) via
       gsap.matchMedia — under "reduce" nothing runs and the DOM stays in its
       final, fully-visible, fully-readable state.
     • Pinning/parallax intensity is desktop-gated; mobile degrades to simple
       reveals. All ScrollTriggers are reverted on unmount (mm.revert()).
   ──────────────────────────────────────────────────────────────────────────── */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface-2/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted backdrop-blur">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal" />
      {children}
    </span>
  );
}

// ── Top nav (Console ⇄ Vision + theme toggle) ──────────────────────────────
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

function VisionNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="thr-edge flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 font-mono text-teal">
            ▚
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight sm:text-base">
              THRESHOLD <span className="text-muted">· Vision</span>
            </p>
            <p className="text-xs text-muted">The mechanism, scaled</p>
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
            <span
              aria-current="page"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal sm:min-h-0"
            >
              Vision
            </span>
            <Link
              href="/builder"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
            >
              Builder
            </Link>
            <Link
              href="/plan"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
            >
              Audit &amp; Plan
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

// ── Hero — pinned scene with entrance + scrubbed parallax depth ───────────────
const HERO_STATS = [
  { figure: "33,000+", label: "clients" },
  { figure: "10B+", label: "transactions / year" },
  { figure: "17", label: "countries" },
  { figure: "90%+", label: "ancillary revenue in the Transaction Moment" },
];

function Hero() {
  const ref = useGsapScene<HTMLElement>((root, mm) => {
    const q = gsap.utils.selector(root);

    // Entrance — masked headline lines + fades. Any width, motion permitting.
    mm.add(MOTION_OK, () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(q("[data-hero-line]"), { yPercent: 120, duration: 1, stagger: 0.12 })
        .from(
          q("[data-hero-fade]"),
          { autoAlpha: 0, y: 22, duration: 0.8, stagger: 0.1 },
          "-=0.55",
        )
        .from(
          q("[data-hero-stat]"),
          { autoAlpha: 0, y: 18, scale: 0.97, duration: 0.6, stagger: 0.07 },
          "-=0.4",
        )
        .from(q("[data-hero-motif]"), { autoAlpha: 0, duration: 1.1 }, "-=1.1");
    });

    // Pin + scrubbed parallax — DESKTOP ONLY. Only decorative/foreground layers
    // move (readability of the copy is never reduced); mobile skips this entirely.
    mm.add(`(min-width: 768px) and ${MOTION_OK}`, () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=55%",
            pin: true,
            scrub: true,
          },
        })
        .to(q("[data-hero-motif]"), { yPercent: 14, scale: 1.06, ease: "none" }, 0)
        .to(q("[data-hero-glow]"), { yPercent: 28, ease: "none" }, 0)
        .to(q("[data-hero-stat-row]"), { yPercent: -12, ease: "none" }, 0);
    });
  });

  return (
    <section ref={ref} aria-label="Vision overview" className="relative overflow-hidden">
      {/* Ambient loop (clip A, "The Transaction Moment") — dimmed + scrimmed;
          renders nothing until /public/media/ambient-moment.webm exists. */}
      <SceneMedia
        variant="backdrop"
        src="/media/ambient-moment.webm"
        poster="/media/ambient-moment.jpg"
        label=""
      />
      {/* decorative depth layers (desktop) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-10 hidden w-[30rem] lg:block"
      >
        <div data-hero-glow className="relative">
          <div className="thr-ring mx-auto h-[26rem] w-[26rem] rounded-full opacity-60" />
          <div
            className="absolute inset-16 rounded-full opacity-60 blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, rgba(34,230,200,0.3), transparent 60%), radial-gradient(circle at 70% 70%, rgba(91,140,255,0.22), transparent 60%)",
            }}
          />
        </div>
        <div data-hero-motif className="absolute inset-x-0 top-24 px-8">
          <TransactionMomentMotif className="w-full" />
        </div>
      </div>

      <div className="relative z-[1] mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div data-hero-fade>
          <Eyebrow>Keynote · Future Vision · Grounded in Rokt&apos;s public direction</Eyebrow>
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-tight sm:text-5xl lg:text-[3.6rem]">
          <span className="block overflow-hidden">
            <span data-hero-line className="block will-change-transform">
              Turn <span className="gradient-text">&ldquo;we reviewed it&rdquo;</span> into
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-hero-line className="block will-change-transform">
              <span className="gradient-text">&ldquo;we proved it.&rdquo;</span>
            </span>
          </span>
        </h1>

        <p
          data-hero-fade
          className="mt-6 max-w-3xl text-base leading-relaxed text-muted sm:text-lg"
        >
          A checkout-policy change is one edit away from silently charging the wrong customers the
          wrong thing. Threshold replays that change before it ships, proves it can&apos;t harm
          checkout or quietly widen who gets an offer, and only lets it through to a controlled
          test. As Rokt grows, the same gate runs on real traffic, at scale, in the deploy pipeline.
        </p>

        <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-glow-teal press focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
          >
            Enter the working console <span aria-hidden>→</span>
          </Link>
          <a
            href="#roadmap"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            Read the roadmap
          </a>
        </div>

        <div
          data-hero-stat-row
          className="mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {HERO_STATS.map((s) => (
            <div key={s.label} data-hero-stat className="glass rounded-xl px-4 py-3">
              <p className="font-mono text-xl font-semibold sm:text-2xl">{s.figure}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── The one connected story ──────────────────────────────────────────────────
function ConnectedStory() {
  return (
    <section aria-labelledby="story-title" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Reveal>
        <p
          id="story-title"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-teal"
        >
          The one connected story · 8 seconds
        </p>
      </Reveal>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <Reveal delay={0.05}>
          <blockquote className="border-l-2 border-teal/60 pl-5 text-2xl font-medium leading-snug tracking-tight sm:text-[2rem]">
            A change ships. Threshold replays it first, proves it{" "}
            <span className="text-teal">fails closed</span> and never{" "}
            <span className="text-crimson">silently widens</span> eligibility, and clears it only
            for a controlled holdout. As decisioning gets faster, the same gate turns review into
            proof.
          </blockquote>
        </Reveal>
        <IllustrationReveal from="left" className="glass rounded-2xl p-5">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Silent widening — a band flips eligible, invisibly
          </p>
          <SilentWideningDiagram className="w-full" />
        </IllustrationReveal>
      </div>
    </section>
  );
}

// ── Where Rokt is heading (verified) ─────────────────────────────────────────
const DIRECTION: { title: string; body: string }[] = [
  {
    title: "AI Brain + scaled global Network",
    body: "Rokt's public thesis: an AI-powered Brain and scaled Network deliver real-time relevance in the Transaction Moment — the moment that drives over 90% of ancillary revenue potential.",
  },
  {
    title: "Real-time relevance, instant activation",
    body: "mParticle enables real-time relevance and instant activation of data. As data flows faster, decisions are made faster — and errors propagate faster too.",
  },
  {
    title: "Incrementality, loyalty, personalization",
    body: "Incrementality is the measurement bar; loyalty and AI-driven personalization are framed as emerging growth engines. Every one of those is a policy surface a silent change can distort.",
  },
];

function Direction() {
  return (
    <section aria-labelledby="direction-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
          Where Rokt is heading · verified, rokt.com
        </p>
      </Reveal>
      <MaskedLines
        as="h2"
        id="direction-title"
        className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        lines={[
          "The platform is accelerating toward",
          <span key="l2" className="gradient-text">
            real-time relevance.
          </span>,
        ]}
      />
      <Reveal delay={0.05}>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          The implication for Threshold is the whole thesis: as decisioning gets faster and more
          data-driven, the <strong className="text-text">blast radius of a bad policy change
          grows</strong>. A silent missing-attribute widening at 10B+ transactions is expensive and
          hard to see — so a deterministic pre-flight gets <em>more</em> valuable, not less, as the
          platform speeds up.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {DIRECTION.map((d, i) => (
          <Reveal key={d.title} delay={i * 0.06}>
            <div className="holo-card h-full rounded-2xl p-5">
              <h3 className="text-base font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── The deterministic core stays boring ──────────────────────────────────────
function CoreInvariant() {
  return (
    <section aria-labelledby="core-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="holo-card overflow-hidden rounded-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
            The invariant
          </p>
          <MaskedLines
            as="h2"
            id="core-title"
            className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl"
            lines={["The deterministic core stays boring", "— on purpose."]}
          />
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="max-w-3xl text-base leading-relaxed text-muted">
                Every future milestone plugs into the <strong className="text-text">same pure
                engine</strong>. It never learns, never calls an LLM, never gains a serving-path
                dependency. That is the invariant that keeps the whole thing auditable and
                defensible. New capabilities attach at the <span className="text-teal">edges</span>.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
                {["evaluator", "constraints", "diff", "failclosed", "verdict", "audit"].map((c) => (
                  <span
                    key={c}
                    className="thr-edge rounded-md bg-surface-2/60 px-2.5 py-1 text-text"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <IllustrationReveal from="bottom" className="rounded-2xl">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                Fail closed — offer lane drops, checkout stays green
              </p>
              <FailClosedLaneMotif className="w-full" />
            </IllustrationReveal>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Roadmap — scrubbed spine that draws; milestones pop in sequence ───────────
type Milestone = {
  id: string;
  horizon: string;
  title: string;
  body: string;
  plug: string;
  accent: string;
};

const MILESTONES: Milestone[] = [
  {
    id: "A",
    horizon: "weeks",
    title: "Real-data replay",
    body: "Swap the seeded generator for anonymized, event-time production logs — the exact feature snapshot the decision saw — so replay reflects the real session population, not synthetic shape. Import the real One Platform policy/audience schema and auto-derive the diff.",
    plug: "Plugs in at sessions.py (log adapter) + policy.py (schema loader). Engine unchanged.",
    accent: "var(--c-teal)",
  },
  {
    id: "B",
    horizon: "months",
    title: "Scale-out to 10B+ transactions",
    body: "Replace synchronous replay with enqueue → async worker → transactional outbox → batched evaluation → single verdict commit, reading sessions from a read replica. Streaming ingestion of event-time snapshots via Kafka/Redpanda; a horizontal worker pool. The pure evaluator parallelizes trivially — no shared state.",
    plug: "Invariants preserved: idempotent job, atomic verdict, no partial results, no future-information leakage.",
    accent: "var(--c-offer-blue)",
  },
  {
    id: "C",
    horizon: "months",
    title: "Pre-flight as a deployment gate",
    body: "Wire Threshold into the change-management pipeline (Save and Edit → approval queue): a proposed change must pass the gate before it enters the manual approval queue — cutting reviewer load and holdout waste. Optional edge validation of the fail-closed contract, plus a latency-budget check on live traffic.",
    plug: "Plugs in at a CI/CD hook + the approval-queue integration. Engine unchanged.",
    accent: "var(--c-teal)",
  },
  {
    id: "D",
    horizon: "deferred · honest",
    title: "Intelligence at the periphery",
    body: "An OPE pre-screen (IPS/SNIPS/DR) estimates a change's value from logged propensities and can return INSUFFICIENT_EVIDENCE or refuse on thin support — and can never replace the mandatory holdout (ADR-005). Drift monitoring on the input distribution. LLM used only for plain-language change summaries in the audit/changelog, off the critical path (ADR-002).",
    plug: "Plugs in as optional modules behind the verdict. The deterministic verdict remains authoritative.",
    accent: "var(--c-amber)",
  },
  {
    id: "E",
    horizon: "vision",
    title: "Platform fit & growth-engine tie",
    body: "Consent-aware historical replay proves a replayed decision excludes signals no longer legally usable (revoked consent / deletion) — a compliance proof grounded in mParticle's consent state. Integrate with Integration Monitor so a change that would push events into unprocessedRecords is flagged pre-release. Tie to Rokt's growth engines: a change that widens a loyalty-recognized or incrementality-measured audience gets the same scrutiny before it can affect those metrics.",
    plug: "Consent-aware replay + Integration-Monitor fit at the edges. Core unchanged.",
    accent: "var(--c-offer-blue)",
  },
];

function Roadmap() {
  const ref = useGsapScene<HTMLElement>((root, mm) => {
    const q = gsap.utils.selector(root);
    mm.add(MOTION_OK, () => {
      const list = q("[data-list]")[0];

      // Spine draws top→bottom, scrubbed to scroll through the list.
      gsap.fromTo(
        q("[data-spine]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top center",
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 72%", end: "bottom 78%", scrub: true },
        },
      );

      // Each milestone: node pops, card slides in — as it reaches the spine.
      q("[data-milestone]").forEach((li) => {
        const node = li.querySelector("[data-node]");
        const card = li.querySelector("[data-card]");
        gsap
          .timeline({ scrollTrigger: { trigger: li, start: "top 80%", once: true } })
          .from(node, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "back.out(2)" })
          .from(card, { autoAlpha: 0, x: 28, duration: 0.7, ease: "power3.out" }, "-=0.25");
      });

      // Backstop: the milestones start at autoAlpha:0 and rely on ScrollTrigger
      // to reveal them. If a trigger never fires (registration or refresh
      // hiccup, an anchor jump past the start), the content would stay hidden.
      // An IntersectionObserver force-reveals any card still invisible ~1s after
      // it enters view — long enough that a working GSAP reveal has already run,
      // so this only acts when the animation genuinely failed.
      const timers = new Set<number>();
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const li = e.target;
            io.unobserve(li);
            const t = window.setTimeout(() => {
              timers.delete(t);
              const card = li.querySelector("[data-card]");
              const node = li.querySelector("[data-node]");
              if (card && Number(getComputedStyle(card).opacity) < 0.05) {
                gsap.set([node, card], { autoAlpha: 1, scale: 1, x: 0 });
              }
            }, 1000);
            timers.add(t);
          }
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      q("[data-milestone]").forEach((li) => io.observe(li));

      return () => {
        io.disconnect();
        timers.forEach((t) => window.clearTimeout(t));
      };
    });
  });

  return (
    <section
      id="roadmap"
      ref={ref}
      aria-labelledby="roadmap-title"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
          Roadmap · five milestones
        </p>
      </Reveal>
      <MaskedLines
        as="h2"
        id="roadmap-title"
        className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        lines={[
          "From working prototype to",
          <span key="l2" className="gradient-text">
            a gate on real traffic.
          </span>,
        ]}
      />

      <ol data-list className="relative mt-12 space-y-6 pl-6 sm:pl-8">
        {/* animated spine (replaces the static border rail) */}
        <span
          data-spine
          aria-hidden
          className="absolute inset-y-1 left-0 w-px origin-top"
          style={{
            background:
              "linear-gradient(to bottom, var(--c-teal), var(--c-offer-blue) 55%, transparent)",
          }}
        />
        {MILESTONES.map((m) => (
          <li data-milestone key={m.id} className="relative">
            {/* node on the rail */}
            <span
              data-node
              aria-hidden
              className="absolute -left-[calc(1.5rem+1px)] top-1.5 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border bg-base font-mono text-sm font-semibold sm:-left-[calc(2rem+1px)]"
              style={{ borderColor: m.accent, color: m.accent }}
            >
              {m.id}
            </span>
            <div data-card className="holo-card rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  Milestone {m.id} — {m.title}
                </h3>
                <span
                  className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide"
                  style={{
                    color: m.accent,
                    borderColor: m.accent,
                    backgroundColor: `color-mix(in srgb, ${m.accent} 12%, transparent)`,
                  }}
                >
                  {m.horizon}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{m.body}</p>
              <p className="mt-3 border-l-2 border-border pl-3 font-mono text-xs leading-relaxed text-muted">
                {m.plug}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Integration diagram — assembles piece by piece ────────────────────────────
const EDGES_LEFT = [
  { label: "Real event-time logs", tag: "A" },
  { label: "One Platform schema", tag: "A" },
  { label: "Async worker · outbox · Kafka", tag: "B" },
];
const EDGES_RIGHT = [
  { label: "CI/CD deploy gate · edge latency", tag: "C" },
  { label: "OPE pre-screen · drift · LLM summary", tag: "D" },
  { label: "Consent-aware replay · Integration Monitor", tag: "E" },
];

function IntegrationDiagram() {
  const ref = useGsapScene<HTMLElement>((root, mm) => {
    const q = gsap.utils.selector(root);
    mm.add(MOTION_OK, () => {
      gsap
        .timeline({
          scrollTrigger: { trigger: q("[data-diagram]")[0], start: "top 74%", once: true },
        })
        .from(q("[data-core]"), { scale: 0.82, autoAlpha: 0, duration: 0.6, ease: "power3.out" })
        .from(
          q("[data-core-chip]"),
          { autoAlpha: 0, y: 8, scale: 0.9, duration: 0.35, stagger: 0.05, ease: "power2.out" },
          "-=0.2",
        )
        .from(
          q("[data-bus]"),
          { scaleX: 0, autoAlpha: 0, transformOrigin: "center", duration: 0.5, ease: "power2.out" },
          "-=0.15",
        )
        .from(
          q("[data-edge-left]"),
          { xPercent: -35, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" },
          "-=0.25",
        )
        .from(
          q("[data-edge-right]"),
          { xPercent: 35, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" },
          "<",
        );
    });
  });

  return (
    <section
      ref={ref}
      aria-labelledby="integration-title"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
          Integration points
        </p>
      </Reveal>
      <MaskedLines
        as="h2"
        id="integration-title"
        className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        lines={[
          "The future attaches",
          <span key="l2" className="gradient-text">
            without touching the core.
          </span>,
        ]}
      />

      <div
        data-diagram
        className="mt-10 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]"
      >
        {/* left edges */}
        <div className="flex flex-col justify-center gap-3">
          {EDGES_LEFT.map((e) => (
            <div
              key={e.label}
              data-edge-left
              className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            >
              <span className="text-sm text-text">{e.label}</span>
              <span className="font-mono text-[11px] text-teal">{e.tag}</span>
            </div>
          ))}
        </div>

        {/* core */}
        <div className="flex items-center">
          <div
            data-core
            className="thr-edge relative mx-auto w-full max-w-xs rounded-2xl bg-surface/70 p-6 text-center backdrop-blur"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Deterministic core
            </p>
            <p className="mt-2 text-sm font-semibold text-text">never changes</p>
            <span
              data-bus
              aria-hidden
              className="mx-auto mt-3 block h-px w-3/4 origin-center"
              style={{ background: "var(--thr-iris-soft)" }}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-1.5 font-mono text-[11px]">
              {["evaluator", "constraints", "diff", "failclosed", "verdict", "audit"].map((c) => (
                <span
                  key={c}
                  data-core-chip
                  className="rounded bg-surface-2/70 px-2 py-0.5 text-muted"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* right edges */}
        <div className="flex flex-col justify-center gap-3">
          {EDGES_RIGHT.map((e) => (
            <div
              key={e.label}
              data-edge-right
              className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            >
              <span className="font-mono text-[11px] text-teal">{e.tag}</span>
              <span className="text-right text-sm text-text">{e.label}</span>
            </div>
          ))}
        </div>
      </div>
      <Reveal delay={0.1}>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">
          The engine is the fixed point. Capabilities attach at the edges — the deterministic
          verdict always remains authoritative, and no LLM ever sits in the hot path.
        </p>
      </Reveal>
    </section>
  );
}

// ── Why this compounds Rokt's revenue ────────────────────────────────────────
function Compounds() {
  return (
    <section aria-labelledby="compounds-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="holo-card overflow-hidden rounded-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
            Why this compounds Rokt&apos;s revenue
          </p>
          <MaskedLines
            as="h2"
            id="compounds-title"
            className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl"
            lines={[
              <span key="l1">
                Faster decisioning makes a silent error{" "}
                <span className="text-crimson">more</span> expensive —
              </span>,
              <span key="l2">
                and a pre-flight <span className="text-teal">more</span> valuable.
              </span>,
            ]}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                head: "Blast radius grows",
                body: "As decisioning accelerates toward real-time relevance, a silent policy error reaches more of 10B+ transactions before anyone notices. Speed multiplies the cost of the mistakes review can't see.",
              },
              {
                head: "Incrementality stays honest",
                body: "A change that quietly widens who gets an offer corrupts the incrementality bar Rokt measures against. Catching structural widening pre-flight keeps the measurement — and the growth story — trustworthy.",
              },
              {
                head: "Loyalty compounds safely",
                body: "As loyalty and personalization become growth engines, each is a new policy surface. The same missing-attribute + fail-closed scrutiny lets Rokt grow those engines without importing silent risk.",
              },
            ].map((c) => (
              <div key={c.head} className="rounded-2xl border border-border/70 bg-surface-2/40 p-5">
                <h3 className="text-sm font-semibold text-text">{c.head}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 border-t border-border/60 pt-6 text-base leading-relaxed text-muted">
            The reframe underneath it all:{" "}
            <span className="text-text">
              incrementality is a systems-integrity problem before it&apos;s a statistics problem.
            </span>{" "}
            A holdout only measures truth if no silent leak corrupts it — which is exactly what a
            deterministic, tamper-evident pre-flight protects.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

// ── What changes vs. what is invariant ───────────────────────────────────────
const CHANGE_TABLE: { changes: string; invariant: string }[] = [
  {
    changes: "sync → async workers + outbox + batching",
    invariant: "idempotent job; atomic verdict; no partial results",
  },
  {
    changes: "synthetic → real anonymized event-time logs",
    invariant: "pure, deterministic evaluation; no future leakage",
  },
  {
    changes: "SQLite → Postgres + read replicas + Kafka",
    invariant: "tenant isolation; append-only tamper-evident audit",
  },
  {
    changes: "add OPE / drift / LLM-summary at the edges",
    invariant: "deterministic verdict is authoritative; no LLM in the hot path",
  },
  {
    changes: "standalone → deploy-pipeline + approval-queue gate",
    invariant: "positive verdict = holdout eligibility, never “safe to launch”",
  },
];

function ChangeTable() {
  return (
    <section aria-labelledby="change-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
          What scales vs. what is invariant
        </p>
      </Reveal>
      <MaskedLines
        as="h2"
        id="change-title"
        className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        lines={["Everything on the left can change.", "Nothing on the right does."]}
      />
      <Reveal delay={0.05}>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border/70">
          <div className="scroll-x">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead className="bg-surface-2/70 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Changes at scale</th>
                  <th className="px-4 py-3 font-semibold text-teal">Invariant</th>
                </tr>
              </thead>
              <tbody>
                {CHANGE_TABLE.map((row) => (
                  <tr key={row.changes} className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-muted">{row.changes}</td>
                    <td className="px-4 py-3 text-text">{row.invariant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── North-star & guardrails ──────────────────────────────────────────────────
function NorthStar() {
  return (
    <section aria-labelledby="northstar-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="holo-card relative h-full overflow-hidden rounded-3xl p-8 glow-teal">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
              North-star
            </p>
            <MaskedLines
              as="h2"
              id="northstar-title"
              className="mt-3 text-2xl font-semibold leading-snug tracking-tight"
              lines={[
                "Policy changes that reach a reviewer or holdout are",
                <span key="l2" className="gradient-text">
                  provably structurally safe.
                </span>,
              ]}
            />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Zero silent eligibility-widenings and zero checkout regressions escape pre-flight.
            </p>
            <IllustrationReveal
              from="bottom"
              start="top 85%"
              className="pointer-events-none absolute -bottom-4 -right-2 w-28 opacity-90 sm:w-32"
            >
              <IntegrityShield className="w-full" />
            </IllustrationReveal>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="holo-card h-full rounded-3xl p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
              Guardrails
            </p>
            <ul className="mt-4 space-y-3 text-sm text-text">
              {[
                "Checkout preservation is 100% — never a metric to trade.",
                "The holdout remains mandatory; a positive verdict is only eligibility for a controlled test.",
                "The core stays deterministic and LLM-free.",
              ].map((g) => (
                <li key={g} className="flex gap-2.5">
                  <span aria-hidden className="mt-0.5 text-teal">
                    ✓
                  </span>
                  <span className="leading-relaxed text-muted">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-6 rounded-2xl border border-border/70 bg-surface-2/30 p-6 text-sm leading-relaxed text-muted">
          <span className="font-semibold text-text">The honest gap:</span> whether Rokt wants this
          as a standalone surface or folds the same checks into its existing internal review/CI is
          the open question. The vision is framed as &ldquo;here is how the mechanism scales,&rdquo;
          not &ldquo;Rokt lacks this.&rdquo; The prototype&apos;s job is to make the mechanism
          undeniable; the vision&apos;s job is to show it was built by someone who thinks past the
          demo.
        </div>
      </Reveal>
    </section>
  );
}

// ── Closing CTA ──────────────────────────────────────────────────────────────
function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Parallax speed={8}>
        <div className="thr-edge relative overflow-hidden rounded-3xl bg-surface/60 p-10 text-center backdrop-blur sm:p-14">
          <MaskedLines
            as="h2"
            className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
            start="top 88%"
            lines={[
              <span key="l1">
                See the mechanism run on{" "}
                <span className="gradient-text">the live console.</span>
              </span>,
            ]}
          />
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            The prototype proves the mechanism on synthetic data against a real backend. Press
            &ldquo;Play the story&rdquo; and watch a cosmetic-looking edit get caught before a
            single customer.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal press focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
            >
              <span aria-hidden>▶</span> Enter the console
            </Link>
          </div>
        </div>
      </Parallax>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function VisionKeynote() {
  return (
    <div className="relative min-h-screen text-text">
      <div className="aurora-threshold" aria-hidden />
      <div className="relative z-10">
        <VisionNav />
        <main id="main">
          <Hero />
          <ConnectedStory />
          <Direction />
          <CoreInvariant />
          <Roadmap />
          <IntegrationDiagram />
          <Compounds />
          <ChangeTable />
          <NorthStar />
          <ClosingCta />
        </main>
        <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
          THRESHOLD · Vision — grounded in Rokt&apos;s public direction. A positive verdict is only
          eligibility for a controlled online holdout, never &ldquo;safe to launch.&rdquo;
        </footer>
      </div>
    </div>
  );
}
