"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, useIsoLayoutEffect } from "./anim";

/* ────────────────────────────────────────────────────────────────────────────
   Builder scene illustrations — ORIGINAL animated SVG diagrams (no external
   images/photos, no fabricated metrics). Each visualizes one "What you'll do"
   dimension and loops subtly (video-like) via a GSAP timeline that only plays
   while the illustration is on screen. Under prefers-reduced-motion no loop runs
   — the static SVG markup is already a complete, meaningful final frame.
   Colours are the MASTER tokens (theme-aware). All are decorative (aria-hidden);
   the surrounding scene copy carries the meaning.
   ──────────────────────────────────────────────────────────────────────────── */

const TEAL = "var(--c-teal)";
const CRIMSON = "var(--c-crimson)";
const AMBER = "var(--c-amber)";
const BLUE = "var(--c-offer-blue)";
const MUTED = "var(--c-muted)";
const BORDER = "var(--c-border-strong)";

/** Play a repeating timeline only while `root` is in view; pause otherwise. */
function playInView(root: Element, tl: gsap.core.Timeline) {
  tl.pause();
  ScrollTrigger.create({
    trigger: root,
    start: "top 95%",
    end: "bottom 5%",
    onToggle: (self) => {
      if (self.isActive) tl.play();
      else tl.pause();
    },
  });
}

/** Shared effect wiring: guard reduced-motion, scope to the svg, build + revert. */
function useSceneLoop(build: (scope: SVGSVGElement) => void) {
  const ref = useRef<SVGSVGElement>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => build(el), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

const svgBase = "h-auto w-full";

// ── 1. Decision-gate flow ────────────────────────────────────────────────────
export function DecisionGateScene({ className }: { className?: string }) {
  const ref = useSceneLoop((el) => {
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    // Three tokens ride their lanes toward the gate; the middle one fails closed.
    tl.fromTo(
      el.querySelectorAll<SVGElement>("[data-tok]"),
      { attr: { cx: 24 }, opacity: 0 },
      { attr: { cx: 196 }, opacity: 1, duration: 1.4, stagger: 0.18 },
    )
      .to(el.querySelectorAll<SVGElement>("[data-pass]"), { attr: { cx: 372 }, opacity: 0, duration: 1.2 }, ">-0.2")
      .fromTo(
        el.querySelector<SVGElement>("[data-fail]"),
        { scale: 0.6, transformOrigin: "center", opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4 },
        "<",
      )
      .to({}, { duration: 0.6 });
    gsap.to(el.querySelector<SVGElement>("[data-gate]"), {
      opacity: 0.55,
      repeat: -1,
      yoyo: true,
      duration: 1.6,
      ease: "sine.inOut",
    });
    playInView(el, tl);
  });

  const lanes = [64, 110, 156];
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 400 220" className={`${svgBase} ${className ?? ""}`} fill="none">
      <ellipse cx="205" cy="110" rx="120" ry="96" fill={TEAL} opacity="0.06" />
      {lanes.map((y, i) => {
        const danger = i === 1;
        return (
          <g key={y}>
            <line x1="16" y1={y} x2="196" y2={y} stroke={danger ? CRIMSON : MUTED} strokeOpacity={danger ? 0.5 : 0.3} strokeWidth="1.5" strokeDasharray="3 6" />
            <circle data-tok data-pass={!danger ? "" : undefined} data-fail={danger ? "" : undefined} cx="120" cy={y} r="4" fill={danger ? CRIMSON : TEAL} />
            {!danger && (
              <>
                <line x1="212" y1={y} x2="372" y2={y} stroke={TEAL} strokeOpacity="0.45" strokeWidth="1.5" />
                <path d={`M366 ${y - 4} l4 4 l-4 4`} stroke={TEAL} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
            {danger && (
              <g transform={`translate(232 ${y})`}>
                <line x1="-20" y1="0" x2="0" y2="0" stroke={CRIMSON} strokeWidth="1.5" />
                <circle r="9" fill="none" stroke={CRIMSON} strokeWidth="1.6" />
                <line x1="-4" y1="-4" x2="4" y2="4" stroke={CRIMSON} strokeWidth="1.6" />
                <line x1="4" y1="-4" x2="-4" y2="4" stroke={CRIMSON} strokeWidth="1.6" />
                <text x="18" y="4" fontFamily="var(--font-sans)" fontSize="9" fill={CRIMSON}>No Offer</text>
              </g>
            )}
          </g>
        );
      })}
      <rect data-gate x="200" y="30" width="10" height="160" rx="5" fill={TEAL} opacity="0.9" />
    </svg>
  );
}

// ── 2. Tool constellation ────────────────────────────────────────────────────
export function ToolConstellationScene({ className }: { className?: string }) {
  const nodes = [
    { x: 70, y: 60 },
    { x: 150, y: 40 },
    { x: 250, y: 56 },
    { x: 330, y: 74 },
    { x: 110, y: 130 },
    { x: 200, y: 150 },
    { x: 300, y: 140 },
    { x: 200, y: 96 },
  ];
  const links: [number, number][] = [
    [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [0, 4], [1, 2], [5, 6],
  ];
  const ref = useSceneLoop((el) => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    tl.fromTo(
      el.querySelectorAll<SVGElement>("[data-node]"),
      { opacity: 0.35, transformOrigin: "center" },
      { opacity: 1, duration: 0.9, stagger: { each: 0.14, from: "center" } },
    );
    gsap.fromTo(
      el.querySelectorAll<SVGElement>("[data-link]"),
      { opacity: 0.08 },
      { opacity: 0.4, duration: 1.4, stagger: 0.1, repeat: -1, yoyo: true, ease: "sine.inOut" },
    );
    playInView(el, tl);
  });
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 400 200" className={`${svgBase} ${className ?? ""}`} fill="none">
      {links.map(([a, b], i) => {
        const na = nodes[a]!;
        const nb = nodes[b]!;
        return <line key={i} data-link x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={TEAL} strokeOpacity="0.3" strokeWidth="1" />;
      })}
      {nodes.map((n, i) => {
        const hub = i === 7;
        return (
          <g key={i} data-node>
            <circle cx={n.x} cy={n.y} r={hub ? 8 : 4.5} fill={hub ? TEAL : i % 3 === 0 ? BLUE : TEAL} />
            {hub && <circle cx={n.x} cy={n.y} r="13" fill="none" stroke={TEAL} strokeOpacity="0.5" strokeWidth="1" />}
          </g>
        );
      })}
    </svg>
  );
}

// ── 3. Lifecycle timeline (idea → prototype → tests → ship → recover) ─────────
export function LifecycleTimelineScene({ className }: { className?: string }) {
  const stops = ["idea", "prototype", "tests", "ship", "recover"];
  const ref = useSceneLoop((el) => {
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    tl.fromTo(
      el.querySelector<SVGElement>("[data-pulse]"),
      { attr: { cx: 40 }, opacity: 0 },
      { attr: { cx: 660 }, opacity: 1, duration: 3.4 },
    ).to(el.querySelector<SVGElement>("[data-pulse]"), { opacity: 0, duration: 0.4 });
    playInView(el, tl);
  });
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 700 90" className={`${svgBase} ${className ?? ""}`} fill="none">
      <line x1="40" y1="40" x2="660" y2="40" stroke={BORDER} strokeWidth="2" />
      <line x1="40" y1="40" x2="660" y2="40" stroke={TEAL} strokeOpacity="0.4" strokeWidth="2" strokeDasharray="2 8" />
      {stops.map((s, i) => {
        const x = 40 + (i * 620) / (stops.length - 1);
        return (
          <g key={s}>
            <circle cx={x} cy="40" r="6" fill="var(--c-base)" stroke={TEAL} strokeWidth="2" />
            <text x={x} y="66" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="11" fill={MUTED}>{s}</text>
          </g>
        );
      })}
      <circle data-pulse cx="40" cy="40" r="5" fill={TEAL} />
    </svg>
  );
}

