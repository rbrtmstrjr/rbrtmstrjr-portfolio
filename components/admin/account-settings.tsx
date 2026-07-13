"use client";

import * as React from "react";
import { Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/**
 * One simple form for credentials via Supabase Auth: fill in a new email, a
 * new password, or both — the current password is always required (fresh
 * re-auth via signInWithPassword; a stale session alone is never enough).
 * The reset-email button is the lock-out safety net.
 */
export function AccountSettings({ currentEmail }: { currentEmail: string }) {
  const [pending, setPending] = React.useState<"save" | "reset" | null>(null);
  const [emailNotice, setEmailNotice] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const newEmail = String(form.get("newEmail") ?? "").trim();
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const currentPassword = String(form.get("currentPassword") ?? "");

    const wantsEmail = Boolean(newEmail) && newEmail.toLowerCase() !== currentEmail.toLowerCase();
    const wantsPassword = newPassword.length > 0;

    if (newEmail && !wantsEmail)
      return void toast.error("That's already your sign-in email.");
    if (!wantsEmail && !wantsPassword)
      return void toast.error("Nothing to change — enter a new email or a new password.");
    if (wantsPassword && newPassword.length < 8)
      return void toast.error("New password needs at least 8 characters.");
    if (wantsPassword && newPassword !== confirmPassword)
      return void toast.error("Passwords don't match.");

    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    setPending("save");
    // fresh re-auth — the current password is the real gate
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });
    if (authError) {
      toast.error("Current password is incorrect.");
      setPending(null);
      return;
    }

    if (wantsPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
        setPending(null);
        return;
      }
      toast.success("Password changed.");
    }

    if (wantsEmail) {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        // bring the confirmation links back here instead of the public homepage
        { emailRedirectTo: `${window.location.origin}/admin/settings` }
      );
      if (error) toast.error(error.message);
      else {
        setEmailNotice(true);
        toast.success("Confirmation links sent — check both inboxes.");
      }
    }

    formEl.reset();
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
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="max-w-lg space-y-4">
        <p className="text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{currentEmail}</span>.
          Change what you need and leave the rest blank.
        </p>
        <div>
          <Label htmlFor="ac-new-email">New email</Label>
          <Input
            id="ac-new-email"
            name="newEmail"
            type="email"
            autoComplete="email"
            placeholder="Leave blank to keep the current email"
            className="mt-1.5"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ac-new-pw">New password</Label>
            <Input
              id="ac-new-pw"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Leave blank to keep"
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
              minLength={8}
              className="mt-1.5"
            />
          </div>
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
          <p className="mt-1.5 text-xs text-muted-foreground">
            Required to save any change.
          </p>
        </div>
        {emailNotice ? (
          <p className="rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs leading-relaxed">
            Supabase sent a confirmation link to <strong>both</strong> the current and the
            new inbox — the email change completes only after you click{" "}
            <strong>both</strong> links.
          </p>
        ) : null}
        <Button type="submit" disabled={pending !== null}>
          {pending === "save" ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
          Save changes
        </Button>
      </form>

      {/* recovery safety net */}
      <div className="border-t border-border pt-5">
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
