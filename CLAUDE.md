@AGENTS.md

# Portfolio 2026 — Robert Maestro

Freelance portfolio for **Robert Maestro** (custom software & AI automation for
businesses). Outcome-focused, client-trust-first — the site itself is the craft
demo. Original full spec lives in `build-prompt` at the repo root.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (radix preset, CLI v4) — components in `components/ui/`
- **framer-motion v12** for all JS-driven motion
- **react-hook-form + zod v4** (contact form), **Resend** (email), **Supabase** (storage)
- **simple-icons** (brand icons in the tech marquee), **lucide-react v1** (UI icons — NO brand icons; GitHub/LinkedIn are inline SVGs in `sections/contact.tsx`)
- Deploy target: Vercel. Fully static (SSG) — 19 pages.

### Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build — run after changes; must stay green
npm run lint    # eslint (scripts/ is ignored via eslint.config.mjs)
```

## Brand & design system (IMPORTANT — read before any UI work)

**Every design token lives in `app/theme.css`. Never hardcode colors in
components** — the sole exceptions are the standalone OG image
(`app/opengraph-image.tsx`), `app/icon.svg`, and `scripts/generate-mockups.js`,
which can't read CSS vars.

- **Palette**: ONE accent per theme — they never cross. Scales documented in `theme.css`.
  - Light: primary **blue** `#0c4eff` (blue-600), cool blue-white paper background
  - Dark: primary **aquamarine** `#64ffda` (aqua-300) on `#00352f` text, deep navy background — NO blue accents in dark, NO aquamarine in light
  - `--brand-panel` / `--brand-panel-deep`: deep accent tones that stay dark in BOTH themes (for white line-art backdrops)
  - `--success` / `--warning` (2026-07-12): FUNCTIONAL status colors (badges/feedback only — never brand accents), defined per theme
- **Typography** (loaded in `app/layout.tsx` via `next/font`):
  - Display: **Agdasima** (`--font-display` / `font-display`) — **brand rule: ALWAYS bold + UPPERCASE, NEVER italic**, enforced globally in `globals.css` on `h1,h2,h3` and `.font-display`
  - Body/UI: **Poppins** (`--font-sans`)
  - Micro-labels/eyebrows: **Geist Mono** (`--font-mono`, `.eyebrow` utility)
- **Buttons**: sizes in `components/ui/button.tsx` are intentionally roomier
  than the shadcn preset defaults. `.btn-cta` (globals.css) = the loud primary
  action (hero + contact submit + service pages).
- **Badge language**: light-blue chips — `border-primary/15 bg-primary/[0.05]`
  with `text-primary/80`, `rounded-lg` (same radius as buttons). Used by the
  tech marquee, services strip, etc. Solid `bg-primary` = active/hover state.
- **Signature card**: `components/ui/window-card.tsx` — browser-window frame
  (3 dots + mono "address pill"). ALL major cards use it (services, work,
  contact form, service-page hero graphics). Address pills show real routes
  (e.g. `work/fishpin`).
- **Motion vocabulary**: `lib/motion.ts` (EASE_OUT `[0.25,1,0.5,1]`, DURATION,
  fadeRise, stagger, VIEWPORT) + `components/motion/reveal.tsx`
  (`Reveal` / `RevealGroup` / `RevealItem` — whileInView fade+rise) +
  `components/motion/split-words.tsx` (word-mask hero headline).
  `MotionConfig reducedMotion="user"` in `components/providers.tsx` gives
  global reduced-motion fallbacks; anything outside framer needs its own
  `prefers-reduced-motion` handling (see marquee/flow CSS).

## Page & route map

