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
