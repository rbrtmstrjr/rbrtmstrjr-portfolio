"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cookie-based browser client for the admin area (login, uploads).
 * Returns null when the public env vars aren't configured so the admin UI
 * can show a setup notice instead of crashing.
 */
export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
