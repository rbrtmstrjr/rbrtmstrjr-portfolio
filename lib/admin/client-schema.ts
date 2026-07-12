import { z } from "zod";

/** Shared schema for the admin client form (client + server action). */

export const CLIENT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "past", label: "Past" },
  { value: "prospect", label: "Prospect" },
] as const;

const STATUS_VALUES = ["active", "past", "prospect"] as const;

const optionalText = z.string().trim().optional().or(z.literal(""));

export const clientFormSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(2, "Business or person name is required."),
    company: optionalText,
    contactEmail: optionalText,
    contactPhone: optionalText,
    location: optionalText,
    website: optionalText,
    source: optionalText,
    status: z.enum(STATUS_VALUES, { error: "Pick a status." }),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.contactEmail?.trim() && !z.email().safeParse(data.contactEmail.trim()).success) {
      ctx.addIssue({ code: "custom", path: ["contactEmail"], message: "That email doesn't look right." });
    }
    if (data.website?.trim() && !z.url().safeParse(data.website.trim()).success) {
      ctx.addIssue({ code: "custom", path: ["website"], message: "Enter a full URL (https://…)." });
    }
  });

export type ClientFormInput = z.input<typeof clientFormSchema>;
export type ClientFormValues = z.output<typeof clientFormSchema>;

/** Snake_case row payload for the Supabase `clients` table. */
export function clientFormToRow(v: ClientFormValues) {
  return {
    name: v.name,
    company: v.company?.trim() || null,
    contact_email: v.contactEmail?.trim() || null,
    contact_phone: v.contactPhone?.trim() || null,
    location: v.location?.trim() || null,
    website: v.website?.trim() || null,
    source: v.source?.trim() || null,
    status: v.status,
    notes: v.notes?.trim() || null,
    updated_at: new Date().toISOString(),
  };
}
