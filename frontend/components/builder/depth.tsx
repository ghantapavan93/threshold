"use client";

import { useId, useState, type ReactNode } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   Progressive-disclosure depth primitives for the Builder scenes.
   • Disclosure — a calm, tasteful toggle (smooth grid-rows height + opacity),
     nothing auto-expands; reduced-motion collapses the transition to instant via
     the global freeze block.
   • Cite — a small mono citation chip (paper · authors · venue · arXiv id). The
     strings are passed in verbatim from docs/BUILDER_DEPTH.md — never invented.
   • HonestyTag — the proven→proposed gradient shown AS a feature. Colour maps by
     meaning to the MASTER palette; never colour alone (glyph + text).
   ──────────────────────────────────────────────────────────────────────────── */

export type TagKind = "SHIPPED" | "DESIGNED" | "TO VALIDATE" | "HYPOTHESIS" | "INFERENCE";

const TAGS: Record<TagKind, { color: string; glyph: string }> = {
  SHIPPED: { color: "var(--c-teal)", glyph: "✓" },
  DESIGNED: { color: "var(--c-muted)", glyph: "⚙" },
  "TO VALIDATE": { color: "var(--c-amber)", glyph: "?" },
  HYPOTHESIS: { color: "var(--c-amber)", glyph: "◇" },
  INFERENCE: { color: "var(--c-muted)", glyph: "∿" },
};

export function HonestyTag({ kind }: { kind: TagKind }) {
  const t = TAGS[kind];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{
        color: t.color,
        borderColor: t.color,
        backgroundColor: `color-mix(in srgb, ${t.color} 12%, transparent)`,
      }}
    >
      <span aria-hidden>{t.glyph}</span>
      {kind}
    </span>
  );
}

export function Cite({ name, meta }: { name: string; meta: string }) {
  return (
    <span className="inline-flex flex-col rounded-md border border-border/70 bg-surface-2/50 px-2.5 py-1.5 font-mono text-[11px] leading-tight">
      <span className="text-text">{name}</span>
      <span className="mt-0.5 text-muted">{meta}</span>
    </span>
  );
}

/** A row of "How I'd build it" bullets. */
export function BuildList({ children }: { children: ReactNode }) {
  return <ul className="space-y-2 text-sm leading-relaxed text-muted">{children}</ul>;
}

export function BuildItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden className="mt-0.5 shrink-0 text-teal">
        ›
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** A tagged note line (honesty tag + text) used inside disclosures. */
export function TaggedNote({ kind, children }: { kind: TagKind; children: ReactNode }) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed text-muted">
      <HonestyTag kind={kind} />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

export function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-surface-2/25">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal"
      >
        <span className="text-sm font-semibold text-text">{label}</span>
        <span
          aria-hidden
          className="font-mono text-muted transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          ▾
        </span>
      </button>
      <div
        id={panelId}
        aria-hidden={!open}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={
              "px-4 pb-4 transition-opacity duration-300 " + (open ? "opacity-100" : "opacity-0")
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Wrapper that stacks a scene's 1–2 disclosures full-width below the surface. */
export function SceneDepth({ children }: { children: ReactNode }) {
  return <div className="mt-8 space-y-3">{children}</div>;
}
