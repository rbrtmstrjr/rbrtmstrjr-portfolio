-- Upgrade for the existing database: admin settings + milestone templates.
-- Paste into the Supabase SQL editor and Run (idempotent).

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

create table if not exists public.milestone_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  default_description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.milestone_templates enable row level security;

notify pgrst, 'reload schema';
