/* ────────────────────────────────────────────────────────────────────────────
   Story illustrations — inline, bundled SVG (no external URLs, no image files).
   Theme-aware: colors reference the Threshold CSS variables so they track the
   active light/dark theme. All are decorative (aria-hidden); the surrounding
   copy carries the meaning.
   ──────────────────────────────────────────────────────────────────────────── */

const TEAL = "var(--c-teal)";
const CRIMSON = "var(--c-crimson)";
const AMBER = "var(--c-amber)";
const BLUE = "var(--c-offer-blue)";
const MUTED = "var(--c-muted)";
const BORDER = "var(--c-border-strong)";

/** Hero motif — the Transaction Moment as a decision gate. Sessions stream in
 *  from the left; the gate lets safe ones through (teal) and stops the silently
 *  dangerous one (crimson). */
export function TransactionMomentMotif({
  className,
  phase = "idle",
}: {
  className?: string;
  /** Drives the in-hero reaction when the story plays: streams flow, the gate
      lights, and — once BLOCKED lands — the failing lane's X pulses. */
  phase?: "idle" | "running" | "blocked";
}) {
  const rows = [40, 78, 116, 154, 192];
  const live = phase === "running" || phase === "blocked";
  return (
    <svg
      aria-hidden
      data-phase={phase}
      viewBox="0 0 360 240"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tm-gate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TEAL} stopOpacity="0.9" />
          <stop offset="1" stopColor={BLUE} stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="tm-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={TEAL} stopOpacity="0.35" />
          <stop offset="1" stopColor={TEAL} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tm-glow-x" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={CRIMSON} stopOpacity="0.4" />
          <stop offset="1" stopColor={CRIMSON} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ambient glow behind the gate */}
      <ellipse className="tm-motif-glow" cx="196" cy="120" rx="120" ry="120" fill="url(#tm-glow)" />
      {/* crimson bloom behind the failing lane — only meaningful once blocked */}
      <ellipse className="tm-motif-xglow" cx="246" cy="116" rx="54" ry="54" fill="url(#tm-glow-x)" />

      {/* incoming session streams */}
      {rows.map((y, i) => {
        const danger = i === 2;
        const color = danger ? CRIMSON : MUTED;
        return (
          <g key={y}>
            <line
              className={live ? "tm-motif-stream" : undefined}
              x1="8"
              y1={y}
              x2="176"
              y2={y}
              stroke={color}
              strokeOpacity={danger ? 0.7 : 0.35}
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            {[24, 60, 96, 132].map((x) => (
              <circle key={x} cx={x} cy={y} r="3" fill={color} fillOpacity={danger ? 0.9 : 0.55} />
            ))}
          </g>
        );
      })}

      {/* the gate */}
      <rect className="tm-motif-gate" x="188" y="24" width="16" height="192" rx="8" fill="url(#tm-gate)" />
      <rect x="188" y="24" width="16" height="192" rx="8" stroke={TEAL} strokeOpacity="0.5" />

      {/* outcomes on the right */}
      {rows.map((y, i) => {
        const danger = i === 2;
        if (danger) {
          return (
            <g key={y} className="tm-motif-x" style={{ transformOrigin: "246px 116px" }}>
              <line x1="204" y1={y} x2="236" y2={y} stroke={CRIMSON} strokeWidth="2" />
              <circle cx="246" cy={y} r="9" fill="none" stroke={CRIMSON} strokeWidth="2" />
              <line x1="242" y1={y - 4} x2="250" y2={y + 4} stroke={CRIMSON} strokeWidth="2" />
              <line x1="250" y1={y - 4} x2="242" y2={y + 4} stroke={CRIMSON} strokeWidth="2" />
            </g>
          );
        }
        return (
          <g key={y}>
            <line x1="204" y1={y} x2="320" y2={y} stroke={TEAL} strokeOpacity="0.75" strokeWidth="1.75" />
            {[236, 272, 308].map((x) => (
              <circle key={x} cx={x} cy={y} r="3" fill={TEAL} />
            ))}
            <path
              d={`M334 ${y - 4} l3 4 l-3 4`}
              stroke={TEAL}
              strokeWidth="1.75"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** "Silent widening" — a proposed change flips a band of missing-attribute
 *  sessions from ineligible (muted) to eligible (crimson), invisibly. */
export function SilentWideningDiagram({ className }: { className?: string }) {
  const cols = 12;
  const rows = 5;
  const widenedRow = 2;
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 140"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const widened = r === widenedRow && c > 3;
          const x = 12 + c * 23;
          const y = 16 + r * 24;
          return (
            <rect
              key={`${r}-${c}`}
              className={widened ? "sg-flip" : undefined}
              style={widened ? { animationDelay: `${(c - 4) * 0.14}s` } : undefined}
              x={x}
              y={y}
              width="16"
              height="16"
              rx="3"
              fill={widened ? CRIMSON : MUTED}
              fillOpacity={widened ? 0.9 : 0.28}
              stroke={widened ? CRIMSON : BORDER}
              strokeOpacity={widened ? 0.9 : 0.4}
            />
          );
        }),
      )}
      <path
        className="sg-dash"
        d="M8 64 h284"
        stroke={CRIMSON}
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeDasharray="3 5"
      />
    </svg>
  );
}

/** Fail-closed lane — the decision pipeline drops to "No Offer" (crimson) while
 *  the checkout lane stays green (teal), untouched. */
export function FailClosedLaneMotif({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 130"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* decision lane */}
      <g>
        <line x1="12" y1="38" x2="230" y2="38" stroke={MUTED} strokeOpacity="0.4" strokeWidth="2" />
        {[40, 96, 152].map((x) => (
          <circle key={x} cx={x} cy="38" r="5" fill={MUTED} fillOpacity="0.55" />
        ))}
        <path d="M208 38 q22 0 22 26" stroke={CRIMSON} strokeWidth="2" fill="none" />
        <g className="sg-pulse">
          <rect x="196" y="70" width="112" height="26" rx="8" fill={CRIMSON} fillOpacity="0.14" stroke={CRIMSON} />
          <text x="252" y="87" textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill={CRIMSON}>
            No Offer Rendered
          </text>
        </g>
      </g>
      {/* checkout lane */}
      <g>
        <line x1="12" y1="112" x2="308" y2="112" stroke={TEAL} strokeOpacity="0.75" strokeWidth="2" />
        {[40, 110, 180, 250].map((x) => (
          <circle key={x} cx={x} cy="112" r="5" fill={TEAL} />
        ))}
        <path
          d="M300 108 l4 4 l-4 4"
          stroke={TEAL}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Integrity motif — a shield with a check and a hash-chain, for the
 *  tamper-evident audit / verified-outcome story. */
export function IntegrityShield({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 130"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sh-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TEAL} stopOpacity="0.22" />
          <stop offset="1" stopColor={TEAL} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path
        d="M60 8 L104 24 V60 C104 92 84 112 60 122 C36 112 16 92 16 60 V24 Z"
        fill="url(#sh-fill)"
        stroke={TEAL}
        strokeWidth="2"
      />
      <path
        d="M42 62 l12 13 l24 -28"
        stroke={TEAL}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* hash-chain ticks */}
      {[96, 104, 112].map((y, i) => (
        <line
          key={y}
          x1="34"
          y1={y - 8}
          x2="86"
          y2={y - 8}
          stroke={i === 1 ? AMBER : MUTED}
          strokeOpacity={i === 1 ? 0.8 : 0.35}
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
      ))}
    </svg>
  );
}
