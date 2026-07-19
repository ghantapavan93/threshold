# ADR-001 — Product boundary: a safety gate, not a decision engine

**Status:** Accepted

**Context.** The winning concept risked reading as "a simplified Rokt Brain" — a fatal overlap with an existing, sophisticated internal platform. Six independent AI reviews plus a red team converged on the same fault line.

**Decision.** Scope Threshold strictly to a **pre-release policy-change safety gate**. It never selects offers, never ranks, never runs experiments, never enforces consent at serving time, never settles money. The reference decision engine is deliberately simple and deterministic; the product is the change-safety / replay / fail-closed / verdict layer around it.

**Consequences.** (+) Defensible against "you rebuilt Brain." (+) Demoable in 2 minutes with one clear user. (−) Novelty is "domain-specific combination," not new CS — so framing must stay humble. (−) Depends on the change-management workflow assumption (see LIMITATIONS).
