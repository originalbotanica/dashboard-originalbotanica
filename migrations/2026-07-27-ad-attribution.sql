-- Ad attribution: remember where a member came from.
--
-- A person clicks an ad, browses, signs up, then pays a week later when
-- the trial ends. Without storing the click, that payment looks like it
-- came from nowhere and the ad gets no credit. These columns keep the
-- trail so the server can report the conversion to the ad platform when
-- the money actually arrives.
--
-- Nothing here is personal data: they're the platforms' own click IDs
-- and the campaign tags we put on our own ad URLs.
--
-- Run in the Supabase SQL Editor (originalbotanica-membership project).

alter table public.profiles
  add column if not exists attribution jsonb,
  add column if not exists attributed_at timestamptz;

comment on column public.profiles.attribution is
  'Ad click IDs (fbclid/ttclid/gclid), UTM tags, landing page and referrer captured on the visit that led to signup.';

-- Google Ads conversions are logged here at the moment they happen.
-- Meta and TikTok take a simple token, but Google's upload needs full
-- OAuth against the Ads API; until that's wired, these rows can be
-- exported and uploaded in bulk (Google Ads → Tools → Conversions →
-- Uploads) so no conversion is ever lost in the meantime.
create table if not exists public.google_ads_conversions (
  id uuid primary key default gen_random_uuid(),
  gclid text not null,
  event text not null,
  event_id text,
  value numeric,
  currency text default 'USD',
  occurred_at timestamptz not null default now(),
  uploaded_at timestamptz
);

create index if not exists google_ads_conversions_pending_idx
  on public.google_ads_conversions (occurred_at)
  where uploaded_at is null;

alter table public.google_ads_conversions enable row level security;
-- No policies: service role only (nothing in the app reads this).
