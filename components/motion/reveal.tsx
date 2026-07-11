"use client";

/**
 * Scroll-reveal system — the house motion vocabulary.
 *
 * <Reveal>        one element fades + rises when it enters the viewport
 * <RevealGroup>   staggers its <RevealItem> children
 * <RevealItem>    child of RevealGroup (no own viewport trigger)
 *
 * All transform/opacity only; reduced-motion handled globally by MotionConfig.
 */
import { motion } from "framer-motion";
import { DURATION, EASE_OUT, VIEWPORT, fadeRise, stagger } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** seconds to wait after entering the viewport */
  delay?: number;
  /** render element, default div */
  as?: "div" | "section" | "span" | "p" | "li" | "header" | "figure";
};

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.base, ease: EASE_OUT, delay },
        },
      }}
    >
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  /** seconds between children */
  staggerChildren?: number;
  delayChildren?: number;
  as?: "div" | "ul" | "ol" | "section";
};

export function RevealGroup({
  children,
  className,
  staggerChildren = 0.08,
  delayChildren = 0,
  as = "div",
}: RevealGroupProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={stagger(staggerChildren, delayChildren)}
    >
      {children}
    </Tag>
  );
}

type RevealItemProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "span" | "article";
};

export function RevealItem({ children, className, as = "div" }: RevealItemProps) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={fadeRise}>
      {children}
    </Tag>
  );
}
