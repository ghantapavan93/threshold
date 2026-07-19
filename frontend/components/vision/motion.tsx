"use client";

/* ────────────────────────────────────────────────────────────────────────────
   /vision — GSAP scroll primitives for the Threshold keynote.

   Everything here is a thin, reusable layer over GSAP + ScrollTrigger:
     • useGsapScene   — element-scoped gsap.matchMedia() with automatic cleanup.
     • MaskedLines    — Awwwards-style line-by-line heading reveal (masked yPercent).
     • ClipReveal     — animated clip-path wipe for panels / illustrations.
     • IllustrationReveal — clip wipe + staggered assembly of an SVG's children.

   Discipline:
     • Every animation is gated behind (prefers-reduced-motion: no-preference).
       Under "reduce" the branch never runs, so the DOM stays in its natural
       (final, fully-visible) state — no pin, no scrub, no hidden content.
     • gsap.matchMedia(root) scopes selectors + reverts ALL tweens/ScrollTriggers
       on unmount or when the media query flips — no leaks.
     • Content is always present in server markup; GSAP only augments on client.
   ──────────────────────────────────────────────────────────────────────────── */

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type DependencyList,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// useLayoutEffect on the client (runs before paint → no reveal flash),
// falls back to useEffect during SSR to avoid the React warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let registered = false;
function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/** Query string that is TRUE only when the user has not asked to reduce motion. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Element-scoped GSAP scene. `build` receives the root element and a
 * gsap.matchMedia() already scoped to it — add media-gated animations via
 * mm.add(query, cb). Cleanup (revert of every tween + ScrollTrigger) is
 * automatic on unmount.
 */
export function useGsapScene<T extends HTMLElement = HTMLDivElement>(
  build: (root: T, mm: gsap.MatchMedia) => void,
  deps: DependencyList = [],
): RefObject<T> {
  const ref = useRef<T>(null);
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    registerGsap();
    const mm = gsap.matchMedia(root);
    build(root, mm);
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

// ── MaskedLines ──────────────────────────────────────────────────────────────
// Renders a heading (or any block) whose lines each sit in an overflow-hidden
// mask; each inner line reveals from below with a staggered translateY. Accepts
// ReactNode lines so inline gradient spans are preserved.
export function MaskedLines({
  as = "h2",
  lines,
  className,
  id,
  start = "top 85%",
  stagger = 0.12,
  duration = 0.95,
  y = 120,
}: {
  as?: ElementType;
  lines: ReactNode[];
  className?: string;
  id?: string;
  start?: string;
  stagger?: number;
  duration?: number;
  y?: number;
}) {
  const ref = useGsapScene<HTMLElement>((root, mm) => {
    mm.add(MOTION_OK, () => {
      const inners = root.querySelectorAll<HTMLElement>("[data-mask-line]");
      gsap.from(inners, {
        yPercent: y,
        duration,
        ease: "power4.out",
        stagger,
        scrollTrigger: { trigger: root, start, once: true },
      });
    });
  });

  const children = lines.map((line, i) =>
    createElement(
      "span",
      { key: i, className: "block overflow-hidden" },
      createElement(
        "span",
        { "data-mask-line": true, className: "block will-change-transform" },
        line,
      ),
    ),
  );

  return createElement(as, { ref, className, id }, children);
}

// ── ClipReveal ───────────────────────────────────────────────────────────────
// Wipes its content in via an animated clip-path inset. Direction configurable.
const CLIP_FROM = {
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
  top: "inset(0 0 100% 0)",
  bottom: "inset(100% 0 0 0)",
} as const;

export function ClipReveal({
  children,
  className,
  from = "left",
  start = "top 82%",
  duration = 1,
}: {
  children: ReactNode;
  className?: string;
  from?: keyof typeof CLIP_FROM;
  start?: string;
  duration?: number;
}) {
  const ref = useGsapScene<HTMLDivElement>((root, mm) => {
    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        root,
        { clipPath: CLIP_FROM[from] },
        {
          clipPath: "inset(0 0 0 0)",
          duration,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start, once: true },
        },
      );
    });
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ── IllustrationReveal ───────────────────────────────────────────────────────
// Clip-wipes an inline SVG in, then staggers its top-level children so the
// diagram "assembles" itself as it scrolls into view.
export function IllustrationReveal({
  children,
  className,
  from = "left",
  start = "top 80%",
}: {
  children: ReactNode;
  className?: string;
  from?: keyof typeof CLIP_FROM;
  start?: string;
}) {
  const ref = useGsapScene<HTMLDivElement>((root, mm) => {
    mm.add(MOTION_OK, () => {
      const svg = root.querySelector("svg");
      const kids = svg ? Array.from(svg.children) : [];
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start, once: true },
      });
      tl.fromTo(
        root,
        { clipPath: CLIP_FROM[from] },
        { clipPath: "inset(0 0 0 0)", duration: 0.9, ease: "power3.out" },
      );
      if (kids.length) {
        tl.from(
          kids,
          { autoAlpha: 0, y: 12, duration: 0.5, ease: "power2.out", stagger: 0.045 },
          "-=0.55",
        );
      }
    });
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
