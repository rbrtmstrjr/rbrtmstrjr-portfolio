import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";

/**
 * Contracts — real paid engagements (separate from portfolio projects).
 * All tables are RLS-locked with no policies: admin pages read via service
 * role; the client portal reads ONLY through getPortalData(token), which
 * whitelists safe fields (never total_value, ids beyond what actions need,
 * or anything about other clients).
 */

export type ContractStatus = "draft" | "active" | "completed" | "archived";
export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "ready_for_review"
  | "approved"
  | "changes_requested";
export type TestimonialStatus = "pending" | "approved" | "rejected";

export type ContractRow = {
  id: string;
  client_id: string;
  title: string;
  summary: string | null;
  status: ContractStatus;
  portal_token: string;
  scope: string | null;
  payment_terms: string | null;
  contract_details: string | null;
  start_date: string | null;
  target_end_date: string | null;
  /** integer centavos — INTERNAL, never sent to the portal */
  total_value: number | null;
  created_at: string;
  updated_at: string;
};

export type MilestoneRow = {
  id: string;
  contract_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  status: MilestoneStatus;
  client_note: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MilestoneLinkRow = {
  id: string;
  milestone_id: string;
  label: string;
  url: string;
  type: string;
  sort_order: number;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  contract_id: string;
  milestone_id: string | null;
  sent_to: string;
  subject: string;
  note: string | null;
  sent_at: string;
};

export type AdminNotificationRow = {
  id: string;
  type: "milestone_approved" | "changes_requested" | "testimonial_submitted";
  contract_id: string;
  milestone_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export type TestimonialRow = {
  id: string;
  contract_id: string;
  client_id: string | null;
  author_name: string;
  author_role: string | null;
  body: string;
  rating: number | null;
  status: TestimonialStatus;
  published: boolean;
  created_at: string;
};

/* --------------------------------- admin --------------------------------- */

export async function getContractRows(): Promise<ContractRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    logDbIssue("Failed to read contracts", error);
    return [];
  }
  return (data ?? []) as ContractRow[];
}

export async function getContractRow(id: string): Promise<ContractRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.from("contracts").select("*").eq("id", id).maybeSingle();
  if (error) {
    logDbIssue("Failed to read contract", error);
    return null;
  }
  return (data as ContractRow) ?? null;
}

export async function getMilestoneRows(contractId?: string): Promise<MilestoneRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  let query = supabase
    .from("milestones")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (contractId) query = query.eq("contract_id", contractId);
  const { data, error } = await query;
  if (error) {
    logDbIssue("Failed to read milestones", error);
    return [];
  }
  return (data ?? []) as MilestoneRow[];
}

/** Preview links for a set of milestones, sorted. */
export async function getMilestoneLinkRows(milestoneIds: string[]): Promise<MilestoneLinkRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !milestoneIds.length) return [];
  const { data, error } = await supabase
    .from("milestone_links")
    .select("*")
    .in("milestone_id", milestoneIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    logDbIssue("Failed to read milestone links", error);
    return [];
  }
  return (data ?? []) as MilestoneLinkRow[];
}

export type ContractFileRow = {
  id: string;
  contract_id: string;
  name: string;
  path: string;
  size_bytes: number;
  created_at: string;
};

export async function getContractFileRows(contractId: string): Promise<ContractFileRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("contract_files")
    .select("*")
    .eq("contract_id", contractId)
    .order("created_at", { ascending: true });
  if (error) {
    logDbIssue("Failed to read contract files", error);
    return [];
  }
  return (data ?? []) as ContractFileRow[];
}

/** Attachments with fresh signed URLs (private bucket — 1h expiry). */
export async function getSignedContractFiles(
  contractId: string
): Promise<{ id: string; name: string; url: string; size_bytes: number }[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const rows = await getContractFileRows(contractId);
  const out: { id: string; name: string; url: string; size_bytes: number }[] = [];
  for (const row of rows) {
    const { data } = await supabase.storage
      .from("contract-files")
      .createSignedUrl(row.path, 3600);
    if (data?.signedUrl) {
      out.push({ id: row.id, name: row.name, url: data.signedUrl, size_bytes: row.size_bytes });
    }
  }
  return out;
}

