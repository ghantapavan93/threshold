/* A small animated diagram per Moment Forge figure, shown in the plate header so
   each DDD concept has a picture at a glance above its (often interactive) body.
   Pure SVG, token colours, the shared sg-* ambient loops (globals.css, collapsed
   under reduced motion). Keyed by the plate's figure number; returns null for any
   figure without a glyph. */

import type { ReactElement } from "react";

const CRIMSON = "var(--c-crimson)";
const TEAL = "var(--c-teal)";
const MUTED = "var(--c-muted)";
const AMBER = "var(--c-amber)";
const OFFER = "var(--c-offer-blue)";

const mono = { fontFamily: "var(--font-mono, monospace)", fontSize: 6.5 } as const;
const cls = "h-16 w-full";

/** 02 — several bounded contexts, one moment. */
function MapGlyph() {
  const boxes = [
    { x: 8, y: 8, c: TEAL },
    { x: 58, y: 6, c: OFFER },
    { x: 108, y: 10, c: AMBER },
    { x: 34, y: 24, c: OFFER },
    { x: 84, y: 24, c: TEAL },
  ];
  return (
    <svg viewBox="0 0 150 44" className={cls} aria-hidden fill="none">
      <line x1={20} y1={14} x2={70} y2={12} stroke={MUTED} strokeOpacity={0.4} />
      <line x1={70} y1={12} x2={120} y2={16} stroke={MUTED} strokeOpacity={0.4} />
      <line x1={46} y1={20} x2={96} y2={20} stroke={MUTED} strokeOpacity={0.4} />
      {boxes.map((b, i) => (
        <rect key={i} className={i === 4 ? "sg-pulse" : undefined} x={b.x} y={b.y} width={22} height={11} rx={2} fill={b.c} fillOpacity={0.14} stroke={b.c} strokeOpacity={0.7} />
      ))}
      <text x={8} y={41} fill={MUTED} style={mono}>many models, one moment</text>
    </svg>
  );
}

/** 03 — one word, two meanings across a seam. */
function LensGlyph() {
  return (
    <svg viewBox="0 0 150 44" className={cls} aria-hidden fill="none">
      <text x={8} y={16} fill={MUTED} style={{ ...mono, fontSize: 9 }}>&quot;conversion&quot;</text>
      <path d="M70 13 h14 l0 -6 M84 13 l0 12" stroke={MUTED} strokeOpacity={0.5} />
      <text className="sg-blink" x={92} y={11} fill={TEAL} style={mono}>a booking</text>
      <text x={92} y={22} fill={CRIMSON} style={mono}>a click</text>
      <text x={8} y={40} fill={MUTED} style={mono}>one word, two meanings</text>
    </svg>
  );
}

/** 03b — a value crosses an anticorruption layer, translated. */
function TranslateGlyph() {
  return (
    <svg viewBox="0 0 150 44" className={cls} aria-hidden fill="none">
      <text x={8} y={20} fill={MUTED} style={{ ...mono, fontSize: 8 }}>raw</text>
      <line x1={30} y1={17} x2={62} y2={17} stroke={MUTED} strokeOpacity={0.5} className="sg-dash" strokeDasharray="3 3" />
      <rect className="sg-pulse" x={64} y={6} width={8} height={24} rx={2} fill={TEAL} fillOpacity={0.85} />
      <line x1={74} y1={17} x2={104} y2={17} stroke={TEAL} strokeOpacity={0.6} />
      <text x={106} y={20} fill={TEAL} style={{ ...mono, fontSize: 8 }}>clean</text>
      <text x={8} y={40} fill={MUTED} style={mono}>translated at the seam</text>
    </svg>
  );
}

/** 03c — two aggregates reconcile to one closed invariant. */
function ReconcileGlyph() {
  return (
    <svg viewBox="0 0 150 44" className={cls} aria-hidden fill="none">
      <line x1={8} y1={10} x2={70} y2={18} stroke={OFFER} strokeOpacity={0.6} strokeWidth={1.4} />
      <line x1={8} y1={26} x2={70} y2={18} stroke={AMBER} strokeOpacity={0.6} strokeWidth={1.4} />
      <line x1={70} y1={18} x2={104} y2={18} stroke={TEAL} strokeWidth={1.6} />
      <g className="sg-pulse">
        <circle cx={116} cy={18} r={8} stroke={TEAL} strokeWidth={1.6} />
        <path d="M111 18 l3.5 3.5 l6 -7" stroke={TEAL} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x={8} y={40} fill={MUTED} style={mono}>invariant closed</text>
    </svg>
  );
}

