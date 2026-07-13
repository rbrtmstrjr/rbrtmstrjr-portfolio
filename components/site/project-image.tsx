import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Screenshot slot for project cards & case-study galleries.
 * Pass `src` (under /public) to render the real image; while unset it renders
 * a clearly-marked, on-brand placeholder panel — swap by editing lib/projects.ts.
 */
export function ProjectImage({
  src,
  alt,
  label,
  className,
  sizes,
  priority,
}: {
  src?: string;
  alt: string;
  /** big letter/word shown on the placeholder panel */
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-secondary", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 768px) 50vw, 100vw"}
          priority={priority}
          quality={90}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-secondary",
        className
      )}
    >
      {/* subtle dot grid, tokens only */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      {label ? (
        <span
          aria-hidden
          className="relative font-display text-6xl text-foreground/15 md:text-7xl"
        >
          {label}
        </span>
      ) : null}
      <span
        aria-hidden
        className="absolute bottom-3 left-3 rounded-md bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-sm"
      >
        Screenshot — coming soon
      </span>
    </div>
  );
}
