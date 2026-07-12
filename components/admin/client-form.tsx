"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
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
  CLIENT_STATUSES,
  clientFormSchema,
  type ClientFormInput,
  type ClientFormValues,
} from "@/lib/admin/client-schema";
import { saveClient } from "@/app/actions/admin-clients";
import type { ClientRow } from "@/lib/clients-data";

function rowToDefaults(row: ClientRow): ClientFormInput {
  return {
    id: row.id,
    name: row.name,
    company: row.company ?? "",
    contactEmail: row.contact_email ?? "",
    contactPhone: row.contact_phone ?? "",
    location: row.location ?? "",
    website: row.website ?? "",
    source: row.source ?? "",
    status: row.status,
    notes: row.notes ?? "",
  };
}

const BLANK: ClientFormInput = {
  name: "",
  company: "",
  contactEmail: "",
  contactPhone: "",
  location: "",
  website: "",
  source: "",
  status: "active",
  notes: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}

export function ClientForm({ initial }: { initial?: ClientRow }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormInput, unknown, ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initial ? rowToDefaults(initial) : BLANK,
  });

  async function onSubmit(values: ClientFormValues) {
    const result = await saveClient({ ...values, id: initial?.id });
    if (result.ok) {
      toast.success(initial ? "Client updated." : "Client added.");
      // land on the record itself, not the list
      router.push(`/admin/clients/${result.id}`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-name">
            Name <span aria-hidden className="text-destructive">*</span>
          </Label>
          <Input
            id="cf-name"
            placeholder="Joshua Ramos"
            className="mt-1.5"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="cf-company">Company</Label>
          <Input
            id="cf-company"
            placeholder="Mr. Kamote Chips"
            className="mt-1.5"
            {...register("company")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-email">Email</Label>
          <Input
            id="cf-email"
            type="email"
            placeholder="client@business.com"
            className="mt-1.5"
            aria-invalid={!!errors.contactEmail}
            {...register("contactEmail")}
          />
          <FieldError message={errors.contactEmail?.message} />
        </div>
        <div>
          <Label htmlFor="cf-phone">Phone</Label>
          <Input
            id="cf-phone"
            placeholder="+63 9xx xxx xxxx"
            className="mt-1.5"
            {...register("contactPhone")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-location">Location</Label>
          <Input
            id="cf-location"
            placeholder="Manila, PH"
            className="mt-1.5"
            {...register("location")}
          />
        </div>
        <div>
          <Label htmlFor="cf-website">Website</Label>
          <Input
            id="cf-website"
            placeholder="https://…"
            className="mt-1.5"
            aria-invalid={!!errors.website}
            {...register("website")}
          />
          <FieldError message={errors.website?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-source">Source</Label>
          <Input
            id="cf-source"
            placeholder="Referral / Upwork / Direct…"
            className="mt-1.5"
            {...register("source")}
          />
        </div>
        <div>
          <Label htmlFor="cf-status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="cf-status" className="mt-1.5 w-full">
                  <SelectValue placeholder="Pick a status" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.status?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="cf-notes">Notes</Label>
        <Textarea
          id="cf-notes"
          rows={4}
          placeholder="Anything worth remembering — context, preferences, history…"
          className="mt-1.5"
          {...register("notes")}
        />
        <FieldError message={errors.notes?.message} />
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Save aria-hidden />
          )}
          {initial ? "Save changes" : "Add client"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
