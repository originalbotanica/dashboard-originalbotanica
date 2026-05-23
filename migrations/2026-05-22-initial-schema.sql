-- ─────────────────────────────────────────────────────────────────────────────
-- Original Botanica Membership Dashboard — initial schema
-- Date: 2026-05-22
-- Author: Jason + Claude
--
-- Run this against a NEW, EMPTY Supabase project. Not safe to run against
-- existing astrology or ancestors databases (different table shapes).
--
-- The model:
--   profiles               One row per authenticated user. Holds the few
--                          fields we need across tools (display name,
--                          locale, birth chart inputs, etc.)
--   subscriptions          One row per user. Mirrors Stripe state via webhook.
--                          A user has AT MOST one subscription at a time.
--   entitlements           Per-tool access grants. In V1 everyone with an
--                          active sub gets all tools, but this table exists
--                          so we can grant comps, tiers, or grandfather
--                          access later without changing the subscription model.
--   member_discounts       Tracks the Craft Commerce customer group sync
--                          (the 10% member discount mechanism).
--   daily_readings         Per-user cache of today's tarot card + astrology
--                          reading, so the dashboard loads instantly.
--   candles                Active candles on a user's virtual altar.
--   ancestors              Memorial entries on a user's ancestor altar.
--   rituals                The rituals library — content rows, public-read.
--   ritual_favorites       Per-user "book of practice" saved rituals.
--   ritual_completions     Per-user log of completed rituals with notes.
--   events                 Append-only analytics log.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";        -- gen_random_uuid()
create extension if not exists "uuid-ossp";

-- ── profiles ───────────────────────────────────────────────────────────────
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  first_name      text,
  last_name       text,
  display_name    text,
  locale          text not null default 'en' check (locale in ('en', 'es')),
  timezone        text,

  -- Birth chart inputs (used by Astrology tool). All nullable — many
  -- users won't have / want to provide a birth time, and that's fine.
  birth_date      date,
  birth_time      time,
  birth_place     text,        -- human-readable city, state, country
  birth_lat       numeric(9,6),
  birth_lon       numeric(9,6),
  birth_tz_offset numeric(4,2),

  -- Cached chart placements so we don't recompute on every page load.
  sun_sign        text,
  moon_sign       text,
  rising_sign     text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_active_at  timestamptz
);

create index profiles_locale_idx on public.profiles(locale);

-- ── subscriptions ──────────────────────────────────────────────────────────
create table public.subscriptions (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id       text unique,
  stripe_subscription_id   text unique,
  stripe_price_id          text,
  plan                     text check (plan in ('monthly', 'annual')),
  status                   text not null,                       -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused'
  trial_end                timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  paused                   boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index subscriptions_status_idx on public.subscriptions(status);

-- ── entitlements ───────────────────────────────────────────────────────────
create table public.entitlements (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  tool          text not null check (tool in ('tarot', 'astrology', 'altar', 'ancestors', 'rituals', 'shop_discount')),
  granted_via   text not null check (granted_via in ('subscription', 'comp', 'legacy', 'admin')),
  granted_at    timestamptz not null default now(),
  expires_at    timestamptz,
  notes         text,
  unique (user_id, tool)
);

create index entitlements_user_idx on public.entitlements(user_id);

-- ── member_discounts ───────────────────────────────────────────────────────
create table public.member_discounts (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  craft_customer_id    text,                  -- Craft Commerce customer ID once linked
  in_member_group      boolean not null default false,
  percent_off          int not null default 10,
  synced_at            timestamptz,
  last_sync_error      text
);

-- ── daily_readings ─────────────────────────────────────────────────────────
create table public.daily_readings (
  user_id              uuid not null references auth.users(id) on delete cascade,
  reading_date         date not null,
  tarot_card_id        text,
  tarot_orientation    text check (tarot_orientation in ('upright', 'reversed')),
  tarot_reading        text,
  astrology_summary    text,
  astrology_payload    jsonb,
  generated_at         timestamptz not null default now(),
  primary key (user_id, reading_date)
);

-- ── candles ────────────────────────────────────────────────────────────────
create table public.candles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  candle_type      text not null,            -- 'seven_day_plain', 'orisha', 'saint', etc.
  candle_color     text,
  intention        text not null,
  petition         text,
  lit_at           timestamptz not null default now(),
  expires_at       timestamptz,              -- when the virtual candle "burns out"
  is_public        boolean not null default false,
  archived_at      timestamptz
);

create index candles_user_idx on public.candles(user_id);
create index candles_public_idx on public.candles(is_public) where is_public = true;

-- ── ancestors ──────────────────────────────────────────────────────────────
create table public.ancestors (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  relation         text,                     -- "Grandmother", "Father", etc.
  birth_date       date,
  death_date       date,
  dedication       text,
  photo_url        text,
  flame_lit        boolean not null default true,
  added_at         timestamptz not null default now()
);

create index ancestors_user_idx on public.ancestors(user_id);

