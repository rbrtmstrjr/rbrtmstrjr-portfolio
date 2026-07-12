import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/admin/client-form";
import { getClientRow } from "@/lib/clients-data";

export const metadata = { title: "Edit client" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getClientRow(id);
  if (!row) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/clients/${row.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {row.name}
        </Link>
        <h1 className="mt-4 text-3xl sm:text-4xl">Edit client</h1>
      </div>
      <ClientForm initial={row} />
    </div>
  );
}
