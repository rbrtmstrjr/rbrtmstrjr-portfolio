"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Paperclip, Save, X } from "lucide-react";
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
import { DatePicker } from "@/components/admin/date-picker";
import {
  CONTRACT_STATUSES,
  contractFormSchema,
  type ContractFormInput,
  type ContractFormValues,
} from "@/lib/admin/contract-schema";
import {
  deleteContractFile,
  saveContract,
  seedContractMilestones,
  uploadContractFile,
} from "@/app/actions/admin-contracts";
import type { ContractFileRow, ContractRow } from "@/lib/contracts-data";

const MAX_FILE_MB = 10;
const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp";

function kb(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function rowToDefaults(row: ContractRow): ContractFormInput {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    summary: row.summary ?? "",
    status: row.status,
    scope: row.scope ?? "",
    paymentTerms: row.payment_terms ?? "",
    contractDetails: row.contract_details ?? "",
    startDate: row.start_date ?? "",
    targetEndDate: row.target_end_date ?? "",
    totalValue: row.total_value != null ? row.total_value / 100 : "",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}

export function ContractForm({
  initial,
  clients,
  files = [],
  templateCount = 0,
}: {
  initial?: ContractRow;
  clients: { id: string; name: string; company: string | null }[];
  /** already-uploaded documents (edit mode) */
  files?: ContractFileRow[];
  /** milestone templates available (Settings → Contract defaults) */
  templateCount?: number;
}) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = React.useState<File[]>([]);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [seedTemplates, setSeedTemplates] = React.useState(true);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: File[] = [];
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`"${f.name}" is over ${MAX_FILE_MB} MB — not added.`);
        continue;
      }
      next.push(f);
    }
    setPendingFiles((prev) => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function removeExisting(id: string, name: string) {
    setRemovingId(id);
    const result = await deleteContractFile(id);
    if (result.ok) {
      toast.success(`Removed "${name}".`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setRemovingId(null);
  }
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormInput, unknown, ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: initial
      ? rowToDefaults(initial)
      : {
          clientId: undefined as unknown as string,
          title: "",
          summary: "",
          status: "draft",
          scope: "",
          paymentTerms: "",
          contractDetails: "",
          startDate: "",
          targetEndDate: "",
          totalValue: "",
        },
  });

  async function onSubmit(values: ContractFormValues) {
    const result = await saveContract({ ...values, id: initial?.id });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    // seed default milestones on create (Settings → Contract defaults)
    if (!initial && seedTemplates && templateCount > 0) {
      const seeded = await seedContractMilestones(result.id);
      if (!seeded.ok) toast.error(seeded.error);
    }

    // upload attachments after the contract exists (create) or immediately (edit)
    let failed = 0;
    for (const file of pendingFiles) {
      const fd = new FormData();
      fd.append("file", file);
      const up = await uploadContractFile(result.id, fd);
      if (!up.ok) {
        failed++;
        toast.error(up.error);
      }
    }

    toast.success(
      initial
        ? "Contract updated."
        : failed
          ? "Contract created — some attachments failed, re-add them from Edit."
          : "Contract created — portal link is ready."
    );
    router.push(`/admin/contracts/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-8">
      <section className="space-y-5">
        <p className="eyebrow">Basics</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="ctf-title">
              Title <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Input
              id="ctf-title"
              placeholder="Inventory system — Phase 2"
              className="mt-1.5"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>
          <div>
            <Label htmlFor="ctf-client">
              Client <span aria-hidden className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="ctf-client"
                    className="mt-1.5 w-full"
                    aria-invalid={!!errors.clientId}
                  >
                    <SelectValue placeholder="Pick the client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        {c.company ? ` — ${c.company}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.clientId?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="ctf-summary">Summary</Label>
          <Textarea
            id="ctf-summary"
            rows={2}
            placeholder="One or two lines describing the engagement."
            className="mt-1.5"
            {...register("summary")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="ctf-status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="ctf-status" className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="ctf-start">Start date</Label>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DatePicker
                  id="ctf-start"
                  value={field.value || ""}
                  onChange={field.onChange}
                  className="mt-1.5"
                />
              )}
            />
            <FieldError message={errors.startDate?.message} />
          </div>
          <div>
            <Label htmlFor="ctf-end">Target end</Label>
            <Controller
              control={control}
              name="targetEndDate"
              render={({ field }) => (
                <DatePicker
                  id="ctf-end"
                  value={field.value || ""}
                  onChange={field.onChange}
                  className="mt-1.5"
                />
              )}
            />
            <FieldError message={errors.targetEndDate?.message} />
          </div>
        </div>

        <div className="sm:max-w-xs">
          <Label htmlFor="ctf-value">Total value (₱ — internal only)</Label>
          <Input
            id="ctf-value"
            type="number"
            min={0}
            step="0.01"
            placeholder="150000"
            className="mt-1.5"
            aria-invalid={!!errors.totalValue}
            {...register("totalValue")}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Never shown on the client portal.
          </p>
          <FieldError message={errors.totalValue?.message} />
        </div>
      </section>

      <section className="space-y-5 border-t border-border pt-8">
        <p className="eyebrow">Agreement — what the client sees</p>
        {(
          [
            ["scope", "Scope of work", "What's included (and what isn't)."],
            ["paymentTerms", "Payment terms", "Amounts, schedule, method — e.g. 50% upfront…"],
            ["contractDetails", "Contract details", "Revisions, ownership, support, timelines…"],
          ] as const
        ).map(([name, label, placeholder]) => (
          <div key={name}>
            <Label htmlFor={`ctf-${name}`}>{label}</Label>
            <Textarea
              id={`ctf-${name}`}
              rows={5}
              placeholder={placeholder}
              className="mt-1.5"
              aria-invalid={!!errors[name]}
              {...register(name)}
            />
            <FieldError message={errors[name]?.message} />
          </div>
        ))}
      </section>

      {!initial && templateCount > 0 ? (
        <section className="border-t border-border pt-8">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors has-checked:border-primary/40 has-checked:bg-primary/[0.04]">
            <input
              type="checkbox"
              checked={seedTemplates}
              onChange={(e) => setSeedTemplates(e.target.checked)}
              className="mt-0.5 size-4 accent-primary"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">
                Start from default milestones ({templateCount})
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                Seeds the phases from Settings → Contract defaults — edit them afterwards.
              </span>
            </span>
          </label>
        </section>
      ) : null}

      <section className="space-y-4 border-t border-border pt-8">
        <div>
          <p className="eyebrow">Attachments</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The signed contract, proposals, specs — Word/PDF up to {MAX_FILE_MB} MB each.
            Shown to the client on the portal&apos;s Agreement tab.
          </p>
        </div>

        {files.length ? (
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {kb(f.size_bytes)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${f.name}`}
                  disabled={removingId === f.id}
                  onClick={() => removeExisting(f.id, f.name)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {removingId === f.id ? (
                    <Loader2 className="animate-spin" aria-hidden />
                  ) : (
                    <X aria-hidden />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        {pendingFiles.length ? (
          <ul className="space-y-2">
            {pendingFiles.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2"
              >
                <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {kb(f.size)} · uploads on save
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Paperclip aria-hidden />
          Add files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          aria-label="Add contract attachments"
          onChange={(e) => addFiles(e.target.files)}
        />
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
          {initial ? "Save changes" : "Create contract"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
