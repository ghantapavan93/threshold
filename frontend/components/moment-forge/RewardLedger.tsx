"use client";

import { useRedemptionAudit } from "@/lib/hooks";

/* The reward collision, proven. "reward" means three different things — EARNED (a
   claim), ISSUED (a booked liability), REDEEMABLE (a right, currently usable). This
   figure calls the third aggregate (redemption.py): a seeded lifecycle replay that
   shows issued ≠ redeemable as numbers, and rejects every illegal redemption —
   expired, double, clawed-back, never-issued — instead of silently letting it
   through. No prose claim; the state machine does the work. */

const STATE_TONE: Record<string, string> = {
  earned: "var(--c-muted)",
  issued: "var(--c-offer-blue)",
  redeemed: "var(--c-teal)",
  expired: "var(--c-amber)",
  clawed_back: "var(--c-crimson)",
};

const MEANINGS = [
  { key: "earned", label: "EARNED", gloss: "a claim — qualified, nothing owed yet" },
  { key: "issued", label: "ISSUED", gloss: "a booked liability — materialized" },
  { key: "redeemable", label: "REDEEMABLE", gloss: "a right — currently usable" },
] as const;

export function RewardLedger() {
  const q = useRedemptionAudit();

  if (q.isPending) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-2/40" />;
  }
  if (q.isError || !q.data) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface/40 px-4 py-6 text-center text-sm text-muted">
        Start the backend on :8000 to run the reward lifecycle live.
      </p>
    );
  }

  const d = q.data;
  const ine = d.issued_ne_redeemable;
  const rejected = d.attempts.filter((a) => a.action === "redeem" && !a.accepted);
  const total = d.summary.rewards || 1;

  return (
    <div className="space-y-5">
      {/* the three meanings */}
      <div className="grid gap-3 sm:grid-cols-3">
        {MEANINGS.map((m, i) => {
          const tone = STATE_TONE[m.key] ?? "var(--c-muted)";
          const count =
            m.key === "earned" ? d.summary.rewards
              : m.key === "issued" ? ine.issued_ever
                : ine.redeemable_at_cut;
          return (
            <div key={m.key} className="glass rounded-xl p-4" style={{ borderColor: `color-mix(in srgb, ${tone} 35%, transparent)` }}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] font-semibold tracking-wide" style={{ color: tone }}>{m.label}</span>
                <span className="font-mono text-xl font-bold" style={{ color: tone }}>{count}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{m.gloss}</p>
              {i < MEANINGS.length - 1 ? (
                <span aria-hidden className="mt-2 block text-right text-xs text-muted">→</span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* the proof, as one number: issued is not the same set as redeemable */}
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: ine.claim_would_be_wrong ? "color-mix(in srgb, var(--c-crimson) 45%, transparent)" : "color-mix(in srgb, var(--c-teal) 45%, transparent)" }}
      >
        <p className="text-sm font-semibold text-text">
          <span className="font-mono text-offer-blue">{ine.issued_ever} issued</span>{" "}
          ≠{" "}
          <span className="font-mono text-teal">{ine.redeemable_at_cut} redeemable</span>{" "}
          right now — a <span className="text-crimson">{ine.gap}</span> gap.
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Treat &ldquo;issued&rdquo; as &ldquo;redeemable&rdquo; and {ine.gap} rewards get spent that shouldn&apos;t —
          expired, already redeemed, or clawed back. A liability on the books is not a right you can exercise.
        </p>
      </div>

      {/* where every reward ended up */}
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">Lifecycle outcome · {total} rewards</p>
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {Object.entries(d.by_state).filter(([, n]) => n > 0).map(([state, n]) => (
            <div key={state} title={`${state}: ${n}`} style={{ width: `${(n / total) * 100}%`, backgroundColor: STATE_TONE[state] ?? "var(--c-muted)" }} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {Object.entries(d.by_state).filter(([, n]) => n > 0).map(([state, n]) => (
            <span key={state} className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: STATE_TONE[state] ?? "var(--c-muted)" }} />
              {state} {n}
            </span>
          ))}
        </div>
      </div>

      {/* the state machine refusing to confuse the meanings */}
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-crimson">
          {d.summary.redeems_rejected} illegal redemptions rejected — not silently allowed
        </p>
        <div className="scroll-x max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-border/60 bg-base/40 p-2">
          {rejected.slice(0, 10).map((a, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-crimson">✕</span>
              <span className="shrink-0 text-text">{a.reward_id}</span>
              <span className="min-w-0 flex-1 truncate text-muted">{a.reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* the invariant */}
      <div className="flex flex-wrap gap-2">
        {[
          ["no double-redeem", d.proof.no_double_redeem],
          ["every accepted redeem is terminal", d.proof.every_accepted_redeem_is_terminal],
          ["no illegal redeem succeeded", d.proof.no_illegal_redeem_succeeded],
        ].map(([label, ok]) => (
          <span
            key={label as string}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: ok ? "var(--c-teal)" : "var(--c-crimson)", borderColor: ok ? "var(--c-teal)" : "var(--c-crimson)", backgroundColor: `color-mix(in srgb, ${ok ? "var(--c-teal)" : "var(--c-crimson)"} 12%, transparent)` }}
          >
            {ok ? "✓" : "✕"} {label}
          </span>
        ))}
      </div>

      <p className="border-l-2 border-teal/60 pl-3 text-sm font-medium text-text">{d.law}</p>
      <p className="max-w-[72ch] text-xs leading-relaxed text-muted">{d.note}</p>
    </div>
  );
}
