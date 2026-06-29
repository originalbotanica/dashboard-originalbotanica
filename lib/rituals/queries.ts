import { createClient } from "@/utils/supabase/server";

/**
 * Data access for the ritual library.
 *
 * All reads go through the user-scoped Supabase client, so Row Level
 * Security applies: only published rituals are returned, and only to members
 * with an active subscription (the rituals_select_published_for_members
 * policy). The pipeline writes with the service role, which bypasses RLS.
 */

import { t } from "@/lib/i18n/dictionary";

export type RitualMaterial = {
  name: string;
  url?: string | null;
  slug?: string | null;
};

export type Ritual = {
  id: string;
  slug: string;
  title_en: string;
  summary: string | null;
  steps: string[];
  purpose: string | null;
  intention: string | null;
  tradition: string | null;
  difficulty: string | null;
  best_day_of_week: number | null;
  best_moon_phase: string | null;
  materials: RitualMaterial[];
  warnings: string | null;
  image_url: string | null;
  source_url: string | null;
  source_type: string | null;
  keywords: string[] | null;
};

const LIST_FIELDS =
  "id, slug, title_en, summary, purpose, tradition, difficulty, image_url, source_type";

/** The fields a ritual card needs. */
export type RitualCardData = Pick<
  Ritual,
  "id" | "slug" | "title_en" | "summary" | "purpose" | "tradition" | "difficulty" | "image_url" | "source_type"
>;

/** Count of published rituals per purpose slug. */
export async function getPurposeCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rituals")
    .select("purpose")
    .not("published_at", "is", null);
  if (error) return {};
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { purpose: string | null }[]) {
    if (row.purpose) counts[row.purpose] = (counts[row.purpose] || 0) + 1;
  }
  return counts;
}

/** Cards for one purpose shelf. */
export async function listRitualsByPurpose(
  purpose: string,
): Promise<RitualCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rituals")
    .select(LIST_FIELDS)
    .eq("purpose", purpose)
    .not("published_at", "is", null)
    .order("title_en");
  if (error) return [];
  return (data ?? []) as never;
}

/** One full ritual by slug. */
export async function getRitualBySlug(slug: string): Promise<Ritual | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rituals")
    .select(
      "id, slug, title_en, summary, steps, purpose, intention, tradition, difficulty, best_day_of_week, best_moon_phase, materials, warnings, image_url, source_url, source_type, keywords",
    )
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();
  if (error || !data) return null;
  const r = data as Record<string, unknown>;
  return {
    ...(r as unknown as Ritual),
    steps: Array.isArray(r.steps) ? (r.steps as string[]) : [],
    materials: Array.isArray(r.materials) ? (r.materials as RitualMaterial[]) : [],
  };
}

/**
 * Free-text search over published rituals.
 *
 * Two passes run in parallel and merge:
 *  1. Keyword: ilike over title + summary. Exact words rank first.
 *  2. Semantic: the same Voyage embeddings the readings use, so a search
 *     like "my husband left" finds reconciliation rituals even when the
 *     words never appear. Blog-sourced rituals share their slug with the
 *     embedded source post, which is the bridge between the two tables.
 *
 * Semantic failure is graceful: if the embedding call errors, the keyword
 * results stand alone, exactly as before.
 */
export async function searchRituals(q: string): Promise<RitualCardData[]> {
  const term = q.trim();
  if (!term) return [];

  const [keyword, semantic] = await Promise.all([
    keywordSearchRituals(term),
    semanticSearchRituals(term).catch(() => [] as RitualCardData[]),
  ]);

  const seen = new Set(keyword.map((r) => r.id));
  const merged = [...keyword];
  for (const r of semantic) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      merged.push(r);
    }
  }
  return merged.slice(0, 50);
}

