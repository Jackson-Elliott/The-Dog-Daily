# The Dog Daily

A daily radio-script site: an admin-only upload page (audio file + a news story
link), and a public page styled on the radio-desk artwork where visitors play
the latest episode, see the script name/date, and flick through older ones.

## How it works

- **Public homepage (`/`)** — shows the most recent episode: the news photo and
  headline in the "on air" graphic, the script name + date, an audio player,
  and Newer/Older controls (or swipe) to browse past episodes.
- **Admin (`/admin`)** — password-protected. Paste a news story URL and click
  "Fetch headline & photo" to auto-extract a headline and photo from the page's
  Open Graph tags, edit the headline if you like, attach the recorded audio
  file, and save. Photos are downloaded and re-hosted in your own storage so
  they keep working even if the original news page changes.

## One-time setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free
   tier is plenty for this).
2. In the Supabase dashboard, open the **SQL Editor** and run
   [`supabase/schema.sql`](supabase/schema.sql). This creates the `episodes`
   table and the `audio`/`photos` public storage buckets.
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — from Project Settings →
     API in the Supabase dashboard.
   - `ADMIN_PASSWORD` — whatever password you want to use to log into `/admin`.
   - `SESSION_SECRET` — a random string, e.g. `openssl rand -hex 32`.
4. Install dependencies and run locally:
   ```bash
   npm install
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) for the public site and
   [http://localhost:3000/admin](http://localhost:3000/admin) to upload an
   episode.

## Deploying

Push this project to a git repo and import it on [Vercel](https://vercel.com).
Add the same four environment variables (`SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`) in the Vercel
project settings, then deploy.

## Project structure

- [`app/page.tsx`](app/page.tsx) — public homepage
- [`components/EpisodePlayer.tsx`](components/EpisodePlayer.tsx) — artwork +
  photo/headline overlay + audio player + Newer/Older navigation
- [`app/admin/page.tsx`](app/admin/page.tsx) — login gate + upload form +
  episode list
- [`app/api/admin/scrape/route.ts`](app/api/admin/scrape/route.ts) — headline/
  photo extraction from a news URL
- [`app/api/admin/episodes/route.ts`](app/api/admin/episodes/route.ts) and
  [`app/api/admin/episodes/[id]/route.ts`](app/api/admin/episodes/%5Bid%5D/route.ts) —
  create/delete episodes (admin-only)
- [`app/api/episodes/route.ts`](app/api/episodes/route.ts) — public episode
  listing
- [`proxy.ts`](proxy.ts) — guards the admin-only mutating API routes
- [`lib/`](lib) — Supabase client, session/cookie helpers, scraping, episode
  data access
- [`supabase/schema.sql`](supabase/schema.sql) — database + storage bucket
  setup
