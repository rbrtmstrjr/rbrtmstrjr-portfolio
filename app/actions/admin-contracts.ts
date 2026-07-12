"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getAdminUser } from "@/lib/supabase/server-auth";
import { Resend } from "resend";
import { site } from "@/lib/site";
import {
  contractFormSchema,
  contractFormToRow,
  milestoneFormSchema,
  milestoneLinkFormSchema,
  milestoneStatusSchema,
  notifyClientSchema,
  type ContractFormInput,
  type MilestoneFormInput,
  type MilestoneLinkFormInput,
  type NotifyClientInput,
} from "@/lib/admin/contract-schema";
import type { MilestoneStatus, TestimonialStatus } from "@/lib/contracts-data";

export type ContractActionResult = { ok: true; id: string } | { ok: false; error: string };

function newPortalToken() {
  // 24 chars base64url ≈ 144 bits — unguessable, URL-safe
  return randomBytes(18).toString("base64url");
}

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) return null;
  return getSupabaseAdmin();
}

/* -------------------------------- contracts ------------------------------- */

export async function saveContract(input: ContractFormInput): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = contractFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Some fields are invalid — check the form and retry." };
  }

  const row = contractFormToRow(parsed.data);

  if (parsed.data.id) {
    const { error } = await supabase.from("contracts").update(row).eq("id", parsed.data.id);
    if (error) return { ok: false, error: friendly(error.code, error.message) };
    return { ok: true, id: parsed.data.id };
  }

  const { data, error } = await supabase
    .from("contracts")
    .insert({ ...row, portal_token: newPortalToken() })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: friendly(error?.code, error?.message) };
  return { ok: true, id: data.id as string };
}

export async function deleteContract(id: string): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };
  // milestones + testimonials cascade with the contract
  const { error } = await supabase.from("contracts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}

/** Quick status change from the detail header (drives the completion flow). */
export async function setContractStatus(
  id: string,
  status: "draft" | "active" | "completed" | "archived"
): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };
  if (!["draft", "active", "completed", "archived"].includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const { error } = await supabase
    .from("contracts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}

/* -------------------------------- milestones ------------------------------ */

export async function saveMilestone(input: MilestoneFormInput): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = milestoneFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Some fields are invalid — check the form and retry." };
  }

  const row = {
    contract_id: parsed.data.contractId,
    title: parsed.data.title,
    description: parsed.data.description?.trim() || null,
    sort_order: parsed.data.sortOrder,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.id) {
    const { error } = await supabase.from("milestones").update(row).eq("id", parsed.data.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: parsed.data.id };
  }
  const { data, error } = await supabase.from("milestones").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: error?.message ?? "Failed to add milestone." };
  return { ok: true, id: data.id as string };
}

export async function deleteMilestone(id: string): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}

export async function setMilestoneStatus(
  id: string,
  status: MilestoneStatus
): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = milestoneStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid status." };

  const patch: Record<string, unknown> = {
    status: parsed.data,
    updated_at: new Date().toISOString(),
  };
  if (parsed.data === "approved") patch.approved_at = new Date().toISOString();
  // moving it back into work clears the client's old note
  if (parsed.data === "in_progress" || parsed.data === "pending") patch.client_note = null;

  const { error } = await supabase.from("milestones").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}

/* ------------------------------ contract files ---------------------------- */

const FILE_BUCKET = "contract-files";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".png", ".jpg", ".jpeg", ".webp",
];

