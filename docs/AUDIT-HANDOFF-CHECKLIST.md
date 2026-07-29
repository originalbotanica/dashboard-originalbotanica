# Security & Code Audit — Handoff Checklist

**Project:** The Practice (Original Botanica membership dashboard)
**Prepared:** July 29, 2026
**Owner:** Jason — jason@originalbotanica.com
**Auditor:** _______________________  **Auditor email:** _______________________

> **Read this first.** A code and security audit does **not** need your live
> production secrets. Almost everything below can be handed over as test-mode
> keys plus a scrubbed database copy. Anywhere a live secret is genuinely
> required, it is marked **🔴 ROTATE AFTER** — meaning: share it, then generate a
> replacement the day the audit ends. Items marked **👤 INVITE** need the
> auditor's email address before you can complete them.

---

## 0. Ground rules — set these before sharing anything

- [ ] **Get the auditor's work email address.** Six of the items below are
      "invite this person" actions and cannot be done without it.
- [ ] **Sign an NDA / data processing agreement first.** This app stores
      members' birth data, private dreams, prayer petitions, and ancestor
      names and photos. That is sensitive personal data, and some members are
      EU/UK residents, so a written agreement is the correct starting point.
- [ ] **Never send secrets over email, Slack, or chat.** Use a shared password
      manager vault (1Password / Bitwarden) or a one-time secret link
      (onetimesecret.com). Ask the auditor which they prefer.
- [ ] **Decide the audit environment.** Strongly recommended: the auditor runs
      the app **locally against their own free Supabase project and Stripe test
      mode**, using a scrubbed data dump. That way no live credential leaves
      your control. Only fall back to shared live access if they insist and
      explain why.
- [ ] **Write down the audit end date.** Rotation and access removal both
      happen on that date. Put a calendar reminder on it now.

---

## 1. Source code

**Where it lives:** GitHub — `github.com/originalbotanica/dashboard-originalbotanica`
(private). Active branch `main`. Also on this Mac at
`~/Documents/GitHub/dashboard-originalbotanica`.

- [ ] **👤 INVITE — add the auditor as a GitHub collaborator (read-only).**
      Repo → Settings → Collaborators → Add people → choose **Read** role.
      Needs their email or GitHub username. Read access is enough for an audit;
      do not grant Write or Admin.
- [ ] Confirm which branches they should look at. `main` is the launch
      candidate. There are also `landing-jimmy`,
      `snapshot-pre-dashboard-redesign`, `snapshot-pre-offerings`, and
      `landing-rebuild` / `tarot-wheel-preview` on the remote — tell them
      those are historical and out of scope, or they will audit dead code.
- [ ] Tell them to clone with **full history** (`git clone` default). Good news:
      I scanned every commit in the repo's history and found **no `.env` file
      and no live key patterns ever committed** — only `.env.example`, which
      holds descriptions and no values. The history is safe to share as-is.

### Files a plain zip or GitHub download would miss

If you zip the folder instead of using GitHub, these are excluded by
`.gitignore` and must be handled deliberately:

- [ ] `.env.local` — **🔴 contains four live secrets** (see §3). Do **not** put
      this in the zip. Send a sanitized version with test values instead.
- [ ] `.vercel/` — local link to the Vercel project (project + org IDs, no
      secrets). Not needed by the auditor; safe to omit.
- [ ] `node_modules/`, `.next/`, `tsconfig.tsbuildinfo` — build artifacts. Omit;
      the auditor regenerates them with `npm install`.
- [ ] `public/` (40 MB of imagery) **is** tracked in git, so it comes with the
      clone. If you zip, use `git archive HEAD -o handoff.zip` rather than a
      Finder zip — it captures exactly the tracked files and skips junk.

---

## 2. Database

**What it is:** a single PostgreSQL database hosted on **Supabase** (managed
Postgres). Project reference `beeayiskwueqnugithaw`, region per the Supabase
dashboard. There is no second database; there is no self-hosted server.

