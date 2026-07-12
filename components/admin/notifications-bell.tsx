"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, MessageSquareQuote, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { markAllNotificationsRead } from "@/app/actions/admin-contracts";
import type { AdminNotificationRow } from "@/lib/contracts-data";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  milestone_approved: CheckCircle2,
  changes_requested: MessageSquareWarning,
  testimonial_submitted: MessageSquareQuote,
} as const;

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
}

/** Top-bar inbox of client-originated events (approvals, notes, testimonials). */
export function NotificationsBell({
  notifications,
}: {
  notifications: AdminNotificationRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  async function onOpenChange(next: boolean) {
    setOpen(next);
    // opening = reading: clear the badge, keep the list
    if (next && unread > 0) {
      await markAllNotificationsRead();
      router.refresh();
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unread ? ` — ${unread} unread` : ""}`}
          className="relative"
        >
          <Bell aria-hidden />
          {unread > 0 ? (
            <span
              aria-hidden
              className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)] p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="font-sans text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">
            What clients did on their portals.
          </p>
        </div>
        {notifications.length ? (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? Bell;
              return (
                <li key={n.id}>
                  <Link
                    href={`/admin/contracts/${n.contract_id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent",
                      !n.read && "bg-primary/[0.04]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        n.read ? "text-muted-foreground" : "text-primary"
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-xs leading-relaxed",
                          !n.read && "font-medium"
                        )}
                      >
                        {n.message}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                        {timeAgo(n.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing yet — client approvals, change requests, and testimonials land here.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
