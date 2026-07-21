/* The Builder Vision's honesty vocabulary as one reusable chip. Every important
   claim on the site should wear exactly one of these, so a reviewer can tell at a
   glance what is running vs. measured vs. merely hoped-for. Color + word, never
   color alone. */

export type Truth =
  | "LIVE" // runs against the backend right now
  | "MEASURED" // a real benchmark in this repo
  | "VERIFIED" // grounded in a cited public Rokt fact
  | "MODELED" // a deterministic stand-in / architecture projection
  | "HYPOTHESIS" // a future extension, not built
  | "LIMITATION"; // a boundary we won't paper over

const TONE: Record<Truth, string> = {
  LIVE: "var(--c-teal)",
  MEASURED: "var(--c-teal)",
  VERIFIED: "var(--c-offer-blue)",
  MODELED: "var(--c-offer-blue)",
  HYPOTHESIS: "var(--c-amber)",
  LIMITATION: "var(--c-amber)",
};

export function TruthLabel({ kind, title }: { kind: Truth; title?: string }) {
  const tone = TONE[kind];
  return (
    <span
      title={title}
      className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
      style={{
        color: tone,
        borderColor: tone,
        backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)`,
      }}
    >
      {kind}
    </span>
  );
}
