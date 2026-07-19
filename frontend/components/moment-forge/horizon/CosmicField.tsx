"use client";

import { useEffect, useRef } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   CosmicField — a GPU-light starfield with a slow UPWARD drift ("first-party
   signals rising toward the moment"). Forks LivingBackground's proven primitives:
   DPR-capped canvas, single rAF, no per-frame allocation, visibilitychange pause,
   hard particle cap. Under prefers-reduced-motion it paints ONE static frame and
   never runs rAF. Colours are MASTER tokens; band-scoped, aria-hidden.
   ──────────────────────────────────────────────────────────────────────────── */

type P = { x: number; y: number; vy: number; r: number; c: string };

const COLORS = ["34, 230, 200", "91, 140, 255", "230, 234, 242"];

export function CosmicField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const cnv = canvas;
    const ctx = context;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let w = 0;
    let h = 0;
    let dpr = 1;
    let pts: P[] = [];
    let raf = 0;
    let running = false;

    function count() {
      const target = Math.round((w * h) / 22000);
      return Math.max(30, Math.min(90, target));
    }
    function seed() {
      pts = Array.from({ length: count() }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vy: -(0.05 + Math.random() * 0.07),
        r: 0.4 + Math.random() * 1.0,
        c: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      }));
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cnv.clientWidth;
      h = cnv.clientHeight;
      cnv.width = Math.floor(w * dpr);
      cnv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    function draw(moving: boolean) {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]!;
        if (moving) {
          p.y += p.vy;
          if (p.y < -4) {
            p.y = h + 4;
            p.x = Math.random() * w;
          }
        }
        const alpha = 0.3 + (p.r / 1.4) * 0.3;
        ctx.fillStyle = `rgba(${p.c}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function loop() {
      draw(true);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
    function onVis() {
      if (document.hidden) stop();
      else if (!reduce.matches) start();
    }
    function onResize() {
      resize();
      if (reduce.matches) draw(false);
    }
    function onPref() {
      if (reduce.matches) {
        stop();
        draw(false);
      } else start();
    }

    resize();
    if (reduce.matches) draw(false);
    else start();

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    reduce.addEventListener("change", onPref);
    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      reduce.removeEventListener("change", onPref);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
