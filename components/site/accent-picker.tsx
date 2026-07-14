"use client";

/**
 * Visitor accent picker — a small swatch button beside the theme toggle that
 * opens a popover of admin-curated palettes. Picking one recolors the site
 * instantly (swaps the #accent-visitor style injected by the layout's init
 * script) and persists the slug to THIS browser's localStorage only. No DB
 * writes; two browsers can happily show two different accents.
 */
import * as React from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PublicPalette } from "@/lib/palettes-data";

const STORAGE_KEY = "accent-palette";

export function AccentPicker({
  palettes,
  defaultSlug,
}: {
  palettes: PublicPalette[];
  defaultSlug: string | null;
}) {
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [stored, setStored] = React.useState<string | null>(null);

  // localStorage is read when the popover OPENS (event handler, no effect),
  // so the selected checkmark is always current by the time it's visible
  function handleOpenChange(next: boolean) {
    if (next) {
      try {
        setStored(localStorage.getItem(STORAGE_KEY));
      } catch {
        /* storage unavailable — default stands */
      }
    }
    setOpen(next);
  }

  // a menu of one is noise; the default already applies without a picker
  if (palettes.length < 2) return null;

  const activeSlug =
    stored && palettes.some((p) => p.slug === stored) ? stored : defaultSlug;

  function apply(palette: PublicPalette) {
    let el = document.getElementById("accent-visitor") as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = "accent-visitor";
      // right after the SSR default so the override wins in cascade order
      const base = document.getElementById("accent-theme");
      if (base) base.insertAdjacentElement("afterend", el);
      else document.head.appendChild(el);
    }
    el.textContent = palette.css;
    try {
      localStorage.setItem(STORAGE_KEY, palette.slug);
    } catch {
      /* still applied for this page view */
    }
    setStored(palette.slug);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Choose accent color">
          {/* the dot IS var(--primary), so it always shows the live accent */}
          <span
            aria-hidden
            className="size-4 rounded-full bg-primary ring-1 ring-inset ring-foreground/10"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-44 p-1.5">
        <p className="px-2.5 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Accent
        </p>
        <ul role="listbox" aria-label="Accent color">
          {palettes.map((palette) => {
            const selected = palette.slug === activeSlug;
            return (
              <li key={palette.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => apply(palette)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-secondary font-medium"
                      : "hover:bg-secondary/70 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    aria-hidden
                    className="size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10"
                    style={{
                      backgroundColor:
                        resolvedTheme === "dark"
                          ? palette.swatchDark
                          : palette.swatchLight,
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate">{palette.name}</span>
                  {selected ? <Check className="size-3.5 shrink-0 text-primary" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
