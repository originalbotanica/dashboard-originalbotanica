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
 *   intention       -> the dedication line shown publicly under the candle
 *   petition        -> the longer prayer (private by default)
 *   is_public       -> show the candle on the community wall
 *   petition_public -> also show the petition on a public candle
 *   lit_at / expires_at -> burn window
 *   archived_at   -> extinguished / burned out
 */

export * from "./catalog";

export type Candle = {
  id: string;
  user_id?: string;
  candle_type: string | null; // desire slug
  candle_color: string | null; // candle slug
  intention: string;
  petition: string | null;
  is_public: boolean;
  petition_public: boolean;
  lit_at: string;
  expires_at: string | null;
};

const CANDLE_FIELDS =
  "id, user_id, candle_type, candle_color, intention, petition, is_public, petition_public, lit_at, expires_at";

/** How many candles a member may light per day (their local day).
 *  Generous enough that sincere use never hits it; low enough to stop
 *  spam on the shared community wall. */
export const ALTAR_DAILY_LIMIT = 5;

/** Midnight today in the given IANA timezone, as an absolute instant.
 *  Falls back to America/New_York (the botanica's home) if the zone is
 *  missing or invalid. */
export function localMidnight(tz?: string | null): Date {
  const zone = tz || "America/New_York";
  const now = new Date();
  let parts: string;
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(now);
  } catch {
    return localMidnight("America/New_York");
  }
  const [h, m, s] = parts.split(":").map(Number);
  // "24" can appear for midnight in some ICU versions; treat as 0.
  const secondsIntoDay = ((h === 24 ? 0 : h) * 3600 + m * 60 + s) * 1000;
  return new Date(now.getTime() - secondsIntoDay);
}

/** Count candles this member has lit TODAY — since midnight in their own
 *  timezone — so the limit resets each morning rather than trailing a
 *  rolling 24-hour window. Counts extinguished/burned-out ones too, so
 *  light-then-relight can't be used to evade the limit. */
export async function candlesLitToday(
  userId: string,
  tz?: string | null,
): Promise<number> {
  const supabase = await createClient();
  const since = localMidnight(tz).toISOString();
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

/** Public, still-burning candles for the community wall. Optional keyword
 *  and/or intention (desire / "saints") filter. */
export async function listCommunityCandles(
  search?: string,
  desire?: string,
): Promise<Candle[]> {
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
  if (desire) q = q.eq("candle_type", desire);
  const { data, error } = await q;
  if (error) return [];
  // Community view: never expose another member's petition unless they chose
  // to share it, even though the row-level policy would return the column.
  return ((data ?? []) as Candle[]).map((c) => ({
    ...c,
    petition: c.petition_public ? c.petition : null,
  }));
}

/**
 * A single candle the member may view (their own, or any public one).
 *
 * Pass the viewer's id so a petition is withheld from anyone but the owner
 * unless the owner marked it public. This keeps the private prayer private
 * at the data layer, not just in the template.
 */
export async function getCandle(
  id: string,
  viewerId?: string,
): Promise<Candle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candles")
    .select(CANDLE_FIELDS)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();
  if (error || !data) return null;
  const candle = data as Candle;
  const isOwner = !!viewerId && candle.user_id === viewerId;
  if (!isOwner && !candle.petition_public) {
    candle.petition = null;
  }
  return candle;
}
