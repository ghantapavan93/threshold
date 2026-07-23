"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logAction } from "@/lib/story-log";

/* The failure "boss battle" — no points, no health bars, just an adversarial
   challenge: break the optional experience without breaking the transaction. The
   reviewer fires an attack; a crimson fault wave races at the checkout, Threshold
   closes the affected path (No Offer Rendered), and the fault stops at a visible
   boundary while the teal checkout completes and the ticket issues.

   It proves more than a static panel: "here is the attack, watch exactly where it
   stops." Deterministic and honest — this is the same fail-closed behaviour the
   real engine records, dramatised so you can trigger it yourself. */

const ATTACKS = [
  { key: "timeout", label: "Inject timeout", desc: "the offer service stops responding" },
  { key: "invalid_output", label: "Corrupt output", desc: "the offer returns malformed data" },
  { key: "stale_identity", label: "Stale identity", desc: "the identity signal is past its freshness bound" },
] as const;

type AttackKey = (typeof ATTACKS)[number]["key"];

export function FailureBattle() {
  const [attack, setAttack] = useState<AttackKey | null>(null);
  const active = ATTACKS.find((a) => a.key === attack);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap gap-2">
        {ATTACKS.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => { logAction("injected_failure"); setAttack(a.key); }}
            className="press rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
            style={
              attack === a.key
                ? { borderColor: "var(--c-crimson)", color: "var(--c-crimson)", backgroundColor: "color-mix(in srgb, var(--c-crimson) 12%, transparent)" }
                : { borderColor: "var(--c-border)", color: "var(--c-muted)" }
            }
          >
            ⚔ {a.label}
          </button>
        ))}
        {attack && (
          <button type="button" onClick={() => setAttack(null)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-text">
            reset
          </button>
        )}
      </div>

      <p className="mt-3 min-h-[1.25rem] text-xs text-muted">
        {active ? <>Attack: <span style={{ color: "var(--c-crimson)" }}>{active.desc}</span>.</> : "Fire an attack at the optional experience. The transaction must survive."}
      </p>

      {/* two lanes */}
      <div className="mt-4 space-y-3">
        <Lane
          title="Decision lane · optional experience"
          tone="var(--c-crimson)"
          steps={["Eligibility", "Offer", "Render"]}
          faulted={!!attack}
          contained
          verdict={attack ? "No Offer Rendered" : "Offer eligible"}
        />
        <Lane
          title="Checkout lane · the transaction"
          tone="var(--c-teal)"
          steps={["Cart", "Payment", "Confirmation"]}
          faulted={false}
          verdict={attack ? "Ticket issued — unaffected" : "Ready"}
        />
      </div>

      <AnimatePresence>
        {attack && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl border border-teal/40 bg-teal/10 p-3 text-center text-sm"
            style={{ color: "var(--c-teal)" }}
          >
            The fault stopped at the boundary. The placement fell to <strong>No Offer Rendered</strong>;
            the checkout never blocked. Fail-closed, by construction.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Lane({
  title,
  tone,
  steps,
  faulted,
  contained,
  verdict,
}: {
  title: string;
  tone: string;
  steps: string[];
  faulted: boolean;
  contained?: boolean;
  verdict: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-base/50 p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{title}</span>
        <span className="font-mono text-xs font-semibold" style={{ color: faulted ? "var(--c-crimson)" : tone }}>
          {verdict}
        </span>
      </div>
      <div className="relative mt-3 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className="flex-1 rounded-md border px-2 py-1.5 text-center text-xs transition-colors"
              style={{
                borderColor: faulted && contained ? "color-mix(in srgb, var(--c-crimson) 45%, transparent)" : `color-mix(in srgb, ${tone} 45%, transparent)`,
                color: faulted && contained ? "var(--c-crimson)" : "var(--c-text)",
                backgroundColor: faulted && contained ? "color-mix(in srgb, var(--c-crimson) 8%, transparent)" : `color-mix(in srgb, ${tone} 8%, transparent)`,
              }}
            >
              {s}
            </div>
            {i < steps.length - 1 && <span aria-hidden style={{ color: tone }}>→</span>}
          </div>
        ))}
        {/* the fault wave + boundary, only on the faulted lane */}
        {faulted && contained && (
          <motion.div
            initial={{ left: "-6%", opacity: 0 }}
            animate={{ left: "62%", opacity: [0, 1, 1, 0.2] }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, var(--c-crimson), transparent 70%)" }}
          />
        )}
        {faulted && contained && (
          <div className="pointer-events-none absolute inset-y-0" style={{ left: "66%" }}>
            <div className="h-full w-0.5" style={{ backgroundColor: "var(--c-teal)", boxShadow: "0 0 10px var(--c-teal)" }} />
          </div>
        )}
      </div>
    </div>
  );
}
