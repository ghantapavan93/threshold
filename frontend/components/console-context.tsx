"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MERCHANT_ID } from "@/lib/api";
import type { AuditRecord, Evaluation, ReplayJob } from "@/lib/schemas";

/** Merchant is fixed to the frozen demo tenant (Aurora Tickets). */
export const MERCHANT_NAME = "Aurora Tickets";

/** What the Evidence drawer is currently showing. */
export type EvidenceTarget =
  | { type: "evaluation"; evaluation: Evaluation }
  | { type: "audit"; record: AuditRecord }
  | null;

type ConsoleContextValue = {
  merchantId: string;
  merchantName: string;

  baseVersion: string | null;
  proposedVersion: string | null;
  setBaseVersion: (v: string) => void;
  setProposedVersion: (v: string) => void;

  /** The current completed replay job, if any. Set by the Replay section. */
  job: ReplayJob | null;
  jobRequestId: string | null;
  setJob: (job: ReplayJob | null, requestId: string | null) => void;

  /** Session selected in the decision-diff timeline → right drawer. */
  selectedEvaluation: Evaluation | null;
  selectEvaluation: (evaluation: Evaluation | null) => void;

  /** Evidence drawer (section 8): any decision or audit row. */
  evidence: EvidenceTarget;
  openEvidence: (target: EvidenceTarget) => void;
  closeEvidence: () => void;

  /** Fail-closed proofs may be produced by a run; appended audit lines shown. */
  auditLines: string[];
  appendAuditLine: (line: string) => void;
};

const ConsoleContext = createContext<ConsoleContextValue | null>(null);

export function ConsoleProvider({
  children,
  initialBase = "V17",
  initialProposed = "V18",
}: {
  children: ReactNode;
  initialBase?: string;
  initialProposed?: string;
}) {
  const [baseVersion, setBaseVersion] = useState<string | null>(initialBase);
  const [proposedVersion, setProposedVersion] = useState<string | null>(
    initialProposed,
  );
  const [job, setJobState] = useState<ReplayJob | null>(null);
  const [jobRequestId, setJobRequestId] = useState<string | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(
    null,
  );
  const [evidence, setEvidence] = useState<EvidenceTarget>(null);
  const [auditLines, setAuditLines] = useState<string[]>([]);

  const setJob = useCallback((next: ReplayJob | null, requestId: string | null) => {
    setJobState(next);
    setJobRequestId(requestId);
  }, []);

  const appendAuditLine = useCallback((line: string) => {
    setAuditLines((prev) => [...prev, line]);
  }, []);

  const value = useMemo<ConsoleContextValue>(
    () => ({
      merchantId: MERCHANT_ID,
      merchantName: MERCHANT_NAME,
      baseVersion,
      proposedVersion,
      setBaseVersion,
      setProposedVersion,
      job,
      jobRequestId,
      setJob,
      selectedEvaluation,
      selectEvaluation: setSelectedEvaluation,
      evidence,
      openEvidence: setEvidence,
      closeEvidence: () => setEvidence(null),
      auditLines,
      appendAuditLine,
    }),
    [
      baseVersion,
      proposedVersion,
      job,
      jobRequestId,
      setJob,
      selectedEvaluation,
      evidence,
      auditLines,
      appendAuditLine,
    ],
  );

  return (
    <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
  );
}

export function useConsole(): ConsoleContextValue {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error("useConsole must be used within ConsoleProvider");
  return ctx;
}
