"use client";

import { Section } from "./ui/primitives";

/* The hard questions — the deepest things a staff engineer asks, answered
   honestly, and labelled by what's actually true in the code: ENFORCED (and
   tested), PRECISE (a claim stated exactly), or an HONEST LIMIT we won't paper
   over. The point is to fail to the core of each claim before anyone asks. */

type Tag = "CORE" | "ENFORCED" | "PRECISE" | "HONEST LIMIT";

const TONE: Record<Tag, string> = {
  CORE: "var(--c-teal)",
  ENFORCED: "var(--c-teal)",
  PRECISE: "var(--c-offer-blue)",
  "HONEST LIMIT": "var(--c-amber)",
};

const QA: { q: string; a: string; tag: Tag }[] = [
  {
    tag: "CORE",
    q: "Replay is off-policy — the sessions were logged under V17. Doesn't that invalidate testing V18?",
    a: "It would, if we claimed lift. We don't. Replay proves STRUCTURAL safety — does the change widen eligibility or break a hard constraint — a property of the policy function on fixed inputs, so it holds regardless of how behavior might shift. Behavioral lift is a different question, and only the Would-Have-Seen holdout answers it. A positive verdict here is eligibility for that holdout, never “it will win.”",
  },
  {
    tag: "ENFORCED",
    q: "“Same input, bit-identical output” — really?",
    a: "The decision path has no wall-clock, no RNG, no network, no LLM (evaluator.py). Iteration is sorted; the single synthetic input is seeded and labelled. This isn't asserted on a few examples — it's a PROPERTY checked over generated inputs with Hypothesis: for any attributes and any policy, evaluate returns the same Decision twice and never raises.",
  },
  {
    tag: "ENFORCED",
    q: "Independent per-record HMACs miss deletion and reordering.",
    a: "Correct — which is why the log is hash-chained: each record's HMAC commits the prior record's. Reorder or delete an interior record and the chain breaks — both are checked as properties over generated event sequences, not single examples. It is still not tamper-PROOF: a key-holder can forge a fresh chain, and — see the next card — suffix truncation is its own limit.",
  },
  {
    tag: "HONEST LIMIT",
    q: "Then just truncate it — drop the last few records.",
    a: "That's the one thing a plain hash chain can't see: editing, reordering, and interior deletion all break a link, but dropping the SUFFIX leaves a valid shorter chain. Detecting truncation needs an external anchor — a separately-signed head hash and record count. We assert this gap in a test rather than let the chain imply it's covered. It's the honest next step.",
  },
  {
    tag: "CORE",
    q: "A “missing attribute” might just mean the field postdates the event.",
    a: "Yes — conflating “didn't exist yet” with “genuinely absent” would fabricate a widening signal. We replay as-of a point-in-time snapshot and read only the fields the schema had then; a field introduced later is not a widening. Keeping those two apart is the whole reason the missing-attribute trap is subtle.",
  },
  {
    tag: "PRECISE",
    q: "Exactly-once delivery?",
    a: "No — exactly-once is impossible in a distributed system (two generals). We do effectively-once: at-least-once delivery from the transactional outbox plus idempotent dedup on (conversiontype, confirmationref). The verdict and its outbox rows commit atomically, then publish independently.",
  },
  {
    tag: "ENFORCED",
    q: "Consent — you exclude “revoked”, but what about missing consent?",
    a: "Absent or unknown consent fails closed to excluded. Absence isn't permission; the gate never defaults to allow on an unknown consent state. Only an affirmative grant proceeds.",
  },
  {
    tag: "HONEST LIMIT",
    q: "You say “whole values” — but JPY has no minor unit and BHD has three.",
    a: "Today the Unit Wall enforces integer minor units at the seam — it refuses floats and unitless numbers. Per-currency exponent scaling (ISO 4217) is the honest next step, not yet enforced. We won't claim it until it is.",
  },
  {
    tag: "HONEST LIMIT",
    q: "Holdout rigor — sample-ratio mismatch, power, peeking, interference?",
    a: "That's the causal read, and it isn't ours to claim — it's the external Would-Have-Seen holdout (Haus-style). Threshold's job is upstream: prove the change is structurally safe before it reaches the holdout, and flag premature calls. We don't own the statistics and don't pretend to.",
  },
];

export function HardQuestions() {
  return (
    <Section
      id="hard-questions"
      index={11}
      title="The hard questions"
      subtitle="The deepest things a staff engineer asks — off-policy validity, determinism, tamper-evidence, exactly-once, consent, units, causal rigor — answered before they're asked. Each is labelled by what the code actually does: enforced and tested, stated precisely, or an honest limit we won't paper over."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {QA.map((item, i) => {
          const tone = TONE[item.tag];
          return (
            <article key={i} className="glass flex flex-col rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-snug text-text">
                  <span aria-hidden className="mr-1.5 font-mono text-muted">Q</span>
                  {item.q}
                </p>
                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                  style={{ color: tone, borderColor: tone, backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)` }}
                >
                  {item.tag}
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.a}</p>
            </article>
          );
        })}
      </div>
      <p className="mt-4 max-w-[68ch] text-xs leading-relaxed text-muted">
        If a question here should have a sharper answer — or a wrong one — that&apos;s the conversation worth having. The
        honesty is the product: a gate you can only trust if it tells you where it stops.
      </p>
    </Section>
  );
}
