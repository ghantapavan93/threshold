import type { Metadata } from "next";
import { PlanPage } from "@/components/plan/PlanPage";

export const metadata: Metadata = {
  title: "Threshold · Audit & First 90 Days",
  description:
    "An outside-in audit of Rokt's public operator surface, grounded in their docs, feeding a concrete first-90-days plan — the second proof-of-work, distinct from Threshold.",
};

export default function PlanRoute() {
  return <PlanPage />;
}
