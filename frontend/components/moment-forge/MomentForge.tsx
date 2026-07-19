"use client";

import { useState } from "react";
import { useHealth } from "@/lib/hooks";
import { scrollToId } from "@/lib/scroll";
import { MaskText, Reveal } from "@/components/builder/anim";
import { TransactionMomentMotif } from "@/components/visual/illustrations";
import {
  BlueprintSubstrate,
  DomainTerm,
  Eyebrow,
  Marginalia,
  MomentNav,
  Plate,
  PlateRail,
} from "./chassis";
import { ContextMap } from "./ContextMap";
import { LanguageLens } from "./LanguageLens";
import { TranslationMap } from "./TranslationMap";
import { CompilerConsole } from "./CompilerConsole";
import { FractureScene } from "./FractureScene";
import { LawGallery, EvidenceIndex } from "./laws-future";
import { RippleSim } from "./RippleSim";
import { Horizon } from "./horizon/Horizon";
import type { ForgeScenario } from "./fixtures";

/* ────────────────────────────────────────────────────────────────────────────
   /moment-forge — an architectural monograph for Rokt's Transaction Moment.
   Nine sections; two are LIVE (Fig. 04 Compiler, Fig. 07 Simulator) against the
   real backend with a real-recorded offline fallback. Content from
   research/rokt/27 + 28; nothing fabricated. Cohesive with MASTER (reduced-motion
   law, AA contrast, no external assets, no color-alone).
   ──────────────────────────────────────────────────────────────────────────── */

function Section({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-label={label} className="scroll-mt-24 py-14 sm:py-20">
      {children}
    </section>
  );
}

