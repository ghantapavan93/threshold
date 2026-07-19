"use client";

import {
  type ElementType,
  type ReactNode,
  type Ref,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ────────────────────────────────────────────────────────────────────────────
   Builder scene primitives — GSAP + ScrollTrigger building blocks used across
   the /builder cinematic page.

   Discipline shared by every primitive here:
   • Register ScrollTrigger locally (idempotent).
   • EVERY animation is gated on prefers-reduced-motion — reduced users get the
     final/static state instantly (initial DOM markup is already the final state;
     GSAP only sets the "from" state when motion is allowed, and does so inside a
     layout effect so there is no first-paint flash).
   • All ScrollTriggers live inside a gsap.context and are reverted on unmount.
   ──────────────────────────────────────────────────────────────────────────── */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** useLayoutEffect on the client (set "from" states before paint → no flash),
 *  useEffect on the server (avoids the SSR warning). */
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ── Eyebrow (shared small UI, no animation of its own) ───────────────────────
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface-2/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted backdrop-blur">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal" />
      {children}
    </span>
  );
}

// ── MaskText — Awwwards-style masked, word-by-word reveal ────────────────────
type Segment = { text: string; className?: string };

/**
 * Splits its text into words, each wrapped in an overflow-hidden mask with an
 * inner span that translates up from below (yPercent) with a stagger. Renders
 * the semantic tag you pass (`as`) so headings keep their level + id.
 *
 * `manual` mode renders the masked words but runs NO ScrollTrigger of its own —
 * a parent scene (e.g. the pinned hero) owns the reveal timeline and drives the
 * `[data-w]` inner spans directly.
 */
export function MaskText({
  segments,
  as = "span",
  id,
  className,
  wordClassName,
  start = "top 85%",
  stagger = 0.05,
  duration = 0.9,
  delay = 0,
  manual = false,
}: {
  segments: Segment[];
  as?: ElementType;
  id?: string;
  className?: string;
  wordClassName?: string;
  start?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  manual?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    if (manual) return;
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const inners = el.querySelectorAll<HTMLElement>("[data-w]");
    const ctx = gsap.context(() => {
      gsap.set(inners, { yPercent: 120, opacity: 0 });
      gsap.to(inners, {
        yPercent: 0,
        opacity: 1,
        duration,
        delay,
        ease: "power4.out",
        stagger,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [manual, start, stagger, duration, delay]);

  const Tag = as;
  let key = 0;
  return (
    <Tag ref={ref as Ref<HTMLElement>} id={id} className={className} data-mask>
      {segments.map((seg) =>
        seg.text.split(/(\s+)/).map((tok) => {
          if (tok === "") return null;
          if (/^\s+$/.test(tok)) return <span key={key++}> </span>;
          return (
            <span
              key={key++}
              className="inline-block overflow-hidden align-baseline"
              style={{ paddingBottom: "0.08em" }}
            >
              <span
                data-w
                className={cx("inline-block will-change-transform", seg.className, wordClassName)}
              >
                {tok}
              </span>
            </span>
          );
        }),
      )}
    </Tag>
  );
}

// ── ClipReveal — clip-path wipe + lift on scroll-in ──────────────────────────
export function ClipReveal({
  children,
  className,
  delay = 0,
  y = 28,
  scale = 1,
  start = "top 88%",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: "inset(0 0 100% 0)", y, scale, autoAlpha: 0 },
        {
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.95,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, scale, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ── StaggerGroup — reveal direct children in sequence on scroll-in ───────────
export function StaggerGroup({
  children,
  className,
  y = 26,
  stagger = 0.09,
  start = "top 85%",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const items = Array.from(el.children) as HTMLElement[];
    if (items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { autoAlpha: 0, y });
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [y, stagger, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
