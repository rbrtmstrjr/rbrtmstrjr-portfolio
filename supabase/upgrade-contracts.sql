-- Upgrade for the existing database: contracts module + client portal +
-- testimonials. Paste this whole file into the Supabase SQL editor and Run
-- (idempotent, no storage statements).

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  summary text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'archived')),
  portal_token text unique not null,
  scope text,
  payment_terms text,
  contract_details text,
  start_date date,
  target_end_date date,
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
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

notify pgrst, 'reload schema';
