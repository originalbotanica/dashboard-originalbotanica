import { createClient } from "@/utils/supabase/server";
import { getAnthropic, ASTROLOGER_MODEL } from "@/lib/astrologer/anthropic";
import { sanitizeStringsDeep } from "@/lib/llm/sanitize";
import { botanicaDayKey, SUIT_ELEMENT, type TarotCard } from "@/lib/tarot/deck";
import {
  buildDailyTarotPrompt,
  parseDailyTarot,
  type DailyTarotContent,
} from "./prompt";

/**
 * Lazy-generate the personalized daily tarot reading for one member.
 *
 * The card is already chosen (deterministically, per member per day) by
 * lib/tarot/deck. This function writes the WORDS: a reading of that card for
 * this person, in the voice of the house and their language.
 *
 * Cached per (user, date) in the existing daily_readings table, so the first
 * dashboard view of the day generates and everyone after is instant. All
 * cache access is best-effort: if the table is missing or RLS blocks a write
 * (e.g. before the schema is in a given environment), we still return a
 * freshly generated reading rather than failing the page.
 *
 * Returns null only on a hard generation failure. The caller falls back to
 * the card's authored house reading.
 */
export async function getOrGenerateDailyTarotReading(args: {
  userId: string;
  card: TarotCard;
  firstName?: string | null;
  sunSign?: string | null;
  locale?: string | null;
}): Promise<DailyTarotContent | null> {
  const { userId, card } = args;
  const date = botanicaDayKey();
  const supabase = await createClient();

  // Cache lookup (best-effort). Only reuse a row that matches today's card.
  try {
    const { data: existing } = await supabase
      .from("daily_readings")
      .select("tarot_card_id, tarot_reading")
      .eq("user_id", userId)
      .eq("reading_date", date)
      .maybeSingle();

    if (existing?.tarot_card_id === card.id && existing?.tarot_reading) {
      const cached = decodeReading(existing.tarot_reading);
      if (cached) return cached;
    }
  } catch {
    // Table not present in this environment, or read blocked. Generate fresh.
  }

  // Generate.
  let content: DailyTarotContent | null = null;
  try {
    const { system, user } = buildDailyTarotPrompt({
      cardName: card.name,
      cardEssence: card.essence,
      arcanaLabel: arcanaLabel(card),
      baseReading: card.reading,
      dateLabel: dateLabel(date),
      firstName: args.firstName,
      sunSign: args.sunSign,
      locale: args.locale || "en",
    });

    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: ASTROLOGER_MODEL,
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: user }],
    });

    const rawText = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n");

    const parsed = parseDailyTarot(rawText);
    if (!parsed) {
      console.error("Daily tarot parse failed. Raw:", rawText.slice(0, 500));
      return null;
    }
    content = sanitizeStringsDeep(parsed);
  } catch (err) {
    console.error("Daily tarot generation failed:", err);
    return null;
  }

  // Persist (best-effort, idempotent).
  try {
    await supabase.from("daily_readings").upsert(
      {
        user_id: userId,
        reading_date: date,
        tarot_card_id: card.id,
        tarot_orientation: "upright",
        tarot_reading: JSON.stringify(content),
        generated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,reading_date" },
    );
  } catch {
    // Caching is a nicety, not a requirement. Return the reading regardless.
  }

  return content;
}

/** A short label naming the card's family, for the prompt context. */
function arcanaLabel(card: TarotCard): string {
  if (card.arcana === "major") {
    return "Major Arcana, a turning point on the road.";
  }
  const element = card.suit ? SUIT_ELEMENT[card.suit] : "";
  return `Minor Arcana. ${element}`;
}

/**
 * daily_readings.tarot_reading holds a JSON string of DailyTarotContent.
 * Tolerate a legacy plain-text value by wrapping it.
 */
function decodeReading(stored: string): DailyTarotContent | null {
  try {
    const obj = JSON.parse(stored);
    if (
      obj &&
      typeof obj.interpretation === "string" &&
      typeof obj.question === "string"
    ) {
      return { interpretation: obj.interpretation, question: obj.question };
    }
  } catch {
    // Not JSON. Treat the whole string as the interpretation.
    if (stored.trim()) {
      return { interpretation: stored.trim(), question: "" };
    }
  }
  return null;
}

function dateLabel(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
