-- =========================================================================
-- Ritual library — extend the rituals table for the curated, browse-by-
-- purpose library built from the blog archive and YouTube.
--
-- Run this in the Supabase SQL Editor. Idempotent: safe to re-run.
--
-- The base rituals table (from 2026-05-22-initial-schema.sql) already has:
--   slug, title_en/es, body_en/es, intention, tradition, difficulty,
--   duration_minutes, best_day_of_week, best_moon_phase, materials (jsonb),
--   warnings, source_credit, published_at, updated_at.
--
-- This adds the few fields the library needs on top of that.
-- =========================================================================

-- Folk purpose (the browse shelf): "money-drawing", "uncrossing", etc.
-- Free text on purpose, validated in app code against lib/rituals/purposes.ts
-- so you can add shelves without a migration.
alter table public.rituals add column if not exists purpose text;

-- Short one-paragraph summary for cards and list rows.
alter table public.rituals add column if not exists summary text;

-- Ordered ritual steps, e.g. ["Cleanse the space.", "Light the candle.", ...]
alter table public.rituals add column if not exists steps jsonb not null default '[]';

-- Where this ritual came from, so every entry links back to the real source.
alter table public.rituals add column if not exists source_url text;
alter table public.rituals add column if not exists source_type text;   -- 'blog' | 'youtube'

-- Free tags for search/filter beyond the single purpose.
alter table public.rituals add column if not exists keywords text[] not null default '{}';

-- Image for the ritual card (reuses OB CDN art, or a post's og:image).
alter table public.rituals add column if not exists image_url text;

-- Indexes for the browse + search surfaces.
create index if not exists rituals_purpose_idx on public.rituals(purpose);
create index if not exists rituals_purpose_published_idx
  on public.rituals(purpose, published_at)
  where published_at is not null;

-- Trigram search over title + summary (needs pg_trgm; ignore if unavailable).
create extension if not exists pg_trgm;
create index if not exists rituals_title_trgm
  on public.rituals using gin (title_en gin_trgm_ops);
create index if not exists rituals_summary_trgm
  on public.rituals using gin (summary gin_trgm_ops);

-- =========================================================================
-- Done. The extraction pipeline (scripts/build-ritual-library.ts) writes
-- rows with the service role key, which bypasses RLS. Members read published
-- rows via the existing "rituals_select_published_for_members" policy.
-- =========================================================================
