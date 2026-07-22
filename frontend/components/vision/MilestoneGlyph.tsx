/* A small LIVING diagram per roadmap milestone — each plays a short loop of the
   thing it depicts: a particle travels the diagram's route, connectors flow, and
   nodes pulse in sequence. Pure SVG + CSS (offset-path travel, marching dashes,
   staggered pulses), all collapsed to one frame under reduced motion. */

import type { CSSProperties, ReactElement } from "react";

const TEAL = "var(--c-teal)";
const MUTED = "var(--c-muted)";
const AMBER = "var(--c-amber)";
const OFFER = "var(--c-offer-blue)";

const mono = { fontFamily: "var(--font-mono, monospace)", fontSize: 7 } as const;

// a mote that rides a path (offset-path lives in the SVG user coordinate system)
const ride = (d: string): CSSProperties => ({ offsetPath: `path('${d}')` } as CSSProperties);

/** A — seeded synthetic sessions give way to real, event-time logs. */
function RealDataGlyph() {
  return (
    <svg viewBox="0 0 150 46" className="h-11 w-full" aria-hidden fill="none">
      {[10, 22, 34].map((x) => <circle key={x} cx={x} cy={18} r={3} fill={MUTED} fillOpacity={0.5} />)}
      <path className="dg-flow" d="M40 18 H68" stroke={MUTED} strokeOpacity={0.6} strokeWidth={1.3} />
      <path d="M62 15 l6 3 l-6 3" stroke={MUTED} strokeOpacity={0.6} strokeWidth={1.3} />
      {[72, 84, 96, 108, 120].map((x, i) => (
        <circle key={x} className={`dg-seq-${(i % 3) + 1}`} cx={x} cy={18} r={3} fill={TEAL} fillOpacity={0.85} />
      ))}
      <circle className="dg-dot" r={2.4} fill={TEAL} style={ride("M10 18 H120")} />
      <text x={10} y={38} fill={MUTED} style={mono}>synthetic</text>
      <text x={72} y={38} fill={TEAL} style={mono}>real logs</text>
    </svg>
  );
}

/** B — one synchronous lane shards into a parallel worker pool. */
function ScaleGlyph() {
  return (
    <svg viewBox="0 0 150 46" className="h-11 w-full" aria-hidden fill="none">
      <path className="dg-flow" d="M8 20 H48" stroke={OFFER} strokeWidth={1.8} strokeOpacity={0.8} />
      <circle cx={48} cy={20} r={3} fill={OFFER} />
      {[8, 20, 32].map((y) => (
        <path key={y} className="dg-flow" d={`M48 20 L92 ${y}`} stroke={OFFER} strokeOpacity={0.55} strokeWidth={1.2} />
      ))}
      {[8, 20, 32].map((y, i) => (
        <rect key={y} className={`dg-seq-${i + 1}`} x={94} y={y - 4} width={18} height={8} rx={2} fill={OFFER} fillOpacity={0.18} stroke={OFFER} strokeOpacity={0.7} />
      ))}
      <path className="dg-flow" d="M116 20 H140" stroke={TEAL} strokeWidth={1.8} />
      <circle className="dg-dot" r={2.4} fill={OFFER} style={ride("M8 20 H48 L94 20 H140")} />
      <text x={8} y={40} fill={MUTED} style={mono}>sync → sharded async</text>
    </svg>
  );
}

/** C — the gate sits in the deploy pipeline, before the approval queue. */
function DeployGateGlyph() {
  return (
    <svg viewBox="0 0 150 46" className="h-11 w-full" aria-hidden fill="none">
      <rect x={8} y={12} width={22} height={14} rx={3} stroke={MUTED} strokeOpacity={0.5} />
      <text x={12} y={22} fill={MUTED} style={{ ...mono, fontSize: 6 }}>edit</text>
      <path className="dg-flow" d="M30 19 H44" stroke={MUTED} strokeOpacity={0.55} strokeWidth={1.2} />
      <rect className="dg-seq-2" x={44} y={9} width={10} height={20} rx={3} fill={TEAL} fillOpacity={0.85} />
      <path className="dg-flow" d="M54 19 H68" stroke={TEAL} strokeOpacity={0.6} strokeWidth={1.2} />
      <rect x={68} y={12} width={30} height={14} rx={3} stroke={TEAL} strokeOpacity={0.6} />
      <text x={72} y={22} fill={TEAL} style={{ ...mono, fontSize: 6 }}>approve</text>
      <circle className="dg-dot" r={2.4} fill={TEAL} style={ride("M8 19 H98")} />
      <text x={38} y={40} fill={MUTED} style={mono}>gate before the queue</text>
    </svg>
  );
}

