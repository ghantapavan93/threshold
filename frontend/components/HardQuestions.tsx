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

const QA: { q: string; a: string; tag: Tag; proof?: string }[] = [
  {
    tag: "CORE",
    q: "Replay is off-policy — the sessions were logged under V17. Doesn't that invalidate testing V18?",
    a: "It would, if we claimed lift. We don't. Replay proves STRUCTURAL safety — does the change widen eligibility or break a hard constraint — a property of the policy function on fixed inputs, so it holds regardless of how behavior might shift. And “on fixed inputs” is itself a proven law: a property test shows the decision reads only the attributes the policy references, so replaying a point-in-time snapshot can't leak future or extra data into a past decision. Behavioral lift is a different question, and only the Would-Have-Seen holdout answers it — a positive verdict here is eligibility for that holdout, never “it will win.”",
    proof: "backend/tests/test_invariants.py::test_law_reads_only_referenced_attributes",
  },
  {
    tag: "ENFORCED",
    q: "“Same input, bit-identical output” — really?",
    a: "The decision path has no wall-clock, no RNG, no network, no LLM (evaluator.py). Iteration is sorted; the single synthetic input is seeded and labelled. This isn't asserted on a few examples — it's a PROPERTY checked over generated inputs with Hypothesis: for any attributes and any policy, evaluate returns the same Decision twice and never raises.",
    proof: "backend/tests/test_invariants.py::test_law_deterministic · test_law_evaluate_is_total",
  },
  {
    tag: "ENFORCED",
    q: "Independent per-record HMACs miss deletion and reordering.",
    a: "Correct — which is why the log is hash-chained: each record's HMAC commits the prior record's. Reorder or delete an interior record and the chain breaks — both checked as properties over generated event sequences. Truncation is closed by the signed head seal (next card). It is still not tamper-PROOF against a key-holder, who can forge a fresh chain and seal — and we say exactly that.",
    proof: "backend/tests/test_invariants.py::test_law_audit_chain_integrity",
  },
  {
    tag: "ENFORCED",
    q: "Then just truncate it — drop the last few records.",
    a: "Caught — and this one is built, not described. A plain chain can't see truncation (dropping the tail leaves a valid shorter chain), so the log ships with a SEAL: a key-signed commitment to (record count, head HMAC). Drop the tail and the count no longer matches the seal; forging a seal for a shorter log needs the secret. Prove it live in the Evidence drawer — “✂ Drop the last record” makes verify fail with “log truncated… the sealed head commits N”. A property test asserts both halves: chain alone misses it, the seal catches it.",
    proof: "backend/app/domain/audit.py::compute_seal · tests/test_invariants.py::test_law_truncation_caught_by_seal",
  },
  {
    tag: "CORE",
    q: "A “missing attribute” might just mean the field postdates the event.",
    a: "Yes — conflating “didn't exist yet” with “genuinely absent” would fabricate a widening signal. We replay as-of a point-in-time snapshot and read only the fields the schema had then; a field introduced later is not a widening. And the safety direction is a proven law: under every operator but the one dangerous flip, eligibility REQUIRES the attribute present — so losing data can only narrow, never widen. The trap (exclude_is_in) is precisely the operator that violates it.",
    proof: "backend/tests/test_invariants.py::test_law_conservative_eligibility_requires_presence · test_law_missing_fails_closed",
  },
  {
    tag: "CORE",
    q: "Can't I just evade the trap? Rename the flipped rule, or remove it and add a new one.",
    a: "You could have — that was a real fail-open, found while bug-hunting. The trap detector used to key on the diff seeing the SAME rule id change operator in place; rename the rule (or remove+add with a new id) and the identical silent widening sailed through as ELIGIBLE_FOR_HOLDOUT. It's now detected at the ATTRIBUTE level, independent of rule ids: for any attribute the base guarded against missing values but the proposal no longer does, each affected session is confirmed by re-guarding that attribute and checking the offer vanishes. Rename, remove, or flip in place — all three now BLOCK.",
    proof: "backend/tests/test_bughunt_regressions.py::test_rename_evasion_is_caught · test_remove_guard_evasion_is_caught",
  },
  {
    tag: "CORE",
    q: "The safe fix lowers the age gate 25→18 — that widens who gets an offer. Why does it pass instead of blocking?",
    a: "Because a VISIBLE, deliberate widening is exactly what a holdout is for — blocking it would be the gate overreaching. But “not blocked” must never mean “unseen”: a widening that reaches the holdout unnamed is a rubber-stamp. So a widening is neither blocked nor ignored — it surfaces as a first-class INFO result that the verdict does not gate on (INFO is neither FAIL nor WARN), names in its reasons, and routes into the holdout config as confirm_scope: the precise cohort the 5% control must prove pays for itself. What the gate DOES block is the other kind — a SILENT structural widening the operator didn't intend, the missing-attribute flip. Visible-and-measured vs silent-and-blocked is the whole distinction.",
    proof: "backend/tests/test_domain.py::test_constraints_safe_surfaces_widening_without_blocking",
  },
  {
    tag: "ENFORCED",
    q: "You test the cases you imagined. Production breaks on the ones you didn't. How do you find those?",
    a: "A standing adversarial harness — the Counterexample Forge. A proposer enumerates adversarial fixtures across every invariant class (the missing-attribute flip spelled three ways, consent gaps, brand-safety, immutable edits, fat-fingers, fault injections, poisoned types, and a point-in-time control), and the REAL deterministic engine judges each one: CONTAINED, SURFACED, SAFE, or GAP. The proposer only suggests what to try — an LLM could write these, but here it's a reproducible enumerator so the harness stays CI-safe and no model touches the critical path. The GAP verdict isn't decorative: an independent ground-truth oracle detects silent widening even if a guard regresses, so the moment the rename-evasion fix (or any guard) breaks, a GAP appears. On the current engine the GAP set is empty — 16 fixtures, 0 gaps. Run it live on the Console.",
    proof: "backend/tests/test_counterexample.py::test_forge_finds_no_gaps_on_the_current_engine · test_gap_branch_is_reachable_the_detector_is_not_rigged",
  },
  {
    tag: "PRECISE",
    q: "Exactly-once delivery?",
    a: "No — exactly-once is impossible in a distributed system (two generals). We do effectively-once: at-least-once delivery from the transactional outbox plus idempotent dedup on (conversiontype, confirmationref). The verdict and its outbox rows commit atomically, then publish independently.",
    proof: "backend/tests/test_api.py::test_conversion_dedup · test_outbox.py::test_replay_enqueues_outbox_atomically",
  },
  {
    tag: "ENFORCED",
    q: "Consent — you exclude “revoked”, but what about missing consent?",
    a: "Absent or unknown consent fails closed to excluded. Absence isn't permission; the gate never defaults to allow on an unknown consent state. Only an affirmative grant proceeds.",
    proof: "frontend/components/BringYourOwnData.tsx::classify (consent · fail-closed)",
  },
  {
    tag: "HONEST LIMIT",
    q: "You say “whole values” — but JPY has no minor unit and BHD has three.",
    a: "Today the Unit Wall enforces integer minor units at the seam — it refuses floats and unitless numbers. Per-currency exponent scaling (ISO 4217) is the honest next step, not yet enforced. We won't claim it until it is.",
  },
  {
    tag: "HONEST LIMIT",
    q: "Holdout rigor — sample-ratio mismatch, power, peeking, interference?",
    a: "That's the causal read, and it isn't ours to claim — it's the external Would-Have-Seen holdout (Haus-style). Threshold's job is upstream: prove the change is structurally safe before it reaches the holdout, and flag premature calls. We flag thin support and refuse to estimate; the causal statistics stay with the holdout.",
    proof: "backend/tests/test_ope.py::test_refuses_on_skewed_weights (the refusal we DO own)",
  },
  {
    tag: "ENFORCED",
    q: "What if I feed the value estimator garbage — a propensity above 1, a NaN, a wrong-length reward model?",
    a: "It refuses, it doesn't guess. Another bug-hunt find: the estimator used to accept impossible propensities (target 1.5, negatives, logging > 1) and return a confident number. Now anything outside a valid probability range, any non-finite reward or propensity, and a reward model whose length doesn't match the data all return INSUFFICIENT_EVIDENCE with the reason — alongside the existing effective-sample-size floor. A pre-holdout estimate you can't trust is worse than none.",
    proof: "backend/tests/test_ope.py::test_refuses_impossible_propensities · test_bughunt_regressions.py::test_ope_refuses_nonfinite_and_bad_reward_hat_length",
  },
];

export function HardQuestions() {
  return (
    <Section
      id="hard-questions"
      index={11}
      title="The hard questions"
      subtitle="The deepest things a staff engineer asks — answered, and each answer points at the file and test that proves it, not just prose. Enforced and tested, stated precisely, or an honest limit we won't paper over. Every proof below is a real path in this repo."
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
              {item.proof ? (
                <div className="mt-auto pt-3">
                  <div className="scroll-x overflow-x-auto rounded-md border border-border/60 bg-base/60 px-2.5 py-1.5">
                    <code className="whitespace-nowrap font-mono text-[10px] text-muted">
                      <span className="text-teal">proof ▸</span> {item.proof}
                    </code>
                  </div>
                </div>
              ) : (
                <p className="mt-auto pt-3 font-mono text-[10px] text-amber/80">
                  ▸ no claim to prove — an open limit, stated above
                </p>
              )}
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
