import { Hero } from "@/components/sections/hero";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { Services } from "@/components/sections/services";
import { Work } from "@/components/sections/work";
import { Journey } from "@/components/sections/journey";
import { Process } from "@/components/sections/process";
import { Contact } from "@/components/sections/contact";
import { site } from "@/lib/site";

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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <TechMarquee />
      <Services />
      <Work />
      <Journey />
      <Process />
      <Contact />
    </>
  );
}