/** D — the deterministic core stays fixed; learning attaches at the edges. */
function PeripheryGlyph() {
  return (
    <svg viewBox="0 0 150 46" className="h-11 w-full" aria-hidden fill="none">
      <rect x={60} y={10} width={30} height={18} rx={4} fill={TEAL} fillOpacity={0.12} stroke={TEAL} strokeWidth={1.6} />
      <text x={65} y={22} fill={TEAL} style={{ ...mono, fontSize: 6 }}>core</text>
      {[
        { x: 20, y: 10, l: "OPE", d: "M44 15 H60", seq: 1 },
        { x: 20, y: 26, l: "drift", d: "M44 31 L60 24", seq: 2 },
        { x: 116, y: 18, l: "LLM", d: "M116 23 H90", seq: 3 },
      ].map((m) => (
        <g key={m.l}>
          <path className="dg-flow" d={m.d} stroke={AMBER} strokeOpacity={0.5} strokeWidth={1} />
          <g className={`dg-seq-${m.seq}`}>
            <rect x={m.x} y={m.y} width={24} height={11} rx={3} stroke={AMBER} strokeOpacity={0.7} strokeDasharray="3 2" />
            <text x={m.x + 3} y={m.y + 8} fill={AMBER} style={{ ...mono, fontSize: 5.5 }}>{m.l}</text>
          </g>
        </g>
      ))}
      <circle className="dg-dot dg-slow" r={2} fill={AMBER} style={ride("M32 15 H60")} />
      <circle className="dg-dot dg-slow dg-delay" r={2} fill={AMBER} style={ride("M116 23 H90")} />
      <text x={40} y={42} fill={MUTED} style={mono}>learning at the edges</text>
    </svg>
  );
}

/** E — the same gate now guards loyalty & incrementality surfaces. */
function PlatformGlyph() {
  return (
    <svg viewBox="0 0 150 46" className="h-11 w-full" aria-hidden fill="none">
      <rect className="dg-seq-1" x={70} y={8} width={8} height={24} rx={3} fill={OFFER} fillOpacity={0.85} />
      {[
        { y: 12, l: "loyalty" },
        { y: 22, l: "increment." },
      ].map((r) => (
        <g key={r.l}>
          <path className="dg-flow" d={`M90 ${r.y} H140`} stroke={OFFER} strokeOpacity={0.6} strokeWidth={1.3} />
          <text x={92} y={r.y - 2} fill={OFFER} style={{ ...mono, fontSize: 5.5 }}>{r.l}</text>
        </g>
      ))}
      <path className="dg-flow" d="M8 17 H70" stroke={MUTED} strokeOpacity={0.45} strokeWidth={1.3} />
      <circle className="dg-dot" r={2.4} fill={OFFER} style={ride("M8 17 H70 L90 12")} />
      <circle className="dg-dot dg-delay" r={2.4} fill={OFFER} style={ride("M8 17 H70 L90 22")} />
      <text x={8} y={42} fill={MUTED} style={mono}>same gate, new surfaces</text>
    </svg>
  );
}

const GLYPHS: Record<string, () => ReactElement> = {
  A: RealDataGlyph,
  B: ScaleGlyph,
  C: DeployGateGlyph,
  D: PeripheryGlyph,
  E: PlatformGlyph,
};

export function MilestoneGlyph({ id }: { id: string }) {
  const G = GLYPHS[id];
  if (!G) return null;
  return (
    <div className="hidden w-44 shrink-0 rounded-lg border border-border/40 bg-base/40 px-2 py-1 sm:block">
      <G />
    </div>
  );
}
