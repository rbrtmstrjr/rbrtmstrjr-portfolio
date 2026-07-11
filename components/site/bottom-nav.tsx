"use client";

/**
 * Floating bottom dock — primary navigation.
 * A centered pill with icon+label items; the active section is scroll-spied
 * and highlighted with a solid brand pill. On small screens inactive items
 * collapse to icons so the dock always fits.
 */
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { House, LayoutGrid, Briefcase, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

const ITEMS = [
  { id: "home", label: "Home", href: "/#home", icon: House },
  { id: "services", label: "Services", href: "/#services", icon: LayoutGrid },
  { id: "work", label: "Work", href: "/#work", icon: Briefcase },
  { id: "contact", label: "Contact", href: "/#contact", icon: Mail },
] as const;

export function BottomNav() {
  const [active, setActive] = React.useState<string>("");

  // scroll-spy: the section closest to the viewport's middle wins
  React.useEffect(() => {
    const sections = ITEMS.map((it) => document.getElementById(it.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return; // e.g. case-study pages
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      aria-label="Section navigation"
      initial={{ y: 56, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.9 }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-1.5 rounded-full border border-border bg-background/85 p-2.5 shadow-xl shadow-foreground/[0.08] backdrop-blur-md"
    >
      {ITEMS.map(({ id, label, href, icon: Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className={isActive ? "inline" : "hidden sm:inline"}>{label}</span>
          </Link>
        );
      })}
    </motion.nav>
  );
}
