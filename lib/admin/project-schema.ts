import { z } from "zod";
import type { Project, ProjectCategory } from "@/lib/projects";

/**
 * Shared schema for the admin project form (client + server action), mirroring
 * the Project type in lib/projects.ts. Card + study fields are flattened for
 * react-hook-form; formToStudy/formToRow rebuild the nested Project shape.
 */

export const PROJECT_STATUSES = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In progress" },
  { value: "just-started", label: "Just started" },
] as const;

const STATUS_VALUES = ["completed", "in-progress", "just-started"] as const;

const optionalText = z.string().trim().optional().or(z.literal(""));

export const galleryItemSchema = z.object({
  src: optionalText,
  alt: z.string().trim().min(3, "Describe the screenshot for screen readers."),
  caption: optionalText,
});

export const projectFormSchema = z
  .object({
    id: z.uuid().optional(),
    slug: z
      .string()
      .trim()
      .min(2, "Slug is required.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only."),
    title: z.string().trim().min(2, "Title is required."),
    client: z.string().trim().min(2, "Client (or “Own product”) is required."),
    /** optional structured link to a clients row — display text above stays */
    clientId: z.uuid().optional().or(z.literal("")),
    // validated against the merged category list in the server action
    category: z.string().trim().min(2, "Pick a category."),
    status: z.enum(STATUS_VALUES, { error: "Pick a status." }),
    flagship: z.boolean(),
    placeholder: z.boolean(),
    published: z.boolean(),
    sortOrder: z.coerce.number<number>().int().min(0).max(9999),
    year: optionalText,
    duration: optionalText,
    role: optionalText,
    testimonialQuote: z.string().trim().max(600).optional().or(z.literal("")),
    testimonialAuthor: optionalText,
    problem: z.string().trim().min(10, "The one-line problem shown on the card."),
    result: z.string().trim().min(10, "The one-line payoff shown on the card."),
    metricValue: optionalText,
    metricLabel: optionalText,
    image: optionalText,
    intro: z.string().trim().min(10, "The case-study intro paragraph."),
    studyProblem: z.string().trim().min(10, "Tell the “before” story."),
    approach: z.string().trim().min(10, "How you thought about it."),
    solution: z.string().trim().min(10, "What you built."),
    outcome: z.string().trim().min(10, "What changed after launch."),
    tech: z.string().trim().min(2, "Comma-separated, e.g. “Next.js, Supabase”."),
    gallery: z.array(galleryItemSchema),
    linkHref: optionalText,
    linkLabel: optionalText,
  })
  .superRefine((data, ctx) => {
    if (!!data.metricValue?.trim() !== !!data.metricLabel?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: [data.metricValue?.trim() ? "metricLabel" : "metricValue"],
        message: "Metric needs both a value and a label (or neither).",
      });
    }
    if (data.linkHref?.trim() && !z.url().safeParse(data.linkHref.trim()).success) {
      ctx.addIssue({ code: "custom", path: ["linkHref"], message: "Enter a full URL (https://…)." });
    }
    if (!!data.linkHref?.trim() !== !!data.linkLabel?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: [data.linkHref?.trim() ? "linkLabel" : "linkHref"],
        message: "External link needs both a URL and a label (or neither).",
      });
    }
    if (!!data.testimonialQuote?.trim() !== !!data.testimonialAuthor?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: [data.testimonialQuote?.trim() ? "testimonialAuthor" : "testimonialQuote"],
        message: "Testimonial needs both a quote and an author (or neither).",
      });
    }
  });

export type ProjectFormInput = z.input<typeof projectFormSchema>;
export type ProjectFormValues = z.output<typeof projectFormSchema>;

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function splitTech(tech: string): string[] {
  return tech
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Rebuild the nested Project.study block from the flattened form values. */
export function formToStudy(v: ProjectFormValues): Project["study"] {
  const gallery = v.gallery
    .filter((g) => g.alt.trim())
    .map((g) => ({
      src: g.src?.trim() || undefined,
      alt: g.alt.trim(),
      caption: g.caption?.trim() || undefined,
    }));
  return {
    intro: v.intro,
    problem: v.studyProblem,
    approach: v.approach,
    solution: v.solution,
    outcome: v.outcome,
    tech: splitTech(v.tech),
    gallery: gallery.length ? gallery : undefined,
    link:
      v.linkHref?.trim() && v.linkLabel?.trim()
        ? { href: v.linkHref.trim(), label: v.linkLabel.trim() }
        : undefined,
  };
}

/** Snake_case row payload for the Supabase `projects` table. */
export function formToRow(v: ProjectFormValues) {
  return {
    slug: v.slug,
    title: v.title,
    client: v.client,
    client_id: v.clientId || null,
    category: v.category as ProjectCategory,
    status: v.status,
    flagship: v.flagship,
    placeholder: v.placeholder,
    published: v.published,
    sort_order: v.sortOrder,
    problem: v.problem,
    result: v.result,
    metric:
      v.metricValue?.trim() && v.metricLabel?.trim()
        ? { value: v.metricValue.trim(), label: v.metricLabel.trim() }
        : null,
    image: v.image?.trim() || null,
    year: v.year?.trim() || null,
    duration: v.duration?.trim() || null,
    role: v.role?.trim() || null,
    testimonial:
      v.testimonialQuote?.trim() && v.testimonialAuthor?.trim()
        ? { quote: v.testimonialQuote.trim(), author: v.testimonialAuthor.trim() }
        : null,
    study: formToStudy(v),
    updated_at: new Date().toISOString(),
  };
}
