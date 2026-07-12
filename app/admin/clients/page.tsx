import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowCard } from "@/components/ui/window-card";
import { ClientsTable } from "@/components/admin/clients-table";
import { getClientRows, getLinkedProjects } from "@/lib/clients-data";

export const metadata = { title: "Clients" };

export default async function AdminClientsPage() {
  const [clients, linked] = await Promise.all([getClientRows(), getLinkedProjects()]);

  const projectCounts: Record<string, number> = {};
  for (const p of linked) {
    if (p.client_id) projectCounts[p.client_id] = (projectCounts[p.client_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Clients</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Clients</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Private business records — the spine that projects link to now, and leads &
            payments will link to later. Never shown on the public site.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/clients/new">
            <Plus aria-hidden />
            New client
          </Link>
        </Button>
      </div>

      <WindowCard label="admin/clients" contentClassName="p-0">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
          <Users className="size-4 text-primary" aria-hidden />
          <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
            All clients
          </h2>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </span>
        </div>
        <div className="p-4">
          <ClientsTable clients={clients} projectCounts={projectCounts} />
        </div>
      </WindowCard>
    </div>
  );
}
