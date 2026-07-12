import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortalView } from "@/components/portal/portal-view";
import { getPortalData } from "@/lib/contracts-data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Project portal",
  robots: { index: false, follow: false },
};

// Secret-token lookup happens per request — never cached, never enumerated.
export const dynamic = "force-dynamic";

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getPortalData(token);
  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-14 pb-24">
      <header className="mb-8">
        <p className="eyebrow">
          {site.name} · Client portal
        </p>
      </header>
      <PortalView data={data} token={token} />
      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        <p>
          This is a private link for {data.clientName}. Questions? Email{" "}
          <a href={`mailto:${site.email}`} className="font-medium text-foreground underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
