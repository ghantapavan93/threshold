"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { StaggerGroup } from "@/components/builder/anim";
import { HonestyTag } from "@/components/builder/depth";
import {
  FailClosedLaneMotif,
  IntegrityShield,
  SilentWideningDiagram,
  TransactionMomentMotif,
} from "@/components/visual/illustrations";
import { EVIDENCE, FUTURE_COMPACT, FUTURE_FEATURED, LAWS, type Law } from "./content";

function Motif({ kind }: { kind: Law["motif"] }) {
  const cls = "h-16 w-auto";
  if (kind === "failclosed") return <FailClosedLaneMotif className={cls} />;
  if (kind === "shield") return <IntegrityShield className="h-16 w-auto" />;
  if (kind === "widening") return <SilentWideningDiagram className={cls} />;
  return <TransactionMomentMotif className={cls} />;
}

// ── Laws of the Moment — numbered codex ──────────────────────────────────────
export function LawGallery() {
  return (
    <StaggerGroup as="ol" className="grid list-none gap-4 md:grid-cols-2" stagger={0.05}>
      {LAWS.map((l) => (
        <li key={l.n}>
          <article className="holo-card relative h-full overflow-hidden rounded-2xl p-5">
            <span aria-hidden className="pointer-events-none absolute -right-2 -top-3 font-mono text-6xl font-bold text-text/[0.06]">
              {l.n}
            </span>
            <div className="flex items-start justify-between gap-3">
              <h3 className="max-w-[70%] text-base font-semibold tracking-tight text-text">
                <span className="sr-only">Law {l.n}: </span>
                {l.title}
              </h3>
              <div className="shrink-0 opacity-80">
                <Motif kind={l.motif} />
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{l.body}</p>
          </article>
        </li>
      ))}
    </StaggerGroup>
  );
}

// ── Future bounded-context hypotheses ────────────────────────────────────────
export function FutureGallery() {
  return (
    <div>
      <StaggerGroup className="grid gap-4 lg:grid-cols-3" stagger={0.08}>
        {FUTURE_FEATURED.map((h) => (
          <article key={h.name} className="holo-card flex h-full flex-col rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold leading-snug text-text">{h.name}</h3>
              <HonestyTag kind="HYPOTHESIS" />
            </div>
            {h.reframe ? (
              <p className="mt-3 text-sm font-medium italic leading-relaxed text-teal">{h.reframe}</p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-muted">{h.premise}</p>
            <p className="mt-3 border-l border-teal/40 pl-3 text-xs leading-relaxed text-muted">
              <span className="font-semibold text-teal">Verified signal: </span>
              {h.signal}
            </p>
            <div className="mt-4 rounded-lg border border-amber/25 bg-amber/[0.06] p-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-amber">Honest risk</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{h.risk}</p>
            </div>
          </article>
        ))}
      </StaggerGroup>

      <StaggerGroup className="mt-4 grid gap-4 sm:grid-cols-2" stagger={0.05}>
        {FUTURE_COMPACT.map((h) => (
          <article key={h.name} className="glass flex h-full flex-col rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold leading-snug text-text">{h.name}</h3>
              <HonestyTag kind="HYPOTHESIS" />
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{h.premise}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              <span className="font-semibold text-amber">Risk: </span>
              {h.risk}
            </p>
          </article>
        ))}
      </StaggerGroup>
    </div>
  );
}

// ── Implementation-evidence cross-links ──────────────────────────────────────
function CrossLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="press inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
    >
      {children}
    </Link>
  );
}

export function EvidenceIndex() {
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border/70">
        <div className="scroll-x">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-surface-2/70 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Law · context · pattern</th>
                <th className="px-4 py-3 font-semibold">Where it&apos;s implemented</th>
                <th className="px-4 py-3 font-semibold">State</th>
              </tr>
            </thead>
            <tbody>
              {EVIDENCE.map((e) => (
                <tr key={e.subject} className="border-t border-border/60 align-top">
                  <td className="px-4 py-3 text-text">{e.subject}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{e.where}</td>
                  <td className="px-4 py-3">
                    <HonestyTag kind={e.kind} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <CrossLink href="/">This model is executable → Run the policy replay in Threshold →</CrossLink>
        <CrossLink href="/builder">See how I&apos;d own the role → Builder →</CrossLink>
        <CrossLink href="/vision">Where the platform is heading → Vision →</CrossLink>
      </div>
    </div>
  );
}
