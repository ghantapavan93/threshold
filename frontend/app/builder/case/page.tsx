import type { Metadata } from "next";
import { BuilderPage } from "@/components/builder/BuilderPage";

export const metadata: Metadata = {
  title: "Threshold · The Builder Role, in prose",
  description:
    "The role case in prose: for each part of the Rokt Builder role, what I already proved in Threshold and how I'd own it next. The cinematic version lives at /builder.",
};

export default function BuilderCaseRoute() {
  return <BuilderPage />;
}
