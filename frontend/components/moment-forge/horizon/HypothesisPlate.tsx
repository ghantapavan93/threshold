"use client";

import { MaskText } from "@/components/builder/anim";
import { Tilt3D } from "../garnish";
import { CLOSING_BRIDGE, OPENING_BRIDGE, type Hypothesis } from "./horizon.data";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">{children}</p>;
}

export function MovementHeader({ eyebrow, line }: { eyebrow: string; line: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <Eyebrow>{eyebrow}</Eyebrow>
      <MaskText
        as="h3"
        className="mt-2 text-2xl font-bold leading-[1.1] tracking-tightest sm:text-3xl"
        segments={[{ text: line, className: "gradient-text" }]}
      />
    </div>
  );
}

export function HypothesisPlate({ h }: { h: Hypothesis }) {
  return (
    <Tilt3D max={4} className="mx-auto mt-8 max-w-4xl">
    <article
      id={`hyp-${h.id}`}
      aria-labelledby={`${h.id}-h`}
      className="rounded-2xl border border-border/70 bg-base/70 p-6 backdrop-blur-sm sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* left — the argument */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber">
            <span aria-hidden>◌</span> {h.h} · HYPOTHESIS
          </span>
          <MaskText
            as="h4"
            id={`${h.id}-h`}
            className="mt-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
            segments={[{ text: h.name + " — " }, { text: h.thesis, className: "gradient-text" }]}
          />
          <div className="mt-4">
            <Eyebrow>How it makes money</Eyebrow>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{h.revenue}</p>
          </div>
          <div className="mt-4">
            <Eyebrow>How a holdout proves it</Eyebrow>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{h.holdout}</p>
          </div>
        </div>

        {/* right — the frame */}
        <div className="space-y-4">
          <div className="rounded-xl border border-teal/30 bg-surface-2/25 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-teal">Verified signal</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">{h.signal}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Domain events</p>
            <div className="scroll-x mt-1.5">
              <div className="flex flex-wrap gap-1.5">
                {h.events.map((e) => (
                  <span key={e} className="whitespace-nowrap rounded border border-border/70 bg-surface-2/50 px-1.5 py-0.5 font-mono text-[10px] text-text">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-muted">
            <span className="text-muted">Substrate:</span> {h.substrate}
          </p>
        </div>
      </div>

      {/* honest risk — the only crimson in the section, on every plate */}
      <p className="mt-5 rounded-lg bg-crimson/[0.08] p-3 text-sm leading-relaxed text-text">
        <span aria-hidden className="mr-1.5 font-mono text-crimson">✕</span>
        <span className="font-semibold text-crimson">Honest risk: </span>
        {h.risk}
      </p>
    </article>
    </Tilt3D>
  );
}

export function OpeningBridge() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <div className="holo-card rounded-2xl p-6 sm:p-8">
        <Eyebrow>{OPENING_BRIDGE.eyebrow}</Eyebrow>
        <ul className="mt-3 space-y-1.5">
          {OPENING_BRIDGE.lines.map((l) => (
            <li key={l} className="flex gap-2 text-sm leading-relaxed text-muted">
              <span aria-hidden className="mt-0.5 text-teal">✓</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-border/60 pt-4 text-lg font-semibold tracking-tight text-text" style={{ fontFamily: "var(--font-display)" }}>
          {OPENING_BRIDGE.hero}
        </p>
      </div>
    </div>
  );
}

export function ClosingBridge() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 sm:px-6">
      <Eyebrow>{CLOSING_BRIDGE.eyebrow}</Eyebrow>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
        <div className="scroll-x">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-surface-2/70 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Future context (HYPOTHESIS)</th>
                <th className="px-4 py-3 font-semibold text-teal">Attaches at the edge · shipped substrate</th>
              </tr>
            </thead>
            <tbody>
              {CLOSING_BRIDGE.rows.map((r) => (
                <tr key={r.name} className="border-t border-border/60 align-top">
                  <td className="px-4 py-3 text-text">{r.name}</td>
                  <td className="px-4 py-3 text-muted">{r.substrate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-6 max-w-3xl text-base leading-relaxed text-text">{CLOSING_BRIDGE.line}</p>
    </div>
  );
}
