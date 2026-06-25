-- Trial-ending reminder support.
--
-- Adds a timestamp we stamp once we've emailed a member that their free trial
-- is about to end, so the daily reminder cron never sends the same person two
-- reminders. Safe to run once; uses "if not exists".

alter table public.subscriptions
  add column if not exists trial_reminder_sent_at timestamptz;