/** Testimonials awaiting review — dashboard "needs attention" signal. */
export async function getPendingTestimonialCount(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) return 0;
  return count ?? 0;
}

/** Admin inbox — newest first, capped for the top-bar dropdown. */
export async function getAdminNotifications(limit = 15): Promise<AdminNotificationRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    logDbIssue("Failed to read admin notifications", error);
    return [];
  }
  return (data ?? []) as AdminNotificationRow[];
}

export async function getNotificationRows(contractId: string): Promise<NotificationRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("contract_notifications")
    .select("*")
    .eq("contract_id", contractId)
    .order("sent_at", { ascending: false })
    .limit(20);
  if (error) {
    logDbIssue("Failed to read notifications", error);
    return [];
  }
  return (data ?? []) as NotificationRow[];
}

export async function getTestimonialForContract(
  contractId: string
): Promise<TestimonialRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("contract_id", contractId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    logDbIssue("Failed to read testimonial", error);
    return null;
  }
  return (data as TestimonialRow) ?? null;
}

/* --------------------------------- portal -------------------------------- */

/** The exact shape the portal is allowed to see — nothing internal. */
export type PortalData = {
  clientName: string;
  contract: {
    title: string;
    summary: string | null;
    status: ContractStatus;
    scope: string | null;
    payment_terms: string | null;
    contract_details: string | null;
    start_date: string | null;
    target_end_date: string | null;
  };
  milestones: {
    id: string;
    title: string;
    description: string | null;
    status: MilestoneStatus;
    client_note: string | null;
    approved_at: string | null;
    /** labeled live-preview links attached by admin */
    links: { id: string; label: string; url: string }[];
  }[];
  /** contract documents — signed URLs, safe to hand the client */
  files: { id: string; name: string; url: string }[];
  /** whether a testimonial was already submitted for this contract */
  testimonialSubmitted: boolean;
};

export async function getPortalData(token: string): Promise<PortalData | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !token || token.length < 10) return null;

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("portal_token", token)
    .maybeSingle();
  if (error || !contract) return null;
  const row = contract as ContractRow;

  const [{ data: client }, milestones, testimonial] = await Promise.all([
    supabase.from("clients").select("name, company").eq("id", row.client_id).maybeSingle(),
    getMilestoneRows(row.id),
    getTestimonialForContract(row.id),
  ]);
  // links + files are keyed off THIS contract only — token scope holds
  const [links, files] = await Promise.all([
    getMilestoneLinkRows(milestones.map((m) => m.id)),
    getSignedContractFiles(row.id),
  ]);

  return {
    clientName: (client?.company || client?.name) ?? "Client",
    contract: {
      title: row.title,
      summary: row.summary,
      status: row.status,
      scope: row.scope,
      payment_terms: row.payment_terms,
      contract_details: row.contract_details,
      start_date: row.start_date,
      target_end_date: row.target_end_date,
    },
    milestones: milestones.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      client_note: m.client_note,
      approved_at: m.approved_at,
      links: links
        .filter((l) => l.milestone_id === m.id)
        .map((l) => ({ id: l.id, label: l.label, url: l.url })),
    })),
    files: files.map((f) => ({ id: f.id, name: f.name, url: f.url })),
    testimonialSubmitted: Boolean(testimonial),
  };
}

/* --------------------------------- public -------------------------------- */

export type PublishedTestimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  body: string;
  rating: number | null;
};

/** Only approved AND published — the public site's sole testimonial source. */
export async function getPublishedTestimonials(): Promise<PublishedTestimonial[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author_name, author_role, body, rating")
    .eq("status", "approved")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) {
    logDbIssue("Failed to read published testimonials", error);
    return [];
  }
  return (data ?? []) as PublishedTestimonial[];
}

function logDbIssue(what: string, error: { code?: string; message: string }) {
  if (error.code === "42P01" || /schema cache/.test(error.message)) {
    console.warn(
      `[contracts-data] ${what}: ${error.message} — run supabase/upgrade-contracts.sql in the SQL editor.`
    );
  } else {
    console.error(`[contracts-data] ${what}:`, error.message);
  }
}
