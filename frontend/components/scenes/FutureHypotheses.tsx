/* Future hypotheses — where Threshold could go next, every one labelled HYPOTHESIS.
   Each is grounded in Rokt's verified public direction (rokt.com and public posts),
   framed as an independent interpretation — never a claim about Rokt's internal
   roadmap, and never presented as implemented. Correctness earns the right to
   experiment; it does not earn the right to claim impact. */

type Card = { title: string; body: string; grounding: string };

const CARDS: Card[] = [
  {
    title: "Agent-mediated thin-data cohort",
    body:
      "AI-referred sessions increasingly land pre-checkout on product pages, carrying thinner attributes (often no CC BIN, consent, or identity). A policy change safe in aggregate can silently widen eligibility for that cohort — aggregation hides the segment regression. Threshold would gate per-cohort, not just per-total.",
    grounding: "Rokt public: AI-referred shopping sessions beginning on product pages",
  },
  {
    title: "Agentic Transaction Passport",
    body:
      "A signed customer or agent mandate becomes a hard constraint the offer decision must conform to — translated at an anticorruption layer into the deterministic core, never trusted as free input. The passport travels with the transaction; the gate proves the decision honoured it.",
    grounding: "Rokt public: platform built for the AI moment / agent-mediated commerce",
  },
  {
    title: "In-purchase loyalty seam",
    body:
      "As loyalty moves from post-purchase to in-purchase, reward has three distinct states — earned, issued, redeemable — that must reconcile. Threshold would prove a change never issues a reward that isn't redeemable, closing the cross-aggregate invariant.",
    grounding: "Rokt public: loyalty moving to the in-purchase moment",
  },
  {
    title: "Causal read via a Would-Have-Seen holdout",
    body:
      "Threshold proves structural safety, then hands a replays-clean cohort to an independent WHS holdout (Haus-style) for the causal read. Structural correctness and causal lift stay separate claims — the gate never claims the number moved.",
    grounding: "Rokt public: incrementality as the performance standard; Haus partnership",
  },
];

export function FutureHypotheses() {
  return (
    <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
      {CARDS.map((c) => (
        <div key={c.title} className="lift flex flex-col rounded-2xl border border-border bg-surface/40 p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: "var(--c-muted)" }}>
              {c.grounding}
            </span>
            <span
              className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide"
              style={{ borderColor: "var(--c-amber)", color: "var(--c-amber)" }}
            >
              HYPOTHESIS
            </span>
          </div>
          <p className="text-sm font-semibold text-text">{c.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.body}</p>
        </div>
      ))}
    </div>
  );
}
