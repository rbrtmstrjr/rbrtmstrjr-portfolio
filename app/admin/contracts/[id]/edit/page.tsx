import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContractForm } from "@/components/admin/contract-form";
import { getContractFileRows, getContractRow } from "@/lib/contracts-data";
import { getClientRows } from "@/lib/clients-data";

export const metadata = { title: "Edit contract" };

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row, clientRows, files] = await Promise.all([
    getContractRow(id),
    getClientRows(),
    getContractFileRows(id),
  ]);
  if (!row) notFound();
  const clients = clientRows.map(({ id, name, company }) => ({ id, name, company }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/contracts/${row.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {row.title}
        </Link>
        <h1 className="mt-4 text-3xl sm:text-4xl">Edit contract</h1>
      </div>
      <ContractForm initial={row} clients={clients} files={files} />
    </div>
  );
}
