"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll-triggered reveal. Fades + lifts its content into view once, when it
 * scrolls near the viewport. Under prefers-reduced-motion it renders fully
 * visible with no animation. SSR-safe: content is present in markup; GSAP only
 * augments it on the client.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Never gate content on motion: reduced-motion OR a hidden/background tab
    // renders fully visible with no hide (impeccable: a reveal that never fires
    // must not ship the section blank).
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.visibilityState === "hidden"
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    let played = false;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power3.out", // strong ease-out; entrances feel responsive
          onComplete: () => {
            played = true;
          },
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            once: true,
            onEnter: () => {
              played = true;
            },
          },
        },
      );
    }, el);

    // Short-viewport failsafe: on a small screen an already-in-view element can
    // sit above the trigger line with no scroll room to cross it, leaving it
    // stuck faded. If it's in view but still hidden a beat after mount, reveal
    // it outright — nothing can ship stuck at reduced opacity. Below-fold
    // elements are left alone so they still animate in on scroll.
    const failsafe = window.setTimeout(() => {
      if (played) return;
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView && getComputedStyle(el).visibility === "hidden") {
        gsap.set(el, { autoAlpha: 1, y: 0 });
      }
    }, 800);

    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
