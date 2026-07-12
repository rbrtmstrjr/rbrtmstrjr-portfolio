-- Inquiries table for the contact form.
-- Run this once in the Supabase SQL editor.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  project_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Lock the table down: only the service role (server action) may write;
-- nothing is readable from the public API.
alter table public.inquiries enable row level security;

-- ---------------------------------------------------------------------------
-- Admin CMS: managed projects (mirrors the Project type in lib/projects.ts).
-- Hardcoded projects in lib/projects.ts stay; rows here are merged on top
-- (a DB row with the same slug wins — that's how a project is "migrated").
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  client text not null,
  -- references a category key: built-in (lib/projects.ts) or public.categories
  category text not null,
  flagship boolean not null default false,
  placeholder boolean not null default false,
  status text not null default 'completed'
    check (status in ('completed', 'in-progress', 'just-started')),
  problem text not null,
  result text not null,
  -- { "value": string, "label": string } — same shape as Project.metric
  metric jsonb,
  -- public URL (Supabase Storage) or /public path — same as Project.image
  image text,
  -- optional case-study meta shown on /work/[slug]
  year text,
  duration text,
  role text,
  -- { "quote": string, "author": string }
  testimonial jsonb,
  -- { intro, problem, approach, solution, outcome, tech[], gallery[], link } —
  -- exactly the Project.study block; validated by zod before every write
  study jsonb not null,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent upgrades for databases created before these columns existed.
alter table public.projects drop constraint if exists projects_category_check;
alter table public.projects add column if not exists status text not null default 'completed';
alter table public.projects add column if not exists year text;
alter table public.projects add column if not exists duration text;
alter table public.projects add column if not exists role text;
alter table public.projects add column if not exists testimonial jsonb;

-- Managed categories — extends the 3 built-ins in lib/projects.ts. A row whose
-- key matches a built-in overrides its label/blurb/order; new keys become new
-- homepage tabs automatically (tabs with zero projects are hidden).
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  blurb text not null default '',
  sort_order integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

grant select on public.categories to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Clients — private business data (the spine for future leads/payments
-- modules). RLS on with NO policies: unreachable from the public API; all
-- reads/writes go through the service-role server actions, same lockdown as
-- inquiries.
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  contact_email text,
  contact_phone text,
  location text,
  website text,
  source text,
  status text not null default 'active'
    check (status in ('active', 'past', 'prospect')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

-- Optional structured link from a project to a client (internal/admin use;
-- the public site keeps rendering the project's `client` text). Deleting a
-- client detaches its projects — never deletes them.
alter table public.projects add column if not exists client_id uuid
  references public.clients(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Contracts — real paid engagements (SEPARATE from portfolio projects).
-- Terms + milestones + a secret-token client portal (/client/{portal_token}).
-- RLS on with NO policies on all three tables: unreachable from the public
-- API; admin reads/writes and token-scoped portal access all go through
-- service-role server code that filters by portal_token.
-- ---------------------------------------------------------------------------

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  -- RESTRICT: a client with real contracts can't be deleted by accident
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  summary text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'archived')),
  -- unguessable public-portal key (crypto-random, regenerable)
  portal_token text unique not null,
  scope text,
  payment_terms text,
  contract_details text,
  start_date date,
  target_end_date date,
  -- integer centavos; INTERNAL — never exposed to the portal
  total_value bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contracts enable row level security;

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'ready_for_review', 'approved', 'changes_requested')),
  -- client's "request changes" comment, written via the token-scoped action
  client_note text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.milestones enable row level security;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  author_name text not null,
  author_role text,
  body text not null,
  rating integer check (rating between 1 and 5),
  -- admin review gate: nothing public until approved AND published
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

-- Per-milestone live preview links (label + URL shown on the client portal).
create table if not exists public.milestone_links (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  label text not null,
  url text not null,
  type text not null default 'live',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.milestone_links enable row level security;

-- Log of "Notify client" emails — so admin can see what was sent when.
create table if not exists public.contract_notifications (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  sent_to text not null,
  subject text not null,
  note text,
  sent_at timestamptz not null default now()
);

alter table public.contract_notifications enable row level security;

-- Inbox for the admin: client-originated events (approvals, change requests,
-- testimonials) written by the token-scoped portal actions.
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('milestone_approved', 'changes_requested', 'testimonial_submitted')),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_notifications enable row level security;

-- Contract document attachments (Word/PDF agreements etc). Files live in the
-- PRIVATE `contract-files` bucket (created via the Storage API — SQL inserts
-- into storage.buckets are blocked on this project); access is service-role
-- signed URLs only (admin + token-scoped portal).
create table if not exists public.contract_files (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  name text not null,
  path text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.contract_files enable row level security;

-- ---------------------------------------------------------------------------
-- App settings — single-row config editable in /admin/settings. RLS with NO
-- policies: reads/writes go through service-role server code; the public site
-- receives ONLY whitelisted fields via lib/settings-data.ts (with lib/site.ts
-- values as fallback). notification_email etc. never leave the server.
-- ---------------------------------------------------------------------------

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  contact_email text,
  notification_email text,
  github_url text,
  linkedin_url text,
  site_domain text,
  availability_status text not null default 'available'
    check (availability_status in ('available', 'booked', 'unavailable')),
  availability_message text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

-- Reusable default milestones seeded into new contracts.
create table if not exists public.milestone_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  default_description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.milestone_templates enable row level security;

-- Public API may read published rows only; all writes go through the
-- service-role server actions (no anon/authenticated write policies).
alter table public.projects enable row level security;

drop policy if exists "Published projects are publicly readable" on public.projects;
create policy "Published projects are publicly readable"
  on public.projects for select
  using (published = true);

-- ---------------------------------------------------------------------------
-- Storage: project-media bucket (covers + galleries). Public read — these are
-- portfolio images; the signed-in admin uploads from the browser.
-- ---------------------------------------------------------------------------

-- Guarded: some Supabase projects reject SQL writes to storage.buckets and an
-- unguarded failure rolls back the whole script. If this skips, create the
-- bucket in the dashboard (Storage → New bucket → "project-media", public).
do $$ begin
  insert into storage.buckets (id, name, public)
  values ('project-media', 'project-media', true)
  on conflict (id) do nothing;
exception when others then
  raise notice 'storage.buckets insert skipped (%): create the bucket via dashboard/API.', sqlerrm;
end $$;

drop policy if exists "project-media public read" on storage.objects;
create policy "project-media public read"
  on storage.objects for select
  using (bucket_id = 'project-media');

drop policy if exists "project-media admin insert" on storage.objects;
create policy "project-media admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-media');

drop policy if exists "project-media admin update" on storage.objects;
create policy "project-media admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'project-media');

drop policy if exists "project-media admin delete" on storage.objects;
create policy "project-media admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-media');
