"use client";

import { useRef, useState, type ElementType, type CSSProperties } from "react";
import { useIsoLayoutEffect } from "@/components/builder/anim";

/* Word-by-word text reveal — each word fades up out of a soft blur, staggered,
   as the line scrolls into view. The premium "appearing out of thin air" feel,
   applied to headings and lead paragraphs.

   Robustness (learned the hard way from the roadmap): text is NEVER left
   hidden. The server/first paint renders every word fully visible, so if JS
   never runs the content is intact. Only after mount, and only when motion is
   allowed, does it briefly hide-then-animate — set before paint via a layout
   effect so there is no flash. Reduced motion renders static. An
   IntersectionObserver drives the reveal, with a 2s timer backstop so a missed
   observer (background tab, refresh hiccup) still shows the text. */

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Forwarded to the wrapper element (e.g. for aria-labelledby targets). */
  id?: string;
  /** Seconds between each word. */
  stagger?: number;
  /** Rise distance in px. */
  y?: number;
  /** Blur-in (heavier; best for headings). */
  blur?: boolean;
  /** Extra delay before the whole line starts, seconds. */
  delay?: number;
};

export function WordReveal({
  text,
  as,
  className,
  id,
  stagger = 0.045,
  y = 16,
  blur = true,
  delay = 0,
}: Props) {
  const Tag = (as ?? "span") as ElementType;
  const ref = useRef<HTMLElement>(null);
  // null = not yet decided (SSR + first paint → fully visible, never hidden).
  const [motion, setMotion] = useState<boolean | null>(null);
  const [play, setPlay] = useState(false);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMotion(false);
      return;
    }
    setMotion(true); // hide-before-paint happens in this same pre-paint commit
    const el = ref.current;
    if (!el) {
      setPlay(true);
      return;
    }
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setPlay(true);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    const backstop = window.setTimeout(reveal, 2000);
    return () => {
      io.disconnect();
      window.clearTimeout(backstop);
    };
  }, []);

  const words = text.split(" ");
  const hidden = motion === true && !play;

  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((w, i) => {
        const style: CSSProperties | undefined =
          motion === true
            ? {
                display: "inline-block",
                willChange: "transform, opacity, filter",
                opacity: hidden ? 0 : 1,
                filter: blur ? (hidden ? "blur(8px)" : "blur(0px)") : undefined,
                transform: hidden ? `translateY(${y}px)` : "translateY(0)",
                transition: `opacity 0.55s ease ${delay + i * stagger}s, filter 0.55s ease ${delay + i * stagger}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay + i * stagger}s`,
              }
            : undefined;
        return (
          <span key={i} className="inline-block whitespace-pre">
            <span style={style}>{w}</span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}
