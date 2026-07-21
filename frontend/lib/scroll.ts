/**
 * Shared scroll controller. When Lenis smooth-scroll is active it drives the
 * animation (so programmatic scrolls from the self-driving demo / Scenario
 * Library / walkthrough stay smooth and don't fight Lenis); otherwise it falls
 * back to native scrolling. Fully honors prefers-reduced-motion.
 *
 * The target is positioned in the visible BAND between the sticky header (top)
 * and the fixed pipeline rail (bottom) — a short section is centred in that band,
 * a tall one is aligned just below the header — so neither chrome ever covers the
 * section the walkthrough just landed on. Both offsets are measured live, so it
 * adapts to a wrapped header or the taller mobile rail.
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

function measure(selector: string): number {
  const el = document.querySelector(selector);
  return el instanceof HTMLElement ? el.getBoundingClientRect().height : 0;
}

/** Where, in viewport pixels from the top, `el` should sit: centred in the
 *  header→rail band if it fits, else aligned just below the header. */
function desiredViewportTop(el: HTMLElement): number {
  const headerH = measure("header") || 64; // sticky top chrome
  const railH = measure("[data-pipeline-rail]"); // fixed bottom chrome (0 when hidden)
  const topGap = headerH + 12;
  const bottomGap = railH + 12;
  const band = Math.max(0, window.innerHeight - topGap - bottomGap);
  const h = el.getBoundingClientRect().height;
  return h <= band ? topGap + (band - h) / 2 : topGap;
}

/** Smooth-scroll to an element by id, clearing both the header and the rail. */
export function scrollToId(id: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = prefersReducedMotion();
  const offset = desiredViewportTop(el);
  if (lenis && !reduced) {
    // Hand Lenis the element + offset so it resolves the target in its own scroll
    // model (an absolute Y would be wrong under transform-based scrolling).
    lenis.scrollTo(el, { offset: -offset });
    return;
  }
  // Native fallback: window.scrollY is authoritative here, so absolute Y is fine.
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, y), behavior: reduced ? "auto" : "smooth" });
}
