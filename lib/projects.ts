/**
 * Project content — single source of truth for Featured Work cards AND
 * /work/[slug] case-study pages. Add a project here and everything renders.
 *
 * Screenshots: drop real images in /public/projects/<slug>/ and set `image`
 * (card) + `gallery` (case study). While unset, a clearly-marked placeholder
 * panel renders instead.
 */

export type ProjectCategory = "Custom Apps" | "AI Automation" | "Web";

export type Project = {
  slug: string;
  title: string;
  /** Real client name (or "Own product") */
  client: string;
  category: ProjectCategory;
  /** Featured big — own shipped product or hero engagement */
  flagship?: boolean;
  /** TODO markers for content that still needs the real client's details */
  placeholder?: boolean;
  /** One-line problem shown on the card */
  problem: string;
  /** One-line outcome shown on the card */
  result: string;
  /** Optional hard metric, featured big when present */
  metric?: { value: string; label: string };
  /** Card image — path under /public (falls back to placeholder panel) */
  image?: string;
  /** ---- case-study page ---- */
  study: {
    intro: string;
    problem: string;
    approach: string;
    solution: string;
    outcome: string;
    tech: string[];
    gallery?: { src?: string; alt: string; caption?: string }[];
    /** external link (Google Play, live site) */
    link?: { href: string; label: string };
  };
};