-- ── rituals (the library) ──────────────────────────────────────────────────
create table public.rituals (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  title_en           text not null,
  title_es           text,
  body_en            text not null,
  body_es            text,
  intention          text not null check (intention in (
                       'love', 'money', 'protection', 'cleansing',
                       'road_opening', 'healing', 'justice', 'banishing',
                       'reconciliation', 'ancestor_work', 'spirit_work'
                     )),
  tradition          text not null check (tradition in (
                       'lucumi', 'espiritismo', 'hoodoo', 'folk_catholic', 'general'
                     )),
  difficulty         text not null check (difficulty in ('simple', 'moderate', 'advanced')),
  duration_minutes   int,
  best_day_of_week   int,                      -- 0=Sunday .. 6=Saturday, null=any
  best_moon_phase    text,                     -- 'new', 'waxing', 'full', 'waning', null
  materials          jsonb not null default '[]',  -- [{name, sku_url, sku_id}, ...]
  warnings           text,
  source_credit      text,
  published_at       timestamptz,
  updated_at         timestamptz not null default now()
);

create index rituals_intention_idx on public.rituals(intention);
create index rituals_tradition_idx on public.rituals(tradition);
create index rituals_published_idx on public.rituals(published_at) where published_at is not null;

-- ── ritual_favorites ───────────────────────────────────────────────────────
create table public.ritual_favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  ritual_id  uuid not null references public.rituals(id) on delete cascade,
  saved_at   timestamptz not null default now(),
  primary key (user_id, ritual_id)
);

-- ── ritual_completions ─────────────────────────────────────────────────────
create table public.ritual_completions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  ritual_id     uuid not null references public.rituals(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  notes         text,
  outcome_note  text                          -- "did it work?" — for personal tracking
);

create index ritual_completions_user_idx on public.ritual_completions(user_id);

-- ── events (analytics) ─────────────────────────────────────────────────────
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  tool         text,
  event_type   text not null,
  payload      jsonb,
  occurred_at  timestamptz not null default now()
);

create index events_user_time_idx on public.events(user_id, occurred_at desc);
create index events_type_idx on public.events(event_type);


-- ═══════════════════════════════════════════════════════════════════════════
-- Row-Level Security
-- ═══════════════════════════════════════════════════════════════════════════
-- The pattern:
--   * USER tables — the user can only read/write their own rows.
--   * SHARED tables (rituals) — all authenticated users can read; only the
--     service role can write (via the admin client in server code).
--   * PUBLIC reads (community altar, ancestor altar) — even anonymous
--     visitors can read rows where is_public = true.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles            enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.entitlements        enable row level security;
alter table public.member_discounts    enable row level security;
alter table public.daily_readings      enable row level security;
alter table public.candles             enable row level security;
alter table public.ancestors           enable row level security;
alter table public.rituals             enable row level security;
alter table public.ritual_favorites    enable row level security;
alter table public.ritual_completions  enable row level security;
alter table public.events              enable row level security;

-- profiles: each user manages their own row.
create policy "profiles_select_own"  on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own"  on public.profiles for insert with check (auth.uid() = id);

-- subscriptions: user can read their own. Writes happen via the service
-- role (Stripe webhook handler), bypassing RLS.
create policy "subs_select_own"      on public.subscriptions for select using (auth.uid() = user_id);

-- entitlements: same pattern as subscriptions — read-only for the user.
create policy "ents_select_own"      on public.entitlements for select using (auth.uid() = user_id);

-- member_discounts: read-only for the user. Service role writes.
create policy "discounts_select_own" on public.member_discounts for select using (auth.uid() = user_id);

-- daily_readings: user can read + write their own cached readings.
create policy "readings_select_own"  on public.daily_readings for select using (auth.uid() = user_id);
create policy "readings_insert_own"  on public.daily_readings for insert with check (auth.uid() = user_id);
create policy "readings_update_own"  on public.daily_readings for update using (auth.uid() = user_id);

-- candles: user manages their own. Plus public read for is_public rows
-- so the community altar surface can render anonymously.
create policy "candles_select_own_or_public"
  on public.candles for select
  using (auth.uid() = user_id or is_public = true);
create policy "candles_modify_own"
  on public.candles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ancestors: user manages their own.
create policy "ancestors_select_own" on public.ancestors for select using (auth.uid() = user_id);
create policy "ancestors_modify_own" on public.ancestors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- rituals: all authenticated members can read published rituals.
-- Writes only via service role (admin tooling / content team).
create policy "rituals_select_published_for_members"
  on public.rituals for select
  using (
    published_at is not null
    and exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid()
        and s.status in ('active', 'trialing')
    )
  );

-- ritual_favorites: user manages their own.
create policy "fav_modify_own" on public.ritual_favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ritual_completions: user manages their own.
create policy "comp_modify_own" on public.ritual_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- events: write-only from server (service role). User can read their own.
create policy "events_select_own" on public.events for select using (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- Auto-create a profile row whenever a new auth.user is created.
-- This means client code never has to "create my profile" — the trigger
-- guarantees there's always a profile row to read.
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
