import { createClient } from "@/utils/supabase/server";
import { localToday } from "@/lib/altar/tend";

/**
 * The member's live state, gathered for the dashboard in one pass.
 *
 * This is what turns the dashboard from a brochure into a dashboard: the
 * cards say what's actually true today — candles burning and how long
 * they have left, flames waiting to be charged, ancestors whose altar
 * hasn't been tended this week, rituals saved.
 */
export type DashState = {
  candlesBurning: number;
  /** Fewest days remaining among burning candles (the one to watch). */
  soonestDaysLeft: number | null;
  candlesToCharge: number;
  memorials: number;
  /** Memorials with no offering in the last seven days. */
  memorialsUntended: number;
  savedRituals: number;
};

export async function getDashState(
  userId: string,
  tz?: string | null,
): Promise<DashState> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [candlesRes, memorialsRes, savedRes] = await Promise.all([
    supabase
      .from("candles")
      .select("id, expires_at")
      .eq("user_id", userId)
      .is("archived_at", null)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`),
    supabase.from("ancestors").select("id").eq("user_id", userId),
    supabase
      .from("ritual_favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const candles = candlesRes.data ?? [];
  const memorialIds = (memorialsRes.data ?? []).map((m) => m.id);

  // Days left on the candle closest to burning out.
  let soonestDaysLeft: number | null = null;
  for (const c of candles) {
    if (!c.expires_at) continue;
    const d = Math.ceil(
      (new Date(c.expires_at).getTime() - Date.now()) / 86_400_000,
    );
    if (d > 0 && (soonestDaysLeft === null || d < soonestDaysLeft)) {
      soonestDaysLeft = d;
    }
  }

  // How many burning candles haven't been charged today (member's own day).
  let candlesToCharge = 0;
  if (candles.length > 0) {
    const today = localToday(tz);
    const { data: tended } = await supabase
      .from("candle_tendings")
      .select("candle_id")
      .in(
        "candle_id",
        candles.map((c) => c.id),
      )
      .eq("tended_on", today);
    const tendedIds = new Set((tended ?? []).map((r) => r.candle_id));
    candlesToCharge = candles.filter((c) => !tendedIds.has(c.id)).length;
  }

  // Memorials with nothing set on their altar this week.
  let memorialsUntended = 0;
  if (memorialIds.length > 0) {
    try {
      const { data: recent } = await supabase
        .from("ancestor_offerings")
        .select("ancestor_id")
        .in("ancestor_id", memorialIds)
        .gte("created_at", weekAgo);
      const withOfferings = new Set(
        (recent ?? []).map((o) => o.ancestor_id as string),
      );
      memorialsUntended = memorialIds.filter(
        (id) => !withOfferings.has(id),
      ).length;
    } catch {
      memorialsUntended = 0;
    }
  }

  return {
    candlesBurning: candles.length,
    soonestDaysLeft,
    candlesToCharge,
    memorials: memorialIds.length,
    memorialsUntended,
    savedRituals: savedRes.count ?? 0,
  };
}
