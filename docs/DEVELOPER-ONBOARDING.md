# Developer Onboarding — The Practice

Internal handoff for launch prep. Everything you need to run, understand, and
deploy this project. Written July 29, 2026.

## What this is

The Practice — Original Botanica's $29.95/mo spiritual membership dashboard.
Next.js 16 (App Router) on Vercel, Supabase (Postgres + auth + storage),
Stripe subscriptions, Claude-powered readings. Live build at
`dashboard-originalbotanica.vercel.app`; production domain will be
`members.originalbotanica.com` (DNS cutover is a launch task — see
`docs/LAUNCH-CHECKLIST.md`).

## Access you need (Jason sends the invites)

| Where | What you get | Invite path |
|---|---|---|
| GitHub `originalbotanica/dashboard-originalbotanica` | Source, full history | Repo → Settings → Collaborators |
| Vercel team `originalbotanicas-projects` | Deploys, logs, **all production env vars** | Team → Settings → Members |
| Supabase project `beeayiskwueqnugithaw` | Database, auth, storage, SQL editor | Org → Team → Invite |
| Stripe (test mode today) | Payments, webhooks, prices | Settings → Team |
| Meta Events Manager — "The Practice" dataset only | Pixel + CAPI | Business Settings → People |
| GA4 property (stream G-8SPEJEE73V) | Analytics | Admin → Property access |

Consoles you do NOT need a login for: Anthropic, Voyage AI, AstrologyAPI,
Resend — their keys are already set in Vercel; you'd only log in to rotate.

## Run it locally

```bash
git clone https://github.com/originalbotanica/dashboard-originalbotanica.git
cd dashboard-originalbotanica
npm install

# Pull the real env straight from Vercel (after you're on the team):
npx vercel link        # pick team originalbotanicas-projects → this project
npx vercel env pull .env.local

npm run dev            # http://localhost:3000
```

`vercel env pull` is the whole secrets handoff — nothing gets emailed around.
If you'd rather run against your own sandbox, copy `.env.example` to
`.env.local` instead; every variable is documented there. AstrologyAPI creds
are optional — astrology falls back to mock data when unset.

Checks: `npm run typecheck` (app + scripts), `npm run lint`,
`npx next build`. There is no automated test suite (known gap).

## How deploys work

Push to `main` → Vercel auto-builds and ships to production in ~35s. There is
no staging environment; branch pushes get Vercel preview URLs. Node 24.x.
Two Vercel cron jobs (see `vercel.json`): gift delivery 13:00 UTC, trial
reminders 14:00 UTC — both need `CRON_SECRET` set or they 401 silently.

## Database — one important gap

Schema lives in `migrations/*.sql` **except three tables** that were created
directly in the Supabase SQL editor and have no migration file:
`candle_tendings`, `chart_readings`, `redeem_attempts`. If you rebuild an
environment from the migrations folder alone it will be incomplete. First
task suggestion: pull a `--schema-only` dump from Supabase and commit the
missing DDL as a migration so the folder is finally the source of truth.

Row Level Security is on across the member tables — server-side admin work
goes through `SUPABASE_SERVICE_ROLE_KEY` (see `utils/supabase/admin.ts`).
Storage buckets: `ancestor-photos` (member uploads), `chart-wheels`
(generated chart images), `candle-art` (burn-stage renders).

## Repo orientation

- `app/` — routes. Member tools: dashboard, astrology (+astrologer chat),
  tarot, dreams, altar, ancestors (+offerings), rituals, calendar, account.
  Public: landing, signup/login, gift + redeem, `candle/[hash]` share pages.
- `app/api/` — astrologer/dream chat streams, Stripe checkout/portal/webhook,
  gift delivery + trial reminder crons, ICS feed, photo upload.
- `lib/` — domain logic: astrology API wrapper (DST-aware — don't touch
  `offsetForZoneAt` casually), RAG ritual search (Voyage embeddings),
  ads/attribution + server-side conversions, email (Resend), i18n EN/ES.
- `components/` — UI. `make-offering.tsx` + `altar-offerings.tsx` carry the
  offering ritual animation; keep their ALTAR_ORDER constants in sync.
- `scripts/` — `npx tsx scripts/<name>.ts`; QA helpers (`qa-*`), content
  pipeline (`rag-ingest`, `build-ritual-library`, `translate-rituals`).
  They read `.env.local` and use the service-role key: real data, be careful.
- `migrations/` — run new SQL in the Supabase SQL editor (no CLI migration
  runner is wired up).
- `docs/LAUNCH-CHECKLIST.md` — **your launch punch list**, including the
  Stripe live-mode swap, DNS cutover, Supabase auth URLs, and the items
  assigned to Lighthaus (the store's agency — separate codebase, out of scope).
- `memory-bank/` note: feedback box kill switch is `FEEDBACK_ENABLED` in
  `components/feedback-box.tsx` — decision pending on keep/kill at launch.

## Gotchas that will bite you

- `.env.local` on Jason's Mac only holds 4 keys (enough for scripts); the
  full set lives in Vercel. Always `vercel env pull`, don't copy his file.
- Stripe is in **test mode**; the live-mode swap (keys, webhook endpoint,
  price IDs, product description) is choreographed in the launch checklist.
- The Meta pixel for this site is `1223585932980843` ("The Practice").
  The store's pixel `190400753145730` belongs to originalbotanica.com — never
  wire it in here.
- `X-Frame-Options: DENY` is set globally in `next.config.ts`; the site will
  refuse to render in iframes by design.
- Deleting `.next/types/* [0-9].ts` duplicate files fixes phantom `tsc`
  errors after macOS file-copy hiccups.