| Route | Source | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Section order: Hero → TechMarquee → Services → Work → Journey (contribution graph inside) → Process → Testimonials → Contact; `revalidate = 3600` (hourly ISR keeps the GitHub graph fresh; admin saves still revalidate on demand). GitHub CONTRIBUTION GRAPH (heatmap): fetched in `lib/github.ts` (server-only; GraphQL contributionCalendar when `GITHUB_TOKEN` set — exact counts — else parses the public /users/{u}/contributions HTML for data-date/data-level; graceful null); rendered by `components/site/contribution-graph.tsx` (presentational, client-safe) at the bottom of the Journey right column via a `contributions` prop from page.tsx. Cell colors = primary opacity scale, tokens only. Public graph counts PUBLIC contributions only — enabling "Include private contributions" in the GitHub profile raises the number |
| `/services/[slug]` | `app/services/[slug]/page.tsx` | 2 pages from `lib/services.ts` (`custom-software`, `ai-automation`); SSG + metadata |
| `/work` | `app/work/page.tsx` | ALL projects in a tab-filtered browser (`components/site/work-browser.tsx` — "All" + per-category tabs); homepage Work shows max 6 highlights per category; both use the shared `work-tabs.tsx` pill + uniform `project-cards.tsx` (3-up grid); BottomNav "Work" links here |
| `/work/[slug]` | `app/work/[slug]/page.tsx` | case studies from `lib/projects-data.ts` (`getProjectBySlug`); problem→approach→solution→outcome template; `dynamicParams` renders new DB slugs on demand; hourly `revalidate` backstop (same on `/work`) |
| `/admin` (overview), `/admin/projects` (+ `new`, `[id]/edit`), `/admin/categories`, `/admin/clients` (+ `new`, `[id]`, `[id]/edit`), `/admin/contracts` (+ `new`, `[id]`, `[id]/edit`), `/admin/login` | `app/admin/*` | self-hosted CMS in a SIDEBAR shell (`components/admin/admin-sidebar.tsx` — desktop aside + mobile Sheet drawer; sticky top-right theme/sign-out via `AdminTopbar`; Leads/Payments/Reports shown as "soon"), force-dynamic, noindex, guarded by `proxy.ts` (see Admin CMS) |
| `/client/[token]` | `app/client/[token]/page.tsx` | CLIENT PORTAL — public but secret-token-gated, force-dynamic, noindex, chrome hidden via `site-chrome.tsx` (see Contracts) |
| `/sitemap.xml`, `/robots.txt`, OG image, `icon.svg`, `not-found` | `app/*` | sitemap includes services + merged work pages |

Global chrome (rendered in `app/layout.tsx`): skip-link → `Navbar` → main →
`BottomNav` → `ScrollGuide`. NO site footer (removed 2026-07-13 — contact
email + GitHub/LinkedIn socials live in the homepage Contact section's
"Reach me directly" block instead). Navbar/dock/rail are wrapped in
`components/site/site-chrome.tsx` (client pathname gate) so they don't render
under `/admin`, which has its own shell.

## Admin CMS (`/admin`) — dynamic projects

**FULLY database-driven since 2026-07-12** — the pre-CMS hardcoded arrays were
migrated to Supabase and deleted; `lib/projects.ts` is now TYPES ONLY
(Project/Category/ProjectStatus + `sortForDisplay`). All public reads go
through `lib/projects-data.ts` → `getAllProjects()` / `getVisibleCategories()`
(homepage Work, `/work`, `/work/[slug]`, service related-work, nav search via
the `getSearchIndex` server action, sitemap). No Supabase env → the build
stays green but the site
renders EMPTY work/tab sections — content requires the env keys (local
`.env.local` + Vercel).

- **Auth**: Supabase email/password, single admin created in the dashboard (no
  sign-up). `proxy.ts` (Next 16 middleware successor) guards `/admin/*` and
  refreshes session cookies; `lib/supabase/server-auth.ts` re-verifies the
  session in every mutating server action (the real boundary);
  `lib/supabase/browser.ts` is the cookie-based browser client (login, uploads).
