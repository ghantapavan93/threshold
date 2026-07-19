"use client";

import { useEffect, useRef } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   Living "Transaction Moment" background — a GPU-light particle network drawn
   on a fixed, pointer-none, low-opacity canvas behind ALL content. Feels alive
   like a background video, but bundles no video/image files.

   Discipline:
   • capped particles, single rAF loop, no per-frame allocations
   • fully frozen under prefers-reduced-motion (renders one static frame)
   • paused when the tab is hidden (visibilitychange)
   • low opacity + soft colors so text over it always stays readable
   ──────────────────────────────────────────────────────────────────────────── */

type P = { x: number; y: number; vx: number; vy: number; r: number };

const TEAL = "34, 230, 200";
const BLUE = "91, 140, 255";
const CRIMSON = "255, 77, 106";

export function LivingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Non-null locals so nested closures keep the narrowed types under strict TS.
    const cnv = canvas;
    const ctx = context;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: P[] = [];
    let raf = 0;
    let running = false;

    const LINK_DIST = 130;

    function particleCount() {
      // Density scaled to viewport, hard-capped so it stays cheap on any device.
      const target = Math.round((width * height) / 26000);
      return Math.max(24, Math.min(72, target));
    }

    function seed() {
      const n = particleCount();
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 0.6 + Math.random() * 1.4,
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cnv.width = Math.floor(width * dpr);
      cnv.height = Math.floor(height * dpr);
      cnv.style.width = `${width}px`;
      cnv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function nodeColor(i: number) {
      // Deterministic teal/blue/crimson mix — crimson stays rare (the "risk").
      const m = i % 10;
      if (m === 0) return CRIMSON;
      if (m < 4) return BLUE;
      return TEAL;
    }

    function draw(moving: boolean) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        if (moving) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -20) p.x = width + 20;
          else if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          else if (p.y > height + 20) p.y = -20;
        }
      }

      // Links first (under the nodes).
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
            ctx.strokeStyle = `rgba(${TEAL}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes.
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        ctx.fillStyle = `rgba(${nodeColor(i)}, 0.55)`;
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

    function onVisibility() {
      if (document.hidden) stop();
      else if (!reduce.matches) start();
    }

    function onResize() {
      resize();
      if (reduce.matches) draw(false);
    }

    function onMotionPref() {
      if (reduce.matches) {
        stop();
        draw(false); // one static frame
      } else {
        start();
      }
    }

    resize();

    if (reduce.matches) {
      draw(false); // static, no animation
    } else {
      start();
    }

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onMotionPref);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onMotionPref);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.5 }}
    />
  );
}
