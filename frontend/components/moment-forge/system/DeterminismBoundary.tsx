"use client";

import { AST_TEST_SNIPPET, FORBIDDEN_RELATIVE, FORBIDDEN_TOPLEVEL } from "./model";

/* The lean-in moment: the boundary is not decorative. It is enforced by a real
   AST fitness test (backend/tests/test_architecture.py) that fails the build if
   the pure core imports an LLM / HTTP / DB / web-framework / persistence module.
   Quoted accurately from the repo. */
export function DeterminismBoundaryCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="glass rounded-2xl p-5" style={{ borderColor: "var(--c-teal)" }} aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="type-eyebrow text-teal">The determinism boundary</h3>
          <p className="mt-1 text-lg font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            The build enforces it — it isn&apos;t just a line.
          </p>
          <p className="mt-1 font-mono text-[11px] text-teal">backend/tests/test_architecture.py</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-2 py-1 text-[11px] text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          Close ✕
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        An AST fitness test parses every module in <code className="font-mono text-text">app/domain/*</code> and fails the
        build if any of them imports a forbidden dependency. No LLM, no network, no DB, no web framework, no clock, no RNG
        crosses this line. Grounds Invariants #3 and #4.
      </p>

      <pre className="scroll-x mt-4 overflow-x-auto rounded-lg border border-border bg-base/60 p-3 font-mono text-[11px] leading-relaxed text-text">
        <code>{AST_TEST_SNIPPET}</code>
      </pre>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-crimson">Forbidden top-level imports</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {FORBIDDEN_TOPLEVEL.map((m) => (
              <span key={m} className="rounded border border-crimson/30 bg-crimson/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-crimson">
                {m}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-crimson">Forbidden relative imports</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {FORBIDDEN_RELATIVE.map((m) => (
              <span key={m} className="rounded border border-crimson/30 bg-crimson/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-crimson">
                .{m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
