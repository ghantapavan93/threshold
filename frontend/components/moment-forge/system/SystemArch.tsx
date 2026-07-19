"use client";

import Link from "next/link";
import { MaskText, Reveal } from "@/components/builder/anim";
import {
  BlueprintSubstrate,
  Eyebrow,
  MomentNav,
  Plate,
  PlateRail,
  type RailItem,
} from "@/components/moment-forge/chassis";
import { C4Stage } from "./C4Stage";
import { PathAnimator } from "./PathAnimator";
import { Observability } from "./Observability";
import { ScaleToggle } from "./ScaleToggle";

/* ────────────────────────────────────────────────────────────────────────────
   Moment Forge — Volume II · The System. The technical architecture that pairs
   with the domain model: a C4 zoom, the two live paths, the observability plane,
   and the honest scaling story. Reuses the monograph chassis; nothing fabricated;
   every latency is a budget; SHIPPED vs DESIGNED on every node/edge.
   ──────────────────────────────────────────────────────────────────────────── */

const SYSTEM_RAIL: RailItem[] = [
  { id: "sec-c4", label: "C4 architecture", fig: "10" },
  { id: "sec-paths", label: "Live paths", fig: "11" },
  { id: "sec-obs", label: "Observability", fig: "12" },
  { id: "sec-scale", label: "Scaling story", fig: "13" },
];

function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-label={label} className="scroll-mt-24 py-14 sm:py-20">
      {children}
    </section>
  );
}

export function SystemArch() {
  return (
    <div className="relative min-h-screen text-text">
      <BlueprintSubstrate />
      <div className="relative z-10">
        <MomentNav volume="II" />
        <PlateRail items={SYSTEM_RAIL} />
        <main id="main" className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Hero */}
          <section aria-label="Volume II introduction" className="py-14 sm:py-20">
            <Eyebrow>Volume II · The System</Eyebrow>
            <MaskText
              as="h1"
              className="mt-3 max-w-3xl text-3xl font-bold leading-[1.05] tracking-tightest sm:text-4xl lg:text-5xl"
              segments={[
                { text: "The domain model, " },
                { text: "made of real running code.", className: "gradient-text" },
              ]}
            />
            <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted">
              Volume I modelled the Transaction Moment as a domain. This is the technical architecture underneath —
              a progressive C4 zoom, the two live request paths, how you&apos;d debug one request in production, and the
              honest line between what&apos;s <span className="text-teal">shipped</span> and what&apos;s{" "}
              <span className="text-amber">designed</span>. Every node maps to a real file or is labelled DESIGNED; every
              latency is a budget, never a measured number.
            </p>
            <div className="mt-8">
              <Link
                href="/moment-forge"
                className="press inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
              >
                <span aria-hidden>←</span> Back to Volume I · The Domain
              </Link>
            </div>
          </section>

          <Section id="sec-c4" label="C4 architecture">
            <Plate
              figure="10"
              title="System architecture — a C4 zoom"
              tone="teal"
              caption="Click Threshold to zoom to containers, the FastAPI app to zoom to components. Escape zooms out. Each node is tagged SHIPPED / DESIGNED / MODELED (colour + glyph + text). At Level 3, the determinism boundary is drawn — click it. Reduced-motion → three stacked static figures."
            >
              <C4Stage />
            </Plate>
          </Section>

          <Section id="sec-paths" label="The two live paths">
            <Reveal>
              <p className="mb-4 max-w-[62ch] text-base leading-relaxed text-muted">
                Two routes over the same vocabulary: the <span className="text-text">synchronous</span> Moment Forge
                decision (read-only, non-persisting) and the <span className="text-text">asynchronous</span> authoritative
                replay job with its transactional outbox.
              </p>
            </Reveal>
            <Plate
              figure="11"
              title="The two live paths"
              tone="teal"
              caption="Path A: frontend → FastAPI → read-only load_policy → pure core → Zod-validated JSON. Path B: idempotent replay-job → job row + outbox insert in one txn → worker drain with backoff+jitter, SKIP-LOCKED, dead-letter after 5."
            >
              <PathAnimator />
            </Plate>
          </Section>

          <Section id="sec-obs" label="The observability plane">
            <Plate
              figure="12"
              title="The observability plane"
              tone="amber"
              caption="A cross-section, not a dashboard: real spans and named instruments (no invented durations or values), the structured-log schema, and the request-id thread from the frontend header to the error envelope and back."
            >
              <Observability />
            </Plate>
          </Section>

          <Section id="sec-scale" label="The honest scaling story">
            <Plate
              figure="13"
              title="The honest scaling story"
              tone="teal"
              caption="The same architecture under a SHIPPED ⇄ DESIGNED switch. The edges change — Kafka, a read replica, a batched worker pool — the core does not. No fabricated throughput; only Rokt's public figures, attributed."
            >
              <ScaleToggle />
            </Plate>
          </Section>
        </main>

        <footer className="border-t border-border/70 px-4 py-8 text-center text-xs text-muted sm:px-6">
          THRESHOLD · Moment Forge · Volume II — every node maps to a real repo file or is labelled DESIGNED; every latency
          is a budget/goal, never measured. SKIP-LOCKED concurrency is Postgres-only; the OTel Collector hop is DESIGNED.
        </footer>
      </div>
    </div>
  );
}
