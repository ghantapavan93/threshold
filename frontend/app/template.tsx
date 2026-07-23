"use client";

import { motion, useReducedMotion } from "framer-motion";

/* A gentle cross-route fade. template.tsx re-mounts on every navigation (unlike
   layout.tsx), so this runs each time the route changes. Opacity only — no
   transform — so it never creates a containing block that would break the pages'
   position: sticky headers. Under reduced motion it passes children straight
   through with no animation. */

export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
