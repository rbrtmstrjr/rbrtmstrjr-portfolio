"use client";

/**
 * Top bar — identity + actions only (wordmark, theme toggle, CTA).
 * Section navigation lives in the floating BottomNav dock.
 * Morphs from a full-width transparent bar into a floating pill on scroll.
 */
import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { NavSearch } from "@/components/site/nav-search";
import { AccentPicker } from "@/components/site/accent-picker";
import type { PublicPalette } from "@/lib/palettes-data";

export function Navbar({
  palettes = [],
  defaultPaletteSlug = null,
}: {
  palettes?: PublicPalette[];
  defaultPaletteSlug?: string | null;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
      className="fixed inset-x-0 top-0 z-50 px-4"
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-500 ease-[var(--ease-out-quart)]",
          scrolled
            ? "mt-3 h-14 max-w-7xl rounded-full border border-border bg-background/85 pl-6 pr-3 shadow-lg shadow-foreground/[0.07] backdrop-blur-md"
            : "h-16 max-w-7xl border border-transparent bg-transparent px-2"
        )}
      >
        <Link
          href="/"
          className="shrink-0 font-display text-2xl text-foreground transition-opacity hover:opacity-70 md:text-3xl"
        >
          {site.wordmark}
        </Link>

        {/* centered subtle search (desktop) */}
        <div className="hidden flex-1 justify-center px-6 md:flex">
          <NavSearch />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <AccentPicker palettes={palettes} defaultSlug={defaultPaletteSlug} />
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/#contact">Start a project</Link>
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}
