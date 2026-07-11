"use client";

import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { EASE_OUT } from "@/lib/motion";

const stages = [
  {
    years: "1.5 yrs",
    title: "Graphic Design",
    blurb: "Learned to communicate visually — hierarchy, typography, restraint. The eye was trained first.",
  },
  {
    years: "2.5 yrs",
    title: "Web Design",
    stat: "400+ sites",
    blurb: "Shipped websites for real businesses at volume. Speed, craft, and what actually converts.",
  },
  {
    years: "1 yr",
    title: "UI/UX Design",
    blurb: "From pages to products — user flows, usability, and designing for outcomes instead of looks.",
  },
  {
    years: "1.5 yrs · now",
    title: "Software Engineering",
    blurb: "Now I build the whole thing: design to database to deployment, end to end.",
  },
] as const;

export function Journey() {
  return (
    <section id="journey" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <Reveal>
          <p className="eyebrow">The journey</p>
          <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl md:text-6xl">
            A designer who became an engineer
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            Six and a half years, one direction: from making things look right to
            making them work. That&apos;s why the software I build is both
            technically solid <em>and</em> genuinely well-designed.
          </p>
        </Reveal>

        <RevealGroup
          as="ol"
          className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
          staggerChildren={0.16}
        >
          {stages.map((stage, i) => (
            <RevealItem
              key={stage.title}
              as="li"
              className="relative pt-6"
            >
              {/* timeline line — draws itself in as the stage reveals */}
              <motion.span
                aria-hidden
                className="absolute left-0 top-0 h-0.5 w-full origin-left bg-border"
                variants={{
                  hidden: { scaleX: 0 },
                  visible: {
                    scaleX: 1,
                    transition: { duration: 0.9, ease: EASE_OUT, delay: 0.1 },
                  },
                }}
              />
              {/* timeline dot — filled for the current stage */}
              <motion.span
                aria-hidden
                className={`absolute -top-[3px] left-0 size-2 rounded-full ${
                  i === stages.length - 1 ? "bg-primary" : "bg-border"
                }`}
                variants={{
                  hidden: { scale: 0 },
                  visible: {
                    scale: 1,
                    transition: { duration: 0.4, ease: EASE_OUT, delay: 0.05 },
                  },
                }}
              />
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {stage.years}
              </p>
              <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight">
                {stage.title}
              </h3>
              {"stat" in stage && stage.stat ? (
                <p className="mt-1 font-display text-3xl text-primary md:text-4xl">
                  {stage.stat}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {stage.blurb}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
