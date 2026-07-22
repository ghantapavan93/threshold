"use client";

import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import { prefersReducedMotion } from "@/components/builder/anim";
import { ShippedDesignedTag, NodeCard, ZoomTrail, Legend } from "./atoms";
import { DeterminismBoundaryCard } from "./DeterminismBoundary";
import {
  L1_EDGES,
  L1_NODES,
  L2_EDGES,
  L2_NODES,
  L3_CORE,
  L3_SHELL,
  TONE,
  type ArchEdge,
  type ArchNode,
} from "./model";

const VW = 1000;
const VH = 640;
const BOUNDARY_X = 58; // % — the determinism rule between shell and core

type Level = 1 | 2 | 3;
type Panel = { kind: "node"; node: ArchNode } | { kind: "boundary" } | null;

function nodesFor(level: Level): ArchNode[] {
  if (level === 1) return L1_NODES;
  if (level === 2) return L2_NODES;
  return [...L3_SHELL, ...L3_CORE];
}
function edgesFor(level: Level): ArchEdge[] {
  return level === 1 ? L1_EDGES : level === 2 ? L2_EDGES : [];
}
const ZOOM_TARGET: Record<number, string> = { 1: "threshold", 2: "fastapi" };

function EdgeLayer({ edges, nodes, level }: { edges: ArchEdge[]; nodes: ArchNode[]; level: Level }) {
  const pos = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    return n ? { x: (n.x / 100) * VW, y: (n.y / 100) * VH } : null;
  };
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 h-full w-full" aria-hidden>
      {edges.map((e, i) => {
        const a = pos(e.from);
        const b = pos(e.to);
        if (!a || !b) return null;
        const dashed = e.status === "DESIGNED";
        const color = dashed ? "var(--c-amber)" : "var(--c-border-strong)";
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={e.thick ? 3 : 1.5} strokeDasharray={dashed ? "8 6" : undefined} strokeLinecap="round" opacity={0.7} />
            {/* a call travels the edge between components */}
            <circle r={2.6} fill={color} className="dg-dot dg-slow" style={{ offsetPath: `path('M${a.x} ${a.y} L${b.x} ${b.y}')` } as CSSProperties} />
          </g>
        );
      })}
      {level === 3 && (
        <g>
          <line x1={(BOUNDARY_X / 100) * VW} y1={40} x2={(BOUNDARY_X / 100) * VW} y2={VH - 40} stroke="var(--c-teal)" strokeWidth={3} />
        </g>
      )}
    </svg>
  );
}

