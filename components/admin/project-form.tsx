"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, ImagePlus, Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WindowCard } from "@/components/ui/window-card";
import { ProjectImage } from "@/components/site/project-image";
import {
  ImageUpload,
  softnessWarning,
  uploadOptimizedImage,
} from "@/components/admin/image-upload";
import {
  COVER_MAX_EDGE,
  GALLERY_MAX_EDGE,
} from "@/lib/admin/optimize-image";
import {
  PROJECT_STATUSES,
  projectFormSchema,
  slugify,
  type ProjectFormInput,
  type ProjectFormValues,
} from "@/lib/admin/project-schema";
import { saveProject } from "@/app/actions/admin-projects";
import type { ProjectRow } from "@/lib/projects-data";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function rowToDefaults(row: ProjectRow): ProjectFormInput {
  const s = row.study ?? {};
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    clientId: row.client_id ?? "",
    category: row.category,
    status: row.status ?? "completed",
    flagship: row.flagship,
    placeholder: row.placeholder,
    published: row.published,
    sortOrder: row.sort_order,
    problem: row.problem,
    result: row.result,
    metricValue: row.metric?.value ?? "",
    metricLabel: row.metric?.label ?? "",
    image: row.image ?? "",
    year: row.year ?? "",
    duration: row.duration ?? "",
    role: row.role ?? "",
    testimonialQuote: row.testimonial?.quote ?? "",
    testimonialAuthor: row.testimonial?.author ?? "",
    intro: s.intro ?? "",
    studyProblem: s.problem ?? "",
    approach: s.approach ?? "",
    solution: s.solution ?? "",
    outcome: s.outcome ?? "",
    tech: (s.tech ?? []).join(", "),
    gallery: (s.gallery ?? []).map((g) => ({
      src: g.src ?? "",
      alt: g.alt,
      caption: g.caption ?? "",
    })),
    linkHref: s.link?.href ?? "",
    linkLabel: s.link?.label ?? "",
  };
}

const BLANK: ProjectFormInput = {
  slug: "",
  title: "",
  client: "",
  clientId: "",
  category: "Custom Apps",
  status: "completed",
  flagship: false,
  placeholder: false,
  published: false,
  sortOrder: 0,
  problem: "",
  result: "",
  metricValue: "",
  metricLabel: "",
  image: "",
  year: "",
  duration: "",
  role: "",
  testimonialQuote: "",
  testimonialAuthor: "",
  intro: "",
  studyProblem: "",
  approach: "",
  solution: "",
  outcome: "",
  tech: "",
  gallery: [],
  linkHref: "",
  linkLabel: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}

