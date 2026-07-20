"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* Branded pre-load intro for the Console.

   Tells Threshold's whole idea in ~3 seconds before the page arrives: a
   checkout-policy change enters, 200 seeded sessions replay, 21 are caught
   silently widening, the verdict lands BLOCKED — before a single customer saw
   it. Then it dissolves into the console.

   Every number is real, taken from the recorded V17 → V18 run (the same figures
   the live replay produces). Shown once per browser session, skippable by any
   interaction, and never shown at all under reduced motion. A hard timer always
   removes it, so the page can never be left covered. */

const SEEN_KEY = "threshold-intro-seen-v1";
const EASE = [0.16, 1, 0.3, 1] as const;

function useCountUp(target: number, durationMs: number, start: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, start]);
  return n;
}

function Stat({
  value,
  label,
  tone,
  delay,
  run,
}: {
  value: number;
  label: string;
  tone: string;
  delay: number;
  run: boolean;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(() => setArmed(true), delay);
    return () => window.clearTimeout(id);
  }, [run, delay]);
  const n = useCountUp(value, 800, armed);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={armed ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE }}
      className="text-center"
    >
      <p className="font-mono text-4xl font-bold tabular-nums sm:text-5xl" style={{ color: tone }}>
        {n}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
    </motion.div>
  );
}

export function Intro() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [run, setRun] = useState(false); // gates the counters/stamp
  const dismissed = useRef(false);
  const skipAllowedAt = useRef(0); // grace period so a stray early scroll can't kill it

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    setShow(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode — fine, it just replays next load */
    }
  };

  // A skip that respects the grace period, so a stray early event (or a click
  // landing as the overlay appears) can't cut the intro off before it starts.
  const trySkip = () => {
    if (performance.now() < skipAllowedAt.current) return;
    dismiss();
  };

  useEffect(() => {
    // Decide on the client only, so SSR/first paint is the real page (no
    // hydration mismatch, and the page is never blocked if JS never runs).
    if (reduced) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen) return;
    setShow(true);
    skipAllowedAt.current = performance.now() + 600;
    const raf = requestAnimationFrame(() => setRun(true));
    // Hard safety net: whatever happens, the overlay is gone by 3.6s.
    const kill = window.setTimeout(dismiss, 3600);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(kill);
    };
  }, [reduced]);

  // Any interaction skips straight to the page.
  useEffect(() => {
    if (!show) return;
    window.addEventListener("keydown", trySkip);
    window.addEventListener("wheel", trySkip, { passive: true });
    window.addEventListener("touchstart", trySkip, { passive: true });
    return () => {
      window.removeEventListener("keydown", trySkip);
      window.removeEventListener("wheel", trySkip);
      window.removeEventListener("touchstart", trySkip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="intro"
          onClick={trySkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-base px-6"
          role="presentation"
          aria-hidden
        >
          <div className="aurora-threshold" />

          <div className="relative flex flex-col items-center">
            {/* wordmark — masked rise */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: run ? "0%" : "110%" }}
                transition={{ duration: 0.8, ease: EASE }}
                className="font-display text-5xl font-bold tracking-tightest text-text sm:text-7xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                THRESHOLD
              </motion.h1>
            </div>

            {/* line 1 */}
            <motion.p
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={run ? { opacity: 1, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
              className="mt-4 max-w-md text-center text-sm text-muted sm:text-base"
            >
              A checkout-policy change enters.
            </motion.p>

            {/* the three beats, counting up */}
            <div className="mt-9 grid grid-cols-3 items-start gap-6 sm:gap-12">
              <Stat value={200} label="sessions replayed" tone="var(--c-text)" delay={1100} run={run} />
              <Stat value={21} label="silently widened" tone="var(--c-crimson)" delay={1550} run={run} />
              <Stat value={1} label="caught pre-flight" tone="var(--c-teal)" delay={2000} run={run} />
            </div>

            {/* verdict stamp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={run ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 320, damping: 18, delay: 2.5 }}
              className="mt-9 rounded-xl border px-5 py-2.5 font-mono text-lg font-bold tracking-wide"
              style={{
                color: "var(--c-crimson)",
                borderColor: "var(--c-crimson)",
                backgroundColor: "color-mix(in srgb, var(--c-crimson) 12%, transparent)",
              }}
            >
              ⛔ BLOCKED
            </motion.div>

            {/* payoff line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={run ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease: EASE, delay: 2.85 }}
              className="mt-4 text-center text-xs text-muted sm:text-sm"
            >
              — before a single customer saw it.
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={run ? { opacity: 0.6 } : {}}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="absolute bottom-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted"
          >
            click to skip
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
