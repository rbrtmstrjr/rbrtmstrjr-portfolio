"use client";

/**
 * Shared category tab pill — used by the homepage Work section and the /work
 * browser. Animated active pill, count badges, arrow-key navigation.
 */
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

export type WorkTab = { key: string; count: number };

export function WorkTabs({
  tabs,
  active,
  onChange,
  idPrefix = "work",
}: {
  tabs: WorkTab[];
  active: string;
  onChange: (key: string) => void;
  /** keeps tab/panel ids unique when the pill appears on multiple pages */
  idPrefix?: string;
}) {
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());

  // arrow-key navigation between tabs
  function onKeyDown(e: React.KeyboardEvent) {
    const idx = tabs.findIndex((t) => t.key === active);
    let nextIdx = -1;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
    if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabs.length) % tabs.length;
    if (nextIdx >= 0) {
      e.preventDefault();
      const next = tabs[nextIdx].key;
      onChange(next);
      tabRefs.current.get(next)?.focus();
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Work categories"
      onKeyDown={onKeyDown}
      className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-secondary/60 p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.key, el);
            }}
            role="tab"
            id={`${idPrefix}-tab-${tab.key.replace(/\s/g, "-")}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:px-5",
              isActive
                ? "font-medium text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive ? (
              <motion.span
                layoutId={`${idPrefix}-tab-pill`}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className="absolute inset-0 rounded-full bg-primary shadow-sm shadow-primary/25"
                aria-hidden
              />
            ) : null}
            <span className="relative flex items-center gap-2">
              {tab.key}
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded-full font-mono text-[10px]",
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : "bg-secondary text-muted-foreground/80"
                )}
              >
                {tab.count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
