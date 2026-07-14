"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setContractStatus } from "@/app/actions/admin-contracts";
import type { ContractStatus } from "@/lib/contracts-data";

/**
 * One clear action instead of a status dropdown: completing a contract is THE
 * lifecycle moment (it flips the portal into testimonial mode). Only appears
 * once EVERY milestone is approved (canComplete) — you can't complete a
 * contract with work still pending. Draft/active/archived stay editable in
 * the Edit form for edge cases.
 */
export function MarkCompletedButton({
  contractId,
  status,
  canComplete,
}: {
  contractId: string;
  status: ContractStatus;
  /** true only when there's ≥1 milestone and all are approved */
  canComplete: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  if (status === "completed" || status === "archived" || !canComplete) return null;

  async function onClick() {
    setPending(true);
    const result = await setContractStatus(contractId, "completed");
    if (result.ok) {
      toast.success("Marked completed — the portal now asks the client for a testimonial.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <Button size="sm" disabled={pending} onClick={onClick}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <CheckCircle2 aria-hidden />}
      Mark as completed
    </Button>
  );
}
