import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects-data";
import { getPublicSettings } from "@/lib/settings-data";
import { services } from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, { siteDomain }] = await Promise.all([
    getAllProjects(),
    getPublicSettings(),
  ]);
  return [
    {
      url: siteDomain,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteDomain}/work`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...services.map((s) => ({
      url: `${siteDomain}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...projects.map((p) => ({
      url: `${siteDomain}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
