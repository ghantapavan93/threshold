"use client";

import { useMemo, useState } from "react";
import { CONTEXTS, EDGES, PATTERNS, type BC, type Edge } from "./content";

/* ────────────────────────────────────────────────────────────────────────────
   The Living Bounded-Context Map (Fig. 02) — the page's signature interaction.
   Deterministic hand-authored layout (Core center). Edges ARE the DDD
   relationship patterns and explain themselves on hover/focus. Nodes are real
   <button>s (keyboard + focus); on mobile the graph reflows to a stacked list.
   Status is pattern = color + line-style + glyph + label (never color alone).
   No animation is required for meaning — the static drawn map is complete.
   ──────────────────────────────────────────────────────────────────────────── */

const VW = 960;
const VH = 600;

function byId(id: string): BC | undefined {
  return CONTEXTS.find((c) => c.id === id);
}

function kindColor(kind: BC["kind"]): string {
  return kind === "core"
    ? "var(--c-teal)"
    : kind === "emerging"
      ? "var(--c-amber)"
      : "var(--c-muted)";
}

function edgesTouching(id: string): Edge[] {
  return EDGES.filter((e) => e.from === id || e.to === id);
}

function EdgeLine({
  edge,
  state,
}: {
  edge: Edge;
  state: "idle" | "active" | "dimmed";
}) {
  const a = byId(edge.from);
  const b = byId(edge.to);
  if (!a || !b) return null;
  const p = PATTERNS[edge.pattern];
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const opacity = state === "dimmed" ? 0.12 : state === "active" ? 1 : 0.5;
  const width = (p.line === "thick" ? 3 : p.line === "double" ? 2 : 1.6) * (state === "active" ? 1.4 : 1);
  return (
    <g style={{ transition: "opacity 160ms" }} opacity={opacity}>
      {p.line === "double" && (
        <line x1={a.x} y1={a.y - 2.5} x2={b.x} y2={b.y - 2.5} stroke={p.accent} strokeWidth={1} strokeOpacity={0.6} />
      )}
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={p.accent}
        strokeWidth={width}
        strokeDasharray={p.dash || undefined}
        strokeLinecap="round"
      />
      {/* midpoint glyph chip */}
      <g transform={`translate(${mx} ${my})`}>
        <circle r="11" fill="var(--c-base)" stroke={p.accent} strokeWidth="1" />
        <text x="0" y="4" textAnchor="middle" fontSize="12" fill={p.accent} fontFamily="var(--font-mono, monospace)">
          {p.glyph}
        </text>
      </g>
    </g>
  );
}

