"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Pill, RoktEcho, Scene, SceneHeadline, EASE } from "./stage";

/* 00 · The Moment — a premium movie-theater confirmation environment. The
   business world first, software second. Code-drawn: a glowing screen, raked
   seat rows, and a floating ticket-confirmation card. */

function TheaterEnvironment() {
  const reduced = useReducedMotion();
  // Raked rows of seats — denser and dimmer toward the back (top).
  const rows = Array.from({ length: 7 }, (_, r) => {
    const seats = 10 + r * 2;
    const y = 300 + r * 30;
    const scale = 0.5 + r * 0.09;
    return { r, seats, y, scale, opacity: 0.15 + r * 0.06 };
  });
  return (
    <div className="absolute inset-0 bg-[#070a12]">
      {/* screen glow */}
      <div
        className="absolute left-1/2 top-[12%] h-[38%] w-[62%] -translate-x-1/2 rounded-[40%] opacity-70 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--c-teal) 22%, transparent), transparent 70%)" }}
      />
      <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="mt-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--c-teal)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--c-offer-blue)" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="mt-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1020" />
            <stop offset="1" stopColor="#04060c" />
          </linearGradient>
        </defs>
        {/* the screen — a subtle trapezoid */}
        <motion.polygon
          points="230,70 770,70 720,250 280,250"
          fill="url(#mt-screen)"
          stroke="var(--c-teal)"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
        <rect x="0" y="250" width="1000" height="390" fill="url(#mt-floor)" />
        {/* raked seats */}
        {rows.map((row) =>
          Array.from({ length: row.seats }, (_, s) => {
            const spacing = 900 / row.seats;
            const x = 50 + s * spacing + spacing / 2;
            return (
              <rect
                key={`${row.r}-${s}`}
                x={x - 6 * row.scale}
                y={row.y}
                width={12 * row.scale}
                height={10 * row.scale}
                rx={2}
                fill="var(--c-teal)"
                opacity={row.opacity}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

export function ChapterMoment() {
  const reduced = useReducedMotion();
  return (
    <Scene id="kc-moment" n="00" label="The Moment" accent="teal" clip="kc-moment" flip={false} environment={<TheaterEnvironment />}>
      <div>
          <Pill accent="teal">The Transaction Moment™</Pill>
          <SceneHeadline className="mt-6">
            A transaction is already in motion.
          </SceneHeadline>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted"
          >
            The customer chose. The merchant earned trust. One optional experience is waiting to enter the
            moment — and it must never put the purchase at risk.
          </motion.p>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
            className="mt-7"
          >
            <RoktEcho
              accent="teal"
              quote="Checkout is where intent is confirmed, not assumed."
              source="Rokt · 2026 Commerce Outlook · public"
            />
          </motion.div>
          <motion.a
            href="#kc-change"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            className="press mt-9 inline-flex min-h-[48px] items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
          >
            Enter the Transaction Moment <span aria-hidden>↓</span>
          </motion.a>
      </div>
    </Scene>
  );
}
