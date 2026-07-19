import { CosmicField } from "./CosmicField";

/* ────────────────────────────────────────────────────────────────────────────
   HorizonBackdrop — the full-bleed, band-scoped celestial backdrop. Original,
   offline-safe: CSS-gradient void + canvas starfield + blurred aurora SVG + the
   teal-rimmed "Threshold Disc" (a moon that is the Moment) with wireframe arcs +
   procedural feTurbulence film grain + an L6 legibility scrim keeping text at AA.
   absolute inset-0, z-0, pointer-events-none, aria-hidden. Content sits at z-10.
   Reduced-motion → one composed static frame: the aurora keyframe is frozen by
   the global reduce block, the disc sits at its final position, the arc (owned by
   the parent) draws fully. Only MASTER tokens + darker VALUES of base (no new hue).
   ──────────────────────────────────────────────────────────────────────────── */
export function HorizonBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* scoped keyframes — offline, no globals edit; frozen by the reduce block */}
      <style>{`
        @keyframes hz-aurora { 0% { transform: translateX(-3%) skewY(-1.4deg); } 100% { transform: translateX(3%) skewY(1.2deg); } }
        .hz-aurora { animation: hz-aurora 34s ease-in-out infinite alternate; }
      `}</style>

      {/* L0 · void — a faint lift just above the horizon so the disc reads as rising */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(130% 90% at 50% 118%, #0E1524 0%, #0B0F19 56%, #070A11 100%)" }}
      />

      {/* L1 · rising signals (canvas starfield) */}
      <CosmicField />

      {/* L2 · aurora banks — blurred SVG ribbons, slow undulation (gated) */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 600">
        <defs>
          <linearGradient id="hz-au" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#22E6C8" />
            <stop offset="1" stopColor="#5B8CFF" />
          </linearGradient>
        </defs>
        <g style={{ filter: "blur(46px)" }} className="hz-aurora">
          <path d="M-100 360 C 200 300, 500 400, 1100 320 L 1100 460 L -100 460 Z" fill="url(#hz-au)" opacity="0.14" />
          <path d="M-100 300 C 300 360, 620 260, 1100 340 L 1100 420 L -100 420 Z" fill="url(#hz-au)" opacity="0.10" />
        </g>
      </svg>

      {/* L3 · the Threshold Disc (the moon that is the Moment), kept in the margin/lower-third */}
      <svg
        className="absolute h-[62vmin] w-[62vmin] lg:h-[46vmin] lg:w-[46vmin]"
        style={{ right: "6%", bottom: "-6%" }}
        viewBox="0 0 200 200"
      >
        <defs>
          <radialGradient id="hz-disc" cx="0.42" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#0E1B22" />
            <stop offset="1" stopColor="#0A121A" />
          </radialGradient>
          <filter id="hz-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r="88" fill="#22E6C8" opacity="0.18" filter="url(#hz-glow)" />
        <circle cx="100" cy="100" r="84" fill="url(#hz-disc)" stroke="#22E6C8" strokeOpacity="0.5" strokeWidth="1" />
        {/* latitude arcs — wireframe-globe texture */}
        {[26, 46, 64, 78].map((ry) => (
          <ellipse key={ry} cx="100" cy="100" rx="84" ry={ry} fill="none" stroke="#22E6C8" strokeOpacity="0.08" strokeWidth="0.75" />
        ))}
        <line x1="16" y1="100" x2="184" y2="100" stroke="#22E6C8" strokeOpacity="0.08" strokeWidth="0.75" />
      </svg>

      {/* L4 · horizon line — the literal threshold the offers cross */}
      <div
        className="absolute left-0 right-0"
        style={{ bottom: "12%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(34,230,200,0.40) 50%, transparent)" }}
      />
      <div
        className="absolute left-0 right-0"
        style={{ bottom: "calc(12% - 2px)", height: "2px", background: "rgba(34,230,200,0.12)", filter: "blur(2px)" }}
      />

      {/* L5 · film grain — procedural feTurbulence, the "film not dashboard" beat */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.045] mix-blend-overlay">
        <filter id="hz-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hz-grain)" />
      </svg>

      {/* L6 · legibility scrim — every text column sits on ≥0.86-opacity base (AA) */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(11,15,25,0) 0%, rgba(11,15,25,0.55) 58%, rgba(11,15,25,0.86) 100%)" }}
      />
    </div>
  );
}
