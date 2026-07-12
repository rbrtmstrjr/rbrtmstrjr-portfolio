"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { saveCategory } from "@/app/actions/admin-categories";
import type { CategoryRow } from "@/lib/projects-data";

/**
 * Add/edit a work category in a modal. Self-contained (button + dialog) so it
 * can sit anywhere — next to "New project" for create, on each row for edit.
 */
export function CategoryDialogButton({
  initial,
  trigger = "new",
}: {
  initial?: CategoryRow;
  trigger?: "new" | "edit";
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const editing = Boolean(initial);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const result = await saveCategory({
      id: initial?.id,
      key: String(form.get("key") ?? ""),
      label: String(form.get("label") ?? ""),
      blurb: String(form.get("blurb") ?? ""),
      sortOrder: Number(form.get("sortOrder") || 10),
    });
    if (result.ok) {
      toast.success(
        editing
          ? "Category updated."
          : "Category added — it becomes a tab once a project uses it."
      );
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
        {trigger === "new" ? (
          <Button variant="outline">
            <Plus aria-hidden />
            New category
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Pencil aria-hidden />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? `Edit “${initial!.key}”` : "New category"}</DialogTitle>
          <DialogDescription>
            Categories become homepage tabs automatically once a visible project uses
            them. Reusing a built-in name overrides its label/blurb instead of adding a
            new tab.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cd-key">
                Name / tab text <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="cd-key"
                name="key"
                placeholder="Mobile Apps"
                className="mt-1.5"
                defaultValue={initial?.key ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="cd-label">
                Full label <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="cd-label"
                name="label"
                placeholder="Mobile Apps & Releases"
                className="mt-1.5"
                defaultValue={initial?.label ?? ""}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <div>
              <Label htmlFor="cd-blurb">Tab blurb</Label>
              <Input
                id="cd-blurb"
                name="blurb"
                placeholder="One line shown on the /work page for this tab."
                className="mt-1.5"
                defaultValue={initial?.blurb ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="cd-sort">Sort order</Label>
              <Input
                id="cd-sort"
                name="sortOrder"
                type="number"
                min={0}
                className="mt-1.5"
                defaultValue={initial?.sort_order ?? 10}
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : editing ? (
                <Save aria-hidden />
              ) : (
                <Plus aria-hidden />
              )}
              {editing ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
