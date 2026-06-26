"use client";

import { useEffect, useState } from "react";

/**
 * Returns false on the first paint, then flips to true one frame later — so the
 * browser paints the "from" state before transitioning to the "to" state, which
 * is what makes each chart draw itself in. The `.reveal`/`.stagger` wrappers in
 * student.css disable their entrance under prefers-reduced-motion.
 */
export function useEnter(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);
  return on;
}
