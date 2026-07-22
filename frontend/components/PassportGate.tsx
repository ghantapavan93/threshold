"use client";

import { useEffect } from "react";
import { Card, EmptyState, Section } from "./ui/primitives";
import { TruthLabel } from "./ui/TruthLabel";
import { ConceptSpec, type Concept } from "./ui/ConceptSpec";
import { usePassport } from "@/lib/hooks";
import type { PassportStatus } from "@/lib/schemas";

/* Agentic Transaction Passport — an untrusted, agent-authored packet of intent
   passes through a deterministic anti-corruption layer. A field reaches the
   transaction only if it is supported, valid, customer-confirmed, in-window, and
   (if sensitive) consented. The ACL admits a SUBSET of what was claimed — the agent
   can never invent or inflate context, and a prompt injection is just an unsupported
   key that gets stripped. No LLM in the path. */

const STATUS_TONE: Record<PassportStatus, string> = {
  ADMITTED: "var(--c-teal)",
  STRIPPED: "var(--c-amber)",
  REJECTED: "var(--c-crimson)",
};

const STATUS_GLYPH: Record<PassportStatus, string> = {
  ADMITTED: "✓",
  STRIPPED: "⊘",
  REJECTED: "✕",
};

function StatusBadge({ status }: { status: PassportStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: tone, borderColor: tone, backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)` }}
    >
      <span aria-hidden>{STATUS_GLYPH[status]}</span>
      {status}
    </span>
  );
}

const SCENARIO_ORDER = [
  "clean", "prompt_injection", "unconfirmed", "expired",
  "tampered", "sensitive_no_consent", "sensitive_with_consent", "out_of_range",
];

const CONCEPT: Concept = {
  user: "A customer shopping through an AI agent, and the transaction platform receiving that agent's intent.",
  problem: "The agent's language isn't the transaction's, and the agent is untrusted — it can be prompt-injected, stale, or over-scoped.",
  boundedContext: "The seam between the agent and the transaction — an anti-corruption layer.",
  data: "A customer-approved subset of intent (party size, spend ceiling, time, location, dietary), minimized to a fixed schema.",
  aiRole: "The agent AUTHORS the claimed passport (untrusted input). It never decides what is admitted.",
  enforcement: "A pure ACL admits only supported ∧ valid ∧ customer-confirmed ∧ in-window ∧ consented fields; HMAC provenance over the whole passport.",
  privacy: "Only schema-supported, customer-confirmed fields; sensitive fields need consent; the passport is short-lived and expiring.",
  guardrail: "Explicit per-field confirmation — nothing the customer didn't approve reaches the transaction.",
  businessHypothesis: "Safe agent context → stronger relevance at the agentic frontier → incremental conversion.",
  experiment: "Measure relevance/conversion with passport context vs. without, under a holdout; watch that unconfirmed-field leakage stays zero.",
  failure: "Fail-closed: expired, tampered, unconfirmed, or unsupported fields are not admitted; the transaction proceeds with less context, never corrupted.",
};

export function PassportGate() {
  const pg = usePassport();
  const data = pg.data;
  const active = data?.scenario;

  // Self-demonstrate with the signature case: an agent trying to inject context.
  useEffect(() => {
    pg.mutate({ scenario: "prompt_injection" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scenarios = data?.scenarios ?? SCENARIO_ORDER;
  const o = data?.outcome;

  return (
    <Section
      id="passport"
      index={14}
      title="Agentic Transaction Passport"
      subtitle="An AI shopping agent hands the transaction a short-lived packet of claimed intent — party size, spend ceiling, a time constraint. The agent is untrusted. An anti-corruption layer admits a field only if it is supported, valid, customer-confirmed, in-window, and consented — a customer-approved subset of intent, never more."
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="LIVE" /> the ACL judges the passport now
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="MODELED" /> a deterministic anti-corruption layer, no LLM in the path
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TruthLabel kind="HYPOTHESIS" /> the agent, and the future it implies, is the speculative part
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {scenarios.map((name) => {
          const on = name === active;
          return (
            <button
              key={name}
              type="button"
              onClick={() => pg.mutate({ scenario: name })}
              disabled={pg.isPending}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                color: on ? "var(--c-teal)" : "var(--c-muted)",
                borderColor: on ? "var(--c-teal)" : "var(--c-border)",
                backgroundColor: on ? "color-mix(in srgb, var(--c-teal) 12%, transparent)" : "transparent",
              }}
            >
              {name.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>

      {pg.isError ? (
        <EmptyState title="The passport gate could not reach the engine." hint="Start the backend on :8000 and pick a scenario." />
      ) : !data || !o ? (
        <EmptyState title="Judging a passport…" hint="An untrusted packet of agent intent, gated field by field." />
      ) : (
        <div className="space-y-4">
          <Card
            className="flex flex-wrap items-center justify-between gap-3 p-4"
            style={{ borderColor: o.passport_valid ? "color-mix(in srgb, var(--c-teal) 40%, transparent)" : "var(--c-crimson)" }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">{data.label}</p>
              <p className="mt-0.5 text-xs text-muted">{data.blurb}</p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                agent {o.agent_id} · {o.passport_valid ? `valid, expires in ${o.expires_in}s` : `INVALID — ${o.reason}`}
              </p>
            </div>
            <div className="flex shrink-0 gap-2 font-mono text-xs">
              {(["ADMITTED", "STRIPPED", "REJECTED"] as PassportStatus[]).map((st) => (
                <span
                  key={st}
                  className="rounded-md border px-2 py-1"
                  style={{ color: STATUS_TONE[st], borderColor: `color-mix(in srgb, ${STATUS_TONE[st]} 40%, transparent)` }}
                >
                  {st[0] + st.slice(1).toLowerCase()}{" "}
                  {data.summary[st.toLowerCase() as "admitted" | "stripped" | "rejected"]}
                </span>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Left: what the untrusted agent claimed. */}
            <Card className="p-4">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">Claimed by the agent · untrusted</p>
              <ul className="space-y-1.5">
                {data.passport.fields.map((f) => (
                  <li key={f.key} className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span className="truncate text-text">
                      {f.key}: <span className="text-muted">{String(f.value)}</span>
                    </span>
                    <span className="shrink-0 text-[10px]" style={{ color: f.customer_confirmed ? "var(--c-teal)" : "var(--c-crimson)" }}>
                      {f.customer_confirmed ? "confirmed" : "unconfirmed"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Right: the safe context the transaction actually receives. */}
            <Card className="p-4" style={{ borderColor: "color-mix(in srgb, var(--c-teal) 30%, transparent)" }}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-teal">Admitted safe context · what the transaction sees</p>
              {Object.keys(o.admitted).length === 0 ? (
                <p className="font-mono text-xs text-muted">∅ nothing admitted — the transaction receives no agent context.</p>
              ) : (
                <ul className="space-y-1.5">
                  {Object.entries(o.admitted).map(([k, v]) => (
                    <li key={k} className="font-mono text-xs text-text">
                      {k}: <span className="text-teal">{String(v)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {o.derived_spend ? (
                <p className="mt-2 border-t border-border/60 pt-2 font-mono text-[11px] text-muted">
                  spend ceiling → <span className="text-teal">{o.derived_spend.display}</span>{" "}
                  ({o.derived_spend.minor} minor · {o.derived_spend.currency} exp {o.derived_spend.exponent}, ISO 4217)
                </p>
              ) : null}
            </Card>
          </div>

          {/* The per-field ruling. */}
          <div className="space-y-2">
            {o.ledger.map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface/40 px-3 py-2"
              >
                <StatusBadge status={row.status} />
                <span className="shrink-0 font-mono text-xs font-semibold text-text">{row.key}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted">{row.reason}</span>
              </div>
            ))}
          </div>

          <p className="border-l-2 border-teal/60 pl-3 text-sm font-medium text-text">{data.law}</p>
          <p className="max-w-[70ch] text-xs leading-relaxed text-muted">{data.note}</p>
        </div>
      )}
      <div className="mt-4">
        <ConceptSpec spec={CONCEPT} />
      </div>
    </Section>
  );
}
