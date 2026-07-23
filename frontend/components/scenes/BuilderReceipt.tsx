"use client";

import { useStoryLog, ACTION_LABELS } from "@/lib/story-log";

/* The Builder Evidence Receipt — not a generic "skills" section, but a receipt of
   the session the prototype just walked the reviewer through, with each line
   mapped to what the role actually needs. Far more memorable than claiming
   full-stack skills: the reviewer watched the proof get created.

   Honest by construction — every figure is the demonstrated V17 → V18 run (200
   sessions, 21 widened, BLOCKED), and the receipt states plainly what is proven
   versus what still requires a live holdout. */

const LINES: { k: string; v: string; tone?: string }[] = [
  { k: "Policy inspected", v: "V17 → V18" },
  { k: "Semantic risk found", v: "missing-attribute widening", tone: "var(--c-crimson)" },
  { k: "Sessions replayed", v: "200 · deterministic, seed 42" },
  { k: "Affected decisions", v: "21 silently widened", tone: "var(--c-crimson)" },
  { k: "Failures injected", v: "timeout · corrupt output · stale identity" },
  { k: "Customer transaction", v: "preserved — fail-closed", tone: "var(--c-teal)" },
  { k: "Business state", v: "deduplicated — zero double obligation", tone: "var(--c-teal)" },
  { k: "Causal impact", v: "not yet proven — needs a holdout", tone: "var(--c-amber)" },
  { k: "Release outcome", v: "eligible only after correction + controlled measurement" },
];

export function BuilderReceipt() {
  const actions = useStoryLog();
  return (
    <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
      {/* the receipt */}
      <div
        className="rounded-xl border-2 border-dashed p-5 font-mono text-xs"
        style={{ borderColor: "var(--c-border-strong)", backgroundColor: "var(--c-base)" }}
      >
        <div className="flex items-center justify-between border-b border-dashed pb-2" style={{ borderColor: "var(--c-border)" }}>
          <span className="font-semibold uppercase tracking-[0.18em] text-text">Builder session</span>
          <span className="text-muted">THRESHOLD</span>
        </div>
        {/* An aligned two-column grid: labels size to the widest one, values take
            the rest and wrap right-aligned. It cannot overlap at any width or zoom
            (the old dotted-leader row let long values collide with the label). */}
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          {LINES.map((l) => (
            <div key={l.k} className="contents">
              <dt className="whitespace-nowrap text-muted">{l.k}</dt>
              <dd className="min-w-0 break-words text-right" style={{ color: l.tone ?? "var(--c-text)" }}>{l.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 border-t border-dashed pt-2 text-center text-[10px] uppercase tracking-[0.2em] text-muted" style={{ borderColor: "var(--c-border)" }}>
          verdict · BLOCKED — caught pre-flight
        </p>
      </div>

      {/* what YOU actually did — recorded live from the story log */}
      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal">This session · what you did</p>
        {actions.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Nothing logged yet. Approve or inspect the change, open an affected session, inject a failure,
            trace the machine — and your actual moves appear here, in order.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {actions.map((a, i) => (
              <li key={a} className="flex gap-2.5 text-sm">
                <span className="shrink-0 font-mono text-[11px] text-teal">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-text">{ACTION_LABELS[a]}</span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 border-t border-border/60 pt-3 text-[11px] leading-relaxed text-muted">
          Not a list of skills — a receipt of the proof you created by using the product. It maps to product
          reasoning, full-stack execution, failure handling, AI supervision, observability, and experiment discipline.
        </p>
      </div>
    </div>
  );
}
