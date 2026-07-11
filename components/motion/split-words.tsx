"use client";

/**
 * Word-by-word masked rise — the hero's signature entrance.
 * Each word slides up from behind an overflow mask, softly staggered.
 */
import * as React from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

type SplitWordsProps = {
  text: string;
  className?: string;
  /** seconds before the first word */
  delay?: number;
  /** seconds between words */
  stagger?: number;
  /** words (punctuation ignored) that receive highlightClass */
  highlightWords?: string[];
  highlightClass?: string;
};

export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  highlightWords = [],
  highlightClass,
}: SplitWordsProps) {
  const words = text.split(" ");
  const isHighlighted = (word: string) =>
    highlightWords.includes(word.replace(/[.,!?]/g, ""));
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span
            aria-hidden
            className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-baseline"
          >
            <motion.span
              className={`inline-block will-change-transform ${
                isHighlighted(word) && highlightClass ? highlightClass : ""
              }`}
              initial={{ y: "115%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.8,
                ease: EASE_OUT,
                delay: delay + i * stagger,
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}
