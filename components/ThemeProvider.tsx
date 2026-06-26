"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (attr === "light" || attr === "dark") {
      setThemeState(attr);
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem("thadar-theme", t);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <SessionProvider>
      <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </SessionProvider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: "dark" as Theme, toggle: () => {}, setTheme: () => {} };
  }
  return ctx;
}
