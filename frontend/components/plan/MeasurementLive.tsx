"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useTranslationAudit } from "@/lib/hooks";
import type { TranslationAudit } from "@/lib/schemas";
import { translationFixture } from "@/components/moment-forge/fixtures";

/* An interactive proof for the Measurement scene: run the same seeded corpus two
   ways — count every recorded conversion as lift (what a launch would claim) vs.
   measure only the causally-incremental ones (what a holdout actually proves).
   The gap between them is the illusion. Real engine output via
   POST /translation-audit; offline falls back to the recorded fixture. The one
   synthetic input (the ground-truth incremental split) is labelled — the point
   is the mechanism, not any asserted rate. */

type Status = "idle" | "loading" | "ok" | "error";
type Mode = "count" | "holdout";

export function MeasurementLive() {
  const audit = useTranslationAudit();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TranslationAudit | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [mode, setMode] = useState<Mode>("count");
  const [err, setErr] = useState<ApiError | null>(null);

  const run = async () => {
    setStatus("loading");
    setErr(null);
    const loadFixture = () => {
      setResult(translationFixture());
      setUsedFixture(true);
      setStatus("ok");
    };
    try {
      const d = await audit.mutateAsync({ term: "conversion", baseline_rate: 0.12, seed: 42, count: 200 });
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

  const recorded = result ? (result.recorded_lift ?? result.conformist_result.count) : 0;
  const incremental = result ? (result.incremental_lift ?? result.acl_result.count) : 0;
  const leaked = result ? (result.leaked_conversions ?? result.corruption.magnitude) : 0;
  const bias = result?.corruption.upward_bias_pct;
  const shown = mode === "count" ? recorded : incremental;
  const tone = mode === "count" ? "var(--c-crimson)" : "var(--c-teal)";

  return (
    <div className="glass mx-auto max-w-3xl rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3 font-mono text-xs text-muted">
        <span className="text-teal">forge$</span>
        <span>measure lift</span>
        <button
          type="button"
          role="switch"
          aria-checked={mode === "holdout"}
          aria-label="Toggle between counting everything and measuring the holdout"
          onClick={() => setMode((m) => (m === "count" ? "holdout" : "count"))}
          className="press ml-1 inline-flex min-h-[36px] items-center gap-2 rounded-md border border-border px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
        >
          <span className={mode === "count" ? "text-crimson" : "text-muted"}>count all</span>
          <span aria-hidden>⇄</span>
          <span className={mode === "holdout" ? "text-teal" : "text-muted"}>▛ holdout</span>
        </button>
        <button
          type="button"
          onClick={run}
          disabled={status === "loading"}
          className="press ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
        >
          {status === "loading" ? "measuring…" : "▸ Run the numbers"}
        </button>
      </div>

      <div aria-live="polite" aria-busy={status === "loading"} className="mt-4 min-h-[7rem]">
        {status === "idle" ? (
          <p className="font-mono text-xs text-muted">
            Run the same 200-conversion corpus two ways. &ldquo;Count all&rdquo; is what a launch would report;
            &ldquo;holdout&rdquo; is what a controlled test actually proves. Real backend output.
          </p>
        ) : null}
        {status === "loading" ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-4 w-full animate-pulse-soft rounded bg-surface-2/60" />)}</div>
        ) : null}
        {status === "error" && err ? (
          <div role="alert" className="rounded-lg border border-crimson/50 bg-crimson/10 p-3">
            <p className="font-mono text-sm font-semibold text-crimson">{err.isUnreachable ? "✕ Measurement service unreachable — this is a live call." : "✕ Measurement failed."}</p>
            <button type="button" onClick={run} className="press mt-2 rounded-md border border-border px-3 py-1 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">Retry</button>
          </div>
        ) : null}

        {status === "ok" && result ? (
          <div className="space-y-4">
            <p className="font-mono text-[11px] text-teal">{usedFixture ? "recorded" : "live"} engine output · seeded corpus</p>

            {/* the number the current mode reports */}
            <div className="rounded-lg border p-4" style={{ borderColor: tone }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {mode === "count" ? "what a launch would claim" : "what a holdout actually proves"}
              </p>
              <p className="mt-1 font-mono text-4xl font-bold" style={{ color: tone }}>{shown}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {mode === "count"
                  ? "Every recorded conversion counted as lift — including the ones that would have happened anyway."
                  : "Only the conversions the change actually caused. The rest are removed, not counted."}
              </p>
            </div>

            {/* the gap bar */}
            <div>
              <div className="flex h-4 overflow-hidden rounded-full border border-border/60">
                <span className="h-full" style={{ width: `${(incremental / (recorded || 1)) * 100}%`, backgroundColor: "var(--c-teal)" }} title={`incremental: ${incremental}`} />
                <span className="h-full" style={{ width: `${(leaked / (recorded || 1)) * 100}%`, backgroundColor: "var(--c-crimson)" }} title={`would-have-anyway: ${leaked}`} />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 font-mono text-[11px]">
                <span className="text-teal">● real lift {incremental}</span>
                <span className="text-crimson">● illusion {leaked}{bias != null ? ` (+${bias}% overstated)` : ""}</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted">
              The crimson slice is the number a launch-day dashboard would have taken credit for. A holdout is the
              only thing that removes it. That is why, in month three, the only verdict I&apos;d trust is{" "}
              <span className="font-mono text-teal">ELIGIBLE_FOR_HOLDOUT</span> — and then the holdout&apos;s readout.
            </p>

            <div className="rounded-lg border border-amber/25 bg-amber/[0.06] p-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-amber">Honesty</p>
              {result.synthetic_inputs.map((s) => (
                <p key={s.name} className="mt-1 text-[11px] leading-relaxed text-muted">
                  <span className="font-mono text-text">{s.name} = {String(s.value)}</span> — {s.label ?? s.note}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
