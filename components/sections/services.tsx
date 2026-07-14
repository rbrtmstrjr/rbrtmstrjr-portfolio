import Link from "next/link";
import { ArrowRight, Blocks, Bot, Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WindowCard } from "@/components/ui/window-card";
import { AutomationFlow, MiniDashboard } from "@/components/site/service-graphics";
import { services } from "@/lib/services";

const ICONS = { blocks: Blocks, bot: Bot } as const;
const GRAPHICS = { blocks: MiniDashboard, bot: AutomationFlow } as const;

export function Services() {
  return (
    <section id="services" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <Reveal>
          <p className="eyebrow">What I do</p>
          <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl md:text-6xl">
            Two ways I help businesses grow
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2 md:gap-6" staggerChildren={0.12}>
          {services.map((service) => {
            const Icon = ICONS[service.icon];
            const Graphic = GRAPHICS[service.icon];
            return (
              <RevealItem
                key={service.slug}
                as="article"
                className="group h-full transition-transform duration-300 ease-[var(--ease-out-quart)] hover:-translate-y-1"
              >
                <WindowCard
                  label={service.window}
                  className="flex h-full flex-col transition-[box-shadow,border-color] duration-300 group-hover:border-ring/30 group-hover:shadow-lg group-hover:shadow-foreground/[0.04]"
                  contentClassName="flex flex-1 flex-col p-8 md:p-10"
                >
                  {/* in-card graphic — the service, shown not told */}
                  <div className="mb-8">
                    <Graphic />
                  </div>

                  {/* header — icon + title + clear subhead */}
                  <div className="flex items-start gap-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl leading-tight md:text-3xl">
                        {service.title}
                      </h3>
                      <p className="mt-1.5 font-medium text-primary">{service.tagline}</p>
                    </div>
                  </div>

                  {/* outcomes */}
                  <ul className="mt-7 space-y-3">
                    {service.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-center gap-3">
                        <span
                          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10"
                          aria-hidden
                        >
                          <Check className="size-3 text-primary" />
                        </span>
                        <span className="text-sm font-medium">{outcome}</span>
                      </li>
                    ))}
                  </ul>

                  {/* footer CTA */}
                  <div className="mt-auto pt-8">
                    <Button asChild variant="outline">
                      <Link href={`/services/${service.slug}`}>
                        Learn more
                        <ArrowRight
                          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </Button>
                  </div>
                </WindowCard>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/* design-background strip — full-width container in the badge style */}
        <Reveal delay={0.1}>
          <div className="mt-4 flex items-center gap-4 rounded-lg border border-primary/15 bg-primary/[0.05] px-8 py-6 md:mt-6">
            <Palette className="size-5 shrink-0 text-primary/70" aria-hidden />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-primary/80">
                Also: UI/UX, graphic &amp; web design.
              </span>{" "}
              6+ years of design behind every build, 400+ websites shipped, so
              your software works hard <em>and</em> looks the part.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
