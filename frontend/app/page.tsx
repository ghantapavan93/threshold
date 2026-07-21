"use client";

import { API_BASE } from "@/lib/api";
import { useHealth } from "@/lib/hooks";
import { RECORDED_DESCRIPTION } from "@/lib/replay-fixture";
import { ConsoleProvider, useConsole } from "@/components/console-context";
import { Intro } from "@/components/Intro";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ScenarioLibrary } from "@/components/ScenarioLibrary";
import { PolicyDiffSection } from "@/components/PolicyDiff";
import { ConstraintHeatmap } from "@/components/ConstraintHeatmap";
import { PolicyDiffReplay } from "@/components/PolicyDiffReplay";
import { FailClosedProofSection } from "@/components/FailClosedProof";
import { ConversionIntegrity } from "@/components/ConversionIntegrity";
import { FanoutOutbox } from "@/components/FanoutOutbox";
import { ReleaseVerdict } from "@/components/ReleaseVerdict";
import { EvidenceSection } from "@/components/EvidenceSection";
import { BringYourOwnData } from "@/components/BringYourOwnData";
import { OffPolicyEstimate } from "@/components/OffPolicyEstimate";
import { CounterexampleForge } from "@/components/CounterexampleForge";
import { TrustBudget } from "@/components/TrustBudget";
import { PassportGate } from "@/components/PassportGate";
import { HardQuestions } from "@/components/HardQuestions";
import { Reveal } from "@/components/visual/Reveal";

/**
 * A single, honest global banner. When /health can't be reached the Console
 * runs on a recorded replay instead of a live one — so the page is never an
 * empty flagship — and this banner states plainly that the data is recorded,
 * never a live run. Nothing downstream is fabricated: the recording is a real
 * captured engine payload.
 */
function BackendBanner() {
  const health = useHealth();
  const { recorded } = useConsole();
  // Show once we're certainly on recorded data (the fallback fired), or as an
  // early warning the moment the health probe reports the API is down.
  if (!recorded && !health.isError) return null;
  return (
    <div
      role="status"
      className="border-b border-amber/50 bg-amber/15 px-4 py-2 text-center text-sm text-amber sm:px-6"
    >
      <span aria-hidden className="mr-2 font-bold">
        ◆
      </span>
      The Threshold API isn&apos;t reachable at{" "}
      <span className="font-mono">{API_BASE}</span>.{" "}
      {recorded ? (
        <>
          Showing a <strong className="font-semibold">recorded</strong> run (
          {RECORDED_DESCRIPTION}) — not live. Start the backend on :8000 for a
          live replay.
        </>
      ) : (
        <>
          A run here will replay a <strong className="font-semibold">recorded</strong>{" "}
          capture ({RECORDED_DESCRIPTION}). Start the backend on :8000 for a live
          replay.
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ConsoleProvider initialBase="V17" initialProposed="V18">
      <Intro />
      <div className="relative min-h-screen text-text">
        <div className="aurora-threshold" aria-hidden />
        <div className="relative z-10">
          <Header />
          <BackendBanner />
          <Hero />
          <main
            id="main"
            className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6 lg:py-14"
          >
            <Reveal>
              <ScenarioLibrary />
            </Reveal>
            <Reveal className="scroll-mt-24">
              <div id="diff">
                <PolicyDiffSection />
              </div>
            </Reveal>
            <Reveal className="scroll-mt-24">
              <div id="heatmap">
                <ConstraintHeatmap />
              </div>
            </Reveal>
            <Reveal className="scroll-mt-24">
              <div id="replay">
                <PolicyDiffReplay />
              </div>
            </Reveal>
            <Reveal>
              <FailClosedProofSection />
            </Reveal>
            <Reveal>
              <ConversionIntegrity />
            </Reveal>
            <Reveal>
              <FanoutOutbox />
            </Reveal>
            <Reveal className="scroll-mt-24">
              <div id="verdict">
                <ReleaseVerdict />
              </div>
            </Reveal>
            <Reveal>
              <EvidenceSection />
            </Reveal>
            <Reveal>
              <BringYourOwnData />
            </Reveal>
            <Reveal>
              <OffPolicyEstimate />
            </Reveal>
            <Reveal>
              <CounterexampleForge />
            </Reveal>
            <Reveal>
              <TrustBudget />
            </Reveal>
            <Reveal>
              <PassportGate />
            </Reveal>
            <Reveal>
              <HardQuestions />
            </Reveal>
          </main>
          <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
            THRESHOLD · Policy Change Safety Gate — a safety tool, not a launch
            approval. A positive verdict is only eligibility for a controlled
            online holdout.
          </footer>
        </div>
      </div>
    </ConsoleProvider>
  );
}