export function MomentForge() {
  const health = useHealth();
  const offline = health.isError ? health.error.isUnreachable : false;

  // Executable-laws bridge: a law card asks the Simulator to run its scenario.
  const [simTrigger, setSimTrigger] = useState<{ scenario: ForgeScenario; nonce: number } | null>(null);
  const runLaw = (scenario: ForgeScenario) => {
    setSimTrigger({ scenario, nonce: Date.now() });
    scrollToId("sec-sim");
  };

  return (
    <div className="relative min-h-screen text-text">
      <BlueprintSubstrate />
      <div className="relative z-10">
        <MomentNav />
        <PlateRail />
        <main id="main" className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* ── 1 · The core domain ─────────────────────────────────────────── */}
          <Section id="sec-core" label="The core domain">
            <Eyebrow>A domain monograph · Fig. 01</Eyebrow>
            <MaskText
              as="h1"
              className="mt-3 max-w-3xl text-3xl font-bold leading-[1.05] tracking-tightest sm:text-4xl lg:text-5xl"
              segments={[
                { text: "The Transaction Moment is not one model. " },
                { text: "It is several models that share a vocabulary but not a meaning.", className: "gradient-text" },
              ]}
            />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
              <div className="max-w-[62ch]">
                <blockquote className="border-l-2 border-teal/60 pl-4 text-lg leading-relaxed text-text">
                  &ldquo;Total unification of the domain model for a large system will not be feasible.&rdquo;
                  Eric Evans built strategic DDD to name exactly where meaning diverges — and to govern the
                  translation across each seam.
                </blockquote>
                <p className="mt-5 text-base leading-relaxed text-muted">
                  Rokt&apos;s{" "}
                  <DomainTerm definition="The differentiator you must build and must not outsource. Here: deciding, per transaction and in real time, whether and which offer is incrementally valuable at that specific moment — and being able to prove it.">
                    core domain
                  </DomainTerm>{" "}
                  is a provably-incremental, right-moment decision — including the decision to{" "}
                  <span className="text-text">show nothing</span>. Around it sits a ring of{" "}
                  <DomainTerm definition="Necessary and Rokt-specific, but not the moat: loyalty, measurement, catalog, consent. A 10% gain here is worth less than a 10% gain in decision incrementality.">
                    supporting subdomains
                  </DomainTerm>{" "}
                  that make the decision usable and trustworthy; payments, crypto and observability are{" "}
                  <DomainTerm definition="Solved elsewhere — adopt, don't invent. Rokt's public surface deliberately stops at cart state and hands money movement to providers.">
                    generic
                  </DomainTerm>
                  , adopted not invented. Threshold sits deliberately <em>beside</em> the core — a
                  deterministic safety gate on <em>changes</em> to the rules around the decision, never the
                  decision itself.
                </p>
              </div>
              <div>
                <div className="rounded-2xl border border-border/60 bg-surface/50 p-5">
                  <TransactionMomentMotif className="w-full" />
                </div>
                <Marginalia>
                  <p className="text-teal">Subdomain key</p>
                  <p className="mt-1">CORE · the incrementality-proven, right-moment decision</p>
                  <p className="mt-1">SUPPORTING · loyalty · measurement · catalog · consent</p>
                  <p className="mt-1">GENERIC · payments · crypto · observability</p>
                </Marginalia>
              </div>
            </div>
          </Section>

          {/* ── 2 · Living bounded-context map ──────────────────────────────── */}
          <Section id="sec-map" label="The living bounded-context map">
            <Plate
              figure="02"
              title="The Living Bounded-Context Map"
              tone="teal"
              caption="Seven bounded contexts of the Transaction Moment. Each edge is a DDD relationship pattern (color + line-style + glyph + label). Select a context to study its role, its language, and its relationships. Modelling choices [INFERENCE]; the seams are [VERIFIED-PUBLIC]."
            >
              <ContextMap />
            </Plate>
          </Section>

          {/* ── 3 · Language collision (the stop-scrolling piece) ───────────── */}
          <Section id="sec-lens" label="Ubiquitous-language collision">
            <Plate
              figure="03"
              title="The Language Lens"
              tone="crimson"
              caption="Take one word and move it across a bounded-context boundary; its definition, concept-shape and connotation mutate at the seam. Same word, different model — the general disease Threshold's missing-attribute check treats."
            >
              <LanguageLens />
            </Plate>
          </Section>

          {/* ── 3b · Translation Map [LIVE] — the honest self-critique closed ─── */}
          <Section id="sec-translation" label="Translation Map — conversion across an anticorruption layer">
            <Reveal>
              <p className="mb-4 max-w-[62ch] text-base leading-relaxed text-muted">
                An honest self-critique: the missing-attribute inversion never actually <em>crosses</em> a
                boundary — it lives in one function. Here the word{" "}
                <span className="text-text">&ldquo;conversion&rdquo;</span> genuinely crosses a real
                anticorruption layer (Measurement → Incrementality) in deterministic code. Toggle the ACL off and
                a real number inflates at the wall — the leak the ACL exists to stop.
              </p>
            </Reveal>
            <Plate
              figure="03b"
              title="The Translation Map"
              tone="crimson"
              caption="LIVE · POST /translation-audit. The Conformist (identity) path over-counts lift; the ACL path excludes non-incremental conversions. The one synthetic baseline is labelled; every number is computed live, never asserted."
            >
              <TranslationMap offline={offline} />
            </Plate>
          </Section>

          {/* ── 4 · Semantic Change Compiler [LIVE] ─────────────────────────── */}
          <Section id="sec-compiler" label="Semantic Change Compiler">
            <Reveal>
              <p className="mb-4 max-w-[62ch] text-base leading-relaxed text-muted">
                Threshold reframed: a <span className="text-text">Semantic Change Compiler</span>. It
                compiles a proposed change into its semantic delta across bounded contexts, then flags any
                change whose <em>meaning</em> shifts across a seam. This console calls the real backend and
                renders only real output.
              </p>
            </Reveal>
            <Plate
              figure="04"
              title="Semantic Change Compiler"
              tone="teal"
              caption="LIVE · POST /semantic-compile. The static compiler flags the inversion; the blast-radius proof (how many sessions actually flip) comes only from the Simulator's counterfactual — an intentional, honest split."
            >
              <CompilerConsole offline={offline} />
            </Plate>
          </Section>

          {/* ── 5 · Context Fracture ────────────────────────────────────────── */}
          <Section id="sec-fracture" label="Context fracture">
            <Plate
              figure="05"
              title="Context Fracture"
              tone="crimson"
              caption="A failure originates, propagates, and is contained at a bounded-context boundary — the visceral argument for boundaries, anticorruption layers, and fail-closed. Storyboard; every phase is real text in order."
            >
              <FractureScene />
            </Plate>
          </Section>

          {/* ── 6 · Laws of the Moment ──────────────────────────────────────── */}
          <Section id="sec-laws" label="Laws of the Moment">
            <Eyebrow>Fig. 06 · the codex</Eyebrow>
            <MaskText
              as="h2"
              className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl"
              segments={[{ text: "Laws of the Moment — " }, { text: "the invariants the model must never violate.", className: "gradient-text" }]}
            />
            <div className="mt-8">
              <LawGallery onRun={runLaw} />
            </div>
          </Section>

          {/* ── 7 · Domain Evolution Simulator [LIVE] ───────────────────────── */}
          <Section id="sec-sim" label="Domain Evolution Simulator">
            <Reveal>
              <p className="mb-4 max-w-[62ch] text-base leading-relaxed text-muted">
                Run the same change <em>forward</em> through real event-time replay and watch its impact
                ripple across the bounded contexts to a deterministic verdict. Muting the Customer context
                drops its rules — on the trap, that removes the operator flip and the inversion disappears.
              </p>
            </Reveal>
            <Plate
              figure="07"
              title="Domain Evolution Simulator"
              tone="teal"
              caption="LIVE · POST /simulations — ephemeral, non-persisting. Impact is qualitative (the highlighted set + the decision diff), never a fabricated blast-radius percentage."
            >
              <RippleSim offline={offline} trigger={simTrigger} />
            </Plate>
          </Section>

          {/* ── 8 · The Horizon — cinematic future hypotheses (replaces the gallery) ── */}
          <Horizon />

          {/* ── 9 · Implementation-evidence cross-links ─────────────────────── */}
          <Section id="sec-evidence" label="Implementation-evidence cross-links">
            <Eyebrow>Fig. 09 · the proof it&apos;s not just theory</Eyebrow>
            <MaskText
              as="h2"
              className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl"
              segments={[{ text: "This model is " }, { text: "executable.", className: "gradient-text" }]}
            />
            <div className="mt-8">
              <EvidenceIndex />
            </div>
          </Section>
        </main>

        <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
          THRESHOLD · Moment Forge — a domain model I would defend in a design review, built from Rokt&apos;s
          public seams. Context names and patterns are modelling choices, not Rokt&apos;s org chart. The two
          live figures call the real backend; nothing is fabricated.
        </footer>
      </div>
    </div>
  );
}
