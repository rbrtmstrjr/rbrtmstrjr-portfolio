"use client";

/**
 * /work — tab-filtered browser over ALL projects ("All" + one tab per
 * category). Same uniform cards and tab pill as the homepage highlights.
 */
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sortForDisplay, type Category, type Project } from "@/lib/projects";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/site/project-cards";
import { WorkTabs } from "@/components/site/work-tabs";
import { EASE_OUT } from "@/lib/motion";

const ALL = "All";

export function WorkBrowser({
  projects,
  categories,
}: {
  projects: Project[];
  categories: Category[];
}) {
  const [active, setActive] = React.useState<string>(ALL);
  const category = categories.find((c) => c.key === active);
  const items = sortForDisplay(
    active === ALL ? projects : projects.filter((p) => p.category === active)
  );
  const blurb =
    active === ALL
      ? "Everything, newest categories last — pick a tab to narrow it down."
      : category?.blurb ?? "";

  const tabs = [
    { key: ALL, count: projects.length },
    ...categories.map((c) => ({
      key: c.key,
      count: projects.filter((p) => p.category === c.key).length,
    })),
  ];

  return (
    <div>
      <Reveal className="mt-12">
        <WorkTabs tabs={tabs} active={active} onChange={setActive} idPrefix="works" />
      </Reveal>

      <div
        id="works-panel"
        role="tabpanel"
        aria-labelledby={`works-tab-${active.replace(/\s/g, "-")}`}
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
            <p className="text-sm text-muted-foreground">{blurb}</p>
            <RevealGroup
              className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
              staggerChildren={0.07}
            >
              {items.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </RevealGroup>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