- **Writes**: `app/actions/admin-projects.ts` — zod-validate
  (`lib/admin/project-schema.ts`, flattened form shape + `formToRow`), upsert
  via service role, then `revalidatePath("/", "layout")` + sitemap + the slug's
  work page — saves go live without a redeploy (ISR; Vercel required).
- **Uploads**: `components/admin/image-upload.tsx` + `lib/admin/optimize-image.ts`
  — client-side canvas → WebP (cover ≤2560px, gallery ≤1600px, q0.85,
  imageSmoothingQuality high — retina-sized masters; next/image serves
  quality=85 via `images.qualities`), upsert to
  the public `project-media` bucket at `{slug}/cover.webp` / `{slug}/gallery-{n}.webp`,
  store the public URL (cache-busted `?v=`). `next.config.ts` allows
  `*.supabase.co` for next/image. Delete removes the row + its media folder.
- **UI**: `/admin/projects` lists all projects with published/draft/status
  chips; `components/admin/project-form.tsx` is the full RHF+zod form (card +
  study + gallery field-array + toggles + sticky live card preview). Slug
  auto-follows title until edited.
- **Schema**: `supabase/schema.sql` — `projects` table (RLS: anon reads
  `published=true` only, no write policies → service-role only) + storage
  policies (public read, authenticated write). Env: existing `SUPABASE_*` pair
  plus `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Dynamic categories** (2026-07-12): `public.categories` table is the ONLY
  category source (`ProjectCategory` is `string`; the original 3 were seeded
  into the DB). `getVisibleCategories()` filters to categories with ≥1
  project — **empty categories never render as homepage tabs**. Delete is
  blocked while any project uses the key; saveProject validates the key
  exists. Managed INSIDE `/admin/projects`: "New category"
  dialog button beside "New project" (`components/admin/category-dialog.tsx`
  on the new `ui/dialog.tsx` primitive) + a Categories list card with per-row
  edit-dialog/delete; `/admin/categories` now just redirects there.
- **Clients module** (2026-07-12): `public.clients` table (RLS on, NO policies
  — service-role only, private business data) + nullable
  `projects.client_id` FK (`on delete set null` — deleting a client detaches,
  never deletes, projects). Public rendering STILL uses the project's `client`
  text; the FK is internal. Data: `lib/clients-data.ts`; form schema
  `lib/admin/client-schema.ts`; actions `app/actions/admin-clients.ts` (no
  revalidation needed — nothing public reads clients). UI: `/admin/clients`
  list (search/status filter/name sort), new/edit, detail with linked projects
  + dashed "Leads/Payments soon" placeholders where future modules attach.
  Upgrade SQL: `supabase/upgrade-clients.sql`.
- **Contracts module + client portal** (2026-07-12): real paid engagements,
  SEPARATE from portfolio projects. Tables `contracts` (client_id FK
  RESTRICT — blocks deleting a client with contracts; `portal_token` =
  24-char crypto-random base64url, regenerable), `milestones`
  (pending→in_progress→ready_for_review→approved/changes_requested +
  client_note), `testimonials` (pending/approved/rejected + published bool) —
  all RLS-on-no-policies, service-role only. Data `lib/contracts-data.ts`
  (`getPortalData(token)` whitelists portal-safe fields — NEVER total_value);
  schemas `lib/admin/contract-schema.ts`; admin actions
  `app/actions/admin-contracts.ts`; token-scoped portal actions
  `app/actions/portal.ts` (approve/request-changes only from
  ready_for_review, testimonial only when contract completed, one per
  contract, always lands `pending`). Portal `/client/[token]`
  (`components/portal/portal-view.tsx`): progress %, Milestones/Agreement
  tabs, testimonial card on completion. Public: `sections/testimonials.tsx`
  on homepage renders ONLY approved+published (renders nothing when empty);
  publishing via `reviewTestimonial` revalidates the site. Upgrade SQL:
  `supabase/upgrade-contracts.sql`. Extras (2026-07-12):
  `milestone_links` table (labeled live-preview URLs per milestone — admin
  manages via LinkDialog/LinkChip in `milestones-manager.tsx`; portal renders
  them as accent buttons, new tab + noopener; token-scoped via
  `getPortalData`) and `contract_notifications` log + **manual**
  "Notify client" emails (`notifyClient` action — Resend, inline-styled HTML
  with hardcoded brand hex like the OG-image exception, portal CTA link,
  optional personal note, disabled without client email, dev-without-key logs
  + succeeds; per-milestone Bell buttons + contract-level button; "Emails
  sent" log card on the contract detail). Upgrade SQL:
  `supabase/upgrade-contract-extras.sql`. Attachments: `contract_files` table
  + PRIVATE `contract-files` bucket (created via Storage API, 10MB limit) —
  uploads go through the `uploadContractFile` server action (service role;
  `experimental.serverActions.bodySizeLimit: "12mb"` in next.config.ts);
  admin + portal read via 1h signed URLs (`getSignedContractFiles`); form
  holds files as "pending" and uploads after save so create-mode works.
  Upgrade SQL: `supabase/upgrade-contract-files.sql`. Admin inbox:
  `admin_notifications` table — portal actions write approval /
  change-request / testimonial events; `NotificationsBell`
  (top bar + mobile header, unread badge, opening marks all read via
  `markAllNotificationsRead`) links each item to its contract. Upgrade SQL:
  `supabase/upgrade-admin-notifications.sql`.
- **Settings module** (2026-07-12): `/admin/settings` (sidebar footer link) —
  single-row `public.settings` (id=1) + `milestone_templates`, both
  RLS-on-no-policies. Data: `lib/settings-data.ts` — `getPublicSettings()`
  whitelists site-facing fields (contact/socials/domain/availability) with
  `lib/site.ts` as fallback; `getNotificationEmail()` stays server-only.
  Consumers migrated: hero availability pulse (prop from page), contact
  section email + GitHub/LinkedIn socials, contact-action recipient,
  notify-client portal domain. Actions `app/actions/admin-settings.ts`
  (saveSiteInfo/saveAvailability revalidate the layout; template CRUD).
  Account section = ONE combined form (new email and/or new password, blank =
  keep) via Supabase Auth browser client with MANDATORY current-password
  re-auth; email change = secure double-confirm (links to BOTH inboxes) with
  `emailRedirectTo` → /admin/settings — the target must be in the Supabase
  Auth redirect-URL allowlist or it falls back to the Site URL;
  `components/site/auth-redirect-toast.tsx` (mounted in the root layout)
  surfaces the `?message=`/`#error_description=` Supabase appends wherever the
  link lands, then cleans the URL; reset flow:
  login "Forgot password?" → `resetPasswordForEmail` →
  `/admin/reset-password` (allowlisted in proxy.ts, session arrives via
  INITIAL_SESSION listener). Contract creation seeds milestones from
  templates via `seedContractMilestones` (checkbox, default on).
  Integrations panel = env presence + light pings (Supabase query, Resend
  /domains, GitHub /user) — never renders secrets. Upgrade SQL:
  `supabase/upgrade-settings.sql`.
