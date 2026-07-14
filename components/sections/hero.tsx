"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitWords } from "@/components/motion/split-words";
import { HeroProfile } from "@/components/site/hero-profile";
import { EASE_OUT } from "@/lib/motion";
import { site } from "@/lib/site";

/** Simple fade+rise used for the hero's supporting elements */
const enter = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE_OUT, delay },
});

export type HeroAvailability = {
  status: "available" | "booked" | "unavailable";
  message: string | null;
};

/** Settings-driven availability pulse (admin → Settings → Availability). */
function AvailabilityPill({ availability }: { availability: HeroAvailability }) {
  const { status, message } = availability;
  const label =
    message ||
    (status === "available"
      ? "Available for new projects"
      : status === "booked"
        ? "Currently booked, but inquiries welcome"
        : "Not taking new projects right now");

  return (
    <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="relative flex size-2" aria-hidden>
        {status === "available" ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
        ) : null}
        <span
          className={`relative inline-flex size-2 rounded-full ${
            status === "available" ? "bg-primary" : "bg-muted-foreground/50"
          }`}
        />
      </span>
      {label}
    </span>
  );
}

export function Hero({
  availability = { status: "available", message: null },
}: {
  availability?: HeroAvailability;
}) {
  return (
    <section id="home" className="relative overflow-x-clip">
      {/* fills the full first screen so the stack strip stays below the fold */}
      <div className="mx-auto grid min-h-svh max-w-7xl items-center gap-14 px-6 pt-28 pb-24 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:pt-24">
        {/* --------------- portrait (left on desktop, top on mobile) --------------- */}
        <div>
          <HeroProfile />
        </div>

        {/* ------------------------------- copy ------------------------------- */}
        <div>
          <motion.p {...enter(0.1)} className="eyebrow">
            {site.role}
          </motion.p>

          <h1 className="mt-6 text-6xl leading-[1.02] sm:text-7xl xl:text-8xl">
            <SplitWords
              text="I'm Robert."
              delay={0.25}
              highlightWords={["Robert"]}
              highlightClass="text-primary"
            />
          </h1>

          <motion.p
            {...enter(0.6)}
            className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            <span className="font-medium text-foreground">
              I turn manual work into software that grows your business.
            </span>{" "}
            Custom web apps and AI automation, designed and built end to end.
          </motion.p>

          <motion.div {...enter(0.75)} className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="btn-cta group">
              <Link href="/#contact">
                Start a project
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="bg-primary/5 text-primary/70 hover:bg-primary/10 hover:text-primary/80"
            >
              <Link href="/#work">See the work</Link>
            </Button>
          </motion.div>

          {/* trust strip — availability + the volume signal, given real presence */}
          <motion.div
            {...enter(0.9)}
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <AvailabilityPill availability={availability} />
            <span className="text-sm text-muted-foreground">
              <span className="font-display text-lg text-foreground">400+</span>{" "}
              websites &amp; apps shipped across 6+ years
            </span>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
