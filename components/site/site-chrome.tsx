"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the public site chrome (navbar, footer, dock, scroll rail) inside the
 * /admin area (own shell) and the /client portal (standalone, distraction-free
 * page for clients). Children pass through untouched everywhere else.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/client" ||
    pathname.startsWith("/client/");
  if (bare) return null;
  return <>{children}</>;
}
