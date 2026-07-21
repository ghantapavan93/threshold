"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useConsole } from "./console-context";
import { useStageActive } from "./walkthrough";
import {
  Card,
  Chip,
  EmptyState,
  Section,
  StatusGlyph,
} from "./ui/primitives";
import { constraintLabel, CONSTRAINT_COLOR } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/scroll";
import { SilentWideningDiagram } from "./visual/illustrations";
import type { ConstraintResult } from "@/lib/schemas";

const STAR_KEY = "missing_attribute_semantics";

function Tile({
  constraint,
  expanded,
  onToggle,
  star,
  resolved,
}: {
  constraint: ConstraintResult;
  expanded: boolean;
  onToggle: () => void;
  star: boolean;
  resolved: boolean;
}) {
  const color = CONSTRAINT_COLOR[constraint.result];
  const isFocal = resolved && star && constraint.result === "FAIL";

  return (
    <Card
      holo
      className={
        "flex flex-col transition-all duration-300 " +
        (isFocal ? "glow-crimson-pulse md:col-span-2 md:row-span-2 " : "") +
        (resolved ? "" : "opacity-70")
      }
      style={{ borderColor: !resolved || constraint.result === "PASS" ? undefined : color }}
    >
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-col gap-2 rounded-xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className={
              "font-medium " + (isFocal ? "text-base" : "text-sm")
            }
          >
            {constraintLabel(constraint.key)}
            {star ? (
              <span className="ml-2 align-middle text-[10px] uppercase tracking-wide text-muted">
                ★ centerpiece
              </span>
            ) : null}
          </span>
          {resolved ? (
            <Chip color={color} icon={<StatusGlyph kind={constraint.result} />}>
              {constraint.result}
            </Chip>
          ) : (
            <Chip color="var(--c-muted)">
              <span className="animate-pulse">checking…</span>
            </Chip>
          )}
        </div>
        <p
          className={
            "text-xs text-muted " +
            (expanded || isFocal ? "" : "line-clamp-2")
          }
        >
          {constraint.detail}
        </p>
        {expanded || isFocal ? (
          <p className="mt-1 border-l-2 border-border pl-2 text-[11px] italic text-muted">
            Grounding: {constraint.grounding}
          </p>
        ) : (
          <span className="text-[11px] text-muted">
            {expanded ? "" : "Click for detail + grounding"}
          </span>
        )}
      </button>
    </Card>
  );
}

export function ConstraintHeatmap() {
  const { job } = useConsole();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const results = job?.constraint_results ?? [];
  // Sort so the star tile leads when it FAILs (the signature frame).
  const ordered = [...results].sort((a, b) => {
    if (a.key === STAR_KEY && a.result === "FAIL") return -1;
    if (b.key === STAR_KEY && b.result === "FAIL") return 1;
    return 0;
  });

  // When the walkthrough lands here, the tiles resolve one-by-one — each shows
  // "checking…" then flips to its real PASS/WARN/FAIL — so the gate visibly does
  // the work. Absent a walk (plain load / manual scroll) every tile is resolved.
  const { visits } = useStageActive("constraint-heatmap");
  const [resolvedCount, setResolvedCount] = useState(Number.POSITIVE_INFINITY);
  useEffect(() => {
    if (visits === 0) return; // never walked to → leave all resolved
    if (prefersReducedMotion() || ordered.length === 0) {
      setResolvedCount(ordered.length);
      return;
    }
    setResolvedCount(0);
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setResolvedCount(n);
      if (n >= ordered.length) window.clearInterval(t);
    }, 220);
    return () => window.clearInterval(t);
    // Replay the resolve each time the spotlight lands (visits changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits]);

  return (
    <Section
      id="constraint-heatmap"
      index={3}
      title="Constraint Heatmap"
      subtitle="Every tile maps to a verified Rokt fact. The missing-attribute-semantics tile is the star: when it FAILs, it is the visual focal point."
    >
      {!job ? (
        <EmptyState
          icon={<SilentWideningDiagram className="w-64 max-w-full" />}
          title="No constraints evaluated yet"
          hint="Run a Policy Diff Replay below to evaluate the constraint catalog against replayed sessions. The trap: an operator flip that silently widens a band of missing-attribute sessions from ineligible to eligible."
        />
      ) : results.length === 0 ? (
        <EmptyState title="This run returned no constraint results." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((c, i) => (
            <Tile
              key={c.key}
              constraint={c}
              star={c.key === STAR_KEY}
              resolved={i < resolvedCount}
              expanded={openKey === c.key}
              onToggle={() => setOpenKey((k) => (k === c.key ? null : c.key))}
            />
          ))}
        </div>
      )}

      {/* Cross-link to the domain model behind the missing-attribute behaviour. */}
      <p className="mt-3 text-sm text-muted">
        Why does this rule behave differently when an attribute is missing?{" "}
        <Link
          href="/moment-forge"
          className="font-medium text-teal underline decoration-teal/40 underline-offset-4 transition-colors hover:decoration-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          Open the Semantic Change Compiler →
        </Link>
      </p>
    </Section>
  );
}
