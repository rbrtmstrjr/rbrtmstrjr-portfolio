import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProject, projects } from "@/lib/projects";
import { ProjectImage } from "@/components/site/project-image";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
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

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="mx-auto max-w-7xl px-6 pt-32 pb-24 md:pt-40">
      {/* header */}
      <Reveal>
        <Link
          href="/#work"
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
          <p className="eyebrow">
            {project.client} · {project.category}
          </p>
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
          <div className="flex flex-wrap gap-2">
            {project.study.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          {project.study.link ? (
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <Link href={project.study.link.href} target="_blank" rel="noopener noreferrer">
                {project.study.link.label}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </Button>
          ) : null}
        </div>
      </Reveal>

      {/* hero image */}
      <Reveal delay={0.1}>
        <ProjectImage
          src={project.image}
          alt={`${project.title} — primary screenshot`}
          label={project.title}
          className="mt-12 aspect-[16/9] rounded-2xl border border-border"
          sizes="(min-width: 1152px) 1104px, 100vw"
          priority
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

      {/* gallery */}
      {project.study.gallery?.length ? (
        <RevealGroup className="mt-20 grid gap-4 sm:grid-cols-2 md:gap-6" staggerChildren={0.1}>
          {project.study.gallery.map((shot, i) => (
            <RevealItem key={shot.alt} as="div" className={i === 0 ? "sm:col-span-2" : undefined}>
              <figure>
                <ProjectImage
                  src={shot.src}
                  alt={shot.alt}
                  label={String(i + 1)}
                  className={`rounded-2xl border border-border ${i === 0 ? "aspect-[16/9]" : "aspect-[16/10]"}`}
                />
                {shot.caption ? (
                  <figcaption className="mt-2 text-xs text-muted-foreground">
                    {shot.caption}
                  </figcaption>
                ) : null}
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
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
