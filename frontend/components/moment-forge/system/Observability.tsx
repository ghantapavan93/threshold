"use client";

import { METRICS, SPANS, SPAN_ATTRS } from "./model";
import { ProtocolChip } from "./atoms";

/* The observability plane — a blueprint cross-section, not a fake dashboard.
   Real spans / instruments named; NO invented durations or values (data-integrity
   law). If a duration axis appears it is relative and marked "shape, not measured". */
export function Observability() {
  return (
    <div className="space-y-6">
      {/* Span waterfall — structure only */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Spans · get_tracer() (shape, not measured)</p>
        <div className="mt-2 space-y-1.5">
          {SPANS.map((s, i) => (
            <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${s.depth * 20}px` }}>
              <span className="h-3 rounded-sm bg-teal/40" style={{ width: `${140 - s.depth * 30}px` }} aria-hidden />
              <span className="font-mono text-[11px] text-text">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SPAN_ATTRS.map((a) => (
            <ProtocolChip key={a}>{a}</ProtocolChip>
          ))}
        </div>
      </div>

      {/* Metrics — named instruments, no invented values */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-surface-2/25 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Counters</p>
          <ul className="mt-1.5 space-y-1">
            {METRICS.counters.map((m) => (
              <li key={m} className="font-mono text-[11px] text-text">{m}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface-2/25 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Histograms</p>
          <ul className="mt-1.5 space-y-1">
            {METRICS.histograms.map((m) => (
              <li key={m} className="font-mono text-[11px] text-text">{m}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Structured log schema — values as placeholders */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Structured log line (main.py) — schema, not data</p>
        <pre className="scroll-x mt-2 overflow-x-auto rounded-lg border border-border bg-base/60 p-3 font-mono text-[11px] leading-relaxed text-text">
          <code>{`{"route": "<route>", "merchant_id": "<id>", "request_id": "<uuid>",
 "verdict": "<BLOCKED|…>", "change_count": <n>, "duration_ms": <n>}`}</code>
        </pre>
      </div>

      {/* Request-id thread */}
      <div className="rounded-2xl border border-teal/30 bg-teal/[0.05] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal">Chase one request</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-text">
          {["frontend X-Request-ID", "middleware", "span / log context", "error envelope {error:{…,request_id}}", "ApiError.requestId"].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-2">
              <span>{step}</span>
              {i < arr.length - 1 ? <span aria-hidden className="text-teal">→</span> : null}
            </span>
          ))}
        </p>
      </div>

      {/* Honesty */}
      <p className="rounded-lg border border-amber/30 bg-amber/[0.06] p-3 text-[11px] leading-relaxed text-muted">
        <span className="font-semibold text-amber">◌ DESIGNED: </span>
        the export hop (SDK → OTel Collector → backend) is not wired. What ships today is the OTel SDK with a console
        exporter gated by <span className="font-mono text-text">OTEL_CONSOLE=1</span> and a no-op fallback.
      </p>
    </div>
  );
}
