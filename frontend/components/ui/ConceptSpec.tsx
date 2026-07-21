/* The discipline behind a Future Vision concept, in the exact shape the Builder
   Vision mandates: every speculative concept must state its user, problem, bounded
   context, data, AI role, deterministic enforcement, privacy, customer guardrail,
   business hypothesis, the experiment it still needs, and how it fails. Collapsed
   by default so the live demo leads; a senior reviewer can open the rigor. */

export type Concept = {
  user: string;
  problem: string;
  boundedContext: string;
  data: string;
  aiRole: string;
  enforcement: string;
  privacy: string;
  guardrail: string;
  businessHypothesis: string;
  experiment: string;
  failure: string;
};

const ROWS: { key: keyof Concept; label: string }[] = [
  { key: "user", label: "User" },
  { key: "problem", label: "Problem" },
  { key: "boundedContext", label: "Bounded context" },
  { key: "data", label: "Data required" },
  { key: "aiRole", label: "AI role" },
  { key: "enforcement", label: "Deterministic enforcement" },
  { key: "privacy", label: "Privacy" },
  { key: "guardrail", label: "Customer guardrail" },
  { key: "businessHypothesis", label: "Business hypothesis" },
  { key: "experiment", label: "Experiment still required" },
  { key: "failure", label: "Failure behavior" },
];

export function ConceptSpec({ spec }: { spec: Concept }) {
  return (
    <details className="group glass rounded-xl">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="font-mono text-teal transition-transform group-open:rotate-90">▸</span>
        The discipline behind this hypothesis — user, guardrail, and the experiment it still needs
      </summary>
      <dl className="grid gap-x-6 gap-y-3 border-t border-border/60 px-4 py-4 sm:grid-cols-2">
        {ROWS.map(({ key, label }) => (
          <div key={key} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</dt>
            <dd className="mt-0.5 text-sm leading-snug text-text">{spec[key]}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
