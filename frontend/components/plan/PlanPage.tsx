"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";

/* /plan — the second proof. An outside-in audit of Rokt's public operator
   surface that feeds a concrete first-90-days plan. Deliberately a crisp
   operator's dossier, not a cinematic keynote — a different format from the
   Builder keynote so two pieces read as a pattern, not a fluke.

   Every audit finding is grounded in research/rokt/05 (Rokt public docs) and
   framed as a governed, human-in-the-loop "workflow-around," never a claim that
   Rokt's automation is lacking. Honesty labels are shown inline. */

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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="thr-edge flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 font-mono text-teal">▚</div>
          <p className="text-sm font-semibold tracking-tight">THRESHOLD <span className="text-muted">· Audit &amp; 90-day plan</span></p>
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

type Finding = {
  n: string;
  title: string;
  observed: string;
  read: string;
  approach: string;
  metric: string;
  jd: string;
};

// Grounded in research/rokt/05 (Rokt/mParticle public docs, retrieved 2026-07-18).
const FINDINGS: Finding[] = [
  {
    n: "01",
    title: "Creative approval is a dense, conditional, back-and-forth review",
    observed:
      "Every campaign and creative is reviewed against a granular, vertical-specific policy set (title word-counts, name rules, no all-caps, per-vertical disclaimers) before it can launch — usually within ~24h.",
    read:
      "A single overlooked rule triggers a rejection and another review cycle. For a high-volume advertiser that iteration cost compounds. (Rejection SLA isn't public — inferred.)",
    approach:
      "A pre-submission compliance linter that checks a draft against the published policy rules and flags the exact at-risk rule with its citation, before submit. It never auto-approves — Rokt ops stays the decision-maker.",
    metric: "Rejection rate before / after",
    jd: "Design & Build · Accelerate with AI",
  },
  {
    n: "02",
    title: "SDK integration & close-the-loop degrade silently",
    observed:
      "Correct integration needs the right attributes (email, firstname, billingzipcode, confirmationref…) on the right pages, in the right order, plus the <rokt-thank-you> wrapper — verified today by manual devtools inspection.",
    read:
      "Missing or malformed attributes silently lower match rate and attribution quality — and attribution feeds the AI optimization, so an integration slip has outsized downstream impact.",
    approach:
      "An integration-health check that runs on a partner's staging/confirmation page: confirms selectPlacements fires with all required attributes well-formed, the wrapper is wired, and close-the-loop cart messages round-trip — a shareable report instead of a devtools spot-check.",
    metric: "Attribution match-rate · integration-defect escape rate",
    jd: "Full-Stack Ownership · Optimize & Scale",
  },
  {
    n: "03",
    title: "Experiment interpretation pushes statistical judgment onto the operator",
    observed:
      "Run until a variant hits 95% probability to beat baseline and at least two weeks elapse; the docs explicitly warn against calling early and ask operators to watch secondary metrics for unintended regressions.",
    read:
      "Peeking, early calls, and optimizing a primary metric while a secondary one quietly regresses are the classic failure modes — and the judgment burden sits with the operator on every experiment.",
    approach:
      "An experiment-readout companion that states plainly whether the 95% / two-week gates are met, flags premature-call attempts, checks the named secondary metrics for regressions, and drafts a plain-language readout. It advises; the human decides rollout.",
    metric: "Regretted-rollout rate",
    jd: "Optimize & Scale · Revenue Growth",
  },
  {
    n: "04",
    title: "Audience & suppression prep is fragile, repetitive, and freshness-bound",
    observed:
      "Seven import paths with strict format rules (single column, no header, SHA-256 lowercased-and-trimmed, no mixed plain/hashed, ≥1,000 for inclusion) and freshness expectations; a failed format check silently rejects the file.",
    read:
      "Recurring manual list prep with silent failure modes is classic ad-ops toil, and suppression lists decay — there's no public signal for 'this list has gone stale.'",
    approach:
      "A client-side prep step that validates against the exact format rules and normalizes/hashes before upload, plus a staleness flag on each list. The operator confirms every upload.",
    metric: "File-rejection rate · suppression-freshness lag",
    jd: "Accelerate with AI · Own the outcome",
  },
];

type Phase = {
  window: string;
  title: string;
  ships: string[];
  metric: string;
  value: string;
};

const PHASES: Phase[] = [
  {
    window: "Days 0–30",
    title: "Learn the system. Ship one safe thing.",
    ships: [
      "Read the codebase and the surfaces a Builder touches; pair, ask, map the seams.",
      "Ship the smallest governed pre-validation win from the audit (the integration-health check or the creative linter) as a first PR — with tests.",
      "Baseline the metric it moves so the impact is measurable, not asserted.",
    ],
    metric: "Integration-defect escape rate · rejection-rate baseline",
    value: "Bias for action — working over perfect, a reversible first call made fast.",
  },
  {
    window: "Days 31–60",
    title: "Own a seam end to end.",
    ships: [
      "Take one advisor from prototype to instrumented feature: happy path, a deliberate failure path, graceful recovery, and an audit trail.",
      "Wire it into a real operator workflow behind a flag; collect the metric live.",
      "Write the honest limitations note — what's real, what's modelled, what I'd change with internal data.",
    ],
    metric: "Regretted-rollout rate · suppression-freshness lag",
    value: "Own the outcome · Raise the bar — measured, tested, and handed off cleanly.",
  },
  {
    window: "Days 61–90",
    title: "Tie it to revenue — measured, not claimed.",
    ships: [
      "Put a shipped feature behind a controlled holdout; the only positive verdict is 'eligible for a real online test.'",
      "Read out incremental impact honestly — the lift, or 'unproven, and here's why,' with secondary-metric guardrails.",
      "Turn the readout into a repeatable template other Builders can reuse.",
    ],
    metric: "Incremental revenue proxy via holdout (not a vanity number)",
    value: "Start with the customer · Force for good — honest measurement over a good story.",
  },
];

