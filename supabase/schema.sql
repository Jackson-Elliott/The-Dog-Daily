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
  -- "Technology", "Culture", "Arts"), used to filter the header nav tabs.
  -- Nullable/uncategorized episodes just show under "All".
  category text,
  created_at timestamptz not null default now()
);

-- Already have an `episodes` table from before this column existed? Run this
-- separately (safe to re-run):
-- alter table episodes add column if not exists category text;

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
