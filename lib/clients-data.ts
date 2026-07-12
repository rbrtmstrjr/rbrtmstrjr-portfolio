import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";

/**
 * Clients — private business data, service-role access only (RLS has no
 * policies). The spine future modules (leads, payments) will reference.
 */

export type ClientStatus = "active" | "past" | "prospect";

export type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  website: string | null;
  source: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Minimal project fields shown on a client's detail page. */
export type LinkedProject = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  client_id: string | null;
};

export async function getClientRows(): Promise<ClientRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[clients-data] Failed to read clients:", error.message);
    return [];
  }
  return (data ?? []) as ClientRow[];
}

export async function getClientRow(id: string): Promise<ClientRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[clients-data] Failed to read client:", error.message);
    return null;
  }
  return (data as ClientRow) ?? null;
}

/** All managed projects' link fields — for per-client counts and lists. */
export async function getLinkedProjects(): Promise<LinkedProject[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, published, client_id");
  if (error) {
    console.error("[clients-data] Failed to read linked projects:", error.message);
    return [];
  }
  return (data ?? []) as LinkedProject[];
}
