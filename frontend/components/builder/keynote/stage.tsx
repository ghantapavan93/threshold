"use client";

import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SceneMedia } from "@/components/visual/SceneMedia";

/* ────────────────────────────────────────────────────────────────────────────
   Keynote stage — the cinematic primitives for the Builder keynote, in the
   ShelfTrace grammar but re-grounded in Threshold's tokens and laws:
   • every environment is code-drawn (SVG/CSS) so it is stunning with zero media
     files; a generated ambient clip layers on top when it lands in /media.
   • every motion is spring-based and gated on prefers-reduced-motion.
   • legibility never depends on the backdrop — a base-color scrim always sits
     between the environment and the copy.
   ──────────────────────────────────────────────────────────────────────────── */

export type Accent = "teal" | "crimson" | "amber" | "offer-blue";

const ACCENT_VAR: Record<Accent, string> = {
  teal: "var(--c-teal)",
  crimson: "var(--c-crimson)",
  amber: "var(--c-amber)",
  "offer-blue": "var(--c-offer-blue)",
};
const ACCENT_TEXT: Record<Accent, string> = {
  teal: "text-teal",
  crimson: "text-crimson",
  amber: "text-amber",
  "offer-blue": "text-offer-blue",
};
// CSS custom-property that holds the accent's "r g b" channels (theme-aware).
const ACCENT_CHANNELS: Record<Accent, string> = {
  teal: "--c-teal-c",
  crimson: "--c-crimson-c",
  amber: "--c-amber-c",
  "offer-blue": "--c-offer-blue-c",
};

const EASE = [0.16, 1, 0.3, 1] as const;

// ── The scroll spine — every chapter that exists, in order ──────────────────
export type ChapterDef = { n: string; label: string; anchor: string };
export const CHAPTERS: ChapterDef[] = [
  { n: "00", label: "The Moment", anchor: "kc-moment" },
  { n: "01", label: "The Change", anchor: "kc-change" },
  { n: "02", label: "The Customers", anchor: "kc-customers" },
  { n: "03", label: "The Failure", anchor: "kc-failure" },
  { n: "04", label: "The Machine", anchor: "kc-machine" },
  { n: "05", label: "The Evidence", anchor: "kc-evidence" },
  { n: "06", label: "The Experiment", anchor: "kc-experiment" },
  { n: "07", label: "The Frontier", anchor: "kc-frontier" },
  { n: "08", label: "The Hand-off", anchor: "kc-handoff" },
  { n: "09", label: "The Afterglow", anchor: "kc-afterglow" },
];

