import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/admin/project-form";
import { getAllCategories } from "@/lib/projects-data";
import { getClientRows } from "@/lib/clients-data";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const [allCategories, clientRows] = await Promise.all([getAllCategories(), getClientRows()]);
  const categories = allCategories.map(({ key, label }) => ({ key, label }));
  const clients = clientRows.map(({ id, name, company }) => ({ id, name, company }));
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
        <h1 className="mt-4 text-3xl sm:text-4xl">New project</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Fill the card + case study, upload screenshots, then publish. Using the slug of an
          in-code project takes that project over on the live site.
        </p>
      </div>
      <ProjectForm categories={categories} clients={clients} />
    </div>
  );
}
