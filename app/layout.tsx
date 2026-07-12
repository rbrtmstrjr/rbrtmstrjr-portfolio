import type { Metadata } from "next";
import { Agdasima, Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/site/navbar";
import { BottomNav } from "@/components/site/bottom-nav";
import { ScrollGuide } from "@/components/site/scroll-guide";
import { SiteChrome } from "@/components/site/site-chrome";
import { Footer } from "@/components/site/footer";
import { site } from "@/lib/site";
import { getAllProjects } from "@/lib/projects-data";

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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
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
    url: site.url,
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Merged (hardcoded + managed) list feeds the nav search on every page.
  const searchProjects = (await getAllProjects()).map((p) => ({
    slug: p.slug,
    title: p.title,
    client: p.client,
    category: p.category,
  }));

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${agdasima.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers>
          <SiteChrome>
            <Navbar searchProjects={searchProjects} />
          </SiteChrome>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteChrome>
            <Footer />
            <BottomNav />
            <ScrollGuide />
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
