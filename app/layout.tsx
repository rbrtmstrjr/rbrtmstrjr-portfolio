import type { Metadata } from "next";
import { Agdasima, Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/site/navbar";
import { BottomNav } from "@/components/site/bottom-nav";
import { ScrollGuide } from "@/components/site/scroll-guide";
import { SiteChrome } from "@/components/site/site-chrome";
import { AuthRedirectToast } from "@/components/site/auth-redirect-toast";
import { site } from "@/lib/site";
import { getPublicSettings } from "@/lib/settings-data";
import { buildAccentInitScript, getPublicPaletteMenu } from "@/lib/palettes-data";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const agdasima = Agdasima({
  variable: "--font-agdasima",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // Domain comes from /admin/settings (falls back to lib/site.ts).
  const { siteDomain } = await getPublicSettings();
  return {
    metadataBase: new URL(siteDomain),
    title: {
      default: `${site.name} — ${site.role}`,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    keywords: [
      "custom software",
      "web app development",
      "AI automation",
      "business software",
      "freelance software engineer",
    ],
    openGraph: {
      type: "website",
      url: siteDomain,
      siteName: site.name,
      title: `${site.name} — ${site.role}`,
      description: site.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${site.role}`,
      description: site.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // VISITOR-scoped accent: the admin curates a palette MENU (Supabase);
  // each visitor's pick lives in their own localStorage. Two pieces, both
  // at the very top of <body> so they beat the head stylesheet in cascade
  // order and apply BEFORE FIRST PAINT (no FOUC, mirrors theme-toggle):
  //   1. #accent-theme  — SSR <style> with the admin DEFAULT palette (what
  //      first-time visitors, shared links, and no-JS visitors see)
  //   2. init <script>  — synchronous; if localStorage holds a different
  //      valid pick, inserts #accent-visitor right after the default
  // Admin saves revalidate the layout, so the site stays fully static.
  // Empty palette table → neither renders → theme.css fallback, unchanged.
  const paletteMenu = await getPublicPaletteMenu();
  const defaultCss =
    paletteMenu.palettes.find((p) => p.slug === paletteMenu.defaultSlug)?.css ?? null;
  const accentInit = buildAccentInitScript(paletteMenu);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${agdasima.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        {defaultCss ? (
          <style id="accent-theme" dangerouslySetInnerHTML={{ __html: defaultCss }} />
        ) : null}
        {accentInit ? <script dangerouslySetInnerHTML={{ __html: accentInit }} /> : null}
        <a
          href="#main"
          className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers>
          <AuthRedirectToast />
          <SiteChrome>
            <Navbar
              palettes={paletteMenu.palettes}
              defaultPaletteSlug={paletteMenu.defaultSlug}
            />
          </SiteChrome>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteChrome>
            <BottomNav />
            <ScrollGuide />
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
