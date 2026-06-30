import { createAdminClient } from "@/utils/supabase/admin";
import { getAnthropic, ASTROLOGER_MODEL } from "@/lib/astrologer/anthropic";
import { sanitizeStringsDeep } from "@/lib/llm/sanitize";
import {
  retrieveRituals,
  formatRitualsForPrompt,
  metadataFromRituals,
} from "@/lib/rag/retrieve";
import { formatCommonSuppliesForPrompt } from "@/lib/rag/common-supplies";
import { getMoon } from "@/lib/astrology/moon";
import { getTodaysSky } from "@/lib/astrology/sky";
import {
  buildDailyHoroscopePrompt,
  parseDailyHoroscope,
  type DailyHoroscopeContent,
  type Sign,
} from "./prompt";

/**
 * Lazy-generate a daily horoscope for a sign.
 *
 * Cached per (sign, date) in the daily_horoscopes table. The first
 * person to view a sign on a given day triggers generation; everyone
 * after gets the cached row.
 *
 * Returns null only on a hard failure (Claude returns unparseable output,
 * etc.). The caller can show a placeholder.
 *
 * PART 1 SCOPE
 * No RAG product-recommendation system yet. Horoscopes generate without
 * the inline [[Product|slug]] links. Part 2 brings the Voyage embeddings
 * and ritual archive back online.
 */

export type DailyHoroscope = {
  sign: Sign;
  date: string;            // YYYY-MM-DD
  content: DailyHoroscopeContent;
  generated_at: string;
  retrieved_product_slugs: string[];
  retrieved_sources: unknown[];
};

export async function getOrGenerateDailyHoroscope(
  sign: Sign,
  locale: "en" | "es" = "en",
): Promise<DailyHoroscope | null> {
  // Admin (service-role) client: the daily_horoscopes table is world-readable
  // but writes must go through the service role (RLS has no user insert/update
  // policy). Using the user client here silently failed the cache write, so the
  // horoscope regenerated on every page load — giving a different "focus" on
  // the dashboard vs the astrology page. Admin client = one generation per day,
  // consistent everywhere.
  const supabase = createAdminClient();
  const date = todayKey();

  // Cached per (sign, date, locale), so each language caches independently.
  const { data: existing } = await supabase
    .from("daily_horoscopes")
    .select(
      "sign, date, content, generated_at, retrieved_product_slugs, retrieved_sources",
    )
    .eq("sign", sign)
    .eq("date", date)
    .eq("locale", locale)
    .maybeSingle();

  if (existing?.content) {
    return {
      sign: existing.sign as Sign,
      date: existing.date,
      content: existing.content as DailyHoroscopeContent,
      generated_at: existing.generated_at,
      retrieved_product_slugs:
        (existing.retrieved_product_slugs as string[]) || [],
      retrieved_sources: (existing.retrieved_sources as unknown[]) || [],
    };
  }

  // Generate fresh.
  const dateLabel = formatDateLabel(date);

  // RAG: retrieve archive rituals relevant to this sign's daily energy.
  const ragQuery = `Daily ritual for ${sign}. Personal grounding, intention, simple practice.`;
  const retrieved = await retrieveRituals(ragQuery, 2);
  const ritualsContext = [
    formatRitualsForPrompt(retrieved),
    formatCommonSuppliesForPrompt(),
  ]
    .filter(Boolean)
    .join("\n\n");
  const ragMetadata = metadataFromRituals(retrieved);

  // Ground the reading in the real sky so the horoscope never contradicts
  // the computed "today's sky" line shown elsewhere in the app.
  const sky = getTodaysSky();
  const moon = getMoon();
  const skyContext = `Moon in ${sky.moonSign} (${moon.phaseName.toLowerCase()}, ${
    sky.waxing ? "waxing" : "waning"
  }). Sun in ${sky.sunSign}.${
    sky.aspect ? ` Moon ${sky.aspect.name} Sun.` : ""
  }`;

  const { system, user } = buildDailyHoroscopePrompt({
    sign,
    dateLabel,
    retrievedRituals: ritualsContext,
    skyContext,
    locale,
  });

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: ASTROLOGER_MODEL,
    max_tokens: 800,
    system,
    messages: [{ role: "user", content: user }],
  });

  const rawText = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");

  const parsed = parseDailyHoroscope(rawText);
  if (!parsed) {
    console.error("Daily horoscope parse failed. Raw:", rawText.slice(0, 500));
    return null;
  }

  // Defense in depth. Scrub em/en-dashes the prompt should have prevented.
  const clean = sanitizeStringsDeep(parsed);

  // Persist (idempotent; another concurrent request may have written first).
  await supabase.from("daily_horoscopes").upsert(
    {
      sign,
      date,
      locale,
      content: clean,
      generated_at: new Date().toISOString(),
      retrieved_product_slugs: ragMetadata.product_slugs,
      retrieved_sources: ragMetadata.sources,
    },
    { onConflict: "sign,date,locale" },
  );

  return {
    sign,
    date,
    content: clean,
    generated_at: new Date().toISOString(),
    retrieved_product_slugs: ragMetadata.product_slugs,
    retrieved_sources: ragMetadata.sources,
  };
}

function todayKey(): string {
  // Use US Eastern time so "today" tracks the botanica's hours, not UTC.
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

function formatDateLabel(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