- **Project details** (2026-07-12): `status`
  (completed | in-progress | just-started — non-completed shows a pulsing badge
  chip on card + case page), optional `year` / `duration` / `role` (case-page
  meta row) and `testimonial` jsonb `{quote, author}` (pull-quote block on the
  case page, after the story chapters). Existing DBs upgrade via
  `supabase/upgrade-project-details.sql` (idempotent; also in schema.sql).

## Component inventory

### Navigation & chrome (`components/site/`)
- **navbar.tsx** — top bar: "RM." wordmark (big Agdasima, `foreground`),
  centered `NavSearch` (desktop only), theme toggle + "Start a project".
  Morphs full-width→floating pill (`max-w-7xl`, rounded-full, blur, shadow) on scroll.
- **nav-search.tsx** — functional search over projects + sections, combobox ARIA, dropdown results.
- **bottom-nav.tsx** — floating dock (Home/Services/Work/Contact), icon+label,
  scroll-spied active pill (IntersectionObserver on section ids; hero has `id="home"`).
  Inactive items collapse to icons on mobile.
- **scroll-guide.tsx** — right-edge futuristic rail: 3-digit percent readout,
  fill line, glowing dot, 6 ticks, vertical SCROLL label. Desktop only, decorative.
- **theme-toggle.tsx** — CSS-swap sun/moon (no mounted-state; avoids the
  react-hooks/set-state-in-effect lint rule).

