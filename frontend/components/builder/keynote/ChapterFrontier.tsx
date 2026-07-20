"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { HYPOTHESES } from "@/components/moment-forge/horizon/horizon.data";
import { CursorSpotlight, Pill, RoktEcho, Scene, SceneHeadline, EASE } from "./stage";

/* 07 · The Frontier — when AI handles discovery, checkout becomes the ceremony
   of trust. An intent capsule from a shopping agent reaches a consent /
   translation boundary; select a future capability and the scene evolves. The
   capabilities are the repo's real HYPOTHESIS set — each tagged, none claimed. */

// The first four hypotheses read as the nearest, most concrete futures.
const FUTURES = HYPOTHESES.slice(0, 4);

function FrontierEnvironment() {
  return (
    <div className="absolute inset-0 bg-[#04060c]">
      <div
        className="absolute left-1/2 top-1/2 h-[80%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-30 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--c-offer-blue) 14%, transparent), transparent 65%)" }}
      />
    </div>
  );
}

export function ChapterFrontier() {
  const reduced = useReducedMotion();
  const [sel, setSel] = useState(0);
  const cur = FUTURES[sel]!;

  return (
    <Scene id="kc-frontier" n="07" label="The Frontier" accent="offer-blue" clip="kc-frontier" environment={<FrontierEnvironment />}>
      <CursorSpotlight accent="offer-blue">
        <div className="max-w-3xl">
          <Pill accent="offer-blue">Hypotheses · clearly labelled</Pill>
          <SceneHeadline className="mt-6">
            When AI handles discovery, checkout becomes the ceremony of trust.
          </SceneHeadline>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
            A shopping agent passes a permissioned intent toward checkout; unsupported claims stop at the consent
            boundary, approved intent continues. These are forward-looking hypotheses layered on the real engine —
            each one tagged, none of it claimed as shipped.
          </p>
          <div className="mt-7">
            <RoktEcho
              accent="offer-blue"
              quote="Smarter signals replace more impressions."
              source="Rokt · 2026 Commerce Outlook · public"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* selectors */}
          <div className="flex flex-col gap-2">
            {FUTURES.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={i === sel}
                className="press rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offer-blue"
                style={{
                  borderColor: i === sel ? "var(--c-offer-blue)" : "var(--c-border)",
                  background: i === sel ? "color-mix(in srgb, var(--c-offer-blue) 10%, transparent)" : "transparent",
                }}
              >
                <span className="font-mono text-[10px] uppercase tracking-wide text-amber">{f.h} · hypothesis</span>
                <span className="mt-1 block text-sm font-semibold text-text">{f.name}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">{f.thesis}</span>
              </button>
            ))}
          </div>

          {/* the evolving detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={cur.id}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="glass rounded-2xl border border-offer-blue/25 p-6"
            >
              <h3 className="text-xl font-semibold text-text" style={{ fontFamily: "var(--font-display)" }}>{cur.name}</h3>
              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-wide text-offer-blue">How it makes money</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{cur.revenue}</p>
              </div>
              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-wide text-teal">How a holdout proves it</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{cur.holdout}</p>
              </div>
              <div className="mt-4 rounded-lg bg-crimson/[0.08] p-3">
                <p className="text-sm leading-relaxed text-text">
                  <span className="font-semibold text-crimson">Honest risk: </span>{cur.risk}
                </p>
              </div>
              <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">
                <span className="text-teal">Signal:</span> {cur.signal}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </CursorSpotlight>
    </Scene>
  );
}
