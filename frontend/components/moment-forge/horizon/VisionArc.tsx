"use client";

/* VisionArc — the trajectory spine. A rising SVG arc with 8 nodes; the drawn
   length and node brightness advance as the reader passes each hypothesis
   (driven by the parent's IntersectionObserver, not autoplay). Decorative
   (role="presentation") — the thesis/signal/risk are real DOM text elsewhere.
   Reduced-motion → fully drawn, all reached nodes at rest (parent sets active=8). */

const W = 800;
const H = 300;

function pt(i: number): { x: number; y: number } {
  const x = 44 + (i * (W - 88)) / 7;
  const y = 262 - 214 * Math.pow(i / 7, 0.9); // low-left → high-right (up and over)
  // Round to 2dp so server- and client-rendered SVG coordinates are byte-identical
  // (raw floats differ in their last digits between Node and the browser → hydration mismatch).
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

function pathD(upto: number): string {
  const pts = Array.from({ length: Math.max(2, upto) }, (_, i) => pt(i));
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

export function VisionArc({ active }: { active: number }) {
  const full = pathD(8);
  const drawn = pathD(Math.min(8, active + 1));
  return (
    <svg role="presentation" aria-hidden viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      <path d={full} fill="none" stroke="var(--c-border-strong)" strokeWidth="1.5" strokeOpacity="0.5" />
      <path d={drawn} fill="none" stroke="var(--c-teal)" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 8 }).map((_, i) => {
        const p = pt(i);
        const on = i <= active;
        return (
          <g key={i}>
            {on ? <circle cx={p.x} cy={p.y} r="8" fill="var(--c-teal)" opacity="0.18" /> : null}
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill={on ? "var(--c-teal)" : "var(--c-base)"}
              stroke={on ? "var(--c-teal)" : "var(--c-border-strong)"}
              strokeWidth="1.5"
            />
            <text x={p.x} y={p.y + 20} textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="9" fill={on ? "var(--c-teal)" : "var(--c-muted)"}>
              H-0{i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
