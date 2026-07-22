"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
import { SceneMedia } from "@/components/visual/SceneMedia";
import { FilmGrain } from "./garnish";
import { ContextMap } from "./ContextMap";
import { LanguageLens } from "./LanguageLens";
import { RewardLedger } from "./RewardLedger";
import { TranslationMap } from "./TranslationMap";
import { ReconciliationLane } from "./ReconciliationLane";
import { UnitWall } from "./UnitWall";
import { CompilerConsole } from "./CompilerConsole";
import { FractureScene } from "./FractureScene";
import { LawsBoard } from "./LawsBoard";
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

/* A section intro that becomes cinematic the moment its ambient loop lands in
   /public/media (manifest-gated; see public/media/README.md for the prompt
   pack). Until then it renders the plain intro exactly as before — the media
   layer and its scrim only exist once the clip is present and loaded. */
function CinemaIntro({ clip, children }: { clip: string; children: React.ReactNode }) {
  return (
    <div className="relative mb-2 overflow-hidden rounded-2xl">
      <SceneMedia
        variant="backdrop"
        src={`/media/${clip}.mp4`}
        poster={`/media/${clip}.jpg`}
        label=""
      />
      <div className="relative z-[1] p-4 sm:p-5">{children}</div>
    </div>
  );
}

/* The ShelfTrace-derived beat grammar — attention first, rigor on demand.
   Every section intro is exactly: an all-caps kicker, ONE sentence, three
   bullets, and a "full argument" disclosure holding the original paragraph.
   Sides alternate section to section so the page reads as a rhythm, not a
   column of essays. */
type BeatAccent = "teal" | "crimson" | "amber" | "offer-blue";
const BEAT_TEXT: Record<BeatAccent, string> = {
  teal: "text-teal",
  crimson: "text-crimson",
  amber: "text-amber",
  "offer-blue": "text-offer-blue",
};

const BEAT_BAR: Record<BeatAccent, string> = {
  teal: "linear-gradient(to right, var(--c-teal), transparent)",
  crimson: "linear-gradient(to right, var(--c-crimson), transparent)",
  amber: "linear-gradient(to right, var(--c-amber), transparent)",
  "offer-blue": "linear-gradient(to right, var(--c-offer-blue), transparent)",
};

