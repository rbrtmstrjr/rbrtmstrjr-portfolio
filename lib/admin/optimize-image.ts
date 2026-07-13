"use client";

/**
 * Client-side image optimization for admin uploads: downscale to a sane
 * longest edge and re-encode as WebP so raw phone photos never hit Storage.
 * Edges are sized for RETINA rendering (case-page hero displays ~1100px wide
 * → 2× displays need ~2200px source); quality 0.85 keeps text in screenshots
 * crisp. next/image serves responsive sizes from these masters.
 */

export const COVER_MAX_EDGE = 2560;
export const GALLERY_MAX_EDGE = 1600;
const WEBP_QUALITY = 0.9;
/** already-web-ready files below this pass through UNTOUCHED — zero re-encode loss */
const PASSTHROUGH_MAX_BYTES = 2 * 1024 * 1024;
const PASSTHROUGH_TYPES = ["image/webp", "image/jpeg", "image/png"];

export type OptimizedImage = {
  blob: Blob;
  width: number;
  height: number;
  /** true = original bytes kept as-is (no quality loss at all) */
  passthrough: boolean;
};

export async function optimizeToWebp(file: File, maxEdge: number): Promise<OptimizedImage> {
  const bitmap = await createImageBitmap(file);
  try {
    // Small enough + already web-ready → keep the ORIGINAL bytes untouched.
    if (
      Math.max(bitmap.width, bitmap.height) <= maxEdge &&
      file.size <= PASSTHROUGH_MAX_BYTES &&
      PASSTHROUGH_TYPES.includes(file.type)
    ) {
      return { blob: file, width: bitmap.width, height: bitmap.height, passthrough: true };
    }

    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D isn't available in this browser.");
    // default smoothing is LOW — big downscales come out soft without this
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );
    if (!blob) throw new Error("This browser couldn't encode WebP.");
    return { blob, width, height, passthrough: false };
  } finally {
    bitmap.close();
  }
}
