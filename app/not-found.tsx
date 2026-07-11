import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-7xl flex-col items-start justify-center px-6 pt-24">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 max-w-xl text-4xl sm:text-5xl md:text-6xl">
        This page doesn&apos;t exist — yet.
      </h1>
      <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
        The link may be old, or the case study hasn&apos;t shipped. The work that
        has shipped is one click away.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>
      </Button>
    </div>
  );
}
