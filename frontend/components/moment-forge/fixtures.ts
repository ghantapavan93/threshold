import compileTrap from "@/lib/fixtures/momentforge/compile.trap.json";
import compileSafe from "@/lib/fixtures/momentforge/compile.safe.json";
import compileFatfinger from "@/lib/fixtures/momentforge/compile.fatfinger.json";
import compileConsent from "@/lib/fixtures/momentforge/compile.consent.json";
import compileImmutable from "@/lib/fixtures/momentforge/compile.immutable.json";
import translationAuditFixture from "@/lib/fixtures/momentforge/translation-audit.json";
import reconciliationAuditFixture from "@/lib/fixtures/momentforge/reconciliation-audit.json";
import impressionAuditFixture from "@/lib/fixtures/momentforge/impression-audit.json";
import { ApiError } from "@/lib/api";
import {
  ImpressionAuditSchema,
  ReconciliationAuditSchema,
  SemanticDeltaSchema,
  SimulationResultSchema,
  TranslationAuditSchema,
  type ImpressionAudit,
  type ReconciliationAudit,
  type SemanticDelta,
  type SimulationResult,
  type TranslationAudit,
} from "@/lib/schemas";

/* Real recorded engine output for all five seeded laws (seed 42), written by
   backend/scripts/record_fixtures.py against the live backend. Validated through
   the SAME Zod schemas as the live responses — a contract mismatch surfaces as a
   validation error, never silently-wrong bytes. The large simulate payloads are
   dynamic-imported so they stay out of the initial bundle. */

export type ForgeScenario = "trap" | "safe" | "fatfinger" | "consent" | "immutable";

export type ScenarioMeta = {
  id: ForgeScenario;
  version: string;
  label: string;
  law: string;
  constraintKey: string | null;
};

/** Scenario → proposed version → the law it proves (the verdict itself is real). */
export const SCENARIOS: ScenarioMeta[] = [
  { id: "trap", version: "V18", label: "Missing-attribute inversion", law: "Missing-attribute safety", constraintKey: "missing_attribute_semantics" },
  { id: "safe", version: "V18-safe", label: "Clean change", law: "Holdout eligibility", constraintKey: null },
  { id: "fatfinger", version: "V18-fatfinger", label: "Plausibility (age typed 2)", law: "Plausibility guard", constraintKey: "plausibility" },
  { id: "consent", version: "V18-consent", label: "Consent guard", law: "Hard-constraint enforcement", constraintKey: "consent" },
  { id: "immutable", version: "V18-immutable", label: "Immutable field (US→CA)", law: "Immutable policy versions", constraintKey: "immutable_field_guard" },
];

export function scenarioVersion(s: ForgeScenario): string {
  return SCENARIOS.find((x) => x.id === s)!.version;
}

const COMPILE: Record<ForgeScenario, unknown> = {
  trap: compileTrap,
  safe: compileSafe,
  fatfinger: compileFatfinger,
  consent: compileConsent,
  immutable: compileImmutable,
};

const SIM_LOADERS: Record<ForgeScenario, () => Promise<{ default: unknown }>> = {
  trap: () => import("@/lib/fixtures/momentforge/simulate.trap.json"),
  safe: () => import("@/lib/fixtures/momentforge/simulate.safe.json"),
  fatfinger: () => import("@/lib/fixtures/momentforge/simulate.fatfinger.json"),
  consent: () => import("@/lib/fixtures/momentforge/simulate.consent.json"),
  immutable: () => import("@/lib/fixtures/momentforge/simulate.immutable.json"),
};

export function compileFixture(s: ForgeScenario): SemanticDelta {
  const parsed = SemanticDeltaSchema.safeParse(COMPILE[s]);
  if (!parsed.success) {
    throw new ApiError({
      kind: "validation",
      message: `Recorded compile fixture (${s}) did not match the API contract`,
    });
  }
  return parsed.data;
}

export async function simulateFixture(s: ForgeScenario): Promise<SimulationResult> {
  const mod = await SIM_LOADERS[s]();
  const parsed = SimulationResultSchema.safeParse(mod.default);
  if (!parsed.success) {
    throw new ApiError({
      kind: "validation",
      message: `Recorded simulate fixture (${s}) did not match the API contract`,
    });
  }
  return parsed.data;
}

export function translationFixture(): TranslationAudit {
  const parsed = TranslationAuditSchema.safeParse(translationAuditFixture);
  if (!parsed.success) {
    throw new ApiError({
      kind: "validation",
      message: "Recorded translation-audit fixture did not match the API contract",
    });
  }
  return parsed.data;
}

export function impressionFixture(): ImpressionAudit {
  const parsed = ImpressionAuditSchema.safeParse(impressionAuditFixture);
  if (!parsed.success) {
    throw new ApiError({
      kind: "validation",
      message: "Recorded impression-audit fixture did not match the API contract",
    });
  }
  return parsed.data;
}

export function reconciliationFixture(): ReconciliationAudit {
  const parsed = ReconciliationAuditSchema.safeParse(reconciliationAuditFixture);
  if (!parsed.success) {
    throw new ApiError({
      kind: "validation",
      message: "Recorded reconciliation-audit fixture did not match the API contract",
    });
  }
  return parsed.data;
}
