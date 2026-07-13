import type { MetadataRoute } from "next";
import { getPublicSettings } from "@/lib/settings-data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteDomain } = await getPublicSettings();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteDomain}/sitemap.xml`,
  };
}
