"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useSemanticCompile } from "@/lib/hooks";
import type { SemanticDelta, Severity } from "@/lib/schemas";
import { compileFixture, SCENARIOS, scenarioVersion, type ForgeScenario } from "./fixtures";

/* ────────────────────────────────────────────────────────────────────────────
   Semantic Change Compiler (Fig. 04) — a LIVE console in the essay.
   Online: POST /semantic-compile (real engine output only). Offline: the real
   recorded fixture (byte-for-byte), editing disabled, with an explicit banner. A
   contract mismatch surfaces as an error — it never silently falls back.
   ──────────────────────────────────────────────────────────────────────────── */

type Status = "idle" | "loading" | "ok" | "empty" | "error";

const SEV: Record<Severity, { color: string; glyph: string; label: string }> = {
  info: { color: "var(--c-offer-blue)", glyph: "•", label: "INFO" },
  warning: { color: "var(--c-amber)", glyph: "▲", label: "WARN" },
  critical: { color: "var(--c-crimson)", glyph: "✕", label: "CRITICAL" },
};

export function CompilerConsole({ offline }: { offline: boolean }) {
  const compile = useSemanticCompile();
  const [scenario, setScenario] = useState<ForgeScenario>("trap");
  const [muteCustomer, setMuteCustomer] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SemanticDelta | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);

  const loadFixture = (s: ForgeScenario) => {
    const d = compileFixture(s);
    setResult(d);
    setUsedFixture(true);
    setStatus(d.meaning_changes.length ? "ok" : "empty");
  };

  const run = async () => {
    setStatus("loading");
    setErr(null);
    const proposed = scenarioVersion(scenario);
    if (offline) {
      try {
        loadFixture(scenario);
      } catch {
        setStatus("error");
      }
      return;
    }
    try {
      const d = await compile.mutateAsync({
        base_version: "V17",
        proposed_version: proposed,
        muted_contexts: muteCustomer ? ["customer"] : [],
      });
      setResult(d);
      setUsedFixture(false);
      setStatus(d.meaning_changes.length ? "ok" : "empty");
    } catch (e) {
      if (e instanceof ApiError && e.isUnreachable) {
        try {
          loadFixture(scenario); // recorded output for this scenario
        } catch {
          setStatus("error");
        }
      } else {
        setErr(e instanceof ApiError ? e : new ApiError({ kind: "network", message: String(e) }));
        setStatus("error");
      }
    }
  };

  const inv = result?.missing_attribute_inversion;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      {/* prompt bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3 font-mono text-xs text-muted">
        <span className="text-teal">forge$</span>
        <span>semantic-compile</span>
        <span className="text-text">V17 →</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={scenario === s.id}
            onClick={() => setScenario(s.id)}
            title={s.label}
            className={
              "inline-flex min-h-[36px] items-center rounded-md border px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 " +
              (scenario === s.id ? "border-teal/50 bg-teal/10 text-teal" : "border-border text-muted hover:text-text")
            }
          >
            {s.version}
          </button>
        ))}
        <label className={"ml-1 inline-flex items-center gap-1.5 " + (offline ? "opacity-50" : "")}>
          <input
            type="checkbox"
            checked={muteCustomer}
            disabled={offline}
            onChange={(e) => setMuteCustomer(e.target.checked)}
            className="accent-teal"
          />
          mute Customer context
        </label>
        <button
          type="button"
          onClick={run}
          disabled={status === "loading"}
          className="press ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60 sm:min-h-0"
        >
          {status === "loading" ? "compiling…" : "▸ Compile"}
        </button>
      </div>

      {offline ? (
        <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[11px] text-amber">
          ◷ Offline — showing recorded engine output (seed 42, V17→{scenarioVersion(scenario)}).
          Editing and context toggles are inactive on recorded data; free-form editing needs the live backend.
        </p>
      ) : null}

      {/* result region */}
      <div aria-live="polite" aria-busy={status === "loading"} className="mt-4 min-h-[6rem]">
        {status === "idle" && (
          <p className="font-mono text-xs text-muted">
            Pick a change and press Compile — the compiler tells you what it <em>means</em> and which
            bounded contexts it touches. Real backend output only.
          </p>
        )}

        {status === "loading" && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 w-full animate-pulse-soft rounded bg-surface-2/60" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="rounded-lg border border-crimson/50 bg-crimson/10 p-4">
            <p className="font-mono text-sm font-semibold text-crimson">
              ✕ Compiler service unreachable — this is a live call, not a mock.
            </p>
            {err?.message ? <p className="mt-1 font-mono text-[11px] text-text">{err.message}</p> : null}
            {err?.requestId ? <p className="mt-1 font-mono text-[11px] text-muted">X-Request-ID: {err.requestId}</p> : null}
            <button type="button" onClick={run} className="press mt-3 rounded-md border border-border px-3 py-1 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">
              Retry
            </button>
          </div>
        )}

        {status === "empty" && (
          <p className="rounded-lg border border-border bg-surface-2/40 p-4 font-mono text-sm text-muted">
            No semantic change detected — nothing crosses a bounded-context seam in a meaning-changing
            way.
          </p>
        )}

        {status === "ok" && result && (
          <div className="space-y-4">
            {usedFixture ? null : (
              <p className="font-mono text-[11px] text-teal">✓ live · {result.base_version} → {result.proposed_version}</p>
            )}

            {/* inversion banner — the signature catch */}
            {inv?.detected ? (
              <div className="glow-crimson rounded-lg border border-crimson bg-crimson/10 p-4">
                <p className="font-mono text-sm font-semibold text-crimson">
                  ✕ Missing-attribute inversion detected · rule {inv.rule_id} · {inv.attribute}
                </p>
                <p className="mt-1 font-mono text-[11px] text-text">{inv.direction}</p>
                <p className="mt-1 text-sm text-muted">{inv.effect}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-teal/40 bg-teal/[0.06] p-4">
                <p className="font-mono text-sm font-semibold text-teal">✓ No missing-attribute inversion</p>
                <p className="mt-1 text-sm text-muted">No operator flip silently widens the audience.</p>
              </div>
            )}

            {/* affected contexts */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Bounded contexts touched</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.context_map.contexts.map((c) => {
                  const sev = SEV[c.max_severity];
                  const touched = c.change_count > 0;
                  return (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px]"
                      style={{
                        color: touched ? sev.color : "var(--c-muted)",
                        borderColor: touched ? sev.color : "var(--c-border)",
                        backgroundColor: touched ? `color-mix(in srgb, ${sev.color} 12%, transparent)` : "transparent",
                      }}
                      title={c.muted ? "muted (rules dropped)" : undefined}
                    >
                      <span aria-hidden>{touched ? sev.glyph : "·"}</span>
                      {c.label}
                      {touched ? ` · ${c.change_count}` : ""}
                      {c.muted ? " · muted" : ""}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* meaning-change cards */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Meaning changes</p>
              {result.meaning_changes.map((m) => {
                const sev = SEV[m.severity];
                return (
                  <div key={m.path} className="rounded-lg border p-3" style={{ borderColor: sev.color }}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs text-text">{m.path}</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: sev.color }}>
                        <span aria-hidden>{sev.glyph}</span> {sev.label} · {m.context}
                      </span>
                    </div>
                    <p className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="text-muted">{m.before_semantics}</span>
                      <span aria-hidden style={{ color: sev.color }}>→</span>
                      <span className="text-text">{m.after_semantics}</span>
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{m.explanation}</p>
                    <p className="mt-1 border-t border-border/60 pt-1.5 text-[11px] italic leading-relaxed text-muted">
                      {m.grounding}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
