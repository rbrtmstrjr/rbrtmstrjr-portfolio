import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { site } from "@/lib/site";

/**
 * App settings — single DB row (id = 1) editable in /admin/settings, with
 * lib/site.ts as the fallback for every site-facing value. The public site
 * only ever receives the whitelisted shape from getPublicSettings();
 * notification_email and the raw row stay server/admin-only.
 */

export type AvailabilityStatus = "available" | "booked" | "unavailable";

export type SettingsRow = {
  id: number;
  contact_email: string | null;
  notification_email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  site_domain: string | null;
  availability_status: AvailabilityStatus;
  availability_message: string | null;
  updated_at: string;
};

export type MilestoneTemplateRow = {
  id: string;
  title: string;
  default_description: string | null;
  sort_order: number;
  created_at: string;
};

/** Whitelisted, fallback-resolved values safe to render publicly. */
export type PublicSettings = {
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  siteDomain: string;
  availability: { status: AvailabilityStatus; message: string | null };
};

export async function getSettingsRow(): Promise<SettingsRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    logDbIssue("Failed to read settings", error);
    return null;
  }
  return (data as SettingsRow) ?? null;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const row = await getSettingsRow();
  return {
    contactEmail: row?.contact_email || site.email,
    githubUrl: row?.github_url || site.socials.github,
    linkedinUrl: row?.linkedin_url || site.socials.linkedin,
    siteDomain: row?.site_domain || site.url,
    availability: {
      status: row?.availability_status ?? "available",
      message: row?.availability_message || null,
    },
  };
}

/** Where inquiry/notification emails go — server-only, never rendered. */
export async function getNotificationEmail(): Promise<string> {
  const row = await getSettingsRow();
  return row?.notification_email || process.env.CONTACT_TO_EMAIL || site.email;
}

export async function getMilestoneTemplates(): Promise<MilestoneTemplateRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("milestone_templates")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    logDbIssue("Failed to read milestone templates", error);
    return [];
  }
  return (data ?? []) as MilestoneTemplateRow[];
}

function logDbIssue(what: string, error: { code?: string; message: string }) {
  if (error.code === "42P01" || /schema cache/.test(error.message)) {
    console.warn(
      `[settings-data] ${what}: ${error.message} — run supabase/upgrade-settings.sql in the SQL editor.`
    );
  } else {
    console.error(`[settings-data] ${what}:`, error.message);
  }
}
