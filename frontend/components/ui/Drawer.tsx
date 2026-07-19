"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./primitives";

/**
 * Right-side drawer with focus trapping, Escape-to-close, and a scrim.
 * Restrained motion: opacity + short x-translate on the panel only.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  labelId = "drawer-title",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  labelId?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("button, [href], input")
        ?.focus();
    }, 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="drawer-overlay"
          className="fixed inset-0 z-50 flex justify-end"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 32, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-panel"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h3 id={labelId} className="truncate text-base font-semibold">
                  {title}
                </h3>
                {subtitle ? (
                  <div className="mt-0.5 text-xs text-muted">{subtitle}</div>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                aria-label="Close drawer"
              >
                Close ✕
              </Button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
