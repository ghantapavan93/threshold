# ADR-002 — Deterministic hot path, no LLM in the critical path

**Status:** Accepted

**Context.** "AI-first" pressure tempts putting an LLM in the decision/serving path. For structured offer/eligibility decisions under latency and audit constraints, an LLM is slower, non-deterministic, costlier, and unauditable.

**Decision.** All correctness paths — rule evaluation, constraint checks, fail-closed handling, verdict, audit — are **100% deterministic**. No LLM anywhere in the critical path. Any future LLM use is confined to advisory, off-path text (e.g., a plain-language change summary) that degrades to nothing.

**Consequences.** (+) Reproducible, testable, fast, defensible. (+) "Correctness does not depend on a language model" is itself a differentiator in an AI-first hiring process. (−) No LLM "wow" — replaced by a deterministic verification story, which is stronger here.
