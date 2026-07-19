"use client";

import { StaggerGroup } from "@/components/builder/anim";

/* ────────────────────────────────────────────────────────────────────────────
   Context Fracture (Fig. 05). Shipped as a six-panel storyboard filmstrip —
   the designed reduced-motion layout, promoted to primary so there is no
   scroll-jacking or blank-pin risk. Each phase is real text + an original SVG
   frame, in order; the containment beat (05) is the payoff. Origin-aware: the
   ripple emanates from the epicenter; it stops at the teal containment seam.
   ──────────────────────────────────────────────────────────────────────────── */

type Phase = {
  n: string;
  name: string;
  caption: string;
  epicenter: string; // color
  ripple: number; // 0..1 spread
  contained: boolean;
};

const PHASES: Phase[] = [
  { n: "01", name: "stable", caption: "Nodes calm. One core node holds steady; the boundary seam is a hairline.", epicenter: "var(--c-teal)", ripple: 0, contained: false },
  { n: "02", name: "stress", caption: "The operator flip lands. A hairline crack begins to draw from the epicenter; its edges vibrate amber.", epicenter: "var(--c-amber)", ripple: 0.15, contained: false },
  { n: "03", name: "fracture", caption: "The crack splits an edge. The epicenter goes crimson; a shock ripple expands outward from the failing node.", epicenter: "var(--c-crimson)", ripple: 0.45, contained: false },
  { n: "04", name: "propagate", caption: "The ripple races toward neighbours along real edges; downstream nodes flash amber — at risk.", epicenter: "var(--c-crimson)", ripple: 0.8, contained: false },
  { n: "05", name: "contain", caption: "The anticorruption layer lights teal. The ripple stops at the seam — the containment line holds. Beyond it, nodes stay calm.", epicenter: "var(--c-crimson)", ripple: 0.8, contained: true },
  { n: "06", name: "recovered", caption: "Crimson drains to steady. Contained at the boundary: No Offer Rendered rather than a wrong one.", epicenter: "var(--c-teal)", ripple: 0, contained: true },
];

function Frame({ p }: { p: Phase }) {
  const nodes = [
    { x: 34, y: 40 }, // epicenter
    { x: 78, y: 26 },
    { x: 78, y: 58 },
    { x: 118, y: 42 }, // beyond the seam
  ];
  return (
    <svg viewBox="0 0 150 84" className="h-auto w-full" aria-hidden>
      {/* edges */}
      <line x1={nodes[0]!.x} y1={nodes[0]!.y} x2={nodes[1]!.x} y2={nodes[1]!.y} stroke="var(--c-border-strong)" strokeWidth="1" />
      <line x1={nodes[0]!.x} y1={nodes[0]!.y} x2={nodes[2]!.x} y2={nodes[2]!.y} stroke="var(--c-border-strong)" strokeWidth="1" />
      {/* containment seam */}
      <line
        x1="98"
        y1="12"
        x2="98"
        y2="72"
        stroke={p.contained ? "var(--c-teal)" : "var(--c-border)"}
        strokeWidth={p.contained ? 2 : 1}
        strokeDasharray="3 4"
        opacity={p.contained ? 1 : 0.5}
      />
      {/* ripple from epicenter */}
      {p.ripple > 0 && (
        <circle cx={nodes[0]!.x} cy={nodes[0]!.y} r={8 + p.ripple * 60} fill="none" stroke={p.epicenter} strokeOpacity={0.4} strokeWidth="1.5" />
      )}
      {/* crack */}
      {p.ripple > 0.1 && !p.contained && (
        <path d={`M${nodes[0]!.x} ${nodes[0]!.y} l${10 + p.ripple * 30} ${-4}`} stroke={p.epicenter} strokeWidth="1" strokeDasharray="2 2" />
      )}
      {/* nodes */}
      {nodes.map((nd, i) => {
        const isEpi = i === 0;
        const beyond = i === 3;
        const atRisk = (i === 1 || i === 2) && p.ripple >= 0.45 && !p.contained;
        const fill = isEpi ? p.epicenter : beyond ? "var(--c-teal)" : atRisk ? "var(--c-amber)" : "var(--c-muted)";
        return <circle key={i} cx={nd.x} cy={nd.y} r={isEpi ? 6 : 5} fill={fill} fillOpacity={0.85} />;
      })}
    </svg>
  );
}

export function FractureScene() {
  return (
    <div>
      <div className="scroll-x -mx-1 px-1">
        <StaggerGroup className="grid min-w-[720px] grid-cols-6 gap-3" stagger={0.08}>
          {PHASES.map((p) => (
            <figure
              key={p.n}
              className="rounded-xl border p-3"
              style={{ borderColor: p.name === "contain" || p.name === "recovered" ? "var(--c-teal)" : p.name === "fracture" || p.name === "propagate" ? "var(--c-crimson)" : "var(--c-border)" }}
            >
              <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                <span>{p.n} / 06</span>
                <span className="uppercase tracking-[0.12em]" style={{ color: p.epicenter }}>{p.name}</span>
              </div>
              <div className="mt-2 rounded-lg bg-base/40 p-1">
                <Frame p={p} />
              </div>
              <figcaption className="mt-2 text-[11px] leading-relaxed text-muted">{p.caption}</figcaption>
            </figure>
          ))}
        </StaggerGroup>
      </div>
      <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
        A Context Fracture: a change valid inside its authoring context changes meaning as it crosses a
        boundary with no anticorruption layer. Threshold is the ACL — it refuses the translations that
        change meaning.
      </p>
    </div>
  );
}
