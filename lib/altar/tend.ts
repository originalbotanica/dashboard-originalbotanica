import { createClient } from "@/utils/supabase/server";

/**
 * Tending a candle — the daily act of returning to a burning candle to
 * hold its intention. One tap per candle per local day. The record is a
 * quiet devotion log, never a shame streak: we count days tended, we
 * never count days missed.
 *
 * Table (run once in Supabase):
 *   create table if not exists public.candle_tendings (
 *     candle_id uuid not null references public.candles(id) on delete cascade,
 *     user_id uuid not null references auth.users(id) on delete cascade,
 *     tended_on date not null,
 *     created_at timestamptz not null default now(),
 *     primary key (candle_id, tended_on)
 *   );
 *   alter table public.candle_tendings enable row level security;
 *   create policy "own tendings" on public.candle_tendings
 *     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 */

/** Today's date (YYYY-MM-DD) in the member's timezone; falls back to the
 *  botanica's home timezone. */
export function localToday(tz?: string | null): string {
  const zone = tz || "America/New_York";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return localToday("America/New_York");
  }
}

export type TendingState = {
  tendedToday: boolean;
  daysTended: number;
  /** Total days this candle burns (7 for every veladora). */
  totalDays: number;
};

/** Tending state for one candle the member owns. Best-effort: if the
 *  table doesn't exist yet, the candle simply shows as untended. */
export async function getTendingState(
  candleId: string,
  litAt: string,
  expiresAt: string | null,
  tz?: string | null,
): Promise<TendingState> {
  const totalDays =
    expiresAt
      ? Math.max(1, Math.round((new Date(expiresAt).getTime() - new Date(litAt).getTime()) / 86_400_000))
      : 7;
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("candle_tendings")
      .select("tended_on")
      .eq("candle_id", candleId);
    if (error || !data) return { tendedToday: false, daysTended: 0, totalDays };
    const today = localToday(tz);
    return {
      tendedToday: data.some((r) => r.tended_on === today),
      daysTended: data.length,
      totalDays,
    };
  } catch {
    return { tendedToday: false, daysTended: 0, totalDays };
  }
}

/** Does the member have any burning candle not yet tended today? Used for
 *  the dashboard nudge. Best-effort; false on any error. */
export async function hasUntendedCandles(
  userId: string,
  tz?: string | null,
): Promise<boolean> {
  const supabase = await createClient();
  try {
    const nowIso = new Date().toISOString();
    const { data: burning } = await supabase
      .from("candles")
      .select("id")
      .eq("user_id", userId)
      .is("archived_at", null)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
    if (!burning || burning.length === 0) return false;
    const today = localToday(tz);
    const { data: tended } = await supabase
      .from("candle_tendings")
      .select("candle_id")
      .eq("user_id", userId)
      .eq("tended_on", today);
    const done = new Set((tended ?? []).map((r) => r.candle_id));
    return burning.some((c) => !done.has(c.id));
  } catch {
    return false;
  }
}
