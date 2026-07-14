import {
  CalendarClock,
  Globe,
  ListChecks,
  Palette,
  Plug,
  UserRound,
} from "lucide-react";
import { WindowCard } from "@/components/ui/window-card";
import { AccountSettings } from "@/components/admin/account-settings";
import { PalettesManager } from "@/components/admin/palette-settings";
import {
  AvailabilityForm,
  SiteInfoForm,
  TemplatesManager,
} from "@/components/admin/settings-forms";
import { getAdminUser } from "@/lib/supabase/server-auth";
import { getMilestoneTemplates, getSettingsRow } from "@/lib/settings-data";
import { getPaletteRows } from "@/lib/palettes-data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Settings" };

type Health = "connected" | "missing" | "error";

function HealthBadge({ state, note }: { state: Health; note: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em]",
        state === "connected" && "border border-success/25 bg-success/10 text-success",
        state === "missing" && "border border-border bg-secondary text-muted-foreground",
        state === "error" && "border border-warning/30 bg-warning/10 text-warning"
      )}
      title={note}
    >
      {state === "connected" ? "✓" : state === "missing" ? "—" : "⚠"} {note}
    </span>
  );
}

/** Env presence + light validity pings. Secrets never rendered. */
async function checkIntegrations() {
  const checks: { name: string; state: Health; note: string }[] = [];

  // Supabase — env + a trivial query
  if (!getSupabaseAdmin()) {
    checks.push({ name: "Supabase", state: "missing", note: "env keys not set" });
  } else {
    const { error } = await getSupabaseAdmin()!.from("settings").select("id").limit(1);
    checks.push(
      error && error.code !== "42P01"
        ? { name: "Supabase", state: "error", note: "connection error" }
        : { name: "Supabase", state: "connected", note: "connected" }
    );
  }

  // Resend — key validity via the domains endpoint
  if (!process.env.RESEND_API_KEY) {
    checks.push({ name: "Resend", state: "missing", note: "RESEND_API_KEY not set" });
  } else {
    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        cache: "no-store",
      });
      checks.push(
        res.ok
          ? { name: "Resend", state: "connected", note: "key valid" }
          : { name: "Resend", state: "error", note: `key rejected (${res.status})` }
      );
    } catch {
      checks.push({ name: "Resend", state: "error", note: "unreachable" });
    }
  }

  // GitHub token — optional; feed works tokenless via public HTML
  if (!process.env.GITHUB_TOKEN) {
    checks.push({ name: "GitHub token", state: "missing", note: "optional — using public fallback" });
  } else {
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
        cache: "no-store",
      });
      checks.push(
        res.ok
          ? { name: "GitHub token", state: "connected", note: "token valid" }
          : { name: "GitHub token", state: "error", note: `token rejected (${res.status})` }
      );
    } catch {
      checks.push({ name: "GitHub token", state: "error", note: "unreachable" });
    }
  }

  return checks;
}

function Section({
  label,
  title,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  title: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <WindowCard label={label} contentClassName="p-0">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
        <Icon className="size-4 text-primary" aria-hidden />
        <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">{title}</h2>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:inline">
          {hint}
        </span>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </WindowCard>
  );
}

export default async function AdminSettingsPage() {
  const [user, settings, templates, palettes, integrations] = await Promise.all([
    getAdminUser(),
    getSettingsRow(),
    getMilestoneTemplates(),
    getPaletteRows(),
    checkIntegrations(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Settings</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Credentials, site info, availability, and contract defaults. Site-facing values
          update the public pages on save — no redeploy.
        </p>
      </div>

      <Section label="settings/account" title="Account" hint="Supabase Auth" icon={UserRound}>
        <AccountSettings currentEmail={user?.email ?? ""} />
      </Section>

      <Section label="settings/site" title="Site info" hint="feeds footer + contact" icon={Globe}>
        <SiteInfoForm settings={settings} />
      </Section>

      <Section
        label="settings/availability"
        title="Availability"
        hint="drives the hero pulse"
        icon={CalendarClock}
      >
        <AvailabilityForm settings={settings} />
      </Section>

      <Section
        label="settings/palettes"
        title="Accent palettes"
        hint="visitors pick from this menu"
        icon={Palette}
      >
        <PalettesManager rows={palettes} />
      </Section>

      <Section
        label="settings/contract-defaults"
        title="Contract defaults"
        hint="default milestones"
        icon={ListChecks}
      >
        <TemplatesManager templates={templates} />
      </Section>

      <Section label="settings/integrations" title="Integrations" hint="read-only" icon={Plug}>
        <ul className="space-y-3">
          {integrations.map((c) => (
            <li key={c.name} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">{c.name}</span>
              <HealthBadge state={c.state} note={c.note} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Keys live in env only — this panel never shows or edits secrets.
        </p>
      </Section>
    </div>
  );
}
