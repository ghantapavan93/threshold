"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Magnetic } from "@/components/visual/Magnetic";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "@/app/providers";
import { FilmGrain } from "@/components/moment-forge/garnish";
import { MeasurementLive } from "@/components/plan/MeasurementLive";
import { CreativeLinter } from "@/components/plan/CreativeLinter";
import { FindingGlyph, PhaseGlyph } from "@/components/plan/PlanGlyph";
import {
  ChapterRail,
  Pill,
  RoktEcho,
  Scene,
  SceneHeadline,
  EASE,
  type Accent,
  type ChapterDef,
} from "@/components/builder/keynote/stage";

/* /plan — the second proof, given the full keynote treatment. An outside-in
   audit that becomes a first-90-days plan, rendered with the same cinematic
   depth as the Builder keynote (chapter rail, parallax scenes, ambient motes,
   ghost numerals) but its own content and environments. Every audit finding is
   grounded in research/rokt/05 (Rokt public docs) and framed as a governed,
   human-in-the-loop workflow-around — never a claim their automation is lacking. */

const CHAPTERS: ChapterDef[] = [
  { n: "00", label: "The Pattern", anchor: "pk-pattern" },
  { n: "01", label: "The Method", anchor: "pk-method" },
  { n: "02", label: "The Audit", anchor: "pk-audit" },
  { n: "03", label: "Days 0–30", anchor: "pk-30" },
  { n: "04", label: "Days 31–60", anchor: "pk-60" },
  { n: "05", label: "Days 61–90", anchor: "pk-90" },
  { n: "06", label: "Measurement", anchor: "pk-measure" },
  { n: "07", label: "The Ask", anchor: "pk-close" },
];

// ── code-drawn environments ─────────────────────────────────────────────────
const ACCENT_HEX: Record<Accent, string> = {
  teal: "var(--c-teal)",
  crimson: "var(--c-crimson)",
  amber: "var(--c-amber)",
  "offer-blue": "var(--c-offer-blue)",
};

function GlowEnv({ accent }: { accent: Accent }) {
  return (
    <div className="absolute inset-0 bg-[#05070e]">
      <div
        className="absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-35 blur-3xl"
        style={{ background: `radial-gradient(ellipse at center, color-mix(in srgb, ${ACCENT_HEX[accent]} 15%, transparent), transparent 70%)` }}
      />
    </div>
  );
}

function GridEnv({ accent }: { accent: Accent }) {
  return (
    <div className="absolute inset-0 bg-[#04060c]">
      <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={(i / 13) * 1000} y1={0} x2={500} y2={340} stroke="var(--c-border)" strokeOpacity="0.22" strokeWidth="1" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={360 + i * i * 5} x2={1000} y2={360 + i * i * 5} stroke="var(--c-border)" strokeOpacity="0.18" strokeWidth="1" />
        ))}
        <circle cx="500" cy="340" r="170" fill={ACCENT_HEX[accent]} opacity="0.05" />
      </svg>
    </div>
  );
}

// A rising staircase for the 90-day phases — depth cue for progression.
function StepEnv({ accent, step }: { accent: Accent; step: number }) {
  return (
    <div className="absolute inset-0 bg-[#05070e]">
      <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {[0, 1, 2].map((s) => (
          <rect
            key={s}
            x={120 + s * 280}
            y={420 - s * 90}
            width="240"
            height={200 + s * 90}
            fill={s === step ? ACCENT_HEX[accent] : "var(--c-border-strong)"}
            opacity={s === step ? 0.1 : 0.04}
          />
        ))}
      </svg>
    </div>
  );
}

// ── scroll progress ─────────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left">
      <div className="h-full w-full" style={{ background: "linear-gradient(to right, var(--c-teal), var(--c-offer-blue), var(--c-amber))" }} />
    </motion.div>
  );
}

// ── nav ─────────────────────────────────────────────────────────────────────
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

