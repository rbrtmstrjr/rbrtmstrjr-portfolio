import { z } from "zod";

/** Shared schema for the admin category form (client + server action). */
export const categoryFormSchema = z.object({
  id: z.uuid().optional(),
  key: z
    .string()
    .trim()
    .min(2, "Category name is required.")
    .max(40, "Keep it short — this is a tab label.")
    .regex(/^[A-Za-z0-9][A-Za-z0-9 &+/-]*$/, "Letters, numbers, spaces and & + / - only."),
  label: z.string().trim().min(2, "Full label is required.").max(60),
  blurb: z.string().trim().max(200).optional().or(z.literal("")),
  sortOrder: z.coerce.number<number>().int().min(0).max(9999),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;