export const projects: Project[] = [
  {
    slug: "fishpin",
    image: "/projects/fishpin/cover.png",
    title: "FishPin",
    client: "Own product — on Google Play",
    category: "Custom Apps",
    flagship: true,
    problem: "Anglers lose their best fishing spots in scattered notes, screenshots, and memory.",
    result: "A shipped, publicly available product — designed, engineered, and launched end to end.",
    metric: { value: "Live", label: "on Google Play" },
    study: {
      intro:
        "FishPin is my own product: a mobile app that lets anglers pin fishing spots, log catches, and build a private map of the waters they know. It is the clearest proof of how I work — one person taking an idea from problem to published product.",
      problem:
        "Anglers rely on memory, paper notes, and photo rolls to track where the fish actually bite. Spots get forgotten, conditions aren't recorded, and hard-won local knowledge evaporates. Existing map apps aren't built around the fishing workflow.",
      approach:
        "I designed FishPin around the moment that matters — you just caught a fish, your hands are wet, and you have ten seconds. Every core action (pin the spot, log the catch, note the conditions) had to be nearly instant. I prototyped the flows first, tested them on real fishing trips, then engineered the app around what survived.",
      solution:
        "A mobile app with an offline-friendly personal map: one-tap spot pinning with GPS, catch logs with photos and conditions, and a clean history of every spot's productivity over time. The interface stays minimal on purpose — big targets, few taps, readable in sunlight.",
      outcome:
        "FishPin is live on Google Play — designed, built, shipped, and maintained by one person. For clients, it's the whole pitch in one artifact: I don't just write code or just draw screens; I deliver finished products people can download today.",
      tech: ["Mobile app", "GPS & offline maps", "Google Play release"],
      gallery: [
        { alt: "FishPin — map view with pinned fishing spots (screenshot placeholder)" },
        { alt: "FishPin — catch logging flow (screenshot placeholder)" },
        { alt: "FishPin — spot history and stats (screenshot placeholder)" },
      ],
      link: { href: "https://play.google.com/store/apps/", label: "View on Google Play" }, // TODO: real Play Store URL
    },
  },
  {
    slug: "retail-pos",
    image: "/projects/retail-pos/cover.png",
    title: "Point-of-Sale & Stock System",
    client: "Retail client", // TODO: real client name
    category: "Custom Apps",
    placeholder: true,
    problem: "Sales rung up by hand, stock counted on paper — no way to see what was actually selling.",
    result: "Checkout, inventory, and daily sales reporting in one system the staff learned in a day.",
    metric: { value: "1 day", label: "for staff to switch over" },
    study: {
      intro:
        "A custom point-of-sale and inventory system for a growing retail store that had outgrown notebooks and end-of-day guesswork.",
      problem:
        "Every sale was written by hand and stock was counted on paper. The owner couldn't see daily revenue without an hour of tallying, stockouts were discovered only when a customer asked, and staff training relied on tribal knowledge.",
      approach:
        "I spent time behind the counter first, watching how sales actually happened during rush hours. The system was designed around speed at the register — every extra tap costs a queue — and around reports the owner actually reads, not dashboards for the sake of dashboards.",
      solution:
        "A touch-first POS with barcode-free quick keys for the store's real bestsellers, live stock deduction on every sale, low-stock alerts, and a daily summary the owner reads on their phone. Runs on affordable hardware already in the store.",
      outcome:
        "Staff switched over in a single day. The owner now opens the day's numbers on their phone instead of tallying receipts, and reordering happens before shelves go empty.",
      tech: ["Web app (PWA)", "POS & inventory", "Reporting"],
      gallery: [
        { alt: "POS register screen (screenshot placeholder)" },
        { alt: "Inventory and low-stock alerts (screenshot placeholder)" },
        { alt: "Owner's daily sales summary (screenshot placeholder)" },
      ],
    },
  },
  {
    slug: "mr-kamote-chips-inventory",
    image: "/projects/mr-kamote-chips-inventory/cover.png",
    title: "Production & Inventory App",
    client: "Mr. Kamote Chips — Joshua",
    category: "Custom Apps",
    problem: "A fast-growing food business tracking production, stock, and supplies entirely on paper.",
    result: "Accurate real-time stock across production and sales — less waste, no more blind reordering.",
    study: {
      intro:
        "Mr. Kamote Chips is a fast-growing snack food business. As production scaled, the paper system that got them started became the thing holding them back.",
      problem:
        "Production runs, raw supplies, and finished stock were tracked across notebooks and group chats. Numbers disagreed, spoilage went unnoticed until it was expensive, and nobody could answer 'how much can we deliver this week?' without a stock count.",
      approach:
        "Rather than a generic inventory tool, I mapped their actual flow — raw kamote in, production batches, packed SKUs out — and built the app around those three checkpoints. The people using it are on the production floor, so it had to work on a phone with three big buttons, not a spreadsheet grid.",
      solution:
        "A mobile-first app where staff log supply deliveries, production batches, and dispatches in seconds. Stock levels update in real time, waste is recorded per batch, and Joshua sees production vs. sales at a glance.",
      outcome:
        "Stock counts now match reality, reordering is based on numbers instead of guesses, and batch-level waste tracking pays for the system on its own. The paper notebooks are gone.",
      tech: ["Mobile-first web app", "Inventory & production tracking", "Realtime database"],
      gallery: [
        { alt: "Production batch logging (screenshot placeholder)" },
        { alt: "Live stock overview (screenshot placeholder)" },
        { alt: "Waste and production reports (screenshot placeholder)" },
      ],
    },
  },
  // ── SAMPLE ── replace with a real project (kept so every category shows the flow)
  {
    slug: "delivery-tracker",
    image: "/projects/delivery-tracker/cover.png",
    title: "Delivery & Fleet Tracker",
    client: "Distribution company", // SAMPLE — replace with real client
    category: "Custom Apps",
    placeholder: true,
    problem: "Deliveries coordinated over text messages — dispatch had no idea where anything was.",
    result: "A live delivery board for dispatch and drivers — late deliveries caught before customers call.",
    metric: { value: "30%", label: "fewer late deliveries (sample metric)" },
    study: {
      intro:
        "A delivery tracking system for a distribution company whose entire logistics operation lived inside three group chats.",
      problem:
        "Every morning, dispatch assigned deliveries by text. By noon, nobody knew what was delivered, delayed, or forgotten until an angry customer called. Drivers were interrupted constantly for status updates, and end-of-day reconciliation took over an hour.",
      approach:
        "I rode along on delivery runs before designing anything. The drivers needed something they could update in five seconds at a drop-off; the dispatcher needed one screen showing everything. Two very different users, one shared source of truth.",
      solution:
        "A dispatch board showing every delivery's status in real time, and a dead-simple driver view: tap when picked up, tap when delivered, photo of the receipt. Customers with a pending delivery can be sent a status link — no more 'where is it?' calls.",
      outcome:
        "Dispatch stopped chasing drivers by text, reconciliation became a two-minute glance, and late deliveries dropped because problems surface at 10am instead of 5pm.",
      tech: ["Web app (PWA)", "Realtime updates", "Driver mobile view"],
      gallery: [
        { alt: "Dispatch board with live delivery statuses (screenshot placeholder)" },
        { alt: "Driver's one-tap update view (screenshot placeholder)" },
        { alt: "Customer status link (screenshot placeholder)" },
      ],
    },
  },
  {
    slug: "ai-document-automation",
    image: "/projects/ai-document-automation/cover.png",
    title: "AI Back-Office Automation",
    client: "Services client", // TODO: real client name
    category: "AI Automation",
    placeholder: true,
    problem: "A small team spending hours a day retyping documents, orders, and reports into their systems.",
    result: "The repetitive encoding now runs automatically — the team reviews instead of retypes.",
    metric: { value: "Hours", label: "of manual encoding removed weekly" },
    study: {
      intro:
        "An AI-powered automation layer for a small services business drowning in repetitive back-office work.",
      problem:
        "Orders, supplier documents, and daily reports all arrived as PDFs, photos, and messages — and every one of them was retyped by hand into the business's records. It consumed hours daily, and every retype was a chance for an error.",
      approach:
        "I audited a week of their actual documents first, then automated the highest-volume flows only. AI does the reading and drafting; a human stays in the loop to approve. Trust is built by starting narrow and being right, not by automating everything on day one.",
      solution:
        "A pipeline that reads incoming documents, extracts the structured data, files it into their system, and drafts the routine responses and reports. Anything ambiguous is flagged for a quick human review instead of failing silently.",
      outcome:
        "The team's role shifted from retyping to reviewing. Turnaround on routine paperwork dropped from days to minutes, and error rates fell with it.",
      tech: ["AI document extraction", "Workflow automation", "Human-in-the-loop review"],
      gallery: [
        { alt: "Automation pipeline overview (diagram placeholder)" },
        { alt: "Review queue interface (screenshot placeholder)" },
      ],
    },
  },
  // ── SAMPLE ── replace with a real project
  {
    slug: "ai-inquiry-assistant",
    image: "/projects/ai-inquiry-assistant/cover.png",
    title: "AI Order & Inquiry Assistant",
    client: "Online retailer", // SAMPLE — replace with real client
    category: "AI Automation",
    placeholder: true,
    problem: "Hundreds of identical chat questions a day — price, stock, delivery — answered one by one, late.",
    result: "Most inquiries get an instant, accurate reply; the team only steps in where a human matters.",
    metric: { value: "80%", label: "of inquiries answered instantly (sample metric)" },
    study: {
      intro:
        "An AI assistant for an online retailer whose sales team was drowning in the same twenty questions, asked five hundred different ways.",
      problem:
        "Every sale started in a chat thread — and so did every 'how much is shipping to Cebu?', 'is this in stock?', and 'where's my order?'. Replies lagged hours behind, and slow replies meant lost sales. The team was answering messages at midnight just to keep up.",
      approach:
        "I catalogued a month of real conversations first. The goal was never 'replace the team' — it was to let AI handle the twenty questions that make up most of the volume, with a clean handoff to a human the moment a conversation goes off-script or turns into a sale worth closing personally.",
      solution:
        "An assistant connected to their product list and order system: it answers price, stock, shipping, and order-status questions instantly and accurately, flags buying intent for the team, and hands off gracefully — the customer never fights a bot loop.",
      outcome:
        "Response time went from hours to seconds for the bulk of inquiries. The team stopped working midnights, and more conversations turned into orders because nobody buys from the shop that answers tomorrow.",
      tech: ["AI chat assistant", "Product & order integration", "Human handoff"],
      gallery: [
        { alt: "Assistant answering a stock question (screenshot placeholder)" },
        { alt: "Human handoff view for the sales team (screenshot placeholder)" },
      ],
    },
  },
  // ── SAMPLE ── replace with a real project
  {
    slug: "ai-branch-reports",
    image: "/projects/ai-branch-reports/cover.png",
    title: "Automated Branch Reporting",
    client: "Multi-branch retailer", // SAMPLE — replace with real client
    category: "AI Automation",
    placeholder: true,
    problem: "Every Monday, a manager spent half a day merging branch spreadsheets into one report.",
    result: "The report now writes itself over the weekend — Monday starts with decisions, not data entry.",
    metric: { value: "4 hrs", label: "of manager time saved weekly (sample metric)" },
    study: {
      intro:
        "A reporting pipeline for a retailer with several branches, where the weekly numbers arrived as five differently-formatted spreadsheets and one very tired manager.",
      problem:
        "Each branch submitted sales in its own format — different columns, different naming, sometimes photos of printouts. A manager spent every Monday morning reconciling them into the owner's weekly report. Errors crept in, and the numbers were always a week stale.",
      approach:
        "Instead of forcing branches to change how they work (which never sticks), the automation was built to meet them where they are: it reads whatever each branch sends and normalizes it. The manager's judgment stays in the loop for anomalies — the copying and pasting doesn't.",
      solution:
        "A pipeline that ingests each branch's submission, extracts and standardizes the numbers, flags anything unusual (a branch 40% down, a duplicate entry), and drafts the weekly report with charts — delivered before anyone is awake on Monday.",
      outcome:
        "Monday mornings start with the report already in the owner's inbox. The manager reviews flags instead of retyping cells, and the owner sees trends days earlier than before.",
      tech: ["AI data extraction", "Scheduled automation", "Report generation"],
      gallery: [
        { alt: "Auto-generated weekly report (screenshot placeholder)" },
        { alt: "Anomaly flags for review (screenshot placeholder)" },
      ],
    },
  },
  {
    slug: "mr-kamote-chips-investor-site",
    image: "/projects/mr-kamote-chips-investor-site/cover.png",
    title: "Investor Site",
    client: "Mr. Kamote Chips — Joshua",
    category: "Web",
    problem: "A growing brand raising capital with nothing to show investors but a Facebook page.",
    result: "A credible, numbers-forward web presence that carries the investor conversation.",
    study: {
      intro:
        "Alongside their inventory system, Mr. Kamote Chips needed to look as serious to investors as the business actually is.",
      problem:
        "The brand was growing fast and courting investors — but the only thing to send anyone was a Facebook page. First impressions were costing credibility before conversations even started.",
      approach:
        "Investor attention is short. The site was structured like a pitch: traction first, the story second, the ask last. Every claim is paired with a number, and the design stays clean enough that the numbers do the talking.",
      solution:
        "A fast, single-page investor site: growth metrics up top, the product and story told visually, distribution footprint, and a direct line to Joshua for serious inquiries.",
      outcome:
        "Investor conversations now start from a professional footing — the site does the introduction so meetings can start at 'how do we do this' instead of 'so what is this'.",
      tech: ["Next.js", "Single-page marketing site", "SEO & Open Graph"],
      gallery: [
        { alt: "Investor site hero with traction metrics (screenshot placeholder)" },
        { alt: "Product and story section (screenshot placeholder)" },
      ],
    },
  },
  // ── SAMPLE ── replace with a real project
  {
    slug: "clinic-booking-site",
    image: "/projects/clinic-booking-site/cover.png",
    title: "Clinic Site & Online Booking",
    client: "Dental clinic", // SAMPLE — replace with real client
    category: "Web",
    placeholder: true,
    problem: "Appointments only by phone, only during office hours — and patients who can't get through don't call back.",
    result: "Patients book 24/7 from their phone; automated reminders cut the empty chairs.",
    metric: { value: "24/7", label: "booking, up from office hours only (sample)" },
    study: {
      intro:
        "A website and booking system for a dental clinic that was losing patients to a busy phone line.",
      problem:
        "The clinic's only booking channel was a phone answered between cleanings. Patients calling after hours or getting a busy tone simply booked elsewhere. No-shows were frequent because reminders depended on someone remembering to text.",
      approach:
        "The site had one job: get an appointment booked with the least possible friction. Everything else — services, doctor bios, directions — supports that. The booking flow was designed to be finished in under a minute on a phone, because that's where patients are.",
      solution:
        "A clean clinic site with an always-open booking flow: pick a service, pick a slot from the live calendar, done. Automatic confirmations and day-before reminders by SMS/email, and a simple admin view where staff manage the schedule.",
      outcome:
        "Bookings now arrive around the clock — including the after-hours patients who used to slip away. Reminders go out without anyone remembering, and no-shows dropped noticeably in the first month.",
      tech: ["Next.js", "Online booking & calendar", "SMS/email reminders"],
      gallery: [
        { alt: "Clinic homepage with booking CTA (screenshot placeholder)" },
        { alt: "Mobile booking flow (screenshot placeholder)" },
        { alt: "Staff schedule view (screenshot placeholder)" },
      ],
    },
  },
  // ── SAMPLE ── replace with a real project
  {
    slug: "restaurant-site",
    image: "/projects/restaurant-site/cover.png",
    title: "Restaurant Site, Menu & Orders",
    client: "Restaurant", // SAMPLE — replace with real client
    category: "Web",
    placeholder: true,
    problem: "The menu lived in blurry Facebook photos — customers couldn't find prices, hours, or how to order.",
    result: "A findable site where the menu is always current and orders come in while the kitchen cooks.",
    study: {
      intro:
        "A website for a neighborhood restaurant whose entire online presence was a Facebook page and a photographed menu from two price changes ago.",
      problem:
        "Customers searching for the restaurant found third-party listings with wrong hours. The menu circulating online was an old photo with outdated prices, which meant every other order started with an argument. Ordering meant a phone call during the dinner rush.",
      approach:
        "For a restaurant, the website is the menu. It had to be effortless for the owner to update — if changing a price takes more than a minute, it won't happen and the site rots. Search visibility came second: name, hours, location, and menu structured so Google actually understands them.",
      solution:
        "A fast site with the menu as a first-class page (updatable by the owner in minutes, no developer needed), accurate hours and location that show up right in search, and a simple order-ahead flow that lands in the kitchen instead of interrupting the phone.",
      outcome:
        "The restaurant now owns its own search results, the menu argument is gone, and order-ahead sales are revenue that used to be a busy signal.",
      tech: ["Next.js", "Owner-editable menu", "Local SEO"],
      gallery: [
        { alt: "Homepage with hours and menu CTA (screenshot placeholder)" },
        { alt: "Menu page on mobile (screenshot placeholder)" },
        { alt: "Order-ahead flow (screenshot placeholder)" },
      ],
    },
  },
];

export const categories: { key: ProjectCategory; label: string; blurb: string }[] = [
  {
    key: "Custom Apps",
    label: "Custom Apps & Software",
    blurb: "Operational tools that replace paper, spreadsheets, and guesswork.",
  },
  {
    key: "AI Automation",
    label: "AI Automation",
    blurb: "Repetitive work, handled — with a human still in charge.",
  },
  {
    key: "Web",
    label: "Web",
    blurb: "Sites that earn trust and bring customers in.",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
