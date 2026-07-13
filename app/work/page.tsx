import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { WorkBrowser } from "@/components/site/work-browser";
import { getVisibleCategories } from "@/lib/projects-data";

// Hourly ISR backstop — admin saves still revalidate on demand.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Work",
  description:
    "Every shipped project — custom software, AI automation, and websites, each with the problem it solved and what changed after launch.",
  openGraph: {
    title: "Work",
    description:
      "Every shipped project — custom software, AI automation, and websites.",
  },
};

export default async function WorkIndexPage() {
  const { categories, projects } = await getVisibleCategories();

  return (
    <div className="mx-auto max-w-7xl px-6 pt-32 pb-24 md:pt-40">
      <Reveal>
        <Link
          href="/#work"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Home
        </Link>
        <div className="mt-10 max-w-3xl">
          <p className="eyebrow">All work</p>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl">
            Every project, one page
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            The homepage shows highlights — this is everything. Filter by category, open
            any card for the full problem → solution → outcome story.
          </p>
        </div>
      </Reveal>

      <WorkBrowser projects={projects} categories={categories} />

      {/* CTA */}
      <Reveal>
        <div className="mt-24 rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl">Have a similar problem?</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Tell me what&apos;s slowing your business down — I&apos;ll tell you honestly
                whether software can fix it.
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
      </Reveal>
    </div>
  );
}
