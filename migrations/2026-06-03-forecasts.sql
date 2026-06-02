-- Monthly Forecast cache — Phase 2 Part 2.
--
-- One row per (user, month). The first time a member opens the
-- forecast page in a given month, the row is generated and persisted.
-- Subsequent visits in the same month return the cached forecast.
-- Next month, a fresh forecast is generated.

create table if not exists public.forecasts (
  user_id                   uuid not null references auth.users(id) on delete cascade,
  month                     text not null,  -- 'YYYY-MM'
  content                   jsonb not null,
  generated_at              timestamptz not null default now(),
  retrieved_product_slugs   jsonb default '[]'::jsonb,
  retrieved_sources         jsonb default '[]'::jsonb,
  primary key (user_id, month)
);

create index if not exists forecasts_user_idx
  on public.forecasts(user_id, month desc);

-- RLS
alter table public.forecasts enable row level security;

drop policy if exists "forecasts_select_own" on public.forecasts;
create policy "forecasts_select_own" on public.forecasts
  for select using (auth.uid() = user_id);

-- Writes go through service role (server-only) since generation also
-- needs to bypass RLS to write to the cache.
