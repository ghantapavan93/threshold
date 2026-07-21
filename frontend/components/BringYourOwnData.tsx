"use client";

import { useMemo, useState } from "react";
import { Section } from "./ui/primitives";

/* Bring your own data — the depth a senior engineer asks for.

   Rokt's own direction is the frame: the Rokt mParticle Hybrid CDP (Snowflake /
   BigQuery / Databricks, zero-copy, governed) is where an operator's real
   event-time sessions live; incrementality is measured with the "Would Have
   Seen" (WHS) holdout; and any replay over logged data has to be point-in-time
   correct — the feature-store rule that no future information leaks into a past
   decision. This panel takes a small slice of that data and shows, per row,
   exactly what the gate would catch BEFORE it reached a decision.

   Everything here is deterministic and client-side — the same checks the engine
   runs, applied to whatever you paste. No data leaves the browser. */

const SNAPSHOT = Date.parse("2026-12-01T00:00:00Z"); // the feature snapshot we replay "as of"
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const SAMPLE = `session_id,occurred_at,referral_source,cc_bin,amount_minor,currency,identity_ts,consent
s-1001,2026-07-01T10:00:00Z,checkout,411111,1299,USD,2026-06-28T00:00:00Z,granted
s-1002,2026-07-01T10:05:00Z,checkout,510510,899,USD,2026-06-30T00:00:00Z,granted
s-1003,2026-07-01T10:06:00Z,checkout,411111,1500,USD,2026-06-30T00:00:00Z,granted
s-1004,2026-07-01T10:07:00Z,ai_referred,,700,USD,2026-06-30T00:00:00Z,granted
s-1005,2026-07-01T10:08:00Z,ai_referred,,500,USD,2026-06-30T00:00:00Z,granted
s-1006,2026-07-01T10:09:00Z,ai_referred,411111,650,USD,2026-06-30T00:00:00Z,granted
s-1007,2026-07-01T10:10:00Z,ai_referred,,900,USD,2026-06-30T00:00:00Z,granted
s-1008,2026-07-01T10:11:00Z,agent,,1200,USD,2026-06-30T00:00:00Z,granted
s-1009,2026-07-01T10:12:00Z,checkout,411111,12.99,USD,2026-06-30T00:00:00Z,granted
s-1010,2026-07-01T10:13:00Z,checkout,411111,1500,USD,2025-01-01T00:00:00Z,granted
s-1011,2026-07-01T10:14:00Z,agent,411111,700,USD,2026-06-30T00:00:00Z,revoked
s-1001,2026-07-01T10:15:00Z,checkout,411111,700,USD,2026-06-30T00:00:00Z,granted
s-1012,2027-03-01T00:00:00Z,ai_referred,411111,700,USD,2026-06-30T00:00:00Z,granted`;

type Verdict = {
  id: string;
  status: "replay" | "excluded" | "flag" | "reject";
  label: string;
  why: string;
  concept: string;
  tone: string;
};

const TEAL = "var(--c-teal)";
const AMBER = "var(--c-amber)";
const CRIMSON = "var(--c-crimson)";
const MUTED = "var(--c-muted)";

