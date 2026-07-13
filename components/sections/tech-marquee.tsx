/**
 * Tech-stack marquee — an infinite, seamless strip of the tools I ship with,
 * each in a small card with its brand icon (monochrome, via simple-icons).
 * Pure CSS animation (keyframes in globals.css): pauses on hover, disabled
 * for reduced-motion users. Edit the STACK array to change the lineup.
 */
import {
  siNextdotjs,
  siReact,
  siTypescript,
  siTailwindcss,
  siSupabase,
  siPostgresql,
  siElectron,
  siExpo,
  siMapbox,
  siN8n,
  siGooglegemini,
  siAirtable,
  siFramer,
  siFigma,
  siClaude,
  siVercel,
  type SimpleIcon,
} from "simple-icons";

// The REAL shipping stack — every tool here appears in a project on this site
// (FishPin: Expo/Mapbox · Kamote: Electron · automations: n8n/Gemini/Airtable).
const STACK: { name: string; icon: SimpleIcon }[] = [
  { name: "Next.js", icon: siNextdotjs },
  { name: "React", icon: siReact },
  { name: "TypeScript", icon: siTypescript },
  { name: "Tailwind CSS", icon: siTailwindcss },
  { name: "Supabase", icon: siSupabase },
  { name: "PostgreSQL", icon: siPostgresql },
  { name: "Electron", icon: siElectron },
  { name: "Expo", icon: siExpo },
  { name: "Mapbox", icon: siMapbox },
  { name: "n8n", icon: siN8n },
  { name: "Google Gemini", icon: siGooglegemini },
  { name: "Airtable", icon: siAirtable },
  { name: "Framer Motion", icon: siFramer },
  { name: "Figma", icon: siFigma },
  { name: "Claude AI", icon: siClaude },
  { name: "Vercel", icon: siVercel },
];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="flex w-max items-center gap-3 pr-3 md:gap-4 md:pr-4">
      {STACK.map(({ name, icon }) => (
        <li
          key={name}
          className="group flex items-center gap-2.5 whitespace-nowrap rounded-lg border border-primary/15 bg-primary/[0.05] px-5 py-3 transition-colors duration-300 hover:border-primary hover:bg-primary"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className="size-4 shrink-0 text-primary/70 transition-colors duration-300 group-hover:text-primary-foreground"
          >
            <path d={icon.path} />
          </svg>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-primary/80 transition-colors duration-300 group-hover:text-primary-foreground">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TechMarquee() {
  return (
    <section aria-label="Technologies I work with">
      {/* full-bleed strip, no edge fades */}
      <div className="relative w-full overflow-hidden py-6">
        {/* two identical rows; the track slides -50% and loops seamlessly */}
        <div className="marquee-track flex w-max">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
