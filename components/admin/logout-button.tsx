"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function LogoutButton({ className }: { className?: string }) {
  async function signOut() {
    await getSupabaseBrowser()?.auth.signOut();
    // Full navigation so the proxy guard re-evaluates with cleared cookies.
    window.location.assign("/admin/login");
  }

  return (
    <Button variant="ghost" size="sm" onClick={signOut} className={className}>
      <LogOut aria-hidden />
      Sign out
    </Button>
  );
}
