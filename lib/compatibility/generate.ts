import { createAdminClient } from "@/utils/supabase/admin";
import { getAnthropic, CHAT_MODEL } from "@/lib/astrologer/anthropic";
import {
  getNatalChart,
  geocode,
  type ChartData,
  type BirthInput,
} from "@/lib/astrology-api";
import { loadAstrologerContext } from "@/lib/astrologer/context";
import { sanitizeStringsDeep } from "@/lib/llm/sanitize";
import {
  retrieveRituals,
  formatRitualsForPrompt,
  metadataFromRituals,
} from "@/lib/rag/retrieve";
import { formatCommonSuppliesForPrompt } from "@/lib/rag/common-supplies";
import {
  buildCompatibilityPrompt,
  parseCompatibility,
  type CompatibilityContent,
} from "./prompt";

/**
 * Generate a compatibility (synastry) reading.
 *
 * Phase 2 Part 2B — no RAG inline-product markup yet; that arrives in
 * Part 2C alongside the same change for daily horoscope, astrologer
 * chat, and monthly forecast.
 *
 * Returns the newly-inserted reading id (and content), or null on a
 * hard failure (chart compute failed, Claude returned unparseable).
 */

export type CompatibilityReading = {
  id: string;
  content: CompatibilityContent;
};

export async function createCompatibilityReading(args: {
  userId: string;
  otherName: string;
  otherBirthDate: string; // YYYY-MM-DD
  otherBirthTime: string | null; // HH:MM or null
  otherBirthCity: string;
  relationshipNote?: string | null;
  locale?: "en" | "es";
}): Promise<CompatibilityReading | null> {
  // 1 + 2. Both charts in parallel — the member is waiting on this,
  // so we don't serialize two independent network round-trips.
  const [subscriberCtx, otherChart] = await Promise.all([
    loadAstrologerContext(args.userId),
    computeOtherChart({
      birthDate: args.otherBirthDate,
      birthTime: args.otherBirthTime,
      birthCity: args.otherBirthCity,
    }),
  ]);
  if (!subscriberCtx || !otherChart) return null;

  // 3. RAG: retrieve archive rituals relevant to this pairing
  const ragQuery = `Relationship rituals between ${subscriberCtx.chart.sunSign} and ${otherChart.sunSign}. ${args.relationshipNote || "Love, partnership, communication, healing."}`;
  const retrieved = await retrieveRituals(ragQuery, 3);
  const ritualsContext = [
    formatRitualsForPrompt(retrieved),
    formatCommonSuppliesForPrompt(),
  ]
    .filter(Boolean)
    .join("\n\n");
  const ragMetadata = metadataFromRituals(retrieved);

  // 4. Claude
  const { system, user } = buildCompatibilityPrompt({
    subscriberFirstName: subscriberCtx.firstName,
    subscriberChart: {
      sunSign: subscriberCtx.chart.sunSign,
      moonSign: subscriberCtx.chart.moonSign,
      risingSign: subscriberCtx.chart.risingSign,
      placements: subscriberCtx.chart.placements,
    },
    otherName: args.otherName,
    otherChart: {
      sunSign: otherChart.sunSign,
      moonSign: otherChart.moonSign,
      risingSign: otherChart.risingSign,
      placements: otherChart.placements,
    },
    relationshipNote: args.relationshipNote || null,
    retrievedRituals: ritualsContext,
    locale: args.locale,
  });

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    // Haiku: the member waits on this screen, so speed matters more
    // than the marginal quality gain from Sonnet at this length.
    model: CHAT_MODEL,
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content: user }],
  });

  const rawText = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("\n");

  const parsed = parseCompatibility(rawText);
  if (!parsed) {
    console.error(
      "Compatibility parse failed. Raw:",
      rawText.slice(0, 500),
    );
    return null;
  }

  const clean = sanitizeStringsDeep(parsed);

  // 5. Persist via admin client (server-only writes; subscribers can
  // also insert directly via RLS, but we use admin here so server-side
  // generation works regardless of auth context).
  const admin = createAdminClient();
  const { data: inserted, error } = await admin
    .from("compatibility_readings")
    .insert({
      user_id: args.userId,
      other_name: args.otherName,
      other_birth_date: args.otherBirthDate,
      other_birth_time: args.otherBirthTime,
      other_birth_city: args.otherBirthCity,
      relationship_note: args.relationshipNote || null,
      other_chart_data: otherChart,
      content: clean,
      generated_at: new Date().toISOString(),
      retrieved_product_slugs: ragMetadata.product_slugs,
      retrieved_sources: ragMetadata.sources,
    })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    console.error("Compatibility insert error:", error);
    return null;
  }

  return { id: inserted.id, content: clean };
}

async function computeOtherChart(args: {
  birthDate: string;
  birthTime: string | null;
  birthCity: string;
}): Promise<ChartData | null> {
  const [yyyy, mm, dd] = args.birthDate.split("-").map(Number);
  const [hh, mn] = (args.birthTime || "12:00").split(":").map(Number);
  const geo = await geocode(args.birthCity, {
    year: yyyy,
    month: mm,
    day: dd,
  });
  const input: BirthInput = {
    day: dd,
    month: mm,
    year: yyyy,
    hour: args.birthTime ? hh : 12,
    min: args.birthTime ? mn : 0,
    lat: geo?.lat ?? 40.8448,
    lon: geo?.lon ?? -73.8648,
    tzone: geo?.tzone ?? -5,
  };
  try {
    return await getNatalChart(input);
  } catch (err) {
    console.error("computeOtherChart error:", err);
    return null;
  }
}