function Nav() {
  const link =
    "inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0";
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-base/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="thr-edge flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 font-mono text-teal">▚</div>
          <p className="text-sm font-semibold tracking-tight">THRESHOLD <span className="text-muted">· The Role in Motion</span></p>
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

// ── shared bits ─────────────────────────────────────────────────────────────
function Body({ children, delay = 0.12 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.p
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted"
    >
      {children}
    </motion.p>
  );
}

function Chips({ metric, jd }: { metric: string; jd: string }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[11px]">
      <span className="rounded-md border border-teal/40 bg-teal/[0.06] px-2 py-0.5 text-teal">metric · {metric}</span>
      <span className="rounded-md border border-border px-2 py-0.5 text-muted">JD · {jd}</span>
    </div>
  );
}

// ── audit data (grounded in research/rokt/05) ───────────────────────────────
type Finding = {
  n: string; title: string; observed: string; read: string; approach: string; metric: string; jd: string;
};
const FINDINGS: Finding[] = [
  {
    n: "01",
    title: "Creative approval is a dense, conditional review loop",
    observed:
      "Every creative is human-reviewed against a granular, vertical-specific policy set — title word-counts, name rules, no all-caps or emoji, per-vertical disclaimers for gambling / alcohol / credit — before it launches, usually within ~24h.",
    read:
      "One missed conditional rule triggers a rejection and another review cycle. For a high-volume advertiser that iteration cost compounds. (Rokt doesn't publish a rejection SLA — inferred.)",
    approach:
      "A pre-submission compliance linter that checks a draft against the published rules and flags the exact at-risk rule with its citation, before submit — e.g. 'title is 3 words and contains a first-name token.' It never auto-approves; Rokt ops stays the decision-maker.",
    metric: "Rejection rate before / after",
    jd: "Design & Build · Accelerate with AI",
  },
  {
    n: "02",
    title: "SDK integration & close-the-loop degrade silently",
    observed:
      "Correct integration needs the right attributes (email, firstname, billingzipcode, confirmationref) on the right pages in the right order, plus the <rokt-thank-you> wrapper — verified today by manual devtools inspection of the Network tab.",
    read:
      "Missing or malformed attributes silently lower match rate and attribution quality — and attribution feeds the AI optimization, so one integration slip has outsized downstream impact.",
    approach:
      "An integration-health check that runs on a partner's staging/confirmation page: confirms selectPlacements fires with every required attribute well-formed, the wrapper is wired, and close-the-loop cart messages round-trip — a shareable report instead of a devtools spot-check.",
    metric: "Attribution match-rate · defect escape rate",
    jd: "Full-Stack Ownership · Optimize & Scale",
  },
  {
    n: "03",
    title: "Experiment interpretation pushes statistics onto the operator",
    observed:
      "Run until a variant hits 95% probability to beat baseline and at least two weeks elapse; the docs explicitly warn against calling early and ask operators to watch secondary metrics for unintended regressions.",
    read:
      "Peeking, early calls, and optimizing a primary metric while a secondary one quietly regresses are the classic failure modes — and that judgment burden sits with the operator on every single experiment.",
    approach:
      "An experiment-readout companion that states plainly whether the 95% / two-week gates are met, flags premature-call attempts, checks the named secondary metrics for regressions, and drafts a plain-language readout. It advises; the human decides rollout.",
    metric: "Regretted-rollout rate",
    jd: "Optimize & Scale · Revenue Growth",
  },
  {
    n: "04",
    title: "Audience & suppression prep is fragile and freshness-bound",
    observed:
      "Seven import paths with strict format rules — single column, no header, SHA-256 lowercased-and-trimmed, no mixed plain/hashed, ≥1,000 for inclusion — and freshness expectations; a failed format check silently rejects the file.",
    read:
      "Recurring manual list prep with silent failure modes is classic ad-ops toil, and suppression lists decay — there's no public signal for 'this list has gone stale.'",
    approach:
      "A client-side prep step that validates against the exact format rules and normalizes / hashes before upload, plus a staleness flag on each list. The operator confirms every upload.",
    metric: "File-rejection rate · freshness lag",
    jd: "Accelerate with AI · Own the outcome",
  },
];

