"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useSimulation } from "@/lib/hooks";
import type { SimulationResult, Severity } from "@/lib/schemas";
import { VERDICT_COLOR, VERDICT_LABEL } from "@/lib/utils";
import { simulateFixture, type ForgeScenario } from "./fixtures";

/* ────────────────────────────────────────────────────────────────────────────
   Domain Evolution Simulator (Fig. 07) — a LIVE ripple over real event-time
   replay. Online: POST /simulations. Offline: recorded fixture + banner, editing
   disabled. Muting the Customer context drops its rules — on the trap, that
   removes the r4 flip, so the inversion (and the block) disappear. The same muted
   set is sent to compile + simulate so they always agree.
   ──────────────────────────────────────────────────────────────────────────── */

type Status = "idle" | "loading" | "ok" | "error";

const SEV: Record<Severity, string> = {
  info: "var(--c-offer-blue)",
  warning: "var(--c-amber)",
  critical: "var(--c-crimson)",
};

const DIFF_ROWS: { key: keyof SimulationResult["replay_summary"]; label: string; color: string }[] = [
  { key: "unchanged", label: "Unchanged", color: "var(--c-muted)" },
  { key: "nothing_to_offer", label: "No Offer → Offer", color: "var(--c-offer-blue)" },
  { key: "offer_to_nothing", label: "Offer → No Offer", color: "var(--c-amber)" },
  { key: "constraint_violation", label: "Constraint Violation", color: "var(--c-crimson)" },
];

