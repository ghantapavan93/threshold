"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useTheme } from "@/app/providers";
import { ClipReveal, MaskText } from "@/components/builder/anim";

/* ────────────────────────────────────────────────────────────────────────────
   Moment Forge — editorial chassis (the "monograph" grammar): nav, blueprint
   substrate, museum Plate, DomainTerm popovers, Marginalia, PlateRail. All
   decorative motion is reduced-motion-gated via the shared primitives + the
   global freeze block; no external assets.
   ──────────────────────────────────────────────────────────────────────────── */

// ── Nav (self-contained; links OUT, never edits the other pages) ─────────────
function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
      title="Toggle theme"
      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs font-medium text-text transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0"
    >
      {mounted ? (resolved === "dark" ? "☾ Dark" : "☀ Light") : "◐ Theme"}
    </button>
  );
}

const NAV_LINK =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-border hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0";

export function MomentNav({ volume = "I" }: { volume?: "I" | "II" }) {
  const volPill =
    "inline-flex min-h-[36px] items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0";
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="thr-edge flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/10 font-mono text-teal">
            ▚
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight sm:text-base">
              THRESHOLD <span className="text-muted">· Moment Forge</span>
            </p>
            {/* Volume switcher — sub-navigation within Moment Forge (not the top nav). */}
            <nav aria-label="Volume" className="mt-1 flex flex-wrap gap-1">
              <Link
                href="/moment-forge"
                aria-current={volume === "I" ? "page" : undefined}
                className={volPill + (volume === "I" ? " border-teal/40 bg-teal/10 text-teal" : " border-transparent text-muted hover:border-border hover:text-text")}
              >
                I · The Domain
              </Link>
              <Link
                href="/moment-forge/system"
                aria-current={volume === "II" ? "page" : undefined}
                className={volPill + (volume === "II" ? " border-teal/40 bg-teal/10 text-teal" : " border-transparent text-muted hover:border-border hover:text-text")}
              >
                II · The System
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <nav aria-label="Primary" className="flex flex-wrap items-center justify-end gap-1">
            <Link href="/" className={NAV_LINK}>Console</Link>
            <Link href="/vision" className={NAV_LINK}>Vision</Link>
            <Link href="/builder" className={NAV_LINK}>Builder</Link>
            <span
              aria-current="page"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal sm:min-h-0"
            >
              Moment Forge
            </span>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// ── Blueprint substrate: faint drafting-table grid, fixed, aria-hidden ───────
export function BlueprintSubstrate() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.5 }}>
      <svg className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern id="mf-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="var(--c-border)" strokeOpacity="0.10" strokeWidth="1" />
          </pattern>
          <pattern id="mf-grid-fine" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0V12" fill="none" stroke="var(--c-border)" strokeOpacity="0.05" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mf-grid-fine)" />
        <rect width="100%" height="100%" fill="url(#mf-grid)" />
      </svg>
    </div>
  );
}

// ── Marginalia: scholarly left-margin annotation ─────────────────────────────
export function Marginalia({ children }: { children: ReactNode }) {
  return (
    <aside className="mt-3 border-l border-teal/40 pl-3 font-mono text-[11px] leading-relaxed text-muted lg:mt-0">
      {children}
    </aside>
  );
}

// ── DomainTerm: inline term → definition popover (focusable, described) ───────
export function DomainTerm({
  children,
  definition,
}: {
  children: ReactNode;
  definition: string;
}) {
  const id = useId();
  return (
    <span className="group relative inline-block">
      <button
        type="button"
        aria-describedby={id}
        className="cursor-help font-medium text-teal underline decoration-dotted decoration-teal/60 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      >
        {children}
      </button>
      <span
        role="tooltip"
        id={id}
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-30 w-64 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-normal not-italic leading-relaxed text-text opacity-0 shadow-panel transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {definition}
      </span>
    </span>
  );
}

// ── Plate: the museum figure frame ───────────────────────────────────────────
export function Plate({
  figure,
  title,
  caption,
  as = "h2",
  id,
  tone = "neutral",
  children,
}: {
  figure: string;
  title: string;
  caption: ReactNode;
  as?: ElementType;
  id?: string;
  tone?: "neutral" | "teal" | "crimson" | "amber";
  children: ReactNode;
}) {
  const toneColor =
    tone === "teal"
      ? "var(--c-teal)"
      : tone === "crimson"
        ? "var(--c-crimson)"
        : tone === "amber"
          ? "var(--c-amber)"
          : "var(--c-border-strong)";
  return (
    <ClipReveal>
      <figure
        className="relative overflow-hidden rounded-2xl border bg-surface/60 backdrop-blur-sm"
        style={{ borderColor: toneColor }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 px-5 py-3 sm:px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">
              Fig. {figure}
            </span>
            <MaskText
              as={as}
              id={id}
              className="text-lg font-semibold tracking-tight sm:text-xl"
              segments={[{ text: title }]}
            />
          </div>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
        <figcaption className="border-t border-border/70 px-5 py-3 font-mono text-[11px] leading-relaxed text-muted sm:px-6">
          {caption}
        </figcaption>
      </figure>
    </ClipReveal>
  );
}

// ── PlateRail: fixed figure index that highlights the current section ────────
const RAIL: { id: string; label: string; fig: string }[] = [
  { id: "sec-core", label: "The core domain", fig: "01" },
  { id: "sec-map", label: "Bounded-context map", fig: "02" },
  { id: "sec-lens", label: "Language collision", fig: "03" },
  { id: "sec-compiler", label: "Semantic compiler", fig: "04" },
  { id: "sec-fracture", label: "Context fracture", fig: "05" },
  { id: "sec-laws", label: "Laws of the moment", fig: "06" },
  { id: "sec-sim", label: "Evolution simulator", fig: "07" },
  { id: "sec-future", label: "Future contexts", fig: "08" },
  { id: "sec-evidence", label: "Implementation evidence", fig: "09" },
];

export type RailItem = { id: string; label: string; fig: string };

export function PlateRail({ items = RAIL }: { items?: RailItem[] }) {
  const [active, setActive] = useState(0);
  const railRef = useRef(active);
  railRef.current = active;

  useEffect(() => {
    const onScroll = () => {
      let idx = 0;
      for (let i = 0; i < items.length; i++) {
        const el = document.getElementById(items[i]!.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.4) idx = i;
      }
      if (idx !== railRef.current) setActive(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav
      aria-label="Figure index"
      className="pointer-events-none fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
    >
      <ol className="pointer-events-auto flex flex-col gap-1.5 rounded-2xl border border-border/70 bg-base/60 p-2 backdrop-blur-xl">
        {items.map((r, i) => {
          const on = i === active;
          return (
            <li key={r.id}>
              <a
                href={`#${r.id}`}
                aria-current={on ? "true" : undefined}
                className={
                  "flex items-center gap-2 rounded-lg px-2 py-1 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal " +
                  (on ? "text-teal" : "text-muted hover:text-text")
                }
              >
                <span className="font-mono">{r.fig}</span>
                <span
                  aria-hidden
                  className="h-px w-4 transition-colors"
                  style={{ backgroundColor: on ? "var(--c-teal)" : "var(--c-border-strong)" }}
                />
                <span className="whitespace-nowrap font-mono uppercase tracking-[0.14em]">
                  {r.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Small shared bits ────────────────────────────────────────────────────────
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-teal">{children}</p>
  );
}
