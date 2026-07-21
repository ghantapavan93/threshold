"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useConsole } from "./console-context";
import { useStageActive } from "./walkthrough";
import { Button, Card, EmptyState, Section } from "./ui/primitives";
import { formatTime } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/scroll";
import { FailClosedLaneMotif } from "./visual/illustrations";
import type { FailClosedProof, Injection } from "@/lib/schemas";

const PIPELINE_STAGES = ["Ingest", "Consent", "Rule Match", "Response"] as const;
const CHECKOUT_STAGES = ["Cart", "Payment", "Confirmation"] as const;

const INJECTION_LABEL: Record<Injection, string> = {
  timeout: "Inject timeout",
  invalid_output: "Inject invalid output",
  stale_identity: "Inject stale identity",
};

function Lane({
  title,
  stages,
  terminalLabel,
  terminalColor,
  green,
  pulseKey,
}: {
  title: string;
  stages: readonly string[];
  terminalLabel: string;
  terminalColor: string;
  green: boolean;
  pulseKey?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className="rounded-md border px-2.5 py-1 font-mono text-xs"
              style={{
                borderColor: green ? "var(--c-teal)" : "var(--c-border-strong)",
                color: green ? "var(--c-teal)" : "var(--c-muted)",
                backgroundColor: green
                  ? "color-mix(in srgb, var(--c-teal) 12%, transparent)"
                  : "transparent",
              }}
            >
              {green ? "✓ " : ""}
              {s}
            </span>
            {i < stages.length - 1 ? (
              <span aria-hidden className="text-muted">
                →
              </span>
            ) : null}
          </div>
        ))}
        <span aria-hidden className="text-muted">
          →
        </span>
        <motion.span
          key={pulseKey ?? terminalLabel}
          initial={{ scale: 0.9, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="rounded-md border px-2.5 py-1 font-mono text-xs font-semibold"
          style={{
            borderColor: terminalColor,
            color: terminalColor,
            backgroundColor: `color-mix(in srgb, ${terminalColor} 14%, transparent)`,
          }}
        >
          {terminalLabel}
        </motion.span>
      </div>
    </div>
  );
}

