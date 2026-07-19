"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, type SimulationInput } from "@/lib/api";
import { usePolicy, useSimulation } from "@/lib/hooks";
import type { PolicyDocument, Rule, SimulationResult, Severity } from "@/lib/schemas";
import { VERDICT_COLOR, VERDICT_LABEL } from "@/lib/utils";
import { OPERATORS } from "./content";
import { SCENARIOS, scenarioVersion, simulateFixture, type ForgeScenario } from "./fixtures";

/* ────────────────────────────────────────────────────────────────────────────
   Domain Evolution Simulator (Fig. 07) — the marquee. Two modes:
   • Presets — run any of the FIVE real seeded laws (trap / safe / fatfinger /
     consent / immutable) through real event-time replay.
   • Editor — load the real V17 policy and mutate a rule (operator / threshold /
     on-off), then watch the semantic delta + verdict recompute LIVE. Editing is
     online-only; offline serves the five recorded fixtures with a banner. 422
     validation surfaces inline, never silently. Real backend output only.
   ──────────────────────────────────────────────────────────────────────────── */

type Status = "idle" | "loading" | "ok" | "error";
type Mode = "presets" | "editor";
type Edit = { op?: string; value?: string | number | (string | number)[]; disabled?: boolean };

const SEV: Record<Severity, string> = {
  info: "var(--c-offer-blue)",
  warning: "var(--c-amber)",
  critical: "var(--c-crimson)",
};

const RESULT_COLOR = (r: string) =>
  r === "FAIL" ? "var(--c-crimson)" : r === "WARN" ? "var(--c-amber)" : "var(--c-teal)";
const RESULT_GLYPH = (r: string) => (r === "FAIL" ? "✕" : r === "WARN" ? "▲" : "✓");

const DIFF_ROWS: { key: keyof SimulationResult["replay_summary"]; label: string; color: string }[] = [
  { key: "unchanged", label: "Unchanged", color: "var(--c-muted)" },
  { key: "nothing_to_offer", label: "No Offer → Offer", color: "var(--c-offer-blue)" },
  { key: "offer_to_nothing", label: "Offer → No Offer", color: "var(--c-amber)" },
  { key: "constraint_violation", label: "Constraint Violation", color: "var(--c-crimson)" },
];

function buildProposed(policy: PolicyDocument, edits: Record<string, Edit>): PolicyDocument {
  const rules: Rule[] = policy.eligibility_rules
    .filter((r) => !edits[r.id]?.disabled)
    .map((r) => {
      const e = edits[r.id];
      if (!e) return r;
      const next: Rule = { ...r };
      if (e.op) next.op = e.op;
      if (e.value !== undefined) next.value = e.value;
      return next;
    });
  return { ...policy, eligibility_rules: rules };
}

