import { Star } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WindowCard } from "@/components/ui/window-card";
import { getPublishedTestimonials } from "@/lib/contracts-data";
import { cn } from "@/lib/utils";

/**
 * Client testimonials — sourced EXCLUSIVELY from approved + published rows
 * (the admin review gate). Renders nothing until at least one exists, so the
 * homepage layout is unchanged until there's something real to show.
 */
export async function Testimonials() {
  const testimonials = await getPublishedTestimonials();
  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <Reveal>
          <p className="eyebrow">What clients say</p>
          <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl md:text-6xl">
            In their words
          </h2>
        </Reveal>
        <RevealGroup
          className="mt-12 grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
          staggerChildren={0.08}
        >
          {testimonials.map((t) => (
            <RevealItem key={t.id} as="div">
              <WindowCard
                label="client/feedback"
                className="flex h-full flex-col"
                contentClassName="flex flex-1 flex-col p-6 md:p-8"
              >
                {t.rating ? (
                  <span
                    className="mb-4 flex items-center gap-0.5"
                    aria-label={`${t.rating} of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-3.5",
                          i < t.rating! ? "fill-primary text-primary" : "text-border"
                        )}
                        aria-hidden
                      />
                    ))}
                  </span>
                ) : null}
                <blockquote className="text-sm leading-relaxed">“{t.body}”</blockquote>
                <p className="mt-auto pt-5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.author_name}</span>
                  {t.author_role ? <> · {t.author_role}</> : null}
                </p>
              </WindowCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
