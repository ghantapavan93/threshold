import type { Metadata } from "next";
import { BuilderPage } from "@/components/builder/BuilderPage";

export const metadata: Metadata = {
  title: "Threshold · How I'd Own the Builder Role",
  description:
    "First-person: how I'd own the Rokt Builder role — for each dimension, what I already proved in Threshold and how I'd own it next. Proof of work over credentials.",
};

export default function BuilderRoute() {
  return <BuilderPage />;
}
