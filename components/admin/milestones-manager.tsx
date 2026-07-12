"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Flag,
  Link2,
  Loader2,
  Lock,
  MessageSquareWarning,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MILESTONE_STATUSES } from "@/lib/admin/contract-schema";
import {
  deleteMilestone,
  deleteMilestoneLink,
  saveMilestone,
  saveMilestoneLink,
  setMilestoneStatus,
} from "@/app/actions/admin-contracts";
import { NotifyClientButton } from "@/components/admin/notify-client-button";
import type { MilestoneLinkRow, MilestoneRow, MilestoneStatus } from "@/lib/contracts-data";
import { cn } from "@/lib/utils";

function MilestoneDialog({
  contractId,
  initial,
  nextSort,
}: {
  contractId: string;
  initial?: MilestoneRow;
  nextSort: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const editing = Boolean(initial);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const result = await saveMilestone({
      id: initial?.id,
      contractId,
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      sortOrder: Number(form.get("sortOrder") || 0),
    });
    if (result.ok) {
      toast.success(editing ? "Milestone updated." : "Milestone added.");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="ghost" size="sm" aria-label={`Edit ${initial!.title}`}>
            <Pencil aria-hidden />
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Plus aria-hidden />
            Add milestone
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? `Edit “${initial!.title}”` : "Add milestone"}</DialogTitle>
          <DialogDescription>
            Milestones are what the client sees and approves on the portal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <div>
              <Label htmlFor="mf-title">
                Title <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="mf-title"
                name="title"
                placeholder="Design mockups"
                className="mt-1.5"
                defaultValue={initial?.title ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="mf-sort">Order</Label>
              <Input
                id="mf-sort"
                name="sortOrder"
                type="number"
                min={0}
                className="mt-1.5"
                defaultValue={initial?.sort_order ?? nextSort}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="mf-desc">Description</Label>
            <Textarea
              id="mf-desc"
              name="description"
              rows={3}
              placeholder="What 'done' means for this phase — the client reads this."
              className="mt-1.5"
              defaultValue={initial?.description ?? ""}
            />
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
              {editing ? "Save changes" : "Add milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Add/edit a live preview link on a milestone. */
function LinkDialog({
  milestoneId,
  initial,
}: {
  milestoneId: string;
  initial?: MilestoneLinkRow;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const editing = Boolean(initial);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const result = await saveMilestoneLink({
      id: initial?.id,
      milestoneId,
      label: String(form.get("label") ?? ""),
      url: String(form.get("url") ?? ""),
      sortOrder: Number(form.get("sortOrder") || 0),
    });
    if (result.ok) {
      toast.success(editing ? "Link updated." : "Preview link added — it's on the portal now.");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>
        {editing ? (
          <button
            type="button"
            className="max-w-48 truncate text-left hover:text-primary"
            title={`Edit ${initial!.label}`}
          >
            {initial!.label}
          </button>
        ) : (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Link2 aria-hidden />
            Add preview link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? `Edit “${initial!.label}”` : "Add preview link"}</DialogTitle>
          <DialogDescription>
            Shown to the client under this milestone as a &quot;see it live&quot; button.
            This link is <span className="font-medium text-foreground">live</span> — only
            add or share it when the deployment is presentable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
            <div>
              <Label htmlFor="lk-label">
                Label <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="lk-label"
                name="label"
                placeholder="Live staging app"
                className="mt-1.5"
                defaultValue={initial?.label ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="lk-sort">Order</Label>
              <Input
                id="lk-sort"
                name="sortOrder"
                type="number"
                min={0}
                className="mt-1.5"
                defaultValue={initial?.sort_order ?? 0}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="lk-url">
              URL <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input
              id="lk-url"
              name="url"
              type="url"
              placeholder="https://staging.example.com"
              className="mt-1.5"
              defaultValue={initial?.url ?? ""}
              required
            />
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Link2 aria-hidden />}
              {editing ? "Save link" : "Add link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LinkChip({ link }: { link: MilestoneLinkRow }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onRemove() {
    setPending(true);
    const result = await deleteMilestoneLink(link.id);
    if (result.ok) {
      toast.success("Link removed.");
      router.refresh();
    } else {
      toast.error(result.error);
      setPending(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.05] px-2.5 py-1 text-xs font-medium text-primary/80">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${link.label}`}
        className="hover:text-primary"
      >
        <ExternalLink className="size-3" aria-hidden />
      </a>
      <LinkDialog milestoneId={link.milestone_id} initial={link} />
      <button
        type="button"
        aria-label={`Remove ${link.label}`}
        disabled={pending}
        onClick={onRemove}
        className="text-primary/50 hover:text-destructive"
      >
        {pending ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <X className="size-3" aria-hidden />
        )}
      </button>
    </span>
  );
}

function StatusSelect({ milestone }: { milestone: MilestoneRow }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onChange(next: string) {
    setPending(true);
    const result = await setMilestoneStatus(milestone.id, next as MilestoneStatus);
    if (result.ok) {
      toast.success(
        next === "ready_for_review"
          ? "Flagged for the client — it now shows Approve / Request changes on the portal."
          : "Milestone status updated."
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <Select value={milestone.status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger aria-label={`Status of ${milestone.title}`} className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MILESTONE_STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DeleteButton({ milestone }: { milestone: MilestoneRow }) {
  const router = useRouter();
  const [arming, setArming] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!arming) return;
    const t = setTimeout(() => setArming(false), 4000);
    return () => clearTimeout(t);
  }, [arming]);

  async function onDelete() {
    setPending(true);
    const result = await deleteMilestone(milestone.id);
    if (result.ok) {
      toast.success("Milestone removed.");
      router.refresh();
    } else {
      toast.error(result.error);
      setPending(false);
      setArming(false);
    }
  }

  return arming ? (
    <Button variant="destructive" size="sm" disabled={pending} onClick={onDelete}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
      Sure?
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`Delete ${milestone.title}`}
      className="text-muted-foreground hover:text-destructive"
      onClick={() => setArming(true)}
    >
      <Trash2 aria-hidden />
    </Button>
  );
}

const NOTIFY_SUMMARY: Record<string, string> = {
  ready_for_review: "The email says this milestone is ready for their review, with a portal link to approve it.",
  approved: "The email says this milestone has been approved.",
  in_progress: "The email says this milestone is now in progress.",
  changes_requested: "The email says you're on the changes they requested.",
  pending: "The email says this milestone is queued up next.",
};

const STATUS_LABEL_MAP = new Map(MILESTONE_STATUSES.map((s) => [s.value, s.label]));

export function MilestonesManager({
  contractId,
  milestones,
  links,
  clientEmail,
  locked = false,
}: {
  contractId: string;
  milestones: MilestoneRow[];
  links: MilestoneLinkRow[];
  clientEmail: string | null;
  /** completed/archived contracts are read-only records */
  locked?: boolean;
}) {
  const nextSort = milestones.length
    ? Math.max(...milestones.map((m) => m.sort_order)) + 1
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <Flag className="size-4 text-primary" aria-hidden />
          <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
            Milestones
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {milestones.filter((m) => m.status === "approved").length}/{milestones.length}{" "}
            approved
          </span>
        </div>
        {locked ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Lock className="size-3" aria-hidden />
            Locked — contract closed
          </span>
        ) : (
          <MilestoneDialog contractId={contractId} nextSort={nextSort} />
        )}
      </div>
      {milestones.length ? (
        <ul className="divide-y divide-border">
          {milestones.map((m) => (
            <li key={m.id} className="space-y-2 px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.title}</p>
                  {m.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {m.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {locked ? (
                    <span className="inline-flex items-center rounded-lg border border-primary/15 bg-primary/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-primary/80">
                      {STATUS_LABEL_MAP.get(m.status) ?? m.status}
                    </span>
                  ) : (
                    <>
                      <StatusSelect milestone={m} />
                      <NotifyClientButton
                        contractId={contractId}
                        milestoneId={m.id}
                        milestoneTitle={m.title}
                        changeSummary={NOTIFY_SUMMARY[m.status] ?? "The email shares this milestone's status."}
                        clientEmail={clientEmail}
                        iconOnly
                      />
                      <MilestoneDialog contractId={contractId} initial={m} nextSort={nextSort} />
                      <DeleteButton milestone={m} />
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pl-0">
                {links
                  .filter((l) => l.milestone_id === m.id)
                  .map((l) =>
                    locked ? (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.05] px-2.5 py-1 text-xs font-medium text-primary/80 hover:text-primary"
                      >
                        <ExternalLink className="size-3" aria-hidden />
                        {l.label}
                      </a>
                    ) : (
                      <LinkChip key={l.id} link={l} />
                    )
                  )}
                {locked ? null : <LinkDialog milestoneId={m.id} />}
              </div>
              {m.client_note ? (
                <p
                  className={cn(
                    "flex items-start gap-2 rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs leading-relaxed"
                  )}
                >
                  <MessageSquareWarning className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                  <span>
                    <span className="font-semibold">Client note: </span>
                    {m.client_note}
                  </span>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No milestones yet — add the phases the client will sign off on.
        </p>
      )}
    </div>
  );
}