// ── Pill ────────────────────────────────────────────────────────────────────
export function Pill({ children, accent = "teal" }: { children: ReactNode; accent?: Accent }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${ACCENT_TEXT[accent]}`}
      style={{ borderColor: `color-mix(in srgb, ${ACCENT_VAR[accent]} 45%, transparent)`, background: `color-mix(in srgb, ${ACCENT_VAR[accent]} 8%, transparent)` }}
    >
      {children}
    </span>
  );
}

// ── Chapter rail — sticky left dot-nav with scroll-spy ──────────────────────
export function ChapterRail() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      let idx = 0;
      for (let i = 0; i < CHAPTERS.length; i++) {
        const c = CHAPTERS[i];
        if (!c) continue;
        const el = document.getElementById(c.anchor);
        if (!el) continue;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.4) idx = i;
      }
      setActive(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav
      aria-label="Keynote chapters"
      className="pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ol className="pointer-events-auto flex flex-col gap-3 rounded-full border border-border/70 bg-base/50 px-3 py-4 backdrop-blur-xl">
        {CHAPTERS.map((c, i) => {
          const isActive = i === active;
          return (
            <li key={c.anchor} className="group relative">
              <a href={`#${c.anchor}`} className="flex items-center gap-3" aria-current={isActive ? "true" : undefined}>
                <span
                  className={`block h-2.5 w-2.5 rounded-full border transition-all duration-200 ${
                    isActive
                      ? "border-teal bg-teal shadow-[0_0_10px_var(--c-teal)]"
                      : i < active
                        ? "border-teal/50 bg-teal/40"
                        : "border-muted/40 bg-transparent group-hover:border-text"
                  }`}
                />
                <span
                  className={`absolute left-7 origin-left whitespace-nowrap rounded-md border border-border/70 bg-base/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur transition-opacity duration-200 ${
                    isActive ? "text-teal opacity-100" : "text-muted opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {c.n} · {c.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Chapter marker — big number + rule + label, revealed on enter ───────────
export function ChapterMarker({ n, label, accent = "teal" }: { n: string; label: string; accent?: Accent }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30% 0px -50% 0px" });
  const reduced = useReducedMotion();
  return (
    <div ref={ref} className="relative mx-auto max-w-6xl px-5 pt-14 sm:px-8 sm:pt-20">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex items-center gap-4"
      >
        <span
          className="font-mono text-[clamp(38px,5vw,68px)] font-semibold leading-none tracking-tightest"
          style={{ color: `color-mix(in srgb, ${ACCENT_VAR[accent]} 80%, transparent)`, fontFamily: "var(--font-display)" }}
        >
          {n}
        </span>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{ background: `linear-gradient(to right, color-mix(in srgb, ${ACCENT_VAR[accent]} 50%, transparent), var(--c-border), transparent)` }}
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted">{label}</span>
      </motion.div>
    </div>
  );
}

// ── Cursor spotlight — a radial glow that follows the pointer ───────────────
export function CursorSpotlight({ children, accent = "teal" }: { children: ReactNode; accent?: Accent }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const sx = useSpring(50, { stiffness: 120, damping: 20 });
  const sy = useSpring(50, { stiffness: 120, damping: 20 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    sx.set(((e.clientX - r.left) / r.width) * 100);
    sy.set(((e.clientY - r.top) / r.height) * 100);
  };
  const bg = useTransform(
    [sx, sy],
    ([x, y]) => `radial-gradient(440px circle at ${x}% ${y}%, color-mix(in srgb, ${ACCENT_VAR[accent]} 14%, transparent), transparent 65%)`,
  );
  return (
    <div ref={wrapRef} onMouseMove={onMove} className="relative">
      <motion.div aria-hidden style={{ background: bg }} className="pointer-events-none absolute inset-0 -z-10" />
      {children}
    </div>
  );
}

// ── Ambient motes — a GPU-light accent-tinted drift layer ───────────────────
// One rAF loop, ≤44 particles, DPR-aware. Mounts only near the viewport and
// pauses off-screen; absent entirely under reduced motion (purely atmospheric).
function AmbientMotes({ accent }: { accent: Accent }) {
  const reduced = useReducedMotion();
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => setNear(e[0]?.isIntersecting ?? false), {
      rootMargin: "10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !near) return;
    const canvas = canvasRef.current;
    const holder = holderRef.current;
    if (!canvas || !holder) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const channels = getComputedStyle(document.documentElement)
      .getPropertyValue(ACCENT_CHANNELS[accent])
      .trim() || "34 230 200";
    const [r, g, b] = channels.split(/\s+/).map(Number);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      const rect = holder.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Deterministic-ish spread; motion is slow and calm.
    const N = 44;
    const dots = Array.from({ length: N }, (_, i) => ({
      x: ((i * 97) % 100) / 100,
      y: ((i * 53) % 100) / 100,
      r: 0.6 + ((i * 31) % 100) / 100 * 1.6,
      vy: -(0.04 + ((i * 17) % 100) / 100 * 0.06),
      vx: (((i * 7) % 100) / 100 - 0.5) * 0.03,
      a: 0.15 + ((i * 23) % 100) / 100 * 0.35,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx / 100;
        d.y += d.vy / 100;
        if (d.y < -0.05) d.y = 1.05;
        if (d.x < -0.05) d.x = 1.05;
        if (d.x > 1.05) d.x = -0.05;
        const px = d.x * w;
        const py = d.y * h;
        ctx.beginPath();
        ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${d.a})`;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${d.a})`;
        ctx.shadowBlur = d.r * 4;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [accent, near, reduced]);

  return (
    <div ref={holderRef} aria-hidden className="absolute inset-0">
      {!reduced && near ? <canvas ref={canvasRef} className="absolute inset-0" /> : null}
    </div>
  );
}

// ── Scene — one full-bleed cinematic chapter ────────────────────────────────
export function Scene({
  id,
  n,
  label,
  accent = "teal",
  clip,
  environment,
  children,
}: {
  id: string;
  n: string;
  label: string;
  accent?: Accent;
  /** basename in /media for the ambient loop that layers over the code-drawn env */
  clip?: string;
  /** the code-drawn SVG/CSS environment (always visible) */
  environment: ReactNode;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // The environment drifts against the scroll (depth); the accent glow blooms as
  // the scene passes centre; the ghost numeral counter-drifts. All disabled flat
  // under reduced motion.
  const envY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-9%", "9%"]);
  const envScale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [1.08, 1.02, 1.08]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [0.5, 0.5, 0.5] : [0.1, 0.85, 0.1]);
  const numY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["12%", "-12%"]);

  return (
    <section ref={sectionRef} id={id} className="relative isolate min-h-screen scroll-mt-0 overflow-hidden border-t border-border/40">
      {/* environment layer (code-drawn, always) + optional ambient clip on top */}
      <div className="absolute inset-0 -z-10">
        <motion.div style={{ y: envY, scale: envScale }} className="absolute inset-0">
          {environment}
        </motion.div>
        <AmbientMotes accent={accent} />
        {clip ? (
          <SceneMedia variant="backdrop" src={`/media/${clip}.mp4`} poster={`/media/${clip}.jpg`} label="" />
        ) : null}
        {/* giant ghosted chapter numeral — cinematic depth marker */}
        <motion.span
          aria-hidden
          style={{ y: numY, color: ACCENT_VAR[accent], fontFamily: "var(--font-display)" }}
          className="pointer-events-none absolute -right-2 bottom-[-4%] select-none text-[38vw] font-bold leading-none tracking-tightest opacity-[0.04] sm:text-[26vw]"
        >
          {n}
        </motion.span>
        {/* accent bloom that peaks as the scene centres */}
        <motion.div
          aria-hidden
          style={{
            opacity: glow,
            background: `radial-gradient(60% 55% at 50% 45%, color-mix(in srgb, ${ACCENT_VAR[accent]} 16%, transparent), transparent 70%)`,
          }}
          className="pointer-events-none absolute inset-0"
        />
        {/* legibility scrim — copy never depends on the backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgb(var(--c-base-c) / 0.55), rgb(var(--c-base-c) / 0.35) 42%, rgb(var(--c-base-c) / 0.88))",
          }}
        />
        {/* cinematic vignette — darkened corners frame the shot */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgb(var(--c-base-c) / 0.75))" }}
        />
      </div>
      <ChapterMarker n={n} label={label} accent={accent} />
      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
        {children}
      </div>
    </section>
  );
}

// ── Editorial headline — the one unforgettable sentence per scene ───────────
export function SceneHeadline({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.h2
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 24, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.9, ease: EASE }}
      className={`max-w-3xl text-[clamp(30px,5vw,60px)] font-semibold leading-[1.04] tracking-tightest text-text ${className}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </motion.h2>
  );
}