export function PlanPage() {
  return (
    <div className="relative min-h-screen bg-base text-text">
      <div className="aurora-threshold" aria-hidden />
      <div className="relative z-10">
        <Nav />
        <main id="main" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          {/* hero */}
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">
            The second thing I built for you
          </p>
          <h1
            className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            An outside-in audit — and what I&apos;d do in my first ninety days.
          </h1>
          <p className="mt-5 max-w-[64ch] text-base leading-relaxed text-muted sm:text-lg">
            Threshold was the first thing I built for Rokt before anyone asked. This is the second, in a different
            shape on purpose. I read the public operator surface line by line and wrote down what I noticed and how
            I&apos;d approach it — knowing I&apos;m missing the internal context you have. Every finding is grounded in
            a Rokt public doc and framed as a governed, human-in-the-loop workflow-around, never a claim that your
            automation is lacking.
          </p>
          <p className="mt-4 max-w-[64ch] rounded-lg border border-border/70 bg-surface/40 p-3 text-sm leading-relaxed text-muted">
            <span className="font-mono text-[11px] uppercase tracking-wide text-teal">If I started Monday</span>{" "}
            — I&apos;d ship the smallest safe thing from the audit below in the first month, own one seam end to end
            by month two, and put it behind a real holdout by month three.
          </p>

          {/* the audit */}
          <section className="mt-16" aria-labelledby="audit-h">
            <h2 id="audit-h" className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
              The audit — four things I noticed from the outside
            </h2>
            <p className="mt-2 text-sm text-muted">
              Observed from Rokt&apos;s public docs · my read · how I&apos;d approach it · the metric it moves.
            </p>
            <div className="mt-8 grid gap-5">
              {FINDINGS.map((f) => (
                <article key={f.n} className="glass rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <span
                      className="font-mono text-2xl font-semibold text-teal/80"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {f.n}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold leading-snug text-text">{f.title}</h3>
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
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 font-mono text-[11px]">
                        <span className="rounded-md border border-teal/40 bg-teal/[0.06] px-2 py-0.5 text-teal">metric · {f.metric}</span>
                        <span className="rounded-md border border-border px-2 py-0.5 text-muted">JD · {f.jd}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-5 max-w-[64ch] text-sm leading-relaxed text-muted">
              The through-line: all four are the same move Threshold already makes — catch the problem before it
              reaches a customer, with a human keeping the decision. That&apos;s not four ideas; it&apos;s one
              discipline applied four times.
            </p>
          </section>

          {/* the plan */}
          <section className="mt-16" aria-labelledby="plan-h">
            <h2 id="plan-h" className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
              The first ninety days
            </h2>
            <p className="mt-2 text-sm text-muted">Each phase ships something real, tied to a JD responsibility and a metric.</p>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {PHASES.map((p) => (
                <div key={p.window} className="holo-card flex h-full flex-col rounded-2xl p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">{p.window}</p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-text">{p.title}</h3>
                  <ul className="mt-4 flex-1 space-y-2.5">
                    {p.ships.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                        <span aria-hidden className="mt-0.5 text-teal">▛</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="font-mono text-[11px] text-teal">metric · {p.metric}</p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{p.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* measurement philosophy */}
          <section className="mt-16" aria-labelledby="measure-h">
            <h2 id="measure-h" className="text-xs font-semibold uppercase tracking-[0.22em] text-teal">
              How I&apos;d measure success
            </h2>
            <div className="mt-6 glass rounded-2xl p-6">
              <p className="max-w-[64ch] text-base leading-relaxed text-text">
                A shipped feature isn&apos;t a win because it launched. It&apos;s a win when a controlled holdout says
                it moved the number — and even then I&apos;d watch the secondary metrics for what it quietly cost.
              </p>
              <p className="mt-4 max-w-[64ch] text-sm leading-relaxed text-muted">
                That&apos;s the same discipline Threshold enforces: the only positive verdict there is{" "}
                <span className="font-mono text-teal">ELIGIBLE_FOR_HOLDOUT</span> — correctness earns the right to
                learn, not the right to claim impact. It lines up with Rokt&apos;s own measurement-first stance:
                &ldquo;show the right content, or show nothing,&rdquo; and &ldquo;was this moment meaningful?&rdquo;
              </p>
            </div>
          </section>

          {/* close */}
          <section className="mt-16 rounded-3xl border border-border/70 bg-surface/50 p-8 text-center sm:p-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">One is a spark. Two is a pattern.</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              You&apos;ve now seen two pieces of real work before we&apos;ve spoken.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              Threshold is a running system. This is the audit and plan that would come next. Tear either one apart —
              I&apos;d rather be corrected than flattered.
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
                href="/builder"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                Watch the Builder keynote
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
          THRESHOLD · Audit &amp; 90-day plan — findings grounded in Rokt&apos;s public docs (research/rokt/05),
          framed as governed workflow-arounds, not claims about Rokt&apos;s product. Written from the outside; humbly
          missing internal context.
        </footer>
      </div>
    </div>
  );
}
