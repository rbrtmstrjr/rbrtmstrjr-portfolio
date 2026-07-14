"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getAdminUser } from "@/lib/supabase/server-auth";

export type SettingsActionResult = { ok: true } | { ok: false; error: string };

const optionalText = z.string().trim().optional().or(z.literal(""));

const siteInfoSchema = z
  .object({
    contactEmail: optionalText,
    notificationEmail: optionalText,
    githubUrl: optionalText,
    linkedinUrl: optionalText,
    siteDomain: optionalText,
  })
  .superRefine((data, ctx) => {
    for (const key of ["contactEmail", "notificationEmail"] as const) {
      const v = data[key]?.trim();
      if (v && !z.email().safeParse(v).success) {
        ctx.addIssue({ code: "custom", path: [key], message: "That email doesn't look right." });
      }
    }
    for (const key of ["githubUrl", "linkedinUrl", "siteDomain"] as const) {
      const v = data[key]?.trim();
      if (v && !z.url().safeParse(v).success) {
        ctx.addIssue({ code: "custom", path: [key], message: "Enter a full URL (https://…)." });
      }
    }
  });

const availabilitySchema = z.object({
  status: z.enum(["available", "booked", "unavailable"]),
  message: z.string().trim().max(120).optional().or(z.literal("")),
});

const templateSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(2, "Template title is required."),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  sortOrder: z.coerce.number<number>().int().min(0).max(999),
});

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) return null;
  return getSupabaseAdmin();
}

/** The public site renders these — regenerate after every save. */
function revalidateSite() {
  revalidatePath("/", "layout");
  // site_domain feeds the metadata routes too
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}

async function upsertSettings(
  patch: Record<string, unknown>
): Promise<SettingsActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };
  const { error } = await supabase
    .from("settings")
    .upsert({ id: 1, ...patch, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) {
    if (error.code === "42P01") {
      return {
        ok: false,
        error: "The settings table doesn't exist yet — run supabase/upgrade-settings.sql.",
      };
    }
    // PostgREST: an upsert column the DB doesn't have yet (pre-upgrade schema)
    if (error.code === "PGRST204") {
      return {
        ok: false,
        error: "The settings table is missing a column. Run the latest supabase upgrade SQL.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidateSite();
  return { ok: true };
}

export async function saveSiteInfo(
  input: z.input<typeof siteInfoSchema>
): Promise<SettingsActionResult> {
  const parsed = siteInfoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the form — some fields are invalid." };
  return upsertSettings({
    contact_email: parsed.data.contactEmail?.trim() || null,
    notification_email: parsed.data.notificationEmail?.trim() || null,
    github_url: parsed.data.githubUrl?.trim() || null,
    linkedin_url: parsed.data.linkedinUrl?.trim() || null,
    site_domain: parsed.data.siteDomain?.trim() || null,
  });
}

export async function saveAvailability(
  input: z.input<typeof availabilitySchema>
): Promise<SettingsActionResult> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pick a valid availability status." };
  return upsertSettings({
    availability_status: parsed.data.status,
    availability_message: parsed.data.message?.trim() || null,
  });
}

/* ---------------------------- milestone templates -------------------------- */

export async function saveMilestoneTemplate(
  input: z.input<typeof templateSchema>
): Promise<SettingsActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "A template needs at least a title." };

  const row = {
    title: parsed.data.title,
    default_description: parsed.data.description?.trim() || null,
    sort_order: parsed.data.sortOrder,
  };
  const query = parsed.data.id
    ? supabase.from("milestone_templates").update(row).eq("id", parsed.data.id)
    : supabase.from("milestone_templates").insert(row);
  const { error } = await query;
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteMilestoneTemplate(id: string): Promise<SettingsActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };
  const { error } = await supabase.from("milestone_templates").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
