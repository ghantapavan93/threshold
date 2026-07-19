import type { Metadata } from "next";
import { VisionKeynote } from "@/components/vision/VisionKeynote";

export const metadata: Metadata = {
  title: "Threshold · Vision Keynote",
  description:
    "The credible path from a working prototype to a deterministic pre-flight gate at Rokt scale — grounded in Rokt's public direction.",
};

export default function VisionPage() {
  return <VisionKeynote />;
}
