/**
 * Accent scale machinery — shared between the palette runtime
 * (lib/palettes-data.ts → root layout injection + navbar picker) and the
 * admin Palettes manager (/admin/settings).
 *
 * A palette holds a Tailwind-style 11-shade scale per mode; its CSS overrides
 * ONLY the accent tokens theme.css defines (--primary, --ring, --brand-panel,
 * --brand-panel-deep, and dark --primary-foreground). Every other token stays
 * in theme.css. No palettes → theme.css defaults apply untouched.
 */

export const SHADE_KEYS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

export type ShadeKey = (typeof SHADE_KEYS)[number];
export type AccentScale = Record<ShadeKey, string>;

/** Built-in light accent — mirrors the brand blue scale in theme.css. */
export const DEFAULT_ACCENT_LIGHT: AccentScale = {
  "50": "#e8f5ff",
  "100": "#d5ecff",
  "200": "#b3dbff",
  "300": "#85c2ff",
  "400": "#569dff",
  "500": "#2f77ff",
  "600": "#0c4eff",
  "700": "#0040ff",
  "800": "#063bcd",
  "900": "#10399f",
  "950": "#0a205c",
};

/** Built-in dark accent — mirrors the aquamarine scale in theme.css. */
export const DEFAULT_ACCENT_DARK: AccentScale = {
  "50": "#eefffa",
  "100": "#c5ffee",
  "200": "#8bffdf",
  "300": "#64ffda",
  "400": "#14edc0",
  "500": "#00d1a9",
  "600": "#00a88b",
  "700": "#008570",
  "800": "#056a5b",
  "900": "#0a574b",
  "950": "#00352f",
};

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/;

/** #abc → #aabbcc, lowercased. Returns null for anything that isn't hex. */
export function normalizeHex(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!HEX_RE.test(v)) return null;
  if (v.length === 4) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return v;
}

/**
 * Validate an untrusted value (DB jsonb, action input) into a clean scale.
 * Strict on shape — all 11 keys, every value valid hex — so nothing but
 * normalized hex ever reaches the injected <style>. Null on any miss.
 */
export function sanitizeScale(value: unknown): AccentScale | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const scale = {} as AccentScale;
  for (const key of SHADE_KEYS) {
    const raw = source[key];
    const hex = typeof raw === "string" ? normalizeHex(raw) : null;
    if (!hex) return null;
    scale[key] = hex;
  }
  return scale;
}

export type ParseResult =
  | { ok: true; scale: AccentScale }
  | { ok: false; error: string };

/**
 * Parse a pasted Tailwind-style scale. Format-tolerant: single/double/no
 * quotes, trailing commas, with or without wrapping braces — we only care
 * that all 11 shades resolve to valid hex.
 */
export function parseAccentInput(text: string): ParseResult {
  const pairs = text.matchAll(
    /["']?(\d{2,3})["']?\s*:\s*["']?(#[0-9a-fA-F]{3,8})["']?/g
  );
  const found: Partial<AccentScale> = {};
  for (const [, key, value] of pairs) {
    if (!(SHADE_KEYS as readonly string[]).includes(key)) continue;
    const hex = normalizeHex(value);
    if (hex) found[key as ShadeKey] = hex;
  }
  const missing = SHADE_KEYS.filter((k) => !found[k]);
  if (missing.length === SHADE_KEYS.length) {
    return {
      ok: false,
      error: "No valid shades found. Paste a {'50': '#…', …, '950': '#…'} scale.",
    };
  }
  if (missing.length) {
    return { ok: false, error: `Missing or invalid shades: ${missing.join(", ")}.` };
  }
  return { ok: true, scale: found as AccentScale };
}

/* ------------------------------- contrast -------------------------------- */

function luminance(hex: string): number {
  const v = normalizeHex(hex) ?? "#000000";
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Warn (never block) when the main accent can't carry readable text — the
 * same pairings the site actually renders: light 600 under near-white text,
 * dark 300 under 950 text.
 */
export function accentContrastWarning(mode: "light" | "dark", scale: AccentScale): string | null {
  const ratio =
    mode === "light"
      ? contrastRatio(scale["600"], "#ffffff")
      : contrastRatio(scale["300"], scale["950"]);
  if (ratio >= 4.5) return null;
  const pair = mode === "light" ? "white text on shade 600" : "shade 950 text on shade 300";
  return `Low contrast: ${pair} is ${ratio.toFixed(1)}:1 (target 4.5:1). Buttons may be hard to read.`;
}

/* --------------------------- runtime injection ---------------------------- */

/**
 * CSS for the inline <style> in the root layout. Mirrors theme.css exactly:
 *   light — primary/ring/brand-panel = 600, brand-panel-deep = 800
 *           (primary-foreground stays theme.css near-white)
 *   dark  — primary/ring = 300, primary-foreground = 950,
 *           brand-panel = 900, brand-panel-deep = 950
 * Rendered in <body> AFTER the theme.css link, so equal-specificity rules win.
 * Returns null when nothing is customized → no style tag, zero behavior change.
 */
export function buildAccentCss(
  light: AccentScale | null,
  dark: AccentScale | null
): string | null {
  const parts: string[] = [];
  if (light) {
    parts.push(
      `:root{--primary:${light["600"]};--ring:${light["600"]};--brand-panel:${light["600"]};--brand-panel-deep:${light["800"]};}`
    );
  }
  if (dark) {
    parts.push(
      `.dark{--primary:${dark["300"]};--primary-foreground:${dark["950"]};--ring:${dark["300"]};--brand-panel:${dark["900"]};--brand-panel-deep:${dark["950"]};}`
    );
  }
  return parts.length ? parts.join("") : null;
}
