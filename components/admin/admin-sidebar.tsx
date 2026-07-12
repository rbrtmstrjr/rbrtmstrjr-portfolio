"use client";

/**
 * Admin shell navigation — persistent left sidebar on desktop, hamburger +
 * Sheet drawer on mobile. Sections land here as the admin grows; "soon" items
 * keep the roadmap visible without pretending to work.
 */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  CreditCard,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Menu,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { LogoutButton } from "@/components/admin/logout-button";
import { NotificationsBell } from "@/components/admin/notifications-bell";
import type { AdminNotificationRow } from "@/lib/contracts-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/contracts", label: "Contracts", icon: FileText },
  // Categories are managed inside Projects (dialog + list card)
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
] as const;

// Roadmap — visible but non-functional until their modules ship.
const SOON = [
  { label: "Leads", icon: Target },
  { label: "Payments", icon: CreditCard },
  { label: "Reports", icon: BarChart3 },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, ...item }) => {
        const active =
          "exact" in item && item.exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}

      <p className="eyebrow mt-6 px-3 !text-[10px]">Soon</p>
      <div className="mt-1 flex flex-col gap-1" aria-hidden>
        {SOON.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/50"
          >
            <Icon className="size-4 shrink-0" />
            {label}
            <span className="ml-auto rounded-lg border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">
              Soon
            </span>
          </span>
        ))}
      </div>
    </nav>
  );
}

function ViewSiteLink() {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="w-full justify-start text-muted-foreground"
    >
      <Link href="/" target="_blank">
        <ExternalLink aria-hidden />
        View site
      </Link>
    </Button>
  );
}

/** Mobile drawer footer — the desktop top bar covers theme/sign-out instead. */
function DrawerFooter() {
  return (
    <div className="space-y-1 border-t border-border pt-4">
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <ViewSiteLink />
        </div>
        <ThemeToggle />
      </div>
      <LogoutButton className="w-full justify-start text-muted-foreground" />
    </div>
  );
}

/** Sticky top-right actions for the desktop admin (inbox + theme + sign out). */
export function AdminTopbar({ notifications }: { notifications: AdminNotificationRow[] }) {
  return (
    <div className="sticky top-0 z-30 hidden items-center justify-end gap-1 border-b border-border bg-background/85 px-6 py-2 backdrop-blur-md md:flex">
      <NotificationsBell notifications={notifications} />
      <ThemeToggle />
      <LogoutButton className="text-muted-foreground" />
    </div>
  );
}

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/admin" className="font-display text-2xl text-foreground transition-opacity hover:opacity-70">
        {site.wordmark}
      </Link>
      <span className="eyebrow rounded-lg border border-primary/15 bg-primary/[0.05] px-2.5 py-1 !text-primary/80">
        Admin
      </span>
    </div>
  );
}

export function AdminSidebar({
  notifications = [],
}: {
  notifications?: AdminNotificationRow[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* mobile top bar + drawer */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:hidden">
        <Wordmark />
        <div className="flex items-center gap-1">
          <NotificationsBell notifications={notifications} />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open admin menu">
              <Menu aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background p-0">
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle asChild>
                <div>
                  <Wordmark />
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <div className="px-3 pb-4">
              <DrawerFooter />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-card/40 px-4 py-6 md:flex">
        <div className="px-3 pb-6">
          <Wordmark />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavList />
        </div>
        <div className="border-t border-border pt-4">
          <ViewSiteLink />
        </div>
      </aside>
    </>
  );
}
