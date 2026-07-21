"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { prefersReducedMotion, scrollToId } from "@/lib/scroll";
import type { ReplayJob } from "@/lib/schemas";

/* The guided walkthrough. A single run produces one real backend job; this then
   WALKS the viewer down the pipeline one stage at a time — scrolling to each
   section, lighting it up in the PipelineRail, and captioning, in plain language,
   exactly what the backend just did and what the screen is now showing. It replaces
   the old behaviour where a run jumped straight to the verdict. */

export type Stage = {
  id: string; // the section's DOM id to scroll to
  short: string; // one or two words for the rail node
  title: string; // plain title shown in the caption bar
  caption: (job: ReplayJob | null) => string; // plain, concrete, no poetry
};

function n(job: ReplayJob | null, path: (j: ReplayJob) => number | undefined, fallback = 0): number {
  if (!job) return fallback;
  const v = path(job);
  return typeof v === "number" ? v : fallback;
}

/** Decisions that changed = the three non-"unchanged" outcome buckets. */
function changedCount(job: ReplayJob | null): number {
  const s = job?.replay_summary;
  if (!s) return 0;
  return (s.nothing_to_offer ?? 0) + (s.offer_to_nothing ?? 0) + (s.constraint_violation ?? 0);
}

function verdictGloss(job: ReplayJob | null): string {
  const v = job?.verdict?.value;
  if (v === "BLOCKED") return "the change is stopped before a single customer sees it.";
  if (v === "ELIGIBLE_FOR_HOLDOUT")
    return "structurally safe — cleared only for a controlled 5% holdout, never “safe to launch.”";
  if (v === "INSUFFICIENT_EVIDENCE") return "not enough changed to judge — nothing to send to a holdout.";
  return "run a scenario to get a verdict.";
}

export const STAGES: Stage[] = [
  {
    id: "scenario-library",
    short: "Change",
    title: "1 · Pick a change",
    caption: () =>
      "You're comparing policy V17 with a proposed edit. Everything below runs on the real backend — no mock data.",
  },
  {
    id: "policy-diff",
    short: "Diff",
    title: "2 · See what changed",
    caption: (j) =>
      `The backend diffed the two versions: ${n(j, (x) => x.diff?.summary?.modified, 0)} field(s) changed. One is a single operator flip — the kind that sails through review.`,
  },
  {
    id: "constraint-heatmap",
    short: "Constraints",
    title: "3 · Check the hard rules",
    caption: () =>
      "Each change is tested against the hard constraints — latency, consent, brand-safety — and the star: how a missing value is treated.",
  },
  {
    id: "policy-diff-replay",
    short: "Replay",
    title: "4 · Replay on real sessions",
    caption: (j) =>
      `The backend replayed the change over ${n(j, (x) => x.session_count, 200)} event-time sessions. ${changedCount(j)} decisions changed — each one a real customer who'd now get a different outcome.`,
  },
  {
    id: "fail-closed-proof",
    short: "Fail-closed",
    title: "5 · Prove it fails closed",
    caption: () =>
      "We inject failures — a timeout, a malformed response. Every one resolves to No Offer Rendered. The customer's checkout is never touched.",
  },
  {
    id: "conversion-integrity",
    short: "Conversions",
    title: "6 · Count conversions once",
    caption: () =>
      "A conversion is delivered twice. It's recorded once — deduped on (type, reference). No double-counting, ever.",
  },
  {
    id: "fanout-outbox",
    short: "Outbox",
    title: "7 · Fan out safely",
    caption: () =>
      "The verdict and its side-effects commit together, then publish — at-least-once delivery, effectively-once business state.",
  },
  {
    id: "release-verdict",
    short: "Verdict",
    title: "8 · The verdict",
    caption: (j) => `Verdict: ${j?.verdict?.value ?? "—"}. In plain terms: ${verdictGloss(j)}`,
  },
  {
    id: "evidence",
    short: "Evidence",
    title: "9 · Inspect the evidence",
    caption: () =>
      "Every step above is written to a tamper-evident log. Try dropping the last record — verification fails and names the gap.",
  },
  {
    id: "byod",
    short: "Your data",
    title: "10 · Try your own data",
    caption: () =>
      "This is where it gets real: paste your own sessions and watch the exact same gate run on them — across every edge case, no code.",
  },
];

type WalkContext = {
  stages: Stage[];
  activeIndex: number; // -1 = not started
  caption: string;
  walking: boolean;
  /** Run the full stage-by-stage tour off a completed job. Cancellable. */
  walk: (job: ReplayJob | null) => Promise<void>;
  /** Jump to one stage by id (manual navigation from the rail). */
  goTo: (id: string) => void;
  /** Stop an in-progress tour where it is. */
  stop: () => void;
};

const Ctx = createContext<WalkContext | null>(null);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [caption, setCaption] = useState("");
  const [walking, setWalking] = useState(false);
  const jobRef = useRef<ReplayJob | null>(null);
  const token = useRef(0); // bump to cancel any in-flight walk

  const walk = useCallback(async (job: ReplayJob | null) => {
    jobRef.current = job;
    const mine = ++token.current;
    const reduced = prefersReducedMotion();

    // Reduced motion: respect the opt-out. Land on the verdict, no auto-scroll tour.
    if (reduced) {
      const vi = STAGES.findIndex((s) => s.id === "release-verdict");
      const vs = STAGES[vi];
      if (vs) {
        setActiveIndex(vi);
        setCaption(vs.caption(job));
        scrollToId(vs.id);
      }
      setWalking(false);
      return;
    }

    setWalking(true);
    for (let i = 0; i < STAGES.length; i++) {
      if (token.current !== mine) return; // superseded by a newer run / stop
      const st = STAGES[i];
      if (!st) break;
      setActiveIndex(i);
      setCaption(st.caption(job));
      scrollToId(st.id);
      await wait(i === 0 ? 1200 : 2000);
    }
    if (token.current === mine) setWalking(false);
  }, []);

  const goTo = useCallback((id: string) => {
    token.current++; // cancel any running tour
    setWalking(false);
    const i = STAGES.findIndex((s) => s.id === id);
    const st = STAGES[i];
    if (!st) return;
    setActiveIndex(i);
    setCaption(st.caption(jobRef.current));
    scrollToId(id);
  }, []);

  const stop = useCallback(() => {
    token.current++;
    setWalking(false);
  }, []);

  return (
    <Ctx.Provider value={{ stages: STAGES, activeIndex, caption, walking, walk, goTo, stop }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWalkthrough(): WalkContext {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWalkthrough must be used within WalkthroughProvider");
  return c;
}
