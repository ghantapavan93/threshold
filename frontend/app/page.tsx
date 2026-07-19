"use client";

import { API_BASE } from "@/lib/api";
import { useHealth } from "@/lib/hooks";
import { ConsoleProvider } from "@/components/console-context";
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
import { Reveal } from "@/components/visual/Reveal";

/**
 * A single, honest global banner. If /health cannot be reached the whole app
 * is degraded, so we say so explicitly and never fabricate data downstream.
 */
function BackendBanner() {
  const health = useHealth();
  if (!health.isError) return null;
  return (
    <div
      role="alert"
      className="border-b border-crimson/50 bg-crimson/15 px-4 py-2 text-center text-sm text-crimson sm:px-6"
    >
      <span aria-hidden className="mr-2 font-bold">
        ✕
      </span>
      Backend unreachable at{" "}
      <span className="font-mono">{API_BASE}</span>. Start the Threshold backend
      on :8000, then retry. No data is shown until the API responds.
    </div>
  );
}

export default function Page() {
  return (
    <ConsoleProvider initialBase="V17" initialProposed="V18">
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
