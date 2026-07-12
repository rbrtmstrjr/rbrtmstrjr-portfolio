import Link from "next/link";
import { Database, Eye, Pencil, Plus, Sparkles, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowCard } from "@/components/ui/window-card";
import { DeleteProjectButton } from "@/components/admin/delete-project-button";
import { CategoryDialogButton } from "@/components/admin/category-dialog";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";
import { getCategoryRows, getProjectRows, type ProjectRow } from "@/lib/projects-data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Projects" };

function Chip({
  children,
  tone = "quiet",
}: {
  children: React.ReactNode;
  tone?: "quiet" | "brand" | "solid";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
        tone === "solid" && "bg-primary text-primary-foreground",
        tone === "brand" && "border border-primary/15 bg-primary/[0.05] text-primary/80",
        tone === "quiet" && "border border-border bg-secondary text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}

function ManagedRow({ row }: { row: ProjectRow }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">{row.title}</span>
          {row.flagship ? (
            <Sparkles className="size-3.5 shrink-0 text-primary" aria-label="Flagship" />
          ) : null}
          <Chip tone={row.published ? "solid" : "quiet"}>
            {row.published ? "Published" : "Draft"}
          </Chip>
          <Chip tone="brand">{row.category}</Chip>
          {row.status === "in-progress" ? <Chip tone="brand">In progress</Chip> : null}
          {row.status === "just-started" ? <Chip tone="brand">Just started</Chip> : null}
        </div>
        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
          work/{row.slug} · sort {row.sort_order}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/work/${row.slug}`} target="_blank">
            <Eye aria-hidden />
            View
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/projects/${row.id}/edit`}>
            <Pencil aria-hidden />
            Edit
          </Link>
        </Button>
        <DeleteProjectButton id={row.id} title={row.title} />
      </div>
    </li>
  );
}

export default async function AdminProjectsPage() {
  const [rows, categoryRows] = await Promise.all([getProjectRows(), getCategoryRows()]);
  const configured = Boolean(getSupabaseAdmin());

  const usage: Record<string, number> = {};
  for (const r of rows) usage[r.category] = (usage[r.category] ?? 0) + 1;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Projects</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Projects</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Everything lives in Supabase and goes live on save — no redeploy. Drafts stay
            admin-only until published.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CategoryDialogButton />
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus aria-hidden />
              New project
            </Link>
          </Button>
        </div>
      </div>

      {!configured ? (
        <div className="rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed">
          <code className="font-mono text-xs">SUPABASE_URL</code> /{" "}
          <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> are missing —
          projects can&apos;t be read or saved until they&apos;re set.
        </div>
      ) : null}

      <WindowCard label="admin/projects" contentClassName="p-0">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
          <Database className="size-4 text-primary" aria-hidden />
          <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
            All projects
          </h2>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {rows.length} {rows.length === 1 ? "project" : "projects"}
          </span>
        </div>
        {rows.length ? (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <ManagedRow key={row.id} row={row} />
            ))}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No projects yet.{" "}
            <Link href="/admin/projects/new" className="font-medium text-primary">
              Create the first one
            </Link>
            .
          </div>
        )}
      </WindowCard>

      {/* categories — project-related, managed right here via dialogs */}
      <WindowCard label="admin/categories" contentClassName="p-0">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
          <Tags className="size-4 text-primary" aria-hidden />
          <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
            Categories
          </h2>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            tabs appear once a category has a project
          </span>
        </div>
        {categoryRows.length ? (
          <ul className="divide-y divide-border">
            {categoryRows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{row.key}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      sort {row.sort_order} · {usage[row.key] ?? 0} project
                      {(usage[row.key] ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {row.label}
                    {row.blurb ? ` — ${row.blurb}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <CategoryDialogButton initial={row} trigger="edit" />
                  <DeleteCategoryButton id={row.id} name={row.key} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No categories yet — add one with the button above.
          </div>
        )}
      </WindowCard>
    </div>
  );
}
