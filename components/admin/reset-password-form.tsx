"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const [ready, setReady] = React.useState<boolean | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  // the recovery link signs the user in client-side; INITIAL_SESSION fires on
  // subscribe with the current state, so the listener covers both cases
  React.useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setReady(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8) return setError("At least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setPending(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }
    setDone(true);
    setTimeout(() => window.location.assign("/admin"), 1200);
  }

  if (ready === null) {
    return (
      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Checking your recovery link…
      </p>
    );
  }

  if (!ready) {
    return (
      <p className="mt-6 rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed">
        This link is invalid or expired. Request a new one from the{" "}
        <a href="/admin/login" className="font-medium text-primary underline underline-offset-4">
          login page
        </a>{" "}
        via &quot;Forgot password?&quot;.
      </p>
    );
  }

  if (done) {
    return (
      <p className="mt-6 rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed">
        Password updated — taking you to the admin…
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="rp-password">New password</Label>
        <Input id="rp-password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rp-confirm">Confirm new password</Label>
        <Input id="rp-confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="btn-cta w-full">
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
        Set new password
      </Button>
    </form>
  );
}
