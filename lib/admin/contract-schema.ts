import { z } from "zod";

/** Shared schemas for the contracts module (admin forms + portal inputs). */

export const CONTRACT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;

export const MILESTONE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "ready_for_review", label: "Ready for review" },
  { value: "approved", label: "Approved" },
  { value: "changes_requested", label: "Changes requested" },
] as const;

const CONTRACT_STATUS_VALUES = ["draft", "active", "completed", "archived"] as const;
const MILESTONE_STATUS_VALUES = [
  "pending",
  "in_progress",
  "ready_for_review",
  "approved",
  "changes_requested",
] as const;

const optionalText = z.string().trim().optional().or(z.literal(""));
/** yyyy-mm-dd from <input type="date"> or empty */
const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker.")
  .optional()
  .or(z.literal(""));

export const contractFormSchema = z.object({
  id: z.uuid().optional(),
  clientId: z.uuid({ error: "Pick the client this contract belongs to." }),
  title: z.string().trim().min(2, "Contract title is required."),
  summary: optionalText,
  status: z.enum(CONTRACT_STATUS_VALUES, { error: "Pick a status." }),
  scope: z.string().trim().max(8000).optional().or(z.literal("")),
  paymentTerms: z.string().trim().max(4000).optional().or(z.literal("")),
  contractDetails: z.string().trim().max(8000).optional().or(z.literal("")),
  startDate: optionalDate,
  targetEndDate: optionalDate,
  /** pesos in the form — stored as integer centavos; internal only */
  totalValue: z.coerce.number<number>().min(0).max(100_000_000).optional().or(z.literal("")),
});

export type ContractFormInput = z.input<typeof contractFormSchema>;
export type ContractFormValues = z.output<typeof contractFormSchema>;

export function contractFormToRow(v: ContractFormValues) {
  return {
    client_id: v.clientId,
    title: v.title,
    summary: v.summary?.trim() || null,
    status: v.status,
    scope: v.scope?.trim() || null,
    payment_terms: v.paymentTerms?.trim() || null,
    contract_details: v.contractDetails?.trim() || null,
    start_date: v.startDate || null,
    target_end_date: v.targetEndDate || null,
    total_value:
      typeof v.totalValue === "number" && !Number.isNaN(v.totalValue)
        ? Math.round(v.totalValue * 100)
        : null,
    updated_at: new Date().toISOString(),
  };
}

export const milestoneFormSchema = z.object({
  id: z.uuid().optional(),
  contractId: z.uuid(),
  title: z.string().trim().min(2, "Milestone title is required."),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  sortOrder: z.coerce.number<number>().int().min(0).max(9999),
});

export type MilestoneFormInput = z.input<typeof milestoneFormSchema>;

export const milestoneStatusSchema = z.enum(MILESTONE_STATUS_VALUES);

/** Per-milestone live preview link (label + URL shown on the portal). */
export const milestoneLinkFormSchema = z.object({
  id: z.uuid().optional(),
  milestoneId: z.uuid(),
  label: z.string().trim().min(2, "Give the link a label.").max(60),
  url: z.url({ error: "Enter a full URL (https://…)." }),
  sortOrder: z.coerce.number<number>().int().min(0).max(999),
});

export type MilestoneLinkFormInput = z.input<typeof milestoneLinkFormSchema>;

/** "Notify client" email trigger — always admin-initiated. */
export const notifyClientSchema = z.object({
  contractId: z.uuid(),
  milestoneId: z.uuid().optional().or(z.literal("")),
  note: z.string().trim().max(500, "Keep the note short.").optional().or(z.literal("")),
});

export type NotifyClientInput = z.input<typeof notifyClientSchema>;

/** Portal-side testimonial submission. */
export const testimonialFormSchema = z.object({
  authorName: z.string().trim().min(2, "Please tell us your name."),
  authorRole: optionalText,
  body: z
    .string()
    .trim()
    .min(10, "A sentence or two means a lot.")
    .max(1000, "That's a bit long — the highlights are enough."),
  rating: z.coerce.number<number>().int().min(1).max(5).optional().or(z.literal("")),
});

export type TestimonialFormInput = z.input<typeof testimonialFormSchema>;
