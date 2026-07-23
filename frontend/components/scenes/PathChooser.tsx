"use client";

/* Two quiet doors at the entrance — the same page, two depths. A reviewer short on
   time takes the story; an engineer takes the system. Both converge at the working
   console, so neither path is a dead end. It just chooses where you start.

   Deliberately understated (no modal, no forced choice) — you can also ignore it
   and scroll. Each door smooth-scrolls to the right starting section. */

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function go(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
}

export function PathChooser() {
  return (
    <section aria-label="Choose a path" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Three ways in</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => go("story-title")}
          className="press group rounded-2xl border border-border bg-surface/50 p-5 text-left transition-colors hover:border-teal/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <p className="text-sm font-semibold text-text">Experience the story</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            ~90 seconds: the problem, the customer consequence, the intervention, the result.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--c-teal)" }}>
            for the reviewer <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => go("break-it")}
          className="press group rounded-2xl border border-border bg-surface/50 p-5 text-left transition-colors hover:border-crimson/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
        >
          <p className="text-sm font-semibold text-text">Break the transaction</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Attack the optional experience — inject a failure and watch checkout survive the fault.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--c-crimson)" }}>
            for the skeptic <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => go("scenes-title")}
          className="press group rounded-2xl border border-border bg-surface/50 p-5 text-left transition-colors hover:border-teal/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <p className="text-sm font-semibold text-text">Inspect the system</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            The playable proofs: the policy split, the trace, observability, scale, governance.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--c-offer-blue)" }}>
            for the engineer <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </button>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted">Both paths converge at the working console.</p>
    </section>
  );
}
