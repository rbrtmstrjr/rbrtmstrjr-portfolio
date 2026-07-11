import type { ProjectCategory } from "@/lib/projects";

/**
 * Service offerings — single source of truth for the homepage Services cards
 * AND the /services/[slug] detail pages.
 */

export type Service = {
  slug: string;
  /** WindowCard address-pill label */
  window: string;
  /** icon key mapped to a lucide component in the UI */
  icon: "blocks" | "bot";
  title: string;
  tagline: string;
  /** short card copy */
  summary: string;
  /** card bullet list */
  outcomes: string[];
  detail: {
    intro: string;
    features: { title: string; desc: string }[];
    fitFor: string[];
    /** pulls related case studies onto the detail page */
    categoryKey: ProjectCategory;
  };
};

export const services: Service[] = [
  {
    slug: "custom-software",
    window: "services/custom-software",
    icon: "blocks",
    title: "Custom Software & Web Apps",
    tagline: "Turn manual work into software.",
    summary:
      "Operational tools built around how your business actually runs — so paperwork becomes a system and chaos becomes a workflow.",
    outcomes: [
      "Inventory & POS systems",
      "Operations dashboards",
      "Booking, ordering & customer portals",
    ],
    detail: {
      intro:
        "Off-the-shelf software forces your business to work its way. I build the opposite: systems shaped around how your team already works — so adoption is instant, training takes a day, and the busywork simply disappears.",
      features: [
        {
          title: "Inventory & POS systems",
          desc: "Sales, stock, and daily reporting in one place — designed for real counters and real rush hours.",
        },
        {
          title: "Operations dashboards",
          desc: "Every number an owner checks daily, live on one screen instead of five spreadsheets.",
        },
        {
          title: "Booking & ordering portals",
          desc: "Let customers book, order, and pay on their own — without tying up your phone line.",
        },
        {
          title: "Internal tools",
          desc: "Approvals, tracking, staff workflows — the glue software your business is missing.",
        },
        {
          title: "Mobile-first web apps",
          desc: "Runs on the phones and devices your team already owns. No new hardware to buy.",
        },
        {
          title: "Integrations",
          desc: "Connects to what you already use — spreadsheets, chat apps, payment providers.",
        },
      ],
      fitFor: [
        "You track anything on paper or spreadsheets",
        "Reports take hours to compile every week",
        "Stock counts never match reality",
        "Staff repeat the same data entry every day",
        "Off-the-shelf tools almost fit — but never quite",
      ],
      categoryKey: "Custom Apps",
    },
  },
  {
    slug: "ai-automation",
    window: "services/ai-automation",
    icon: "bot",
    title: "AI Automation",
    tagline: "Automate the repetitive. Free your team.",
    summary:
      "AI that quietly handles the work your team shouldn't be doing — data entry, documents, follow-ups, reporting — so people can focus on what grows revenue.",
    outcomes: [
      "Document & data-entry automation",
      "AI assistants trained on your business",
      "Automated reporting & follow-ups",
    ],
    detail: {
      intro:
        "AI is only useful when it removes real work. I automate the repetitive tasks eating your team's hours — documents, messages, reports — with a human always in control and nothing failing silently.",
      features: [
        {
          title: "Document & data-entry automation",
          desc: "PDFs, photos, and forms read, extracted, and filed automatically — no more retyping.",
        },
        {
          title: "AI customer assistants",
          desc: "Instant, accurate answers on your channels, trained on your business — with graceful human handoff.",
        },
        {
          title: "Automated reporting",
          desc: "Daily and weekly reports that write themselves from your real data, delivered before you wake up.",
        },
        {
          title: "Follow-ups & reminders",
          desc: "Quotes chased, invoices reminded, bookings confirmed — automatically, on time, every time.",
        },
        {
          title: "Workflow triggers",
          desc: "When X happens, Y gets done. Orders, alerts, escalations — no one has to remember.",
        },
        {
          title: "Human-in-the-loop review",
          desc: "AI drafts, your team approves. Trust is built in, not bolted on.",
        },
      ],
      fitFor: [
        "Your team answers the same questions every day",
        "Hours go into retyping documents into systems",
        "Reports are compiled by hand every week",
        "Follow-ups keep slipping through the cracks",
        "You want AI that's practical — not hype",
      ],
      categoryKey: "AI Automation",
    },
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
