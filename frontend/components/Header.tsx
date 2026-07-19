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

  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <label className="sr-only" htmlFor="base-version">
        Base policy version
      </label>
      <select
        id="base-version"
        disabled={disabled}
        value={baseVersion ?? ""}
        onChange={(e) => setBaseVersion(e.target.value)}
        className="rounded-md border border-border bg-surface-2 px-2 py-1 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-50"
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
      <span aria-hidden className="text-muted">
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
        className="rounded-md border border-border bg-surface-2 px-2 py-1 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-50"
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

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="thr-edge flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 font-mono text-teal">
            ▚
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight sm:text-base">
              THRESHOLD{" "}
              <span className="text-muted">· Policy Change Safety Gate</span>
            </h1>
            <p className="text-xs text-muted">
              Merchant: <span className="text-text">{merchantName}</span>
            </p>
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="order-last flex w-full items-center gap-1 sm:order-none sm:w-auto"
        >
          <span
            aria-current="page"
            className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
          >
            Console
          </span>
          <Link
            href="/vision"
            className="rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            Vision
          </Link>
          <Link
            href="/builder"
            className="rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            Builder
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <VersionSelector />
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
