"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useImpressionAudit } from "@/lib/hooks";
import type { ImpressionAudit } from "@/lib/schemas";
import { impressionFixture } from "./fixtures";
import { CelebrationBurst, Magnetic } from "./garnish";

/* ────────────────────────────────────────────────────────────────────────────
   The Unit Wall (Fig. 03d) — closes W3 of the integration critique: the
   polysemic terms are no longer primitives. Two exhibits, both real output:

   1. Unit algebra — the backend actually performs `recorded + incremental` and
      reports the caught UnitMismatchError: a cross-context assignment is a
      runtime error at the seam, not a silent copy.
   2. Impression fidelity — "impression" crosses BC-7 Agent-Mediation → BC-5
      Measurement. The ACL REFUSES to count a degraded agent rendering as the
      measurement atom (listing it instead); the Conformist blends both under
      one word. Exposure ≠ exposure — shown qualitatively, no rate claimed.

   Live via POST /impression-audit; offline = the recorded fixture, Zod-validated.
   ──────────────────────────────────────────────────────────────────────────── */

type Status = "idle" | "loading" | "ok" | "error";

export function UnitWall({ offline }: { offline: boolean }) {
  const audit = useImpressionAudit();
  const [aclOn, setAclOn] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ImpressionAudit | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  // Counts successful runs — the celebration burst fires per REAL result landing.
  const [runId, setRunId] = useState(0);

  const run = async () => {
    setStatus("loading");
    setErr(null);
    const loadFixture = () => {
      setResult(impressionFixture());
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
      const d = await audit.mutateAsync({ term: "impression", seed: 42, count: 200 });
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

  const counted = result ? (aclOn ? result.acl_result.counted : result.conformist_result.count) : 0;
  const refused = result?.acl_result.refused ?? 0;
  const faithful = result?.per_fidelity.faithful ?? 0;
  const degraded = result?.per_fidelity.degraded ?? 0;
  const totalFid = faithful + degraded || 1;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      {/* the seam: BC-7 → [ACL] → BC-5 */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md border border-offer-blue/40 bg-offer-blue/[0.06] px-2.5 py-1 font-mono text-xs text-offer-blue">
          BC-7 Agent-Mediation
        </span>
        <span aria-hidden className="font-mono text-muted">→</span>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs"
          style={{ color: aclOn ? "var(--c-teal)" : "var(--c-crimson)", borderColor: aclOn ? "var(--c-teal)" : "var(--c-crimson)" }}
        >
          <span aria-hidden>▛</span> {aclOn ? "ACL — refuse to conform" : "Conformist (blend)"}
        </span>
        <span aria-hidden className="font-mono text-muted">→</span>
        <span className="rounded-md border border-teal/40 bg-teal/[0.06] px-2.5 py-1 font-mono text-xs text-teal">
          BC-5 Measurement
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-border/70 pb-3 font-mono text-xs text-muted">
        <span className="text-teal">forge$</span>
        <span>impression-audit</span>
        <span className="text-text">term=impression</span>
        <button
          type="button"
          role="switch"
          aria-checked={aclOn}
          aria-label="Toggle anticorruption layer"
          onClick={() => setAclOn((a) => !a)}
          className="press ml-1 inline-flex min-h-[36px] items-center gap-2 rounded-md border border-border px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
        >
          <span className={aclOn ? "text-teal" : "text-muted"}>▛ refuse</span>
          <span aria-hidden>⇄</span>
          <span className={aclOn ? "text-muted" : "text-crimson"}>blend</span>
        </button>
        <Magnetic className="ml-auto">
          <button
            type="button"
            onClick={run}
            disabled={status === "loading"}
            className="press inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
          >
            {status === "loading" ? "auditing…" : "▸ Audit units"}
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
            Send 200 &ldquo;impressions&rdquo; — human renderings and agent echoes — across the BC-7 → BC-5 seam.
            The ACL refuses to count a degraded rendering as the measurement atom; toggle to Conformist and watch
            the blend hide the difference. Plus: the type system itself, caught refusing a cross-unit addition.
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
              {err.isUnreachable ? "✕ Audit service unreachable — this is a live call, not a mock." : err.kind === "validation" ? "✕ Response did not match the API contract." : "✕ Impression audit failed."}
            </p>
            {err.message ? <p className="mt-1 font-mono text-[11px] text-text">{err.message}</p> : null}
            {err.requestId ? <p className="mt-1 font-mono text-[11px] text-muted">X-Request-ID: {err.requestId}</p> : null}
            <button type="button" onClick={run} className="press mt-3 rounded-md border border-border px-3 py-1 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">Retry</button>
          </div>
        )}

        {status === "ok" && result && (
          <div className="space-y-4">
            <p className="font-mono text-[11px] text-teal">
              {usedFixture ? "recorded" : "live"} · {result.term} · {result.seam}
            </p>

            {/* what BC-5 counts as its atom */}
            <div className="relative rounded-lg border p-4" style={{ borderColor: aclOn ? "var(--c-teal)" : "var(--c-crimson)" }}>
              <CelebrationBurst fireKey={runId || null} color="rgba(91,140,255,.85)" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  impressions BC-5 counts as its atom
                </p>
                <p className="font-mono text-[11px]" style={{ color: aclOn ? "var(--c-teal)" : "var(--c-crimson)" }}>
                  {aclOn ? "▛ ACL — refuses the degraded unit" : "◌ Conformist — the blend"}
                </p>
              </div>
              <p className="mt-1 font-mono text-4xl font-bold" style={{ color: aclOn ? "var(--c-teal)" : "var(--c-crimson)" }}>
                {counted}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {aclOn
                  ? `Only faithful renderings cross as the unit incrementality assumes. ${refused} degraded agent echoes are refused — listed, visible, and explicitly not counted. Refusal is not estimation.`
                  : "Every 'shown' event counts, fidelity ignored. The number silently stops meaning 'a human saw the offer as designed' — exposure ≠ exposure, and nothing downstream can tell."}
              </p>
            </div>

            {/* fidelity census */}
            <div className="rounded-lg border border-border/70 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted">the corpus, by fidelity</p>
              <div className="mt-2 flex h-3 overflow-hidden rounded-full">
                <span className="h-full" style={{ width: `${(faithful / totalFid) * 100}%`, backgroundColor: "var(--c-teal)" }} title={`faithful: ${faithful}`} />
                <span className="h-full" style={{ width: `${(degraded / totalFid) * 100}%`, backgroundColor: "var(--c-amber)" }} title={`degraded: ${degraded}`} />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 font-mono text-[11px]">
                <span className="text-teal">● faithful {faithful}</span>
                <span className="text-amber">● degraded {degraded} (agent-echoed)</span>
                <span className="ml-auto text-muted">human {result.per_channel.human} · agent {result.per_channel.agent}</span>
              </div>
            </div>

            {/* the unit wall — real caught error */}
            <div className="rounded-lg border border-crimson/40 bg-crimson/[0.05] p-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-crimson">
                the unit wall — performed live, not asserted
              </p>
              <div className="mt-2 space-y-1.5 font-mono text-xs">
                <p>
                  <span className="text-text">{result.unit_wall.illegal.attempted}</span>{" "}
                  <span className="text-crimson">
                    → ✕ {result.unit_wall.illegal.error ?? "no error raised"}
                  </span>
                </p>
                {result.unit_wall.illegal.message ? (
                  <p className="text-[11px] leading-relaxed text-muted">{result.unit_wall.illegal.message}</p>
                ) : null}
                <p>
                  <span className="text-text">{result.unit_wall.legal.attempted}</span>{" "}
                  <span className="text-teal">
                    → ▛ {result.unit_wall.legal.result.kind}({result.unit_wall.legal.result.count})
                  </span>
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                All three polysemic terms now carry their owning context in a type — ConversionKind, RewardStatus,
                ImpressionFidelity. A cross-context assignment requires a translation; the implicit Conformist is a
                runtime error, not a silent copy.
              </p>
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
                This is the weakest-grounded case of the four and says so: the agent-checkout framing is public; the
                fractions are [SYNTHETIC]; no degradation rate or lift is claimed. The unit mismatch is the claim —
                counts of a labelled synthetic corpus, computed live.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
