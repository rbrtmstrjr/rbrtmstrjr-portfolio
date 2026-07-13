"use client";

/**
 * Shared project cards — used by the homepage Work section (highlights) and
 * the /work index page (everything). One source so the two never drift.
 */
import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/projects";
import { ProjectImage } from "@/components/site/project-image";
import { RevealItem } from "@/components/motion/reveal";
import { WindowCard } from "@/components/ui/window-card";

const STATUS_LABELS: Record<string, string> = {
  "in-progress": "In progress",
  "just-started": "Just started",
};

/** Small chip shown only for non-completed projects. */
export function StatusChip({ status, className }: { status?: string; className?: string }) {
  const label = status ? STATUS_LABELS[status] : undefined;
  if (!label) return null;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.05] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/80",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-primary/70 motion-safe:animate-pulse" aria-hidden />
      {label}
    </span>
  );
}

function ProblemResult({ project, className }: { project: Project; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* context — quiet, inline label keeps it one scannable line */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Problem: </span>
        {project.problem}
      </p>
      {/* payoff — highlighted callout, the eye lands here first */}
      <p className="rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm font-medium leading-relaxed">
        {project.result}
      </p>
    </div>
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

export function FlagshipCard({ project }: { project: Project }) {
  return (
    <CardShell project={project} className="md:col-span-2">
      <div className="grid h-full md:grid-cols-2">
        <div className="flex flex-col p-8 md:p-10">
          <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
              <Sparkles className="size-3" aria-hidden />
              Flagship — own product
            </span>
            <StatusChip status={project.status} />
          </span>
          <h3 className="mt-6 font-display text-4xl md:text-5xl">{project.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{project.client}</p>
          <ProblemResult project={project} className="mt-6" />
          <span className="mt-auto flex items-center gap-2 pt-8 text-sm font-medium text-primary">
            Read the case study
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
              aria-hidden
            >
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px" />
            </span>
          </span>
        </div>
        <div className="overflow-hidden max-md:order-first md:border-l md:border-border">
          <ProjectImage
            src={project.image}
            alt={`${project.title} preview`}
            label={project.title}
            className="aspect-[16/10] w-full transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-[1.03] md:aspect-auto md:h-full"
          />
        </div>
      </div>
    </CardShell>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const hasChips = project.flagship || (project.status && STATUS_LABELS[project.status]);
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
        {hasChips ? (
          <span className="mb-3 flex flex-wrap items-center gap-2">
            {project.flagship ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                <Sparkles className="size-3" aria-hidden />
                Flagship
              </span>
            ) : null}
            <StatusChip status={project.status} />
          </span>
        ) : null}
        <h3 className="font-sans text-xl font-semibold tracking-tight md:text-2xl">
          {project.title}
        </h3>
        {/* one short line — the payoff; the full story lives on the case page */}
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {project.result}
        </p>
        <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-primary">
          Case study
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
            aria-hidden
          >
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px" />
          </span>
        </span>
      </div>
    </CardShell>
  );
}