function DetailPanel({
  ctx,
  pinned,
  onPick,
  onClear,
}: {
  ctx: BC;
  pinned: boolean;
  onPick: (id: string) => void;
  onClear: () => void;
}) {
  const rels = edgesTouching(ctx.id);
  return (
    <div
      aria-live="polite"
      className="glass flex h-full flex-col rounded-2xl p-5"
      style={{ borderColor: kindColor(ctx.kind) }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: kindColor(ctx.kind) }}>
            {ctx.code} · {ctx.kind}
          </p>
          <h3 className="mt-1 text-base font-semibold text-text">{ctx.name}</h3>
        </div>
        {pinned ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-border px-2 py-1 text-[11px] text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            Unpin ✕
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{ctx.responsibility}</p>
      <div className="mt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Language it owns</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {ctx.language.map((t) => (
            <span key={t} className="rounded border border-border/70 bg-surface-2/50 px-1.5 py-0.5 font-mono text-[10px] text-text">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 min-h-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Relationships ({rels.length})
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {rels.map((e) => {
            const otherId = e.from === ctx.id ? e.to : e.from;
            const other = byId(otherId);
            const p = PATTERNS[e.pattern];
            return (
              <li key={`${e.from}-${e.to}`}>
                <button
                  type="button"
                  onClick={() => other && onPick(other.id)}
                  disabled={!other}
                  className="w-full rounded-lg border border-border/60 bg-surface-2/30 p-2 text-left transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal disabled:opacity-60"
                >
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span aria-hidden style={{ color: p.accent }}>{p.glyph}</span>
                    <span className="font-mono text-[11px] font-semibold" style={{ color: p.accent }}>
                      {p.name}
                    </span>
                    <span className="text-[11px] text-muted">
                      → {other ? other.name : otherId}
                    </span>
                    {e.danger ? (
                      <span className="rounded-full border border-crimson/50 bg-crimson/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-crimson">
                        ⚠ fracture seam
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-muted">{e.why}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function PatternLegend() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {Object.values(PATTERNS).map((p) => (
        <div key={p.key} className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface-2/30 px-3 py-2">
          <span aria-hidden className="mt-0.5 font-mono text-sm" style={{ color: p.accent }}>{p.glyph}</span>
          <div>
            <p className="font-mono text-[11px] font-semibold" style={{ color: p.accent }}>{p.name}</p>
            <p className="text-[11px] leading-relaxed text-muted">{p.oneLiner}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContextMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>("decisioning");
  const active = hovered ?? pinned ?? "decisioning";
  const activeEdges = useMemo(() => new Set(edgesTouching(active).map((e) => `${e.from}-${e.to}`)), [active]);

  const activeCtx = byId(active)!;

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr] lg:items-stretch">
        {/* Spatial map (desktop) — decorative SVG edges + real HTML node buttons */}
        <div className="hidden sm:block">
          <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-base/30" style={{ aspectRatio: `${VW} / ${VH}` }}>
            <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 h-full w-full" aria-hidden>
              {EDGES.map((e) => {
                const key = `${e.from}-${e.to}`;
                const st = activeEdges.has(key) ? "active" : hovered || pinned ? "dimmed" : "idle";
                return <EdgeLine key={key} edge={e} state={st} />;
              })}
            </svg>
            <div
              role="group"
              aria-label="Bounded-context map. Each node is a context; select one to see its relationships."
              className="absolute inset-0"
            >
              {CONTEXTS.map((c) => {
                const isActive = c.id === active;
                const dim = (hovered || pinned) && !isActive && !edgesTouching(active).some((e) => e.from === c.id || e.to === c.id);
                const color = kindColor(c.kind);
                return (
                  <button
                    key={c.id}
                    type="button"
                    id={`context-${c.id}`}
                    onMouseEnter={() => setHovered(c.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(c.id)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setPinned(c.id)}
                    aria-pressed={pinned === c.id}
                    aria-label={`${c.name}, ${c.code}, ${c.kind} context, ${edgesTouching(c.id).length} relationships`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface/90 px-3 py-2 text-center backdrop-blur transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                    style={{
                      left: `${(c.x / VW) * 100}%`,
                      top: `${(c.y / VH) * 100}%`,
                      borderColor: color,
                      opacity: dim ? 0.4 : 1,
                      transform: `translate(-50%,-50%) scale(${isActive ? 1.05 : 1})`,
                      boxShadow: isActive ? `0 0 0 1px ${color}, 0 0 24px -10px ${color}` : undefined,
                      width: c.kind === "core" ? 148 : 132,
                    }}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {c.kind === "core" ? <span aria-hidden className="text-teal">▚</span> : null}
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color }}>
                        {c.code}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold leading-tight text-text">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail panel (desktop) */}
        <div className="hidden lg:block">
          <DetailPanel ctx={activeCtx} pinned={pinned === active} onPick={setPinned} onClear={() => setPinned(null)} />
        </div>

        {/* Mobile / small: stacked, hierarchically-indented list */}
        <div className="space-y-3 sm:hidden">
          {CONTEXTS.map((c) => {
            const on = c.id === active;
            const color = kindColor(c.kind);
            return (
              <div key={c.id} style={{ marginLeft: c.kind === "core" ? 0 : 16 }}>
                <button
                  type="button"
                  onClick={() => setPinned(on && pinned === c.id ? null : c.id)}
                  aria-expanded={on}
                  className="glass w-full rounded-xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                  style={{ borderColor: on ? color : undefined }}
                >
                  <span className="flex items-center gap-2">
                    {c.kind === "core" ? <span aria-hidden className="text-teal">▚</span> : null}
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color }}>{c.code}</span>
                    <span className="text-sm font-semibold text-text">{c.name}</span>
                  </span>
                  {on ? <span className="mt-2 block text-sm leading-relaxed text-muted">{c.responsibility}</span> : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel (tablet, below the map) */}
      <div className="mt-4 hidden sm:block lg:hidden">
        <DetailPanel ctx={activeCtx} pinned={pinned === active} onPick={setPinned} onClear={() => setPinned(null)} />
      </div>

      <PatternLegend />
    </div>
  );
}
