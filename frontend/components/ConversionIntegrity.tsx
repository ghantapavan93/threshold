"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useCancellation, useConversion } from "@/lib/hooks";
import { uuid } from "@/lib/utils";
import { Button, Card, Chip, ErrorState, Section } from "./ui/primitives";
import type { ConversionResponse } from "@/lib/schemas";

type ConversionLog = {
  attempt: number;
  status: ConversionResponse["status"];
  conversion_id: string;
  dedup_key: string;
};

function ConversionPanel() {
  const [conversiontype, setType] = useState("Purchase");
  const [confirmationref, setRef] = useState("AUR-10231");
  const [amount, setAmount] = useState(149.99);
  const [currency] = useState("USD");
  const [log, setLog] = useState<ConversionLog[]>([]);
  // Reuse the same Idempotency-Key across both sends so the dedup is on the
  // verified fields, exactly as the contract models it.
  const [idemKey, setIdemKey] = useState(uuid());
  const mutation = useConversion();

  const send = () => {
    mutation.mutate(
      { conversiontype, confirmationref, amount, currency, idempotencyKey: idemKey },
      {
        onSuccess: (res) =>
          setLog((prev) => [
            ...prev,
            {
              attempt: prev.length + 1,
              status: res.status,
              conversion_id: res.conversion_id,
              dedup_key: res.dedup_key,
            },
          ]),
      },
    );
  };

  const reset = () => {
    setLog([]);
    setIdemKey(uuid());
    mutation.reset();
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Duplicate conversion</h3>
        <Chip color="var(--c-muted)">dedup on conversiontype + confirmationref</Chip>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          conversiontype
          <input
            value={conversiontype}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          confirmationref
          <input
            value={confirmationref}
            onChange={(e) => setRef(e.target.value)}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          amount
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          currency
          <input
            value={currency}
            readOnly
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-sm text-muted"
          />
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="primary" onClick={send} disabled={mutation.isPending}>
          {mutation.isPending
            ? "Sending…"
            : log.length === 0
              ? "Send conversion"
              : "Send duplicate ↺"}
        </Button>
        {log.length > 0 ? (
          <Button variant="ghost" onClick={reset}>
            Reset
          </Button>
        ) : null}
      </div>

      {mutation.isError ? (
        <div className="mt-3">
          <ErrorState
            title={
              mutation.error instanceof ApiError && mutation.error.isUnreachable
                ? "Backend unreachable"
                : "Conversion failed"
            }
            detail={mutation.error.message}
            requestId={
              mutation.error instanceof ApiError ? mutation.error.requestId : null
            }
          />
        </div>
      ) : null}

      <div aria-live="polite" className="mt-3 space-y-2">
        {log.map((l) => {
          const dup = l.status === "deduplicated";
          return (
            <div
              key={l.attempt}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">attempt {l.attempt}</span>
                  <Chip
                    color={dup ? "var(--c-amber)" : "var(--c-teal)"}
                    icon={<span aria-hidden>{dup ? "⊘" : "✓"}</span>}
                  >
                    {dup ? "Deduplicated" : "Processed"}
                  </Chip>
                </div>
                <p className="mt-1 truncate font-mono text-[11px] text-muted">
                  dedup_key {l.dedup_key} · id {l.conversion_id}
                </p>
              </div>
            </div>
          );
        })}
        {log.length >= 2 && log[1]?.status === "deduplicated" ? (
          <p className="text-xs text-teal">
            ✓ No double obligation: the second send was deduplicated.
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function CancellationPanel() {
  const [itemReservationId, setId] = useState("res-8842");
  const mutation = useCancellation();

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Cancellation</h3>
        <Chip color="var(--c-muted)">verified fields only · no money/settlement</Chip>
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted">
        itemReservationId
        <input
          value={itemReservationId}
          onChange={(e) => setId(e.target.value)}
          className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        />
      </label>
      <div className="mt-3">
        <Button
          variant="primary"
          onClick={() => mutation.mutate({ itemReservationId })}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Cancelling…" : "Cancel reservation"}
        </Button>
      </div>

      {mutation.isError ? (
        <div className="mt-3">
          <ErrorState
            title={
              mutation.error instanceof ApiError && mutation.error.isUnreachable
                ? "Backend unreachable"
                : "Cancellation failed"
            }
            detail={mutation.error.message}
            requestId={
              mutation.error instanceof ApiError ? mutation.error.requestId : null
            }
          />
        </div>
      ) : null}

      {mutation.data ? (
        <div aria-live="polite" className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            {mutation.data.state_transition.map((state, i) => (
              <div key={state} className="flex items-center gap-2">
                <Chip
                  color={
                    state === "canceled"
                      ? "var(--c-crimson)"
                      : state === "confirmed"
                        ? "var(--c-offer-blue)"
                        : "var(--c-muted)"
                  }
                >
                  {state}
                </Chip>
                {i < mutation.data.state_transition.length - 1 ? (
                  <span aria-hidden className="text-muted">
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[11px] text-muted">
            final_state {mutation.data.final_state} · reversible{" "}
            {String(mutation.data.reversible)}
          </p>
        </div>
      ) : null}
    </Card>
  );
}

export function ConversionIntegrity() {
  return (
    <Section
      id="conversion-integrity"
      index={6}
      title="Conversion Integrity"
      subtitle="A duplicate conversion is processed once, then deduplicated — no double obligation. A reservation moves reserved → confirmed → canceled. Verified fields only."
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConversionPanel />
        <CancellationPanel />
      </div>
    </Section>
  );
}
