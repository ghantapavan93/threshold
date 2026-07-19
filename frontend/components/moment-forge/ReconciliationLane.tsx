"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useReconciliationAudit, useReconciliationProof } from "@/lib/hooks";
import type { ReconciliationAudit, ReconciliationProof } from "@/lib/schemas";
import { reconciliationFixture } from "./fixtures";

/* ────────────────────────────────────────────────────────────────────────────
   Reconciliation Lane (Fig. 03c) — closes W2 of the integration critique: the
   cross-aggregate invariant `earned ⇒ issued` cannot live inside one aggregate
   (Vernon: eventual consistency outside the boundary), so a Process Manager must
   consume the event stream and PROVE the lifecycle closed. Same seeded fault
   world, two integration patterns: dual-write diverges SILENTLY (orphaned earns,
   double-issues); the transactional outbox turns every failure VISIBLE. Live via
   POST /reconciliation-audit; a second lane replays the proof over the REAL
   replay-job fan-out rows via GET /reconciliation. Offline = recorded fixture,
   Zod-validated; the real-rows lane needs the live backend and says so.
   ──────────────────────────────────────────────────────────────────────────── */

type Status = "idle" | "loading" | "ok" | "error";
type StrategyKey = "dual_write" | "outbox";

type Tone = "teal" | "crimson" | "amber";

const CLASS_META: { key: string; label: string; glyph: string; tone: Tone }[] = [
  { key: "consistent", label: "consistent — issued exactly once", glyph: "▛", tone: "teal" },
  { key: "orphaned_earn", label: "orphaned earn — qualified, never received", glyph: "✕", tone: "crimson" },
  { key: "double_issue", label: "double issue — one earn, two liabilities", glyph: "✕", tone: "crimson" },
  { key: "visible_dead_letter", label: "dead-letter — failed, but VISIBLE", glyph: "◷", tone: "amber" },
];

const TONE_BOX: Record<Tone, string> = {
  teal: "border-teal/40 bg-teal/[0.05]",
  crimson: "border-crimson/40 bg-crimson/[0.05]",
  amber: "border-amber/40 bg-amber/[0.06]",
};
const TONE_TEXT: Record<Tone, string> = {
  teal: "text-teal",
  crimson: "text-crimson",
  amber: "text-amber",
};

