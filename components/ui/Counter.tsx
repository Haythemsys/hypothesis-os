"use client";
import { useEffect, useRef, useState } from "react";

// Animated number counter (monospace). Counts to `value` over `duration` ms.
// Respects prefers-reduced-motion (snaps instantly).
export function Counter({ value, decimals = 2, className = "", duration = 400 }: {
  value: number; decimals?: number; className?: string; duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    const to = value;
    if (reduce || from === to) { setDisplay(to); fromRef.current = to; return; }

    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return <span className={`data ${className}`}>{display.toFixed(decimals)}</span>;
}
