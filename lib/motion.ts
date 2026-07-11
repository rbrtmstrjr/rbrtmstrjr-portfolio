/**
 * Shared motion vocabulary — every animation on the site speaks this dialect
 * so the whole experience feels like one crafted system.
 * Transform/opacity only. Reduced-motion handled by MotionConfig in providers.
 */
import type { Transition, Variants } from "framer-motion";

/** Signature easing — fast start, long elegant settle */
export const EASE_OUT: Transition["ease"] = [0.25, 1, 0.5, 1];

export const DURATION = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
} as const;

/** Fade + subtle rise — the house entrance move */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT },
  },
};

/** Container that staggers its fadeRise children */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

/** Standard viewport config for scroll-triggered reveals */
export const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;
