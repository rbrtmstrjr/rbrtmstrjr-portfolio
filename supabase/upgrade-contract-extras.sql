-- Upgrade for the existing database: per-milestone preview links +
-- notification-email log. Paste into the Supabase SQL editor and Run
-- (idempotent, no storage statements). Requires upgrade-contracts.sql first.

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

notify pgrst, 'reload schema';
