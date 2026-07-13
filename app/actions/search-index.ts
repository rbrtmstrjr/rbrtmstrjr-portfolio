"use server";

import { getAllProjects } from "@/lib/projects-data";
import type { SearchProject } from "@/components/site/nav-search";

/**
 * Minimal published-project fields for the navbar search. Fetched lazily on
 * first focus of the search input, so the root layout never has to query the
 * DB on routes that don't show the navbar (/admin, /client).
 */
export async function getSearchIndex(): Promise<SearchProject[]> {
  return (await getAllProjects()).map((p) => ({
    slug: p.slug,
    title: p.title,
    client: p.client,
    category: p.category,
  }));
}
