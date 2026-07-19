import compileTrap from "@/lib/fixtures/momentforge/compile.trap.json";
import compileSafe from "@/lib/fixtures/momentforge/compile.safe.json";
import simulateTrap from "@/lib/fixtures/momentforge/simulate.trap.json";
import simulateSafe from "@/lib/fixtures/momentforge/simulate.safe.json";
import {
  SemanticDeltaSchema,
  SimulationResultSchema,
  type SemanticDelta,
  type SimulationResult,
} from "@/lib/schemas";

/* Real recorded engine output (seed 42, V17→V18 / V17→V18-safe), written by
   backend/scripts/record_fixtures.py against the live backend. Validated through
   the SAME Zod schemas as the live responses — a contract mismatch surfaces as an
   error rather than rendering silently-wrong bytes. */

export type ForgeScenario = "trap" | "safe";

export function compileFixture(s: ForgeScenario): SemanticDelta {
  return SemanticDeltaSchema.parse(s === "trap" ? compileTrap : compileSafe);
}

export function simulateFixture(s: ForgeScenario): SimulationResult {
  return SimulationResultSchema.parse(s === "trap" ? simulateTrap : simulateSafe);
}
