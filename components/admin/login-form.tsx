"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [resetSent, setResetSent] = React.useState(false);
  const emailRef = React.useRef<HTMLInputElement>(null);

  async function onForgotPassword() {
    const email = emailRef.current?.value.trim();
    if (!email) {
      setError("Type your email above first, then hit Forgot password.");
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    if (resetError) setError(resetError.message);
    else setResetSent(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    setPending(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (signInError) {
      setError("That email/password combination didn't work.");
      setPending(false);
      return;
    }
    // Full navigation so the proxy guard sees the fresh session cookies.
    window.location.assign("/admin");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          ref={emailRef}
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="btn-cta w-full">
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
      {resetSent ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Reset email sent — check your inbox and follow the link.
        </p>
      ) : (
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Forgot password?
        </button>
      )}
    </form>
  );
}
