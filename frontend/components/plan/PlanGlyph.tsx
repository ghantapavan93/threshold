/* Small animated diagrams for the audit findings and the 30/60/90 months, so
   each idea reads as a picture, not only a paragraph. Pure SVG, token colors,
   slow ambient loops (the sg-* classes in globals.css, collapsed under reduced
   motion). */

import type { CSSProperties, ReactElement } from "react";

const CRIMSON = "var(--c-crimson)";
const TEAL = "var(--c-teal)";
const MUTED = "var(--c-muted)";
const AMBER = "var(--c-amber)";
const OFFER = "var(--c-offer-blue)";

const mono = { fontFamily: "var(--font-mono, monospace)" } as const;
const box = "w-32 shrink-0 sm:w-44";
// a mote that rides a route (offset-path in the SVG user coordinate system)
const ride = (d: string): CSSProperties => ({ offsetPath: `path('${d}')` } as CSSProperties);

// ── findings ────────────────────────────────────────────────────────────────

/** 01 — a draft creative with an at-risk token flagged before submit. */
function LinterGlyph() {
  return (
    <svg viewBox="0 0 150 44" className="h-11 w-full" aria-hidden fill="none">
      <rect x={4} y={8} width={142} height={18} rx={5} stroke={MUTED} strokeOpacity={0.4} />
      <text x={11} y={21} fill={MUTED} style={{ ...mono, fontSize: 9 }}>Hey</text>
      <rect className="sg-pulse" x={31} y={10} width={30} height={14} rx={3} fill={CRIMSON} fillOpacity={0.14} stroke={CRIMSON} strokeOpacity={0.7} />
      <text x={35} y={21} fill={CRIMSON} style={{ ...mono, fontSize: 9 }}>Sarah</text>
      <text x={66} y={21} fill={MUTED} style={{ ...mono, fontSize: 9 }}>, WIN…</text>
      {/* a scan head sweeps the draft and settles on the risky token */}
      <circle className="dg-dot" r={2} fill={AMBER} style={ride("M11 17 H120")} />
      <text x={4} y={40} fill={AMBER} style={{ ...mono, fontSize: 7 }}>flagged before submit</text>
    </svg>
  );
}

/** 02 — required attributes flow to the placement; one arrives malformed. */
function IntegrationGlyph() {
  const rows = [
    { y: 12, c: TEAL, ok: true },
    { y: 20, c: TEAL, ok: true },
    { y: 28, c: CRIMSON, ok: false },
  ];
  return (
    <svg viewBox="0 0 150 44" className="h-11 w-full" aria-hidden fill="none">
      {rows.map((r, i) => (
        <g key={i}>
          <line x1={8} y1={r.y} x2={108} y2={r.y} stroke={r.c} strokeOpacity={r.ok ? 0.5 : 0.8} strokeWidth={1.4} strokeDasharray="3 3" className={r.ok ? "dg-flow" : "sg-dash"} />
          <circle cx={8} cy={r.y} r={2.4} fill={r.c} fillOpacity={r.ok ? 0.7 : 0.95} />
          {r.ok ? <circle className="dg-dot" r={1.8} fill={r.c} style={ride(`M8 ${r.y} H108`)} /> : null}
        </g>
      ))}
      <rect x={112} y={8} width={6} height={24} rx={3} fill={OFFER} fillOpacity={0.8} />
      <circle className="sg-pulse" cx={132} cy={28} r={6} stroke={CRIMSON} strokeWidth={1.5} />
      <line x1={129} y1={25} x2={135} y2={31} stroke={CRIMSON} strokeWidth={1.5} />
      <line x1={135} y1={25} x2={129} y2={31} stroke={CRIMSON} strokeWidth={1.5} />
      <text x={4} y={41} fill={AMBER} style={{ ...mono, fontSize: 7 }}>one attribute malformed</text>
    </svg>
  );
}

/** 03 — probability climbs toward the 95% gate; an early peek is flagged. */
function ExperimentGlyph() {
  return (
    <svg viewBox="0 0 150 44" className="h-11 w-full" aria-hidden fill="none">
      <line x1={8} y1={9} x2={140} y2={9} stroke={TEAL} strokeOpacity={0.4} strokeDasharray="3 3" />
      <text x={116} y={7} fill={TEAL} style={{ ...mono, fontSize: 6 }}>95%</text>
      <path d="M8 30 C 40 30, 70 26, 100 14 S 132 10, 140 10" stroke={OFFER} strokeWidth={1.6} />
      {/* the estimate climbs the curve toward the 95% gate */}
      <circle className="dg-dot dg-slow" r={2.6} fill={OFFER} style={ride("M8 30 C 40 30, 70 26, 100 14 S 132 10, 140 10")} />
      <circle className="sg-pulse" cx={52} cy={28} r={4} stroke={CRIMSON} strokeWidth={1.5} />
      <text x={44} y={40} fill={CRIMSON} style={{ ...mono, fontSize: 6 }}>peeked</text>
      <circle cx={140} cy={10} r={3} fill={TEAL} />
      <text x={92} y={40} fill={MUTED} style={{ ...mono, fontSize: 7 }}>let it reach 95%</text>
    </svg>
  );
}

