"use client";

import { useMemo, useState } from "react";

/* An interactive proof for Audit finding 01 — the pre-submission creative
   linter. Type a draft; it flags the exact at-risk rule with a citation
   BEFORE submit, the way the finding describes. Rules are modelled from Rokt's
   publicly described creative policy (word budgets, no all-caps or emoji, name
   rules, per-vertical disclaimers for regulated categories) — not Rokt's
   internal ruleset, and the linter never auto-approves. It advises; Rokt ops
   stays the decision-maker. Deterministic and client-side on purpose: this is
   what the check would feel like, not a claim about Rokt's own tooling. */

type Vertical = "general" | "gambling" | "alcohol" | "credit";

type Draft = { title: string; vertical: Vertical; disclaimer: string };

type Flag = { rule: string; cite: string; detail: string };

const VERTICALS: { id: Vertical; label: string }[] = [
  { id: "general", label: "General" },
  { id: "gambling", label: "Gambling" },
  { id: "alcohol", label: "Alcohol" },
  { id: "credit", label: "Credit" },
];

// A small, obviously-illustrative name list — enough to show the rule firing.
const FIRST_NAMES = new Set([
  "sarah", "john", "mike", "emma", "alex", "david", "maria", "james",
  "laura", "chris", "anna", "peter", "sam", "kate", "raj", "mei",
]);

const WORD_BUDGET = 10; // modelled ceiling, labelled as such
const EMOJI = /\p{Extended_Pictographic}/u;

function lint(d: Draft): Flag[] {
  const flags: Flag[] = [];
  const words = d.title.trim().length ? d.title.trim().split(/\s+/) : [];

  if (words.length > WORD_BUDGET) {
    flags.push({
      rule: `Title runs to ${words.length} words — over the ${WORD_BUDGET}-word budget`,
      cite: "creative policy · title length",
      detail: "Trim it to the budget before submit.",
    });
  }

  const caps = words.filter((w) => /[A-Z]/.test(w) && w === w.toUpperCase() && /[A-Z]{2,}/.test(w));
  if (caps.length) {
    flags.push({
      rule: "Contains all-caps words",
      cite: "creative policy · formatting",
      detail: `at-risk token${caps.length > 1 ? "s" : ""}: ${caps.join(", ")}`,
    });
  }

  if (EMOJI.test(d.title)) {
    const found = [...d.title].filter((c) => EMOJI.test(c));
    flags.push({
      rule: "Contains an emoji",
      cite: "creative policy · formatting",
      detail: `at-risk token${found.length > 1 ? "s" : ""}: ${found.join(" ")}`,
    });
  }

  const names = words
    .map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))
    .filter((w) => FIRST_NAMES.has(w));
  if (names.length) {
    flags.push({
      rule: "Contains a first-name token",
      cite: "creative policy · name rules",
      detail: `at-risk token${names.length > 1 ? "s" : ""}: ${names.join(", ")}`,
    });
  }

  if (d.vertical !== "general" && d.disclaimer.trim().length === 0) {
    const name = d.vertical.charAt(0).toUpperCase() + d.vertical.slice(1);
    flags.push({
      rule: `${name} needs a per-vertical disclaimer`,
      cite: "creative policy · regulated verticals",
      detail: "Add the required disclaimer text for this category.",
    });
  }

  return flags;
}

export function CreativeLinter() {
  const [draft, setDraft] = useState<Draft>({
    title: "Hey Sarah, WIN BIG TODAY 🎰",
    vertical: "gambling",
    disclaimer: "",
  });

  const flags = useMemo(() => lint(draft), [draft]);
  const words = draft.title.trim().length ? draft.title.trim().split(/\s+/).length : 0;
  const clean = flags.length === 0;

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3 font-mono text-xs text-muted">
        <span className="text-amber">finding 01</span>
        <span>pre-submission creative linter — try it</span>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* draft editor */}
        <div className="space-y-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">Draft creative title</span>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              aria-label="Draft creative title"
              className="mt-1.5 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            />
            <span className="mt-1 block font-mono text-[10px] text-muted">{words}/{WORD_BUDGET} words</span>
          </label>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">Vertical</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {VERTICALS.map((v) => {
                const on = draft.vertical === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDraft((d) => ({ ...d, vertical: v.id }))}
                    className={`press min-h-[36px] rounded-md border px-2.5 py-1 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber sm:min-h-0 ${on ? "border-amber/60 bg-amber/[0.1] text-amber" : "border-border text-muted"}`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {draft.vertical !== "general" ? (
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted">Required disclaimer</span>
              <input
                type="text"
                value={draft.disclaimer}
                onChange={(e) => setDraft((d) => ({ ...d, disclaimer: e.target.value }))}
                placeholder="e.g. 18+. Gamble responsibly."
                aria-label="Per-vertical disclaimer"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              />
            </label>
          ) : null}
        </div>

        {/* linter verdict */}
        <div aria-live="polite">
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: clean ? "var(--c-teal)" : "var(--c-crimson)" }}
          >
            <p className="font-mono text-sm font-semibold" style={{ color: clean ? "var(--c-teal)" : "var(--c-crimson)" }}>
              {clean ? "✓ No modelled rule at risk" : `✕ ${flags.length} rule${flags.length > 1 ? "s" : ""} at risk — fix before submit`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {clean
                ? "The linter never auto-approves — a human still reviews before launch."
                : "Caught before submit, so it never becomes a rejection cycle."}
            </p>
          </div>

          <ul className="mt-3 space-y-2">
            {flags.map((f, i) => (
              <li key={i} className="rounded-lg border border-crimson/40 bg-crimson/[0.06] p-2.5">
                <p className="text-sm font-medium leading-snug text-text">{f.rule}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{f.detail}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-amber">{f.cite}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-amber/25 bg-amber/[0.06] p-3">
        <p className="font-mono text-[10px] uppercase tracking-wide text-amber">Honesty</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Rules are <span className="text-text">modelled</span> from Rokt&apos;s publicly described creative policy —
          word budgets, no all-caps or emoji, name rules, per-vertical disclaimers — not Rokt&apos;s internal ruleset.
          The {WORD_BUDGET}-word budget and the name list are illustrative. The linter only advises; Rokt ops stays the
          decision-maker.
        </p>
      </div>
    </div>
  );
}