type Phase = {
  goal: string; ships: string[]; derisk: string; metric: string; value: string;
};

function PhaseBody({ p, month }: { p: Phase; month?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-teal">What ships</p>
        {month ? <PhaseGlyph month={month} /> : null}
        <ul className="mt-3 space-y-2.5">
          {p.ships.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-base leading-relaxed text-text">
              <span aria-hidden className="mt-1 text-teal">▛</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-4">
        <div className="glass rounded-2xl border border-amber/25 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-amber">How I&apos;d de-risk it</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.derisk}</p>
        </div>
        <div className="rounded-2xl border border-teal/25 bg-teal/[0.05] p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-teal">Metric</p>
          <p className="mt-1 font-mono text-sm text-text">{p.metric}</p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-muted">Rokt value</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{p.value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function PlanKeynote() {
  return (
    <div className="relative min-h-screen bg-base text-text">
      <FilmGrain id="plan" />
      <ScrollProgress />
      <Nav />
      <ChapterRail chapters={CHAPTERS} />
      <main id="main" className="pt-14">
        {/* 00 · The Pattern */}
        <Scene id="pk-pattern" n="00" label="The Pattern" accent="teal" environment={<GlowEnv accent="teal" />}>
          <div className="max-w-3xl">
            <Pill accent="teal">The second thing I built for you</Pill>
            <SceneHeadline className="mt-6">Two proofs. One pattern.</SceneHeadline>
            <Body>
              Threshold was the first thing I built for Rokt before anyone asked — a running system, not a deck. This
              is the second, in a different shape on purpose: an outside-in audit that becomes a first-90-days plan.
              One piece can be a fluke. A second, different one is a pattern.
            </Body>
            <div className="mt-7">
              <RoktEcho accent="teal" quote="We're all owners and take accountability for delivering results." source="Rokt value · Own the outcome · public" />
            </div>
            <p className="mt-7 max-w-[56ch] rounded-lg border border-border/70 bg-surface/40 p-3 text-sm leading-relaxed text-muted">
              <span className="font-mono text-[11px] uppercase tracking-wide text-teal">If I started Monday</span> —
              ship the smallest safe thing from the audit in month one, own one seam end to end by month two, put it
              behind a real holdout by month three.
            </p>
          </div>
        </Scene>

        {/* 01 · The Method */}
        <Scene id="pk-method" n="01" label="The Method" accent="offer-blue" environment={<GridEnv accent="offer-blue" />}>
          <div className="max-w-3xl">
            <Pill accent="offer-blue">The method</Pill>
            <SceneHeadline className="mt-6">I read the surface line by line — then traced every idea back to it.</SceneHeadline>
            <Body>
              I didn&apos;t skim the job description or the docs. I decoded them. Every finding cites a Rokt public
              doc; every fix is governed and human-in-the-loop; every idea traces to a specific responsibility in the
              role. Relevance over invention — if I can&apos;t tie an idea to a line, I cut it.
            </Body>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { k: "Decode", v: "Read every responsibility and every public doc, not the AI summary." },
                { k: "Trace", v: "Tie each idea to a JD line and a verified fact, or drop it." },
                { k: "Propose", v: "Only governed, human-in-the-loop fixes — the tool advises, the human decides." },
              ].map((s) => (
                <div key={s.k} className="holo-card rounded-2xl p-4">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-offer-blue">{s.k}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <RoktEcho accent="offer-blue" quote="We look to stretch ourselves and set higher standards." source="Rokt value · Raise the bar · public" />
            </div>
          </div>
        </Scene>

        {/* 02 · The Audit */}
        <Scene
          id="pk-audit"
          n="02"
          label="The Audit"
          accent="amber"
          environment={<GlowEnv accent="amber" />}
          live={
            <div className="grid gap-5">
              {FINDINGS.map((f) => (
                <article key={f.n} className="glass rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-2xl font-semibold text-amber/80" style={{ fontFamily: "var(--font-display)" }}>{f.n}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold leading-snug text-text">{f.title}</h3>
                        <FindingGlyph n={f.n} />
                      </div>
                      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <dt className="font-mono text-[10px] uppercase tracking-wide text-muted">Observed · Rokt public docs</dt>
                          <dd className="mt-1 text-sm leading-relaxed text-muted">{f.observed}</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-[10px] uppercase tracking-wide text-amber">My read · inference</dt>
                          <dd className="mt-1 text-sm leading-relaxed text-muted">{f.read}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="font-mono text-[10px] uppercase tracking-wide text-teal">How I&apos;d approach it · governed, human-in-the-loop</dt>
                          <dd className="mt-1 text-sm leading-relaxed text-text">{f.approach}</dd>
                        </div>
                      </dl>
                      <Chips metric={f.metric} jd={f.jd} />
                    </div>
                  </div>
                </article>
              ))}
              <CreativeLinter />
              <p className="max-w-[64ch] text-sm leading-relaxed text-muted">
                The through-line: all four are the same move Threshold already makes — catch the problem before it
                reaches a customer, with a human keeping the decision. Not four ideas; one discipline, four times.
              </p>
            </div>
          }
        >
          <div className="max-w-3xl">
            <Pill accent="amber">The audit</Pill>
            <SceneHeadline className="mt-6">Four things I noticed from the outside.</SceneHeadline>
            <Body>
              Read from Rokt&apos;s public operator surface, knowing I&apos;m missing the internal context you have.
              Each is a governed workflow-around, never a claim your automation is lacking — the manual judgment
              around the automation, made a little safer.
            </Body>
          </div>
        </Scene>

        {/* 03 · Days 0–30 */}
        <Scene id="pk-30" n="03" label="Days 0–30" accent="teal" environment={<StepEnv accent="teal" step={0} />}
          live={
            <PhaseBody
              month="30"
              p={{
                goal: "",
                ships: [
                  "Read the codebase and the surfaces a Builder touches; pair, ask, and map the seams before I change anything.",
                  "Ship the smallest governed pre-validation win from the audit — the integration-health check or the creative linter — as a first PR, with tests.",
                  "Baseline the metric it moves so the impact is measurable, not asserted.",
                ],
                derisk: "Start read-only and advisory so a first-month change can't hurt a customer. Ship behind a flag, keep the diff small, and get it reviewed by someone who owns that surface.",
                metric: "Integration-defect escape rate · rejection-rate baseline",
                value: "Bias for action — working over perfect, a reversible first call made fast.",
              }}
            />
          }
        >
          <div className="max-w-3xl">
            <Pill accent="teal">Month one</Pill>
            <SceneHeadline className="mt-6">Learn the system. Ship one safe thing.</SceneHeadline>
            <Body>The goal isn&apos;t a big splash. It&apos;s to earn context fast and prove I can land a small, correct, reviewed change in a real codebase.</Body>
          </div>
        </Scene>

        {/* 04 · Days 31–60 */}
        <Scene id="pk-60" n="04" label="Days 31–60" accent="teal" environment={<StepEnv accent="teal" step={1} />}
          live={
            <PhaseBody
              month="60"
              p={{
                goal: "",
                ships: [
                  "Take one advisor from prototype to instrumented feature: happy path, a deliberate failure path, graceful recovery, and an audit trail.",
                  "Wire it into a real operator workflow behind a flag and collect the metric live.",
                  "Write the honest limitations note — what's real, what's modelled, what I'd change with internal data.",
                ],
                derisk: "Treat the failure path as a first-class feature, not an afterthought — inject the fault, prove it fails closed, keep the evidence. That's the single most differentiating engineering signal.",
                metric: "Regretted-rollout rate · suppression-freshness lag",
                value: "Own the outcome · Raise the bar — measured, tested, handed off cleanly.",
              }}
            />
          }
        >
          <div className="max-w-3xl">
            <Pill accent="teal">Month two</Pill>
            <SceneHeadline className="mt-6">Own a seam end to end.</SceneHeadline>
            <Body>From &ldquo;I shipped a thing&rdquo; to &ldquo;I own this surface&rdquo; — the whole lifecycle, including the part where it breaks and recovers.</Body>
          </div>
        </Scene>

        {/* 05 · Days 61–90 */}
        <Scene id="pk-90" n="05" label="Days 61–90" accent="teal" environment={<StepEnv accent="teal" step={2} />}
          live={
            <PhaseBody
              month="90"
              p={{
                goal: "",
                ships: [
                  "Put a shipped feature behind a controlled holdout; the only positive verdict is 'eligible for a real online test.'",
                  "Read out incremental impact honestly — the lift, or 'unproven, and here's why,' with secondary-metric guardrails.",
                  "Turn the readout into a repeatable template other Builders can reuse.",
                ],
                derisk: "Guard against the classic trap — don't call a win on the primary metric while a secondary one regresses. Pre-register the secondary metrics and the stop conditions before the test runs.",
                metric: "Incremental revenue proxy via holdout (not a vanity number)",
                value: "Start with the customer · Force for good — honest measurement over a good story.",
              }}
            />
          }
        >
          <div className="max-w-3xl">
            <Pill accent="teal">Month three</Pill>
            <SceneHeadline className="mt-6">Tie it to revenue — measured, not claimed.</SceneHeadline>
            <Body>Correctness earns the right to learn, not the right to claim impact. Month three is where a shipped feature has to prove it moved a number.</Body>
          </div>
        </Scene>

        {/* 06 · Measurement */}
        <Scene
          id="pk-measure"
          n="06"
          label="Measurement"
          accent="offer-blue"
          environment={<GridEnv accent="offer-blue" />}
          live={<MeasurementLive />}
        >
          <div className="max-w-3xl">
            <Pill accent="offer-blue">How I&apos;d measure success</Pill>
            <SceneHeadline className="mt-6">A launch isn&apos;t a win. A moved number is.</SceneHeadline>
            <Body>
              A shipped feature isn&apos;t a win because it launched. It&apos;s a win when a controlled holdout says it
              moved the number — and even then I&apos;d watch the secondary metrics for what it quietly cost.
            </Body>
            <p className="mt-5 max-w-[56ch] text-sm leading-relaxed text-muted">
              That&apos;s the same discipline Threshold enforces: the only positive verdict there is{" "}
              <span className="font-mono text-teal">ELIGIBLE_FOR_HOLDOUT</span>. It lines up with Rokt&apos;s own
              measurement-first stance — show the right content or show nothing, and ask whether the moment was
              meaningful.
            </p>
            <div className="mt-7">
              <RoktEcho accent="offer-blue" quote="Was this moment meaningful?" source="Rokt · 2026 Commerce Outlook · public" />
            </div>
          </div>
        </Scene>

        {/* 07 · The Ask */}
        <Scene id="pk-close" n="07" label="The Ask" accent="teal" environment={<GlowEnv accent="teal" />}>
          <div className="mx-auto max-w-2xl text-center">
            <Pill accent="teal">One is a spark. Two is a pattern.</Pill>
            <SceneHeadline className="mx-auto mt-6">You&apos;ve seen two pieces of real work before we&apos;ve spoken.</SceneHeadline>
            <Body>
              Threshold is a running system. This is the audit and plan that would come next. Tear either one apart —
              I&apos;d rather be corrected than flattered.
            </Body>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Magnetic strength={0.35}>
                <Link href="/" className="press inline-flex min-h-[48px] items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}>
                  <span aria-hidden>▶</span> Operate Threshold
                </Link>
              </Magnetic>
              <Link href="/builder" className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal">
                Watch the Builder keynote
              </Link>
            </div>
          </div>
        </Scene>
      </main>

      <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
        THRESHOLD · The Role in Motion — findings grounded in Rokt&apos;s public docs (research/rokt/05), framed
        as governed workflow-arounds, not claims about Rokt&apos;s product. Written from the outside; humbly missing
        internal context.
      </footer>
    </div>
  );
}
