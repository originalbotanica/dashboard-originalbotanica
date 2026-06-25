import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/lib/email";
import { trialReminderEmail } from "@/lib/trial-emails";
import { formatLongDate } from "@/lib/gift";

/**
 * Trial-ending reminders.
 *
 * Once a day the cron calls sendDueTrialReminders(). For every member whose
 * free trial ends within the next ~36 hours and who hasn't already been
 * reminded, we email them so the first charge is never a surprise (this is the
 * promise made on the /subscribe page). We stamp `trial_reminder_sent_at` so
 * nobody is emailed twice, and we skip members who have already canceled
 * (cancel_at_period_end) since they won't be charged.
 */

// How far ahead to look. Daily cron + 36h window means everyone ending within
// a day gets exactly one reminder, and nobody slips through between runs.
const LOOKAHEAD_MS = 36 * 60 * 60 * 1000;

type TrialRow = {
  user_id: string;
  plan: string | null;
  trial_end: string | null;
};

async function emailForUser(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data?.user?.email) {
    if (error) console.error("trial reminder: getUserById error", userId, error);
    return null;
  }
  return data.user.email;
}

async function firstNameForUser(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("first_name")
    .eq("id", userId)
    .maybeSingle();
  return (data as { first_name?: string | null } | null)?.first_name ?? null;
}

export async function sendDueTrialReminders(): Promise<number> {
  const admin = createAdminClient();
  const now = Date.now();
  const cutoffISO = new Date(now + LOOKAHEAD_MS).toISOString();
  const nowISO = new Date(now).toISOString();

  const { data: rows, error } = await admin
    .from("subscriptions")
    .select("user_id, plan, trial_end")
    .eq("status", "trialing")
    .eq("cancel_at_period_end", false)
    .is("trial_reminder_sent_at", null)
    .gt("trial_end", nowISO)
    .lte("trial_end", cutoffISO);

  if (error || !rows) {
    if (error) console.error("sendDueTrialReminders query error:", error);
    return 0;
  }

  let sent = 0;
  for (const row of rows as TrialRow[]) {
    if (!row.trial_end) continue;
    const email = await emailForUser(row.user_id);
    if (!email) continue;

    const firstName = await firstNameForUser(row.user_id);
    const { subject, html } = trialReminderEmail({
      firstName,
      endDateLabel: formatLongDate(new Date(row.trial_end)),
      plan: row.plan,
    });

    const res = await sendEmail({ to: email, subject, html });
    // A skipped send (Resend not configured yet) still gets stamped so we don't
    // pile up retries; once Resend is live, new trials will be reminded.
    if (res.ok || res.skipped) {
      await admin
        .from("subscriptions")
        .update({ trial_reminder_sent_at: new Date().toISOString() })
        .eq("user_id", row.user_id);
      if (res.ok) sent++;
    }
  }
  return sent;
}
