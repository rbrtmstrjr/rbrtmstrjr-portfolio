import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { Category, Project, ProjectCategory, ProjectStatus } from "@/lib/projects";

/**
 * Project + category source — fully database-driven (admin CMS writes,
 * everything public reads through here). With no Supabase env configured the
 * site renders empty states and the build stays green; content requires the
 * env keys (set locally and on Vercel).
 */

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  client: string;
  /** optional FK to clients — internal only, public rendering uses `client` text */
  client_id: string | null;
  category: ProjectCategory;
  flagship: boolean;
  placeholder: boolean;
  status: ProjectStatus;
  problem: string;
  result: string;
  metric: { value: string; label: string } | null;
  image: string | null;
  year: string | null;
  duration: string | null;
  role: string | null;
  testimonial: { quote: string; author: string } | null;
  study: Partial<Project["study"]> | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  key: string;
  label: string;
  blurb: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Missing table/column = an upgrade SQL not applied yet — a warn, not an error. */
function logDbIssue(what: string, error: { code?: string; message: string }, fixFile: string) {
  if (error.code === "42P01" || error.code === "42703" || /schema cache/.test(error.message)) {
    console.warn(`[projects-data] ${what}: ${error.message} — run supabase/${fixFile} in the SQL editor.`);
  } else {
    console.error(`[projects-data] ${what}:`, error.message);
  }
}

export function rowToProject(row: ProjectRow): Project {
  const study = row.study ?? {};
  return {
    slug: row.slug,
    title: row.title,
    client: row.client,
    category: row.category,
    flagship: row.flagship || undefined,
    placeholder: row.placeholder || undefined,
    status: row.status === "completed" ? undefined : row.status,
    problem: row.problem,
    result: row.result,
    metric: row.metric ?? undefined,
    image: row.image ?? undefined,
    year: row.year ?? undefined,
    duration: row.duration ?? undefined,
    role: row.role ?? undefined,
    testimonial: row.testimonial ?? undefined,
    study: {
      intro: study.intro ?? "",
      problem: study.problem ?? "",
      approach: study.approach ?? "",
      solution: study.solution ?? "",
      outcome: study.outcome ?? "",
      tech: Array.isArray(study.tech) ? study.tech : [],
      gallery: study.gallery,
      link: study.link,
    },
  };
}

/** All managed rows (drafts included) — admin dashboard only. */
export async function getProjectRows(): Promise<ProjectRow[]> {
  return fetchRows(true);
}

async function fetchRows(includeDrafts: boolean): Promise<ProjectRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  let query = supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (!includeDrafts) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) {
    logDbIssue("Failed to read projects", error, "schema.sql");
    return [];
  }
  return (data ?? []) as ProjectRow[];
}

export async function getProjectRow(id: string): Promise<ProjectRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[projects-data] Failed to read project:", error.message);
    return null;
  }
  return (data as ProjectRow) ?? null;
}

/** All published projects, in sort order. */
export async function getAllProjects(): Promise<Project[]> {
  const rows = await fetchRows(false);
  return rows.map(rowToProject);
}

export async function getMergedProject(slug: string): Promise<Project | undefined> {
  const all = await getAllProjects();
  return all.find((p) => p.slug === slug);
}

/* ------------------------------- categories ------------------------------- */

export async function getCategoryRows(): Promise<CategoryRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    logDbIssue("Failed to read categories", error, "upgrade-project-details.sql");
    return [];
  }
  return (data ?? []) as CategoryRow[];
}

export async function getAllCategories(): Promise<Category[]> {
  const rows = await getCategoryRows();
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    blurb: row.blurb,
    sort: row.sort_order,
  }));
}

/** Categories that have at least one visible project — drives the Work tabs. */
export async function getVisibleCategories(): Promise<{
  categories: Category[];
  projects: Project[];
}> {
  const [allCategories, projects] = await Promise.all([
    getAllCategories(),
    getAllProjects(),
  ]);
  const used = new Set(projects.map((p) => p.category));
  return {
    categories: allCategories.filter((c) => used.has(c.key)),
    projects,
  };
}
