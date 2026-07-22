"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/providers";
import { useAudit, useHealth, usePolicies } from "@/lib/hooks";
import { useConsole } from "./console-context";
import { Button, Chip } from "./ui/primitives";
import { API_BASE } from "@/lib/api";
import { shortHash } from "@/lib/utils";

function StatusChip() {
  const health = useHealth();
  if (health.isPending) {
    return (
      <Chip color="var(--c-muted)" title="Checking backend health">
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-muted" />
        CHECKING
      </Chip>
    );
  }
  if (health.isError) {
    return (
      <Chip
        color="var(--c-crimson)"
        icon={<span aria-hidden>✕</span>}
        title={`Backend unreachable at ${API_BASE}`}
      >
        OFFLINE
      </Chip>
    );
  }
  return (
    <Chip
      color="var(--c-teal)"
      title={`Backend v${health.data.version} · ${API_BASE}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-teal" />
      LIVE · v{health.data.version}
    </Chip>
  );
}

function VersionSelector() {
  const {
    baseVersion,
    proposedVersion,
    setBaseVersion,
    setProposedVersion,
  } = useConsole();
  const policies = usePolicies();

  const options = policies.data ?? [];
  const disabled = policies.isPending || policies.isError;

  const selectClass =
    "min-h-[44px] flex-1 rounded-md border border-border bg-surface-2 px-2 py-2 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-50 sm:min-h-0 sm:flex-none sm:py-1";

  return (
    <div className="flex w-full items-center gap-2 font-mono text-sm sm:w-auto">
      <label className="sr-only" htmlFor="base-version">
        Base policy version
      </label>
      <select
        id="base-version"
        disabled={disabled}
        value={baseVersion ?? ""}
        onChange={(e) => setBaseVersion(e.target.value)}
        className={selectClass}
      >
        {baseVersion && options.length === 0 ? (
          <option value={baseVersion}>{baseVersion}</option>
        ) : null}
        {options.map((p) => (
          <option key={p.policy_version} value={p.policy_version}>
            {p.policy_version}
          </option>
        ))}
      </select>
      <span aria-hidden className="shrink-0 text-muted">
        →
      </span>
      <label className="sr-only" htmlFor="proposed-version">
        Proposed policy version
      </label>
      <select
        id="proposed-version"
        disabled={disabled}
        value={proposedVersion ?? ""}
        onChange={(e) => setProposedVersion(e.target.value)}
        className={selectClass}
      >
        {proposedVersion && options.length === 0 ? (
          <option value={proposedVersion}>{proposedVersion}</option>
        ) : null}
        {options.map((p) => (
          <option key={p.policy_version} value={p.policy_version}>
            {p.policy_version}
          </option>
        ))}
      </select>
    </div>
  );
}

function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Button
      size="sm"
      variant="subtle"
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
      title="Toggle theme"
      className="shrink-0 px-3"
    >
      {mounted ? (resolved === "dark" ? "☾ Dark" : "☀ Light") : "◐ Theme"}
    </Button>
  );
}

export function Header() {
  const { job, merchantName } = useConsole();
  const audit = useAudit(job?.id ?? null);
  const runShort = job ? shortHash(job.id) : null;
  // Current run's audit HMAC: the latest appended record's per-record HMAC.
  const lastRecord = audit.data?.[audit.data.length - 1];
  const hmac = lastRecord ? shortHash(lastRecord.content_hmac) : null;

  const navLink =
    "inline-flex min-h-[44px] items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0 sm:py-1 sm:text-xs";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-6">
        {/* Brand row — theme toggle rides alongside it on mobile so it stays
            top-right and reachable; on desktop it moves into the controls. */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="thr-edge flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/10 font-mono text-teal">
              ▚
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                <span className="text-shimmer">THRESHOLD</span>
                <span className="hidden text-muted sm:inline">
                  {" "}
                  · Policy Change Safety Gate
                </span>
              </h1>
              <p className="truncate text-xs text-muted">
                Merchant: <span className="text-text">{merchantName}</span>
              </p>
            </div>
          </div>
          <div className="shrink-0 sm:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Primary nav — full-width, evenly split, big tap targets on mobile. */}
        <nav
          aria-label="Primary"
          className="grid grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:gap-1"
        >
          <span
            aria-current="page"
            className={navLink + " border-teal/40 bg-teal/10 text-teal"}
          >
            Console
          </span>
          <Link
            href="/vision"
            className={navLink + " border-transparent text-muted hover:border-border hover:text-text"}
          >
            Vision
          </Link>
          <Link
            href="/builder"
            className={navLink + " border-transparent text-muted hover:border-border hover:text-text"}
          >
            Builder
          </Link>
          <Link
            href="/plan"
            className={navLink + " border-transparent text-muted hover:border-border hover:text-text"}
          >
            Audit &amp; Plan
          </Link>
          <Link
            href="/moment-forge"
            className={navLink + " border-transparent text-muted hover:border-border hover:text-text"}
          >
            Moment Forge
          </Link>
        </nav>

        {/* Controls — selectors get their own full-width row on mobile, chips
            wrap below; on desktop everything sits inline at the right. */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <VersionSelector />
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip />
            {runShort ? (
              <Chip color="var(--c-offer-blue)" title={`Current run ${job?.id}`}>
                run {runShort}
              </Chip>
            ) : null}
            {hmac ? (
              <Chip
                color="var(--c-muted)"
                title={`Latest audit record HMAC (tamper-evident) · ${lastRecord?.content_hmac}`}
              >
                hmac {hmac}
              </Chip>
            ) : null}
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
