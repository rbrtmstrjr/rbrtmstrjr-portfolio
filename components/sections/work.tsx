"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { sortForDisplay, type Category, type Project, type ProjectCategory } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/site/project-cards";
import { WorkTabs } from "@/components/site/work-tabs";
import { EASE_OUT } from "@/lib/motion";

/** Homepage shows highlights only — the full list lives at /work. */
const MAX_PER_CATEGORY = 6;
const ALL = "All";

export function Work({
  projects,
  categories,
}: {
  projects: Project[];
  categories: Category[];
}) {
  const [active, setActive] = React.useState<ProjectCategory>(ALL);
  const category = categories.find((c) => c.key === active);
  const pool = active === ALL ? projects : projects.filter((p) => p.category === category?.key);
  const all = sortForDisplay(pool);
  const items = all.slice(0, MAX_PER_CATEGORY);
  const hiddenCount = all.length - items.length;

  if (categories.length === 0) return null;

  const tabs = [
    { key: ALL, count: projects.length },
    ...categories.map((c) => ({
      key: c.key,
      count: projects.filter((p) => p.category === c.key).length,
    })),
  ];

  return (
    <section id="work" className="scroll-mt-24 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <Reveal>
          <p className="eyebrow">Featured work</p>
          <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl md:text-6xl">
            Real problems, shipped solutions
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            Every project follows the same arc: a business problem, the software
            that solved it, and what changed after launch.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <WorkTabs tabs={tabs} active={active} onChange={setActive} idPrefix="work" />
        </Reveal>

        <div
          id="work-panel"
          role="tabpanel"
          aria-labelledby={`work-tab-${active.replace(/\s/g, "-")}`}
          className="mt-8"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <RevealGroup
                className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
                staggerChildren={0.07}
              >
                {/* uniform cards — highlights only; everything lives on /work */}
                {items.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </RevealGroup>
              {hiddenCount > 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  +{hiddenCount} more{active === ALL ? "" : ` ${active}`} project
                  {hiddenCount === 1 ? "" : "s"} on the full work page.
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/work">
              View all work ({projects.length})
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
