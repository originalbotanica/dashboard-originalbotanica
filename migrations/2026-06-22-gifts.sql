-- ─────────────────────────────────────────────────────────────────────────────
-- Original Botanica Membership — Gift a Membership
-- Date: 2026-06-22
-- Author: Jason + Claude
--
-- Adds prepaid, fixed-term gift memberships. A buyer (who need not have an
-- account) purchases a 3/6/12-month gift via a ONE-TIME Stripe payment. That
-- mints a redemption code. The recipient redeems it on /redeem, which grants
-- them membership access until `profiles.gift_member_until`.
--
-- Access everywhere keys on lib/subscription.ts -> isActive, which now treats a
-- future gift_member_until as active. The rituals RLS policy is widened to
-- honor gift access too (it was the one policy gating on `subscriptions`).
--
-- Run this in the Supabase SQL editor against the membership database.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── gift_purchases ───────────────────────────────────────────────────────────
create table if not exists public.gift_purchases (
  id                          uuid primary key default gen_random_uuid(),
  code                        text unique not null,
  term_months                 int  not null check (term_months in (3, 6, 12)),
  amount_cents                int  not null,
  currency                    text not null default 'usd',

  purchaser_email             text not null,
  purchaser_user_id           uuid references auth.users(id) on delete set null,
  recipient_name              text,
  recipient_email             text,
  gift_message                text,
  deliver_on                  date,   -- null / today / past => deliver on payment

  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text,

  status                      text not null default 'pending'
                                check (status in ('pending', 'paid', 'redeemed', 'refunded', 'canceled')),
  delivered_at                timestamptz,
  redeemed_by_user_id         uuid references auth.users(id) on delete set null,
  redeemed_at                 timestamptz,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists gift_purchases_status_idx    on public.gift_purchases(status);
create index if not exists gift_purchases_recipient_idx on public.gift_purchases(recipient_email);
create index if not exists gift_purchases_deliver_idx
  on public.gift_purchases(deliver_on)
  where status = 'paid' and delivered_at is null;

-- All access to gifts is via the service role (server code): buyers may be
-- anonymous, and redemption is validated server-side. No public policies.
alter table public.gift_purchases enable row level security;

-- ── gift entitlement on the recipient's profile ──────────────────────────────
alter table public.profiles
  add column if not exists gift_member_until timestamptz;

create index if not exists profiles_gift_until_idx
  on public.profiles(gift_member_until)
  where gift_member_until is not null;

-- ── widen rituals access to include gift members ─────────────────────────────
drop policy if exists "rituals_select_published_for_members" on public.rituals;
create policy "rituals_select_published_for_members"
  on public.rituals for select
  using (
    published_at is not null
    and (
      exists (
        select 1 from public.subscriptions s
        where s.user_id = auth.uid()
          and s.status in ('active', 'trialing')
      )
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.gift_member_until is not null
          and p.gift_member_until > now()
      )
    )
  );
