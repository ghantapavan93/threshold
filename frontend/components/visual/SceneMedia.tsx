"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   SceneMedia — the scaffold for real product recordings + ambient loops.

   Two variants:
   • "panel"    — a recording slot beside scene text (Builder SplitScenes). The
                  designed fallback (the SVG illustration) renders until the
                  video file exists AND has loaded; the swap is a soft fade, so
                  a missing file is never a broken box — the page simply looks
                  the way it did before media landed.
   • "backdrop" — a full-bleed ambient loop behind a hero. Dimmed hard and
                  scrimmed toward the base color so AA legibility never depends
                  on the video. Absent file → nothing renders at all.

   Laws honored (design-system/MASTER.md):
   • Local files only (/public/media) — no external asset URLs.
   • prefers-reduced-motion → NO playback: the poster frame if provided,
     otherwise the fallback. The global freeze block is not relied upon —
     playback simply never starts.
   • Battery/perf: the <video> mounts only near the viewport (IO, 200px
     margin), pauses off-screen, preload="none", muted/inline/looped.

   File manifest + generation prompts: frontend/public/media/README.md.
   ──────────────────────────────────────────────────────────────────────────── */

/* The manifest gate: a clip only mounts if its filename is listed in
   /media/manifest.json (which ships with the repo). This keeps devtools free of
   404 noise while slots await their files — dropping a clip in is two steps:
   copy the file, add its name to manifest.json. Fetched once per session. */
let manifestPromise: Promise<Set<string>> | null = null;
function loadManifest(): Promise<Set<string>> {
  manifestPromise ??= fetch("/media/manifest.json")
    .then((r) => (r.ok ? r.json() : { available: [] }))
    .then((j: { available?: string[] }) => new Set(j.available ?? []))
    .catch(() => new Set<string>());
  return manifestPromise;
}

type SceneMediaProps = {
  /** Local path under /public, e.g. "/media/scene-design.webm". */
  src: string;
  /** Static frame for reduced-motion users (and backdrop first paint). */
  poster?: string;
  /** What the recording shows — becomes the accessible label. */
  label: string;
  variant?: "panel" | "backdrop";
  /** Rendered while the file is absent, unloadable, or still loading (panel). */
  fallback?: ReactNode;
  className?: string;
};

export function SceneMedia({
  src,
  poster,
  label,
  variant = "panel",
  fallback = null,
  className = "",
}: SceneMediaProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"pending" | "ready" | "missing">("pending");
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [nearView, setNearView] = useState(false);
  const [listed, setListed] = useState<boolean | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Only attempt files the manifest declares — no 404s for pending slots.
  useEffect(() => {
    let alive = true;
    const name = src.split("/").pop() ?? src;
    void loadManifest().then((available) => {
      if (alive) setListed(available.has(name));
    });
    return () => {
      alive = false;
    };
  }, [src]);

  // Mount the <video> only when the slot approaches the viewport.
  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setNearView(entries[0]?.isIntersecting ?? false),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause when scrolled away; resume when back (only once ready).
  useEffect(() => {
    const v = videoRef.current;
    if (!v || status !== "ready") return;
    if (nearView) void v.play().catch(() => {});
    else v.pause();
  }, [nearView, status]);

  // Until the client knows the motion preference, render the fallback only —
  // identical on server and client, so hydration stays clean.
  const playbackAllowed = reduced === false;

  if (variant === "backdrop") {
    return (
      <div
        ref={holderRef}
        aria-hidden
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      >
        {reduced && poster && listed === true ? (
          // Reduced motion: the beautiful static frame, never playback.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="h-full w-full object-cover opacity-25" />
        ) : null}
        {playbackAllowed && listed === true && status !== "missing" && nearView ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: status === "ready" ? 0.3 : 0 }}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            onLoadedData={() => setStatus("ready")}
            onError={() => setStatus("missing")}
          />
        ) : null}
        {/* Scrim: legibility never depends on what the video is doing. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgb(var(--c-base-c) / 0.55), rgb(var(--c-base-c) / 0.35) 40%, rgb(var(--c-base-c) / 0.9))",
          }}
        />
      </div>
    );
  }

  // "panel": designed fallback until the real recording is present + loaded.
  return (
    <div ref={holderRef} className={`relative ${className}`}>
      <div
        className="transition-opacity duration-500"
        style={{ opacity: status === "ready" && playbackAllowed ? 0 : 1 }}
        aria-hidden={status === "ready" && playbackAllowed}
      >
        {reduced && poster && listed === true ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={label} className="w-full rounded-xl border border-border/60" />
        ) : (
          fallback
        )}
      </div>
      {playbackAllowed && listed === true && status !== "missing" && nearView ? (
        <video
          ref={videoRef}
          aria-label={label}
          className="absolute inset-0 h-full w-full rounded-xl border border-border/60 object-cover transition-opacity duration-500"
          style={{ opacity: status === "ready" ? 1 : 0 }}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          onLoadedData={() => setStatus("ready")}
          onError={() => setStatus("missing")}
        />
      ) : null}
    </div>
  );
}
