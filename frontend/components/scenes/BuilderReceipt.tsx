"use client";

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

const MAPS: { skill: string; from: string }[] = [
  { skill: "Product reasoning", from: "framed a checkout-safety problem, not a feature" },
  { skill: "Full-stack execution", from: "deterministic engine + live console + 3D scenes" },
  { skill: "Failure handling", from: "fail-closed, contained, dedupe-on-retry" },
  { skill: "AI supervision", from: "proposals generated, evidence decided what survived" },
  { skill: "Observability", from: "one correlated view; Healthy/Degraded/Recovering" },
  { skill: "Experiment discipline", from: "safety ≠ lift; hands off to a Would-Have-Seen holdout" },
];

export function BuilderReceipt() {
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
        <dl className="mt-3 space-y-1.5">
          {LINES.map((l) => (
            <div key={l.k} className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-muted">{l.k}</dt>
              <span aria-hidden className="min-w-0 flex-1 translate-y-[-2px] overflow-hidden text-muted/40">
                ······························
              </span>
              <dd className="shrink-0 text-right" style={{ color: l.tone ?? "var(--c-text)" }}>{l.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 border-t border-dashed pt-2 text-center text-[10px] uppercase tracking-[0.2em] text-muted" style={{ borderColor: "var(--c-border)" }}>
          verdict · BLOCKED — caught pre-flight
        </p>
      </div>

      {/* what it maps to */}
      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal">What you just watched me do</p>
        <ul className="mt-3 space-y-2.5">
          {MAPS.map((m) => (
            <li key={m.skill} className="text-sm">
              <span className="font-semibold text-text">{m.skill}</span>
              <span className="text-muted"> — {m.from}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          Not a list of skills — a receipt of proof you created by using the product.
        </p>
      </div>
    </div>
  );
}
