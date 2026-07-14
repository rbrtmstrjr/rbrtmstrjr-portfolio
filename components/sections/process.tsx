import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const steps = [
  {
    title: "Tell me the problem",
    blurb:
      "A short call or message, in plain language. No tech talk needed. What's slow, manual, or costing you money?",
  },
  {
    title: "Get a clear plan",
    blurb:
      "You receive a straightforward proposal: what gets built, what it costs, and when it ships. No surprises later.",
  },
  {
    title: "See the design first",
    blurb:
      "Before a line of code, you click through the actual screens. We adjust until it fits how your business really works.",
  },
  {
    title: "Watch it get built",
    blurb:
      "You get working pieces every week and try the real thing as it grows, instead of one big reveal at the end.",
  },
  {
    title: "Launch, trained and supported",
    blurb:
      "Your team gets onboarded, you get the keys, and I stick around. I don't disappear after launch.",
  },
] as const;

export function Process() {
  return (
    <section id="process" className="scroll-mt-24 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">How I work</p>
              <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl">
                From problem to shipped software
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
                First custom software project? That&apos;s most of my clients. The
                process is built so you always know what&apos;s happening, what it
                costs, and what you&apos;ll get.
              </p>
            </div>
          </Reveal>

          <RevealGroup as="ol" staggerChildren={0.1}>
            {steps.map((step, i) => (
              <RevealItem
                key={step.title}
                as="li"
                className="group grid grid-cols-[3rem_1fr] gap-4 border-t border-border py-7 first:border-t-0 first:pt-0 md:gap-8"
              >
                <span className="font-display text-2xl text-primary/70 transition-colors duration-300 group-hover:text-primary md:text-3xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-sans text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                    {step.blurb}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
