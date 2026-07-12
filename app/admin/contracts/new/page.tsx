import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContractForm } from "@/components/admin/contract-form";
import { getClientRows } from "@/lib/clients-data";

export const metadata = { title: "New contract" };

export default async function NewContractPage() {
  const clients = (await getClientRows()).map(({ id, name, company }) => ({ id, name, company }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/contracts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Contracts
        </Link>
        <h1 className="mt-4 text-3xl sm:text-4xl">New contract</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          The secret portal link is generated automatically on create — add milestones
          from the contract page afterwards.
        </p>
      </div>
      {clients.length ? (
        <ContractForm clients={clients} />
      ) : (
        <div className="rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed">
          Contracts belong to a client —{" "}
          <Link href="/admin/clients/new" className="font-medium text-primary">
            add the client first
          </Link>
          .
        </div>
      )}
    </div>
  );
}
