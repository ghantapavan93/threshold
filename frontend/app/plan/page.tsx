import type { Metadata } from "next";
import { PlanKeynote } from "@/components/plan/PlanKeynote";

export const metadata: Metadata = {
  title: "Threshold · The Role in Motion",
  description:
    "An outside-in audit of Rokt's public operator surface, grounded in their docs, feeding a first-90-days plan — the second proof-of-work, given the full keynote treatment.",
};

export default function PlanRoute() {
  return <PlanKeynote />;
}
