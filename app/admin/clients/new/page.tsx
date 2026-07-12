import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/admin/client-form";

export const metadata = { title: "New client" };

export default function NewClientPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Clients
        </Link>
        <h1 className="mt-4 text-3xl sm:text-4xl">New client</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Only the name is required — fill the rest in as the relationship grows.
        </p>
      </div>
      <ClientForm />
    </div>
  );
}
