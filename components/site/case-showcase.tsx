"use client";

/**
 * Case-study showcase — presentation-deck layout: the big stage shows the
 * selected shot, the rail beside it lists every slide (cover + gallery) as
 * clickable thumbnails, PowerPoint-style. Replaces the separate hero image
 * and gallery sections with one compact block.
 */
import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { ProjectImage } from "@/components/site/project-image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Shot = { src?: string; alt: string; caption?: string };

const pad = (n: number) => String(n).padStart(2, "0");

export function CaseShowcase({
  cover,
  gallery = [],
  title,
}: {
  cover?: string;
  gallery?: Shot[];
  title: string;
}) {
  // the deck: cover first, then the gallery shots
  const slides = React.useMemo<Shot[]>(
    () => [
      { src: cover, alt: `${title} — primary screenshot`, caption: "Overview" },
      ...gallery,
    ],
    [cover, gallery, title]
  );
  const [index, setIndex] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const current = slides[Math.min(index, slides.length - 1)];
  const many = slides.length > 1;

  function onLightboxKeys(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    if (e.key === "ArrowRight") setIndex((i) => Math.min(slides.length - 1, i + 1));
  }

  return (
    <figure>
      <div className={cn("grid gap-3 md:gap-4", many && "lg:grid-cols-[1fr_200px]")}>
        {/* stage — click to open the full-size lightbox */}
        <button
          type="button"
          onClick={() => current?.src && setZoomed(true)}
          disabled={!current?.src}
          aria-label={current?.src ? "View screenshot full size" : undefined}
          className={cn(
            "group relative block w-full overflow-hidden rounded-2xl border border-border text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
            current?.src ? "cursor-zoom-in" : "cursor-default"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              <ProjectImage
                src={current?.src}
                alt={current?.alt ?? title}
                label={pad(index + 1)}
                className="aspect-video"
                sizes="(min-width: 1152px) 880px, 100vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
          {current?.src ? (
            <span
              aria-hidden
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-background/85 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <Maximize2 className="size-3" />
              Click to zoom
            </span>
          ) : null}
        </button>

        {/* slide rail — vertical on desktop, horizontal strip on mobile;
            shadcn ScrollArea replaces the chunky native scrollbar */}
        {many ? (
          <ScrollArea className="lg:max-h-[560px]">
            <div
              role="tablist"
              aria-label="Screenshots"
              aria-orientation="vertical"
              className="flex w-max gap-2.5 pb-2.5 lg:w-full lg:flex-col lg:pb-0 lg:pr-3"
            >
            {slides.map((shot, i) => {
              const active = i === index;
              return (
                <button
                  key={`${shot.alt}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Screenshot ${i + 1}: ${shot.caption || shot.alt}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "group relative w-32 shrink-0 overflow-hidden rounded-lg border transition-all duration-300 lg:w-full",
                    active
                      ? "border-primary ring-2 ring-primary/60"
                      : "border-border opacity-55 hover:opacity-90 focus-visible:opacity-90",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  )}
                >
                  <ProjectImage
                    src={shot.src}
                    alt=""
                    label={pad(i + 1)}
                    className="pointer-events-none aspect-video"
                    sizes="200px"
                  />
                  <span
                    className={cn(
                      "absolute bottom-1 left-1 rounded-md px-1.5 py-0.5 font-mono text-[9px] backdrop-blur-sm",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/80 text-muted-foreground"
                    )}
                    aria-hidden
                  >
                    {pad(i + 1)}
                  </span>
                </button>
              );
            })}
            </div>
          </ScrollArea>
        ) : null}
      </div>

      {/* caption + counter */}
      <figcaption className="mt-3 flex items-center justify-between gap-4">
        <span className="min-w-0 truncate text-xs leading-relaxed text-muted-foreground">
          {current?.caption || current?.alt}
        </span>
        {many ? (
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground" aria-hidden>
            {pad(index + 1)}/{pad(slides.length)}
          </span>
        ) : null}
      </figcaption>

      {/* lightbox — the real fix for dense screenshots: near-native size */}
      <DialogPrimitive.Root open={zoomed} onOpenChange={setZoomed}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Content
            onKeyDown={onLightboxKeys}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 md:p-8"
          >
            <DialogPrimitive.Title className="sr-only">
              {current?.alt ?? title} — full size
            </DialogPrimitive.Title>

            {current?.src ? (
              <div className="relative h-[80vh] w-full max-w-[1800px]">
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="96vw"
                  quality={90}
                  className="object-contain"
                />
              </div>
            ) : null}

            <div className="flex items-center gap-4 text-xs text-white/80">
              {many ? (
                <button
                  type="button"
                  aria-label="Previous screenshot"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
              ) : null}
              <span className="max-w-md truncate">
                {current?.caption || current?.alt}
                {many ? (
                  <span className="ml-3 font-mono text-[10px] text-white/50">
                    {pad(index + 1)}/{pad(slides.length)}
                  </span>
                ) : null}
              </span>
              {many ? (
                <button
                  type="button"
                  aria-label="Next screenshot"
                  disabled={index === slides.length - 1}
                  onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>

            <DialogPrimitive.Close
              aria-label="Close full-size view"
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </figure>
  );
}
