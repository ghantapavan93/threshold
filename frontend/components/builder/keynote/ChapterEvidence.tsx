"use client";

import { BeforeAfter, Pill, RoktEcho, Scene, SceneHeadline } from "./stage";

/* 05 · The Evidence — drag the boundary from what AI proposed to what
   verification allowed. The content is the project's real honesty ledger
   (docs/LIMITATIONS.md): confident fabrications kept out, verified facts kept
   in. Both panels share the same layout so the drag splits each row cleanly. */

type Row = { before: string; after: string };
const ROWS: Row[] = [
  { before: "SDK enums TIMEOUT / NO_OFFERS invented", after: "Selection.on + PLACEMENT_FAILURE (real API)" },
  { before: "A SHOW_NOTHING code constant", after: "“No Offer Rendered” — a documented behaviour" },
  { before: "Per-transaction settlement math", after: "No money math claimed at all" },
  { before: "Exactly-once delivery asserted", after: "Idempotent dedup + a visible dead-letter" },
  { before: "Overbroad product scope", after: "A narrow gate on policy changes only" },
  { before: "“Thousands of signals”", after: "The published figure: 30+" },
];

function Ledger({ side }: { side: "before" | "after" }) {
  const isAfter = side === "after";
  return (
    <div className={`h-full p-5 ${isAfter ? "bg-[#081311]" : "bg-[#140a0d]"}`}>
      <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${isAfter ? "text-teal" : "text-crimson"}`}>
        {isAfter ? "What verification allowed" : "What AI proposed"}
      </p>
      <ul className="mt-4 space-y-2.5">
        {ROWS.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-snug">
            <span aria-hidden className={isAfter ? "text-teal" : "text-crimson"}>{isAfter ? "▛" : "✕"}</span>
            <span className={isAfter ? "text-text" : "text-muted line-through decoration-crimson/40"}>
              {isAfter ? r.after : r.before}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChapterEvidence() {
  return (
    <Scene id="kc-evidence" n="05" label="The Evidence" accent="teal" clip="kc-evidence" environment={<div className="absolute inset-0 bg-[#05080e]" />}>
      <div className="max-w-3xl">
        <Pill accent="teal">Drag the boundary</Pill>
        <SceneHeadline className="mt-6">
          AI generated possibilities. Evidence decided what deserved to exist.
        </SceneHeadline>
        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
          Every confident fabrication an AI offered was checked against primary sources — and cut. Drag the
          handle from what was proposed to what survived verification. The product got smaller and more
          credible, not larger.
        </p>
        <div className="mt-7">
          <RoktEcho
            accent="teal"
            quote="Show the right content, or show nothing."
            source="Rokt · Claire Southey, Chief AI Officer, 2026 · public"
          />
        </div>
      </div>

      <div className="mt-10">
        <BeforeAfter
          before={<Ledger side="before" />}
          after={<Ledger side="after" />}
          labelBefore="Before verification"
          labelAfter="After verification"
        />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Real honesty ledger · docs/LIMITATIONS.md — nothing on this page is asserted without a source
        </p>
      </div>
    </Scene>
  );
}
