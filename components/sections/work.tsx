"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, projects, type Project, type ProjectCategory } from "@/lib/projects";
import { ProjectImage } from "@/components/site/project-image";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WindowCard } from "@/components/ui/window-card";
import { EASE_OUT } from "@/lib/motion";

/* ---------------------------------- cards ---------------------------------- */

function ProblemResult({ project, className }: { project: Project; className?: string }) {
  return (
    <dl className={cn("space-y-4", className)}>
      <div>
        <dt className="eyebrow !text-[10px]">Problem</dt>
        <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {project.problem}
        </dd>
      </div>
      <div>
        <dt className="eyebrow !text-[10px]">Result</dt>
        <dd className="mt-1 text-sm font-medium leading-relaxed">{project.result}</dd>
      </div>
    </dl>
  );
}

function CardShell({
  project,
  children,
  className,
}: {
  project: Project;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RevealItem as="article" className={className}>
      <Link
        href={`/work/${project.slug}`}
        className="group block h-full rounded-2xl transition-transform duration-300 ease-[var(--ease-out-quart)] hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <WindowCard
          label={`work/${project.slug}`}
          className="flex h-full flex-col transition-[box-shadow,border-color] duration-300 group-hover:border-ring/30 group-hover:shadow-lg group-hover:shadow-foreground/[0.05]"
          contentClassName="flex flex-1 flex-col"
        >
          {children}
        </WindowCard>
      </Link>
    </RevealItem>
  );
}

function FlagshipCard({ project }: { project: Project }) {
  return (
    <CardShell project={project} className="md:col-span-2">
      <div className="grid h-full md:grid-cols-2">
        <div className="flex flex-col p-8 md:p-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            <Sparkles className="size-3" aria-hidden />
            Flagship — own product
          </span>
          <p className="eyebrow mt-6">{project.client}</p>
          <h3 className="mt-2 font-display text-4xl md:text-5xl">{project.title}</h3>
          {project.metric ? (
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-2xl text-primary">
                {project.metric.value}
              </span>
              <span className="text-sm text-muted-foreground">{project.metric.label}</span>
            </p>
          ) : null}
          <ProblemResult project={project} className="mt-6" />
          <span className="mt-auto flex items-center gap-1.5 pt-8 text-sm font-medium text-primary">
            Read the case study
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </span>
        </div>
        <div className="overflow-hidden max-md:order-first md:border-l md:border-border">
          <ProjectImage
            src={project.image}
            alt={`${project.title} preview`}
            label={project.title}
            className="aspect-[16/10] h-full w-full transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-[1.03] md:aspect-auto"
          />
        </div>
      </div>
    </CardShell>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <CardShell project={project}>
      <div className="overflow-hidden border-b border-border">
        <ProjectImage
          src={project.image}
          alt={`${project.title} preview`}
          label={project.title.charAt(0)}
          className="aspect-[16/10] transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="eyebrow">{project.client}</p>
        <h3 className="mt-2 font-sans text-xl font-semibold tracking-tight">
          {project.title}
        </h3>
        <ProblemResult project={project} className="mt-5" />
        <span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-medium text-primary">
          Case study
          <ArrowUpRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
    </CardShell>
  );
}

/* ---------------------------------- tabs ----------------------------------- */

function CategoryTabs({
  active,
  onChange,
}: {
  active: ProjectCategory;
  onChange: (c: ProjectCategory) => void;
}) {
  const tabRefs = React.useRef(new Map<ProjectCategory, HTMLButtonElement>());

  // arrow-key navigation between tabs
  function onKeyDown(e: React.KeyboardEvent) {
    const idx = categories.findIndex((c) => c.key === active);
    let nextIdx = -1;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % categories.length;
    if (e.key === "ArrowLeft") nextIdx = (idx - 1 + categories.length) % categories.length;
    if (nextIdx >= 0) {
      e.preventDefault();
      const next = categories[nextIdx].key;
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
      {categories.map((category) => {
        const count = projects.filter((p) => p.category === category.key).length;
        const isActive = category.key === active;
        return (
          <button
            key={category.key}
            ref={(el) => {
              if (el) tabRefs.current.set(category.key, el);
            }}
            role="tab"
            id={`work-tab-${category.key.replace(/\s/g, "-")}`}
            aria-selected={isActive}
            aria-controls="work-panel"
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(category.key)}
            className={cn(
              "relative whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:px-5",
              isActive
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="work-tab-pill"
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className="absolute inset-0 rounded-full bg-card shadow-sm ring-1 ring-border"
                aria-hidden
              />
            ) : null}
            <span className="relative">
              {category.key}
              <span
                className={cn(
                  "ml-2 font-mono text-[10px]",
                  isActive ? "text-primary" : "text-muted-foreground/70"
                )}
              >
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- section --------------------------------- */

export function Work() {
  const [active, setActive] = React.useState<ProjectCategory>(categories[0].key);
  const category = categories.find((c) => c.key === active)!;
  const items = projects.filter((p) => p.category === active);

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
          <CategoryTabs active={active} onChange={setActive} />
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
              <p className="text-sm text-muted-foreground">{category.blurb}</p>
              <RevealGroup
                className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6"
                staggerChildren={0.07}
              >
                {items.map((project) =>
                  project.flagship ? (
                    <FlagshipCard key={project.slug} project={project} />
                  ) : (
                    <ProjectCard key={project.slug} project={project} />
                  )
                )}
              </RevealGroup>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
