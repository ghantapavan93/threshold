"use client";

import { useSyncExternalStore } from "react";

/* A tiny, dependency-free log of what the reviewer actually DID as they moved
   through the experience — so the Builder Evidence Receipt reflects their real
   journey, not a canned skills list. Module-scoped and idempotent: each action
   is recorded once, in the order it first happened. */

export type StoryAction =
  | "approved_without_inspection"
  | "inspect_first"
  | "rewound"
  | "inspected_v17_v18"
  | "opened_affected_session"
  | "watched_widening"
  | "injected_failure"
  | "traced_the_machine"
  | "reviewed_ai_evidence"
  | "ran_incident_postmortem"
  | "reviewed_governance";

export const ACTION_LABELS: Record<StoryAction, string> = {
  approved_without_inspection: "Approved the change without inspecting it",
  inspect_first: "Chose to inspect before exposure",
  rewound: "Rewound the transaction to look closer",
  inspected_v17_v18: "Compared V17 and V18 across the boundary",
  opened_affected_session: "Opened an affected session's evidence",
  watched_widening: "Watched the missing-attribute band cross the boundary",
  injected_failure: "Injected a failure at the optional experience",
  traced_the_machine: "Traced one transaction across four lenses",
  reviewed_ai_evidence: "Saw which AI proposals evidence rejected",
  ran_incident_postmortem: "Worked an incident to an after-action report",
  reviewed_governance: "Inspected the signed policy-version lineage",
};

let actions: readonly StoryAction[] = [];
const listeners = new Set<() => void>();

export function logAction(key: StoryAction): void {
  if (actions.includes(key)) return;
  actions = [...actions, key];
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStoryLog(): readonly StoryAction[] {
  return useSyncExternalStore(
    subscribe,
    () => actions,
    () => actions, // stable server snapshot (empty)
  );
}