### Homepage sections (`components/sections/`)
- **hero.tsx** — full first screen (`min-h-svh`, marquee stays below fold).
  Portrait LEFT (top on mobile), copy RIGHT: eyebrow, "I'M ROBERT." (ROBERT. in
  primary), one-sentence pitch, `.btn-cta` + tinted ghost "See the work",
  availability pulse + 400+ credibility line.
- **site/hero-profile.tsx** + **site/profile-art.tsx** — the line-art portrait
  (`/public/images/profile.svg`, white fills recolored via `.profile-art` CSS:
  40% foreground light / 45% dark) with the **comet/snake animation**: rAF-driven
  stroke-dash windows traversing whole paths in file order, layered
  body/glow/tail strokes + per-line afterglow (3.2s fade). Pause/resume
  controller driven DIRECTLY by IntersectionObserver (frozen off-screen,
  resumes in place; frame-delta clamped for tab returns). See PITFALLS.
- **tech-marquee.tsx** — full-bleed infinite badge strip (simple-icons), CSS
  keyframes (in globals, OUTSIDE @layer), pauses on hover; badges solid-blue on hover.
- **services.tsx** — two WindowCards with in-card graphics (see
  **site/service-graphics.tsx**: `MiniDashboard` + `AutomationFlow`, `size`
  prop sm/lg), icon+title+tagline header, check-circle outcomes, "Learn more"
  → `/services/[slug]`. Blue design-skills strip below.
- **work.tsx** — tabbed by category (animated pill, count in circle badge —
  solid blue when active, `dark:bg-foreground/15` pill fix). HIGHLIGHTS ONLY:
  max 6 per category (`MAX_PER_CATEGORY`), flagship-first, "+N more" hint and a
  "View all work" button → `/work`. Card components live in
  **components/site/project-cards.tsx** (shared with `/work`): title → client
  meta → inline "Problem:" line → **result callout** (blue left border +
  `bg-primary/5`) → "Case study"; StatusChip for in-progress/just-started.
  Flagship (FishPin) spans 2 cols with side image + badge.
- **journey.tsx** — 4-stage timeline, line-draw + dot-pop reveals, "400+ sites" stat.
- **process.tsx** — 5 numbered steps, sticky intro column.
- **contact.tsx** — RHF + zod form in a WindowCard (`contact/new-project`),
  honeypot, project-type Select, loading/success states, "What happens next".

### Data (`lib/`)
- **site.ts** — identity/config: name, `wordmark: "RM."`, email, url (FALLBACK
  only — /admin/settings "Site domain" overrides it for metadataBase, sitemap,
  robots, JSON-LD, portal links; TODO real domain), `tagline` (OG image copy),
  socials (TODO), credibility copy.
- **projects.ts** — TYPES ONLY (Project, Category, ProjectStatus,
  `sortForDisplay`). All content lives in Supabase and is read through
  **projects-data.ts** (`getAllProjects()` / `getVisibleCategories()` /
  `getProjectBySlug()`, server-only; `getAllProjects` + `getSettingsRow` are
  wrapped in React `cache()` for per-request dedupe). Adding a project in
  /admin updates card, tabs, case page, sitemap, and search — no code changes,
  no redeploy. Nav search loads its index LAZILY on first focus via the
  `getSearchIndex` server action (`app/actions/search-index.ts`) — the root
  layout does NOT fetch projects.
