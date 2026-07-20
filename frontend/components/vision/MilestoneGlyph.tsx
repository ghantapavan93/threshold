/* A small animated diagram per roadmap milestone, so each reads as a picture of
   what changes at that horizon. Pure SVG, token colours, the shared sg-* ambient
   loops (globals.css, collapsed under reduced motion). */

import type { ReactElement } from "react";

const TEAL = "var(--c-teal)";
const MUTED = "var(--c-muted)";
const AMBER = "var(--c-amber)";
const OFFER = "var(--c-offer-blue)";

const mono = { fontFamily: "var(--font-mono, monospace)", fontSize: 7 } as const;

/** A — seeded synthetic sessions give way to real, event-time logs. */
function RealDataGlyph() {
  return (
    <svg viewBox="0 0 150 46" className="h-11 w-full" aria-hidden fill="none">
      {[10, 22, 34].map((x) => <circle key={x} cx={x} cy={18} r={3} fill={MUTED} fillOpacity={0.5} />)}
      <path d="M46 18 h14 l-4 -3 m4 3 l-4 3" stroke={MUTED} strokeOpacity={0.6} strokeWidth={1.3} />
      {[72, 84, 96, 108, 120].map((x, i) => (
        <circle key={x} className={i === 2 ? "sg-flip" : undefined} cx={x} cy={18} r={3} fill={TEAL} fillOpacity={0.85} />
      ))}
      <text x={10} y={38} fill={MUTED} style={mono}>synthetic</text>
      <text x={72} y={38} fill={TEAL} style={mono}>real logs</text>
    </svg>
  );
}

/** B — one synchronous lane shards into a parallel worker pool. */
function ScaleGlyph() {
  return (
    <svg viewBox="0 0 150 46" className="h-11 w-full" aria-hidden fill="none">
      <line x1={8} y1={20} x2={48} y2={20} stroke={OFFER} strokeWidth={1.8} strokeOpacity={0.8} />
      <circle cx={48} cy={20} r={3} fill={OFFER} />
      {[8, 20, 32].map((y) => (
        <line key={y} x1={48} y1={20} x2={92} y2={y} stroke={OFFER} strokeOpacity={0.6} strokeWidth={1.2} />
      ))}
      {[8, 20, 32].map((y, i) => (
        <rect key={y} className={i === 1 ? "sg-pulse" : undefined} x={94} y={y - 4} width={18} height={8} rx={2} fill={OFFER} fillOpacity={0.18} stroke={OFFER} strokeOpacity={0.7} />
      ))}
      <line x1={116} y1={20} x2={140} y2={20} stroke={TEAL} strokeWidth={1.8} />
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
      <line x1={30} y1={19} x2={44} y2={19} stroke={MUTED} strokeOpacity={0.5} strokeWidth={1.2} />
      <rect className="sg-pulse" x={44} y={9} width={10} height={20} rx={3} fill={TEAL} fillOpacity={0.85} />
      <line x1={54} y1={19} x2={68} y2={19} stroke={TEAL} strokeOpacity={0.6} strokeWidth={1.2} />
      <rect x={68} y={12} width={30} height={14} rx={3} stroke={TEAL} strokeOpacity={0.6} />
      <text x={72} y={22} fill={TEAL} style={{ ...mono, fontSize: 6 }}>approve</text>
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
        { x: 20, y: 10, l: "OPE" },
        { x: 20, y: 26, l: "drift" },
        { x: 116, y: 18, l: "LLM" },
      ].map((m) => (
        <g key={m.l} className="sg-pulse">
          <rect x={m.x} y={m.y} width={24} height={11} rx={3} stroke={AMBER} strokeOpacity={0.7} strokeDasharray="3 2" />
          <text x={m.x + 3} y={m.y + 8} fill={AMBER} style={{ ...mono, fontSize: 5.5 }}>{m.l}</text>
        </g>
      ))}
      <text x={40} y={42} fill={MUTED} style={mono}>learning at the edges</text>
    </svg>
  );
}

/** E — the same gate now guards loyalty & incrementality surfaces. */
function PlatformGlyph() {
  return (
    <svg viewBox="0 0 150 46" className="h-11 w-full" aria-hidden fill="none">
      <rect className="sg-pulse" x={70} y={8} width={8} height={24} rx={3} fill={OFFER} fillOpacity={0.85} />
      {[
        { y: 12, l: "loyalty" },
        { y: 22, l: "increment." },
      ].map((r) => (
        <g key={r.l}>
          <line x1={90} y1={r.y} x2={140} y2={r.y} stroke={OFFER} strokeOpacity={0.6} strokeWidth={1.3} />
          <text x={92} y={r.y - 2} fill={OFFER} style={{ ...mono, fontSize: 5.5 }}>{r.l}</text>
        </g>
      ))}
      <line x1={8} y1={17} x2={70} y2={17} stroke={MUTED} strokeOpacity={0.45} strokeWidth={1.3} strokeDasharray="3 3" />
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
