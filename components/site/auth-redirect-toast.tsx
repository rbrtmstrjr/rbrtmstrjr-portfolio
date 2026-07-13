"use client";

/**
 * Surfaces the status Supabase Auth appends to redirect URLs
 * (?message= / #message= on success, error_description on failure) as a toast,
 * then cleans the URL. Mounted once in the root layout so the message shows
 * wherever the link lands — /admin/settings, the login page, or the homepage
 * fallback when a redirect URL isn't allowlisted in the Supabase dashboard.
 */
import * as React from "react";
import { toast } from "sonner";

export function AuthRedirectToast() {
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const message = url.searchParams.get("message") ?? hash.get("message");
    const error =
      url.searchParams.get("error_description") ?? hash.get("error_description");
    if (!message && !error) return;

    // defer one tick — sonner's <Toaster> subscribes in its own effect, which
    // runs after this one; firing synchronously would drop the toast
    const timer = window.setTimeout(() => {
      if (error) toast.error(error, { duration: 10000 });
      else if (message) toast.info(message, { duration: 10000 });
    }, 150);

    // strip the auth params so a refresh doesn't re-toast
    for (const key of ["message", "error", "error_code", "error_description"]) {
      url.searchParams.delete(key);
    }
    window.history.replaceState(null, "", url.pathname + url.search);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
