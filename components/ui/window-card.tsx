import { cn } from "@/lib/utils";

/**
 * WindowCard — the site's signature "browser window" card: rounded frame,
 * titlebar with three dots and an optional mono address-pill label.
 * Used for services, work cards, the contact form, and the dashboard mockup.
 */
export function WindowCard({
  label,
  className,
  contentClassName,
  children,
}: {
  /** mono text shown in the titlebar's address pill (e.g. "work/fishpin") */
  label?: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card",
        className
      )}
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="size-2.5 rounded-full bg-border" aria-hidden />
        <span className="size-2.5 rounded-full bg-border" aria-hidden />
        <span className="size-2.5 rounded-full bg-border" aria-hidden />
        {label ? (
          <span className="ml-3 hidden h-6 items-center rounded-full bg-secondary px-3 font-mono text-[10px] text-muted-foreground sm:flex">
            {label}
          </span>
        ) : null}
      </div>
      <div className={cn("flex-1", contentClassName)}>{children}</div>
    </div>
  );
}
