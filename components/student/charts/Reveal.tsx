"use client";

import { type CSSProperties, type ReactNode } from "react";

// A style object that may also carry CSS custom properties (e.g. `--c`).
type Style = CSSProperties & Record<string, string | number | undefined>;

/* ---------- Reveal — entrance wrapper (fadeUp) with optional stagger delay ---------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: Style;
}) {
  return (
    <div className={"reveal " + className} style={{ animationDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}
