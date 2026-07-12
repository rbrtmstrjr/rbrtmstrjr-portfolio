"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Search, Settings2 } from "lucide-react";
import { DeleteContractButton } from "@/components/admin/delete-contract-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ContractRow, ContractStatus } from "@/lib/contracts-data";
import { cn } from "@/lib/utils";

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
        status === "active" && "bg-primary text-primary-foreground",
        status === "completed" && "border border-primary/15 bg-primary/[0.05] text-primary/80",
        (status === "draft" || status === "archived") &&
          "border border-border bg-secondary text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

export type ContractListItem = ContractRow & {
  clientName: string;
  approvedMilestones: number;
  totalMilestones: number;
};

export function ContractsList({ contracts }: { contracts: ContractListItem[] }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const q = query.trim().toLowerCase();
  const rows = contracts.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (!q) return true;
    return [c.title, c.clientName].some((v) => v.toLowerCase().includes(q));
  });

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
            placeholder="Search title or client…"
            aria-label="Search contracts"
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-border">
          {rows.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/contracts/${c.id}`}
                    className="truncate text-sm font-semibold hover:text-primary"
                  >
                    {c.title}
                  </Link>
                  <ContractStatusBadge status={c.status} />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {c.clientName} ·{" "}
                  <span className="font-mono">
                    {c.approvedMilestones}/{c.totalMilestones} milestones approved
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/contracts/${c.id}`}>
                    <Settings2 aria-hidden />
                    Manage
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/contracts/${c.id}/edit`}>
                    <Pencil aria-hidden />
                    Edit
                  </Link>
                </Button>
                <DeleteContractButton id={c.id} title={c.title} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          {contracts.length === 0 ? (
            <>
              No contracts yet —{" "}
              <Link href="/admin/contracts/new" className="font-medium text-primary">
                create your first
              </Link>
              .
            </>
          ) : (
            "No contracts match that filter."
          )}
        </div>
      )}
    </div>
  );
}
