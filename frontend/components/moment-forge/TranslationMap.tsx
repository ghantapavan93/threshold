"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useTranslationAudit } from "@/lib/hooks";
import type { TranslationAudit } from "@/lib/schemas";
import { translationFixture } from "./fixtures";
import { CelebrationBurst, Magnetic } from "./garnish";

/* ────────────────────────────────────────────────────────────────────────────
   Translation Map (Fig. 03b) — closes the honest self-critique: the demo bug
   (missing-attribute inversion) never crosses a boundary. Here "conversion"
   crosses a real Anticorruption Layer (BC-5 Measurement → BC-3 Incrementality).
   Toggle the ACL off (Conformist / identity) and a REAL number inflates at the
   wall — the leaked, non-incremental conversions counted as lift. LanguageLens
   morph fused with CompilerConsole's real-output-only discipline. Live via
   POST /translation-audit; offline = the recorded fixture, Zod-validated; a
   contract mismatch surfaces as an error, never silently.
   ──────────────────────────────────────────────────────────────────────────── */

type Status = "idle" | "loading" | "ok" | "error";

export function TranslationMap({ offline }: { offline: boolean }) {
  const audit = useTranslationAudit();
  const [aclOn, setAclOn] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TranslationAudit | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  // Counts successful runs — the celebration burst fires per REAL result landing.
  const [runId, setRunId] = useState(0);

  const run = async () => {
    setStatus("loading");
    setErr(null);
    const loadFixture = () => {
      setResult(translationFixture());
      setUsedFixture(true);
      setStatus("ok");
      setRunId((n) => n + 1);
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
      const d = await audit.mutateAsync({ term: "conversion", baseline_rate: 0.12, seed: 42, count: 200 });
      setResult(d);
      setUsedFixture(false);
      setStatus("ok");
      setRunId((n) => n + 1);
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

  const downstreamCount = result ? (aclOn ? result.acl_result.count : result.conformist_result.count) : 0;
  const leaked = result?.leaked_conversions ?? result?.corruption.magnitude ?? 0;
  const treatmentCaused = result?.per_origin?.treatment_caused ?? result?.acl_result.count ?? 0;
  const wouldAnyway = result?.per_origin?.would_have_anyway ?? leaked;
  const totalOrigin = treatmentCaused + wouldAnyway || 1;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      {/* the seam: BC-5 → [ACL] → BC-3 */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md border border-offer-blue/40 bg-offer-blue/[0.06] px-2.5 py-1 font-mono text-xs text-offer-blue">
          BC-5 Measurement
        </span>
        <span aria-hidden className="font-mono text-muted">→</span>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs"
          style={{ color: aclOn ? "var(--c-teal)" : "var(--c-crimson)", borderColor: aclOn ? "var(--c-teal)" : "var(--c-crimson)" }}
        >
          <span aria-hidden>▛</span> {aclOn ? "ACL present" : "Conformist (identity)"}
        </span>
        <span aria-hidden className="font-mono text-muted">→</span>
        <span className="rounded-md border border-teal/40 bg-teal/[0.06] px-2.5 py-1 font-mono text-xs text-teal">
          BC-3 Incrementality
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-border/70 pb-3 font-mono text-xs text-muted">
        <span className="text-teal">forge$</span>
        <span>translation-audit</span>
        <span className="text-text">term=conversion</span>
        <button
          type="button"
          role="switch"
          aria-checked={aclOn}
          onClick={() => setAclOn((a) => !a)}
          className="press ml-1 inline-flex min-h-[36px] items-center gap-2 rounded-md border border-border px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
        >
          <span className={aclOn ? "text-teal" : "text-muted"}>▛ ACL</span>
          <span aria-hidden>⇄</span>
          <span className={aclOn ? "text-muted" : "text-crimson"}>identity</span>
        </button>
        <Magnetic className="ml-auto">
          <button
            type="button"
            onClick={run}
            disabled={status === "loading"}
            className="press inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
          >
            {status === "loading" ? "auditing…" : "▸ Audit translation"}
          </button>
        </Magnetic>
      </div>

      {offline ? (
        <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[11px] text-amber">
          ◷ Offline — showing recorded engine output. Editing needs the live backend.
        </p>
      ) : null}

      <div aria-live="polite" aria-busy={status === "loading"} className="mt-4 min-h-[6rem]">
        {status === "idle" && (
          <p className="font-mono text-xs text-muted">
            Send &ldquo;conversion&rdquo; across the BC-5 → BC-3 seam. With the ACL present, only causally-incremental
            conversions cross; toggle it to Conformist and watch the recorded count inflate at the wall. Real backend
            output only.
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
              {err.isUnreachable ? "✕ Translation service unreachable — this is a live call, not a mock." : err.kind === "validation" ? "✕ Response did not match the API contract." : "✕ Translation audit failed."}
            </p>
            {err.message ? <p className="mt-1 font-mono text-[11px] text-text">{err.message}</p> : null}
            {err.requestId ? <p className="mt-1 font-mono text-[11px] text-muted">X-Request-ID: {err.requestId}</p> : null}
            <button type="button" onClick={run} className="press mt-3 rounded-md border border-border px-3 py-1 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">Retry</button>
          </div>
        )}

        {status === "ok" && result && (
          <div className="space-y-4">
            <p className="font-mono text-[11px] text-teal">{usedFixture ? "recorded" : "live"} · {result.term} · {result.seam}</p>

            {/* the count at the wall — the live number that inflates */}
            <div
              className="relative rounded-lg border p-4"
              style={{ borderColor: aclOn ? "var(--c-teal)" : "var(--c-crimson)" }}
            >
              <CelebrationBurst fireKey={runId || null} />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  &ldquo;incremental&rdquo; lift that leaves the seam
                </p>
                <p className="font-mono text-[11px]" style={{ color: aclOn ? "var(--c-teal)" : "var(--c-crimson)" }}>
                  {aclOn ? "▛ ACL present" : "◌ Conformist — the bug"}
                </p>
              </div>
              <p className="mt-1 font-mono text-4xl font-bold" style={{ color: aclOn ? "var(--c-teal)" : "var(--c-crimson)" }}>
                {downstreamCount}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {aclOn
                  ? "The ACL removes the would-have-converted-anyway set — only causally-incremental conversions cross."
                  : "Identity translation: every recorded conversion crosses as if it were incremental. This is the Conformist leak."}
              </p>
            </div>

            {/* the two paths side by side */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-crimson/40 bg-crimson/[0.05] p-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-crimson">◌ Conformist (recorded)</p>
                <p className="mt-1 font-mono text-2xl font-bold text-crimson">{result.conformist_result.count}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">Counts non-incremental conversions as lift — inflates upward.</p>
              </div>
              <div className="rounded-lg border border-teal/40 bg-teal/[0.05] p-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-teal">▛ ACL (incremental)</p>
                <p className="mt-1 font-mono text-2xl font-bold text-teal">{result.acl_result.count}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">Treatment − control; excludes who would have converted anyway.</p>
              </div>
            </div>

            {/* the leak */}
            <div className="rounded-lg border border-crimson/40 bg-crimson/10 p-3">
              <p className="font-mono text-xs font-semibold text-crimson">
                ✕ {leaked} leaked conversions counted as lift{result.corruption.upward_bias_pct != null ? ` · +${result.corruption.upward_bias_pct}% upward bias` : ""}
              </p>
              {/* origin breakdown bar */}
              <div className="mt-2 flex h-3 overflow-hidden rounded-full">
                <span className="h-full" style={{ width: `${(treatmentCaused / totalOrigin) * 100}%`, backgroundColor: "var(--c-teal)" }} title={`treatment-caused: ${treatmentCaused}`} />
                <span className="h-full" style={{ width: `${(wouldAnyway / totalOrigin) * 100}%`, backgroundColor: "var(--c-crimson)" }} title={`would-have-anyway: ${wouldAnyway}`} />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 font-mono text-[11px]">
                <span className="text-teal">● treatment-caused {treatmentCaused}</span>
                <span className="text-crimson">● would-have-anyway {wouldAnyway}</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted">{result.grounding}</p>

            {/* honesty marginalia */}
            <div className="rounded-lg border border-amber/25 bg-amber/[0.06] p-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-amber">Honesty</p>
              {result.synthetic_inputs.map((s) => (
                <p key={s.name} className="mt-1 text-[11px] leading-relaxed text-muted">
                  <span className="font-mono text-text">{s.name} = {String(s.value)}</span> — {s.label ?? s.note}
                </p>
              ))}
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                The seam and baseline are [INFERENCE] / synthetic; the translation math is standard incrementality; the
                numbers are computed live, not asserted.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
