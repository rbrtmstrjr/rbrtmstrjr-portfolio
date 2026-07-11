import { z } from "zod";

export const PROJECT_TYPES = [
  "Custom software / web app",
  "AI automation",
  "Website",
  "Not sure yet",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell me your name."),
  email: z.email("That email doesn't look right."),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  projectType: z.enum(PROJECT_TYPES, {
    error: "Pick the closest fit — 'Not sure yet' is fine.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two helps me reply usefully.")
    .max(5000, "That's a bit long — the highlights are enough."),
  /** Honeypot — humans never see or fill this */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
