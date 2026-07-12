"use server";

import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getAdminUser } from "@/lib/supabase/server-auth";
import {
  clientFormSchema,
  clientFormToRow,
  type ClientFormInput,
} from "@/lib/admin/client-schema";

export type ClientActionResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Clients are admin-only — nothing public renders from them, so no
 * revalidation is needed; admin pages are force-dynamic.
 */
export async function saveClient(input: ClientFormInput): Promise<ClientActionResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Your session expired — sign in again." };

  const parsed = clientFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Some fields are invalid — check the form and retry." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase isn't configured on the server." };

  const row = clientFormToRow(parsed.data);

  if (parsed.data.id) {
    const { error } = await supabase.from("clients").update(row).eq("id", parsed.data.id);
    if (error) return { ok: false, error: friendlyDbError(error.code, error.message) };
    return { ok: true, id: parsed.data.id };
  }

  const { data, error } = await supabase.from("clients").insert(row).select("id").single();
  if (error || !data) {
    return { ok: false, error: friendlyDbError(error?.code, error?.message) };
  }
  return { ok: true, id: data.id as string };
}

/** Delete a client — linked projects are detached (client_id → null), never deleted. */
export async function deleteClient(id: string): Promise<ClientActionResult> {
  const user = await getAdminUser();
  if (!user) return { ok: false, error: "Your session expired — sign in again." };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Supabase isn't configured on the server." };

  // Projects detach automatically (FK SET NULL); contracts BLOCK the delete
  // (FK RESTRICT) — real business records shouldn't vanish with a client.
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error: "This client still has contracts — delete or re-assign those first.",
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, id };
}

function friendlyDbError(code?: string, message?: string) {
  if (code === "42P01")
    return "The clients table doesn't exist yet — run supabase/upgrade-clients.sql in the SQL editor.";
  return message ?? "Something went wrong saving the client.";
}
