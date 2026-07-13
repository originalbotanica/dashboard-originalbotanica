/**
 * System + user prompt for the daily horoscope generator.
 * Per-sign (not per-user-chart) — these horoscopes serve every user
 * of that Sun sign plus public visitors.
 *
 * Output is short, structured JSON so we can render predictably.
 */

export type DailyHoroscopeContent = {
  summary: string;   // 2-3 sentences setting the day's tone for this sign
  focus: string;     // which area is asking attention (see FOCI)
  action: string;    // one concrete thing to do today
};

/** The areas a day can ask attention from. Wider than the original five so
 *  the hero line doesn't cycle "spirit/mind" all week; each has a matching
 *  focus.* dictionary entry for the Spanish dashboard. */
export const FOCI = [
  "love", "work", "money", "spirit", "body", "mind",
  "home", "protection", "release", "roads", "gratitude",
] as const;

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
export type Sign = (typeof SIGNS)[number];

export function isValidSign(s: string): s is Sign {
  return (SIGNS as readonly string[]).includes(s);
}

export function buildDailyHoroscopePrompt(args: {
  sign: Sign;
  dateLabel: string;   // e.g. "Saturday, May 16, 2026"
  retrievedRituals?: string; // Optional RAG context from OB blog corpus
  skyContext?: string; // Computed real sky for today (moon sign, phase, aspect)
  recentReadings?: string; // The last few days' focus/action, to avoid repeats
  locale?: "en" | "es";
}): { system: string; user: string } {
  const fociList = FOCI.join(", ");
  const langRule =
    args.locale === "es"
      ? `\n\nLANGUAGE\n- Write the "summary" and "action" fields entirely in natural, warm Latin American Spanish.\n- Keep the "focus" field as one of the English enum words (${fociList}) exactly.`
      : "";
  const system = `You are the astrologer for Original Botanica, a family-owned spiritual house serving The Bronx and the world since 1959. You speak as the institutional voice of the house, not as a named individual.${langRule}

VOICE
- Grounded, direct, warm. Short sentences. Periods, not commas.
- Reverent without solemn. Authoritative without arrogant.
- No "love and light" jargon. No exclamation points. No emoji.
- Spanish words appear naturally where they fit (despojo, limpieza, casa, espíritu). Never as decoration.

PUNCTUATION (STRICT)
- NEVER use em-dashes (—) or en-dashes (–) anywhere in the output. Wrong: "Slow down — the day rewards patience." Right: "Slow down. The day rewards patience." Hyphens in compound modifiers ("family-owned") are fine.

FORMATTING (STRICT)
- Plain prose inside each JSON field. NO markdown bold (**word**), italics, headers, or code fences. The ONLY allowed markup is the [[Display Name|product-slug]] inline link format described below.

CONTEXT
- This is a daily horoscope for everyone with ${args.sign} as their Sun sign.
- Date: ${args.dateLabel}.
${args.skyContext ? `- TODAY'S ACTUAL SKY (computed, trust this over your own guess): ${args.skyContext} If you reference the Moon or its phase, use exactly these placements. Do not invent other transits.` : `- You may reference the actual sky for this date if you know it (current Moon sign, notable transits). If unsure, speak to ${args.sign}'s archetypal terrain on a day like this rather than fabricating astronomical precision.`}

GUARDRAILS
- No medical, legal, or financial advice.
- No predictions of death, terminal illness, catastrophic harm.
- No predictions about pregnancy, fertility, or specific relationship outcomes.
- No analysis of named third parties.
- Honest about hard days. Empty reassurance disrespects the reader.

OUTPUT FORMAT
Return a single JSON object with this exact shape. No markdown fences, no commentary outside the JSON:

{
  "summary": "<2-3 sentences setting the day's tone for ${args.sign}. Specific to today's energy, not generic Sun-sign content.>",
  "focus": "<one of: ${fociList}. Whichever area today most asks attention from>",
  "action": "<one concrete thing for ${args.sign} to do today. Not a feeling. A verb. If the archive rituals below match, name the specific products and wrap each real Original Botanica product reference in [[Product Name|product-slug]] format using slugs from the archive. Plain text for generic supplies.>"
}

VARIETY (STRICT)
- The botanica's shelf is deep: baths, floor washes, oils, colognes, herbs, incense, written petitions, offerings, a glass of water, a walk to a crossroads. Rotate through it. A candle is one tool among many, not the default.
- A plain white candle may anchor the action at most once a week. If the recent readings below already used one, choose a different working entirely.
- Vary the VERB day to day: not always "light". Bathe, sweep, write, burn, carry, pour, speak, clean, offer, walk.${args.recentReadings ? `

THE LAST FEW DAYS (do not repeat yourself)
${args.recentReadings}
- Choose a "focus" different from all of the above.
- The "action" must differ in kind from the recent ones (different tool, different verb, different intention).` : ""}

When you reference a real Original Botanica product, wrap it as [[Display Name|product-slug]] using a slug from the archive below. Never invent a slug. Do not announce the markup; write naturally.
${args.retrievedRituals ? `

ORIGINAL BOTANICA RITUAL ARCHIVE (for today's action, if it fits)
${args.retrievedRituals}` : ""}

Return ONLY the JSON. No preamble. No code fences.`;

  const user = `Write today's horoscope for ${args.sign} for ${args.dateLabel}.`;

  return { system, user };
}

/**
 * Forgiving JSON parser — strips code fences, finds first/last brace,
 * validates the shape we need.
 */
export function parseDailyHoroscope(raw: string): DailyHoroscopeContent | null {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  const slice = text.slice(start, end + 1);

  try {
    const parsed = JSON.parse(slice);
    if (
      typeof parsed.summary === "string" &&
      typeof parsed.focus === "string" &&
      typeof parsed.action === "string"
    ) {
      return {
        summary: parsed.summary.trim(),
        focus: parsed.focus.trim().toLowerCase(),
        action: parsed.action.trim(),
      };
    }
    return null;
  } catch {
    return null;
  }
}
