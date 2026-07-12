"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * The contract's secret portal link — auto-generated once at creation
 * (crypto-random + DB-unique, collisions impossible in practice).
 */
export function PortalLinkCard({ token }: { token: string }) {
  const [copied, setCopied] = React.useState(false);
  const path = `/client/${token}`;

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    toast.success("Portal link copied — send it to the client.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <p className="truncate rounded-lg border border-border bg-secondary/50 px-3 py-2 font-mono text-xs text-muted-foreground">
        {path}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          Copy link
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={path} target="_blank">
            <ExternalLink aria-hidden />
            Open portal
          </Link>
        </Button>
      </div>
    </div>
  );
}
