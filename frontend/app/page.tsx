"use client";

import { RECORDED_DESCRIPTION } from "@/lib/replay-fixture";
import { ConsoleProvider, useConsole } from "@/components/console-context";
import { WalkthroughProvider } from "@/components/walkthrough";
import { PipelineRail } from "@/components/PipelineRail";
import { StageSpotlight } from "@/components/StageSpotlight";
import { ColdOpen } from "@/components/ColdOpen";
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
import { Reveal } from "@/components/visual/Reveal";

/**
 * A single, honest global banner. When /health can't be reached the Console
 * runs on a recorded replay instead of a live one — so the page is never an
 * empty flagship — and this banner states plainly that the data is recorded,
 * never a live run. Nothing downstream is fabricated: the recording is a real
 * captured engine payload.
 */
function BackendBanner() {
  const { recorded } = useConsole();
  // Only surface a banner once a run has ACTUALLY fallen back to recorded data —
  // honest provenance, in context. Live/offline status is the header chip's job, so
  // a backend that's merely cold-starting (Render can nap after idle) never trips an
  // alarming top banner; it just reads "checking" until it wakes.
  if (!recorded) return null;
  return (
    <div
      role="status"
      className="border-b border-amber/50 bg-amber/15 px-4 py-2 text-center text-sm text-amber sm:px-6"
    >
      <span aria-hidden className="mr-2 font-bold">
        ◆
      </span>
      Showing a <strong className="font-semibold">recorded</strong> run ({RECORDED_DESCRIPTION}) — the live
      backend wasn&apos;t reachable just now (it may be waking from idle). Every value below is a real captured
      engine payload; press Play again once the header shows{" "}
      <span className="font-mono">LIVE</span>.
    </div>
  );
}

export default function Page() {
  return (
    <ConsoleProvider initialBase="V17" initialProposed="V18">
     <WalkthroughProvider>
      <ColdOpen />
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
              <StageSpotlight id="scenario-library">
                <ScenarioLibrary />
              </StageSpotlight>
            </Reveal>
            <Reveal className="scroll-mt-24">
              <div id="diff">
                <StageSpotlight id="policy-diff">
                  <PolicyDiffSection />
                </StageSpotlight>
              </div>
            </Reveal>
            <Reveal className="scroll-mt-24">
              <div id="heatmap">
                <StageSpotlight id="constraint-heatmap">
                  <ConstraintHeatmap />
                </StageSpotlight>
              </div>
            </Reveal>
            <Reveal className="scroll-mt-24">
              <div id="replay">
                <StageSpotlight id="policy-diff-replay">
                  <PolicyDiffReplay />
                </StageSpotlight>
              </div>
            </Reveal>
            <Reveal>
              <StageSpotlight id="fail-closed-proof">
                <FailClosedProofSection />
              </StageSpotlight>
            </Reveal>
            <Reveal>
              <StageSpotlight id="conversion-integrity">
                <ConversionIntegrity />
              </StageSpotlight>
            </Reveal>
            <Reveal>
              <StageSpotlight id="fanout-outbox">
                <FanoutOutbox />
              </StageSpotlight>
            </Reveal>
            <Reveal className="scroll-mt-24">
              <div id="verdict">
                <StageSpotlight id="release-verdict">
                  <ReleaseVerdict />
                </StageSpotlight>
              </div>
            </Reveal>
            <Reveal>
              <StageSpotlight id="evidence">
                <EvidenceSection />
              </StageSpotlight>
            </Reveal>
            <Reveal>
              <StageSpotlight id="byod">
                <BringYourOwnData />
              </StageSpotlight>
            </Reveal>
            <Reveal>
              <OffPolicyEstimate />
            </Reveal>
          </main>
          <footer className="border-t border-border/70 px-4 py-8 pb-28 text-center text-xs text-muted sm:px-6">
            <span className="text-shimmer font-semibold">THRESHOLD</span> · Policy Change Safety Gate — a safety tool, not a launch
            approval. A positive verdict is only eligibility for a controlled
            online holdout.
          </footer>
        </div>
      </div>
      <PipelineRail />
     </WalkthroughProvider>
    </ConsoleProvider>
  );
}