function BeatIntro({
  kicker,
  body,
  bullets,
  accent,
  side,
  depth,
}: {
  kicker: string;
  body: React.ReactNode;
  bullets: React.ReactNode[];
  accent: BeatAccent;
  side: "left" | "right";
  depth?: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const text = (
    <div className={side === "left" ? "lg:order-2" : undefined}>
      <p className={`font-mono text-[11px] uppercase tracking-[0.22em] ${BEAT_TEXT[accent]}`}>
        {kicker}
      </p>
      {/* gradient underline — draws itself as the beat scrolls into view */}
      <motion.span
        aria-hidden
        className="mt-2 block h-px w-24 origin-left"
        style={{ background: BEAT_BAR[accent] }}
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      <p className="mt-3 max-w-[46ch] text-lg leading-relaxed text-text sm:text-xl">{body}</p>
    </div>
  );
  const list = (
    <ul className={`space-y-2.5 lg:pt-7 ${side === "left" ? "lg:order-1" : ""}`}>
      {bullets.map((b, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
          <span aria-hidden className={`mt-0.5 font-mono text-xs ${BEAT_TEXT[accent]}`}>
            ▛
          </span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      <div
        className={
          side === "left"
            ? "grid gap-5 lg:grid-cols-[1fr_1.25fr] lg:gap-10"
            : "grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:gap-10"
        }
      >
        {text}
        {list}
      </div>
      {depth ? (
        <div className="mt-4">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
          >
            <span
              aria-hidden
              className="transition-transform duration-300"
              style={{ transform: open ? "rotate(90deg)" : "none" }}
            >
              ▸
            </span>
            The full argument
          </button>
          {/* framer measures the real content height so the reveal is smooth
              and correct; reduced motion collapses it to an instant toggle */}
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                key="depth"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 max-w-[62ch] border-l border-border/70 pl-4 text-sm leading-relaxed text-muted">
                  {depth}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
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
      <FilmGrain />
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
                <p className="border-l-2 border-teal/60 pl-4 text-lg leading-relaxed text-text">
                  No system this large speaks one language. The same words — conversion, reward,
                  impression — mean different things in different rooms, and the seams between those
                  rooms are exactly where money and trust leak. This page maps the seams, then makes
                  them executable.
                </p>
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
              caption="Seven contexts, every edge a named relationship pattern — select one to study its role, its language, its seams. Modelling [INFERENCE]; the seams [VERIFIED-PUBLIC]."
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
              caption="Same word, different model — drag it across a boundary and watch its meaning mutate at the seam."
            >
              <LanguageLens />
            </Plate>
          </Section>

          {/* ── 3·R · Reward collision, PROVEN [LIVE] — the third aggregate ───── */}
          <Section id="sec-reward" label="Reward — earned vs issued vs redeemable, proven">
            <Plate
              figure="03·R"
              title="issued ≠ redeemable"
              tone="teal"
              caption="The reconciler used to leave REDEEMABLE 'named, not proven.' Here the third aggregate runs live: a seeded lifecycle replay shows issued isn't redeemable, and every illegal redemption is refused."
            >
              <RewardLedger />
            </Plate>
          </Section>

          {/* ── 3b · Translation Map [LIVE] — the honest self-critique closed ─── */}
          <Section id="sec-translation" label="Translation Map — conversion across an anticorruption layer">
            <CinemaIntro clip="mf-translation">
            <Reveal>
              <BeatIntro
                accent="crimson"
                side="right"
                kicker="One word, two meanings"
                body={
                  <>
                    &ldquo;Conversion&rdquo; crosses a real anticorruption layer — Measurement →
                    Incrementality — in running code. Toggle the ACL off and a real number inflates
                    at the wall.
                  </>
                }
                bullets={[
                  "The Conformist path counts would-have-bought-anyway as lift",
                  "The ACL removes the baseline — only caused conversions cross",
                  <>
                    Every number computed live — <span className="font-mono text-text">POST /translation-audit</span>
                  </>,
                ]}
                depth={
                  <>
                    An honest self-critique: the missing-attribute inversion never actually{" "}
                    <em>crosses</em> a boundary — it lives in one function. Here the word{" "}
                    <span className="text-text">&ldquo;conversion&rdquo;</span> genuinely crosses a
                    real anticorruption layer (Measurement → Incrementality) in deterministic code.
                    Toggle the ACL off and a real number inflates at the wall — the leak the ACL
                    exists to stop.
                  </>
                }
              />
            </Reveal>
            </CinemaIntro>
            <Plate
              figure="03b"
              title="The Translation Map"
              tone="crimson"
              caption="LIVE · POST /translation-audit · the one synthetic baseline is labelled; every number computed live, never asserted."
            >
              <TranslationMap offline={offline} />
            </Plate>
          </Section>

          {/* ── 3c · Reconciliation Lane [LIVE] — the cross-aggregate invariant closed ── */}
          <Section id="sec-reconciliation" label="Reconciliation Lane — the cross-aggregate invariant closed">
            <CinemaIntro clip="mf-reconciliation">
            <Reveal>
              <BeatIntro
                accent="amber"
                side="left"
                kicker="Failure, made visible"
                body={
                  <>
                    <span className="text-text">earned ⇒ issued</span> spans two aggregates that can
                    never share a transaction. Same seeded faults, two integration patterns — the
                    difference isn&apos;t fewer failures. It&apos;s that <em>none are silent</em>.
                  </>
                }
                bullets={[
                  "Dual-write: orphaned earns and double-issues leave no trace",
                  "The outbox: every failure retries, then dead-letters in the open",
                  <>
                    The same proof runs on the real fan-out rows — <span className="font-mono text-text">GET /reconciliation</span>
                  </>,
                ]}
                depth={
                  <>
                    No single object can enforce a cross-aggregate rule — Vernon&apos;s rule is
                    eventual consistency plus a <span className="text-text">process manager</span>{" "}
                    that closes the loop. This lane runs the same seeded faults through a naive
                    dual-write and through the repo&apos;s real transactional-outbox pattern, then
                    reconciles both lifecycles earn by earn.
                  </>
                }
              />
            </Reveal>
            </CinemaIntro>
            <Plate
              figure="03c"
              title="The Reconciliation Lane"
              tone="crimson"
              caption="LIVE · POST /reconciliation-audit + GET /reconciliation · proven on seeded faults and on the real fan-out rows."
            >
              <ReconciliationLane offline={offline} />
            </Plate>
          </Section>

          {/* ── 3d · The Unit Wall [LIVE] — whole values close the disease class ── */}
          <Section id="sec-unitwall" label="The Unit Wall — whole values at every seam">
            <CinemaIntro clip="mf-unitwall">
            <Reveal>
              <BeatIntro
                accent="offer-blue"
                side="right"
                kicker="A type at every seam"
                body={
                  <>
                    A conversion was an int, a reward a string, an impression not a type at all — so
                    a cross-context copy type-checked silently. Now the illegal move{" "}
                    <em>raises, live</em>.
                  </>
                }
                bullets={[
                  <>
                    <span className="font-mono text-text">recorded + incremental</span> → UnitMismatchError,
                    performed by the engine
                  </>,
                  "A degraded agent rendering is refused — never blended into the count",
                  <>
                    <span className="font-mono text-text">ConversionKind · RewardStatus · ImpressionFidelity</span> —
                    whole values everywhere
                  </>,
                ]}
                depth={
                  <>
                    The root cause of the whole disease class: the polysemic terms were{" "}
                    <span className="text-text">primitives</span>, so an implicit Conformist was a
                    silent copy the compiler waved through. With the owning context stamped in the
                    type, a cross-context assignment requires a translation — and the backend
                    demonstrates it live: the illegal cross-unit addition actually raises, and a
                    degraded agent rendering is refused at the measurement seam rather than blended
                    into the count.
                  </>
                }
              />
            </Reveal>
            </CinemaIntro>
            <Plate
              figure="03d"
              title="The Unit Wall"
              tone="crimson"
              caption="LIVE · POST /impression-audit · the unit wall is performed by the running engine; the weakest-grounded case of the four, labelled as such."
            >
              <UnitWall offline={offline} />
            </Plate>
          </Section>

          {/* ── 4 · Semantic Change Compiler [LIVE] ─────────────────────────── */}
          <Section id="sec-compiler" label="Semantic Change Compiler">
            <CinemaIntro clip="mf-compiler">
            <Reveal>
              <BeatIntro
                accent="teal"
                side="left"
                kicker="Changes compile to meaning"
                body={
                  <>
                    Threshold, reframed: a <span className="text-text">compiler</span> whose output
                    is meaning. A proposed change compiles into its semantic delta across contexts —
                    and any shift at a seam is flagged.
                  </>
                }
                bullets={[
                  "The static pass flags the inversion before a single session runs",
                  "Blast radius comes only from the Simulator's counterfactual — an honest split",
                  <>
                    Real console, real output — <span className="font-mono text-text">POST /semantic-compile</span>
                  </>,
                ]}
                depth={
                  <>
                    The console compiles a proposed change into its semantic delta across bounded
                    contexts, then flags any change whose <em>meaning</em> shifts across a seam. It
                    calls the real backend and renders only real output — the loading, empty and
                    error states are part of the contract, not an afterthought.
                  </>
                }
              />
            </Reveal>
            </CinemaIntro>
            <Plate
              figure="04"
              title="Semantic Change Compiler"
              tone="teal"
              caption="LIVE · POST /semantic-compile · the static meaning-check lives here; the blast-radius proof belongs to the Simulator."
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
              caption="A failure born, spreading, and contained at a boundary — the visceral argument for fail-closed. Every phase is real text, in order."
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
              segments={[{ text: "Laws of the Moment — " }, { text: "proven live, not asserted.", className: "gradient-text" }]}
            />
            <div className="mt-8">
              <LawsBoard onRun={runLaw} />
            </div>
          </Section>

          {/* ── 7 · Domain Evolution Simulator [LIVE] ───────────────────────── */}
          <Section id="sec-sim" label="Domain Evolution Simulator">
            <CinemaIntro clip="mf-sim">
            <Reveal>
              <BeatIntro
                accent="teal"
                side="right"
                kicker="Run the future first"
                body={
                  <>
                    The same change runs <em>forward</em> through real event-time replay, and its
                    impact ripples across the context map to a deterministic verdict.
                  </>
                }
                bullets={[
                  "Two hundred seeded sessions, bit-for-bit replayable",
                  "Mute a context and its rules — and their failure modes — vanish with it",
                  <>
                    Ephemeral and non-persisting — <span className="font-mono text-text">POST /simulations</span>
                  </>,
                ]}
                depth={
                  <>
                    Muting the Customer context drops its rules — on the trap, that removes the
                    operator flip and the inversion disappears, which is exactly the point: the
                    failure lives in a specific seam, and the simulator lets you watch it appear and
                    disappear by reshaping the model.
                  </>
                }
              />
            </Reveal>
            </CinemaIntro>
            <Plate
              figure="07"
              title="Domain Evolution Simulator"
              tone="teal"
              caption="LIVE · POST /simulations · impact is the highlighted set + the decision diff — never a fabricated percentage."
            >
              <RippleSim offline={offline} trigger={simTrigger} />
            </Plate>
          </Section>

          {/* ── 8 · The Horizon — cinematic future hypotheses (replaces the gallery) ── */}
          <Horizon />
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
