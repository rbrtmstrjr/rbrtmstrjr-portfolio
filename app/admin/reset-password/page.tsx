import { WindowCard } from "@/components/ui/window-card";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";

export const metadata = { title: "Reset password" };

/** Landing page for the Supabase recovery-email link (lock-out safety net). */
export default function ResetPasswordPage() {
  return (
    <WindowCard label="admin/reset-password" contentClassName="p-8">
      <h1 className="text-2xl">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You arrived here from the recovery email — set a new password below.
      </p>
      <ResetPasswordForm />
    </WindowCard>
  );
}
