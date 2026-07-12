"use client";

/**
 * Client-side image optimization for admin uploads: downscale to a sane
 * longest edge and re-encode as WebP so raw phone photos never hit Storage.
 * Covers target 1600px (the site's 1600×1000 mockup spec), galleries 1200px.
 */

export const COVER_MAX_EDGE = 1600;
export const GALLERY_MAX_EDGE = 1200;
const WEBP_QUALITY = 0.8;

export async function optimizeToWebp(file: File, maxEdge: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D isn't available in this browser.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );
    if (!blob) throw new Error("This browser couldn't encode WebP.");
    return blob;
  } finally {
    bitmap.close();
  }
}
