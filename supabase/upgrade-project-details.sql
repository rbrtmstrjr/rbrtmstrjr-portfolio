-- Upgrade for the existing database: dynamic categories + project status/meta.
-- Paste this whole file into the Supabase SQL editor and Run (idempotent).

-- Projects: allow any category key + new optional detail fields.
alter table public.projects drop constraint if exists projects_category_check;
alter table public.projects add column if not exists status text not null default 'completed';
alter table public.projects add column if not exists year text;
alter table public.projects add column if not exists duration text;
alter table public.projects add column if not exists role text;
alter table public.projects add column if not exists testimonial jsonb;

-- Re-add the status constraint (dropped+created so re-runs don't error).
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
  check (status in ('completed', 'in-progress', 'just-started'));

-- Managed categories — extends the 3 built-ins in lib/projects.ts.
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

notify pgrst, 'reload schema';
