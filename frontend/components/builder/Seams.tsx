"use client";

import { MaskText, Reveal, StaggerGroup } from "./anim";
import { HonestyTag } from "./depth";

/* ────────────────────────────────────────────────────────────────────────────
   "Seams I see" — out-of-box opportunities, all clearly labeled HYPOTHESIS.
   Absorbs/replaces "More opportunities I see". Framed as ownable problem classes,
   never as gaps Rokt hasn't considered. Content verbatim-ish from
   docs/BUILDER_DEPTH.md; the OpenAI/ACP/AP2 facts are the doc's verified facts.
   ──────────────────────────────────────────────────────────────────────────── */

type Featured = { name: string; thesis: string; reframe: string; risk: string };

const FEATURED: Featured[] = [
  {
    name: "Holdout Integrity Ledger",
    thesis: "Incrementality is a systems-integrity problem before it's a statistics problem.",
    reframe:
      "Rokt's verified “Would Have Seen” rule — a holdout member is “always a member … excluded from all future opportunities” — is really a distributed idempotency / audit invariant across checkout, rewards and onsite media. One silent leak biases lift upward and no dashboard shows it. Build: an append-only, tamper-evident WHS ledger + a fail-closed exclusion gate + an offline leak-auditor that emits an integrity certificate.",
    risk:
      "Likely table-stakes plumbing internally; the differentiator is the certificate as a sellable measurement-assurance artifact.",
  },
  {
    name: "Agent Mandate Verifier at the Transaction Moment",
    thesis: "The offer decision, not just the payment, must obey the agent's mandate.",
    reframe:
      "When an LLM shopping agent arrives with a signed AP2 Intent / Cart / Payment chain, the Brain's next-best-action must be bounded by what the human authorized — the decision layer everyone skips, and Rokt uniquely owns it. Build: a deterministic mandate verifier → an Authorized-Action Envelope → a constraint layer that vetoes any Brain proposal outside it; fail-closed to the consent-safe default.",
    risk:
      "Protocol volatility (ACP's Instant Checkout died in 5 months) — target the stable abstraction (a signed envelope), not one wire format.",
  },
  {
    name: "Incrementality of Agent-Mediated Offers",
    thesis: "“It converts for humans” is not evidence it converts through a bot.",
    reframe:
      "Grounded in the verified OpenAI Instant Checkout shutdown (Mar 2026, near-zero sales): an offer a human sees and the “same” offer an agent may summarize / reorder / suppress are different causal objects. Build: a mediation classifier + a deterministic presentation-integrity probe (a degraded-impression flag) + a mediation-stratified holdout.",
    risk:
      "Agent volume may be too low in 2026 to power per-channel lift — a “get ready for” bet.",
  },
];

type Compact = { name: string; thesis: string; risk: string };

const COMPACT: Compact[] = [
  {
    name: "Reward-Liability Idempotency & Reconciliation",
    thesis: "Exactly-once economics for Gift-with-Purchase.",
    risk: "Payments are likely solved; the bet is treating reward liability with the same money-boundary rigor.",
  },
  {
    name: "Conformance Gate for Agent-Authored Decisioning Changes",
    thesis: "Threshold's replay-diff pointed at agent-written PRs — Rokt's own “watching for drift.”",
    risk: "Needs Rokt's real change schema; the mechanism is proven, the integration isn't.",
  },
  {
    name: "Cross-Surface Exposure & Frequency Integrity",
    thesis: "One authority for global frequency + WHS across surfaces.",
    risk: "Org boundaries more than tech — one authority across surfaces is a coordination bet.",
  },
  {
    name: "Self-Serve Incrementality Guardrail",
    thesis: "Holdout inventory is scarce spend; make tests earn it, and seal the analysis plan against peeking.",
    risk: "Cultural — teams must accept a gate that can say “not enough inventory to test.”",
  },
  {
    name: "Clean-Room Lift Certificate",
    thesis: "Prove lift without a raw-PII join — a verifiable, consent-time-bound certificate.",
    risk: "Depends on clean-room / consent infra I can't see; the certificate format is the ownable piece.",
  },
];

export function Seams() {
  return (
    <section
      id="seams"
      aria-labelledby="seams-title"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20"
    >
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-teal">
          Seams I see · out-of-box
        </p>
      </Reveal>
      <MaskText
        as="h2"
        id="seams-title"
        className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
        segments={[{ text: "Problem classes " }, { text: "I'd want to own.", className: "gradient-text" }]}
      />
      <Reveal delay={0.05}>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          Rokt is sophisticated and almost certainly has internal thinking on all of these. The value
          is the framing — and that I can own a problem class end to end. Every one is the same DNA: a{" "}
          <span className="text-text">
            deterministic, fail-closed, tamper-evident wrapper around a probabilistic or agent-driven
            core.
          </span>
        </p>
      </Reveal>

      {/* Three featured seams */}
      <StaggerGroup className="mt-10 grid gap-4 lg:grid-cols-3" stagger={0.08}>
        {FEATURED.map((s) => (
          <article key={s.name} className="holo-card flex h-full flex-col rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold leading-snug text-text">{s.name}</h3>
              <HonestyTag kind="HYPOTHESIS" />
            </div>
            <p className="mt-3 text-sm font-medium italic leading-relaxed text-teal">{s.thesis}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{s.reframe}</p>
            <div className="mt-4 rounded-lg border border-amber/25 bg-amber/[0.06] p-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-amber">Honest risk</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{s.risk}</p>
            </div>
          </article>
        ))}
      </StaggerGroup>

      {/* Five compact seams */}
      <StaggerGroup className="mt-4 grid gap-4 sm:grid-cols-2" stagger={0.06}>
        {COMPACT.map((s) => (
          <article key={s.name} className="glass flex h-full flex-col rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold leading-snug text-text">{s.name}</h3>
              <HonestyTag kind="HYPOTHESIS" />
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.thesis}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              <span className="font-semibold text-amber">Risk: </span>
              {s.risk}
            </p>
          </article>
        ))}
      </StaggerGroup>
    </section>
  );
}
