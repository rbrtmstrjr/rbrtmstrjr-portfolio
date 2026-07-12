import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth guard for the admin CMS (Next 16 proxy — the middleware successor).
 * Unauthenticated requests to /admin/* are redirected to /admin/login;
 * a signed-in admin hitting /admin/login is bounced back to /admin.
 * Also refreshes the Supabase session cookies on every admin request.
 *
 * This is a UX gate — server actions re-verify the session themselves.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  // reset-password must load unauthenticated — the Supabase recovery link
  // establishes the session client-side after the page mounts
  const isPublicAdminPage = isLogin || pathname === "/admin/reset-password";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Unconfigured: only the login page is reachable (it shows a setup notice).
    return isPublicAdminPage
      ? NextResponse.next({ request })
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicAdminPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
