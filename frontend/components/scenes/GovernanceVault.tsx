"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* The Governance Vault — who is allowed to change customer behaviour, and how we
   prove it. A policy version earns trust through a fixed, signed lifecycle. Each
   step is chained to the previous signature, carries the actor and a consent /
   retention / redaction envelope, and is tenant-scoped. Keys rotate mid-lifecycle
   without breaking history. Click a step for its signed record.

   Mirrors the real, tested backend (GET /api/v1/governance-demo) — the guarantees
   below are enforced there, not decoration. */

type Step = {
  stage: string;
  actor: string;
  at: string;
  consent: string;
  retention: string;
  redaction: string;
  keyId: string;
  note: string;
};

const LINEAGE: Step[] = [
  { stage: "draft", actor: "eng:pavan", at: "07-01 09:00", consent: "n/a", retention: "—", redaction: "none", keyId: "k1", note: "A change is proposed. It cannot touch customers yet." },
  { stage: "reviewed", actor: "eng:reviewer", at: "07-01 11:00", consent: "n/a", retention: "—", redaction: "none", keyId: "k1", note: "A second engineer reviews. Can send it back to draft." },
  { stage: "approved", actor: "lead:staff-eng", at: "07-02 10:00", consent: "contract", retention: "395d", redaction: "none", keyId: "k1", note: "A lead approves under a lawful basis and retention window." },
  { stage: "signed", actor: "release:key-k2", at: "07-02 10:05", consent: "contract", retention: "395d", redaction: "pii-masked", keyId: "k2", note: "Signed for release — the key was rotated first; history still verifies." },
  { stage: "shadow", actor: "system:shadow-replay", at: "07-02 12:00", consent: "contract", retention: "395d", redaction: "pii-masked", keyId: "k2", note: "Replayed against history in shadow — no live exposure." },
  { stage: "cohort", actor: "system:5pct-holdout", at: "07-03 09:00", consent: "contract", retention: "395d", redaction: "pii-masked", keyId: "k2", note: "Admitted to a 5% controlled cohort. Rollback still one step away." },
  { stage: "rolled_back", actor: "oncall:eng", at: "07-03 14:00", consent: "contract", retention: "395d", redaction: "pii-masked", keyId: "k2", note: "On-call rolls it back. The lineage records exactly who and when." },
];

const GUARANTEES = [
  "Legal transitions only",
  "Tamper-evident (hash-chained)",
  "Tenant-isolated",
  "Key-rotation-safe",
];

export function GovernanceVault() {
  const [open, setOpen] = useState<number | null>(3); // start on the signed/rotation step

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px]">
        {GUARANTEES.map((g) => (
          <span key={g} className="flex items-center gap-1.5 text-muted">
            <span aria-hidden style={{ color: "var(--c-teal)" }}>✓</span>
            {g}
          </span>
        ))}
      </div>

      <ol className="relative mt-5 space-y-1.5 border-l border-border pl-5">
        {LINEAGE.map((s, i) => {
          const isOpen = open === i;
          const rollback = s.stage === "rolled_back";
          const tone = rollback ? "var(--c-amber)" : "var(--c-teal)";
          return (
            <li key={i} className="relative">
              {/* node on the spine */}
              <span
                aria-hidden
                className="absolute -left-[1.4rem] top-2.5 h-2.5 w-2.5 rounded-full border-2"
                style={{ borderColor: tone, backgroundColor: isOpen ? tone : "var(--c-base)" }}
              />
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-2/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                <span className="w-24 shrink-0 font-mono text-xs font-semibold" style={{ color: tone }}>
                  {s.stage}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-text">{s.actor}</span>
                <span className="shrink-0 font-mono text-[10px] text-muted">key {s.keyId}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden pl-3"
                  >
                    <p className="py-1 text-sm leading-relaxed text-muted">{s.note}</p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 pb-2 font-mono text-[11px]">
                      <dt className="text-muted">at</dt>
                      <dd className="text-text">{s.at}</dd>
                      <dt className="text-muted">consent</dt>
                      <dd className="text-text">{s.consent}</dd>
                      <dt className="text-muted">retention</dt>
                      <dd className="text-text">{s.retention}</dd>
                      <dt className="text-muted">redaction</dt>
                      <dd className="text-text">{s.redaction}</dd>
                      <dt className="text-muted">signed with</dt>
                      <dd className="text-text">{s.keyId} · chained to prev</dd>
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        The key rotates at <span style={{ color: "var(--c-teal)" }}>signed</span> (k1 → k2) and every earlier
        record still verifies. Tamper with any field, replay it into another tenant, or attempt an illegal jump,
        and verification fails — enforced in code at <code>GET /api/v1/governance-demo</code>.
      </p>
    </div>
  );
}
