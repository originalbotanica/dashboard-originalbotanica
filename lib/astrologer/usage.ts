import { createServerClient } from "@supabase/ssr";

/**
 * Daily soft cap on AI Astrologer messages per user.
 * The cap is invisible until hit; we let users know with a warm
 * message rather than a hard wall.
 *
 * Cap is intentionally high — only pathological usage triggers it.
 * Margin protection, not a real product constraint.
 */

export const DAILY_MESSAGE_CAP = 100;

function serviceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns true if user is under the cap. */
export async function checkUsageWithinCap(userId: string): Promise<{
  withinCap: boolean;
  count: number;
}> {
  const supabase = serviceRoleClient();
  const { data } = await supabase
    .from("astrologer_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("usage_date", today())
    .maybeSingle();
  const count = data?.message_count ?? 0;
  return { withinCap: count < DAILY_MESSAGE_CAP, count };
}

/** Increment today's usage count for the user. */
export async function incrementUsage(userId: string): Promise<void> {
  const supabase = serviceRoleClient();
  const date = today();

  // Try update first; insert if no row.
  const { data: existing } = await supabase
    .from("astrologer_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("usage_date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("astrologer_usage")
      .update({ message_count: existing.message_count + 1 })
      .eq("user_id", userId)
      .eq("usage_date", date);
  } else {
    await supabase
      .from("astrologer_usage")
      .insert({ user_id: userId, usage_date: date, message_count: 1 });
  }
}
