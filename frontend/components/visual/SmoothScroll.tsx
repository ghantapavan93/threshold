"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerLenis } from "@/lib/scroll";

/**
 * Site-wide Lenis smooth scroll, wired into GSAP's ticker so ScrollTrigger stays
 * in sync. Fully disabled under prefers-reduced-motion (native scroll only).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // respect the user's setting — no smooth-scroll hijack
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    registerLenis(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  return null;
}
