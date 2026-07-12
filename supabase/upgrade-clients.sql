-- Upgrade for the existing database: clients module + project→client link.
-- Paste this whole file into the Supabase SQL editor and Run (idempotent).

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

-- Private business data: RLS on, NO policies — service-role access only.
alter table public.clients enable row level security;

-- Optional structured link from a project to a client. Deleting a client
-- detaches its projects (client_id → null) — never deletes them.
alter table public.projects add column if not exists client_id uuid
  references public.clients(id) on delete set null;

notify pgrst, 'reload schema';
