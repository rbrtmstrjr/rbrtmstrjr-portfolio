import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Eye,
  CreditCard,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings2,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowCard } from "@/components/ui/window-card";
import { ClientStatusBadge } from "@/components/admin/clients-table";
import { ContractStatusBadge } from "@/components/admin/contracts-list";
import { DeleteClientButton } from "@/components/admin/delete-client-button";
import { getClientRow, getLinkedProjects } from "@/lib/clients-data";
import { getContractRows, getMilestoneRows } from "@/lib/contracts-data";

export const metadata = { title: "Client" };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, allLinked, allContracts, allMilestones] = await Promise.all([
    getClientRow(id),
    getLinkedProjects(),
    getContractRows(),
    getMilestoneRows(),
  ]);
  if (!client) notFound();

  const projects = allLinked.filter((p) => p.client_id === client.id);
  const contracts = allContracts.filter((c) => c.client_id === client.id);

  const contactRows = [
    { icon: Mail, value: client.contact_email, href: `mailto:${client.contact_email}` },
    { icon: Phone, value: client.contact_phone },
    { icon: MapPin, value: client.location },
    { icon: Globe, value: client.website, href: client.website ?? undefined },
  ].filter((r) => r.value);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Clients
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl">{client.name}</h1>
              <ClientStatusBadge status={client.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {[client.company, client.source && `via ${client.source}`]
                .filter(Boolean)
                .join(" · ") || "No company on file"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/clients/${client.id}/edit`}>
                <Pencil aria-hidden />
                Edit
              </Link>
            </Button>
            <DeleteClientButton
              id={client.id}
              name={client.name}
              linkedCount={projects.length}
              redirectTo="/admin/clients"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* info column */}
        <div className="space-y-6">
          <WindowCard label="clients/info" contentClassName="p-5">
            {contactRows.length ? (
              <ul className="space-y-3">
                {contactRows.map(({ icon: Icon, value, href }) => (
                  <li key={value} className="flex items-center gap-3 text-sm">
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="truncate underline-offset-4 hover:text-primary hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="truncate">{value}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No contact details yet.</p>
            )}
          </WindowCard>

          {client.notes ? (
            <WindowCard label="clients/notes" contentClassName="p-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {client.notes}
              </p>
            </WindowCard>
          ) : null}
        </div>

        {/* modules column — future sections (leads, payments, progress) stack here */}
        <div className="space-y-6">
          <WindowCard label="clients/contracts" contentClassName="p-0">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
              <FileText className="size-4 text-primary" aria-hidden />
              <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
                Contracts
              </h2>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {contracts.length}
              </span>
            </div>
            {contracts.length ? (
              <ul className="divide-y divide-border">
                {contracts.map((c) => {
                  const ms = allMilestones.filter((m) => m.contract_id === c.id);
                  const done = ms.filter((m) => m.status === "approved").length;
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium">{c.title}</p>
                          <ContractStatusBadge status={c.status} />
                        </div>
                        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          {done}/{ms.length} milestones approved
                          {c.total_value != null
                            ? ` · ₱${(c.total_value / 100).toLocaleString()}`
                            : ""}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="shrink-0">
                        <Link href={`/admin/contracts/${c.id}`}>
                          <Settings2 aria-hidden />
                          Manage
                        </Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No contracts yet —{" "}
                <Link href="/admin/contracts/new" className="font-medium text-primary">
                  start one
                </Link>
                .
              </p>
            )}
          </WindowCard>

          <WindowCard label="clients/projects" contentClassName="p-0">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
              <Briefcase className="size-4 text-primary" aria-hidden />
              <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
                Linked projects
              </h2>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {projects.length}
              </span>
            </div>
            {projects.length ? (
              <ul className="divide-y divide-border">
                {projects.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        work/{p.slug} · {p.published ? "published" : "draft"}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/projects/${p.id}/edit`}>
                        <Pencil aria-hidden />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/work/${p.slug}`} target="_blank">
                        <Eye aria-hidden />
                        View
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No linked projects yet — link one from the project form&apos;s
                &quot;Client&quot; selector.
              </p>
            )}
          </WindowCard>

          {/* ── future modules attach here ──────────────────────────────────
              Leads (inquiries → pipeline) and Payments (invoices, balances)
              will render as stacked cards in this column, keyed on client_id.
              Keeping them visible as placeholders makes the roadmap obvious. */}
          <div className="grid gap-4 sm:grid-cols-2" aria-hidden>
            {[
              { icon: Target, label: "Leads" },
              { icon: CreditCard, label: "Payments" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground/60"
              >
                <Icon className="size-4" />
                {label}
                <span className="ml-auto rounded-lg border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