function SectionHeading({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <p className="eyebrow">{children}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ToggleField({
  label,
  hint,
  registration,
}: {
  label: string;
  hint: string;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors has-checked:border-primary/40 has-checked:bg-primary/[0.04]">
      <input type="checkbox" className="mt-0.5 size-4 accent-primary" {...registration} />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs leading-relaxed text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

/** Live card preview — mirrors the Work-section ProjectCard layout. */
function CardPreview({ values }: { values: ProjectFormInput }) {
  const slug = values.slug || "new-project";
  return (
    <WindowCard label={`work/${slug}`} contentClassName="flex flex-col">
      <div className="overflow-hidden border-b border-border">
        <ProjectImage
          src={values.image?.trim() || undefined}
          alt="Cover preview"
          label={(values.title || "P").charAt(0)}
          className="aspect-[16/10]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        {values.flagship ? (
          <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            <Sparkles className="size-3" aria-hidden />
            Flagship
          </span>
        ) : null}
        <h3 className="font-sans text-2xl font-semibold tracking-tight">
          {values.title || "Project title"}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {values.client || "Client name"}
        </p>
        <div className="mt-5 space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Problem: </span>
            {values.problem || "One line on what was broken."}
          </p>
          <p className="rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm font-medium leading-relaxed">
            {values.result || "One line on what changed after launch."}
          </p>
        </div>
        <span className="mt-6 flex items-center gap-1.5 text-sm font-medium text-primary">
          Case study
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
    </WindowCard>
  );
}

const NO_CLIENT = "none";

export function ProjectForm({
  initial,
  categories,
  clients = [],
}: {
  initial?: ProjectRow;
  /** merged built-in + managed categories (from getAllCategories) */
  categories: { key: string; label: string }[];
  /** existing clients for the optional structured link */
  clients?: { id: string; name: string; company: string | null }[];
}) {
  const router = useRouter();
  const [slugEdited, setSlugEdited] = React.useState(Boolean(initial));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initial ? rowToDefaults(initial) : BLANK,
  });

  const gallery = useFieldArray({ control, name: "gallery" });
  const bulkInputRef = React.useRef<HTMLInputElement>(null);
  const [bulkUploading, setBulkUploading] = React.useState(false);
  const values = watch();
  const slugOk = SLUG_RE.test(values.slug ?? "");
  const uploadHint = slugOk ? undefined : "Set a valid slug first — uploads are filed under it.";

  // Slug follows the title until it's been touched by hand (or we're editing).
  const title = watch("title");
  React.useEffect(() => {
    if (!slugEdited) setValue("slug", slugify(title ?? ""), { shouldValidate: false });
  }, [title, slugEdited, setValue]);

  /** "screenshot_pos-register.png" → "screenshot pos register" */
  function altFromFilename(name: string) {
    const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
    return base.length >= 3 ? base : "Project screenshot";
  }

  async function onBulkGallery(list: FileList | null) {
    if (!list?.length) return;
    if (!slugOk) {
      toast.error("Set a valid slug first — uploads are filed under it.");
      return;
    }
    setBulkUploading(true);
    let added = 0;
    let softWarned = false;
    for (const file of Array.from(list)) {
      const path = `${values.slug}/gallery-${gallery.fields.length + added + 1}-${Date.now().toString(36)}.webp`;
      const result = await uploadOptimizedImage(path, file, GALLERY_MAX_EDGE);
      if ("error" in result) {
        toast.error(`${file.name}: ${result.error}`);
        continue;
      }
      gallery.append({ src: result.url, alt: altFromFilename(file.name), caption: "" });
      added++;
      if (!softWarned && softnessWarning(result.width, GALLERY_MAX_EDGE)) softWarned = true;
    }
    if (added) {
      toast.success(
        `${added} image${added === 1 ? "" : "s"} added to the gallery — tidy up the alt texts, then save.`
      );
      if (softWarned) {
        toast.warning("Some sources were small and may look soft — larger originals help.", {
          duration: 8000,
        });
      }
    }
    setBulkUploading(false);
    if (bulkInputRef.current) bulkInputRef.current.value = "";
  }

  async function onSubmit(parsed: ProjectFormValues) {
    const result = await saveProject({ ...parsed, id: initial?.id });
    if (result.ok) {
      toast.success(
        parsed.published
          ? "Saved — the site is regenerating with this project."
          : "Saved as draft — publish it when it's ready."
      );
      router.push("/admin/projects");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-10">
        {/* ------------------------------ card ------------------------------ */}
        <section className="space-y-5">
          <SectionHeading hint="What shows on the homepage grid.">Card</SectionHeading>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-title">
                Title <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-title"
                placeholder="Point-of-Sale & Stock System"
                className="mt-1.5"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>
            <div>
              <Label htmlFor="pf-slug">
                Slug <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-slug"
                placeholder="retail-pos"
                className="mt-1.5 font-mono text-xs"
                aria-invalid={!!errors.slug}
                {...register("slug", { onChange: () => setSlugEdited(true) })}
              />
              <FieldError message={errors.slug?.message} />
              {initial ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Changing the slug changes the /work URL; uploaded media keeps the old folder.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-client">
                Client <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-client"
                placeholder="Mr. Kamote Chips — Joshua (or “Own product”)"
                className="mt-1.5"
                aria-invalid={!!errors.client}
                {...register("client")}
              />
              <FieldError message={errors.client?.message} />
            </div>
            <div>
              <Label htmlFor="pf-category">
                Category <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="pf-category"
                      className="mt-1.5 w-full"
                      aria-invalid={!!errors.category}
                    >
                      <SelectValue placeholder="Pick a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.category?.message} />
            </div>
          </div>

          <div className="sm:max-w-sm">
            <Label htmlFor="pf-client-link">Link to client (optional)</Label>
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Select
                  value={field.value || NO_CLIENT}
                  onValueChange={(v) => field.onChange(v === NO_CLIENT ? "" : v)}
                >
                  <SelectTrigger id="pf-client-link" className="mt-1.5 w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CLIENT}>None</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        {c.company ? ` — ${c.company}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Internal link for the Clients module — the public card keeps showing the
              Client text above.
            </p>
          </div>

          <div>
            <Label htmlFor="pf-problem">
              Problem (one line) <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Textarea
              id="pf-problem"
              rows={2}
              placeholder="Sales rung up by hand, stock counted on paper…"
              className="mt-1.5"
              aria-invalid={!!errors.problem}
              {...register("problem")}
            />
            <FieldError message={errors.problem?.message} />
          </div>

          <div>
            <Label htmlFor="pf-result">
              Result (the payoff callout) <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Textarea
              id="pf-result"
              rows={2}
              placeholder="Checkout, inventory, and daily reporting in one system…"
              className="mt-1.5"
              aria-invalid={!!errors.result}
              {...register("result")}
            />
            <FieldError message={errors.result?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-metric-value">Metric value (optional)</Label>
              <Input
                id="pf-metric-value"
                placeholder="30%"
                className="mt-1.5"
                aria-invalid={!!errors.metricValue}
                {...register("metricValue")}
              />
              <FieldError message={errors.metricValue?.message} />
            </div>
            <div>
              <Label htmlFor="pf-metric-label">Metric label</Label>
              <Input
                id="pf-metric-label"
                placeholder="fewer late deliveries"
                className="mt-1.5"
                aria-invalid={!!errors.metricLabel}
                {...register("metricLabel")}
              />
              <FieldError message={errors.metricLabel?.message} />
            </div>
          </div>

          <div>
            <Label>Cover image</Label>
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUpload
                  path={`${values.slug || "unsaved"}/cover.webp`}
                  maxEdge={COVER_MAX_EDGE}
                  value={field.value || undefined}
                  onChange={field.onChange}
                  label="Cover"
                  disabledReason={uploadHint}
                  className="mt-2"
                />
              )}
            />
          </div>
        </section>

        {/* --------------------------- case study --------------------------- */}
        <section className="space-y-5 border-t border-border pt-8">
          <SectionHeading hint="The /work page: problem → approach → solution → outcome.">
            Case study
          </SectionHeading>

          {(
            [
              ["intro", "Intro", "One paragraph setting up the story."],
              ["studyProblem", "The problem", "What was actually broken, before."],
              ["approach", "The approach", "How you thought about it."],
              ["solution", "The solution", "What you built."],
              ["outcome", "The outcome", "What changed after launch."],
            ] as const
          ).map(([name, label, placeholder]) => (
            <div key={name}>
              <Label htmlFor={`pf-${name}`}>
                {label} <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Textarea
                id={`pf-${name}`}
                rows={3}
                placeholder={placeholder}
                className="mt-1.5"
                aria-invalid={!!errors[name]}
                {...register(name)}
              />
              <FieldError message={errors[name]?.message} />
            </div>
          ))}

          <div>
            <Label htmlFor="pf-tech">
              Tech (comma-separated) <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input
              id="pf-tech"
              placeholder="Next.js, Supabase, Realtime database"
              className="mt-1.5"
              aria-invalid={!!errors.tech}
              {...register("tech")}
            />
            <FieldError message={errors.tech?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="pf-year">Year (optional)</Label>
              <Input id="pf-year" placeholder="2026" className="mt-1.5" {...register("year")} />
            </div>
            <div>
              <Label htmlFor="pf-duration">Duration (optional)</Label>
              <Input
                id="pf-duration"
                placeholder="6 weeks"
                className="mt-1.5"
                {...register("duration")}
              />
            </div>
            <div>
              <Label htmlFor="pf-role">My role (optional)</Label>
              <Input
                id="pf-role"
                placeholder="Design + engineering, end to end"
                className="mt-1.5"
                {...register("role")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pf-testimonial-quote">Client testimonial (optional)</Label>
            <Textarea
              id="pf-testimonial-quote"
              rows={3}
              placeholder="What the client said, in their words…"
              className="mt-1.5"
              aria-invalid={!!errors.testimonialQuote}
              {...register("testimonialQuote")}
            />
            <FieldError message={errors.testimonialQuote?.message} />
          </div>
          <div className="sm:max-w-sm">
            <Label htmlFor="pf-testimonial-author">Testimonial author</Label>
            <Input
              id="pf-testimonial-author"
              placeholder="Joshua, Mr. Kamote Chips"
              className="mt-1.5"
              aria-invalid={!!errors.testimonialAuthor}
              {...register("testimonialAuthor")}
            />
            <FieldError message={errors.testimonialAuthor?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-link-href">External link URL (optional)</Label>
              <Input
                id="pf-link-href"
                placeholder="https://www.fishpin.app"
                className="mt-1.5"
                aria-invalid={!!errors.linkHref}
                {...register("linkHref")}
              />
              <FieldError message={errors.linkHref?.message} />
            </div>
            <div>
              <Label htmlFor="pf-link-label">External link label</Label>
              <Input
                id="pf-link-label"
                placeholder="Visit fishpin.app"
                className="mt-1.5"
                aria-invalid={!!errors.linkLabel}
                {...register("linkLabel")}
              />
              <FieldError message={errors.linkLabel?.message} />
            </div>
          </div>

          {/* gallery */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Gallery</Label>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={bulkUploading || !slugOk}
                  title={slugOk ? undefined : "Set a valid slug first"}
                  onClick={() => bulkInputRef.current?.click()}
                >
                  {bulkUploading ? (
                    <Loader2 className="animate-spin" aria-hidden />
                  ) : (
                    <ImagePlus aria-hidden />
                  )}
                  Add images
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => gallery.append({ src: "", alt: "", caption: "" })}
                >
                  <Plus aria-hidden />
                  Blank row
                </Button>
              </div>
              <input
                ref={bulkInputRef}
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                aria-label="Add multiple gallery images"
                onChange={(e) => onBulkGallery(e.target.files)}
              />
            </div>
            {gallery.fields.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No gallery images — the case page simply skips the gallery section.
              </p>
            ) : null}
            {gallery.fields.map((field, i) => (
              <div key={field.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    gallery-{i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => gallery.remove(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 aria-hidden />
                    Remove
                  </Button>
                </div>
                <Controller
                  control={control}
                  name={`gallery.${i}.src`}
                  render={({ field: f }) => (
                    <ImageUpload
                      // unique name per upload — no cross-row overwrites; the
                      // save-time prune removes superseded files
                      path={`${values.slug || "unsaved"}/gallery-${i + 1}-${Date.now().toString(36)}.webp`}
                      maxEdge={GALLERY_MAX_EDGE}
                      value={f.value || undefined}
                      onChange={f.onChange}
                      label={`Gallery image ${i + 1}`}
                      disabledReason={uploadHint}
                    />
                  )}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`pf-gallery-alt-${i}`}>
                      Alt text <span aria-hidden className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`pf-gallery-alt-${i}`}
                      placeholder="POS register screen"
                      className="mt-1.5"
                      aria-invalid={!!errors.gallery?.[i]?.alt}
                      {...register(`gallery.${i}.alt`)}
                    />
                    <FieldError message={errors.gallery?.[i]?.alt?.message} />
                  </div>
                  <div>
                    <Label htmlFor={`pf-gallery-caption-${i}`}>Caption (optional)</Label>
                    <Input
                      id={`pf-gallery-caption-${i}`}
                      placeholder="Shown under the image"
                      className="mt-1.5"
                      {...register(`gallery.${i}.caption`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ----------------------------- settings ---------------------------- */}
        <section className="space-y-5 border-t border-border pt-8">
          <SectionHeading hint="Visibility and placement.">Settings</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-3">
            <ToggleField
              label="Published"
              hint="Visible on the live site. Drafts stay admin-only."
              registration={register("published")}
            />
            <ToggleField
              label="Flagship"
              hint="Big two-column card with side image."
              registration={register("flagship")}
            />
            <ToggleField
              label="Placeholder"
              hint="Mark as sample content still awaiting real details."
              registration={register("placeholder")}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="pf-status"
                      className="mt-1.5 w-full"
                      aria-invalid={!!errors.status}
                    >
                      <SelectValue placeholder="Pick a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                “In progress” and “Just started” show a badge on the card + case page.
              </p>
              <FieldError message={errors.status?.message} />
            </div>
            <div className="max-w-40">
              <Label htmlFor="pf-sort">Sort order</Label>
              <Input
                id="pf-sort"
                type="number"
                min={0}
                className="mt-1.5"
                aria-invalid={!!errors.sortOrder}
                {...register("sortOrder")}
              />
              <FieldError message={errors.sortOrder?.message} />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 border-t border-border pt-8">
          <Button type="submit" size="lg" disabled={isSubmitting} className="btn-cta">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden />
                {initial ? "Save changes" : "Create project"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.push("/admin/projects")}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* ------------------------------ preview ------------------------------ */}
      <aside className="min-w-0 max-lg:order-first">
        <div className="lg:sticky lg:top-24">
          <p className="eyebrow mb-3">Live card preview</p>
          <CardPreview values={values} />
        </div>
      </aside>
    </form>
  );
}