**What is in it:** 24+ tables including `profiles` (names, birth date, birth
time, birth place), `dream_threads` / `dream_messages` (members' dreams and the
AI's interpretations), `candles` (prayer petitions and dedications),
`ancestors` (deceased relatives' names, relationships, uploaded photos),
`subscriptions`, `gift_purchases`, and `member_feedback`.

- [ ] **⚠️ Do not hand over live production database credentials.** That data is
      the most sensitive thing in the project. Provide a **scrubbed dump**
      instead — see the next item.
- [ ] **Produce a sanitized schema + data dump for the auditor.** In the
      Supabase dashboard: Database → Backups, or run `pg_dump`. Ask them
      whether they want (a) **schema only** — usually sufficient for a security
      audit, since RLS policies, constraints, and column types are what matter,
      or (b) schema plus **anonymized** rows. If (b), the personal columns
      listed above must be replaced with fake values before sharing. Flag this
      to me and I can write the anonymization script.
- [ ] **⚠️ The `migrations/` folder alone will NOT rebuild the database.** Three
      tables in production — `candle_tendings`, `chart_readings`, and
      `redeem_attempts` — have no migration file; they were created by running
      SQL directly in the Supabase SQL editor. A `pg_dump --schema-only` is
      therefore the only complete picture. Give them the dump *and* the
      migrations folder, and mention this gap; an auditor will likely and
      correctly call it out as a process finding.
- [ ] **If (and only if) they need live read access:** **👤 INVITE** them to the
      Supabase project as a **Read-only / Developer** member — Supabase
      Dashboard → Organization → Team → Invite. This avoids handing over a
      connection string. Requires their email.
- [ ] **If they insist on a direct connection string** (host, port 5432,
      database `postgres`, user, password), get it from Supabase → Project
      Settings → Database. **🔴 ROTATE AFTER** — that password grants full
      read/write to all member data. Reset it in the same screen when the audit
      ends. Prefer creating a dedicated read-only Postgres role for them over
      sharing the main `postgres` password.
- [ ] Note for them: **Row Level Security is enabled on 26 tables** across 10
      migration files. RLS correctness is the highest-value thing for them to
      review — say so explicitly in the scope.

---

## 3. API keys and secrets — complete inventory

Every secret the app uses, where it lives, and where to regenerate it. **None of
these values are written in this document on purpose.** Live values are in
Vercel (production) and in `.env.local` on this Mac (local development).

| # | Variable | Service | Where to find / regenerate | Sensitivity |
|---|----------|---------|---------------------------|-------------|
| 1 | `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Dashboard → Project Settings → API → service_role | **🔴 CRITICAL — bypasses all RLS. Rotate after.** |
| 2 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Same screen → anon/publishable | Public by design (ships to the browser). No rotation needed. |
| 3 | `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Same screen | Public. Not a secret. |
| 4 | `STRIPE_SECRET_KEY` | Stripe | Dashboard → Developers → API keys | **🔴 CRITICAL — can move money. Give them a *test-mode* key (`sk_test_…`) instead. Rotate if a live key is ever shared.** |
| 5 | `STRIPE_WEBHOOK_SECRET` | Stripe | Dashboard → Developers → Webhooks → the endpoint → signing secret | **🔴 Rotate after.** Test-mode equivalent is fine for the audit. |
| 6 | `STRIPE_PRICE_MONTHLY` | Stripe | Dashboard → Products → the $29.95/mo price | Identifier, not a secret. |
| 7 | `STRIPE_PRICE_ANNUAL` | Stripe | Dashboard → Products → annual price | Identifier, not a secret. |
| 8 | `ANTHROPIC_API_KEY` | Anthropic (Claude) | console.anthropic.com → API Keys | **🔴 Billable. Rotate after.** Better: create a separate key with a low spend cap just for them. |
| 9 | `VOYAGE_API_KEY` | Voyage AI (embeddings for ritual search) | dash.voyageai.com → API Keys | **🔴 Billable. Rotate after.** |
| 10 | `ASTROLOGY_API_USER_ID` | AstrologyAPI.com | astrologyapi.com dashboard | Paired with #11. |
| 11 | `ASTROLOGY_API_KEY` | AstrologyAPI.com | Same dashboard | **🔴 Billable. Rotate after.** |
| 12 | `RESEND_API_KEY` | Resend (transactional email) | resend.com → API Keys | **🔴 Can send mail as your domain. Rotate after.** |
| 13 | `EMAIL_FROM` | Resend | Your own choice of sender address | Not a secret. |
| 14 | `CRON_SECRET` | Vercel Cron (self-issued) | You generate it: `openssl rand -hex 32` | **🔴 Guards the daily gift-delivery and trial-reminder endpoints. Rotate after.** |
| 15 | `META_CAPI_TOKEN` | Meta / Facebook | Events Manager → the "The Practice" dataset → Settings → generate token | **🔴 Rotate after.** |
| 16 | `NEXT_PUBLIC_META_PIXEL_ID` | Meta | Events Manager | Public by design. |
| 17 | `TIKTOK_ACCESS_TOKEN` | TikTok Ads | TikTok Events Manager | **🔴 Rotate after.** Not yet configured. |
| 18 | `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | TikTok Ads | TikTok Events Manager | Public. Not yet configured. |
| 19 | `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 | GA4 → Admin → Data streams | Public by design. |
| 20 | `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads | Google Ads → conversion setup | Public. Not yet configured. |
| 21 | `NEXT_PUBLIC_SITE_URL` | — | Your own value | Not a secret. |
| 22 | `CRAFT_COMMERCE_MEMBER_WEBHOOK_URL` / `_SECRET` | Craft Commerce (main store) | From Lighthaus Design | **Documented in `.env.example` but not yet used by any code.** Tell the auditor it's a planned integration, not live. |

- [ ] Print or export this table for the auditor **without values**, so they know
      what exists and can review how each is handled in code.
- [ ] Decide which of #1, #4, #5, #8, #9, #11, #12, #14, #15 they actually need.
      For a code audit run locally, most can be their own test keys or left
      blank — the astrology features fall back to mock data when unset, by
      design.
- [ ] **After the audit: rotate every 🔴 item and redeploy.** Order matters —
      update the value in Vercel first, then redeploy, then revoke the old key,
      so there's no gap where the site is broken.

---

## 4. Third-party services and integrations

Everything the app talks to. For each, decide: read-only console invite, or
nothing at all?

- [ ] **Supabase** — database, authentication (email + password), and file
      storage (buckets `ancestor-photos`, `chart-wheels`). Covered in §2.
      **👤 INVITE** if console access is needed.
- [ ] **Stripe** — subscription payments, checkout, customer billing portal,
      gift purchases, and the webhook that activates memberships.
      **👤 INVITE** as a **read-only** team member (Stripe → Settings → Team)
      rather than sharing keys. Note: currently in **test mode**; going live is
      a launch-checklist item.
- [ ] **Anthropic (Claude API)** — the AI astrologer, dream interpretation,
      tarot readings, ritual generation. Console access not required for a code
      audit.
- [ ] **Voyage AI** — text embeddings powering the ritual library search.
- [ ] **AstrologyAPI.com** — natal chart, transit, and compatibility
      calculations.
- [ ] **Resend** — all transactional email (gift delivery, trial reminders).
      **👤 INVITE** if they need to inspect sending domains and DNS records.
- [ ] **Vercel** — hosting, deployment, and cron. See §5.
- [ ] **GitHub** — source control. See §1.
- [ ] **Meta / Facebook (Events Manager)** — conversion pixel + server-side
      Conversions API. Pixel is dedicated to The Practice; the separate store
      pixel must stay untouched.
- [ ] **Google Analytics 4** — site analytics.
- [ ] **TikTok Ads and Google Ads** — code is written and env-gated but **not
      configured yet**. Mention as "present but dormant" so they don't chase it.
- [ ] **CloudFront CDN** (`dlkhclkmyx18n.cloudfront.net`) — serves product
      imagery from the main Original Botanica store. Read-only public asset
      host; the dashboard only links to it. No credentials involved.
- [ ] **Craft Commerce / originalbotanica.com** — the main store, built and run
      by **Lighthaus Design**. Separate system, separate codebase. Out of scope
      for this audit unless you say otherwise — worth stating explicitly in the
      engagement letter so you aren't billed for it.

---

## 5. Hosting and deployment

- [ ] **Platform:** Vercel. Team `originalbotanicas-projects`
      (`team_jnsC7pLAGXPh89WyqzcV0VPk`), project `dashboard-originalbotanica`
      (`prj_qUyLpymVwdrd8hes6bU1UriYXkEB`), Node 24.x, Next.js 16.2.6.
- [ ] **Current URL:** `dashboard-originalbotanica.vercel.app`. Production
      domain `members.originalbotanica.com` is **not yet connected** — that DNS
      cutover is on the launch checklist and is a Lighthaus task.
- [ ] **How deploys happen:** push to `main` on GitHub → Vercel builds and
      deploys to production automatically (~35 seconds). No separate CI/CD
      system, no test suite in the pipeline. Build command `next build`.
      Worth telling the auditor plainly: **there are no automated tests**, and
      they will flag that. It's a fair finding.
- [ ] **Scheduled jobs (`vercel.json`):** `/api/gift/deliver-due` daily at
      13:00 UTC and `/api/trial/remind-due` daily at 14:00 UTC, both
      authenticated with `CRON_SECRET`.
- [ ] **👤 INVITE — add the auditor to the Vercel team** if they need to see
      build logs, env var configuration, or deployment history. Vercel →
      Settings → Members → Invite, role **Viewer** (or Developer if they must
      trigger builds). Requires their email. **Note:** a Vercel member can read
      environment variable *values*, so a Viewer invite effectively exposes
      every 🔴 secret in §3 — plan to rotate afterward either way.
- [ ] No traditional server, VPS, SSH access, Docker, or Kubernetes exists.
      Say so, so they don't ask for infrastructure that isn't there.

---

## 6. Environment variables — plain-English reference

The canonical list lives in `.env.example` in the repo, which is already
commented. Production values are set in Vercel → Project → Settings →
Environment Variables. Locally, only four are set in `.env.local`
(`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`,
`VOYAGE_API_KEY`) because the maintenance scripts are all that run locally.

**Core — the app will not boot or function without these**

- `NEXT_PUBLIC_SUPABASE_URL` — address of the Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser-side database key; every request
  made with it is constrained by Row Level Security.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only admin key that bypasses RLS
  entirely. Used by API routes and maintenance scripts.
- `NEXT_PUBLIC_SITE_URL` — the site's own public address; used for page
  metadata, share links, and Stripe redirect URLs.

**Payments**

- `STRIPE_SECRET_KEY` — authenticates all Stripe API calls.
- `STRIPE_WEBHOOK_SECRET` — verifies that incoming webhook calls genuinely came
  from Stripe rather than an attacker faking a "payment succeeded" event.
- `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` — which Stripe price object to
  charge for each plan.

**AI and readings**

- `ANTHROPIC_API_KEY` — Claude, for the astrologer chat, dream interpretation,
  tarot readings, and ritual generation.
- `VOYAGE_API_KEY` — turns ritual text into embeddings so the library can be
  searched by meaning rather than keyword.
- `ASTROLOGY_API_USER_ID` / `ASTROLOGY_API_KEY` — AstrologyAPI.com credentials
  for chart math. **If unset, astrology falls back to mock data** so the rest of
  the app still runs — useful for the auditor's local setup.

**Email and scheduled work**

- `RESEND_API_KEY` — sends transactional email.
- `EMAIL_FROM` — the From address on those emails.
- `CRON_SECRET` — shared secret proving a cron request came from Vercel. If
  unset in production, both scheduled endpoints return 401 and the daily gift
  and trial emails silently stop.

**Advertising and analytics — all optional; nothing loads until set**

- `NEXT_PUBLIC_META_PIXEL_ID` — Meta browser pixel for The Practice.
- `META_CAPI_TOKEN` — server-side Conversions API token, used to report trials
  and purchases directly from the Stripe webhook.
- `NEXT_PUBLIC_GA4_ID` — Google Analytics 4 measurement ID.
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID` / `TIKTOK_ACCESS_TOKEN` — TikTok, not yet set.
- `NEXT_PUBLIC_GOOGLE_ADS_ID` — Google Ads, not yet set.

**Documented but unused**

- `CRAFT_COMMERCE_MEMBER_WEBHOOK_URL` / `CRAFT_COMMERCE_MEMBER_WEBHOOK_SECRET` —
  planned store discount sync. No code reads them today.

**Developer-machine only — never set in Vercel, not part of the running app**

- `YT_COOKIES_FILE` / `YT_COOKIES_BROWSER` — used by
  `scripts/ingest-youtube.ts`, a one-off content tool that pulls captions from
  Original Botanica's own YouTube videos to build the ritual library. Points at
  a YouTube cookies export or a local browser profile. **🔴 If you have a
  cookies file on this Mac, it authenticates as your Google account — do not
  include it in any handoff package.** Nothing in production reads these.

- [ ] Note one drift to correct: `.env.example` describes the plans as
      "$24.99/mo and $199/yr". The real price is **$29.95/mo**. Fix the comment
      before handoff so the auditor isn't reconciling numbers that don't match.

---

## 7. Admin panels, dashboards, and consoles

Every console tied to this project that you hold a login for. For each: share
read-only access via invite where possible, and **never** share your own
password.

| Console | URL | What it controls | Access to grant |
|---|---|---|---|
| GitHub | github.com/originalbotanica | Source code | **👤 INVITE** — Read |
| Vercel | vercel.com | Hosting, env vars, cron, logs | **👤 INVITE** — Viewer (exposes secrets — see §5) |
| Supabase | supabase.com/dashboard | Database, auth, storage, SQL editor | **👤 INVITE** — Read-only member |
| Stripe | dashboard.stripe.com | Payments, subscriptions, webhooks | **👤 INVITE** — read-only team member |
| Anthropic | console.anthropic.com | Claude API keys, spend | Key only; console not needed |
| Voyage AI | dash.voyageai.com | Embedding API keys | Key only |
| AstrologyAPI | astrologyapi.com | Chart API credentials | Key only |
| Resend | resend.com | Email sending, domain/DNS | **👤 INVITE** if in scope |
| Meta Business | business.facebook.com | Pixel + Conversions API | **👤 INVITE** — limited, Events Manager only. **Do not** grant access to the store pixel `190400753145730`. |
| Google Analytics | analytics.google.com | GA4 property | **👤 INVITE** — Viewer |

- [ ] **No admin panel exists inside the app itself.** There is no `/admin`
      route and no staff login — all administration happens through the Supabase
      dashboard or the `scripts/qa-*.ts` command-line scripts, which run with
      the service-role key. Tell the auditor this; it's relevant to their
      privilege-escalation review.

---

## 8. Worth handing over as context (makes the audit faster and cheaper)

- [ ] `docs/LAUNCH-CHECKLIST.md` — what's still outstanding before go-live, so
      they don't report known gaps as discoveries.
- [ ] `docs/AD-TRACKING-SETUP.md` — how the conversion tracking is wired.
- [ ] `migrations/` — schema history, with the caveat in §2.
- [ ] A one-paragraph scope note. Suggested wording: *"Next.js 16 app on Vercel,
      Supabase Postgres with RLS, Stripe subscriptions, Claude-based AI
      features. Highest-priority review areas: Row Level Security policy
      correctness, the Stripe webhook and subscription-entitlement path, the
      public candle and gift-redemption links, file upload handling, and
      handling of member personal data. Out of scope: originalbotanica.com
      (Craft Commerce, maintained separately)."*

---

## 9. Close-out — do these on the audit end date

- [ ] Remove the auditor from GitHub, Vercel, Supabase, Stripe, Meta, and GA4.
- [ ] Rotate every **🔴** secret in §3, updating Vercel first and redeploying
      before revoking the old values.
- [ ] Generate a fresh `CRON_SECRET` and confirm the two daily jobs still run.
- [ ] If you shared a database password, reset it in Supabase.
- [ ] Delete any dumps, zips, or one-time secret links you created for them.
- [ ] Get the findings report in writing, and have me triage it into fixes.
