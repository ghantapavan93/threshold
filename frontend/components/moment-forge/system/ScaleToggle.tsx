"use client";

import { useState } from "react";
import { INVARIANT_RIBBON, ROKT_PUBLIC, SCALE_DESIGNED, SCALE_SHIPPED } from "./model";
import { ShippedDesignedTag } from "./atoms";

/* SHIPPED ⇄ DESIGNED overlay for the same architecture. The edges change; the
   core does not. No fabricated throughput/QPS — only Rokt's public figures
   (attributed) and DESIGNED capacity shown relatively. */
export function ScaleToggle() {
  const [designed, setDesigned] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={designed}
          onClick={() => setDesigned((d) => !d)}
          className="press inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-surface-2/50 px-4 py-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
        >
          <span className={designed ? "text-muted" : "text-teal"}>● SHIPPED</span>
          <span aria-hidden className="text-muted">⇄</span>
          <span className={designed ? "text-amber" : "text-muted"}>◌ DESIGNED</span>
        </button>
        <span aria-live="polite" className="font-mono text-[11px] text-muted">
          {designed ? "Showing designed (future) architecture — not running." : "Showing the shipped, running architecture."}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(designed ? SCALE_DESIGNED : SCALE_SHIPPED).map((n) => (
          <div
            key={n.name}
            className="flex items-start gap-2 rounded-xl border p-3"
            style={{ borderColor: designed ? "var(--c-amber)" : "var(--c-teal)", borderStyle: designed ? "dashed" : "solid" }}
          >
            <ShippedDesignedTag status={designed ? "DESIGNED" : "SHIPPED"} milestone={"milestone" in n ? n.milestone : undefined} />
            <div className="min-w-0">
              <p className="text-sm leading-snug text-text">{n.name}</p>
              {"anchor" in n ? <p className="mt-0.5 font-mono text-[10px] text-teal">{n.anchor}</p> : null}
            </div>
          </div>
        ))}
      </div>

      {/* invariant ribbon — constant across both states */}
      <div className="mt-6 rounded-2xl border border-teal/30 bg-teal/[0.05] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal">The core does not change</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {INVARIANT_RIBBON.map((iv) => (
            <span key={iv} className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/[0.06] px-2.5 py-0.5 font-mono text-[11px] text-teal">
              <span aria-hidden>✓</span> {iv}
            </span>
          ))}
        </div>
      </div>

      {/* Rokt public figures — attributed, never a fabricated capacity number */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {ROKT_PUBLIC.map((r) => (
          <span key={r.label} className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-muted">
            <span className="text-text">{r.figure}</span> {r.label}
          </span>
        ))}
        <span className="font-mono text-[10px] text-muted">Rokt public figures (rokt.com) — DESIGNED capacity shown only relatively, no invented numbers.</span>
      </div>
    </div>
  );
}
