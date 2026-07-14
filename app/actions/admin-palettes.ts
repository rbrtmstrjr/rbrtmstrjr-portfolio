"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getAdminUser } from "@/lib/supabase/server-auth";
import { parseAccentInput } from "@/lib/theme-accent";

export type PaletteActionResult = { ok: true } | { ok: false; error: string };

const paletteSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Give the palette a name.").max(60),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers, and dashes."),
  lightInput: z.string().trim().min(1, "Paste the light scale.").max(4000),
  darkInput: z.string().trim().min(1, "Paste the dark scale.").max(4000),
});

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) return null;
  return getSupabaseAdmin();
}

/** The serialized palette menu lives in the root layout — regenerate it. */
function revalidateMenu() {
  revalidatePath("/", "layout");
}

export async function savePalette(
  input: z.input<typeof paletteSchema>
): Promise<PaletteActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired. Sign in again." };

  const parsed = paletteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const light = parseAccentInput(parsed.data.lightInput);
  if (!light.ok) return { ok: false, error: `Light scale: ${light.error}` };
  const dark = parseAccentInput(parsed.data.darkInput);
  if (!dark.ok) return { ok: false, error: `Dark scale: ${dark.error}` };

  const row = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    scale_light: light.scale,
    scale_dark: dark.scale,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (parsed.data.id) {
    ({ error } = await supabase.from("accent_palettes").update(row).eq("id", parsed.data.id));
  } else {
    // the first palette ever becomes the default; later ones join the menu
    const { count } = await supabase
      .from("accent_palettes")
      .select("id", { count: "exact", head: true });
    const { data: maxRow } = await supabase
      .from("accent_palettes")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    ({ error } = await supabase.from("accent_palettes").insert({
      ...row,
      is_default: (count ?? 0) === 0,
      sort_order: (maxRow?.sort_order ?? -1) + 1,
    }));
  }

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That slug is already used by another palette." };
    }
    if (error.code === "42P01") {
      return {
        ok: false,
        error: "The palettes table doesn't exist yet. Run supabase/upgrade-palettes.sql.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidateMenu();
  return { ok: true };
}

export async function setDefaultPalette(id: string): Promise<PaletteActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired. Sign in again." };

  // clear first — the partial unique index allows at most one true
  const { error: clearError } = await supabase
    .from("accent_palettes")
    .update({ is_default: false })
    .eq("is_default", true);
  if (clearError) return { ok: false, error: clearError.message };

  const { error } = await supabase
    .from("accent_palettes")
    .update({ is_default: true })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateMenu();
  return { ok: true };
}

export async function deletePalette(id: string): Promise<PaletteActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired. Sign in again." };

  const { data: row } = await supabase
    .from("accent_palettes")
    .select("is_default")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { ok: false, error: "Palette not found." };
  if (row.is_default) {
    return {
      ok: false,
      error: "This palette is the default. Make another one the default first.",
    };
  }

  const { error } = await supabase.from("accent_palettes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateMenu();
  return { ok: true };
}

export async function movePalette(
  id: string,
  direction: "up" | "down"
): Promise<PaletteActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired. Sign in again." };

  const { data, error } = await supabase
    .from("accent_palettes")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) return { ok: false, error: error?.message ?? "Read failed." };

  const index = data.findIndex((r) => r.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= data.length) return { ok: true };

  // swap in the ordered list, then renumber EVERY row to its index — a
  // pairwise swap misorders when legacy rows share duplicate sort values
  const order = [...data];
  [order[index], order[swapWith]] = [order[swapWith], order[index]];
  const results = await Promise.all(
    order.map((r, i) =>
      r.sort_order === i
        ? Promise.resolve({ error: null })
        : supabase.from("accent_palettes").update({ sort_order: i }).eq("id", r.id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidateMenu();
  return { ok: true };
}
