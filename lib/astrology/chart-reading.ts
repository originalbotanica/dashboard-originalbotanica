import { createAdminClient } from "@/utils/supabase/admin";
import { getAnthropic, ASTROLOGER_MODEL } from "@/lib/astrologer/anthropic";
import { sanitizeStringsDeep } from "@/lib/llm/sanitize";
import type { AstrologerContext } from "@/lib/astrologer/context";

/**
 * The written natal-chart reading — Glenn's note made flesh: the chart page
 * showed data (wheel + placements) but never answered "so what does this
 * mean for me." This generates that answer once, in the house voice, and
 * caches it per (user, locale). It regenerates only if the underlying birth
 * data changes (tracked by a hash of the placements).
 *
 * Cache table (service-role access only; run once in Supabase):
 *   create table if not exists public.chart_readings (
 *     user_id uuid not null references auth.users(id) on delete cascade,
 *     locale text not null default 'en',
 *     chart_hash text not null,
 *     content jsonb not null,
 *     generated_at timestamptz not null default now(),
 *     primary key (user_id, locale)
 *   );
 *   alter table public.chart_readings enable row level security;
 *
 * All cache reads/writes are best-effort: if the table doesn't exist yet the
 * reading still generates, it just isn't remembered.
 */

export type ChartReadingSection = { title: string; body: string };
export type ChartReading = {
  opening: string;
  sections: ChartReadingSection[];
  closing: string;
};

function chartHash(ctx: AstrologerContext): string {
  const c = ctx.chart;
  const parts = [
    ctx.birthDate,
    ctx.birthTime || "no-time",
    c.sunSign,
    c.moonSign,
    c.risingSign || "",
    ...c.placements.map((p) => `${p.name}:${p.sign}:${p.house ?? ""}`),
  ].join("|");
  // Small stable hash (djb2) — collision risk irrelevant at this scale.
  let h = 5381;
  for (let i = 0; i < parts.length; i++) h = ((h << 5) + h + parts.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

export async function getOrGenerateChartReading(
  userId: string,
  ctx: AstrologerContext,
  firstName: string,
  locale: "en" | "es" = "en",
): Promise<ChartReading | null> {
  const supabase = createAdminClient();
  const hash = chartHash(ctx);

  try {
    const { data: cached } = await supabase
      .from("chart_readings")
      .select("content, chart_hash")
      .eq("user_id", userId)
      .eq("locale", locale)
      .maybeSingle();
    if (cached?.content && cached.chart_hash === hash) {
      return cached.content as ChartReading;
    }
  } catch {
    /* table may not exist yet; generate without cache */
  }

  const { chart } = ctx;
  const hasTime = Boolean(ctx.birthTime);
  const placementLines = chart.placements
    .map(
      (p) =>
        `${p.name}: ${p.sign}${hasTime && p.house != null ? `, house ${p.house}` : ""}`,
    )
    .join("\n");

  const langRule =
    locale === "es"
      ? `\n\nLANGUAGE\n- Write every field in natural, warm Latin American Spanish. Keep planet and sign names in Spanish (Sol, Luna, Escorpio...). Capitalize Orishas if mentioned.`
      : "";

  const system = `You are the astrologer for Original Botanica, a family-owned spiritual house serving The Bronx and the world since 1959. You speak as the institutional voice of the house.${langRule}

VOICE
- Grounded, direct, warm. Short sentences. Periods, not commas.
- Teach the why: the reader may know nothing about astrology. Every placement you name must be explained in plain words a first-timer understands.
- Honest about hard placements; no empty reassurance, no doom.
- No "love and light" jargon. No exclamation points. No emoji.

PUNCTUATION (STRICT)
- NEVER use em-dashes or en-dashes anywhere. Use periods or commas.

FORMATTING (STRICT)
- Plain prose in every field. No markdown of any kind.

THE TASK
Write ${firstName}'s natal chart reading from these placements (computed, trust them exactly; invent nothing beyond them):

${placementLines}
${hasTime ? "" : "\nNOTE: birth time unknown, so there is no Rising sign and no houses. Do not mention houses or the Ascendant at all; interpret sign placements only."}

GUARDRAILS
- No medical, legal, or financial advice. No predictions of death or catastrophe. No pregnancy predictions.

OUTPUT FORMAT
Return a single JSON object, nothing else:

{
  "opening": "<2-3 sentences: what a natal chart is (a photograph of the sky the moment they were born) and the overall weather of THIS chart. Address ${firstName} directly.>",
  "sections": [
    { "title": "<short heading naming the placement, e.g. 'Sun in Scorpio'>", "body": "<3-4 sentences: what this placement means in their life, in plain warm language>" }
    // 4 to 6 sections total: always Sun and Moon${hasTime ? " and Rising" : ""}, then the 2-3 most defining other placements from the list
  ],
  "closing": "<2-3 sentences: how these pieces sit together as one person, and one line inviting them to bring a real question to the astrologer>"
}

Return ONLY the JSON. No code fences.`;

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: ASTROLOGER_MODEL,
    max_tokens: 1800,
    system,
    messages: [
      { role: "user", content: `Write the natal chart reading for ${firstName}.` },
    ],
  });

  const raw = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) return null;

  let parsed: ChartReading;
  try {
    const candidate = JSON.parse(raw.slice(start, end + 1));
    if (
      typeof candidate.opening !== "string" ||
      !Array.isArray(candidate.sections) ||
      typeof candidate.closing !== "string"
    ) {
      return null;
    }
    parsed = {
      opening: candidate.opening.trim(),
      sections: candidate.sections
        .filter(
          (s: unknown): s is ChartReadingSection =>
            !!s &&
            typeof (s as ChartReadingSection).title === "string" &&
            typeof (s as ChartReadingSection).body === "string",
        )
        .map((s: ChartReadingSection) => ({ title: s.title.trim(), body: s.body.trim() })),
      closing: candidate.closing.trim(),
    };
  } catch {
    return null;
  }

  const clean = sanitizeStringsDeep(parsed) as ChartReading;

  try {
    await supabase.from("chart_readings").upsert(
      {
        user_id: userId,
        locale,
        chart_hash: hash,
        content: clean,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,locale" },
    );
  } catch {
    /* best-effort cache */
  }

  return clean;
}
