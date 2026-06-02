import { createServerClient } from "@supabase/ssr";

/**
 * Daily soft cap on Dream Interpreter messages per user.
 * Same pattern and intent as the Astrologer usage tracking: invisible
 * until pathologically high, then a warm message asks them to come back
 * tomorrow.
 */

export const DAILY_DREAM_MESSAGE_CAP = 50;

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

export async function checkDreamUsageWithinCap(userId: string): Promise<{
  withinCap: boolean;
  count: number;
}> {
  const supabase = serviceRoleClient();
  const { data } = await supabase
    .from("dream_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("usage_date", today())
    .maybeSingle();
  const count = data?.message_count ?? 0;
  return { withinCap: count < DAILY_DREAM_MESSAGE_CAP, count };
}

export async function incrementDreamUsage(userId: string): Promise<void> {
  const supabase = serviceRoleClient();
  const date = today();

  const { data: existing } = await supabase
    .from("dream_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("usage_date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("dream_usage")
      .update({ message_count: existing.message_count + 1 })
      .eq("user_id", userId)
      .eq("usage_date", date);
  } else {
    await supabase
      .from("dream_usage")
      .insert({ user_id: userId, usage_date: date, message_count: 1 });
  }
}