export function RippleSim({ offline }: { offline: boolean }) {
  const sim = useSimulation();
  const [scenario, setScenario] = useState<ForgeScenario>("trap");
  const [muteCustomer, setMuteCustomer] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);

  const run = async () => {
    setStatus("loading");
    setErr(null);
    const proposed = scenario === "trap" ? "V18" : "V18-safe";
    const loadFixture = () => {
      setResult(simulateFixture(scenario));
      setUsedFixture(true);
      setStatus("ok");
    };
    if (offline) {
      try {
        loadFixture();
      } catch {
        setStatus("error");
      }
      return;
    }
    try {
      const d = await sim.mutateAsync({
        base_version: "V17",
        proposed: {
          from_version: proposed,
          muted_contexts: muteCustomer ? ["customer"] : [],
        },
        session_seed: 42,
        session_count: 200,
        injections: ["timeout", "invalid_output", "stale_identity"],
      });
      setResult(d);
      setUsedFixture(false);
      setStatus("ok");
    } catch (e) {
      if (e instanceof ApiError && e.isUnreachable) {
        try {
          loadFixture();
        } catch {
          setStatus("error");
        }
      } else {
        setErr(e instanceof ApiError ? e : new ApiError({ kind: "network", message: String(e) }));
        setStatus("error");
      }
    }
  };

  const star = result?.constraint_results.find((c) => c.key === "missing_attribute_semantics");
  const total = result ? result.session_count : 0;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3 font-mono text-xs text-muted">
        <span className="text-teal">forge$</span>
        <span>simulate</span>
        <span className="text-text">V17 →</span>
        {(["trap", "safe"] as ForgeScenario[]).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={scenario === s}
            onClick={() => setScenario(s)}
            className={
              "inline-flex min-h-[36px] items-center rounded-md border px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 " +
              (scenario === s ? "border-teal/50 bg-teal/10 text-teal" : "border-border text-muted hover:text-text")
            }
          >
            {s === "trap" ? "V18 (trap)" : "V18-safe"}
          </button>
        ))}
        <label className={"ml-1 inline-flex items-center gap-1.5 " + (offline ? "opacity-50" : "")}>
          <input type="checkbox" checked={muteCustomer} disabled={offline} onChange={(e) => setMuteCustomer(e.target.checked)} className="accent-teal" />
          mute Customer
        </label>
        <button
          type="button"
          onClick={run}
          disabled={status === "loading"}
          className="press ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
        >
          {status === "loading" ? "replaying…" : "▸ Trace ripple"}
        </button>
      </div>

      {offline ? (
        <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[11px] text-amber">
          ◷ Offline — showing recorded engine output (seed 42, V17→{scenario === "trap" ? "V18" : "V18-safe"}).
          Editing and context toggles are inactive on recorded data; free-form editing needs the live backend.
        </p>
      ) : null}

      <div aria-live="polite" aria-busy={status === "loading"} className="mt-4 min-h-[6rem]">
        {status === "idle" && (
          <p className="font-mono text-xs text-muted">
            Trace a change through real event-time replay — watch it ripple across the bounded
            contexts to a deterministic verdict. Real backend output only.
          </p>
        )}

        {status === "loading" && (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-full animate-pulse-soft rounded bg-surface-2/60" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="rounded-lg border border-crimson/50 bg-crimson/10 p-4">
            <p className="font-mono text-sm font-semibold text-crimson">✕ Simulator unreachable — this is a live call, not a mock.</p>
            {err?.message ? <p className="mt-1 font-mono text-[11px] text-text">{err.message}</p> : null}
            <button type="button" onClick={run} className="press mt-3 rounded-md border border-border px-3 py-1 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">Retry</button>
          </div>
        )}

        {status === "ok" && result && (
          <div className="space-y-4">
            {/* verdict centerpiece */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              style={{ borderColor: VERDICT_COLOR[result.verdict.value] }}
            >
              <div className="flex items-center gap-3">
                <span aria-hidden className="text-2xl" style={{ color: VERDICT_COLOR[result.verdict.value] }}>
                  {result.verdict.value === "BLOCKED" ? "⛔" : result.verdict.value === "ELIGIBLE_FOR_HOLDOUT" ? "✓" : "?"}
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Verdict</p>
                  <p className="text-lg font-bold" style={{ color: VERDICT_COLOR[result.verdict.value] }}>
                    {VERDICT_LABEL[result.verdict.value]}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-muted">
                {usedFixture ? "recorded" : "live"} · {result.base_version} → {result.proposed_version} · {result.session_count} sessions
              </span>
            </div>

            {/* per-context blast radius (impacted contexts light up, staggered) */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Blast radius across contexts</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.semantic_delta.context_map.contexts.map((c, i) => {
                  const touched = c.change_count > 0;
                  const color = touched ? SEV[c.max_severity] : "var(--c-muted)";
                  return (
                    <span
                      key={c.id}
                      className="thr-rise inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px]"
                      style={{
                        color,
                        borderColor: touched ? color : "var(--c-border)",
                        backgroundColor: touched ? `color-mix(in srgb, ${color} 12%, transparent)` : "transparent",
                        animationDelay: `${i * 60}ms`,
                      }}
                    >
                      <span aria-hidden>{touched ? "●" : "○"}</span>
                      {c.label}
                      {c.muted ? " · muted" : touched ? ` · ${c.change_count}` : ""}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* decision-diff summary */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Decision diff · {total} replayed sessions</p>
              <div className="mt-2 space-y-1.5">
                {DIFF_ROWS.map((r) => {
                  const v = result.replay_summary[r.key] as number;
                  const pct = total ? (v / total) * 100 : 0;
                  return (
                    <div key={r.key} className="flex items-center gap-2">
                      <span className="w-40 shrink-0 text-[11px] text-muted">{r.label}</span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2/60">
                        <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: r.color }} />
                      </span>
                      <span className="w-8 shrink-0 text-right font-mono text-[11px] text-text">{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* the star constraint */}
            {star ? (
              <div
                className="rounded-lg border p-3"
                style={{ borderColor: star.result === "FAIL" ? "var(--c-crimson)" : star.result === "WARN" ? "var(--c-amber)" : "var(--c-teal)" }}
              >
                <p className="font-mono text-xs font-semibold" style={{ color: star.result === "FAIL" ? "var(--c-crimson)" : star.result === "WARN" ? "var(--c-amber)" : "var(--c-teal)" }}>
                  {star.result === "FAIL" ? "✕" : star.result === "WARN" ? "▲" : "✓"} missing_attribute_semantics · {star.result}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{star.detail}</p>
              </div>
            ) : null}

            {/* OPE pre-screen + audit note */}
            <div className="flex flex-wrap gap-2 font-mono text-[11px]">
              <span className="rounded-md border border-border px-2.5 py-1 text-muted">
                OPE support: <span className="text-text">{result.ope_prescreen.support}</span>
                {result.ope_prescreen.refuses_estimate ? " · refuses estimate" : ""}
              </span>
              <span className="rounded-md border border-border px-2.5 py-1 text-muted">
                audit: <span className="text-text">{result.audit.length}</span> HMAC records
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted">
              This simulation is ephemeral and non-persisting — no run id, no /audit/verify round-trip;
              the HMAC records are computed inline. {result.ope_prescreen.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
