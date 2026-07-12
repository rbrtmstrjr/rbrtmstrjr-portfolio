-- Upgrade for the existing database: admin notification inbox (client
-- approvals / change requests / testimonials). Paste into the Supabase SQL
-- editor and Run (idempotent). Requires upgrade-contracts.sql first.

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

notify pgrst, 'reload schema';
