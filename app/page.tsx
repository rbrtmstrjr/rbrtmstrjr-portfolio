import { Hero } from "@/components/sections/hero";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { Services } from "@/components/sections/services";
import { Work } from "@/components/sections/work";
import { Journey } from "@/components/sections/journey";
import { Process } from "@/components/sections/process";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";
import { site } from "@/lib/site";
import { getVisibleCategories } from "@/lib/projects-data";
import { getContributions } from "@/lib/github";
import { getPublicSettings } from "@/lib/settings-data";

// Refresh the static homepage hourly — keeps the GitHub feed current between
// admin saves (which still revalidate on demand).
export const revalidate = 3600;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.email,
  founder: { "@type": "Person", name: site.name },
  knowsAbout: ["Custom software", "Web app development", "AI automation", "Web design"],
};

export default async function Home() {
  const [{ projects, categories }, contributions, settings] = await Promise.all([
    getVisibleCategories(),
    getContributions(),
    getPublicSettings(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero availability={settings.availability} />
      <TechMarquee />
      <Services />
      <Work projects={projects} categories={categories} />
      <Journey contributions={contributions} />
      <Process />
      <Testimonials />
      <Contact contactEmail={settings.contactEmail} />
    </>
  );
}
