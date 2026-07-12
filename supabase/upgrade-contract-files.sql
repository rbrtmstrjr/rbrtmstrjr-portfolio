-- Upgrade for the existing database: contract document attachments.
-- Paste into the Supabase SQL editor and Run (idempotent).
-- The private `contract-files` bucket was already created via the Storage API.

create table if not exists public.contract_files (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  name text not null,
  path text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.contract_files enable row level security;

notify pgrst, 'reload schema';
