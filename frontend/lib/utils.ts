import type { ChangeKind, ConstraintResultValue, VerdictValue } from "./schemas";

/** Tiny className joiner (no clsx dependency needed). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** RFC4122 v4 uuid. Uses crypto.randomUUID when present, else a safe fallback. */
export function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Shorten an HMAC/hash for chips: first 8 + last 4, monospace-friendly. */
export function shortHash(hash: string | null | undefined): string {
  if (!hash) return "—";
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

/** Format an ISO timestamp compactly; falls back to the raw string. */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** Human label for a decision-diff change_kind. */
export const CHANGE_KIND_LABEL: Record<ChangeKind, string> = {
  unchanged: "Unchanged",
  nothing_to_offer: "No Offer → Offer",
  offer_to_nothing: "Offer → No Offer",
  constraint_violation: "Constraint Violation",
};

/** Semantic color token per change_kind (paired always with a text label). */
export const CHANGE_KIND_COLOR: Record<ChangeKind, string> = {
  unchanged: "var(--c-muted)",
  nothing_to_offer: "var(--c-offer-blue)",
  offer_to_nothing: "var(--c-amber)",
  constraint_violation: "var(--c-crimson)",
};

export const CONSTRAINT_COLOR: Record<ConstraintResultValue, string> = {
  PASS: "var(--c-teal)",
  INFO: "var(--c-offer-blue)",
  WARN: "var(--c-amber)",
  FAIL: "var(--c-crimson)",
};

export const VERDICT_COLOR: Record<VerdictValue, string> = {
  ELIGIBLE_FOR_HOLDOUT: "var(--c-teal)",
  INSUFFICIENT_EVIDENCE: "var(--c-amber)",
  BLOCKED: "var(--c-crimson)",
};

export const VERDICT_LABEL: Record<VerdictValue, string> = {
  ELIGIBLE_FOR_HOLDOUT: "ELIGIBLE FOR HOLDOUT",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT EVIDENCE",
  BLOCKED: "BLOCKED",
};

/** Human labels for constraint keys (kept exact to the schema catalog). */
export const CONSTRAINT_LABEL: Record<string, string> = {
  latency_budget: "Latency Budget",
  fallback_explicit: "Explicit Fallback",
  consent: "Consent",
  brand_safety: "Brand Safety",
  frequency_cap: "Frequency Cap",
  holdout_required: "Holdout Required",
  missing_attribute_semantics: "Missing-Attribute Semantics",
};

export function constraintLabel(key: string): string {
  return CONSTRAINT_LABEL[key] ?? key;
}

/** Stringify a snapshot value for the mono display, preserving null. */
export function renderValue(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}
