"use client";

import Link from "next/link";
import { ClipReveal } from "./anim";

/* ────────────────────────────────────────────────────────────────────────────
   Moment Forge teaser (Builder → /moment-forge). A condensed, self-contained
   context-map motif that echoes the full map's grammar (Core centre, contexts
   around it, labelled seams) without importing the heavy interactive component —
   keeps the Builder bundle light. The single ambient pulse is CSS-only and
   reduced-motion-gated by the global freeze. Original SVG; no external assets.
   ──────────────────────────────────────────────────────────────────────────── */

type Node = { id: string; label: string; x: number; y: number; core?: boolean };

const NODES: Node[] = [
  { id: "core", label: "Decisioning", x: 170, y: 90, core: true },
  { id: "consent", label: "Consent", x: 56, y: 40 },
  { id: "safety", label: "Change-Safety", x: 52, y: 140 },
  { id: "measure", label: "Measurement", x: 288, y: 44 },
  { id: "holdout", label: "Holdout", x: 292, y: 138 },
];

const LINKS: [string, string][] = [
  ["consent", "core"],
  ["safety", "core"],
  ["core", "measure"],
  ["measure", "holdout"],
];

function byId(id: string): Node {
  return NODES.find((n) => n.id === id)!;
}

function MiniMap() {
  return (
    <svg viewBox="0 0 340 180" className="h-auto w-full" aria-hidden>
      {LINKS.map(([a, b], i) => {
        const na = byId(a);
        const nb = byId(b);
        return (
          <line
            key={i}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="var(--c-border-strong)"
            strokeWidth="1"
            strokeDasharray={i % 2 ? "4 5" : undefined}
          />
        );
      })}
      {/* one ambient pulse on a core seam (CSS breathe, reduced-motion frozen) */}
      <circle cx={(byId("consent").x + byId("core").x) / 2} cy={(byId("consent").y + byId("core").y) / 2} r="4" fill="var(--c-teal)" className="animate-pulse-soft" />
      {NODES.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x - (n.core ? 46 : 40)}
            y={n.y - 13}
            width={n.core ? 92 : 80}
            height="26"
            rx="7"
            fill="var(--c-surface)"
            stroke={n.core ? "var(--c-teal)" : "var(--c-border-strong)"}
            strokeWidth={n.core ? 1.5 : 1}
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontSize="10.5"
            fontWeight={n.core ? 700 : 500}
            fill={n.core ? "var(--c-teal)" : "var(--c-text)"}
          >
            {n.core ? "▚ " : ""}
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function MomentForgeTeaser() {
  return (
    <section aria-labelledby="mf-teaser-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <ClipReveal>
        <div className="holo-card grid items-center gap-6 rounded-3xl p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">The model underneath</p>
            <h2 id="mf-teaser-title" className="mt-3 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
              Behind every working feature is a model of the business it protects.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              The Transaction Moment isn&apos;t one model — it&apos;s seven bounded contexts that share a
              vocabulary but not a meaning. Threshold catches the change where that meaning silently shifts
              at a seam.
            </p>
            <div className="mt-6">
              <Link
                href="/moment-forge"
                className="press inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-teal/40 bg-teal/10 px-5 py-2.5 text-sm font-semibold text-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
              >
                Explore the Transaction Moment as a domain <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-base/30 p-4">
            <MiniMap />
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              a condensed bounded-context map
            </p>
          </div>
        </div>
      </ClipReveal>
    </section>
  );
}
