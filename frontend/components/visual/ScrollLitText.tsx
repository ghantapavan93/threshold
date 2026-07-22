"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/* Scroll-word-brightening — each word lifts from dim to full as the paragraph
   scrolls through the viewport (the SSC signature). The line reads like it's
   being written as you arrive at it. Under reduced motion every word is simply
   at full brightness. Plain string in, no markup interpretation.

   `<strong>` emphasis is preserved by passing children as an array of strings
   and ReactNodes; anything non-string is rendered lit (never dimmed) so nested
   emphasis stays legible. */

function words(children: ReactNode): (string | ReactNode)[] {
  const out: (string | ReactNode)[] = [];
  const arr = Array.isArray(children) ? children : [children];
  arr.forEach((node) => {
    if (typeof node === "string") {
      node.split(/(\s+)/).forEach((w) => out.push(w));
    } else {
      out.push(node);
    }
  });
  return out;
}

export function ScrollLitText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // start lighting as the paragraph enters the lower third, finish before it
    // reaches the middle — the whole line is lit while it's still comfortably read.
    offset: ["start 0.85", "start 0.35"],
  });

  const chunks = words(children);
  // whitespace tokens don't get their own animation, so count only real words
  const litIndex = chunks.filter((c) => typeof c !== "string" || c.trim());
  const n = Math.max(litIndex.length, 1);

  if (reduced) {
    return (
      <p ref={ref} className={className}>
        {children}
      </p>
    );
  }

  let wi = -1;
  return (
    <p ref={ref} className={className}>
      {chunks.map((c, i) => {
        // whitespace — render as-is, no per-word wrapper
        if (typeof c === "string" && !c.trim()) return <span key={i}>{c}</span>;
        wi += 1;
        return (
          <Word key={i} progress={scrollYProgress} index={wi} total={n}>
            {c}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  index,
  total,
}: {
  children: ReactNode;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
  total: number;
}) {
  // each word owns a small slice of the scroll range, in reading order, with a
  // little overlap so the sweep is continuous rather than stepped.
  const start = (index / total) * 0.9;
  const end = start + 0.28;
  const opacity = useTransform(progress, [start, end], [0.28, 1]);
  return (
    <motion.span style={{ opacity }} className="transition-none">
      {children}
    </motion.span>
  );
}
