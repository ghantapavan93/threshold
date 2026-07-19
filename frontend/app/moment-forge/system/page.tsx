import type { Metadata } from "next";
import { SystemArch } from "@/components/moment-forge/system/SystemArch";

export const metadata: Metadata = {
  title: "Threshold · Moment Forge — Volume II · The System",
  description:
    "The technical architecture of Threshold: a progressive C4 zoom, the two live request paths (synchronous decision + asynchronous outbox fan-out), the observability plane, and the honest shipped-vs-designed scaling story.",
};

export default function SystemArchRoute() {
  return <SystemArch />;
}
