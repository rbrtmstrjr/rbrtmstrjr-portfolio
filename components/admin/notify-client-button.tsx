"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { notifyClient } from "@/app/actions/admin-contracts";

/**
 * Manual "Notify client" trigger — a human decides when to email, never
 * automatic. Disabled (with a hint) when the client has no email on file.
 */
export function NotifyClientButton({
  contractId,
  milestoneId,
  milestoneTitle,
  changeSummary,
  clientEmail,
  iconOnly = false,
}: {
  contractId: string;
  milestoneId?: string;
  milestoneTitle?: string;
  /** human line describing what the email will say */
  changeSummary: string;
  clientEmail: string | null;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [note, setNote] = React.useState("");

  async function onSend() {
    setPending(true);
    const result = await notifyClient({ contractId, milestoneId: milestoneId ?? "", note });
    if (result.ok) {
      toast.success(`Email sent to ${clientEmail}.`);
      setOpen(false);
      setNote("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  const trigger = iconOnly ? (
    <Button
      variant="ghost"
      size="sm"
      disabled={!clientEmail}
      aria-label={milestoneTitle ? `Notify client about ${milestoneTitle}` : "Notify client"}
      title={clientEmail ? "Email the client about this" : "Add the client's email first"}
    >
      <Bell aria-hidden />
    </Button>
  ) : (
    <Button
      variant="outline"
      size="sm"
      disabled={!clientEmail}
      title={clientEmail ? undefined : "Add the client's email first"}
    >
      <Bell aria-hidden />
      Notify client
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notify the client?</DialogTitle>
          <DialogDescription>
            Sends a branded email with a link back to their portal. You decide the
            timing — nothing fires automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                To{" "}
              </span>
              <span className="font-medium">{clientEmail}</span>
            </p>
            <p className="mt-1.5 leading-relaxed text-muted-foreground">{changeSummary}</p>
          </div>
          <div>
            <Label htmlFor="notify-note">Personal note (optional)</Label>
            <Textarea
              id="notify-note"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Finished the dashboard — take a look when you can."
              className="mt-1.5"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={pending} onClick={onSend}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
            Send email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
