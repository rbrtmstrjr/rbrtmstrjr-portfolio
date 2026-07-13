import { WindowCard } from "@/components/ui/window-card";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <WindowCard label="admin/login" contentClassName="p-8">
      <h1 className="text-2xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Admin access only — accounts are created in the Supabase dashboard, not here.
      </p>
      {configured ? (
        <LoginForm />
      ) : (
        <div className="mt-6 rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed">
          Supabase isn&apos;t configured yet. Add{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="font-mono text-xs">.env.local</code>, run{" "}
          <code className="font-mono text-xs">supabase/schema.sql</code>, and create the
          admin user in Authentication → Users.
        </div>
      )}
    </WindowCard>
  );
}
