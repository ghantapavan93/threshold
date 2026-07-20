"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useSimulation } from "@/lib/hooks";
import type { FailClosedProof, SimulationResult } from "@/lib/schemas";
import { simulateFixture } from "@/components/moment-forge/fixtures";
import { Pill, RoktEcho, Scene, SceneHeadline, EASE } from "./stage";

/* 03 · The Failure — the optional experience fails; the purchase does not. A
   real fault is injected into the offer path; the Threshold engine proves the
   checkout is preserved and no offer state was created. Live via /simulations
   (failclosed_proofs), recorded fixture offline. */

const INJECTION_LABEL: Record<string, string> = {
  timeout: "Placement timeout",
  invalid_output: "Invalid offer payload",
  stale_identity: "Stale identity token",
};

function ConfirmationEnvironment() {
  return (
    <div className="absolute inset-0 bg-[#060810]">
      <div
        className="absolute right-[-10%] top-[10%] h-[60%] w-[55%] rounded-[45%] opacity-30 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--c-crimson) 18%, transparent), transparent 70%)" }}
      />
      <div
        className="absolute left-[-8%] bottom-[6%] h-[45%] w-[45%] rounded-[45%] opacity-30 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--c-teal) 16%, transparent), transparent 70%)" }}
      />
    </div>
  );
}

function ProofRow({ proof }: { proof: FailClosedProof }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-2/30 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-crimson">
          {INJECTION_LABEL[proof.injection] ?? proof.injection}
        </span>
        <span className="font-mono text-[10px] text-teal">{proof.proof_valid ? "▛ proven" : "—"}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
        <span className="text-muted">decision: <span className="text-text">{proof.decision}</span></span>
        <span className="text-muted">checkout: <span className="text-teal">{proof.checkout_preserved ? "preserved" : "AT RISK"}</span></span>
        <span className="text-muted">offer state: <span className={proof.offer_state_created ? "text-crimson" : "text-teal"}>{proof.offer_state_created ? "created" : "none"}</span></span>
        <span className="text-muted">fallback: <span className="text-text">{proof.fallback_reason ?? "n/a"}</span></span>
      </div>
    </div>
  );
}

type Status = "idle" | "loading" | "ok" | "error";

export function ChapterFailure() {
  const reduced = useReducedMotion();
  const sim = useSimulation();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [usedFixture, setUsedFixture] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);

  const proofs = result?.failclosed_proofs ?? [];
  const allPreserved = proofs.length > 0 && proofs.every((p) => p.checkout_preserved && p.proof_valid);

  const run = async () => {
    setStatus("loading");
    setErr(null);
    const loadFixture = async () => {
      setResult(await simulateFixture("trap"));
      setUsedFixture(true);
      setStatus("ok");
    };
    try {
      const d = await sim.mutateAsync({
        base_version: "V17",
        proposed: { from_version: "V18" },
        session_seed: 42,
        session_count: 200,
        injections: ["timeout", "invalid_output", "stale_identity"],
      });
      setResult(d);
      setUsedFixture(false);
      setStatus("ok");
    } catch (e) {
      const ae = e instanceof ApiError ? e : new ApiError({ kind: "network", message: String(e) });
      if (ae.isUnreachable) {
        try {
          await loadFixture();
        } catch (e2) {
          setErr(e2 instanceof ApiError ? e2 : ae);
          setStatus("error");
        }
      } else {
        setErr(ae);
        setStatus("error");
      }
    }
  };

  return (
    <Scene id="kc-failure" n="03" label="The Failure" accent="crimson" clip="kc-failure" environment={<ConfirmationEnvironment />}>
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <Pill accent="crimson">Fail closed · proven live</Pill>
          <SceneHeadline className="mt-6">
            The optional experience failed. The customer&apos;s purchase did not.
          </SceneHeadline>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">
            Inject a real fault into the offer path — a timeout, a malformed payload, a stale token. Watch the
            offer resolve to <span className="text-text">No Offer Rendered</span> while the confirmation stays
            alive. The engine keeps the proof.
          </p>
          <div className="mt-7">
            <RoktEcho
              accent="crimson"
              quote="Get out of the customer's way and let them complete the purchase."
              source="Rokt · Claire Southey, Chief AI Officer, 2026 · public"
            />
          </div>
          {status !== "ok" ? (
            <button
              type="button"
              onClick={run}
              disabled={status === "loading"}
              className="press mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-crimson/50 bg-crimson/10 px-6 py-3 text-sm font-semibold text-crimson focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson disabled:opacity-60"
            >
              {status === "loading" ? "injecting faults…" : "⚡ Inject the faults"}
            </button>
          ) : null}
          {status === "error" && err ? (
            <p role="alert" className="mt-4 font-mono text-[12px] text-crimson">✕ {err.message}</p>
          ) : null}
        </div>

        {/* the confirmation + offer-path proof card */}
        <div className="glass rounded-2xl border border-border/60 p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal">Aurora Tickets</p>
            <span className="rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 font-mono text-[10px] text-teal">confirmed · stable</span>
          </div>
          <p className="mt-3 text-sm text-muted">Order AUR-10231 — the native confirmation never flinches, whatever the offer path does.</p>

          <div aria-live="polite" className="mt-4 min-h-[8rem]">
            {status === "idle" ? (
              <p className="font-mono text-xs text-muted">The offer channel sits beside the confirmation. Inject a fault and watch only the offer fall away.</p>
            ) : null}
            {status === "loading" ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-10 w-full animate-pulse-soft rounded bg-surface-2/60" />)}</div>
            ) : null}
            <AnimatePresence>
              {status === "ok" ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="space-y-2"
                >
                  <p className="font-mono text-[11px] text-teal">{usedFixture ? "recorded" : "live"} engine output · {proofs.length} faults injected</p>
                  {proofs.map((p) => <ProofRow key={p.injection} proof={p} />)}
                  <div className={`rounded-lg border p-3 ${allPreserved ? "border-teal/40 bg-teal/10" : "border-crimson/40 bg-crimson/10"}`}>
                    <p className={`font-mono text-sm font-semibold ${allPreserved ? "text-teal" : "text-crimson"}`}>
                      {allPreserved ? "▛ Every fault failed closed. Checkout preserved on all paths." : "✕ A path did not fail closed."}
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Scene>
  );
}
