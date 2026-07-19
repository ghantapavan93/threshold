/**
 * Shared scroll controller. When Lenis smooth-scroll is active it drives the
 * animation (so programmatic scrolls from the self-driving demo / Scenario
 * Library stay smooth and don't fight Lenis); otherwise it falls back to native
 * scrollIntoView. Fully honors prefers-reduced-motion.
 */

type LenisLike = {
  scrollTo: (target: HTMLElement | number | string, opts?: { offset?: number }) => void;
};

let lenis: LenisLike | null = null;

export function registerLenis(instance: LenisLike | null): void {
  lenis = instance;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Smooth-scroll to an element by id, respecting Lenis and reduced-motion. */
export function scrollToId(id: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = prefersReducedMotion();
  if (lenis && !reduced) {
    lenis.scrollTo(el, { offset: -80 });
    return;
  }
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