/** Keyword pass: case-insensitive match on title + summary. */
async function keywordSearchRituals(term: string): Promise<RitualCardData[]> {
  const supabase = await createClient();
  // Strip characters that carry meaning in PostgREST's filter syntax used by
  // .or() below: commas and parentheses delimit/group conditions, dots separate
  // column.operator.value, and %/_ are LIKE wildcards. Removing them keeps a
  // crafted search term from injecting extra filter conditions.
  const safe = term.replace(/[%_,.()*\\]/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return [];
  const pattern = `%${safe}%`;
  const { data, error } = await supabase
    .from("rituals")
    .select(LIST_FIELDS)
    .not("published_at", "is", null)
    .or(`title_en.ilike.${pattern},summary.ilike.${pattern}`)
    .order("title_en")
    .limit(50);
  if (error) return [];
  return (data ?? []) as never;
}

/** Semantic pass: embed the query, match posts, map to library rituals. */
async function semanticSearchRituals(term: string): Promise<RitualCardData[]> {
  // Lazy import keeps the rituals module free of the RAG dependency for
  // callers that never search.
  const { retrieveRituals } = await import("@/lib/rag/retrieve");
  const retrieved = await retrieveRituals(term, 9);
  if (retrieved.length === 0) return [];
  const slugs = retrieved.map((r) => r.slug);
  const rituals = await getLibraryRitualsBySlugs(slugs);
  // Preserve retrieval order (most relevant first).
  const rank = new Map(slugs.map((s, i) => [s, i]));
  return rituals
    .slice()
    .sort((a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99));
}

/**
 * A representative cover image per purpose, drawn from each shelf's own
 * rituals so every shelf looks distinct and authentic. Falls back to the
 * purpose's static image in the UI when a shelf has no imagery yet.
 */
export async function getPurposeCovers(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rituals")
    .select("purpose, image_url")
    .not("published_at", "is", null)
    .not("image_url", "is", null)
    .order("title_en");
  if (error) return {};
  const covers: Record<string, string> = {};
  for (const row of (data ?? []) as { purpose: string | null; image_url: string | null }[]) {
    if (row.purpose && row.image_url && !covers[row.purpose]) {
      covers[row.purpose] = row.image_url;
    }
  }
  return covers;
}

/**
 * Published library rituals matching a list of slugs. Blog-sourced rituals
 * share their slug with the source post, so this maps a reading's retrieved
 * sources to in-app library entries.
 */
export async function getLibraryRitualsBySlugs(
  slugs: string[],
): Promise<RitualCardData[]> {
  if (!slugs || slugs.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rituals")
    .select(LIST_FIELDS)
    .in("slug", slugs)
    .not("published_at", "is", null);
  if (error) return [];
  return (data ?? []) as never;
}

/** Published rituals tagged for a given moon phase (new|waxing|full|waning). */
export async function getRitualsByMoonPhase(
  phase: string,
  limit = 3,
): Promise<RitualCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rituals")
    .select(LIST_FIELDS)
    .eq("best_moon_phase", phase)
    .not("published_at", "is", null)
    .order("title_en")
    .limit(limit);
  if (error) return [];
  return (data ?? []) as never;
}

/** The set of ritual ids this member has saved. Used to show saved state. */
export async function getSavedRitualIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ritual_favorites")
    .select("ritual_id")
    .eq("user_id", userId);
  if (error) return new Set();
  return new Set((data ?? []).map((r: { ritual_id: string }) => r.ritual_id));
}

/** The member's saved rituals as cards, newest first. */
export async function listSavedRituals(userId: string): Promise<RitualCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ritual_favorites")
    .select(
      "saved_at, rituals(id, slug, title_en, summary, purpose, tradition, difficulty, image_url, source_type)",
    )
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });
  if (error) return [];
  // Each row embeds its ritual; drop any whose ritual is gone/unpublished.
  const rows = (data ?? []) as unknown as Array<{
    rituals: RitualCardData | RitualCardData[] | null;
  }>;
  return rows
    .map((row) => (Array.isArray(row.rituals) ? row.rituals[0] : row.rituals))
    .filter((r): r is RitualCardData => !!r);
}

/** Day-of-week label, 0=Sunday. */
const DAY_KEYS = [
  "day.sunday", "day.monday", "day.tuesday", "day.wednesday",
  "day.thursday", "day.friday", "day.saturday",
];
export function dayLabel(n: number | null, locale: "en" | "es" = "en"): string | null {
  if (n === null || n < 0 || n > 6) return null;
  return t(locale, DAY_KEYS[n]);
}
