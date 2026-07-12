"use client";

import * as React from "react";
import { KeyRound, Loader2, Mail, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/**
 * Credentials via Supabase Auth. Every sensitive change requires the CURRENT
 * password (fresh re-auth via signInWithPassword) — a stale session alone is
 * never enough. The reset-email button is the lock-out safety net.
 */
export function AccountSettings({ currentEmail }: { currentEmail: string }) {
  const [pending, setPending] = React.useState<"email" | "password" | "reset" | null>(null);
  const [emailNotice, setEmailNotice] = React.useState(false);

  async function reauth(currentPassword: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { supabase: null, ok: false };
    const { error } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });
    if (error) {
      toast.error("Current password is incorrect.");
      return { supabase, ok: false };
    }
    return { supabase, ok: true };
  }

  async function onChangeEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newEmail = String(form.get("newEmail") ?? "").trim();
    const confirm = String(form.get("confirmEmail") ?? "").trim();
    const currentPassword = String(form.get("currentPassword") ?? "");
    if (newEmail !== confirm) return void toast.error("Email addresses don't match.");

    setPending("email");
    const { supabase, ok } = await reauth(currentPassword);
    if (ok && supabase) {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) toast.error(error.message);
      else {
        setEmailNotice(true);
        toast.success("Check the new inbox — confirm the link to finish the change.");
      }
    }
    setPending(null);
  }

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");
    const currentPassword = String(form.get("currentPasswordPw") ?? "");
    if (newPassword.length < 8) return void toast.error("At least 8 characters.");
    if (newPassword !== confirm) return void toast.error("Passwords don't match.");

    setPending("password");
    const { supabase, ok } = await reauth(currentPassword);
    if (ok && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) toast.error(error.message);
      else {
        toast.success("Password changed.");
        formEl.reset();
      }
    }
    setPending(null);
  }

  async function onSendReset() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setPending("reset");
    const { error } = await supabase.auth.resetPasswordForEmail(currentEmail, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success(`Reset email sent to ${currentEmail}.`);
    setPending(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* change email */}
      <form onSubmit={onChangeEmail} className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-primary" aria-hidden />
          <h3 className="font-sans text-sm font-semibold normal-case tracking-normal">
            Change email
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{currentEmail}</span>
        </p>
        <div>
          <Label htmlFor="ac-new-email">New email</Label>
          <Input id="ac-new-email" name="newEmail" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="ac-confirm-email">Confirm new email</Label>
          <Input id="ac-confirm-email" name="confirmEmail" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="ac-current-pw">Current password</Label>
          <Input
            id="ac-current-pw"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
          />
        </div>
        {emailNotice ? (
          <p className="rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs leading-relaxed">
            Confirmation sent — the change completes when you click the link in the new
            inbox.
          </p>
        ) : null}
        <Button type="submit" disabled={pending !== null}>
          {pending === "email" ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
          Update email
        </Button>
      </form>

      {/* change password */}
      <form onSubmit={onChangePassword} className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" aria-hidden />
          <h3 className="font-sans text-sm font-semibold normal-case tracking-normal">
            Change password
          </h3>
        </div>
        <div>
          <Label htmlFor="ac-new-pw">New password</Label>
          <Input
            id="ac-new-pw"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ac-confirm-pw">Confirm new password</Label>
          <Input
            id="ac-confirm-pw"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ac-current-pw2">Current password</Label>
          <Input
            id="ac-current-pw2"
            name="currentPasswordPw"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
          />
        </div>
        <Button type="submit" disabled={pending !== null}>
          {pending === "password" ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
          Update password
        </Button>
      </form>

      {/* recovery safety net */}
      <div className="border-t border-border pt-5 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Locked out or forgot the password? Send yourself a reset link — it lands at{" "}
            <span className="font-medium text-foreground">{currentEmail}</span> and opens
            the reset page.
          </p>
          <Button variant="outline" size="sm" disabled={pending !== null} onClick={onSendReset}>
            {pending === "reset" ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
            Send password reset email
          </Button>
        </div>
      </div>
    </div>
  );
}