/** 04 — a suppression file; one row fails the format check silently. */
function AudienceGlyph() {
  const rows = [14, 21, 28];
  return (
    <svg viewBox="0 0 150 44" className="h-11 w-full" aria-hidden fill="none">
      <rect x={30} y={7} width={64} height={28} rx={3} stroke={MUTED} strokeOpacity={0.5} />
      {rows.map((y, i) => {
        const bad = i === 1;
        return (
          <g key={y} className={bad ? "sg-pulse" : undefined}>
            <line x1={36} y1={y} x2={bad ? 74 : 88} y2={y} stroke={bad ? CRIMSON : MUTED} strokeOpacity={bad ? 0.9 : 0.4} strokeWidth={bad ? 1.6 : 1.2} />
            {bad ? (
              <>
                <line x1={80} y1={y - 3} x2={86} y2={y + 3} stroke={CRIMSON} strokeWidth={1.4} />
                <line x1={86} y1={y - 3} x2={80} y2={y + 3} stroke={CRIMSON} strokeWidth={1.4} />
              </>
            ) : null}
          </g>
        );
      })}
      {/* the format checker scans down the file */}
      <circle className="dg-dot dg-slow" r={1.8} fill={AMBER} style={ride("M62 9 V33")} />
      <text x={30} y={41} fill={AMBER} style={{ ...mono, fontSize: 7 }}>silent format reject</text>
    </svg>
  );
}

// ── months ──────────────────────────────────────────────────────────────────

/** 30 — ship one small, safe, flagged change. */
function Month30Glyph() {
  return (
    <svg viewBox="0 0 150 44" className="h-11 w-full" aria-hidden fill="none">
      <rect x={40} y={10} width={40} height={22} rx={4} fill={TEAL} fillOpacity={0.1} stroke={TEAL} strokeOpacity={0.7} />
      <text x={46} y={24} fill={TEAL} style={{ ...mono, fontSize: 8 }}>PR</text>
      <line x1={92} y1={8} x2={92} y2={34} stroke={AMBER} strokeWidth={1.4} />
      <path className="sg-pulse" d="M92 9 h16 l-4 5 l4 5 h-16 z" fill={AMBER} fillOpacity={0.85} />
      <circle className="dg-dot" r={2} fill={TEAL} style={ride("M40 21 H92")} />
      <text x={28} y={41} fill={MUTED} style={{ ...mono, fontSize: 7 }}>one safe change, behind a flag</text>
    </svg>
  );
}

/** 60 — own one seam end to end. */
function Month60Glyph() {
  return (
    <svg viewBox="0 0 150 44" className="h-11 w-full" aria-hidden fill="none">
      <line x1={8} y1={20} x2={68} y2={20} stroke={TEAL} strokeWidth={2} strokeOpacity={0.8} />
      <line x1={82} y1={20} x2={142} y2={20} stroke={TEAL} strokeWidth={2} strokeOpacity={0.8} />
      <circle className="sg-pulse" cx={75} cy={20} r={8} fill={TEAL} fillOpacity={0.12} stroke={TEAL} strokeWidth={1.6} />
      <circle cx={75} cy={20} r={2.4} fill={TEAL} />
      <circle className="dg-dot" r={3} fill={TEAL} style={ride("M8 20 H142")} />
      <text x={40} y={40} fill={MUTED} style={{ ...mono, fontSize: 7 }}>own one seam, end to end</text>
    </svg>
  );
}

/** 90 — behind a real holdout: treatment vs control. */
function Month90Glyph() {
  return (
    <svg viewBox="0 0 150 44" className="h-11 w-full" aria-hidden fill="none">
      <line x1={8} y1={13} x2={110} y2={13} stroke={TEAL} strokeWidth={1.6} strokeOpacity={0.85} />
      {[24, 48, 72, 96].map((x) => <circle key={x} cx={x} cy={13} r={2.4} fill={TEAL} />)}
      <circle className="dg-dot" r={2.2} fill={TEAL} style={ride("M8 13 H110")} />
      <line x1={8} y1={28} x2={110} y2={28} stroke={MUTED} strokeWidth={1.6} strokeOpacity={0.5} strokeDasharray="4 4" />
      {[24, 48, 72, 96].map((x) => <circle key={x} cx={x} cy={28} r={2.4} fill={MUTED} fillOpacity={0.5} />)}
      <text x={116} y={15} fill={TEAL} style={{ ...mono, fontSize: 6 }}>treat</text>
      <text x={116} y={30} fill={MUTED} style={{ ...mono, fontSize: 6 }}>hold</text>
      <text x={8} y={41} fill={MUTED} style={{ ...mono, fontSize: 7 }}>behind a real holdout</text>
    </svg>
  );
}

const FINDING: Record<string, () => ReactElement> = {
  "01": LinterGlyph,
  "02": IntegrationGlyph,
  "03": ExperimentGlyph,
  "04": AudienceGlyph,
};
const MONTH: Record<string, () => ReactElement> = {
  "30": Month30Glyph,
  "60": Month60Glyph,
  "90": Month90Glyph,
};

export function FindingGlyph({ n }: { n: string }) {
  const G = FINDING[n];
  if (!G) return null;
  return (
    <div className={`hidden ${box} rounded-lg border border-border/40 bg-surface/30 px-2 py-1 sm:block`}>
      <G />
    </div>
  );
}

export function PhaseGlyph({ month }: { month: string }) {
  const G = MONTH[month];
  if (!G) return null;
  return (
    <div className="mt-6 max-w-xs rounded-lg border border-border/40 bg-surface/30 px-2 py-1">
      <G />
    </div>
  );
}