- **services.ts** — 2 services: card fields + `detail` (intro, 6 features,
  fit-for checklist, related-projects categoryKey).
- **contact-schema.ts** — shared zod schema (client+server), honeypot field.
- **supabase-server.ts** — service-role client (server-only, null when unconfigured).
- **motion.ts** — shared easing/duration/variants.

### Backend (`app/actions/contact.ts`)
Server action: validate → honeypot (fake success) → in-memory rate limit
(5/10min/IP) → **store to Supabase first, email via Resend second** (never lose
a submission). Dev without env keys logs to console and succeeds; prod without
keys errors with a mailto fallback. Env in `.env.example`; SQL in
`supabase/schema.sql` (RLS locked, service-role writes only).

## Assets & tooling

- `public/images/profile.svg` — hero line-art (white fills; recolor via CSS).
  `front-image.svg` unused spare. `fishpin.jpg` unused.
- `public/projects/<slug>/cover.png` — generated UI-mockup covers (1600×1000)
  from `scripts/generate-mockups.js` (playwright-core + local ms-playwright
  chromium; `npm i playwright-core` once to rerun). Only the two Kamote covers
  are still referenced; the rest belong to removed sample projects and can be
  deleted. `components/site/project-image.tsx` falls back to a labeled
  placeholder panel when `src` is unset (galleries still use placeholders).
  Managed-project images live in Supabase Storage (`project-media`), not here.

## PITFALLS — hard-won, do not regress

1. **Tailwind v4 drops `@keyframes` declared inside `@layer`** — marquee +
   flow-edge keyframes MUST stay at top level of `globals.css`.
2. **Do NOT animate `stroke-dashoffset` with WAAPI** on the portrait's compound
   paths — Chromium silently skips paints. The rAF style-write loop in
   `profile-art.tsx` is the working approach.
3. **Do NOT add `vector-effect: non-scaling-stroke`** to the comet overlays —
   Chromium computes dash patterns in screen space under it, desyncing the dash
   from user-space `getPointAtLength` positions. Stroke widths are in SVG user
   units on purpose.
4. **Drive imperative pause/resume directly from IntersectionObserver
   callbacks**, not through React state relays — the state version dropped
   resume events (portrait froze until a tab switch).
5. `AutomationFlow` connection ports are HTML dots, not SVG circles — the
   `preserveAspectRatio="none"` canvas would squash SVG circles into ellipses.
6. **Stale dev-server CSS**: if newly-added utility classes render inert while
   old ones work, restart `npm run dev` (optionally clear `.next`). Production
   build is the truth.
7. lucide-react 1.x has no brand icons; simple-icons has no `siOpenai`
   (use `siClaude`/`siAnthropic`).
8. A hero-section flex `<p>` once collapsed the space between a JSX expression
   and following text ("shippedacross") — wrap mixed text in a single `<span>`
   inside flex containers.

## Content TODOs before launch (marked `TODO` in code)

- FishPin Google Play URL (`lib/projects.ts` / managed FishPin row)
- Real domain + GitHub/LinkedIn URLs (`lib/site.ts`)
- Real screenshots for covers + gallery images (upload via /admin)
- Resend env keys for prod email (`.env.example`); Supabase is configured
- Add real AI Automation projects via /admin (that category is currently empty)

## Working conventions for this repo

- After any change: `npm run lint` + `npm run build` must pass.
- Restraint in layout, generosity in motion; transform/opacity only; respect
  reduced motion everywhere.
- Keep hierarchy scannable: title → quiet meta → context → highlighted payoff.
- All new cards should use `WindowCard`; all new chips use the badge language.
- The user checks UI manually — do not spend time on screenshot verification
  unless explicitly asked.
