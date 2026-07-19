import type { Metadata } from "next";
import { MomentForge } from "@/components/moment-forge/MomentForge";

export const metadata: Metadata = {
  title: "Threshold · Moment Forge",
  description:
    "A Domain-Driven-Design monograph for Rokt's Transaction Moment — a living bounded-context map, a ubiquitous-language collision, and two live engine features (Semantic Change Compiler + Domain Evolution Simulator).",
};

export default function MomentForgeRoute() {
  return <MomentForge />;
}
