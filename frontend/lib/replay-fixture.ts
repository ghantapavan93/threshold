import { ReplayJobSchema, type ReplayJob } from "@/lib/schemas";

/* Recorded replay fallback for the Console.

   The flagship page runs against the live Threshold API. When that API is
   unreachable — a static deploy with no backend, a cold start, an offline
   reviewer — the page would otherwise show only empty panels. These two
   fixtures are REAL job payloads captured from the engine (POST /replay-jobs,
   V17 → V18 and V17 → V18-safe, seed 42, 200 sessions) and served from
   /public so they never weigh on the main bundle; they are fetched only when a
   live call fails as unreachable. They are always labelled "recorded" in the
   UI — never presented as a live run. Regenerate by re-capturing the endpoint
   and overwriting the files in /public/fixtures. */

export const RECORDED_REQUEST_ID = "recorded-fixture";

/** Human-readable description of exactly what the recording is. */
export const RECORDED_DESCRIPTION =
  "captured V17 → V18 replay · 200 sessions · seed 42";

const cache = new Map<string, ReplayJob>();

/** Load the recorded job matching the requested proposed version. The safe fix
    maps to the ELIGIBLE_FOR_HOLDOUT recording; everything else maps to the
    BLOCKED one, which is the headline story. */
export async function loadRecordedJob(proposed: string): Promise<ReplayJob> {
  const key = proposed === "V18-safe" ? "safe" : "dangerous";
  const cached = cache.get(key);
  if (cached) return cached;
  const res = await fetch(`/fixtures/replay-${key}.json`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`recorded replay unavailable (${res.status})`);
  const job = ReplayJobSchema.parse(await res.json());
  cache.set(key, job);
  return job;
}
