"use client";

import * as React from "react";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { optimizeToWebp } from "@/lib/admin/optimize-image";
import { cn } from "@/lib/utils";

const BUCKET = "project-media";

export type UploadResult =
  | { url: string; kb: number; width: number; height: number; passthrough: boolean }
  | { error: string };

/** Optimize + upload one file; shared by the single control and bulk gallery add. */
export async function uploadOptimizedImage(
  path: string,
  file: File,
  maxEdge: number
): Promise<UploadResult> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return { error: "Supabase isn't configured — can't upload." };
  try {
    const { blob, width, height, passthrough } = await optimizeToWebp(file, maxEdge);
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      upsert: true,
      contentType: blob.type || "image/webp",
      cacheControl: "3600",
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return {
      url: `${data.publicUrl}?v=${Date.now()}`,
      kb: Math.round(blob.size / 1024),
      width,
      height,
      passthrough,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }
}

/** Warn when the SOURCE is smaller than the display needs — we never upscale. */
export function softnessWarning(width: number, maxEdge: number): string | null {
  const recommended = maxEdge >= 2000 ? 2200 : 1200;
  if (width >= recommended) return null;
  return `Source is only ${width}px wide — it may look soft on large/retina screens. Use an original ≥${recommended}px wide if you have one.`;
}

/**
 * Optimize-on-upload image control. Converts to WebP client-side, upserts to
 * project-media/{path} so replacing never orphans files, and hands the public
 * URL (cache-busted with ?v=) back to the form.
 */
export function ImageUpload({
  path,
  maxEdge,
  value,
  onChange,
  label,
  disabledReason,
  className,
}: {
  /** Storage object path inside the bucket, e.g. "fishpin/cover.webp" */
  path: string;
  maxEdge: number;
  value?: string;
  onChange: (url: string) => void;
  label: string;
  /** When set, uploading is disabled and this hint is shown */
  disabledReason?: string;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const result = await uploadOptimizedImage(path, file, maxEdge);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      onChange(result.url);
      toast.success(
        `${label} uploaded — ${result.width}×${result.height}, ${result.kb} KB${result.passthrough ? " (original kept, no re-encode)" : ""}.`
      );
      const warning = softnessWarning(result.width, maxEdge);
      if (warning) toast.warning(warning, { duration: 8000 });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- tiny admin thumbnail; cache-busted URL
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            none
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || !!disabledReason}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : value ? (
              <RefreshCw aria-hidden />
            ) : (
              <ImagePlus aria-hidden />
            )}
            {value ? "Replace" : "Upload"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => onChange("")}
              className="text-muted-foreground"
            >
              <X aria-hidden />
              Remove
            </Button>
          ) : null}
        </div>
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {disabledReason ?? `${BUCKET}/${path} · WebP ≤ ${maxEdge}px`}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