// ── Rokt echo — an attributed, dated, public quote from Rokt's own messaging ──
// Threads the company's current stance into the film. Always carries its source
// so it reads as "grounded in what Rokt shipped," never as our own claim.
export function RoktEcho({
  quote,
  source,
  accent = "teal",
}: {
  quote: string;
  source: string;
  accent?: Accent;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.figure
      ref={ref}
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE }}
      className="max-w-[46ch] border-l-2 pl-4"
      style={{ borderColor: `color-mix(in srgb, ${ACCENT_VAR[accent]} 55%, transparent)` }}
    >
      <blockquote className="text-base leading-relaxed text-text">
        <span aria-hidden className="mr-0.5 font-semibold" style={{ color: ACCENT_VAR[accent] }}>
          &ldquo;
        </span>
        {quote}
        <span aria-hidden style={{ color: ACCENT_VAR[accent] }}>&rdquo;</span>
      </blockquote>
      <figcaption className={`mt-2 font-mono text-[10px] uppercase tracking-[0.2em] ${ACCENT_TEXT[accent]}`}>
        {source}
      </figcaption>
    </motion.figure>
  );
}

// ── Before / After — a draggable split reveal ───────────────────────────────
// Both layers occupy the same box; the "after" is clipped from the left and the
// handle wipes between them. A visually-hidden range input carries keyboard +
// screen-reader control. Under reduced motion the handle simply jumps.
export function BeforeAfter({
  before,
  after,
  labelBefore,
  labelAfter,
}: {
  before: ReactNode;
  after: ReactNode;
  labelBefore: string;
  labelAfter: string;
}) {
  const [pct, setPct] = useState(50);
  return (
    <div className="relative select-none overflow-hidden rounded-2xl border border-border/70">
      {/* before sets the height */}
      <div className="relative">{before}</div>
      {/* after, clipped to the right of the handle */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pct}%)` }} aria-hidden>
        {after}
      </div>
      {/* labels */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-crimson/40 bg-base/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-crimson backdrop-blur">
        {labelBefore}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-teal/40 bg-base/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-teal backdrop-blur">
        {labelAfter}
      </span>
      {/* the handle */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pct}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-text/70" />
        <div className="absolute top-1/2 -ml-4 -mt-4 flex h-8 w-8 -translate-y-0 items-center justify-center rounded-full border border-text/40 bg-base/90 font-mono text-xs text-text backdrop-blur">
          ⇄
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        aria-label={`Drag to reveal ${labelAfter} over ${labelBefore}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export { ACCENT_VAR, EASE };
