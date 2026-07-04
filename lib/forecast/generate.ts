import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAnthropic, CHAT_MODEL } from "@/lib/astrologer/anthropic";
import { loadAstrologerContext } from "@/lib/astrologer/context";
import {
  buildForecastPrompt,
  parseForecast,
  type ForecastContent,
} from "./prompt";
import { lunarEventsForMonth } from "@/lib/astrology/sky";
import { sanitizeStringsDeep } from "@/lib/llm/sanitize";
import {
  retrieveRituals,
  formatRitualsForPrompt,
  metadataFromRituals,
} from "@/lib/rag/retrieve";
import { formatCommonSuppliesForPrompt } from "@/lib/rag/common-supplies";

/**
 * Lazy-generate a monthly forecast for a user.
 *
 * Cached per (user, month) in the forecasts table. Returns the cached
 * row if one exists, otherwise calls Claude, persists, and returns.
 *
 * Phase 2 Part 2A — RAG (Voyage embeddings + product recommendations)
 * arrives in Part 2C. For now forecasts generate without the inline
 * [[Product|slug]] markup; the prompt still accepts the optional
 * retrievedRituals param, we just pass it empty.
 *
 * Returns null on:
 *  - missing profile / chart context
 *  - Claude returned unparseable output
 */

export type Forecast = {
  month: string; // 'YYYY-MM'
  content: ForecastContent;
  generated_at: string;
  retrieved_product_slugs?: string[];
  retrieved_sources?: Array<{ slug: string; url: string; title: string }>;
};

export async function getOrGenerateMonthlyForecast(
  userId: string,
  locale: "en" | "es" = "en",
): Promise<Forecast | null> {
  const supabase = await createClient();
  const month = currentMonthKey();

  // Cached per (user, month, locale), so each language caches independently.
  const { data: existing } = await supabase
    .from("forecasts")
    .select(
      "month, content, generated_at, retrieved_product_slugs, retrieved_sources",
    )
    .eq("user_id", userId)
    .eq("month", month)
    .eq("locale", locale)
    .maybeSingle();

  if (existing?.content) {
    return {
      month: existing.month,
      content: existing.content as ForecastContent,
      generated_at: existing.generated_at,
      retrieved_product_slugs:
        (existing.retrieved_product_slugs as string[]) || [],
      retrieved_sources:
        (existing.retrieved_sources as Forecast["retrieved_sources"]) || [],
    };
  }

  // Load chart context
  const ctx = await loadAstrologerContext(userId);
  if (!ctx) return null;

  const monthLabel = monthLabelFromKey(month);

  // Real lunar events for the month, computed locally, so the forecast's
  // key dates anchor to the actual new and full moons.
  const [yearNum, monthNum] = month.split("-").map(Number);
  const lunarEvents = lunarEventsForMonth(yearNum, monthNum)
    .map(
      (e) =>
        `${e.kind === "new" ? "New Moon" : "Full Moon"} in ${e.sign} on ${monthLabel.split(" ")[0]} ${e.day}`,
    )
    .join("; ");

  // RAG: retrieve archive rituals matching the season + sign energy.
  const ragQuery = `Monthly forecast and rituals for ${ctx.chart.sunSign} during ${monthLabel}. Love, work, spirit themes.`;
  const retrieved = await retrieveRituals(ragQuery, 3);
  const ritualsContext = [
    formatRitualsForPrompt(retrieved),
    formatCommonSuppliesForPrompt(),
  ]
    .filter(Boolean)
    .join("\n\n");
  const ragMetadata = metadataFromRituals(retrieved);

  const { system, user } = buildForecastPrompt({
    firstName: ctx.firstName,
    monthLabel,
    sunSign: ctx.chart.sunSign,
    moonSign: ctx.chart.moonSign,
    risingSign: ctx.chart.risingSign,
    placements: ctx.chart.placements,
    retrievedRituals: ritualsContext,
    lunarEvents,
    locale,
  });

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    // Haiku: the member waits on screen for the forecast to reveal,
    // so the budget is under 10 seconds end to end.
    model: CHAT_MODEL,
    max_tokens: 1400,
    system,
    messages: [{ role: "user", content: user }],
  });

  const rawText = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");

  const parsed = parseForecast(rawText);
  if (!parsed) {
    console.error("Forecast parse failed. Raw:", rawText.slice(0, 500));
    return null;
  }

  // Defense-in-depth: scrub em/en-dashes the prompt should have prevented.
  const clean = sanitizeStringsDeep(parsed);

  // Persist via admin client so we can write even though RLS is for
  // selects only (writes are server-only by design).
  const admin = createAdminClient();
  await admin.from("forecasts").upsert(
    {
      user_id: userId,
      month,
      locale,
      content: clean,
      generated_at: new Date().toISOString(),
      retrieved_product_slugs: ragMetadata.product_slugs,
      retrieved_sources: ragMetadata.sources,
    },
    { onConflict: "user_id,month,locale" },
  );

  return {
    month,
    content: clean,
    generated_at: new Date().toISOString(),
    retrieved_product_slugs: ragMetadata.product_slugs,
    retrieved_sources: ragMetadata.sources,
  };
}

function currentMonthKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function monthLabelFromKey(key: string): string {
  const [yyyy, mm] = key.split("-").map(Number);
  const d = new Date(Date.UTC(yyyy, mm - 1, 1));
  return d.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
