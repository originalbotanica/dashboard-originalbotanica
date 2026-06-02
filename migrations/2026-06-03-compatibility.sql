-- Compatibility readings — Phase 2 Part 2B.
--
-- One row per saved reading. The subscriber's chart is read from
-- their profile; the "other" person's chart data is computed at
-- creation time and stored here (so re-displaying the reading later
-- doesn't require re-computing the chart).

create table if not exists public.compatibility_readings (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,

  -- The other person's birth details (entered by the subscriber)
  other_name                text not null,
  other_birth_date          date not null,
  other_birth_time          time,
  other_birth_city          text not null,
  relationship_note         text,

  -- Computed chart data for the other person (jsonb so we don't have
  -- to denormalize every placement)
  other_chart_data          jsonb,

  -- The synastry reading itself (structured JSON)
  content                   jsonb not null,
  generated_at              timestamptz not null default now(),

  -- RAG metadata (populated in 2C)
  retrieved_product_slugs   jsonb default '[]'::jsonb,
  retrieved_sources         jsonb default '[]'::jsonb,

  created_at                timestamptz not null default now()
);

create index if not exists compatibility_readings_user_idx
  on public.compatibility_readings(user_id, created_at desc);

-- RLS
alter table public.compatibility_readings enable row level security;

drop policy if exists "compatibility_readings_select_own" on public.compatibility_readings;
drop policy if exists "compatibility_readings_insert_own" on public.compatibility_readings;
drop policy if exists "compatibility_readings_delete_own" on public.compatibility_readings;
create policy "compatibility_readings_select_own" on public.compatibility_readings
  for select using (auth.uid() = user_id);
create policy "compatibility_readings_insert_own" on public.compatibility_readings
  for insert with check (auth.uid() = user_id);
create policy "compatibility_readings_delete_own" on public.compatibility_readings
  for delete using (auth.uid() = user_id);
