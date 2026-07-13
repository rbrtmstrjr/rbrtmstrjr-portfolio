import type { Metadata } from "next";
import { AdminSidebar, AdminTopbar } from "@/components/admin/admin-sidebar";
import { getAdminUser } from "@/lib/supabase/server-auth";
import { getAdminNotifications } from "@/lib/contracts-data";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Session cookies drive the shell — never cache admin pages.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();

  // Unauthenticated (login / reset pages): no shell — the card sits dead-center
  // of the full viewport.
  if (!user) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    );
  }

  const notifications = await getAdminNotifications();

  return (
    <div className="md:flex md:min-h-dvh">
      <AdminSidebar notifications={notifications} />
      {/* root layout already provides <main> — this is just the content column */}
      <div className="min-w-0 flex-1">
        <AdminTopbar notifications={notifications} />
        <div className="px-5 py-8 md:px-10 md:py-8">
          <div className="mx-auto w-full max-w-7xl pb-16">{children}</div>
        </div>
      </div>
    </div>
  );
}
