import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllProjects, getProjectBySlug } from "@/lib/projects-data";
import { CaseShowcase } from "@/components/site/case-showcase";
import { Reveal } from "@/components/motion/reveal";

type Params = { slug: string };

// Hourly ISR backstop — admin saves still revalidate on demand.
export const revalidate = 3600;

// New managed slugs published after a deploy render on demand (ISR) —
// generateStaticParams covers everything known at build time.
export async function generateStaticParams(): Promise<Params[]> {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case study`,
    description: project.study.intro,
    openGraph: {
      title: `${project.title} — Case study`,
      description: project.study.intro,
    },
  };
}

const chapters = [
  { key: "problem", label: "The problem" },
  { key: "approach", label: "The approach" },
  { key: "solution", label: "The solution" },
  { key: "outcome", label: "The outcome" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  "in-progress": "In progress",
  "just-started": "Just started",
};

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="mx-auto max-w-7xl px-6 pt-32 pb-24 md:pt-40">
      {/* header */}
      <Reveal>
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All work
        </Link>

        <div className="mt-10 max-w-3xl">
          {project.flagship ? (
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
              <Sparkles className="size-3" aria-hidden />
              Flagship — own product
            </span>
          ) : null}
          <span className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">
              {project.client} · {project.category}
            </p>
            {project.status && STATUS_LABELS[project.status] ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.05] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/80">
                <span
                  className="size-1.5 rounded-full bg-primary/70 motion-safe:animate-pulse"
                  aria-hidden
                />
                {STATUS_LABELS[project.status]}
              </span>
            ) : null}
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl">{project.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {project.study.intro}
          </p>
        </div>

        {/* meta row */}
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-border py-6">
          {project.metric ? (
            <div>
              <p className="font-display text-3xl text-primary">{project.metric.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{project.metric.label}</p>
            </div>
          ) : null}
          {(
            [
              ["Year", project.year],
              ["Duration", project.duration],
              ["Role", project.role],
            ] as const
          ).map(([label, value]) =>
            value ? (
              <div key={label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium">{value}</p>
              </div>
            ) : null
          )}
          <div className="flex flex-wrap gap-2">
            {project.study.tech.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-primary/15 bg-primary/[0.05] px-3 py-1 text-xs font-medium text-primary/80"
              >
                {t}
              </span>
            ))}
          </div>
          {project.study.link ? (
            <Button asChild size="sm" className="ml-auto">
              <Link href={project.study.link.href} target="_blank" rel="noopener noreferrer">
                {project.study.link.label}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Button>
          ) : null}
        </div>
      </Reveal>

      {/* showcase — cover + gallery as one presentation deck */}
      <Reveal delay={0.1} className="mt-12">
        <CaseShowcase
          cover={project.image}
          gallery={project.study.gallery ? [...project.study.gallery] : []}
          title={project.title}
        />
      </Reveal>

      {/* story — problem → approach → solution → outcome */}
      <div className="mt-20 space-y-16 md:space-y-20">
        {chapters.map((chapter, i) => (
          <Reveal key={chapter.key}>
            <section className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-12">
              <div className="flex items-baseline gap-3 md:block">
                <span className="font-mono text-xs text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-sans text-lg font-semibold tracking-tight md:mt-2">
                  {chapter.label}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {project.study[chapter.key]}
              </p>
            </section>
          </Reveal>
        ))}
      </div>

      {/* client testimonial */}
      {project.testimonial ? (
        <Reveal>
          <figure className="mt-20 rounded-2xl border-l-2 border-primary bg-primary/5 p-8 md:p-12">
            <blockquote className="max-w-3xl text-xl leading-relaxed font-medium md:text-2xl">
              “{project.testimonial.quote}”
            </blockquote>
            <figcaption className="mt-5 text-sm text-muted-foreground">
              — {project.testimonial.author}
            </figcaption>
          </figure>
        </Reveal>
      ) : null}


      {/* CTA + next project */}
      <Reveal>
        <div className="mt-24 rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl">Facing a similar problem?</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Tell me what&apos;s slowing your business down — I&apos;ll tell you
                honestly whether software can fix it.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/#contact">
                Start a project
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/work/${next.slug}`}
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Next: {next.title}
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
