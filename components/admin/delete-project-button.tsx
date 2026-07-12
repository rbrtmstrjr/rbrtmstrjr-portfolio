"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProject } from "@/app/actions/admin-projects";

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await deleteProject(id);
    if (result.ok) {
      toast.success(`Deleted “${title}” and its media.`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete ${title}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 aria-hidden />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the managed project and its uploaded images from
            Supabase. If it overrides an in-code project, the site falls back to the
            in-code version. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" disabled={pending}>
              Cancel
            </Button>
          </AlertDialogCancel>
          {/* plain Button (not AlertDialogAction) — the dialog must stay open while pending */}
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
            Delete project
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
