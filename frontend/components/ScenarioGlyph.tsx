/* A small animated diagram per scenario — each says, at a glance, what failure
   mode the card teaches, so the cards read as ideas, not just paragraphs. Pure
   SVG + CSS token colors; the looping motion is subtle and is collapsed to one
   frame by the app-wide reduced-motion safety net. */

const CRIMSON = "var(--c-crimson)";
const TEAL = "var(--c-teal)";
const MUTED = "var(--c-muted)";
const AMBER = "var(--c-amber)";
const OFFER = "var(--c-offer-blue)";

const wrap = "h-10 w-full";
const label = { fontFamily: "var(--font-mono, monospace)", fontSize: 7 } as const;

/** trap — a band of sessions silently flips eligible (muted → crimson). */
function TrapGlyph() {
  const xs = [10, 26, 42, 58, 74, 90, 106, 122];
  return (
    <svg viewBox="0 0 140 46" className={wrap} aria-hidden fill="none">
      <rect className="sg-pulse" x={36} y={10} width={48} height={20} rx={6} fill={CRIMSON} fillOpacity={0.1} stroke={CRIMSON} strokeOpacity={0.5} />
      {xs.map((x, i) => {
        const band = i >= 2 && i <= 4;
        return (
          <circle key={x} className={band ? "sg-flip" : undefined} cx={x} cy={20} r={3.4}
            fill={band ? CRIMSON : MUTED} fillOpacity={band ? 0.95 : 0.45} />
        );
      })}
      <text x={60} y={42} textAnchor="middle" fill={CRIMSON} style={label}>silently widened</text>
    </svg>
  );
}

/** safe — a session flows cleanly through the gate to a teal check. */
function SafeGlyph() {
  return (
    <svg viewBox="0 0 140 46" className={wrap} aria-hidden fill="none">
      <line x1={8} y1={20} x2={92} y2={20} stroke={MUTED} strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="4 5" />
      <rect x={92} y={8} width={6} height={24} rx={3} fill={TEAL} fillOpacity={0.85} />
      <circle className="sg-flow" cy={20} r={3.4} fill={TEAL} />
      <g className="sg-pulse">
        <circle cx={120} cy={20} r={9} stroke={TEAL} strokeWidth={1.6} />
        <path d="M115 20 l3.5 3.5 l6 -7" stroke={TEAL} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x={70} y={42} textAnchor="middle" fill={TEAL} style={label}>clears the gate</text>
    </svg>
  );
}

/** fatfinger — a mistyped amount, the stray digit flagged. */
function FatfingerGlyph() {
  return (
    <svg viewBox="0 0 140 46" className={wrap} aria-hidden fill="none">
      <text x={20} y={24} fill={MUTED} style={{ ...label, fontSize: 13 }}>$100.</text>
      <text x={66} y={24} fill={MUTED} style={{ ...label, fontSize: 13 }}>0</text>
      <text className="sg-blink" x={74} y={24} fill={CRIMSON} style={{ ...label, fontSize: 13 }}>0</text>
      <text x={82} y={24} fill={MUTED} style={{ ...label, fontSize: 13 }}>0</text>
      <path className="sg-blink" d="M74 28 l4 6 l-8 0 z" fill={CRIMSON} />
      <text x={70} y={42} textAnchor="middle" fill={AMBER} style={label}>one stray keystroke</text>
    </svg>
  );
}

/** consent — a consent shield with a leaking gap. */
function ConsentGlyph() {
  return (
    <svg viewBox="0 0 140 46" className={wrap} aria-hidden fill="none">
      <path d="M60 6 l14 5 v10 c0 9 -6 13 -14 16 c-8 -3 -14 -7 -14 -16 v-10 z"
        stroke={TEAL} strokeOpacity={0.7} strokeWidth={1.6} />
      <path d="M52 20 l5 5 l9 -10" stroke={TEAL} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <line className="sg-dash" x1={78} y1={20} x2={122} y2={20} stroke={CRIMSON} strokeWidth={1.8} strokeDasharray="3 4" />
      <text x={70} y={42} textAnchor="middle" fill={CRIMSON} style={label}>consent leaks through</text>
    </svg>
  );
}

/** immutable — an edit strike bouncing off a locked field. */
function ImmutableGlyph() {
  return (
    <svg viewBox="0 0 140 46" className={wrap} aria-hidden fill="none">
      <rect x={54} y={16} width={24} height={16} rx={3} stroke={TEAL} strokeOpacity={0.8} strokeWidth={1.6} />
      <path d="M60 16 v-4 a6 6 0 0 1 12 0 v4" stroke={TEAL} strokeOpacity={0.8} strokeWidth={1.6} />
      <circle cx={66} cy={24} r={1.8} fill={TEAL} />
      <g className="sg-shake">
        <line x1={92} y1={12} x2={104} y2={24} stroke={CRIMSON} strokeWidth={1.8} strokeLinecap="round" />
        <line x1={104} y1={12} x2={92} y2={24} stroke={CRIMSON} strokeWidth={1.8} strokeLinecap="round" />
      </g>
      <text x={70} y={42} textAnchor="middle" fill={TEAL} style={label}>locked — rejected</text>
    </svg>
  );
}

/** agent — an AI referral arrives pre-checkout with thin data; the missing
 *  attribute widens that cohort most. */
function AgentGlyph() {
  return (
    <svg viewBox="0 0 140 46" className={wrap} aria-hidden fill="none">
      {/* the AI referrer */}
      <circle className="sg-pulse" cx={18} cy={18} r={10} fill={OFFER} fillOpacity={0.14} stroke={OFFER} strokeOpacity={0.8} />
      <path d="M18 11 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 z" fill={OFFER} />
      {/* arrives at a product-page session with thin data */}
      <path d="M30 18 h16 l-4 -3 m4 3 l-4 3" stroke={MUTED} strokeOpacity={0.6} />
      {[60, 74].map((x) => <circle key={x} cx={x} cy={18} r={3.2} fill={MUTED} fillOpacity={0.5} />)}
      {/* the missing attribute — dashed hole, then flips crimson (widened) */}
      <circle cx={90} cy={18} r={3.4} fill="none" stroke={CRIMSON} strokeWidth={1.4} strokeDasharray="2 2" />
      <circle className="sg-flip" cx={108} cy={18} r={3.6} fill={CRIMSON} />
      <text x={4} y={41} fill={MUTED} style={label}>AI-referred · thin data widens</text>
    </svg>
  );
}

const GLYPHS: Record<string, () => React.ReactElement> = {
  trap: TrapGlyph,
  safe: SafeGlyph,
  fatfinger: FatfingerGlyph,
  consent: ConsentGlyph,
  immutable: ImmutableGlyph,
  agent: AgentGlyph,
};

export function ScenarioGlyph({ id }: { id: string }) {
  const Glyph = GLYPHS[id];
  if (!Glyph) return null;
  return (
    <div className="mb-3 rounded-lg border border-border/50 bg-surface/30 px-2 py-1.5">
      <Glyph />
    </div>
  );
}