export function FailClosedProofSection() {
  const { job, appendAuditLine } = useConsole();
  const [active, setActive] = useState<Injection | null>(null);

  const proofs = job?.failclosed_proofs ?? [];
  const available = new Set(proofs.map((p) => p.injection));
  const selectedProof: FailClosedProof | undefined = active
    ? proofs.find((p) => p.injection === active)
    : undefined;

  const inject = (inj: Injection) => {
    setActive(inj);
    const proof = proofs.find((p) => p.injection === inj);
    if (proof) {
      appendAuditLine(
        `FAILCLOSED_PROVEN · ${inj} → ${proof.decision} (${proof.fallback_reason ?? "n/a"}) · checkout_preserved=${proof.checkout_preserved} · ${formatTime(new Date().toISOString())}`,
      );
    }
  };

  // When the walkthrough lands here, auto-cycle every injected failure: each one
  // drops the decision lane to No Offer Rendered in turn while the checkout stays
  // green — so "every failure is contained" plays out, not just one on a click.
  // Audit lines append once per injection per session (deduped) so the log builds
  // without spamming on repeat visits.
  const { visits } = useStageActive("fail-closed-proof");
  const logged = useRef<Set<Injection>>(new Set());
  useEffect(() => {
    if (visits === 0 || proofs.length === 0) return;
    const order = proofs.map((p) => p.injection);
    if (prefersReducedMotion()) {
      setActive(order[order.length - 1] ?? null);
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    setActive(null);
    order.forEach((inj, i) => {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setActive(inj);
          if (!logged.current.has(inj)) {
            const proof = proofs.find((p) => p.injection === inj);
            if (proof) {
              appendAuditLine(
                `FAILCLOSED_PROVEN · ${inj} → ${proof.decision} (${proof.fallback_reason ?? "n/a"}) · checkout_preserved=${proof.checkout_preserved} · ${formatTime(new Date().toISOString())}`,
              );
              logged.current.add(inj);
            }
          }
        }, 400 + i * 1150),
      );
    });
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
    // Replay the sequence each time the spotlight lands (visits changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits]);

  return (
    <Section
      id="fail-closed-proof"
      index={5}
      title="Fail-Closed Proof"
      subtitle="Inject a failure into the decision pipeline. It drops to No Offer Rendered while the parallel checkout timeline stays green and untouched — the placement never blocks the transaction."
    >
      {!job ? (
        <EmptyState
          icon={<FailClosedLaneMotif className="w-80 max-w-full" />}
          title="Run a replay to generate fail-closed proofs"
          hint="Injections configured in the replay above produce the proofs shown here — the decision lane drops to No Offer Rendered while the checkout lane stays green."
        />
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {(["timeout", "invalid_output", "stale_identity"] as Injection[]).map(
                (inj) => {
                  const has = available.has(inj);
                  return (
                    <Button
                      key={inj}
                      size="sm"
                      variant={active === inj ? "danger" : "subtle"}
                      onClick={() => inject(inj)}
                      disabled={!has}
                      title={
                        has
                          ? INJECTION_LABEL[inj]
                          : `${inj} was not injected in this run`
                      }
                    >
                      {INJECTION_LABEL[inj]}
                    </Button>
                  );
                },
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card
              className="p-4"
              style={{
                borderColor: selectedProof ? "var(--c-crimson)" : undefined,
              }}
            >
              <Lane
                title="Decision pipeline"
                stages={PIPELINE_STAGES}
                green={!selectedProof}
                pulseKey={active ?? "idle"}
                terminalLabel={
                  selectedProof ? "No Offer Rendered" : "Awaiting injection"
                }
                terminalColor={
                  selectedProof ? "var(--c-crimson)" : "var(--c-muted)"
                }
              />
              {selectedProof ? (
                <dl className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs">
                  <div>
                    <dt className="text-muted">fallback_reason</dt>
                    <dd className="text-crimson">
                      {selectedProof.fallback_reason ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">offer_state_created</dt>
                    <dd className="text-text">
                      {String(selectedProof.offer_state_created)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">proof_valid</dt>
                    <dd
                      style={{
                        color: selectedProof.proof_valid
                          ? "var(--c-teal)"
                          : "var(--c-crimson)",
                      }}
                    >
                      {selectedProof.proof_valid ? "✓ valid" : "✕ invalid"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">checkout_preserved</dt>
                    <dd className="text-teal">
                      {String(selectedProof.checkout_preserved)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-xs text-muted">
                  Select an injection to see the lane fail closed.
                </p>
              )}
            </Card>

            <Card className="p-4" style={{ borderColor: "var(--c-teal)" }}>
              <Lane
                title="Checkout timeline (must stay green)"
                stages={CHECKOUT_STAGES}
                green
                terminalLabel="Confirmation ✓"
                terminalColor="var(--c-teal)"
              />
              <p className="mt-4 text-xs text-muted">
                The checkout completes regardless of the placement outcome.
                {selectedProof
                  ? " Preserved by this proof: " +
                    (selectedProof.checkout_preserved ? "yes." : "no.")
                  : ""}
              </p>
            </Card>
          </div>

          <ProofAudit />
        </div>
      )}
    </Section>
  );
}

function ProofAudit() {
  const { auditLines } = useConsole();
  return (
    <Card className="p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Appended audit lines
      </p>
      <div
        aria-live="polite"
        aria-label="Fail-closed proof audit log"
        className="scroll-x max-h-40 overflow-y-auto rounded-md border border-border bg-base/50 p-2 font-mono text-[11px] leading-relaxed text-muted"
      >
        {auditLines.length === 0 ? (
          <p className="text-muted">No proofs recorded yet this session.</p>
        ) : (
          auditLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              <span className="text-teal">▸</span> {line}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
