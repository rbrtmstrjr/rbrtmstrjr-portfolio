import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowCard } from "@/components/ui/window-card";
import { ContractsList, type ContractListItem } from "@/components/admin/contracts-list";
import { getContractRows, getMilestoneRows } from "@/lib/contracts-data";
import { getClientRows } from "@/lib/clients-data";

export const metadata = { title: "Contracts" };

export default async function AdminContractsPage() {
  const [contracts, milestones, clients] = await Promise.all([
    getContractRows(),
    getMilestoneRows(),
    getClientRows(),
  ]);

  const clientNames = new Map(clients.map((c) => [c.id, c.company || c.name]));
  const items: ContractListItem[] = contracts.map((c) => {
    const ms = milestones.filter((m) => m.contract_id === c.id);
    return {
      ...c,
      clientName: clientNames.get(c.client_id) ?? "Unknown client",
      approvedMilestones: ms.filter((m) => m.status === "approved").length,
      totalMilestones: ms.length,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Contracts</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Contracts</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Real client engagements — terms, milestones, and a secret portal link where
            the client tracks progress and signs off. Separate from portfolio projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/contracts/new">
            <Plus aria-hidden />
            New contract
          </Link>
        </Button>
      </div>

      <WindowCard label="admin/contracts" contentClassName="p-0">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
          <FileText className="size-4 text-primary" aria-hidden />
          <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
            All contracts
          </h2>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {contracts.length} {contracts.length === 1 ? "contract" : "contracts"}
          </span>
        </div>
        <div className="p-4">
          <ContractsList contracts={items} />
        </div>
      </WindowCard>
    </div>
  );
}
