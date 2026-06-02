import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAnthropic, ASTROLOGER_MODEL } from "@/lib/astrologer/anthropic";
import { loadAstrologerContext } from "@/lib/astrologer/context";
import {
  buildForecastPrompt,
  parseForecast,
  type ForecastContent,
} from "./prompt";
import { sanitizeStringsDeep } from "@/lib/llm/sanitize";

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
};

export async function getOrGenerateMonthlyForecast(
  userId: string,
): Promise<Forecast | null> {
  const supabase = await createClient();
  const month = currentMonthKey();

  // Cache lookup
  const { data: existing } = await supabase
    .from("forecasts")
    .select("month, content, generated_at")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  if (existing?.content) {
    return {
      month: existing.month,
      content: existing.content as ForecastContent,
      generated_at: existing.generated_at,
    };
  }

  // Load chart context
  const ctx = await loadAstrologerContext(userId);
  if (!ctx) return null;

  const monthLabel = monthLabelFromKey(month);

  const { system, user } = buildForecastPrompt({
    firstName: ctx.firstName,
    monthLabel,
    sunSign: ctx.chart.sunSign,
    moonSign: ctx.chart.moonSign,
    risingSign: ctx.chart.risingSign,
    placements: ctx.chart.placements,
    // No retrievedRituals in Part 2A; RAG comes in Part 2C.
  });

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: ASTROLOGER_MODEL,
    max_tokens: 3000,
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
      content: clean,
      generated_at: new Date().toISOString(),
      retrieved_product_slugs: [],
      retrieved_sources: [],
    },
    { onConflict: "user_id,month" },
  );

  return {
    month,
    content: clean,
    generated_at: new Date().toISOString(),
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
