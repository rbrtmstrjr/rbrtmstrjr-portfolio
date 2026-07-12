"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpDown, Eye, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteClientButton } from "@/components/admin/delete-client-button";
import type { ClientRow, ClientStatus } from "@/lib/clients-data";
import { cn } from "@/lib/utils";

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
        status === "active" && "bg-primary text-primary-foreground",
        status === "prospect" && "border border-primary/15 bg-primary/[0.05] text-primary/80",
        status === "past" && "border border-border bg-secondary text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

export function ClientsTable({
  clients,
  projectCounts,
}: {
  clients: ClientRow[];
  projectCounts: Record<string, number>;
}) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [nameAsc, setNameAsc] = React.useState<boolean | null>(null);

  const q = query.trim().toLowerCase();
  let rows = clients.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (!q) return true;
    return [c.name, c.company, c.location, c.source]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(q));
  });
  if (nameAsc !== null) {
    rows = [...rows].sort(
      (a, b) => a.name.localeCompare(b.name) * (nameAsc ? 1 : -1)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search name, company, location…"
            aria-label="Search clients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Filter by status" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setNameAsc(nameAsc === null ? true : nameAsc ? false : null)}
          className="text-muted-foreground"
        >
          <ArrowUpDown aria-hidden />
          {nameAsc === null ? "Newest first" : nameAsc ? "Name A–Z" : "Name Z–A"}
        </Button>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-border">
          {rows.map((client) => (
            <li key={client.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="truncate text-sm font-semibold hover:text-primary"
                  >
                    {client.name}
                  </Link>
                  <ClientStatusBadge status={client.status} />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {[client.company, client.location, client.source]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                  {" · "}
                  <span className="font-mono">
                    {projectCounts[client.id] ?? 0} project
                    {(projectCounts[client.id] ?? 0) === 1 ? "" : "s"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/clients/${client.id}`}>
                    <Eye aria-hidden />
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/clients/${client.id}/edit`}>
                    <Pencil aria-hidden />
                    Edit
                  </Link>
                </Button>
                <DeleteClientButton
                  id={client.id}
                  name={client.name}
                  linkedCount={projectCounts[client.id] ?? 0}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          {clients.length === 0 ? (
            <>
              No clients yet —{" "}
              <Link href="/admin/clients/new" className="font-medium text-primary">
                add your first
              </Link>
              .
            </>
          ) : (
            "No clients match that search."
          )}
        </div>
      )}
    </div>
  );
}
