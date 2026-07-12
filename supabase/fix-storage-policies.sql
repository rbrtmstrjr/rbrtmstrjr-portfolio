-- COMPLETE one-shot setup — run this whole file once in the Supabase SQL editor.
-- Safe to re-run. It replaces the earlier partial instructions: the original
-- schema.sql run failed on the storage bucket insert and ROLLED BACK the whole
-- transaction, so no tables were ever created. The bucket already exists
-- (created via the API), and the insert below is guarded so it can't abort
-- the script again.

-- ── Contact form ────────────────────────────────────────────────────────────
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  project_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

-- ── Admin CMS: managed projects ─────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  client text not null,
  category text not null check (category in ('Custom Apps', 'AI Automation', 'Web')),
  flagship boolean not null default false,
  placeholder boolean not null default false,
  problem text not null,
  result text not null,
  metric jsonb,
  image text,
  study jsonb not null,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "Published projects are publicly readable" on public.projects;
create policy "Published projects are publicly readable"
  on public.projects for select
  using (published = true);

grant select on public.projects to anon, authenticated;

-- ── Storage: project-media bucket + policies ────────────────────────────────
-- Bucket insert is guarded: some Supabase projects reject SQL writes to
-- storage.buckets — the bucket was already created via the Storage API.
do $$ begin
  insert into storage.buckets (id, name, public)
  values ('project-media', 'project-media', true)
  on conflict (id) do nothing;
exception when others then
  raise notice 'storage.buckets insert skipped (%). Bucket already exists via API.', sqlerrm;
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

-- Refresh PostgREST's schema cache so the API sees the new tables immediately.
notify pgrst, 'reload schema';
