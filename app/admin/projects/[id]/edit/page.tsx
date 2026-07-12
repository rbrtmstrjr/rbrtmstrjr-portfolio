import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/admin/project-form";
import { getAllCategories, getProjectRow } from "@/lib/projects-data";
import { getClientRows } from "@/lib/clients-data";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row, allCategories, clientRows] = await Promise.all([
    getProjectRow(id),
    getAllCategories(),
    getClientRows(),
  ]);
  if (!row) notFound();
  const categories = allCategories.map(({ key, label }) => ({ key, label }));
  const clients = clientRows.map(({ id: cid, name, company }) => ({ id: cid, name, company }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Projects
        </Link>
        <h1 className="mt-4 text-3xl sm:text-4xl">Edit project</h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">work/{row.slug}</p>
      </div>
      <ProjectForm initial={row} categories={categories} clients={clients} />
    </div>
  );
}
