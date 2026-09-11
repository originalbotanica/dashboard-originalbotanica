# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**The Practice** — Original Botanica's $29.95/mo (or $199.95/yr) spiritual membership dashboard, in private-tester phase and heading to launch. Next.js 16 (App Router, React 19) on Vercel, Supabase (Postgres + auth + storage), Stripe subscriptions, Anthropic Claude for readings. Six member tools: Your Astrologer, Tarot Today, Dream Journal, Virtual Altar, Ancestors Altar, Ritual Library — plus spiritual calendar, gift memberships, and full EN/ES bilingual support.

Production domain will be `members.originalbotanica.com`; today it lives at `dashboard-originalbotanica.vercel.app`. Push to `main` → Vercel auto-deploys in ~35s. There is no staging environment.

## Commands

```bash
npm install
npx vercel env pull .env.local   # real env from Vercel; do NOT copy Jason's .env.local — it has only 4 keys
npm run dev                       # localhost:3000

npm run typecheck                 # tsc for app AND scripts (both must pass)
npm run typecheck:app             # app only
npm run typecheck:scripts         # scripts only (uses tsconfig.scripts.json)
npm run lint                      # eslint

npx next build                    # production build
npx tsx scripts/<name>.ts         # run any script in scripts/
npm run refresh-rituals           # content pipeline: RAG ingest + build library + translate
```

No automated test suite exists (known gap). Verification = typecheck + lint + `npx next build` + manual browser test.

## Architecture

**Route structure** — `app/` is the App Router. Public routes: landing (`page.tsx`), `signup`, `login`, `subscribe`, `gift`, `redeem`, `candle/[hash]` (public share pages), `ancestors/*` public memorials. Member-gated routes: `dashboard`, `astrology`, `tarot`, `dreams`, `altar`, `ancestors`, `rituals`, `calendar`, `account`. Gating happens in `middleware.ts` via `updateSession()` from `utils/supabase/middleware.ts`.

**API routes** — `app/api/`. Notable ones: `astrologer/chat` and `dreams/chat` are streaming Claude endpoints; `stripe/{checkout,portal,webhook}` handle billing; `gift/{checkout,deliver-due}` and `trial/remind-due` are cron-driven (see `vercel.json` — daily 13:00 and 14:00 UTC, both require `CRON_SECRET` or 401 silently); `ancestors/upload-photo` handles Supabase Storage uploads; `calendar/ics` serves subscribable ICS feeds.

**Domain logic lives in `lib/`, not in route handlers.** One folder per tool (`altar/`, `astrologer/`, `dreams/`, `rituals/`, `tarot/`, `ancestors/`, `calendar/`, `dashboard/`, `forecast/`, `compatibility/`, `daily-horoscope/`, `daily-tarot/`) plus cross-cutting modules: `stripe.ts`, `subscription.ts`, `entitlements.ts`, `email.ts` (Resend), `gift-*.ts`, `trial-*.ts`, `ads/attribution.ts`, `rag/` (Voyage embeddings for ritual search), `llm/`, `i18n/`, `moderation.ts`, `rate-limit.ts`. `lib/astrology-api.ts` wraps AstrologyAPI.com and is DST-aware — do not casually touch `offsetForZoneAt`.

**Supabase clients** — three variants in `utils/supabase/`, use the right one:
- `client.ts` — browser (RSC client components)
- `server.ts` — server components + route handlers (anon key, respects RLS)
- `middleware.ts` — the middleware refresh flow
- `admin.ts` — service-role key, bypasses RLS, for admin/cron work only

**RLS is on across member tables.** Server-side admin work goes through `SUPABASE_SERVICE_ROLE_KEY`. Storage buckets: `ancestor-photos`, `chart-wheels`, `candle-art`.

**Attribution middleware** — `middleware.ts` also captures ad-click params (fbclid, gclid, etc.) into the `ATTRIBUTION_COOKIE` on first touch. First touch wins — organic visits do not overwrite a prior ad click. Server-side conversions fire from `lib/ads/`.

**Migrations** — `migrations/*.sql`, hand-written, dated `YYYY-MM-DD-name.sql`. There is no migration runner: new SQL is applied by pasting into the Supabase SQL editor. **Three tables (`candle_tendings`, `chart_readings`, `redeem_attempts`) were created in the SQL editor and have no migration file** — rebuilding from the folder alone will be incomplete.

**Design tokens** live in `app/globals.css` via Tailwind 4's `@theme inline`. Voice: reverent, candlelit, botanica heritage — not generic-cosmic purple. Cream serif headlines (Lora), sans body (Inter), warm amber-peach accents on a deep warm-brown (`#14100b`) background.

**Bilingual (EN/ES)** — dictionaries in `i18n/`. UI chrome is fully bilingual; some AI-generated content is EN-only and translating.

## Gotchas

- **Stripe is in test mode.** The live-mode swap (keys, webhook endpoint, price IDs, product description) is choreographed in `docs/LAUNCH-CHECKLIST.md` — do not flip anything unilaterally.
- **Meta pixel `1223585932980843`** ("The Practice") is this site's. Store pixel `190400753145730` belongs to originalbotanica.com — never wire it here.
- `X-Frame-Options: DENY` is global in `next.config.ts` — the app refuses to render in iframes by design.
- Phantom `tsc` errors after macOS file-copy hiccups: delete `.next/types/* [0-9].ts` duplicate files.
- **`scripts/` are real-data tools** — they read `.env.local` and use the service-role key. `qa-*` scripts are the safer read/audit ones; anything else touches production data.
- `components/make-offering.tsx` and `components/altar-offerings.tsx` share an `ALTAR_ORDER` constant — keep them in sync.
- Feedback box kill switch: `FEEDBACK_ENABLED` in `components/feedback-box.tsx`.
- Path alias: `@/*` maps to repo root (see `tsconfig.json`).
- **The store side (originalbotanica.com, 20% member discount wiring) is Lighthaus Design's separate codebase — out of scope from this repo.**
