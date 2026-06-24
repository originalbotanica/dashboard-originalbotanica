import { createClient } from "@/utils/supabase/server";

/**
 * Virtual altar — server-side data access.
 *
 * The catalog (desires, candles, image URLs, helpers) lives in
 * ./catalog so it can also be used from client components. This module
 * re-exports it and adds the database access that must stay server-only.
 *
 * Candles live in the `candles` table; we reuse its columns:
 *   candle_type   -> desire slug (the category)
 *   candle_color  -> chosen candle slug (the specific prepared candle)
 *   intention     -> the dedication line shown publicly under the candle
 *   petition      -> the longer prayer (private detail)
 *   is_public     -> show on the community wall
 *   lit_at / expires_at -> burn window
 *   archived_at   -> extinguished / burned out
 */

export * from "./catalog";

export type Candle = {
  id: string;
  candle_type: string | null; // desire slug
  candle_color: string | null; // candle slug
  intention: string;
  petition: string | null;
  is_public: boolean;
  lit_at: string;
  expires_at: string | null;
};

const CANDLE_FIELDS =
  "id, candle_type, candle_color, intention, petition, is_public, lit_at, expires_at";

/** How many candles a member may light in a rolling 24-hour window.
 *  Generous enough that sincere use never hits it; low enough to stop
 *  spam on the shared community wall. */
export const ALTAR_DAILY_LIMIT = 5;

/** Count candles this member has lit in the last 24 hours (counts
 *  extinguished/burned-out ones too, so light-then-relight can't be
 *  used to evade the limit). */
export async function candlesLitInLast24h(userId: string): Promise<number> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await supabase
    .from("candles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("lit_at", since);
  return count ?? 0;
}

/** The member's own currently-burning candles. */
export async function listMyCandles(userId: string): Promise<Candle[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("candles")
    .select(CANDLE_FIELDS)
    .eq("user_id", userId)
    .is("archived_at", null)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("lit_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Candle[];
}

/** Public, still-burning candles for the community wall. Optional keyword. */
export async function listCommunityCandles(search?: string): Promise<Candle[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  let q = supabase
    .from("candles")
    .select(CANDLE_FIELDS)
    .eq("is_public", true)
    .is("archived_at", null)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("lit_at", { ascending: false })
    .limit(60);
  const term = (search || "").trim();
  if (term) q = q.ilike("intention", `%${term.replace(/[%_]/g, "")}%`);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as Candle[];
}

/** A single candle the member may view (their own, or any public one). */
export async function getCandle(id: string): Promise<Candle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candles")
    .select(CANDLE_FIELDS)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();
  if (error || !data) return null;
  return data as Candle;
}
