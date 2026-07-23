import type { Config } from "tailwindcss";

/**
 * Threshold palette (frozen, from docs/DESIGN_BRIEF.md).
 * Dark-first. Semantic colors are exposed as CSS variables in globals.css so a
 * manual light/dark toggle and prefers-color-scheme can both drive them.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Channel-triplet form so Tailwind's /alpha modifiers work with theming.
        // NOTE: `base` is intentionally NOT here — its name collides with the
        // built-in `text-base` font-size utility, which would turn every
        // `text-base` element's color into the dark background (invisible text).
        // It lives under backgroundColor below so `bg-base` still works.
        surface: "rgb(var(--c-surface-c) / <alpha-value>)",
        "surface-2": "rgb(var(--c-surface-2-c) / <alpha-value>)",
        border: "rgb(var(--c-border-c) / <alpha-value>)",
        "border-strong": "rgb(var(--c-border-strong-c) / <alpha-value>)",
        text: "rgb(var(--c-text-c) / <alpha-value>)",
        muted: "rgb(var(--c-muted-c) / <alpha-value>)",
        teal: "rgb(var(--c-teal-c) / <alpha-value>)",
        amber: "rgb(var(--c-amber-c) / <alpha-value>)",
        crimson: "rgb(var(--c-crimson-c) / <alpha-value>)",
        "offer-blue": "rgb(var(--c-offer-blue-c) / <alpha-value>)",
      },
      backgroundColor: {
        // `base` is a background-only token (see note in colors above).
        base: "rgb(var(--c-base-c) / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "Cascadia Code",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        display: ["clamp(2.6rem, 6vw, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      boxShadow: {
        panel: "0 1px 0 0 var(--c-border) inset, 0 10px 28px -14px rgba(4,8,22,0.62)",
        focus: "0 0 0 2px var(--c-base), 0 0 0 4px var(--c-teal)",
        "glow-teal":
          "0 0 0 1px rgba(34,230,200,0.28), 0 26px 64px -30px rgba(34,230,200,0.5), 0 0 42px -18px rgba(34,230,200,0.55)",
        "glow-crimson":
          "0 0 0 1px rgba(255,77,106,0.32), 0 26px 64px -30px rgba(255,77,106,0.5), 0 0 42px -16px rgba(255,77,106,0.6)",
        "glow-amber":
          "0 0 0 1px rgba(245,184,75,0.3), 0 26px 64px -30px rgba(245,184,75,0.45), 0 0 42px -18px rgba(245,184,75,0.5)",
      },
      backgroundImage: {
        "thr-iris": "linear-gradient(115deg, #22e6c8 0%, #5b8cff 52%, #7b6bff 100%)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "float-soft": "float-soft 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
