-- Astrology tool tables — Phase 2 Part 1
--
-- Adds the storage layer for:
--   1. Cached natal chart data on profiles (computed once per user)
--   2. AI Astrologer conversation threads and messages
--   3. Daily soft-cap usage tracking for the astrologer
--   4. Daily horoscope cache (one entry per sign per day)
--
-- Run from Supabase SQL editor. All tables use RLS. Members can only
-- read/write their own data; daily_horoscopes are world-readable
-- (so even public marketing pages can show the daily reading).

-- ── profiles: add chart cache columns ──────────────────────────────────────
alter table public.profiles
  add column if not exists chart_data         jsonb,
  add column if not exists chart_generated_at timestamptz;

-- ── astrologer_threads ─────────────────────────────────────────────────────
-- One thread per ongoing conversation. In Part 1 we keep a single rolling
-- thread per user; multi-thread comes later if needed.
create table if not exists public.astrologer_threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'Your reading',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists astrologer_threads_user_idx
  on public.astrologer_threads(user_id, created_at desc);

-- ── astrologer_messages ────────────────────────────────────────────────────
create table if not exists public.astrologer_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.astrologer_threads(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists astrologer_messages_thread_idx
  on public.astrologer_messages(thread_id, created_at);
create index if not exists astrologer_messages_user_idx
  on public.astrologer_messages(user_id, created_at desc);

-- ── astrologer_usage ───────────────────────────────────────────────────────
-- Daily soft cap (DAILY_MESSAGE_CAP in lib code). One row per user per day.
create table if not exists public.astrologer_usage (
  user_id        uuid not null references auth.users(id) on delete cascade,
  usage_date     date not null,
  message_count  integer not null default 0,
  updated_at     timestamptz not null default now(),
  primary key (user_id, usage_date)
);

-- ── daily_horoscopes ───────────────────────────────────────────────────────
-- One row per (sign, date). Cached so the first viewer of a sign on a
-- given day triggers generation; everyone after gets the cached row.
create table if not exists public.daily_horoscopes (
  sign                      text not null,
  date                      date not null,
  content                   jsonb not null,
  generated_at              timestamptz not null default now(),
  retrieved_product_slugs   jsonb default '[]'::jsonb,
  retrieved_sources         jsonb default '[]'::jsonb,
  primary key (sign, date)
);
create index if not exists daily_horoscopes_date_idx
  on public.daily_horoscopes(date desc);

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.astrologer_threads    enable row level security;
alter table public.astrologer_messages   enable row level security;
alter table public.astrologer_usage      enable row level security;
alter table public.daily_horoscopes      enable row level security;

-- Threads: each user manages their own.
drop policy if exists "astrologer_threads_select_own" on public.astrologer_threads;
drop policy if exists "astrologer_threads_insert_own" on public.astrologer_threads;
drop policy if exists "astrologer_threads_update_own" on public.astrologer_threads;
create policy "astrologer_threads_select_own" on public.astrologer_threads
  for select using (auth.uid() = user_id);
create policy "astrologer_threads_insert_own" on public.astrologer_threads
  for insert with check (auth.uid() = user_id);
create policy "astrologer_threads_update_own" on public.astrologer_threads
  for update using (auth.uid() = user_id);

-- Messages: each user reads/writes their own.
drop policy if exists "astrologer_messages_select_own" on public.astrologer_messages;
drop policy if exists "astrologer_messages_insert_own" on public.astrologer_messages;
create policy "astrologer_messages_select_own" on public.astrologer_messages
  for select using (auth.uid() = user_id);
create policy "astrologer_messages_insert_own" on public.astrologer_messages
  for insert with check (auth.uid() = user_id);

-- Usage: read your own. Writes go through service role (server-only).
drop policy if exists "astrologer_usage_select_own" on public.astrologer_usage;
create policy "astrologer_usage_select_own" on public.astrologer_usage
  for select using (auth.uid() = user_id);

-- Daily horoscopes: world-readable. Writes go through service role.
drop policy if exists "daily_horoscopes_select_all" on public.daily_horoscopes;
create policy "daily_horoscopes_select_all" on public.daily_horoscopes
  for select using (true);
