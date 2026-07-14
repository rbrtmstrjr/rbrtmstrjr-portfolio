-- Upgrade for the existing database: curated accent palettes + visitor picker.
-- Paste into the Supabase SQL editor and Run (idempotent).
--
-- SUPERSEDES upgrade-theme.sql (the single-accent settings columns): the
-- accent system is now a palette MENU the admin curates here, while each
-- visitor's pick lives in their own browser's localStorage. This script also
-- removes the obsolete settings columns if that earlier upgrade ever ran.
--
-- Public read is intentional — the whole menu ships to the public site.
-- theme.css blue/aquamarine remain the fallback when this table is empty.

create table if not exists public.accent_palettes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  scale_light jsonb not null,
  scale_dark jsonb not null,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accent_palettes enable row level security;

-- at most ONE default (partial unique index on the true value)
create unique index if not exists accent_palettes_one_default
  on public.accent_palettes (is_default) where is_default;

drop policy if exists "Accent palettes are publicly readable" on public.accent_palettes;
create policy "Accent palettes are publicly readable"
  on public.accent_palettes for select
  using (true);

grant select on public.accent_palettes to anon, authenticated;

-- Seed the current brand as the initial default (only into an empty table).
insert into public.accent_palettes (name, slug, scale_light, scale_dark, is_default, sort_order)
select
  'Classic',
  'classic',
  '{"50":"#e8f5ff","100":"#d5ecff","200":"#b3dbff","300":"#85c2ff","400":"#569dff","500":"#2f77ff","600":"#0c4eff","700":"#0040ff","800":"#063bcd","900":"#10399f","950":"#0a205c"}'::jsonb,
  '{"50":"#eefffa","100":"#c5ffee","200":"#8bffdf","300":"#64ffda","400":"#14edc0","500":"#00d1a9","600":"#00a88b","700":"#008570","800":"#056a5b","900":"#0a574b","950":"#00352f"}'::jsonb,
  true,
  0
where not exists (select 1 from public.accent_palettes);

-- Obsolete single-accent columns from the superseded upgrade-theme.sql:
alter table public.settings drop column if exists accent_light;
alter table public.settings drop column if exists accent_dark;

notify pgrst, 'reload schema';