function classify(row: Record<string, string>, seen: Set<string>): Verdict {
  const id = row.session_id?.trim() || "—";
  const t = Date.parse(row.occurred_at ?? "");

  if (!row.session_id?.trim() || Number.isNaN(t)) {
    return { id, status: "reject", label: "Malformed", tone: CRIMSON, concept: "idempotency + event-time",
      why: "No session key or no valid event-time — it can't be deduped or placed on the replay timeline." };
  }
  if (seen.has(id)) {
    return { id, status: "excluded", label: "Deduplicated", tone: MUTED, concept: "idempotent outbox",
      why: "Same session_id already processed — counted once, no double obligation." };
  }
  seen.add(id);

  if (t > SNAPSHOT) {
    return { id, status: "reject", label: "Future leakage", tone: CRIMSON, concept: "point-in-time correctness",
      why: "Event-time is after the feature snapshot we replay as-of — including it would leak the future into a past decision." };
  }
  if ((row.consent ?? "").match(/revoked|false|^0$|^no$/i)) {
    return { id, status: "excluded", label: "Consent excluded", tone: MUTED, concept: "mParticle consent state",
      why: "Consent revoked — the replay excludes it, so no decision is made on data that isn't legally usable." };
  }
  if (!row.cc_bin?.trim()) {
    return { id, status: "flag", label: "Missing attribute", tone: AMBER, concept: "the signature trap",
      why: "No cc_bin. This is exactly where an operator flip (include_is_not_in → exclude_is_in) silently widens eligibility." };
  }
  const amt = (row.amount_minor ?? "").trim();
  if (amt && !/^\d+$/.test(amt)) {
    return { id, status: "reject", label: "Unit mismatch", tone: CRIMSON, concept: "the Unit Wall",
      why: `amount_minor="${amt}" isn't whole minor units — a float/fractional value leaks at the seam.` };
  }
  if (amt && !row.currency?.trim()) {
    return { id, status: "reject", label: "Unit mismatch", tone: CRIMSON, concept: "the Unit Wall",
      why: "An amount with no currency is a number without units — refused at the seam." };
  }
  const idt = Date.parse(row.identity_ts ?? "");
  if (!Number.isNaN(idt) && t - idt > THIRTY_DAYS) {
    return { id, status: "flag", label: "Stale identity", tone: AMBER, concept: "match quality",
      why: "Identity resolved >30 days before the event — match rate and attribution quality degrade; flagged, not dropped." };
  }
  return { id, status: "replay", label: "Replays clean", tone: TEAL, concept: "eligible for WHS holdout",
    why: "Well-formed and point-in-time safe — it replays as-is and can feed a Would-Have-Seen holdout." };
}

function parse(csv: string): { rows: Record<string, string>[]; error: string | null } {
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], error: "Add a header row and at least one data row." };
  const header = (lines[0] ?? "").split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",");
    const r: Record<string, string> = {};
    header.forEach((h, i) => (r[h] = (cells[i] ?? "").trim()));
    return r;
  });
  return { rows, error: null };
}