// ── 4. Collaboration loop (PM ⇄ Design ⇄ Eng ⇄ Customer) ─────────────────────
export function CollaborationLoopScene({ className }: { className?: string }) {
  const cx = 150;
  const cy = 110;
  const r = 78;
  const roles = ["PM", "Design", "Eng", "Customer"];
  const pts = roles.map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const ref = useSceneLoop((el) => {
    const orbit = el.querySelector<SVGElement>("[data-orbit]");
    if (orbit) {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(orbit, { rotation: 360, transformOrigin: `${cx}px ${cy}px`, duration: 6, ease: "none" });
      playInView(el, tl);
    }
    gsap.fromTo(
      el.querySelectorAll<SVGElement>("[data-role]"),
      { opacity: 0.5 },
      { opacity: 1, duration: 1.1, stagger: 0.4, repeat: -1, yoyo: true, ease: "sine.inOut" },
    );
  });
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 300 220" className={`${svgBase} ${className ?? ""}`} fill="none">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={BORDER} strokeWidth="1.5" strokeDasharray="4 6" />
      <g data-orbit>
        <circle cx={cx} cy={cy - r} r="5" fill={TEAL} />
      </g>
      {pts.map((p, i) => (
        <g key={i} data-role>
          <circle cx={p.x} cy={p.y} r="20" fill="var(--c-surface-2)" stroke={i % 2 ? BLUE : TEAL} strokeWidth="1.5" />
          <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fontWeight="600" fill="var(--c-text)">
            {roles[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── 5. Scaling pipeline + latency meter ──────────────────────────────────────
export function ScalingPipelineScene({ className }: { className?: string }) {
  const workers = [46, 86, 126, 166];
  const ref = useSceneLoop((el) => {
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    tl.fromTo(
      el.querySelectorAll<SVGElement>("[data-packet]"),
      { attr: { cx: 40 }, opacity: 0 },
      { attr: { cx: 360 }, opacity: 1, duration: 1.8, stagger: 0.22 },
    ).to(el.querySelectorAll<SVGElement>("[data-packet]"), { opacity: 0, duration: 0.3 }, ">-0.4");
    // latency needle wobbles but holds in the green band
    gsap.to(el.querySelector<SVGElement>("[data-needle]"), {
      rotation: 14,
      transformOrigin: "12px 12px",
      repeat: -1,
      yoyo: true,
      duration: 1.3,
      ease: "sine.inOut",
    });
    playInView(el, tl);
  });
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 400 220" className={`${svgBase} ${className ?? ""}`} fill="none">
      {/* single input lane fanning into many workers */}
      <circle cx="24" cy="106" r="7" fill={BLUE} />
      {workers.map((y, i) => (
        <g key={y}>
          <path d={`M31 106 C 90 106, 90 ${y}, 150 ${y}`} stroke={BORDER} strokeWidth="1.4" fill="none" />
          <rect x="150" y={y - 10} width="26" height="20" rx="4" fill="var(--c-surface-2)" stroke={TEAL} strokeWidth="1.2" />
          <path d={`M176 ${y} C 210 ${y}, 210 106, 250 106`} stroke={BORDER} strokeWidth="1.4" fill="none" />
          <circle data-packet cx="40" cy={106} r="3.5" fill={i % 2 ? TEAL : BLUE} opacity="0" />
        </g>
      ))}
      <circle cx="258" cy="106" r="7" fill={TEAL} />
      <text x="163" y="200" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="10" fill={MUTED}>1 lane → N workers</text>

      {/* latency meter */}
      <g transform="translate(300 76)">
        <path d="M0 60 A 60 60 0 0 1 120 60" fill="none" stroke={BORDER} strokeWidth="4" />
        <path d="M0 60 A 60 60 0 0 1 84 12" fill="none" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
        <g data-needle transform="translate(48 48)">
          <line x1="12" y1="12" x2="-22" y2="-14" stroke="var(--c-text)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill="var(--c-text)" />
        </g>
        <text x="60" y="84" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="10" fill={TEAL}>p99 held</text>
      </g>
    </svg>
  );
}

// ── 6. Incrementality holdout viz (treatment vs control, net-new gap) ────────
export function IncrementalityScene({ className }: { className?: string }) {
  const ref = useSceneLoop((el) => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.6 });
    tl.fromTo(
      el.querySelector<SVGElement>("[data-gap]"),
      { opacity: 0.25 },
      { opacity: 0.7, duration: 1.4, ease: "sine.inOut" },
    );
    playInView(el, tl);
  });
  // Honest, qualitative bars — treatment modestly above control; the shaded band
  // between them is the *net-new* the holdout measures. No axis values, no
  // hockey-stick.
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 400 220" className={`${svgBase} ${className ?? ""}`} fill="none">
      <line x1="40" y1="184" x2="372" y2="184" stroke={BORDER} strokeWidth="1.5" />
      {/* control (holdout) */}
      <rect x="96" y="118" width="70" height="66" rx="4" fill={MUTED} opacity="0.28" stroke={MUTED} strokeOpacity="0.5" />
      <text x="131" y="204" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fill={MUTED}>control</text>
      {/* treatment */}
      <rect x="234" y="86" width="70" height="98" rx="4" fill={TEAL} opacity="0.24" stroke={TEAL} strokeOpacity="0.7" />
      <text x="269" y="204" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fill={TEAL}>treatment</text>
      {/* the net-new gap */}
      <g data-gap>
        <line x1="131" y1="118" x2="269" y2="118" stroke={AMBER} strokeWidth="1.4" strokeDasharray="4 4" />
        <rect x="322" y="86" width="26" height="32" rx="3" fill={AMBER} opacity="0.3" stroke={AMBER} strokeOpacity="0.7" />
        <text x="335" y="76" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fill={AMBER}>net-new</text>
      </g>
      <text x="206" y="30" textAnchor="middle" fontFamily="var(--font-mono, monospace)" fontSize="10" fill={MUTED}>measured by a holdout — never claimed</text>
    </svg>
  );
}