/** Upload a contract document (Word/PDF/…) to the PRIVATE bucket. */
export async function uploadContractFile(
  contractId: string,
  formData: FormData
): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) {
    return { ok: false, error: "No file received." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `"${file.name}" is over 10 MB.` };
  }
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: `"${ext}" files aren't supported.` };
  }

  const safeName = file.name.replace(/[^\w.\- ]+/g, "_").slice(-100);
  const path = `${contractId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(FILE_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) return { ok: false, error: `Upload failed: ${uploadError.message}` };

  const { data, error } = await supabase
    .from("contract_files")
    .insert({ contract_id: contractId, name: file.name, path, size_bytes: file.size })
    .select("id")
    .single();
  if (error || !data) {
    await supabase.storage.from(FILE_BUCKET).remove([path]);
    return { ok: false, error: friendly(error?.code, error?.message) };
  }
  return { ok: true, id: data.id as string };
}

export async function deleteContractFile(id: string): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const { data: row } = await supabase
    .from("contract_files")
    .select("path")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { ok: false, error: "File not found — it may already be deleted." };

  await supabase.storage.from(FILE_BUCKET).remove([row.path]);
  const { error } = await supabase.from("contract_files").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}

/* ----------------------------- milestone links ---------------------------- */

export async function saveMilestoneLink(
  input: MilestoneLinkFormInput
): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = milestoneLinkFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "A label and a full URL (https://…) are required." };
  }

  const row = {
    milestone_id: parsed.data.milestoneId,
    label: parsed.data.label,
    url: parsed.data.url,
    sort_order: parsed.data.sortOrder,
  };

  if (parsed.data.id) {
    const { error } = await supabase.from("milestone_links").update(row).eq("id", parsed.data.id);
    if (error) return { ok: false, error: friendly(error.code, error.message) };
    return { ok: true, id: parsed.data.id };
  }
  const { data, error } = await supabase.from("milestone_links").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: friendly(error?.code, error?.message) };
  return { ok: true, id: data.id as string };
}

export async function deleteMilestoneLink(id: string): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };
  const { error } = await supabase.from("milestone_links").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}

/* ------------------------- notify client (Resend) ------------------------- */

const MILESTONE_PHRASES: Record<string, string> = {
  ready_for_review: "is ready for your review",
  approved: "has been approved",
  in_progress: "is now in progress",
  changes_requested: "— we're on the changes you requested",
  pending: "is queued up next",
};

/** Manual, admin-only progress email with a portal link. Never auto-fired. */
export async function notifyClient(input: NotifyClientInput): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = notifyClientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid notification request." };

  const { data: contract } = await supabase
    .from("contracts")
    .select("id, title, status, portal_token, client_id")
    .eq("id", parsed.data.contractId)
    .maybeSingle();
  if (!contract) return { ok: false, error: "Contract not found." };

  const { data: client } = await supabase
    .from("clients")
    .select("name, company, contact_email")
    .eq("id", contract.client_id)
    .maybeSingle();
  const recipient = client?.contact_email;
  if (!recipient) {
    return { ok: false, error: "This client has no email on file — add one first." };
  }

  let milestone: { id: string; title: string; status: string } | null = null;
  if (parsed.data.milestoneId) {
    const { data: m } = await supabase
      .from("milestones")
      .select("id, title, status, contract_id")
      .eq("id", parsed.data.milestoneId)
      .eq("contract_id", contract.id)
      .maybeSingle();
    if (!m) return { ok: false, error: "That milestone doesn't belong to this contract." };
    milestone = m;
  }

  const clientLabel = client.company || client.name;
  const completed = contract.status === "completed";
  const changeLine = milestone
    ? `“${milestone.title}” ${MILESTONE_PHRASES[milestone.status] ?? "has an update"}.`
    : completed
      ? "Your project is complete — every milestone is done."
      : "There's fresh progress on your project.";
  const subject = milestone
    ? `${contract.title} — ${milestone.title}: ${
        milestone.status === "ready_for_review" ? "ready for your review" : "update"
      }`
    : completed
      ? `${contract.title} — project complete 🎉`
      : `${contract.title} — progress update`;
  const note = parsed.data.note?.trim();
  const portalUrl = `${site.url}/client/${contract.portal_token}`;

  // Inline styles + hardcoded brand hex: emails can't read CSS vars (same
  // exception as the OG image).
  const html = `
  <div style="margin:0;padding:32px 16px;background:#f2f6fb;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3e9f2;border-radius:16px;overflow:hidden;">
      <div style="padding:20px 28px;border-bottom:1px solid #e3e9f2;">
        <span style="font-size:20px;font-weight:bold;color:#131b2e;">RM.</span>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 16px;font-size:15px;color:#131b2e;">Hi ${escapeHtml(clientLabel)},</p>
        <p style="margin:0 0 8px;font-size:13px;color:#5b6474;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(contract.title)}</p>
        <p style="margin:0 0 16px;font-size:16px;font-weight:bold;color:#131b2e;">${escapeHtml(changeLine)}</p>
        ${
          note
            ? `<p style="margin:0 0 16px;padding:12px 16px;border-left:3px solid #0c4eff;background:#f2f6fb;border-radius:8px;font-size:14px;color:#131b2e;">${escapeHtml(note)}</p>`
            : ""
        }
        <a href="${portalUrl}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#0c4eff;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:10px;">
          Open your project portal →
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#8a93a5;">This is your private link — please don't forward it.</p>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #e3e9f2;font-size:12px;color:#8a93a5;">
        ${escapeHtml(site.name)} · <a href="mailto:${site.email}" style="color:#0c4eff;text-decoration:none;">${site.email}</a>
      </div>
    </div>
  </div>`;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[notify-client] RESEND_API_KEY missing — dev fallback, logging instead:", {
        to: recipient,
        subject,
        note,
        portalUrl,
      });
    } else {
      return { ok: false, error: "Email isn't configured (RESEND_API_KEY missing)." };
    }
  } else {
    try {
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
        to: recipient,
        replyTo: site.email,
        subject,
        html,
      });
      if (error) return { ok: false, error: `Email failed: ${error.message}` };
    } catch (err) {
      console.error("[notify-client] send failed:", err);
      return { ok: false, error: "Email failed to send — try again." };
    }
  }

  // log it so "did I already tell them?" has an answer
  await supabase.from("contract_notifications").insert({
    contract_id: contract.id,
    milestone_id: milestone?.id ?? null,
    sent_to: recipient,
    subject,
    note: note || null,
  });

  return { ok: true, id: contract.id };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* --------------------------- admin notifications -------------------------- */

export async function markAllNotificationsRead(): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };
  const { error } = await supabase
    .from("admin_notifications")
    .update({ read: true })
    .eq("read", false);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: "all" };
}

/* ------------------------------- testimonials ----------------------------- */

/** Review gate: approve/reject + publish. Publishing regenerates the site. */
export async function reviewTestimonial(
  id: string,
  patch: { status?: TestimonialStatus; published?: boolean }
): Promise<ContractActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Your session expired — sign in again." };

  const update: Record<string, unknown> = {};
  if (patch.status && ["pending", "approved", "rejected"].includes(patch.status)) {
    update.status = patch.status;
    if (patch.status !== "approved") update.published = false;
  }
  if (typeof patch.published === "boolean") update.published = patch.published;
  if (!Object.keys(update).length) return { ok: false, error: "Nothing to update." };

  const { error } = await supabase.from("testimonials").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  // published testimonials render on the public site — regenerate it
  revalidatePath("/", "layout");
  return { ok: true, id };
}

function friendly(code?: string, message?: string) {
  if (code === "23503") return "That client no longer exists — pick another.";
  if (code === "42P01")
    return "The contracts tables don't exist yet — run supabase/upgrade-contracts.sql.";
  return message ?? "Something went wrong.";
}
