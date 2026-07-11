"use client";

/**
 * Hero portrait — line-art profile rendered as a subtle gray figure,
 * no panel, sitting directly on the page background.
 * Swap the artwork by replacing /public/images/profile.svg.
 * (The source SVG is white; CSS filters recolor it: black+opacity in light
 * mode, inverted back to white+opacity in dark mode.)
 */
import { motion } from "framer-motion";
import { ProfileArt } from "@/components/site/profile-art";
import { EASE_OUT } from "@/lib/motion";
import { site } from "@/lib/site";

export function HeroProfile() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.45 }}
        className="relative"
      >
        {/* inlined line-art with the traveling comet (aspect matches the svg viewBox) */}
        <ProfileArt
          label={`Illustrated line-art portrait of ${site.name}`}
          className="aspect-[1907/2170]"
        />
      </motion.div>

      {/* floating identity card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 1.2 }}
        className="absolute bottom-6 -left-2 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl shadow-foreground/[0.1] sm:left-0"
      >
        <span className="font-display text-xl leading-none text-primary" aria-hidden>
          RM
        </span>
        <div>
          <p className="text-xs font-semibold leading-none tracking-tight">{site.name}</p>
          <p className="mt-1 text-[10px] leading-none text-muted-foreground">
            Designer × Engineer
          </p>
        </div>
      </motion.div>
    </div>
  );
}
