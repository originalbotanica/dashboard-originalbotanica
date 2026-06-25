# Trial-ending reminder — setup & how it works

The `/subscribe` page now promises: *"We'll email you before your trial ends, so
nothing is a surprise."* This is the email that keeps that promise. The **code**
ships in this commit; two small **configuration** steps turn it fully on.

## What was built

- **`/subscribe`** — the "won't be charged" reassurance is now larger and sits
  right under the plan buttons, with a second line about the reminder email.
- **`lib/trial-emails.ts`** — the reminder email (warm, in our voice; same cream
  / terracotta look as the gift emails). Leads with the exact end date, explains
  the first charge, and links to Manage your membership.
- **`lib/trial-reminder.ts`** — finds every member whose trial ends within the
  next ~36 hours, hasn't already been reminded, and hasn't canceled, then emails
  them and stamps `trial_reminder_sent_at` so nobody is emailed twice.
- **`/api/trial/remind-due`** — a daily cron (see `vercel.json`, 14:00 UTC) that
  runs the above.

## Setup steps (one time)

### 1. Apply the database migration  ← REQUIRED
In **Supabase → SQL Editor**, paste the contents of
`migrations/2026-06-25-trial-reminder.sql` and click **Run**. (Adds one column,
`subscriptions.trial_reminder_sent_at`; safe to run once — uses `if not exists`.)

### 2. Email (Resend)  ← shares the gift setup
Uses the same `RESEND_API_KEY` / `EMAIL_FROM` as the gift emails. If those are
already set (see `GIFT-MEMBERSHIP-SETUP.md`), nothing more is needed. Until
Resend is configured, the cron runs harmlessly and logs that sends were skipped.

### 3. Cron — automatic
`vercel.json` registers the daily job; Vercel runs it once deployed. To run it
by hand, set `CRON_SECRET` and call the endpoint with
`Authorization: Bearer <CRON_SECRET>`.

## Notes
- **Timing:** with a daily run and a 36-hour look-ahead, every trial gets exactly
  one reminder roughly a day before it ends — and nobody slips through between
  runs. The email always names the real end date, so it reads correctly even if
  it lands a few hours early.
- **Canceled trials are skipped** — if someone has already turned off auto-renew
  during the trial, they won't be charged, so we don't send the reminder.
- **Stripe's built-in trial reminder** fires ~7 days before a trial ends, which
  for a 7-day trial would land on signup day — that's why we send our own.
