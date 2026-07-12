import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Blocks, Bot, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowCard } from "@/components/ui/window-card";
import { ProjectImage } from "@/components/site/project-image";
import { AutomationFlow, MiniDashboard } from "@/components/site/service-graphics";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getService, services } from "@/lib/services";
import { getAllProjects } from "@/lib/projects-data";

const ICONS = { blocks: Blocks, bot: Bot } as const;
const GRAPHICS = { blocks: MiniDashboard, bot: AutomationFlow } as const;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.detail.intro,
    openGraph: { title: service.title, description: service.detail.intro },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const Icon = ICONS[service.icon];
  const Graphic = GRAPHICS[service.icon];
  const related = (await getAllProjects())
    .filter((p) => p.category === service.detail.categoryKey)
    .slice(0, 3);
  const other = services.find((s) => s.slug !== service.slug)!;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-24 md:pt-28">
      {/* header */}
      <Reveal>
        <Link
          href="/#services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All services
        </Link>

        {/* full-width hero graphic — the service, shown before it's told */}
        <WindowCard
          label={service.window}
          className="mt-10"
          contentClassName="p-4 md:p-6"
        >
          <Graphic size="lg" />
        </WindowCard>

        <div className="mt-14 max-w-3xl">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" aria-hidden />
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl">{service.title}</h1>
          <p className="mt-3 text-lg font-medium text-primary">{service.tagline}</p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {service.detail.intro}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="btn-cta group">
              <Link href="/#contact">
                Start a project
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="bg-primary/5 text-primary/70 hover:bg-primary/10 hover:text-primary/80">
              <Link href="/#process">How I work</Link>
            </Button>
          </div>
        </div>
      </Reveal>

      {/* what you get */}
      <div className="mt-24">
        <Reveal>
          <p className="eyebrow">What you get</p>
          <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl md:text-5xl">
            Built for your business, not around it
          </h2>
        </Reveal>
        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerChildren={0.07}>
          {service.detail.features.map((feature) => (
            <RevealItem
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-ring/30"
            >
              <h3 className="font-sans text-base font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/* fit checklist */}
      <Reveal>
        <div className="mt-24 grid gap-10 rounded-2xl border border-border bg-secondary/40 p-8 md:grid-cols-[minmax(0,360px)_1fr] md:p-12">
          <div>
            <p className="eyebrow">Is this you?</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">A perfect fit if…</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              If two or more of these sound familiar, this is exactly the kind of
              problem I build for.
            </p>
          </div>
          <ul className="space-y-4">
            {service.detail.fitFor.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10"
                  aria-hidden
                >
                  <Check className="size-3 text-primary" />
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* related work */}
      {related.length > 0 ? (
        <div className="mt-24">
          <Reveal>
            <p className="eyebrow">Proof</p>
            <h2 className="mt-4 max-w-2xl text-3xl sm:text-4xl md:text-5xl">
              Recent {service.detail.categoryKey.toLowerCase()} projects
            </h2>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6" staggerChildren={0.1}>
            {related.map((project) => (
              <RevealItem key={project.slug} as="article" className="group h-full transition-transform duration-300 ease-[var(--ease-out-quart)] hover:-translate-y-1">
                <Link
                  href={`/work/${project.slug}`}
                  className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <WindowCard
                    label={`work/${project.slug}`}
                    className="flex h-full flex-col transition-[box-shadow,border-color] duration-300 group-hover:border-ring/30 group-hover:shadow-lg group-hover:shadow-foreground/[0.05]"
                    contentClassName="flex flex-1 flex-col"
                  >
                    <div className="overflow-hidden border-b border-border">
                      <ProjectImage
                        src={project.image}
                        alt={`${project.title} preview`}
                        label={project.title.charAt(0)}
                        className="aspect-[16/10] transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-sans text-xl font-semibold tracking-tight">
                        {project.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">{project.client}</p>
                      <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-primary">
                        Case study
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
                          aria-hidden
                        >
                          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px" />
                        </span>
                      </span>
                    </div>
                  </WindowCard>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      ) : null}

      {/* CTA + other service */}
      <Reveal>
        <div className="mt-24 rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl">Sounds like your business?</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Tell me what&apos;s eating your team&apos;s time — I&apos;ll tell you
                honestly whether this can fix it.
              </p>
            </div>
            <Button asChild size="lg" className="btn-cta shrink-0">
              <Link href="/#contact">
                Start a project
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Link
            href={`/services/${other.slug}`}
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Also: {other.title}
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
