"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* The playable cold-open — a cinematic layer ABOVE the console, not a game skin.
   The reviewer confirms a real-looking checkout, is told a policy change is
   waiting behind the moment, and CHOOSES: approve it, or inspect it first.

   Approve, and the purchase confirms — but behind it 200 replayed sessions appear
   and 21 quietly turn crimson: "it compiled, it passed review, it still changed
   21 decisions." They rewind and inspect instead, and it dissolves into the real
   Threshold console. Their first click produces a consequence — that is the whole
   point: agency, not narration.

   Every number is real (the recorded V17 -> V18 run: 200 sessions, 21 silently
   widened, verdict BLOCKED). Shown once per browser session, always skippable,
   and never shown at all under reduced motion (the console renders immediately).

   Colour grammar, shared with the rest of the site:
     teal    = proven / safe        crimson = silently widened / corrupted
     amber   = unresolved evidence   blue    = customer value / opportunity  */

const SEEN_KEY = "threshold-coldopen-v1";
const EASE = [0.16, 1, 0.3, 1] as const;

const TOTAL = 200;
// The 21 sessions the V18 change silently widens — a fixed, spread-out set so the
// fallout looks scattered through the crowd rather than clustered. Real count (21),
// illustrative positions.
const WIDENED = new Set([
  3, 7, 17, 24, 38, 52, 61, 79, 88, 96, 103, 112, 127, 134, 148, 155, 169, 176, 182, 190, 197,
]);

type Stage = "checkout" | "confirming" | "decide" | "fallout" | "leaving";

export function ColdOpen() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState<Stage>("checkout");
  const [litCount, setLitCount] = useState(0); // how many crimson dots have flipped
  const dismissed = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    clearTimers();
    setStage("leaving");
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode — fine, it just replays next load */
    }
    window.setTimeout(() => setShow(false), 620);
  }, []);

  // Decide on the client only, so SSR/first paint is the real page (no hydration
  // mismatch, and the page is never blocked if JS never runs).
  useEffect(() => {
    if (reduced) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (!seen) setShow(true);
  }, [reduced]);

  // Escape always skips.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, dismiss]);

  useEffect(() => () => clearTimers(), []);

  const confirm = () => {
    setStage("confirming");
    timers.current.push(window.setTimeout(() => setStage("decide"), 900));
  };

  const approve = () => {
    setStage("fallout");
    // Flip the 21 widened sessions crimson in a staggered wave.
    for (let k = 1; k <= WIDENED.size; k++) {
      timers.current.push(window.setTimeout(() => setLitCount(k), 700 + k * 90));
    }
  };

  if (!show) return null;

  const litWidened = new Set(Array.from(WIDENED).slice(0, litCount));

  return (
    <AnimatePresence>
      <motion.div
          key="coldopen"
          initial={{ opacity: 1 }}
          animate={{ opacity: stage === "leaving" ? 0 : 1, filter: stage === "leaving" ? "blur(10px)" : "blur(0px)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-base px-6"
          role="dialog"
          aria-modal="true"
          aria-label="Threshold — a checkout policy change enters"
        >
          <div className="aurora-threshold" aria-hidden />

          {/* The session field lives behind everything; it only becomes visible in
              the fallout, when the consequence of approving lands. */}
          <SessionField active={stage === "fallout"} lit={litWidened} />

          <div className="relative flex w-full max-w-md flex-col items-center">
            {/* ── Checkout card ─────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {(stage === "checkout" || stage === "confirming" || stage === "decide") && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="glass w-full rounded-2xl p-6 text-left"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                    Aurora Tickets · Checkout
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text">Dune: Part Three</p>
                      <p className="text-xs text-muted">2 × premium · 7:40 PM</p>
                    </div>
                    <p className="font-mono text-lg font-semibold text-text">$37.00</p>
                  </div>

                  <div className="mt-5 min-h-[44px]">
                    {stage === "checkout" && (
                      <button
                        type="button"
                        autoFocus
                        onClick={confirm}
                        className="press w-full rounded-lg py-2.5 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        style={{ backgroundColor: "var(--c-offer-blue)", color: "#04110d" }}
                      >
                        Confirm purchase
                      </button>
                    )}
                    {stage === "confirming" && (
                      <div className="flex items-center justify-center gap-2 py-2.5 text-sm text-muted">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted/40 border-t-teal" />
                        Confirming…
                      </div>
                    )}
                    {stage === "decide" && (
                      <div className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium" style={{ color: "var(--c-teal)" }}>
                        <span aria-hidden>✓</span> Payment authorised
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── The decision ──────────────────────────────────────────────── */}
            <AnimatePresence>
              {stage === "decide" && (
                <motion.div
                  key="decide"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
                  className="mt-6 flex flex-col items-center text-center"
                >
                  <p className="max-w-sm text-sm text-text sm:text-base">
                    One policy change is waiting behind this moment.
                  </p>
                  <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={approve}
                      className="press rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      style={{ borderColor: "var(--c-border)", color: "var(--c-muted)" }}
                    >
                      Approve it
                    </button>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="press rounded-lg px-4 py-2.5 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
                    >
                      Inspect before exposure
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── The fallout of approving ──────────────────────────────────── */}
            <AnimatePresence>
              {stage === "fallout" && (
                <motion.div
                  key="fallout"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className="rounded-xl border px-5 py-2.5 font-mono text-sm font-bold tracking-wide"
                    style={{
                      color: "var(--c-teal)",
                      borderColor: "var(--c-teal)",
                      backgroundColor: "color-mix(in srgb, var(--c-teal) 12%, transparent)",
                    }}
                  >
                    ✓ Purchase confirmed
                  </div>

                  <p className="mt-6 font-mono text-4xl font-bold tabular-nums sm:text-5xl" style={{ color: "var(--c-crimson)" }}>
                    {litCount}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
                    of {TOTAL} sessions silently widened
                  </p>

                  <p className="mt-6 max-w-sm text-sm text-text sm:text-base">
                    It compiled. It passed review. It still changed{" "}
                    <span style={{ color: "var(--c-crimson)" }}>{litCount} decisions</span>.
                  </p>

                  <button
                    type="button"
                    onClick={dismiss}
                    className="press mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-glow-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    style={{ backgroundColor: "var(--c-teal)", color: "#04110d" }}
                  >
                    ↺ Rewind — inspect it first
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Always-available skip. */}
          <button
            type="button"
            onClick={dismiss}
            className="absolute bottom-6 right-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            Skip intro →
          </button>
      </motion.div>
    </AnimatePresence>
  );
}

/* The crowd of replayed sessions. 200 dots on a quiet grid; the widened ones flip
   crimson one by one during the fallout. Decorative, aria-hidden, and it only
   carries opacity once the consequence is being shown. */
function SessionField({ active, lit }: { active: boolean; lit: Set<number> }) {
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ opacity: active ? 0.5 : 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))", width: "min(88vw, 640px)" }}
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const on = lit.has(i);
          return (
            <span
              key={i}
              className="aspect-square rounded-[2px] transition-colors duration-300"
              style={{
                backgroundColor: on
                  ? "var(--c-crimson)"
                  : "color-mix(in srgb, var(--c-teal) 22%, transparent)",
                boxShadow: on ? "0 0 8px -1px var(--c-crimson)" : "none",
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
