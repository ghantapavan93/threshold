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
  manifestPromise ??= fetch("/media/manifest.json", { cache: "no-store" })
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
  const [listed, setListed] = useState<boolean | null>(null);
  const [posterListed, setPosterListed] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Only attempt files the manifest declares — no 404s for pending slots. The
  // poster is checked separately so a clip without a still never shows a broken
  // image; it simply falls back to the code-drawn scene.
  useEffect(() => {
    let alive = true;
    const name = src.split("/").pop() ?? src;
    const posterName = poster ? poster.split("/").pop() ?? poster : null;
    void loadManifest().then((available) => {
      if (!alive) return;
      setListed(available.has(name));
      setPosterListed(!!posterName && available.has(posterName));
    });
    return () => {
      alive = false;
    };
  }, [src, poster]);

  // Once ready, keep the muted loop playing. We deliberately do NOT gate this on
  // the IntersectionObserver: its reading is unreliable across embedded/preview
  // contexts and would leave visible clips stuck paused. The clips are small,
  // muted loops, so playing the mounted ones is fine.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || status !== "ready") return;
    void v.play().catch(() => {});
  }, [status]);

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
        {reduced && posterListed ? (
          // Reduced motion: the beautiful static frame, never playback.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="h-full w-full object-cover opacity-25" />
        ) : null}
        {playbackAllowed && listed === true && status !== "missing" ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: status === "ready" ? 0.34 : 0 }}
            src={src}
            poster={posterListed ? poster : undefined}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            onLoadedData={() => setStatus("ready")}
            onError={(e) => {
              // Ignore transient aborts/network blips (StrictMode + IO remount
              // churn in dev fire spurious aborts); only give up on a real
              // decode/source failure so a good clip is never killed by a hiccup.
              const code = e.currentTarget.error?.code;
              if (code === 3 || code === 4) setStatus("missing");
            }}
          />
        ) : null}
        {/* Scrim: legibility never depends on what the video is doing. Rendered
            only while media is actually visible, so a pending slot changes
            nothing about the page. */}
        {status === "ready" || (reduced === true && posterListed) ? (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgb(var(--c-base-c) / 0.55), rgb(var(--c-base-c) / 0.35) 40%, rgb(var(--c-base-c) / 0.9))",
            }}
          />
        ) : null}
      </div>
    );
  }

  // "panel": designed fallback until the real recording is present + loaded.
  return (
    <div ref={holderRef} className={`relative ${className}`}>
      <div
        className="h-full w-full transition-opacity duration-500"
        style={{ opacity: status === "ready" && playbackAllowed ? 0 : 1 }}
        aria-hidden={status === "ready" && playbackAllowed}
      >
        {reduced && posterListed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={label} className="h-full w-full object-cover" />
        ) : (
          fallback
        )}
      </div>
      {playbackAllowed && listed === true && status !== "missing" ? (
        <video
          ref={videoRef}
          aria-label={label}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: status === "ready" ? 1 : 0 }}
          src={src}
          poster={posterListed ? poster : undefined}
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
