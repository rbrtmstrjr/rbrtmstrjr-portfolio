"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reviewTestimonial } from "@/app/actions/admin-contracts";
import type { TestimonialRow } from "@/lib/contracts-data";
import { cn } from "@/lib/utils";

export function TestimonialReview({ testimonial }: { testimonial: TestimonialRow }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function act(patch: { status?: "approved" | "rejected"; published?: boolean }) {
    setPending(true);
    const result = await reviewTestimonial(testimonial.id, patch);
    if (result.ok) {
      toast.success(
        patch.published === true
          ? "Published — it's live on the portfolio."
          : patch.published === false
            ? "Unpublished — removed from the portfolio."
            : patch.status === "approved"
              ? "Approved — publish it when you're ready."
              : "Rejected — it will never appear publicly."
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <div className="space-y-4 p-5">
      <blockquote className="rounded-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm leading-relaxed">
        “{testimonial.body}”
      </blockquote>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{testimonial.author_name}</span>
        {testimonial.author_role ? <span>· {testimonial.author_role}</span> : null}
        {testimonial.rating ? (
          <span className="flex items-center gap-0.5" aria-label={`${testimonial.rating} of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3",
                  i < testimonial.rating! ? "fill-primary text-primary" : "text-border"
                )}
                aria-hidden
              />
            ))}
          </span>
        ) : null}
        <span
          className={cn(
            "ml-auto rounded-lg px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
            testimonial.status === "approved" && "border border-primary/15 bg-primary/[0.05] text-primary/80",
            testimonial.status === "pending" && "border border-border bg-secondary",
            testimonial.status === "rejected" && "bg-destructive/10 text-destructive"
          )}
        >
          {testimonial.status}
          {testimonial.status === "approved" && testimonial.published ? " · live" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
        {pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden /> : null}
        {testimonial.status !== "approved" ? (
          <Button size="sm" disabled={pending} onClick={() => act({ status: "approved" })}>
            <Check aria-hidden />
            Approve
          </Button>
        ) : null}
        {testimonial.status === "approved" ? (
          testimonial.published ? (
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => act({ published: false })}
            >
              <EyeOff aria-hidden />
              Unpublish
            </Button>
          ) : (
            <Button size="sm" disabled={pending} onClick={() => act({ published: true })}>
              <Eye aria-hidden />
              Publish to portfolio
            </Button>
          )
        ) : null}
        {testimonial.status !== "rejected" ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => act({ status: "rejected" })}
            className="text-muted-foreground hover:text-destructive"
          >
            <X aria-hidden />
            Reject
          </Button>
        ) : null}
      </div>
    </div>
  );
}
