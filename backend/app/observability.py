"""Lightweight OpenTelemetry tracing (effectful shell — never imported by the pure
domain). Spans are recorded via the standard SDK; they export to the console only
when OTEL_CONSOLE=1 (default off, to avoid log spam) — so you get real, standard
instrumentation without requiring a collector. If the OTel packages are missing,
this degrades to a no-op tracer so the app always runs."""
from __future__ import annotations

import os

try:
    from opentelemetry import trace
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
    _OTEL = True
except Exception:  # pragma: no cover - optional dependency
    _OTEL = False


class _NoopSpan:
    def set_attribute(self, *_a, **_k):
        return None

    def __enter__(self):
        return self

    def __exit__(self, *_a):
        return False


class _NoopTracer:
    def start_as_current_span(self, _name):
        return _NoopSpan()


_tracer = None


def setup_tracing() -> None:
    global _tracer
    if not _OTEL:
        _tracer = _NoopTracer()
        return
    provider = TracerProvider(resource=Resource.create({"service.name": "threshold-api"}))
    if os.environ.get("OTEL_CONSOLE") == "1":
        provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
    trace.set_tracer_provider(provider)
    _tracer = trace.get_tracer("threshold")


def get_tracer():
    if _tracer is None:
        setup_tracing()
    return _tracer
