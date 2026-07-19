import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LivingBackground } from "@/components/visual/LivingBackground";
import { SmoothScroll } from "@/components/visual/SmoothScroll";

/**
 * Self-hosted, offline-safe fonts. next/font downloads and inlines these at
 * build time and serves them from our own origin — no runtime request to any
 * external font CDN. Space Grotesk is the bold editorial display face; Inter
 * carries body text.
 */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Threshold · Policy Change Safety Gate",
  description:
    "An internal deployment safety console. Validates that a change from one placement policy version to the next is safe — before a single customer is affected.",
};

export const viewport: Viewport = {
  themeColor: "#0b0f19",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:border focus:border-teal focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <LivingBackground />
        <SmoothScroll />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
