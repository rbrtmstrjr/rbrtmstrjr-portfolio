"use client";

/**
 * Client portal — everything the client sees and does, driven by the secret
 * token. Two tabs (Milestones / Agreement) + a testimonial card once the
 * contract is completed. Uses only the whitelisted PortalData shape.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  FileText,
  Flag,
  Loader2,
  MessageSquareWarning,
  PartyPopper,
  Send,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WindowCard } from "@/components/ui/window-card";
import {
  approveMilestone,
  requestMilestoneChanges,
  submitTestimonial,
} from "@/app/actions/portal";
import type { PortalData } from "@/lib/contracts-data";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* --------------------------------- header --------------------------------- */

function ProgressHeader({ data }: { data: PortalData }) {
  const total = data.milestones.length;
  const approved = data.milestones.filter((m) => m.status === "approved").length;
  const pct = total ? Math.round((approved / total) * 100) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl sm:text-4xl">{data.contract.title}</h1>
        {data.contract.status === "completed" ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/[0.05] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/80">
            <PartyPopper className="size-3" aria-hidden />
            Completed
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        For {data.clientName}
        {data.contract.summary ? ` — ${data.contract.summary}` : ""}
      </p>
      {total > 0 ? (
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Overall progress
            </p>
            <p className="font-display text-2xl text-primary">{pct}%</p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[var(--ease-out-quart)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {approved} of {total} milestones approved
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------- milestones (timeline) -------------------------- */

const STATUS_LABEL: Record<string, string> = {
  pending: "Upcoming",
  in_progress: "In progress",
  ready_for_review: "Ready for your review",
  approved: "Approved",
  changes_requested: "Changes requested — we're on it",
};

/** Status badge — functional colors per state (success/warning tokens). */
function StatusBadge({ status }: { status: PortalData["milestones"][number]["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        status === "approved" && "border border-success/25 bg-success/10 text-success",
        status === "ready_for_review" && "bg-primary text-primary-foreground shadow-sm shadow-primary/25",
        status === "in_progress" && "border border-primary/20 bg-primary/[0.08] text-primary",
        status === "changes_requested" && "border border-warning/30 bg-warning/10 text-warning",
        status === "pending" && "border border-border bg-secondary text-muted-foreground"
      )}
    >
      {status === "in_progress" ? (
        <span className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden />
      ) : null}
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Timeline node — the visual state of each step. */
function TimelineNode({
  status,
  index,
}: {
  status: PortalData["milestones"][number]["status"];
  index: number;
}) {
  if (status === "approved") {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-success text-background shadow-sm shadow-success/30">
        <Check className="size-4" aria-hidden />
      </span>
    );
  }
  if (status === "ready_for_review") {
    return (
      <span className="relative flex size-9 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full bg-primary/25 motion-safe:animate-ping"
          aria-hidden
        />
        <span className="relative flex size-9 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
          <Flag className="size-4" aria-hidden />
        </span>
      </span>
    );
  }
  if (status === "changes_requested") {
    return (
      <span className="flex size-9 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/5 text-primary">
        <MessageSquareWarning className="size-4" aria-hidden />
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="flex size-9 items-center justify-center rounded-full border-2 border-primary/50 bg-background text-primary">
        <CircleDashed
          className="size-4 motion-safe:animate-spin [animation-duration:6s]"
          aria-hidden
        />
      </span>
    );
  }
  return (
    <span className="flex size-9 items-center justify-center rounded-full border-2 border-border bg-background font-mono text-xs text-muted-foreground">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function MilestoneItem({
  m,
  index,
  isLast,
  token,
}: {
  m: PortalData["milestones"][number];
  index: number;
  isLast: boolean;
  token: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [note, setNote] = React.useState("");

  async function onApprove() {
    setPending(true);
    const result = await approveMilestone(token, m.id);
    if (result.ok) {
      toast.success("Milestone approved — thank you!");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  async function onRequestChanges() {
    setPending(true);
    const result = await requestMilestoneChanges(token, m.id, note);
    if (result.ok) {
      toast.success("Sent — we'll get on it and flag this again when it's ready.");
      setNoteOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  const reviewing = m.status === "ready_for_review";
  const done = m.status === "approved";
  const upcoming = m.status === "pending";

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: index * 0.08 }}
      className="relative flex gap-4 pb-8 last:pb-0"
    >
      {/* connector — filled once this step is approved */}
      {!isLast ? (
        <span
          aria-hidden
          className={cn(
            "absolute top-11 bottom-0 left-[17px] w-0.5 rounded-full",
            done ? "bg-success/50" : "bg-border"
          )}
        />
      ) : null}

      <span className="relative z-10 shrink-0">
        <TimelineNode status={m.status} index={index} />
      </span>

      <div
        className={cn(
          "min-w-0 flex-1 pt-1",
          reviewing &&
            "-mt-1 rounded-xl border border-primary/25 bg-primary/[0.04] p-4 shadow-sm shadow-primary/10"
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span
            className={cn(
              "font-mono text-[10px]",
              upcoming ? "text-muted-foreground/60" : "text-primary"
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <p
            className={cn(
              "text-base font-semibold",
              done && "text-primary",
              upcoming && "font-medium text-muted-foreground/70"
            )}
          >
            {m.title}
          </p>
          <StatusBadge status={m.status} />
        </div>

        {m.description ? (
          <p
            className={cn(
              "mt-1.5 text-sm leading-relaxed text-muted-foreground",
              upcoming && "text-muted-foreground/60"
            )}
          >
            {m.description}
          </p>
        ) : null}

        {m.links.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {m.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors duration-300 hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {link.label}
                <ExternalLink
                  className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-px group-hover/link:-translate-y-px"
                  aria-hidden
                />
              </a>
            ))}
          </div>
        ) : null}

        {reviewing ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" disabled={pending} onClick={onApprove} className="btn-cta !h-9 !px-5 !text-sm">
                {pending && !noteOpen ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  <Check aria-hidden />
                )}
                Approve this milestone
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => setNoteOpen((v) => !v)}
              >
                Request changes
              </Button>
            </div>
            <AnimatePresence initial={false}>
              {noteOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor={`note-${m.id}`} className="text-xs">
                    What should we change?
                  </Label>
                  <Textarea
                    id={`note-${m.id}`}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tell us what's off — the more specific, the faster we fix it."
                  />
                  <Button
                    size="sm"
                    disabled={pending || note.trim().length < 5}
                    onClick={onRequestChanges}
                  >
                    {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
                    Send note
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}

        {m.status === "changes_requested" && m.client_note ? (
          <p className="mt-3 rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            Your note: “{m.client_note}”
          </p>
        ) : null}

        {done && m.approved_at ? (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Approved {new Date(m.approved_at).toLocaleDateString()}
          </p>
        ) : null}
      </div>
    </motion.li>
  );
}

/* -------------------------------- agreement ------------------------------- */

function AgreementTab({
  contract,
  files,
}: {
  contract: PortalData["contract"];
  files: PortalData["files"];
}) {
  const sections = [
    ["Scope of work", contract.scope],
    ["Payment terms", contract.payment_terms],
    ["Contract details", contract.contract_details],
  ] as const;
  const hasAny = sections.some(([, v]) => v);

  return (
    <div className="space-y-6 p-6">
      {hasAny ? (
        sections.map(([label, value]) =>
          value ? (
            <section key={label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
            </section>
          ) : null
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          The agreement text is being prepared — check back soon.
        </p>
      )}
      {files.length ? (
        <section className="border-t border-border pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Documents
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {files.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors duration-300 hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <FileText className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{f.name}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
      {contract.start_date || contract.target_end_date ? (
        <p className="flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden />
          {contract.start_date ? `Started ${contract.start_date}` : null}
          {contract.start_date && contract.target_end_date ? " · " : null}
          {contract.target_end_date ? `Target ${contract.target_end_date}` : null}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------- testimonial ------------------------------ */

function TestimonialCard({ token, submitted }: { token: string; submitted: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [rating, setRating] = React.useState<number | null>(null);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const result = await submitTestimonial(token, {
      authorName: String(form.get("authorName") ?? ""),
      authorRole: String(form.get("authorRole") ?? ""),
      body: String(form.get("body") ?? ""),
      rating: rating ?? "",
    });
    if (result.ok) {
      setDone(true);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  if (submitted || done) {
    return (
      <WindowCard label="thank-you" className="mt-8" contentClassName="p-8 text-center">
        <CheckCircle2 className="mx-auto size-8 text-primary" aria-hidden />
        <h2 className="mt-4 text-2xl">Thank you!</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your words mean a lot. It was a pleasure building this with you.
        </p>
      </WindowCard>
    );
  }

  return (
    <WindowCard label="testimonial" className="mt-8" contentClassName="p-6 md:p-8">
      <h2 className="text-2xl">The project&apos;s done — how was it?</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        If you have a minute, a few honest words about working together would mean a
        lot. Your feedback may be featured on my portfolio (with your approval baked in
        — I review everything first).
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="t-name">
              Your name <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input id="t-name" name="authorName" className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="t-role">Role / business</Label>
            <Input id="t-role" name="authorRole" placeholder="Owner, Mr. Kamote Chips" className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="t-body">
            Your words <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Textarea
            id="t-body"
            name="body"
            rows={4}
            className="mt-1.5"
            placeholder="What was the problem, and how did it go?"
            required
          />
        </div>
        <div>
          <Label>Rating (optional)</Label>
          <div className="mt-1.5 flex items-center gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                onClick={() => setRating(rating === n ? null : n)}
                className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Star
                  className={cn(
                    "size-6 transition-colors",
                    rating != null && n <= rating ? "fill-primary text-primary" : "text-border"
                  )}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={pending} className="btn-cta">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
          Send testimonial
        </Button>
      </form>
    </WindowCard>
  );
}

/* ---------------------------------- tabs ---------------------------------- */

export function PortalView({ data, token }: { data: PortalData; token: string }) {
  const [tab, setTab] = React.useState<"milestones" | "agreement">("milestones");

  return (
    <div>
      <ProgressHeader data={data} />

      <div
        role="tablist"
        aria-label="Portal sections"
        className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1"
      >
        {(
          [
            ["milestones", "Milestones"],
            ["agreement", "Agreement"],
          ] as const
        ).map(([key, label]) => {
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active ? "font-medium text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="portal-tab-pill"
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="absolute inset-0 rounded-full bg-primary shadow-sm shadow-primary/25"
                  aria-hidden
                />
              ) : null}
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <WindowCard
              label={tab === "milestones" ? "progress" : "agreement"}
              contentClassName="p-0"
            >
              {tab === "milestones" ? (
                data.milestones.length ? (
                  <ol className="p-6 md:p-8">
                    {data.milestones.map((m, i) => (
                      <MilestoneItem
                        key={m.id}
                        m={m}
                        index={i}
                        isLast={i === data.milestones.length - 1}
                        token={token}
                      />
                    ))}
                  </ol>
                ) : (
                  <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                    Milestones will appear here once the project plan is set.
                  </p>
                )
              ) : (
                <AgreementTab contract={data.contract} files={data.files} />
              )}
            </WindowCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {data.contract.status === "completed" ? (
        <TestimonialCard token={token} submitted={data.testimonialSubmitted} />
      ) : null}
    </div>
  );
}
