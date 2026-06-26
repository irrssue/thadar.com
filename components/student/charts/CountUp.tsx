"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- CountUp — tween a number from 0 → `to` on mount ---------- */
export function CountUp({
  to,
  dur = 1000,
  dec = 0,
  suffix = "",
  prefix = "",
}: {
  to: number;
  dur?: number;
  dec?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [v, setV] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const from = ref.current;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const val = from + (to - from) * e;
      ref.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return (
    <>
      {prefix}
      {v.toFixed(dec)}
      {suffix}
    </>
  );
}
