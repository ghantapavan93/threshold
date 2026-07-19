"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";

// ---- Theme -----------------------------------------------------------------
type Theme = "dark" | "light";
type ThemeMode = Theme | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: Theme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "threshold-theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial: ThemeMode =
      stored === "dark" || stored === "light" || stored === "system"
        ? stored
        : "system";
    setModeState(initial);
  }, []);

  useEffect(() => {
    const apply = () => {
      const next = mode === "system" ? systemTheme() : mode;
      setResolved(next);
      const root = document.documentElement;
      if (mode === "system") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", next);
      }
    };
    apply();

    if (mode === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: light)");
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
    return undefined;
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    setMode(resolved === "dark" ? "light" : "dark");
  }, [resolved, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, setMode, toggle }),
    [mode, resolved, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within Providers");
  return ctx;
}

// ---- React Query -----------------------------------------------------------
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.kind === "validation") return false;
          return failureCount < 2;
        },
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
