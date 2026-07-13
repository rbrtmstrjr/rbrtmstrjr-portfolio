"use client";

import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ContributionGraph } from "@/components/site/contribution-graph";
import { ProfileArt } from "@/components/site/profile-art";
import { EASE_OUT } from "@/lib/motion";
import { site } from "@/lib/site";
import type { Contributions } from "@/lib/github";

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

export function Journey({ contributions }: { contributions?: Contributions | null }) {
  return (
    <section id="journey" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        {/* min-w-0 on both columns — grid items default to min-width:auto, and
            the contribution graph's intrinsic width (~600px) would otherwise
            stretch the whole page past the viewport on mobile */}
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          {/* left — hero-sized portrait on top, story beneath */}
          <div className="min-w-0">
            <Reveal>
              <div className="mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
                {/* same comet animation as the hero, running over this artwork */}
                <ProfileArt
                  src="/images/front-image.svg"
                  label={`Illustrated line-art portrait of ${site.name} tipping his cap`}
                  className="aspect-[2106/2286]"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow mt-10">The journey</p>
              <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl">
                A designer who became an engineer
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                Six and a half years, one direction: from making things look right
                to making them work. That&apos;s why the software I build is both
                technically solid <em>and</em> genuinely well-designed.
              </p>
            </Reveal>
          </div>

          {/* right — vertical timeline + live contribution proof */}
          <div className="min-w-0 lg:pt-4">
            <RevealGroup as="ol" staggerChildren={0.16}>
            {stages.map((stage, i) => (
              <RevealItem key={stage.title} as="li" className="relative pl-10 pb-12 last:pb-0">
                {/* connector line — draws down as the stage reveals */}
                {i < stages.length - 1 ? (
                  <motion.span
                    aria-hidden
                    className="absolute bottom-0 left-[3.5px] top-4 w-0.5 origin-top bg-border"
                    variants={{
                      hidden: { scaleY: 0 },
                      visible: {
                        scaleY: 1,
                        transition: { duration: 0.9, ease: EASE_OUT, delay: 0.15 },
                      },
                    }}
                  />
                ) : null}
                {/* timeline dot — filled for the current stage */}
                <motion.span
                  aria-hidden
                  className={`absolute left-0 top-1.5 size-2 rounded-full ${
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
                <h3 className="mt-3 font-sans text-xl font-semibold tracking-tight">
                  {stage.title}
                </h3>
                {"stat" in stage && stage.stat ? (
                  <p className="mt-1 font-display text-3xl text-primary md:text-4xl">
                    {stage.stat}
                  </p>
                ) : null}
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                  {stage.blurb}
                </p>
              </RevealItem>
            ))}
            </RevealGroup>

            {/* the receipts — GitHub's own record, sitting beside the story */}
            {contributions ? (
              <Reveal delay={0.15} className="mt-12">
                <ContributionGraph contributions={contributions} />
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