export function BringYourOwnData() {
  const [text, setText] = useState(SAMPLE);
  const [ran, setRan] = useState(false);

  const result = useMemo(() => {
    if (!ran) return null;
    const { rows, error } = parse(text);
    if (error) return { error, verdicts: [] as Verdict[], rows: [] as Record<string, string>[] };
    const seen = new Set<string>();
    return { error: null, verdicts: rows.map((r) => classify(r, seen)), rows };
  }, [text, ran]);

  // Cohort view: the segment-aware read. AI-referred sessions land on product
  // pages pre-checkout, so the missing-attribute widening concentrates there —
  // a change that looks safe in aggregate can quietly widen the AI cohort.
  const cohorts = useMemo(() => {
    const v = result?.verdicts ?? [];
    const rows = result?.rows ?? [];
    if (!v.length || v.length !== rows.length) return [];
    const by = new Map<string, { total: number; widened: number }>();
    v.forEach((verd, i) => {
      const src = (rows[i]?.referral_source || "unknown").trim();
      const g = by.get(src) ?? { total: 0, widened: 0 };
      g.total += 1;
      if (verd.label === "Missing attribute") g.widened += 1;
      by.set(src, g);
    });
    return [...by.entries()]
      .map(([source, g]) => ({ source, ...g, rate: g.total ? g.widened / g.total : 0 }))
      .sort((a, b) => b.rate - a.rate);
  }, [result]);

  const counts = useMemo(() => {
    const v = result?.verdicts ?? [];
    return {
      total: v.length,
      replay: v.filter((x) => x.status === "replay").length,
      flag: v.filter((x) => x.status === "flag").length,
      excluded: v.filter((x) => x.status === "excluded").length,
      reject: v.filter((x) => x.status === "reject").length,
    };
  }, [result]);

  return (
    <Section
      id="byod"
      index={10}
      title="Bring your own data"
      subtitle="For the engineer who wants to go deeper. Paste a slice of your own event-time sessions — the kind that live in the Rokt mParticle Hybrid CDP — and watch the gate catch, row by row, what would corrupt a decision before it reached one. Deterministic, client-side, nothing leaves the browser."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* input */}
        <div className="glass rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
            <span className="font-mono text-xs text-muted">
              <span className="text-teal">sessions.csv</span> · event-time snapshot
            </span>
            <button
              type="button"
              onClick={() => setText(SAMPLE)}
              className="press rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              reset sample
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label="Your session data as CSV"
            className="mt-3 h-56 w-full resize-y rounded-lg border border-border bg-surface/60 p-3 font-mono text-[11px] leading-relaxed text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          />
          <button
            type="button"
            onClick={() => setRan(true)}
            className="press mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-teal/50 bg-teal/15 px-3 py-1 font-semibold text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
          >
            ▸ Run the gate over your data
          </button>
        </div>

        {/* output */}
        <div aria-live="polite">
          {!result ? (
            <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/40 px-6 text-center">
              <p className="text-sm font-medium text-text">Nothing evaluated yet</p>
              <p className="max-w-xs text-xs text-muted">
                The sample carries one of each edge case on purpose. Run it, or paste your own rows.
              </p>
            </div>
          ) : result.error ? (
            <div className="rounded-2xl border border-crimson/50 bg-crimson/10 p-4">
              <p className="font-mono text-sm font-semibold text-crimson">✕ {result.error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                <span className="rounded-md border border-teal/40 bg-teal/[0.08] px-2 py-0.5 text-teal">{counts.replay} replay</span>
                <span className="rounded-md border border-amber/40 bg-amber/[0.08] px-2 py-0.5 text-amber">{counts.flag} flagged</span>
                <span className="rounded-md border border-border px-2 py-0.5 text-muted">{counts.excluded} excluded</span>
                <span className="rounded-md border border-crimson/40 bg-crimson/[0.08] px-2 py-0.5 text-crimson">{counts.reject} rejected</span>
              </div>
              <ul className="space-y-2">
                {result.verdicts.map((v, i) => (
                  <li key={i} className="rounded-lg border p-2.5" style={{ borderColor: `color-mix(in srgb, ${v.tone} 45%, transparent)` }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-muted">{v.id}</span>
                      <span className="font-mono text-[11px] font-semibold" style={{ color: v.tone }}>{v.label}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{v.why}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wide" style={{ color: v.tone }}>{v.concept}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* cohort view — the segment a mean hides, grounded in Rokt's AI-referred data */}
      {result && !result.error && cohorts.length ? (
        <div className="mt-5 rounded-2xl border border-offer-blue/30 bg-offer-blue/[0.05] p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wide text-offer-blue">By traffic source · the segment a mean hides</p>
            <span className="font-mono text-[10px] text-muted">Rokt, public: &ldquo;half of AI-referred sessions begin on product pages&rdquo;</span>
          </div>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
            AI-referred and agent traffic arrives pre-checkout, so the missing-attribute widening concentrates there. The
            same change can read <span className="text-text">safe in aggregate</span> and still quietly widen the
            AI-referred segment — so the gate scores each cohort, not just the mean.
          </p>
          <div className="mt-4 space-y-2.5">
            {cohorts.map((c) => {
              const tone = c.rate >= 0.5 ? CRIMSON : c.rate > 0 ? AMBER : TEAL;
              return (
                <div key={c.source}>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-text">{c.source}</span>
                    <span style={{ color: tone }}>{Math.round(c.rate * 100)}% widening-exposed · {c.widened}/{c.total}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full border border-border/60">
                    <span className="block h-full transition-[width] duration-500" style={{ width: `${Math.max(c.rate * 100, 2)}%`, backgroundColor: tone }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 font-mono text-[11px] text-offer-blue">→ this is BC-7 Agent-Mediation — the cohort a policy change reaches through an AI.</p>
        </div>
      ) : null}

      {/* the contract + honest limits + future */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-surface/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-teal">The ingestion contract</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            One row per session: a key, an <span className="text-text">event-time</span>, the policy attributes the
            decision reads (here <span className="font-mono text-text">cc_bin</span>), whole-minor-unit amounts with a
            currency, an identity timestamp, and consent state. It maps to a governed pull from the Hybrid CDP —
            Snowflake, BigQuery, Databricks — replayed <span className="text-text">as-of a snapshot</span>, never live.
          </p>
        </div>
        <div className="rounded-2xl border border-amber/25 bg-amber/[0.05] p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-amber">Honest limits</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            This slice runs the format + semantic checks client-side; the full engine also replays the decision itself
            and reconciles downstream. It doesn&apos;t parse quoted CSV commas, and it can&apos;t prove your snapshot is
            itself leak-free — that&apos;s a property of how you built the export, not something a validator can see.
          </p>
        </div>
        <div className="rounded-2xl border border-teal/25 bg-teal/[0.05] p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-teal">Where this goes</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Next: read event-time snapshots straight from the CDP with governance intact, and hand a
            <span className="text-text"> replays-clean</span> cohort to a Would-Have-Seen holdout (Haus-style) for the
            causal read. Threshold proves the change is structurally safe; the holdout proves it moved the number.
          </p>
        </div>
      </div>
    </Section>
  );
}
