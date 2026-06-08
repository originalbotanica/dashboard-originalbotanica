import { createClient } from "@/utils/supabase/server";

/**
 * Virtual altar — catalog and data access.
 *
 * Mirrors the public altar.originalbotanica.com flow (choose a desire, a
 * candle color, write an intention and petition, set how long it burns),
 * but tied to the signed-in member with no paywall. Candles live in the
 * `candles` table; we reuse its columns rather than add new ones:
 *   candle_type   -> desire slug (the category)
 *   candle_color  -> chosen color slug
 *   intention     -> the dedication line shown publicly under the candle
 *   petition      -> the longer prayer (private detail)
 *   is_public     -> show on the community wall
 *   lit_at / expires_at -> burn window
 *   archived_at   -> extinguished / burned out
 */

export type Desire = {
  slug: string;
  label: string;
  purpose: string; // maps to a ritual library purpose for recommendations
  defaultColor: string;
};

export const DESIRES: Desire[] = [
  { slug: "money", label: "Money & Wealth", purpose: "money-drawing", defaultColor: "green" },
  { slug: "love", label: "Love & Attraction", purpose: "love-drawing", defaultColor: "red" },
  { slug: "protection", label: "Protection", purpose: "protection", defaultColor: "white" },
  { slug: "open-road", label: "Open Road", purpose: "road-opening", defaultColor: "white" },
  { slug: "luck", label: "Luck & Gambling", purpose: "gambling-luck", defaultColor: "yellow" },
  { slug: "cleansing", label: "Spiritual Cleansing", purpose: "cleansing", defaultColor: "blue" },
  { slug: "health", label: "Health & Healing", purpose: "healing", defaultColor: "blue" },
  { slug: "banishing", label: "Go Away Evil", purpose: "banishing", defaultColor: "black" },
];

export type CandleColor = { slug: string; label: string; hex: string; wax: string };

/** Candle glass colors. `hex` is the glass tint, `wax` the lit wax tone. */
export const COLORS: CandleColor[] = [
  { slug: "white", label: "White", hex: "#e9dfc8", wax: "#f6efdd" },
  { slug: "red", label: "Red", hex: "#b23a2e", wax: "#d9594a" },
  { slug: "pink", label: "Pink", hex: "#cf7f95", wax: "#e6a6b6" },
  { slug: "green", label: "Green", hex: "#2f7d54", wax: "#4da06f" },
  { slug: "yellow", label: "Yellow", hex: "#d8b13f", wax: "#ecc964" },
  { slug: "blue", label: "Blue", hex: "#3c6ea3", wax: "#5b8cc0" },
  { slug: "purple", label: "Purple", hex: "#6f4f99", wax: "#8f6fbb" },
  { slug: "black", label: "Black", hex: "#2c2722", wax: "#4a4038" },
];

export type Duration = { days: number; label: string };
export const DURATIONS: Duration[] = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

export function getDesire(slug: string | null): Desire | undefined {
  return DESIRES.find((d) => d.slug === slug);
}
export function getColor(slug: string | null): CandleColor {
  return COLORS.find((c) => c.slug === slug) || COLORS[0];
}

export type Candle = {
  id: string;
  candle_type: string | null; // desire slug
  candle_color: string | null;
  intention: string; // public dedication line
  petition: string | null;
  is_public: boolean;
  lit_at: string;
  expires_at: string | null;
};

const CANDLE_FIELDS =
  "id, candle_type, candle_color, intention, petition, is_public, lit_at, expires_at";

/** Days remaining before a candle burns out (0 if already out / no expiry shown as null). */
export function daysLeft(expires_at: string | null): number | null {
  if (!expires_at) return null;
  const ms = new Date(expires_at).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
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
