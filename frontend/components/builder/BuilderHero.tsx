"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eyebrow, MaskText, prefersReducedMotion, useIsoLayoutEffect } from "./anim";
import { SceneMedia } from "@/components/visual/SceneMedia";

/* ────────────────────────────────────────────────────────────────────────────
   Hero scene.
   • On load: masked, word-by-word reveal of the headline (Awwwards style).
   • On scroll (desktop only): the hero is PINNED while the reader scrolls past;
     the headline is held and drifts up + fades as its content parallaxes at
     different depths — the "pinned reveal".
   • Decorative ring/glow parallaxes for depth.
   • prefers-reduced-motion: no pin, no drift; the headline is fully visible from
     first paint (initial DOM state is the final state).
   ──────────────────────────────────────────────────────────────────────────── */

export function BuilderHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const heading = section.querySelector<HTMLElement>("h1");
      const words = section.querySelectorAll<HTMLElement>("[data-w]");

      // "From" states — set before paint so there is no flash.
      gsap.set(words, { yPercent: 120, opacity: 0 });
      gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { autoAlpha: 0, y: 22 });

      // Intro reveal on load — the headline masks up word by word.
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .to(eyebrowRef.current, { autoAlpha: 1, y: 0, duration: 0.6 })
        .to(words, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.055 }, 0.15)
        .to(subRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.45");

      // Desktop: pin the hero + parallax depth as the reader scrolls past it.
      mm.add("(min-width: 768px)", () => {
        const pin = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=65%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });
        if (heading) pin.to(heading, { yPercent: -10, opacity: 0.9, ease: "none" }, 0);
        pin
          .to(subRef.current, { yPercent: -22, opacity: 0.8, ease: "none" }, 0)
          .to(ctaRef.current, { yPercent: -34, opacity: 0.7, ease: "none" }, 0);
        if (decorRef.current) pin.to(decorRef.current, { yPercent: 44, ease: "none" }, 0);
      });
    }, section);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="Introduction" className="relative overflow-hidden">
      {/* Ambient loop (clip A, "The Transaction Moment") — dimmed + scrimmed;
          renders nothing until /public/media/ambient-moment.webm exists. */}
      <SceneMedia
        variant="backdrop"
        src="/media/ambient-moment.webm"
        poster="/media/ambient-moment.jpg"
        label=""
      />
      <div
        ref={decorRef}
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

      <div className="relative z-[1] mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div ref={eyebrowRef}>
          <Eyebrow>Junior SWE · Builder · Proof of work over credentials</Eyebrow>
        </div>

        <MaskText
          as="h1"
          manual
          className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          segments={[
            { text: "I don't want to be handed a ticket. " },
            { text: "Here's how I'd own the work.", className: "gradient-text" },
          ]}
        />

        <p
          ref={subRef}
          className="mt-6 max-w-3xl text-base leading-relaxed text-muted sm:text-lg"
        >
          Rokt&apos;s Junior SWE role is a <strong className="text-text">Builder</strong> — someone
          who grows across systems, software, data, and data science, ships to internet-scale, uses
          AI as leverage, and drives incremental revenue. I built Threshold to <em>show</em> that,
          not say it. Below: for each part of the role, what I already did — and how I&apos;d own it
          next.
        </p>

        <div ref={ctaRef} className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#what-ill-do"
            className="press inline-flex min-h-[44px] items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:min-h-0"
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
        </div>
      </div>
    </section>
  );
}
