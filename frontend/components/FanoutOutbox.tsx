"use client";

import { motion } from "framer-motion";
import { ApiError } from "@/lib/api";
import { useOutbox } from "@/lib/hooks";
import { useConsole } from "./console-context";
import { Card, EmptyState, ErrorState, Section, Skeleton } from "./ui/primitives";
import { formatTime, shortHash } from "@/lib/utils";
import type { OutboxEvent, OutboxStatus, OutboxTarget } from "@/lib/schemas";

const STATUS_META: Record<
  OutboxStatus,
  { color: string; glyph: string; glow: string; label: string }
> = {
  PENDING: {
    color: "var(--c-amber)",
    glyph: "◷",
    glow: "glow-amber animate-pulse-soft",
    label: "PENDING",
  },
  PUBLISHED: {
    color: "var(--c-teal)",
    glyph: "✓",
    glow: "glow-teal",
    label: "PUBLISHED",
  },
  DEAD_LETTER: {
    color: "var(--c-crimson)",
    glyph: "⛔",
    glow: "glow-crimson",
    label: "DEAD LETTER",
  },
};

const TARGET_COLOR: Record<OutboxTarget, string> = {
  analytics: "var(--c-offer-blue)",
  billing: "var(--c-teal)",
  partner: "var(--c-amber)",
};

function StatusChip({ status, event }: { status: OutboxStatus; event: OutboxEvent }) {
  const meta = STATUS_META[status];
  const suffix =
    status === "PUBLISHED" && event.published_at
      ? ` · ${formatTime(event.published_at)}`
      : status === "DEAD_LETTER"
        ? ` · ${event.attempts} attempts`
        : "";
  return (
    <span
      className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] " + meta.glow}
      style={{
        color: meta.color,
        borderColor: meta.color,
        backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
      }}
    >
      <span aria-hidden>{meta.glyph}</span>
      {meta.label}
      {suffix}
    </span>
  );
}

function EventRow({ event }: { event: OutboxEvent }) {
  const targetColor = TARGET_COLOR[event.target];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card
        holo
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
        style={{ borderColor: event.status === "PENDING" ? undefined : STATUS_META[event.status].color }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide"
            style={{
              color: targetColor,
              borderColor: targetColor,
              backgroundColor: `color-mix(in srgb, ${targetColor} 12%, transparent)`,
            }}
          >
            {event.target}
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm text-text">{event.event_type}</p>
            <p className="font-mono text-[11px] text-muted">
              id {shortHash(event.id)} · created {formatTime(event.created_at)}
            </p>
          </div>
        </div>
        <StatusChip status={event.status} event={event} />
      </Card>
    </motion.div>
  );
}

export function FanoutOutbox() {
  const { job } = useConsole();
  const outbox = useOutbox(job?.id ?? null);

  const events = outbox.data ?? [];
  const total = events.length;
  const pending = events.filter((e) => e.status === "PENDING").length;
  const published = events.filter((e) => e.status === "PUBLISHED").length;
  const dead = events.filter((e) => e.status === "DEAD_LETTER").length;

  // Human-readable transition announcement for the aria-live region.
  const announcement =
    total === 0
      ? ""
      : pending > 0
        ? `${pending} of ${total} events pending — worker draining…`
        : dead > 0
          ? `Drained: ${published} published, ${dead} dead-lettered.`
          : `All ${total} events published.`;

  return (
    <Section
      id="fanout-outbox"
      index={7}
      title="Fan-out & Outbox"
      subtitle="Written atomically with the decision; drained by a background worker with backoff + dead-lettering. The decision and its downstream fan-out commit as one unit — then publish independently."
    >
      {!job ? (
        <EmptyState
          title="No fan-out yet"
          hint="Run a Policy Diff Replay (or a Scenario) — on completion, three downstream events are written atomically to the outbox, then drained by the worker."
        />
      ) : outbox.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : outbox.isError ? (
        <ErrorState
          title={
            outbox.error instanceof ApiError && outbox.error.isUnreachable
              ? "Backend unreachable"
              : "Could not load the outbox"
          }
          detail={outbox.error.message}
          requestId={outbox.error instanceof ApiError ? outbox.error.requestId : null}
          onRetry={() => outbox.refetch()}
        />
      ) : total === 0 ? (
        <EmptyState title="This run wrote no outbox events." />
      ) : (
        <div className="space-y-4">
          <div
            aria-live="polite"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
          >
            <span
              className="font-medium"
              style={{
                color: pending > 0 ? "var(--c-amber)" : dead > 0 ? "var(--c-crimson)" : "var(--c-teal)",
              }}
            >
              {pending > 0 ? "◷ " : dead > 0 ? "⛔ " : "✓ "}
              {announcement}
            </span>
            <span className="font-mono text-xs text-muted">
              pending {pending} · published {published} · dead-letter {dead}
            </span>
          </div>

          <div className="space-y-3">
            {events.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
