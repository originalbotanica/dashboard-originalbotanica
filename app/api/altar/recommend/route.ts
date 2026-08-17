import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAnthropic, CHAT_MODEL } from "@/lib/astrologer/anthropic";
import { DESIRES } from "@/lib/altar/catalog";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

/**
 * The counter: a member says what they need, the house suggests which
 * prepared candle to light — the digital version of asking whoever is
 * behind the register at Webster Avenue.
 *
 * POST { need: string } → { picks: [{ slug, name, tagline, why }] }
 *
 * Picks come only from the real altar catalog (DESIRES); the model
 * chooses and writes one warm line each, and anything it invents that
 * isn't in the catalog is dropped server-side.
 */

const CANDLES = DESIRES.flatMap((d) =>
  d.candles.map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    desire: d.label,
  })),
);
const BY_SLUG = new Map(CANDLES.map((c) => [c.slug, c]));

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const byUser = rateLimit(`counter:${user.id}`, 15, 10 * 60_000);
  const byIp = rateLimit(`counter:ip:${clientIp(request)}`, 30, 10 * 60_000);
  if (!byUser.ok || !byIp.ok) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { need?: string };
  const need = String(body.need ?? "").trim().slice(0, 300);
  if (need.length < 3) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const locale = await getLocale();
  const list = CANDLES.map(
    (c) => `${c.slug} | ${c.name} | ${c.tagline} | ${c.desire}`,
  ).join("\n");

  const system = `You are the person behind the counter at Original Botanica, a family-owned spiritual house in The Bronx since 1959. A member of The Practice tells you what they need; you tell them which prepared 7-day candle to light, exactly as you would across the counter.

THE SHELF (the only candles that exist — slug | name | tagline | shelf section):
${list}

RULES
- Choose ONE candle, or TWO when two genuinely serve different angles of the need (e.g. steady work vs opening the road to it). Never more than two.
- Only slugs from the shelf. Never invent one.
- For each pick write "why": ONE warm sentence, spoken plainly, that ties THIS candle to THEIR words. No astrology jargon, no exclamation points, no em-dashes. ${locale === "es" ? "Write the why in natural, warm Latin American Spanish." : "Write the why in English."}
- If the need involves harm to someone, a specific person's free will, or is really a crisis (self-harm, abuse), pick the closest protective or peace candle and keep the why gentle and safe. Never promise outcomes.
- Respond with ONLY this JSON, nothing else: {"picks":[{"slug":"...","why":"..."}]}`;

  try {
    const res = await getAnthropic().messages.create({
      model: CHAT_MODEL,
      max_tokens: 300,
      system,
      messages: [{ role: "user", content: need }],
    });
    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");
    const m = text.match(/\{[\s\S]*\}/);
    const parsed = m ? (JSON.parse(m[0]) as { picks?: Array<{ slug: string; why: string }> }) : null;
    const picks = (parsed?.picks ?? [])
      .filter((p) => BY_SLUG.has(p.slug))
      .slice(0, 2)
      .map((p) => {
        const c = BY_SLUG.get(p.slug)!;
        return { slug: c.slug, name: c.name, tagline: c.tagline, why: String(p.why ?? "").slice(0, 240) };
      });
    if (picks.length === 0) {
      return NextResponse.json({ error: "nomatch" }, { status: 422 });
    }
    return NextResponse.json({ picks });
  } catch (err) {
    console.error("counter recommend failed", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
