-- Run this once in the Supabase SQL editor (Project > SQL Editor) for a new project.

create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  script_name text not null,
  air_date date not null,
  audio_url text not null,
  source_url text,
  headline text,
  photo_url text,
  -- One of the curated CATEGORIES in lib/categories.ts (e.g. "News",
  -- "Sports", "Culture"), used to filter the header nav tabs.
  -- Nullable/uncategorized episodes just show under "All".
  category text,
  -- One of SUBCATEGORIES[category] in lib/categories.ts (e.g. "Football"),
  -- used to group stories into sections on Design 2 topic tabs.
  subcategory text,
  -- One-sentence news summary shown under larger Design 2 cards.
  summary text,
  -- Story level (see lib/levels.ts): sets how big it appears on Designs 2 and 3.
  level text not null default 'standard' check (level in ('hero', 'major', 'standard', 'brief')),
  -- AI-generated alternatives to photo_url (see lib/imagery.ts), stored in the
  -- generated-images bucket. The site falls back to photo_url when unset.
  illustration_url text,
  collage_url text,
  -- Manual draft/published switch (see types/episode.ts). Existing rows
  -- default to published so currently live stories stay live.
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Already have an `episodes` table from before these columns existed? Run
-- these separately (safe to re-run):
-- alter table episodes add column if not exists category text;
-- alter table episodes add column if not exists published boolean not null default true;
-- alter table episodes add column if not exists subcategory text;
-- alter table episodes add column if not exists summary text;
-- alter table episodes add column if not exists level text not null default 'standard' check (level in ('hero', 'major', 'standard', 'brief'));
-- alter table episodes add column if not exists illustration_url text;
-- alter table episodes add column if not exists collage_url text;

create index if not exists episodes_air_date_idx on episodes (air_date desc);

-- Storage buckets for uploaded audio and re-hosted news photos. `public = true`
-- lets the site serve files directly via their public URL without any signed
-- URLs or extra RLS policies; all writes still go through the service role key
-- from the server, so the buckets stay effectively admin-write / public-read.
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', true)
on conflict (id) do nothing;

-- Public read so the homepage can play audio and show cover images.
-- Uploads still go through the server with the service role key.
drop policy if exists "Public read audio" on storage.objects;
create policy "Public read audio"
on storage.objects for select
to public
using (bucket_id = 'audio');

drop policy if exists "Public read photos" on storage.objects;
create policy "Public read photos"
on storage.objects for select
to public
using (bucket_id = 'photos');

drop policy if exists "Public read generated-images" on storage.objects;
create policy "Public read generated-images"
on storage.objects for select
to public
using (bucket_id = 'generated-images');
