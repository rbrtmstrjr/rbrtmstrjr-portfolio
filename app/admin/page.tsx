import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  FileText,
  Flag,
  MessageSquareQuote,
  MessageSquareWarning,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowCard } from "@/components/ui/window-card";
import { ContractStatusBadge } from "@/components/admin/contracts-list";
import { getCategoryRows, getProjectRows } from "@/lib/projects-data";
import { getClientRows } from "@/lib/clients-data";
import {
  getContractRows,
  getMilestoneRows,
  getPendingTestimonialCount,
} from "@/lib/contracts-data";

export const metadata = { title: "Dashboard" };

function peso(centavos: number) {
  return `₱${(centavos / 100).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <WindowCard
        label={label.toLowerCase()}
        className="h-full transition-[box-shadow,border-color] duration-300 group-hover:border-ring/30 group-hover:shadow-lg group-hover:shadow-foreground/[0.05]"
        contentClassName="p-6"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{label}</span>
        </div>
        <p className="mt-3 font-display text-3xl sm:text-4xl">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </WindowCard>
    </Link>
  );
}

export default async function AdminDashboard() {
  const [projects, categoryRows, clients, contracts, milestones, pendingTestimonials] =
    await Promise.all([
      getProjectRows(),
      getCategoryRows(),
      getClientRows(),
      getContractRows(),
      getMilestoneRows(),
      getPendingTestimonialCount(),
    ]);

  /* ---- earnings (internal contract values, centavos) ---- */
  const completed = contracts.filter((c) => c.status === "completed");
  const active = contracts.filter((c) => c.status === "active");
  const earned = completed.reduce((sum, c) => sum + (c.total_value ?? 0), 0);
  const pipeline = active.reduce((sum, c) => sum + (c.total_value ?? 0), 0);

  /* ---- projects / clients ---- */
  const published = projects.filter((p) => p.published).length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const prospects = clients.filter((c) => c.status === "prospect").length;

  /* ---- needs attention ---- */
  const changesRequested = milestones.filter((m) => m.status === "changes_requested").length;
  const waitingOnClient = milestones.filter((m) => m.status === "ready_for_review").length;

  const clientNames = new Map(clients.map((c) => [c.id, c.company || c.name]));

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Your freelancing at a glance</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Money, work in flight, and what needs your attention — all of it private.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Earned"
          value={peso(earned)}
          hint={`${completed.length} completed contract${completed.length === 1 ? "" : "s"}`}
          href="/admin/contracts"
          icon={Banknote}
        />
        <StatCard
          label="In the pipeline"
          value={peso(pipeline)}
          hint={`${active.length} active contract${active.length === 1 ? "" : "s"}`}
          href="/admin/contracts"
          icon={FileText}
        />
        <StatCard
          label="Clients"
          value={String(clients.length)}
          hint={`${activeClients} active · ${prospects} prospect${prospects === 1 ? "" : "s"}`}
          href="/admin/clients"
          icon={Users}
        />
        <StatCard
          label="Portfolio"
          value={String(published)}
          hint={`published projects · ${projects.length - published} draft${projects.length - published === 1 ? "" : "s"} · ${categoryRows.length} categories`}
          href="/admin/projects"
          icon={Briefcase}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,340px)]">
        {/* active contracts with progress */}
        <WindowCard label="admin/active-contracts" contentClassName="p-0">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
            <Flag className="size-4 text-primary" aria-hidden />
            <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
              Work in flight
            </h2>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {active.length} active
            </span>
          </div>
          {active.length ? (
            <ul className="divide-y divide-border">
              {active.map((c) => {
                const ms = milestones.filter((m) => m.contract_id === c.id);
                const done = ms.filter((m) => m.status === "approved").length;
                const pct = ms.length ? Math.round((done / ms.length) * 100) : 0;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/admin/contracts/${c.id}`}
                      className="block px-5 py-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-sm font-semibold">{c.title}</span>
                        <ContractStatusBadge status={c.status} />
                        <span className="ml-auto font-mono text-xs text-muted-foreground">
                          {done}/{ms.length} · {pct}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {clientNames.get(c.client_id) ?? "Unknown client"}
                        {c.total_value != null ? ` · ${peso(c.total_value)}` : ""}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No active contracts —{" "}
              <Link href="/admin/contracts/new" className="font-medium text-primary">
                start one
              </Link>{" "}
              when the next engagement lands.
            </p>
          )}
        </WindowCard>

        {/* needs attention + quick actions */}
        <div className="space-y-6">
          <WindowCard label="admin/attention" contentClassName="p-0">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
              <MessageSquareWarning className="size-4 text-primary" aria-hidden />
              <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
                Needs attention
              </h2>
            </div>
            <ul className="divide-y divide-border text-sm">
              <li className="flex items-center gap-3 px-5 py-3.5">
                <MessageSquareQuote className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="flex-1">Testimonials to review</span>
                <span className="font-mono text-xs font-semibold">
                  {pendingTestimonials}
                </span>
              </li>
              <li className="flex items-center gap-3 px-5 py-3.5">
                <MessageSquareWarning className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="flex-1">Change requests to handle</span>
                <span className="font-mono text-xs font-semibold">{changesRequested}</span>
              </li>
              <li className="flex items-center gap-3 px-5 py-3.5">
                <Flag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="flex-1">Waiting on client review</span>
                <span className="font-mono text-xs font-semibold">{waitingOnClient}</span>
              </li>
            </ul>
          </WindowCard>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/admin/contracts/new">
                <Plus aria-hidden />
                New contract
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/projects/new">
                <Plus aria-hidden />
                New project
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/work" target="_blank">
                View live site
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