function NodeButton({
  node,
  isZoomTarget,
  onActivate,
}: {
  node: ArchNode;
  isZoomTarget: boolean;
  onActivate: () => void;
}) {
  const color = TONE[node.tone];
  return (
    <button
      type="button"
      id={`arch-${node.id}`}
      onClick={onActivate}
      aria-label={`${node.name}, ${node.status}, ${node.role}${isZoomTarget ? " — press to zoom in" : ""}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface/90 px-2.5 py-1.5 text-center backdrop-blur transition-all duration-200 hover:-translate-y-[calc(50%+2px)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      style={{ left: `${node.x}%`, top: `${node.y}%`, width: `${node.w ?? 20}%`, borderColor: color, borderStyle: node.status === "SHIPPED" ? "solid" : "dashed" }}
    >
      <span className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-semibold leading-tight text-text">{node.name}</span>
        <ShippedDesignedTag status={node.status} milestone={node.milestone} />
        {isZoomTarget ? <span aria-hidden className="font-mono text-[9px] text-teal">⤢ zoom in</span> : null}
      </span>
    </button>
  );
}

function StaticFigure({ level, title }: { level: Level; title: string }) {
  const nodes = nodesFor(level);
  const edges = edgesFor(level);
  return (
    <figure className="rounded-2xl border border-border/60 bg-surface/50 p-4">
      <figcaption className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-teal">
        L{level} · {title}
      </figcaption>
      <ol className="grid gap-2 sm:grid-cols-2">
        {nodes.map((n) => (
          <li key={n.id} className="rounded-lg border p-2.5" style={{ borderColor: TONE[n.tone] }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-text">{n.name}</span>
              <ShippedDesignedTag status={n.status} milestone={n.milestone} />
            </div>
            {n.anchor ? <p className="mt-0.5 font-mono text-[10px] text-teal">{n.anchor}</p> : null}
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{n.role}</p>
          </li>
        ))}
      </ol>
      {level === 3 ? (
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-teal">
          ▚ Determinism boundary — enforced by backend/tests/test_architecture.py: the pure core may
          not import any LLM / HTTP / DB / web-framework / persistence module. The build fails if it tries.
        </p>
      ) : null}
      <Legend edges={edges} />
    </figure>
  );
}

export function C4Stage() {
  const [reduced, setReduced] = useState(false);
  const [level, setLevel] = useState<Level>(1);
  const [panel, setPanel] = useState<Panel>(null);
  const [announce, setAnnounce] = useState("");
  useEffect(() => setReduced(prefersReducedMotion()), []);

  const nodes = useMemo(() => nodesFor(level), [level]);
  const edges = useMemo(() => edgesFor(level), [level]);

  const zoomTo = (l: Level) => {
    setLevel(l);
    setPanel(null);
    setAnnounce(`Zoomed to level ${l}: ${l === 1 ? "System context" : l === 2 ? "Containers" : "Components"}. ${nodesFor(l).length} nodes.`);
  };

  const onNode = (n: ArchNode) => {
    if (ZOOM_TARGET[level] === n.id && level < 3) zoomTo((level + 1) as Level);
    else setPanel({ kind: "node", node: n });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (panel) setPanel(null);
      else if (level > 1) zoomTo((level - 1) as Level);
    }
  };

  const stacked = (
    // The complete final state — three stacked, labelled figures. Used for
    // reduced-motion (all viewports) and as the mobile layout (no tiny tap targets).
    <div className="space-y-4">
      <StaticFigure level={1} title="System context" />
      <StaticFigure level={2} title="Containers" />
      <StaticFigure level={3} title="Components" />
    </div>
  );

  if (reduced) return stacked;

  const focusName = level === 3 ? "Pure core" : undefined;

  const interactive = (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ZoomTrail level={level} focusName={focusName} onCrumb={(l) => zoomTo(l)} />
        <p className="font-mono text-[11px] text-muted">
          L{level} ·{" "}
          <span className="text-text">{level === 1 ? "System context" : level === 2 ? "Containers" : "Components"}</span>
          {level > 1 ? " · Esc to zoom out" : ""}
        </p>
      </div>

      <div aria-live="polite" className="sr-only">{announce}</div>

      <div
        role="group"
        aria-label={`C4 architecture, level ${level}`}
        onKeyDown={onKey}
        className="relative mt-3 w-full overflow-hidden rounded-2xl border border-border/60 bg-base/30"
        style={{ aspectRatio: `${VW} / ${VH}` }}
      >
        <div key={level} className="thr-rise absolute inset-0">
          <EdgeLayer edges={edges} nodes={nodes} level={level} />
          {level === 3 && (
            <button
              type="button"
              onClick={() => setPanel({ kind: "boundary" })}
              aria-label="Determinism boundary — enforced by the AST fitness test. Press to reveal the real test."
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal bg-base px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-teal shadow-glow-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              style={{ left: `${BOUNDARY_X}%` }}
            >
              ▚ boundary
            </button>
          )}
          {nodes.map((n) => (
            <NodeButton key={n.id} node={n} isZoomTarget={ZOOM_TARGET[level] === n.id && level < 3} onActivate={() => onNode(n)} />
          ))}
        </div>
      </div>

      {/* detail panel */}
      {panel ? (
        <div className="mt-4">
          {panel.kind === "boundary" ? (
            <DeterminismBoundaryCard onClose={() => setPanel(null)} />
          ) : (
            <NodeCard node={panel.node} onClose={() => setPanel(null)} />
          )}
        </div>
      ) : null}

      <Legend edges={edges} />
    </div>
  );

  return (
    <>
      <div className="sm:hidden">{stacked}</div>
      <div className="hidden sm:block">{interactive}</div>
    </>
  );
}
