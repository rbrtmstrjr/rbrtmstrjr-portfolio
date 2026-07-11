import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (service role — never import in client code).
 * Returns null when env vars aren't configured yet so callers can degrade
 * gracefully in local dev.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
