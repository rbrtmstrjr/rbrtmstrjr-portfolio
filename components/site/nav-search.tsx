"use client";

/**
 * Subtle nav search — a quiet pill input that searches the site's real
 * content (case studies + page sections) and drops down matching links.
 */
import * as React from "react";
import Link from "next/link";
import { Briefcase, Hash, Search } from "lucide-react";
import { getSearchIndex } from "@/app/actions/search-index";

/** Minimal project fields the search needs — loaded lazily on first focus so
 *  the layout doesn't have to fetch projects on every route. */
export type SearchProject = {
  slug: string;
  title: string;
  client: string;
  category: string;
};

type Result = {
  href: string;
  label: string;
  sub: string;
  kind: "project" | "section";
};

const SECTIONS: Result[] = [
  { href: "/#services", label: "Services", sub: "What I do", kind: "section" },
  { href: "/work", label: "All work", sub: "Every project, one page", kind: "section" },
  { href: "/#work", label: "Featured work", sub: "Case studies", kind: "section" },
  { href: "/#journey", label: "Journey", sub: "Designer × engineer", kind: "section" },
  { href: "/#process", label: "Process", sub: "How I work", kind: "section" },
  { href: "/#contact", label: "Contact", sub: "Start a project", kind: "section" },
];

export function NavSearch() {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [projects, setProjects] = React.useState<SearchProject[]>([]);

  // Fetch the project index once, on first interaction.
  const requested = React.useRef(false);
  const loadIndex = () => {
    if (requested.current) return;
    requested.current = true;
    getSearchIndex()
      .then(setProjects)
      .catch(() => {
        requested.current = false; // retry on next focus
      });
  };

  const index: Result[] = React.useMemo(
    () => [
      ...projects.map((p) => ({
        href: `/work/${p.slug}`,
        label: p.title,
        sub: `${p.client} · ${p.category}`,
        kind: "project" as const,
      })),
      ...SECTIONS,
    ],
    [projects]
  );

  const q = query.trim().toLowerCase();
  const results = q
    ? index.filter(
        (r) => r.label.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q)
      ).slice(0, 6)
    : [];

  const close = () => {
    setQuery("");
    setOpen(false);
  };

  return (
    <div
      className="relative w-full max-w-xs lg:max-w-sm"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
        aria-hidden
      />
      <input
        type="search"
        role="combobox"
        aria-controls="nav-search-results"
        aria-expanded={open && results.length > 0}
        aria-label="Search work and services"
        placeholder="Search work, services…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          loadIndex();
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
        className="h-9 w-full rounded-full border border-border bg-secondary/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors duration-300 focus:border-ring/40 focus:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
      />

      {open && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-foreground/[0.08]">
          <ul id="nav-search-results">
            {results.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                >
                  {r.kind === "project" ? (
                    <Briefcase className="size-4 shrink-0 text-primary/70" aria-hidden />
                  ) : (
                    <Hash className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{r.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {r.sub}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
