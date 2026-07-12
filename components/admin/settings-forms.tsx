"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  deleteMilestoneTemplate,
  saveAvailability,
  saveMilestoneTemplate,
  saveSiteInfo,
} from "@/app/actions/admin-settings";
import type { MilestoneTemplateRow, SettingsRow } from "@/lib/settings-data";

/* -------------------------------- site info -------------------------------- */

export function SiteInfoForm({ settings }: { settings: SettingsRow | null }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const result = await saveSiteInfo({
      contactEmail: String(form.get("contactEmail") ?? ""),
      notificationEmail: String(form.get("notificationEmail") ?? ""),
      githubUrl: String(form.get("githubUrl") ?? ""),
      linkedinUrl: String(form.get("linkedinUrl") ?? ""),
      siteDomain: String(form.get("siteDomain") ?? ""),
    });
    if (result.ok) {
      toast.success("Site info saved — the public site is regenerating.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="si-contact">Public contact email</Label>
          <Input
            id="si-contact"
            name="contactEmail"
            type="email"
            placeholder="hello@yourdomain.com"
            defaultValue={settings?.contact_email ?? ""}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">Footer + contact section.</p>
        </div>
        <div>
          <Label htmlFor="si-notify">Notification email (private)</Label>
          <Input
            id="si-notify"
            name="notificationEmail"
            type="email"
            placeholder="where inquiries land"
            defaultValue={settings?.notification_email ?? ""}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Never shown publicly — inquiry emails go here.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="si-github">GitHub URL</Label>
          <Input
            id="si-github"
            name="githubUrl"
            placeholder="https://github.com/…"
            defaultValue={settings?.github_url ?? ""}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="si-linkedin">LinkedIn URL</Label>
          <Input
            id="si-linkedin"
            name="linkedinUrl"
            placeholder="https://www.linkedin.com/in/…"
            defaultValue={settings?.linkedin_url ?? ""}
            className="mt-1.5"
          />
        </div>
      </div>
      <div className="sm:max-w-sm">
        <Label htmlFor="si-domain">Site domain</Label>
        <Input
          id="si-domain"
          name="siteDomain"
          placeholder="https://yourdomain.com"
          defaultValue={settings?.site_domain ?? ""}
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Used in client-notification emails (portal links).
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
        Save site info
      </Button>
    </form>
  );
}

/* ------------------------------- availability ------------------------------ */

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available — green pulse on the hero" },
  { value: "booked", label: "Booked — muted dot, custom message" },
  { value: "unavailable", label: "Unavailable — not taking projects" },
] as const;

export function AvailabilityForm({ settings }: { settings: SettingsRow | null }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [status, setStatus] = React.useState<string>(
    settings?.availability_status ?? "available"
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const result = await saveAvailability({
      status: status as "available" | "booked" | "unavailable",
      message: String(form.get("message") ?? ""),
    });
    if (result.ok) {
      toast.success("Availability updated — hero regenerating.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="av-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="av-status" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="av-message">Custom message (optional)</Label>
          <Input
            id="av-message"
            name="message"
            maxLength={120}
            placeholder="Booked until March — waitlist open"
            defaultValue={settings?.availability_message ?? ""}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Overrides the default hero copy when set.
          </p>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
        Save availability
      </Button>
    </form>
  );
}

/* --------------------------- milestone templates --------------------------- */

function TemplateDialog({ initial, nextSort }: { initial?: MilestoneTemplateRow; nextSort: number }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const editing = Boolean(initial);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const result = await saveMilestoneTemplate({
      id: initial?.id,
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      sortOrder: Number(form.get("sortOrder") || 0),
    });
    if (result.ok) {
      toast.success(editing ? "Template updated." : "Template added.");
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
            Add template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? `Edit “${initial!.title}”` : "Add milestone template"}</DialogTitle>
          <DialogDescription>
            New contracts can start from these phases instead of retyping them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <div>
              <Label htmlFor="tp-title">
                Title <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="tp-title"
                name="title"
                placeholder="Discovery"
                className="mt-1.5"
                defaultValue={initial?.title ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="tp-sort">Order</Label>
              <Input
                id="tp-sort"
                name="sortOrder"
                type="number"
                min={0}
                className="mt-1.5"
                defaultValue={initial?.sort_order ?? nextSort}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tp-desc">Default description</Label>
            <Textarea
              id="tp-desc"
              name="description"
              rows={3}
              placeholder="What 'done' means for this phase — clients read this."
              className="mt-1.5"
              defaultValue={initial?.default_description ?? ""}
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
              {editing ? "Save changes" : "Add template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTemplateButton({ template }: { template: MilestoneTemplateRow }) {
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
    const result = await deleteMilestoneTemplate(template.id);
    if (result.ok) {
      toast.success("Template removed.");
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
      aria-label={`Delete ${template.title}`}
      className="text-muted-foreground hover:text-destructive"
      onClick={() => setArming(true)}
    >
      <Trash2 aria-hidden />
    </Button>
  );
}

export function TemplatesManager({ templates }: { templates: MilestoneTemplateRow[] }) {
  const nextSort = templates.length
    ? Math.max(...templates.map((t) => t.sort_order)) + 1
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Seeded into new contracts via &quot;Start from default milestones&quot;.
        </p>
        <TemplateDialog nextSort={nextSort} />
      </div>
      {templates.length ? (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span className="font-mono text-[10px] text-primary">
                {String(t.sort_order).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.title}</p>
                {t.default_description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {t.default_description}
                  </p>
                ) : null}
              </div>
              <TemplateDialog initial={t} nextSort={nextSort} />
              <DeleteTemplateButton template={t} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No templates yet — add your usual phases (Discovery, Design, Build, Test,
          Launch).
        </p>
      )}
    </div>
  );
}