export function ReconciliationLane({ offline }: { offline: boolean }) {
  const audit = useReconciliationAudit();
  const proof = useReconciliationProof();
  const [strategy, setStrategy] = useState<StrategyKey>("dual_write");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ReconciliationAudit | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const [proofStatus, setProofStatus] = useState<Status>("idle");
  const [proofResult, setProofResult] = useState<ReconciliationProof | null>(null);
  const [proofErr, setProofErr] = useState<ApiError | null>(null);

  const run = async () => {
    setStatus("loading");
    setErr(null);
    const loadFixture = () => {
      setResult(reconciliationFixture());
      setUsedFixture(true);
      setStatus("ok");
    };
    if (offline) {
      try {
        loadFixture();
      } catch (e) {
        setErr(e instanceof ApiError ? e : new ApiError({ kind: "validation", message: String(e) }));
        setStatus("error");
      }
      return;
    }
    try {
      const d = await audit.mutateAsync({ seed: 42, count: 200 });
      setResult(d);
      setUsedFixture(false);
      setStatus("ok");
    } catch (e) {
      const ae = e instanceof ApiError ? e : new ApiError({ kind: "network", message: String(e) });
      if (ae.isUnreachable) {
        try {
          loadFixture();
        } catch (e2) {
          setErr(e2 instanceof ApiError ? e2 : ae);
          setStatus("error");
        }
      } else {
        setErr(ae);
        setStatus("error");
      }
    }
  };

  const runProof = async () => {
    setProofStatus("loading");
    setProofErr(null);
    try {
      const d = await proof.mutateAsync();
      setProofResult(d);
      setProofStatus("ok");
    } catch (e) {
      setProofErr(e instanceof ApiError ? e : new ApiError({ kind: "network", message: String(e) }));
      setProofStatus("error");
    }
  };

  const report = result ? result.strategies[strategy] : null;
  const silent = report?.silent_divergence ?? 0;
  const silentTone = silent > 0 ? "var(--c-crimson)" : "var(--c-teal)";

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      {/* the boundary: BC-4 ⟷ [strategy] ⟷ Fulfilment */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md border border-offer-blue/40 bg-offer-blue/[0.06] px-2.5 py-1 font-mono text-xs text-offer-blue">
          BC-4 Loyalty
        </span>
        <span aria-hidden className="font-mono text-muted">⟷</span>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs"
          style={{
            color: strategy === "outbox" ? "var(--c-teal)" : "var(--c-crimson)",
            borderColor: strategy === "outbox" ? "var(--c-teal)" : "var(--c-crimson)",
          }}
        >
          <span aria-hidden>▣</span> {strategy === "outbox" ? "transactional outbox" : "dual-write (the bug)"}
        </span>
        <span aria-hidden className="font-mono text-muted">⟷</span>
        <span className="rounded-md border border-teal/40 bg-teal/[0.06] px-2.5 py-1 font-mono text-xs text-teal">
          Fulfilment / Ledger
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-border/70 pb-3 font-mono text-xs text-muted">
        <span className="text-teal">forge$</span>
        <span>reconcile</span>
        <span className="text-text">invariant=earned⇒issued</span>
        <button
          type="button"
          role="switch"
          aria-checked={strategy === "outbox"}
          onClick={() => setStrategy((s) => (s === "outbox" ? "dual_write" : "outbox"))}
          className="press ml-1 inline-flex min-h-[36px] items-center gap-2 rounded-md border border-border px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
        >
          <span className={strategy === "dual_write" ? "text-crimson" : "text-muted"}>dual-write</span>
          <span aria-hidden>⇄</span>
          <span className={strategy === "outbox" ? "text-teal" : "text-muted"}>▣ outbox</span>
        </button>
        <button
          type="button"
          onClick={run}
          disabled={status === "loading"}
          className="press ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
        >
          {status === "loading" ? "reconciling…" : "▸ Reconcile"}
        </button>
      </div>

      {offline ? (
        <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[11px] text-amber">
          ◷ Offline — showing recorded engine output. The real-rows proof needs the live backend.
        </p>
      ) : null}

      <div aria-live="polite" aria-busy={status === "loading"} className="mt-4 min-h-[6rem]">
        {status === "idle" && (
          <p className="font-mono text-xs text-muted">
            Replay 200 earned rewards through the same seeded fault world under both integration patterns, then let
            the Reconciliation Process consume the event stream and classify every lifecycle. Real backend output only.
          </p>
        )}

        {status === "loading" && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 w-full animate-pulse-soft rounded bg-surface-2/60" />
            ))}
          </div>
        )}

        {status === "error" && err && (
          <div role="alert" className="rounded-lg border border-crimson/50 bg-crimson/10 p-4">
            <p className="font-mono text-sm font-semibold text-crimson">
              {err.isUnreachable ? "✕ Reconciliation service unreachable — this is a live call, not a mock." : err.kind === "validation" ? "✕ Response did not match the API contract." : "✕ Reconciliation audit failed."}
            </p>
            {err.message ? <p className="mt-1 font-mono text-[11px] text-text">{err.message}</p> : null}
            {err.requestId ? <p className="mt-1 font-mono text-[11px] text-muted">X-Request-ID: {err.requestId}</p> : null}
            <button type="button" onClick={run} className="press mt-3 rounded-md border border-border px-3 py-1 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">Retry</button>
          </div>
        )}

        {status === "ok" && result && report && (
          <div className="space-y-4">
            <p className="font-mono text-[11px] text-teal">
              {usedFixture ? "recorded" : "live"} · {result.count} earns · seed {result.seed} · {result.boundary}
            </p>

            {/* the number that matters: SILENT divergence under the selected pattern */}
            <div className="rounded-lg border p-4" style={{ borderColor: silentTone }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  earns that diverged with NO visible trace
                </p>
                <p className="font-mono text-[11px]" style={{ color: silentTone }}>
                  {strategy === "outbox" ? "▣ transactional outbox" : "◌ dual-write — the bug"}
                </p>
              </div>
              <p className="mt-1 font-mono text-4xl font-bold" style={{ color: silentTone }}>
                {silent}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {strategy === "outbox"
                  ? `The issue intent commits in the SAME transaction as the earn; failures retry and then dead-letter in the open. ${report.classes["visible_dead_letter"] ?? 0} failures remain — every one of them visible.`
                  : "The earn commits, then the issue is published separately. A crash between the two loses the intent; a blind retry issues twice. Nothing records that either happened — that is what silent means."}
              </p>
            </div>

            {/* lifecycle classes under the selected strategy */}
            <div className="grid gap-3 sm:grid-cols-2">
              {CLASS_META.map((c) => {
                const n = report.classes[c.key] ?? 0;
                return (
                  <div key={c.key} className={`rounded-lg border p-3 ${TONE_BOX[c.tone]}`}>
                    <p className={`font-mono text-[10px] uppercase tracking-wide ${TONE_TEXT[c.tone]}`}>
                      {c.glyph} {c.label}
                    </p>
                    <p className={`mt-1 font-mono text-2xl font-bold ${TONE_TEXT[c.tone]}`}>{n}</p>
                  </div>
                );
              })}
            </div>

            {/* the delta — the whole argument in one line */}
            <div className="rounded-lg border border-crimson/40 bg-crimson/10 p-3">
              <p className="font-mono text-xs font-semibold text-crimson">
                ✕ {result.delta.silent_divergence_dual_write} silent divergences under dual-write ·{" "}
                <span className="text-teal">▛ {result.delta.silent_divergence_outbox} under the outbox</span> — its{" "}
                {result.delta.made_visible_by_outbox} failures are dead-letters a human can page on
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                Same {result.count} earns, same faults ({result.fault_census["crash_after_earn"] ?? 0} crashes,{" "}
                {result.fault_census["ambiguous_timeout"] ?? 0} ambiguous timeouts,{" "}
                {result.fault_census["downstream_hard_failure"] ?? 0} hard failures). Only the integration pattern
                differs — the same counterfactual isolation the engine uses everywhere else.
              </p>
            </div>

            <p className="text-sm leading-relaxed text-muted">{result.grounding}</p>

            {/* the REAL-rows proof lane */}
            <div className="rounded-lg border border-border/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  the same proof over the REAL outbox rows
                </p>
                <button
                  type="button"
                  onClick={runProof}
                  disabled={offline || proofStatus === "loading"}
                  className="press inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-border px-3 py-1 font-mono text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-50 sm:min-h-0"
                >
                  {proofStatus === "loading" ? "proving…" : "▸ GET /reconciliation"}
                </button>
              </div>
              {offline && (
                <p className="mt-2 font-mono text-[11px] text-muted">Needs the live backend — there is no honest fixture for real rows.</p>
              )}
              {proofStatus === "error" && proofErr && (
                <p role="alert" className="mt-2 font-mono text-[11px] text-crimson">✕ {proofErr.message}</p>
              )}
              {proofStatus === "ok" && proofResult && (
                <div className="mt-2 space-y-1.5">
                  <p className="font-mono text-xs" style={{ color: proofResult.invariant_holds ? "var(--c-teal)" : "var(--c-crimson)" }}>
                    {proofResult.invariant_holds ? "▛ invariant holds" : "✕ invariant violated"} · {proofResult.total_jobs} replay jobs ·{" "}
                    {proofResult.classes["consistent"] ?? 0} consistent · {proofResult.classes["in_flight"] ?? 0} in flight ·{" "}
                    {proofResult.classes["visible_dead_letter"] ?? 0} dead-lettered · {proofResult.classes["missing_event"] ?? 0} missing
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted">
                    Every replay job this merchant ever ran, checked for its full analytics + billing + partner fan-out.
                    This lane has no synthetic input at all — these are the rows the engine actually wrote.
                  </p>
                </div>
              )}
            </div>

            {/* honesty marginalia */}
            <div className="rounded-lg border border-amber/25 bg-amber/[0.06] p-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-amber">Honesty</p>
              {result.synthetic_inputs.map((s) => (
                <p key={s.name} className="mt-1 text-[11px] leading-relaxed text-muted">
                  <span className="font-mono text-text">{s.name} = {String(s.value)}</span> — {s.label ?? s.note}
                </p>
              ))}
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                The outbox mechanism and its PENDING → PUBLISHED → DEAD_LETTER states are [REPO] (built and tested
                here); applying it to reward issuance is [HYPOTHESIS] — Rokt&apos;s fulfilment internals are not public.
                The fault fractions are [SYNTHETIC] and labelled. Every count is computed live, never asserted.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
