"use client";

/**
 * Futuristic scroll guide — a slim vertical rail fixed to the right edge:
 * a 3-digit progress readout, a line that fills down to a glowing dot as you
 * scroll, section tick marks, and a vertical SCROLL label. Decorative
 * (aria-hidden, non-interactive); the dock handles actual navigation.
 */
import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

const TICKS = 6; // one per major section

export function ScrollGuide() {
  const { scrollYProgress } = useScroll();
  const [readout, setReadout] = React.useState("000");

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setReadout(String(Math.round(v * 100)).padStart(3, "0"));
  });

  const dotTop = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.3 }}
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
    >
      {/* progress readout */}
      <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-foreground tabular-nums">
        {readout}
      </span>

      {/* rail */}
      <div className="relative h-[38vh] w-px bg-border">
        {/* section ticks */}
        {Array.from({ length: TICKS }, (_, i) => (
          <span
            key={i}
            className="absolute left-1/2 h-px w-3 -translate-x-1/2 bg-muted-foreground/40"
            style={{ top: `${(i / (TICKS - 1)) * 100}%` }}
          />
        ))}
        {/* filled line down to the dot */}
        <motion.div
          className="absolute inset-x-0 top-0 origin-top bg-foreground/70"
          style={{ scaleY: scrollYProgress, height: "100%" }}
        />
        {/* glowing position dot */}
        <motion.div
          className="absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/60"
          style={{ top: dotTop }}
        />
      </div>

      {/* vertical label */}
      <span
        className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
        style={{ writingMode: "vertical-rl" }}
      >
        Scroll
      </span>
    </motion.div>
  );
}
