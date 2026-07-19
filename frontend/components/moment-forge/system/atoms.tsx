"use client";

import type { ArchNode, Status } from "./model";
import { TONE } from "./model";

/* Status badge: colour + glyph (● solid SHIPPED / ◌ dashed DESIGNED) + text +
   Milestone letter — never colour-alone (MASTER). */
export function ShippedDesignedTag({ status, milestone }: { status: Status; milestone?: string }) {
  const meta =
    status === "SHIPPED"
      ? { color: "var(--c-teal)", glyph: "●", text: "SHIPPED" }
      : status === "MODELED"
        ? { color: "var(--c-muted)", glyph: "◌", text: "MODELED" }
        : { color: "var(--c-amber)", glyph: "◌", text: "DESIGNED" };
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide"
      style={{ color: meta.color, borderColor: meta.color, backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}
    >
      <span aria-hidden>{meta.glyph}</span>
      {meta.text}
      {milestone ? <span className="opacity-80">· {milestone}</span> : null}
    </span>
  );
}

export function ProtocolChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-border/70 bg-surface-2/50 px-1.5 py-0.5 font-mono text-[10px] text-text">
      {children}
    </span>
  );
}

/* Per-level key — the non-hover home for status + edge protocol facts. */
export function Legend({ edges }: { edges: { protocol: string; detail: string; status?: Status }[] }) {
  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-surface-2/25 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Legend · status + protocols</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <ShippedDesignedTag status="SHIPPED" />
        <ShippedDesignedTag status="DESIGNED" />
        <ShippedDesignedTag status="MODELED" />
      </div>
      <ul className="mt-3 space-y-1.5">
        {edges.map((e, i) => (
          <li key={i} className="text-[11px] leading-relaxed text-muted">
            <ProtocolChip>{e.protocol}</ProtocolChip>{" "}
            <span>{e.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ZoomTrail({
  level,
  focusName,
  onCrumb,
}: {
  level: 1 | 2 | 3;
  focusName?: string;
  onCrumb: (l: 1 | 2 | 3) => void;
}) {
  const crumbs: { l: 1 | 2 | 3; label: string }[] = [
    { l: 1, label: "System" },
    { l: 2, label: "Containers" },
    { l: 3, label: focusName ?? "Components" },
  ];
  return (
    <nav aria-label="Zoom breadcrumb" className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
      {crumbs.slice(0, level).map((c, i) => (
        <span key={c.l} className="flex items-center gap-1">
          {i > 0 ? <span aria-hidden className="text-muted">▸</span> : null}
          <button
            type="button"
            onClick={() => onCrumb(c.l)}
            aria-current={c.l === level ? "true" : undefined}
            className={
              "rounded px-1.5 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
              (c.l === level ? "text-teal" : "text-muted hover:text-text")
            }
          >
            {c.label}
          </button>
        </span>
      ))}
    </nav>
  );
}

export function NodeCard({ node, onClose }: { node: ArchNode; onClose: () => void }) {
  const color = TONE[node.tone];
  return (
    <div className="glass rounded-2xl p-5" style={{ borderColor: color }} aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-text">{node.name}</h3>
            <ShippedDesignedTag status={node.status} milestone={node.milestone} />
          </div>
          {node.anchor ? <p className="mt-1 font-mono text-[11px] text-teal">{node.anchor}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-2 py-1 text-[11px] text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          Close ✕
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{node.role}</p>
      {node.tables?.length ? (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Tables</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {node.tables.map((t) => (
              <ProtocolChip key={t}>{t}</ProtocolChip>
            ))}
          </div>
        </div>
      ) : null}
      {node.invariants?.length ? (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Invariants it upholds</p>
          <ul className="mt-1 space-y-1">
            {node.invariants.map((iv) => (
              <li key={iv} className="flex gap-1.5 text-[11px] leading-relaxed text-muted">
                <span aria-hidden className="text-teal">✓</span>
                <span>{iv}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
