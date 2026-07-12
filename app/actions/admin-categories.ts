"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getAdminUser } from "@/lib/supabase/server-auth";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/admin/category-schema";

export type CategoryActionResult = { ok: true } | { ok: false; error: string };

function revalidateSite() {
  // Tabs live on the homepage; the search index lives in the root layout.
  revalidatePath("/", "layout");
}

export async function saveCategory(input: CategoryFormInput): Promise<CategoryActionResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Some fields are invalid — check the form and retry." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase isn't configured on the server." };

  const row = {
    key: parsed.data.key,
    label: parsed.data.label,
    blurb: parsed.data.blurb?.trim() ?? "",
    sort_order: parsed.data.sortOrder,
    updated_at: new Date().toISOString(),
  };

  const query = parsed.data.id
    ? supabase.from("categories").update(row).eq("id", parsed.data.id)
    : supabase.from("categories").insert(row);
  const { error } = await query;
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A managed category with that name already exists." };
    }
    if (error.code === "42P01") {
      return {
        ok: false,
        error: "The categories table doesn't exist yet — run supabase/upgrade-project-details.sql.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidateSite();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Your session expired — sign in again." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase isn't configured on the server." };

  const { data: row, error: readError } = await supabase
    .from("categories")
    .select("key")
    .eq("id", id)
    .maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  if (!row) return { ok: false, error: "Category not found — it may already be deleted." };

  // Refuse to orphan projects.
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("category", row.key);
  const uses = count ?? 0;
  if (uses > 0) {
    return {
      ok: false,
      error: `${uses} project${uses === 1 ? "" : "s"} still use${uses === 1 ? "s" : ""} “${row.key}” — move them to another category first.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateSite();
  return { ok: true };
}
