# Gift a Membership — setup & how it works

This feature lets anyone buy a prepaid, fixed-term membership for someone else.
The **code** ships in this commit; a few **configuration** steps are needed to
turn it fully on. None require code changes.

## What was built

- **/gift** — public purchase page (3 / 6 / 12 months at $69 / $129 / $199), with
  recipient name + email, your email, a personal message, and an optional
  "send on" date.
- **/api/gift/checkout** — creates a one-time Stripe Checkout payment (no
  subscription, nothing auto-renews) and records the gift with a unique code
  (`OB-GIFT-XXXX-XXXX`).
- **Stripe webhook** — on payment, marks the gift paid, emails the recipient
  (and a copy to the buyer). Scheduled gifts wait for their date.
- **/gift/success** — confirmation page showing the code.
- **/redeem** — recipient enters the code (creating a free account if needed);
  membership is granted by setting `profiles.gift_member_until`.
- **Access** — the central membership check (`lib/subscription.ts`) and the
  rituals access policy both honor an unexpired gift, so every tool opens
  automatically. No card required for the recipient.
- **/api/gift/deliver-due** — a daily cron (see `vercel.json`) that sends
  scheduled, future-dated gifts when their date arrives.
- **Account page** shows gift members "Gift membership — active … through {date}"
  and a "continue your membership" path for when it ends.
- **Footer** has a "Gift a membership" link.

## Setup steps (one time)

### 1. Apply the database migration  ← REQUIRED
The feature needs a new table and column. In **Supabase → SQL Editor**, paste the
contents of `migrations/2026-06-22-gifts.sql` and click **Run**. (Safe to run
once; it uses `if not exists`.)

### 2. Turn on email (Resend)  ← REQUIRED for the gift emails
Set these environment variables in **Vercel → Project → Settings → Environment
Variables** (and in `.env.local` for local testing):

- `RESEND_API_KEY` — from resend.com
- `EMAIL_FROM` — e.g. `Original Botanica <gifts@originalbotanica.com>`
  (the domain must be verified in Resend)

Until this is set, purchase + redeem still work and the code is shown on the
success page — only the emails are skipped.

### 3. Scheduled delivery (cron)
`vercel.json` registers a daily job at 13:00 UTC that delivers any gifts whose
"send on" date has arrived. Vercel runs this automatically once deployed. To run
it manually you can set an optional `CRON_SECRET` env var and call the endpoint
with `Authorization: Bearer <CRON_SECRET>`.

### 4. Stripe
No new products or prices needed — gifts use a one-time dynamic price. Confirm
the existing webhook is subscribed to `checkout.session.completed` (it already is).

## How to test

1. With Stripe in **test mode**, go to `/gift`, choose a term, enter your own
   email as both buyer and recipient, and check out with test card
   `4242 4242 4242 4242` (any future expiry / any CVC).
2. You'll land on `/gift/success` with a code. If Resend is on, you'll also get
   the two emails.
3. Sign in (or create an account), go to `/redeem`, enter the code, and redeem.
4. Confirm `/account` shows **Gift membership — active** with an end date, and
   that the member tools are unlocked.

## Pricing — where to change it
`lib/gift.ts` → `GIFT_TERMS`. Edit the months/amounts there; everything else
(checkout, copy, emails) follows automatically.
