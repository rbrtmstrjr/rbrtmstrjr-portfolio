import "server-only";
import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { buildAccentCss, sanitizeScale } from "@/lib/theme-accent";

/**
 * Accent palettes — the admin-curated MENU of accent colors. Visitors pick
 * one in the navbar; the choice lives in THEIR localStorage, never the DB.
 * The whole (public, non-sensitive) menu is serialized into the page so the
 * no-FOUC init script and the picker work without any client fetch.
 * Empty/unconfigured table → empty menu → theme.css fallback, picker hidden.
 */

export type PaletteRow = {
  id: string;
  name: string;
  slug: string;
  scale_light: Record<string, string>;
  scale_dark: Record<string, string>;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** What the public site needs per palette — nothing else leaves the server. */
export type PublicPalette = {
  slug: string;
  name: string;
  /** representative swatches: light shade 600, dark shade 300 */
  swatchLight: string;
  swatchDark: string;
  /** ready-to-inject CSS (:root + .dark blocks), built from sanitized hex only */
  css: string;
};

export type PublicPaletteMenu = {
  palettes: PublicPalette[];
  defaultSlug: string | null;
};

/** Admin list — every row, menu order. */
export async function getPaletteRows(): Promise<PaletteRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("accent_palettes")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    logDbIssue("Failed to read accent palettes", error);
    return [];
  }
  return (data ?? []) as PaletteRow[];
}

/** Deduped per request — layout script + navbar picker share one read. */
export const getPublicPaletteMenu = cache(async (): Promise<PublicPaletteMenu> => {
  const rows = await getPaletteRows();
  const palettes: PublicPalette[] = [];
  let defaultSlug: string | null = null;

  for (const row of rows) {
    // re-validate every hex from the DB; a bad row is skipped, never injected
    const light = sanitizeScale(row.scale_light);
    const dark = sanitizeScale(row.scale_dark);
    if (!light || !dark || !/^[a-z0-9-]+$/.test(row.slug)) continue;
    palettes.push({
      slug: row.slug,
      name: row.name,
      swatchLight: light["600"],
      swatchDark: dark["300"],
      css: buildAccentCss(light, dark)!,
    });
    if (row.is_default) defaultSlug = row.slug;
  }
  if (!defaultSlug && palettes.length) defaultSlug = palettes[0].slug;
  return { palettes, defaultSlug };
});

export const ACCENT_STORAGE_KEY = "accent-palette";

/**
 * No-FOUC init script for the root layout. Runs synchronously at the top of
 * <body>, BEFORE anything paints: if this visitor stored a palette pick that
 * differs from the default, it inserts a style tag right after the
 * server-rendered #accent-theme default so the override wins in cascade
 * order. No stored pick (or a stale slug) → the SSR default stands.
 */
export function buildAccentInitScript(menu: PublicPaletteMenu): string | null {
  const overrides: Record<string, string> = {};
  for (const p of menu.palettes) {
    if (p.slug !== menu.defaultSlug) overrides[p.slug] = p.css;
  }
  if (!Object.keys(overrides).length) return null;
  // <-escape so palette data can never close the <script> tag
  const json = JSON.stringify(overrides).replace(/</g, "\\u003c");
  return (
    "(function(){try{" +
    `var P=${json};` +
    `var k=localStorage.getItem(${JSON.stringify(ACCENT_STORAGE_KEY)});` +
    "var css=k&&P[k];if(!css)return;" +
    'var d=document.getElementById("accent-theme");' +
    'var s=document.createElement("style");s.id="accent-visitor";s.textContent=css;' +
    "if(d)d.insertAdjacentElement('afterend',s);else document.head.appendChild(s);" +
    "}catch(e){}})();"
  );
}

function logDbIssue(what: string, error: { code?: string; message: string }) {
  if (error.code === "42P01" || /schema cache/.test(error.message)) {
    console.warn(
      `[palettes-data] ${what}: ${error.message} — run supabase/upgrade-palettes.sql in the SQL editor.`
    );
  } else {
    console.error(`[palettes-data] ${what}:`, error.message);
  }
}
