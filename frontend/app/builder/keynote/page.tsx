import type { Metadata } from "next";
import { KeynotePage } from "@/components/builder/keynote/KeynotePage";

export const metadata: Metadata = {
  title: "Threshold · Builder Keynote",
  description:
    "One transaction, told as a cinematic product film — with the real Threshold engine living inside every scene. Proof of work over credentials.",
};

export default function BuilderKeynoteRoute() {
  return <KeynotePage />;
}