export function RippleSim({
  offline,
  trigger,
}: {
  offline: boolean;
  trigger?: { scenario: ForgeScenario; nonce: number } | null;
}) {
  const sim = useSimulation();
  const policy = usePolicy(offline ? null : "V17");
  const [mode, setMode] = useState<Mode>("presets");
  const [scenario, setScenario] = useState<ForgeScenario>("trap");
  const [muteCustomer, setMuteCustomer] = useState(false);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [ranEditor, setRanEditor] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);

  const execute = async (input: SimulationInput, fallbackScenario: ForgeScenario | null, wasEditor: boolean) => {
    setStatus("loading");
    setErr(null);
    setRanEditor(wasEditor);
    if (offline && fallbackScenario) {
      try {
        setResult(await simulateFixture(fallbackScenario));
        setUsedFixture(true);
        setStatus("ok");
      } catch (e) {
        setErr(e instanceof ApiError ? e : new ApiError({ kind: "validation", message: String(e) }));
        setStatus("error");
      }
      return;
    }
    try {
      const d = await sim.mutateAsync(input);
      setResult(d);
      setUsedFixture(false);
      setStatus("ok");
    } catch (e) {
      const ae = e instanceof ApiError ? e : new ApiError({ kind: "network", message: String(e) });
      if (ae.isUnreachable && fallbackScenario) {
        try {
          setResult(await simulateFixture(fallbackScenario));
          setUsedFixture(true);
          setStatus("ok");
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

  const runPreset = (sc: ForgeScenario) =>
    execute(
      {
        base_version: "V17",
        proposed: { from_version: scenarioVersion(sc), muted_contexts: muteCustomer ? ["customer"] : [] },
        session_seed: 42,
        session_count: 200,
        injections: ["timeout", "invalid_output", "stale_identity"],
      },
      sc,
      false,
    );

  const runEditor = () => {
    if (!policy.data) return;
    const doc = buildProposed(policy.data, edits);
    execute(
      {
        base_version: "V17",
        proposed: { document: doc },
        session_seed: 42,
        session_count: 200,
        injections: ["timeout", "invalid_output", "stale_identity"],
      },
      null,
      true,
    );
  };

  // Executable-laws bridge: a law card can request a scenario run here.
  useEffect(() => {
    if (!trigger) return;
    setMode("presets");
    setScenario(trigger.scenario);
    runPreset(trigger.scenario);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger?.nonce]);

  const flagged = useMemo(
    () => (result ? result.constraint_results.filter((c) => c.result !== "PASS") : []),
    [result],
  );
  const total = result ? result.session_count : 0;
  const activeMeta = SCENARIOS.find((s) => s.id === scenario)!;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      {/* mode switch */}
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(["presets", "editor"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={
              "inline-flex min-h-[36px] items-center rounded-md border px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 " +
              (mode === m ? "border-teal/50 bg-teal/10 text-teal" : "border-border text-muted hover:text-text")
            }
          >
            {m === "presets" ? "Five laws" : "Edit a rule"}
          </button>
        ))}
        {mode === "editor" && offline ? (
          <span className="font-mono text-[11px] text-amber">editing needs the live backend</span>
        ) : null}
      </div>

      {/* ── PRESETS ── */}
      {mode === "presets" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3 font-mono text-xs text-muted">
          <span className="text-teal">forge$</span>
          <span>simulate V17 →</span>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={scenario === s.id}
              onClick={() => setScenario(s.id)}
              title={`${s.version} · ${s.label}`}
              className={
                "inline-flex min-h-[36px] items-center rounded-md border px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 " +
                (scenario === s.id ? "border-teal/50 bg-teal/10 text-teal" : "border-border text-muted hover:text-text")
              }
            >
              {s.version}
            </button>
          ))}
          <label className={"ml-1 inline-flex items-center gap-1.5 " + (offline ? "opacity-50" : "")}>
            <input type="checkbox" checked={muteCustomer} disabled={offline} onChange={(e) => setMuteCustomer(e.target.checked)} className="accent-teal" />
            mute Customer
          </label>
          <button
            type="button"
            onClick={() => runPreset(scenario)}
            disabled={status === "loading"}
            className="press ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
          >
            {status === "loading" ? "replaying…" : "▸ Trace ripple"}
          </button>
        </div>
      )}
      {mode === "presets" && (
        <p className="mt-2 font-mono text-[11px] text-muted">
          Proves: <span className="text-text">{activeMeta.law}</span>
          {activeMeta.constraintKey ? <> · guards <span className="text-teal">{activeMeta.constraintKey}</span></> : null}
        </p>
      )}

      {/* ── EDITOR ── */}
      {mode === "editor" && (
        <div className="border-t border-border/70 pt-3">
          {offline ? (
            <p className="rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[11px] text-amber">
              ◷ Offline — the inline editor needs the live backend. Switch to “Five laws” for the recorded scenarios.
            </p>
          ) : policy.isPending ? (
            <p className="font-mono text-xs text-muted">loading V17 policy…</p>
          ) : policy.isError ? (
            <p className="font-mono text-xs text-crimson">Could not load V17 policy · {policy.error.message}</p>
          ) : policy.data ? (
            <div>
              <p className="mb-2 font-mono text-[11px] text-muted">
                Editing <span className="text-text">V17</span> eligibility rules · diffed against V17 so you see only your edit.
              </p>
              <div className="scroll-x">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="font-mono text-[10px] uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-1 pr-2">rule</th>
                      <th className="py-1 pr-2">attribute</th>
                      <th className="py-1 pr-2">operator</th>
                      <th className="py-1 pr-2">value</th>
                      <th className="py-1 pr-2">on</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {policy.data.eligibility_rules.map((r) => {
                      const e = edits[r.id] ?? {};
                      // Engine values are scalar for gte/lte (e.g. 25) and lists for
                      // membership ops — accept either so numeric thresholds are editable.
                      const raw = r.value;
                      const numeric =
                        typeof raw === "number" ||
                        (Array.isArray(raw) && raw.length === 1 && typeof raw[0] === "number");
                      const curRaw = e.value ?? raw;
                      const numVal = Array.isArray(curRaw) ? curRaw[0] : curRaw;
                      return (
                        <tr key={r.id} className="border-t border-border/50">
                          <td className="py-1.5 pr-2 text-teal">{r.id}</td>
                          <td className="py-1.5 pr-2 text-text">{r.attribute}</td>
                          <td className="py-1.5 pr-2">
                            <select
                              aria-label={`operator for ${r.id}`}
                              value={e.op ?? r.op}
                              onChange={(ev) => setEdits((p) => ({ ...p, [r.id]: { ...p[r.id], op: ev.target.value } }))}
                              className="min-h-[36px] rounded border border-border bg-surface-2 px-1.5 py-1 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
                            >
                              {OPERATORS.some((o) => o.op === (e.op ?? r.op)) ? null : (
                                <option value={e.op ?? r.op}>{e.op ?? r.op}</option>
                              )}
                              {OPERATORS.map((o) => (
                                <option key={o.op} value={o.op} title={o.note}>
                                  {o.op}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-1.5 pr-2">
                            {numeric ? (
                              <input
                                type="number"
                                aria-label={`value for ${r.id}`}
                                value={String(numVal ?? "")}
                                onChange={(ev) =>
                                  setEdits((p) => ({ ...p, [r.id]: { ...p[r.id], value: Number(ev.target.value) } }))
                                }
                                className="min-h-[36px] w-20 rounded border border-border bg-surface-2 px-1.5 py-1 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
                              />
                            ) : (
                              <span className="text-muted">{Array.isArray(raw) ? raw.join(", ") : String(raw ?? "—")}</span>
                            )}
                          </td>
                          <td className="py-1.5 pr-2">
                            <input
                              type="checkbox"
                              aria-label={`enable rule ${r.id}`}
                              checked={!e.disabled}
                              onChange={(ev) => setEdits((p) => ({ ...p, [r.id]: { ...p[r.id], disabled: !ev.target.checked } }))}
                              className="accent-teal"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={runEditor}
                  disabled={status === "loading"}
                  className="press inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-mono text-xs font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
                >
                  {status === "loading" ? "replaying…" : "▸ Run edited policy"}
                </button>
                {Object.keys(edits).length ? (
                  <button
                    type="button"
                    onClick={() => setEdits({})}
                    className="press inline-flex min-h-[36px] items-center rounded-md border border-border px-3 py-1 font-mono text-xs text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
                  >
                    Reset edits
                  </button>
                ) : null}
                <span className="font-mono text-[10px] text-muted">
                  tip: flip r4 to <span className="text-crimson">exclude_is_in</span> to recreate the trap
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── RESULT ── */}
      <div aria-live="polite" aria-busy={status === "loading"} className="mt-4 min-h-[6rem]">
        {status === "idle" && (
          <p className="font-mono text-xs text-muted">
            Trace a change through real event-time replay — watch it ripple across the bounded contexts
            to a deterministic verdict. Real backend output only.
          </p>
        )}

        {status === "loading" && (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-full animate-pulse-soft rounded bg-surface-2/60" />
            ))}
          </div>
        )}

        {status === "error" && err && (
          <div role="alert" className="rounded-lg border border-crimson/50 bg-crimson/10 p-4">
            <p className="font-mono text-sm font-semibold text-crimson">
              {err.isUnreachable
                ? "✕ Simulator unreachable — this is a live call, not a mock."
                : err.status === 422
                  ? "✕ Invalid policy — the engine rejected the edit (422)."
                  : "✕ Simulation failed."}
            </p>
            {err.message ? <p className="mt-1 font-mono text-[11px] text-text">{err.message}</p> : null}
            {err.requestId ? <p className="mt-1 font-mono text-[11px] text-muted">X-Request-ID: {err.requestId}</p> : null}
          </div>
        )}

        {status === "ok" && result && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4" style={{ borderColor: VERDICT_COLOR[result.verdict.value] }}>
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
                {usedFixture ? "recorded" : ranEditor ? "live · edited policy" : "live"} · {result.base_version} → {result.proposed_version} · {result.session_count} sessions
              </span>
            </div>

            {/* flagged constraints — each scenario surfaces its specific guard */}
            {flagged.length ? (
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Constraints triggered</p>
                {flagged.map((c) => (
                  <div key={c.key} className="rounded-lg border p-3" style={{ borderColor: RESULT_COLOR(c.result) }}>
                    <p className="font-mono text-xs font-semibold" style={{ color: RESULT_COLOR(c.result) }}>
                      {RESULT_GLYPH(c.result)} {c.key} · {c.result}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{c.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-teal/40 bg-teal/[0.06] p-3">
                <p className="font-mono text-xs font-semibold text-teal">✓ No hard constraint triggered</p>
              </div>
            )}

            {/* blast radius */}
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

            {/* decision diff */}
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
              This simulation is ephemeral and non-persisting — no run id, no /audit/verify round-trip; the
              HMAC records are computed inline. {result.ope_prescreen.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
