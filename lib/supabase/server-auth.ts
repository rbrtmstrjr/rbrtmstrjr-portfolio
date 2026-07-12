import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side session check for the admin area. Reads the Supabase auth
 * cookies set by @supabase/ssr and validates the JWT against the auth server
 * (getUser — never trust getSession alone for authorization).
 *
 * Mutating server actions MUST call requireAdminUser() before touching data;
 * the proxy guard is UX, this is the actual security boundary.
 */
export async function getAdminUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore, the proxy
          // refreshes sessions.
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) throw new Error("Not authenticated.");
  return user;
}
