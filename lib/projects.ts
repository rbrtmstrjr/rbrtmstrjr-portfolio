/**
 * Project types — content is FULLY database-driven via the admin CMS
 * (public.projects + public.categories, read through lib/projects-data.ts).
 * The pre-CMS hardcoded arrays were migrated to Supabase on 2026-07-12 and
 * removed; this module now only defines the shapes the site renders.
 */

/** Category keys come from public.categories (managed in /admin/projects). */
export type ProjectCategory = string;

export type ProjectStatus = "completed" | "in-progress" | "just-started";

export type Category = {
  key: ProjectCategory;
  label: string;
  blurb: string;
  sort: number;
};

export type Project = {
  slug: string;
  title: string;
  /** Real client name (or "Own product") */
  client: string;
  category: ProjectCategory;
  /** Featured big — own shipped product or hero engagement */
  flagship?: boolean;
  /** Marker for content that still needs the real client's details */
  placeholder?: boolean;
  /** Public badge on card + case page; absent/"completed" renders nothing */
  status?: ProjectStatus;
  /** One-line problem shown on the card */
  problem: string;
  /** One-line outcome shown on the card */
  result: string;
  /** Optional hard metric, featured big when present */
  metric?: { value: string; label: string };
  /** Card image — Storage URL or /public path (falls back to placeholder panel) */
  image?: string;
  /** ---- optional case-study meta (shown in the meta row when present) ---- */
  year?: string;
  duration?: string;
  role?: string;
  /** Client pull-quote rendered on the case page */
  testimonial?: { quote: string; author: string };
  /** ---- case-study page ---- */
  study: {
    intro: string;
    problem: string;
    approach: string;
    solution: string;
    outcome: string;
    tech: string[];
    gallery?: { src?: string; alt: string; caption?: string }[];
    /** external link (Google Play, live site) */
    link?: { href: string; label: string };
  };
};

/** Display order for card grids: flagship first, then natural merge order. */
export function sortForDisplay(list: Project[]): Project[] {
  return [...list].sort((a, b) => Number(!!b.flagship) - Number(!!a.flagship));
}
