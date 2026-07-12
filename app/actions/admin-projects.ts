"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getAllCategories } from "@/lib/projects-data";
import { getAdminUser } from "@/lib/supabase/server-auth";
import {
  formToRow,
  projectFormSchema,
  type ProjectFormInput,
} from "@/lib/admin/project-schema";

export type AdminActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const BUCKET = "project-media";

/**
 * Regenerate every static page that renders project data: the homepage grid,
 * case-study pages, service "related work", the nav-search index (root layout)
 * and the sitemap — so admin saves go live without a redeploy.
 */
function revalidateProjects(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/work/${slug}`);
}

/** Create or update a managed project. Auth is re-verified server-side. */
export async function saveProject(input: ProjectFormInput): Promise<AdminActionResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Some fields are invalid — check the form and retry." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase isn't configured on the server." };

  const validCategories = await getAllCategories();
  if (!validCategories.some((c) => c.key === parsed.data.category)) {
    return { ok: false, error: "That category no longer exists — pick another." };
  }

  const row = formToRow(parsed.data);

  if (parsed.data.id) {
    const { error } = await supabase.from("projects").update(row).eq("id", parsed.data.id);
    if (error) return { ok: false, error: friendlyDbError(error.code, error.message) };
    revalidateProjects(row.slug);
    return { ok: true, id: parsed.data.id };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(row)
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: friendlyDbError(error?.code, error?.message) };
  }
  revalidateProjects(row.slug);
  return { ok: true, id: data.id as string };
}

/** Delete a managed project row and its uploaded media. */
export async function deleteProject(id: string): Promise<AdminActionResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Your session expired — sign in again." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase isn't configured on the server." };

  const { data: row, error: readError } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  if (!row) return { ok: false, error: "Project not found — it may already be deleted." };

  // Media first: uploads live flat under {slug}/ in the bucket.
  const { data: files } = await supabase.storage.from(BUCKET).list(row.slug);
  if (files?.length) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove(files.map((f) => `${row.slug}/${f.name}`));
    if (removeError) {
      console.error("[admin-projects] Failed to remove media:", removeError.message);
    }
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateProjects(row.slug);
  return { ok: true, id };
}

function friendlyDbError(code?: string, message?: string) {
  if (code === "23505") return "That slug is already used by another managed project.";
  if (code === "23503") return "That linked client no longer exists — pick another or none.";
  if (code === "42P01")
    return "The projects table doesn't exist yet — run supabase/schema.sql in the SQL editor.";
  return message ?? "Something went wrong saving the project.";
}