/** 03d — whole values only; no fractional leak at the seam. */
function UnitGlyph() {
  return (
    <svg viewBox="0 0 150 44" className={cls} aria-hidden fill="none">
      <text x={10} y={20} fill={TEAL} style={{ ...mono, fontSize: 9 }}>100¢</text>
      <text x={48} y={20} fill={MUTED} style={{ ...mono, fontSize: 9 }}>=</text>
      <text x={62} y={20} fill={TEAL} style={{ ...mono, fontSize: 9 }}>$1.00</text>
      <rect className="sg-pulse" x={104} y={7} width={7} height={22} rx={2} fill={CRIMSON} fillOpacity={0.8} />
      <text x={116} y={20} fill={CRIMSON} style={{ ...mono, fontSize: 9 }}>½¢</text>
      <line x1={116} y1={22} x2={132} y2={12} stroke={CRIMSON} strokeWidth={1.4} />
      <text x={8} y={40} fill={MUTED} style={mono}>whole values only</text>
    </svg>
  );
}

/** 04 — a change compiles into its meaning delta. */
function CompileGlyph() {
  return (
    <svg viewBox="0 0 150 44" className={cls} aria-hidden fill="none">
      <rect x={8} y={9} width={30} height={16} rx={3} stroke={MUTED} strokeOpacity={0.5} />
      <text x={12} y={20} fill={MUTED} style={{ ...mono, fontSize: 7 }}>V18</text>
      <path d="M42 17 h16 l-4 -3 m4 3 l-4 3" stroke={OFFER} strokeOpacity={0.7} />
      <rect className="sg-pulse" x={64} y={9} width={34} height={16} rx={3} fill={CRIMSON} fillOpacity={0.12} stroke={CRIMSON} strokeOpacity={0.7} />
      <text x={68} y={20} fill={CRIMSON} style={{ ...mono, fontSize: 7 }}>Δmeaning</text>
      <text x={8} y={40} fill={MUTED} style={mono}>change → meaning</text>
    </svg>
  );
}

/** 05 — a fault contained at the boundary, fail-closed. */
function FractureGlyph() {
  return (
    <svg viewBox="0 0 150 44" className={cls} aria-hidden fill="none">
      <rect x={8} y={6} width={134} height={24} rx={4} stroke={TEAL} strokeOpacity={0.5} />
      <path className="sg-pulse" d="M64 6 l6 8 l-8 6 l8 6 l-4 4" stroke={CRIMSON} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
      <circle cx={64} cy={6} r={2} fill={CRIMSON} />
      <text x={8} y={41} fill={MUTED} style={mono}>contained at the boundary</text>
    </svg>
  );
}

/** 07 — a change ripples across contexts. */
function RippleGlyph() {
  return (
    <svg viewBox="0 0 150 44" className={cls} aria-hidden fill="none">
      <circle cx={20} cy={18} r={4} fill={CRIMSON} />
      {[16, 28, 40].map((r, i) => (
        <circle key={r} className="sg-pulse" style={{ animationDelay: `${i * 0.3}s` }} cx={20} cy={18} r={r} stroke={CRIMSON} strokeOpacity={0.4 - i * 0.1} />
      ))}
      {[70, 96, 122].map((x, i) => (
        <rect key={x} x={x} y={12} width={18} height={12} rx={2} fill={[OFFER, TEAL, AMBER][i]} fillOpacity={0.14} stroke={[OFFER, TEAL, AMBER][i]} strokeOpacity={0.7} />
      ))}
      <text x={62} y={40} fill={MUTED} style={mono}>ripple across contexts</text>
    </svg>
  );
}

const GLYPHS: Record<string, () => ReactElement> = {
  "02": MapGlyph,
  "03": LensGlyph,
  "03b": TranslateGlyph,
  "03c": ReconcileGlyph,
  "03d": UnitGlyph,
  "04": CompileGlyph,
  "05": FractureGlyph,
  "07": RippleGlyph,
};

export function MomentGlyph({ figure }: { figure: string }) {
  const G = GLYPHS[figure];
  if (!G) return null;
  return (
    <div className="hidden w-56 shrink-0 self-center rounded-xl border border-border/60 bg-base/50 px-3 py-2 shadow-panel sm:block lg:w-72">
      <G />
    </div>
  );
}
