"use server";

import { getSupabaseAdmin } from "@/lib/supabase-server";
import { testimonialFormSchema, type TestimonialFormInput } from "@/lib/admin/contract-schema";

/**
 * Client-portal actions — NO auth; the unguessable portal token IS the
 * credential, and every action is scoped to the one contract it resolves to.
 * A caller can never touch another contract's data: the token lookup happens
 * first, and every mutation is additionally filtered by that contract's id.
 */

export type PortalActionResult = { ok: true } | { ok: false; error: string };

async function resolveContract(token: string) {
  if (!token || token.length < 10) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase
    .from("contracts")
    .select("id, client_id, status, title")
    .eq("portal_token", token)
    .maybeSingle();
  return data
    ? {
        supabase,
        contract: data as { id: string; client_id: string; status: string; title: string },
      }
    : null;
}

/** Best-effort admin-inbox write — the client action must not fail on it. */
async function notifyAdmin(
  ctx: NonNullable<Awaited<ReturnType<typeof resolveContract>>>,
  type: "milestone_approved" | "changes_requested" | "testimonial_submitted",
  message: string,
  milestoneId?: string
) {
  const { error } = await ctx.supabase.from("admin_notifications").insert({
    type,
    contract_id: ctx.contract.id,
    milestone_id: milestoneId ?? null,
    message,
  });
  if (error) console.warn("[portal] admin notification insert failed:", error.message);
}

/** Approve a milestone — only allowed while it's ready_for_review. */
export async function approveMilestone(
  token: string,
  milestoneId: string
): Promise<PortalActionResult> {
  const ctx = await resolveContract(token);
  if (!ctx) return { ok: false, error: "This link is no longer valid." };

  const { error, data } = await ctx.supabase
    .from("milestones")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", milestoneId)
    .eq("contract_id", ctx.contract.id) // token scope — can't cross contracts
    .eq("status", "ready_for_review") // only reviewable milestones
    .select("id, title");
  if (error) return { ok: false, error: "Something went wrong — try again." };
  if (!data?.length) return { ok: false, error: "This milestone isn't awaiting review." };

  await notifyAdmin(
    ctx,
    "milestone_approved",
    `${ctx.contract.title}: “${data[0].title}” was approved by the client.`,
    milestoneId
  );
  return { ok: true };
}

/** Request changes with a note — only while ready_for_review. */
export async function requestMilestoneChanges(
  token: string,
  milestoneId: string,
  note: string
): Promise<PortalActionResult> {
  const ctx = await resolveContract(token);
  if (!ctx) return { ok: false, error: "This link is no longer valid." };

  const trimmed = note.trim().slice(0, 1000);
  if (trimmed.length < 5) {
    return { ok: false, error: "Add a short note so we know what to change." };
  }

  const { error, data } = await ctx.supabase
    .from("milestones")
    .update({
      status: "changes_requested",
      client_note: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", milestoneId)
    .eq("contract_id", ctx.contract.id)
    .eq("status", "ready_for_review")
    .select("id, title");
  if (error) return { ok: false, error: "Something went wrong — try again." };
  if (!data?.length) return { ok: false, error: "This milestone isn't awaiting review." };

  await notifyAdmin(
    ctx,
    "changes_requested",
    `${ctx.contract.title}: changes requested on “${data[0].title}” — ${trimmed}`,
    milestoneId
  );
  return { ok: true };
}

/** Submit a testimonial — completed contracts only, one per contract. */
export async function submitTestimonial(
  token: string,
  input: TestimonialFormInput
): Promise<PortalActionResult> {
  const ctx = await resolveContract(token);
  if (!ctx) return { ok: false, error: "This link is no longer valid." };
  if (ctx.contract.status !== "completed") {
    return { ok: false, error: "Testimonials open once the project is completed." };
  }

  const parsed = testimonialFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Check the form — a name and a short message are needed." };
  }

  const { data: existing } = await ctx.supabase
    .from("testimonials")
    .select("id")
    .eq("contract_id", ctx.contract.id)
    .limit(1)
    .maybeSingle();
  if (existing) return { ok: false, error: "A testimonial was already submitted — thank you!" };

  const { error } = await ctx.supabase.from("testimonials").insert({
    contract_id: ctx.contract.id,
    client_id: ctx.contract.client_id,
    author_name: parsed.data.authorName,
    author_role: parsed.data.authorRole?.trim() || null,
    body: parsed.data.body,
    rating:
      typeof parsed.data.rating === "number" && !Number.isNaN(parsed.data.rating)
        ? parsed.data.rating
        : null,
    status: "pending", // admin review gate — never public from here
    published: false,
  });
  if (error) return { ok: false, error: "Something went wrong — try again." };

  await notifyAdmin(
    ctx,
    "testimonial_submitted",
    `${ctx.contract.title}: ${parsed.data.authorName} submitted a testimonial — review it.`
  );
  return { ok: true };
}
