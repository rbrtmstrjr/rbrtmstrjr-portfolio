import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  FileText,
  Link2,
  MessageSquareQuote,
} from "lucide-react";
import { WindowCard } from "@/components/ui/window-card";
import { ContractStatusBadge } from "@/components/admin/contracts-list";
import { MarkCompletedButton } from "@/components/admin/contract-status-select";
import { MilestonesManager } from "@/components/admin/milestones-manager";
import { NotifyClientButton } from "@/components/admin/notify-client-button";
import { PortalLinkCard } from "@/components/admin/portal-link-card";
import { TestimonialReview } from "@/components/admin/testimonial-review";
import {
  getContractRow,
  getMilestoneLinkRows,
  getMilestoneRows,
  getNotificationRows,
  getSignedContractFiles,
  getTestimonialForContract,
} from "@/lib/contracts-data";
import { getClientRow } from "@/lib/clients-data";

export const metadata = { title: "Contract" };

function TermsBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
    </div>
  );
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContractRow(id);
  if (!contract) notFound();

  const [client, milestones, testimonial, notifications, attachments] = await Promise.all([
    getClientRow(contract.client_id),
    getMilestoneRows(contract.id),
    getTestimonialForContract(contract.id),
    getNotificationRows(contract.id),
    getSignedContractFiles(contract.id),
  ]);
  const links = await getMilestoneLinkRows(milestones.map((m) => m.id));

  const approved = milestones.filter((m) => m.status === "approved").length;
  const clientEmail = client?.contact_email ?? null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/contracts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Contracts
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl">{contract.title}</h1>
              <ContractStatusBadge status={contract.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {client ? (
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="underline-offset-4 hover:text-primary hover:underline"
                >
                  {client.company || client.name}
                </Link>
              ) : (
                "Unknown client"
              )}
              {" · "}
              <span className="font-mono text-xs">
                {approved}/{milestones.length} milestones approved
              </span>
              {contract.total_value != null ? (
                <>
                  {" · "}
                  <span className="font-mono text-xs">
                    ₱{(contract.total_value / 100).toLocaleString()} (internal)
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <MarkCompletedButton contractId={contract.id} status={contract.status} />
          </div>
        </div>
      </div>

      {milestones.length > 0 &&
      approved === milestones.length &&
      contract.status !== "completed" &&
      contract.status !== "archived" ? (
        <div className="rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed">
          <span className="font-semibold">Every milestone is approved 🎉</span> — hit{" "}
          <span className="font-semibold">Mark as completed</span> (top right) and the
          client&apos;s portal will ask them for a testimonial.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* left column — portal link + terms */}
        <div className="space-y-6">
          <WindowCard label="client/portal-link" contentClassName="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="size-4 text-primary" aria-hidden />
              <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
                Client portal
              </h2>
            </div>
            <PortalLinkCard token={contract.portal_token} />
            <div className="mt-4 border-t border-border pt-4">
              <NotifyClientButton
                contractId={contract.id}
                changeSummary={
                  contract.status === "completed"
                    ? "The email announces the project is complete and nudges them toward the testimonial."
                    : "The email shares a general progress update with a portal link."
                }
                clientEmail={clientEmail}
              />
            </div>
          </WindowCard>

          {notifications.length ? (
            <WindowCard label="contracts/notifications" contentClassName="p-0">
              <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
                <Bell className="size-4 text-primary" aria-hidden />
                <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
                  Emails sent
                </h2>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {notifications.length}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <li key={n.id} className="px-5 py-3">
                    <p className="truncate text-xs font-medium">{n.subject}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {new Date(n.sent_at).toLocaleString()} · {n.sent_to}
                    </p>
                    {n.note ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">“{n.note}”</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </WindowCard>
          ) : null}

          <WindowCard label="contracts/terms" contentClassName="space-y-5 p-5">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" aria-hidden />
              <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
                Agreement
              </h2>
            </div>
            {contract.summary ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{contract.summary}</p>
            ) : null}
            <TermsBlock label="Scope of work" value={contract.scope} />
            <TermsBlock label="Payment terms" value={contract.payment_terms} />
            <TermsBlock label="Contract details" value={contract.contract_details} />
            {contract.start_date || contract.target_end_date ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden />
                {contract.start_date ?? "—"} → {contract.target_end_date ?? "—"}
              </p>
            ) : null}
            {attachments.length ? (
              <div className="border-t border-border pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Attachments
                </p>
                <ul className="mt-2 space-y-1.5">
                  {attachments.map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                      >
                        <FileText className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{f.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!contract.scope && !contract.payment_terms && !contract.contract_details ? (
              <p className="text-sm text-muted-foreground">
                No agreement text yet —{" "}
                <Link
                  href={`/admin/contracts/${contract.id}/edit`}
                  className="font-medium text-primary"
                >
                  add the terms
                </Link>{" "}
                so the client&apos;s Agreement tab isn&apos;t empty.
              </p>
            ) : null}
          </WindowCard>
        </div>

        {/* right column — milestones + testimonial */}
        <div className="space-y-6">
          <WindowCard label="contracts/milestones" contentClassName="p-0">
            <MilestonesManager
              contractId={contract.id}
              milestones={milestones}
              links={links}
              clientEmail={clientEmail}
              locked={contract.status === "completed" || contract.status === "archived"}
            />
          </WindowCard>

          <WindowCard label="contracts/testimonial" contentClassName="p-0">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-5 py-3">
              <MessageSquareQuote className="size-4 text-primary" aria-hidden />
              <h2 className="font-sans text-sm font-semibold normal-case tracking-normal">
                Testimonial
              </h2>
            </div>
            {testimonial ? (
              <TestimonialReview testimonial={testimonial} />
            ) : (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                {contract.status === "completed"
                  ? "Waiting for the client — the portal is asking them for a testimonial."
                  : "Opens on the portal once the contract is marked Completed."}
              </p>
            )}
          </WindowCard>
        </div>
      </div>
    </div>
  );
}
