"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskText, Reveal, prefersReducedMotion, useIsoLayoutEffect } from "./anim";

/* ────────────────────────────────────────────────────────────────────────────
   "What I'll do" — the six-dimension numbered timeline.
   • A scrubbed GSAP timeline DRAWS the spine (scaleY) as you scroll the list.
   • Each card reveals in sequence on enter: the number badge pops, the card
     clip-path wipes open, and the "Proof" / "How I'd own it next" columns slide
     in from opposite sides.
   • prefers-reduced-motion: spine is fully drawn and every card visible from
     first paint (no GSAP runs).
   ──────────────────────────────────────────────────────────────────────────── */

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

export function DoTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const spineRef = useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const list = listRef.current;
    const spine = spineRef.current;
    if (!list) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // 1) Draw the spine as the reader scrolls through the list (scrubbed).
      if (spine) {
        gsap.set(spine, { scaleY: 0, transformOrigin: "top" });
        gsap.to(spine, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list,
            start: "top 72%",
            end: "bottom 82%",
            scrub: true,
          },
        });
      }

      // 2) Reveal each card in sequence on enter.
      const items = gsap.utils.toArray<HTMLElement>(list.querySelectorAll("li"));
      items.forEach((li) => {
        const badge = li.querySelector<HTMLElement>("[data-badge]");
        const card = li.querySelector<HTMLElement>("[data-card]");
        const proof = li.querySelector<HTMLElement>("[data-proof]");
        const own = li.querySelector<HTMLElement>("[data-own]");

        if (badge) gsap.set(badge, { scale: 0.4, autoAlpha: 0 });
        if (card) gsap.set(card, { clipPath: "inset(0 0 100% 0)", autoAlpha: 0 });
        if (proof) gsap.set(proof, { x: -28, autoAlpha: 0 });
        if (own) gsap.set(own, { x: 28, autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: li, start: "top 82%", once: true },
        });
        if (badge)
          tl.to(badge, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.7)" });
        if (card)
          tl.to(
            card,
            { clipPath: "inset(0 0 0% 0)", autoAlpha: 1, duration: 0.7, ease: "power3.out" },
            "-=0.3",
          );
        if (proof)
          tl.to(proof, { x: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, "-=0.4");
        if (own)
          tl.to(own, { x: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, "-=0.45");
      });
    }, list);

    return () => ctx.revert();
  }, []);

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
      </Reveal>
      <MaskText
        as="h2"
        id="do-title"
        className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        segments={[
          { text: "Six dimensions — " },
          { text: "proof, then ownership.", className: "gradient-text" },
        ]}
      />
      <Reveal delay={0.05}>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          For each part of the role: the intent, the proof already in Threshold, and how I&apos;d
          own it next at Rokt.
        </p>
      </Reveal>

      <ol ref={listRef} className="relative mt-12 space-y-6 pl-6 sm:pl-8">
        {/* faint spine track */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full w-px bg-border/70"
        />
        {/* animated spine fill (fully drawn by default → reduced-motion safe) */}
        <span
          ref={spineRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full w-px"
          style={{
            background:
              "linear-gradient(180deg, rgba(34,230,200,0.9), rgba(91,140,255,0.7), rgba(34,230,200,0.2))",
          }}
        />

        {DO_CARDS.map((c) => (
          <li key={c.n} className="relative">
            <span
              data-badge
              aria-hidden
              className="absolute -left-[calc(1.5rem+1px)] top-1.5 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-teal/60 bg-base font-mono text-sm font-semibold text-teal sm:-left-[calc(2rem+1px)]"
            >
              {c.n}
            </span>
            <div data-card className="holo-card rounded-2xl p-5 sm:p-6">
              <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-1.5 text-sm italic leading-relaxed text-muted">{c.intent}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div
                  data-proof
                  className="rounded-xl border border-teal/30 bg-teal/[0.05] p-4"
                >
                  <p className="font-mono text-[11px] uppercase tracking-wide text-teal">
                    Proof in Threshold
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text">{c.proof}</p>
                </div>
                <div
                  data-own
                  className="rounded-xl border border-offer-blue/30 bg-offer-blue/[0.05] p-4"
                >
                  <p className="font-mono text-[11px] uppercase tracking-wide text-offer-blue">
                    How I&apos;d own it next
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text">{c.ownNext}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
