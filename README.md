# Original Botanica Membership Dashboard

The unified spiritual membership platform for Original Botanica — one login, one subscription, one coherent experience across five spiritual tools.

**Site:** members.originalbotanica.com (not yet deployed)
**Status:** Phase 0 — foundation scaffolding

## What this is

A subscription-based spiritual dashboard for Original Botanica subscribers. Members pay $24.99/mo (or $199/yr with 33% savings) for:

1. **Daily Tarot** — daily card pull, spreads, AI interpretation, journaling
2. **Astrology** — birth chart, daily horoscope, monthly forecast, AI astrologer chat, compatibility, specialized reports
3. **Virtual Altar** — candle lighting for intentions, multiple candle types, petition writing
4. **Ancestors** — perpetual memorial flames, ofrenda, anniversary honoring
5. **Rituals Library** — 200+ rituals from 66 years of Original Botanica practice, organized by intention and tradition

Members also get **10% off everything at originalbotanica.com**, applied automatically at checkout via the Craft Commerce customer group sync.

## Tech stack

Matches the patterns established in the existing astrology and ancestors codebases:

- **Next.js 16** (App Router) — React 19
- **TypeScript**
- **Tailwind CSS 4** — design tokens in `app/globals.css` via `@theme inline`
- **Supabase** — auth + Postgres + Storage, modern SSR pattern via `@supabase/ssr`
- **Stripe** — single bundle product, two prices (monthly + annual), 7-day free trial
- **Anthropic Claude** — AI features across tools (model: `claude-sonnet-4-5`)
- **AstrologyAPI.com** — natal chart calculations
- **Resend** — transactional email
- **Vercel** — hosting + analytics + speed insights

## Design language

Inherited from the ancestors + astrology sites. Dark, reverent, candlelit:

- Deep warm-brown background (`#14100b`) with subtle radial amber glow
- Cream serif headlines (Lora)
- Sans-serif body + nav, tracked uppercase (Inter)
- Warm amber-peach primary accent (`#e8ac7c`) for pill CTAs
- Red sublabel beneath the Original Botanica cartouche logo

The comment in the original astrology `globals.css` is the brief: *"Reverent and atmospheric — botanica heritage, not generic-cosmic purple."*

## Bilingual (English + Spanish)

UI chrome is bilingual from day one. Content (rituals library, AI prompts) launches in English with Spanish translations rolling out across the first 60–90 days post-launch.

## Project structure

```
app/                      Next.js App Router pages
  layout.tsx              Root layout (fonts, metadata, analytics)
  globals.css             Design tokens + Tailwind 4 setup
  page.tsx                Marketing homepage (logged out)
  dashboard/              Member-only routes (gated by middleware)
  api/                    Route handlers (Stripe webhook, etc.)
components/               Shared React components
i18n/                     Locale dictionaries + language helpers
lib/                      Domain logic (Stripe, subscription, entitlements)
utils/supabase/           Supabase SSR clients (browser, server, middleware)
migrations/               Versioned Postgres migration SQL
public/                   Static assets (logo, candle imagery)
middleware.ts             Top-level Next.js middleware for auth gating
```

## Local development

```bash
pnpm install              # or npm install
cp .env.example .env.local
# fill in Supabase, Stripe, Anthropic, AstrologyAPI, Resend keys
pnpm dev                  # localhost:3000
```

## Environment variables

See `.env.example` for the full list. The minimum to boot the app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_ANNUAL`
- `STRIPE_WEBHOOK_SECRET`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Isolation from existing sites

This project is fully isolated from the existing `ancestors-originalbotanica` and `astrology-originalbotanica` codebases. It uses a separate Supabase project, separate Stripe products, separate Vercel deployment, and separate environment variables. Patterns and components were lifted from those repos at fork time; ongoing changes here do not affect them.

## Build phases

See `tasks` in Cowork for the live phase tracker.

- **Phase 0** — Foundation (repo, auth, Supabase, Stripe, design system) — *in progress*
- **Phase 1** — Dashboard shell + Altar tool
- **Phase 2** — Astrology + Tarot
- **Phase 3** — Ancestors + Rituals Library
- **Phase 4** — Content production + polish
- **Phase 5** — Pre-launch hardening + launch

Target launch: ~9 months from May 2026 (timeline accelerated from initial 12-month estimate due to substantial reuse from the astrology codebase).
