"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "@/lib/utils";

// ---- Button ----------------------------------------------------------------
type ButtonVariant = "primary" | "ghost" | "danger" | "subtle";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-teal/15 text-teal border-teal/40 hover:bg-teal/25 disabled:opacity-40",
  danger:
    "bg-crimson/15 text-crimson border-crimson/40 hover:bg-crimson/25 disabled:opacity-40",
  ghost:
    "bg-transparent text-text border-border hover:bg-surface-2 disabled:opacity-40",
  subtle:
    "bg-surface-2 text-text border-border hover:border-border-strong disabled:opacity-40",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "ghost", size = "md", className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium",
        "transition-[background-color,border-color,transform] duration-150 ease-out",
        "active:scale-[0.97] disabled:active:scale-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-base",
        "disabled:cursor-not-allowed",
        // ≥44px effective tap target on touch; natural height on desktop.
        "min-h-[44px] sm:min-h-0",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm",
        buttonVariants[variant],
        className,
      )}
      {...rest}
    />
  );
});

// ---- Card / Section --------------------------------------------------------
type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Enable the holographic hover lift + sheen sweep (for feature cards/tiles). */
  holo?: boolean;
};

export function Card({ className, children, holo = false, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-xl shadow-panel",
        holo ? "holo-card" : "glass",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Section({
  id,
  index,
  title,
  subtitle,
  actions,
  children,
}: {
  id: string;
  index: number;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="thr-edge inline-flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2/70 font-mono text-xs font-semibold text-teal"
            >
              {index}
            </span>
            <h2
              id={`${id}-title`}
              className="text-xl font-semibold tracking-tight sm:text-2xl"
            >
              {title}
            </h2>
          </div>
          {subtitle ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

// ---- Chip ------------------------------------------------------------------
export function Chip({
  color,
  icon,
  children,
  title,
  className,
}: {
  color?: string;
  icon?: ReactNode;
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs",
        className,
      )}
      style={
        color
          ? {
              color,
              borderColor: color,
              backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
            }
          : undefined
      }
    >
      {icon}
      {children}
    </span>
  );
}

// ---- Toggle (segmented) ----------------------------------------------------
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cx(
              "inline-flex min-h-[40px] items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:min-h-0",
              active
                ? "bg-surface text-text shadow-sm"
                : "text-muted hover:text-text",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- Skeleton --------------------------------------------------------------
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx(
        "relative overflow-hidden rounded-md bg-surface-2",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className,
      )}
    />
  );
}

// ---- StatusIcon: color + glyph pairing (never color alone) -----------------
export function StatusGlyph({ kind }: { kind: "PASS" | "WARN" | "FAIL" }) {
  const glyph = kind === "PASS" ? "✓" : kind === "WARN" ? "!" : "✕";
  return (
    <span aria-hidden className="font-mono font-bold">
      {glyph}
    </span>
  );
}

// ---- Empty / Error states --------------------------------------------------
export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/40 px-6 py-10 text-center">
      {icon ? <div className="text-muted">{icon}</div> : null}
      <p className="text-sm font-medium text-text">{title}</p>
      {hint ? <p className="max-w-md text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({
  title,
  detail,
  requestId,
  onRetry,
}: {
  title: string;
  detail?: string;
  requestId?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-lg border border-crimson/50 bg-crimson/10 px-4 py-4"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="font-mono font-bold text-crimson">
          ✕
        </span>
        <p className="text-sm font-semibold text-crimson">{title}</p>
      </div>
      {detail ? <p className="text-xs text-text">{detail}</p> : null}
      {requestId ? (
        <p className="font-mono text-[11px] text-muted">
          X-Request-ID: {requestId}
        </p>
      ) : null}
      {onRetry ? (
        <div>
          <Button size="sm" variant="subtle" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
