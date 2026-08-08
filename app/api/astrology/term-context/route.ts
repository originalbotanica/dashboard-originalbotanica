import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { glossaryEntry } from "@/lib/astrology/glossary";
import { signName } from "@/lib/astrology/terms";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

/**
 * The member's personal placement for a glossary term, used by the
 * tappable-term card: "In your chart: Saturn in Capricorn, 5th house."
 *
 * Returns { line: string | null }. Null when the term has no personal
 * angle (aspects, concepts), the member has no chart yet, or the chart
 * lacks the placement (e.g. Rising without a birth time).
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ line: null }, { status: 401 });

  const key = new URL(request.url).searchParams.get("key") ?? "";
  const entry = glossaryEntry(key);
  const locale = await getLocale();

  const { data: profile } = await supabase
    .from("profiles")
    .select("sun_sign, moon_sign, rising_sign, chart_data")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !entry) return NextResponse.json({ line: null });

  const chart = (profile.chart_data ?? null) as {
    placements?: Array<{ name: string; sign: string; house?: number }>;
  } | null;

  const houseWord = locale === "es" ? "casa" : "house";
  const inWord = locale === "es" ? "en" : "in";

  const lineFor = (name: string, sign: string | null | undefined, house?: number) =>
    sign
      ? `${name} ${inWord} ${signName(sign, locale)}${house ? ` · ${houseWord} ${house}` : ""}`
      : null;

  let line: string | null = null;

  if (entry.kind === "planet" || entry.kind === "point") {
    const display = entry.name[locale];
    if (entry.key === "sun") {
      line = lineFor(display, profile.sun_sign);
    } else if (entry.key === "moon") {
      line = lineFor(display, profile.moon_sign);
    } else if (entry.key === "rising") {
      line = lineFor(display, profile.rising_sign);
    } else {
      const p = chart?.placements?.find(
        (pl) => pl.name.toLowerCase() === entry.key,
      );
      if (p) line = lineFor(display, p.sign, p.house);
    }
  } else if (entry.kind === "sign") {
    // If one of their big three lives in this sign, say so.
    const target = entry.name.en; // chart data stores English sign names
    const hits: string[] = [];
    const you = locale === "es"
      ? { sun: "tu Sol", moon: "tu Luna", rising: "tu Ascendente" }
      : { sun: "your Sun", moon: "your Moon", rising: "your Rising" };
    if (profile.sun_sign === target) hits.push(you.sun);
    if (profile.moon_sign === target) hits.push(you.moon);
    if (profile.rising_sign === target) hits.push(you.rising);
    if (hits.length) {
      line =
        locale === "es"
          ? `Aquí ${hits.length > 1 ? "viven" : "vive"} ${hits.join(" y ")}.`
          : `This is home to ${hits.join(" and ")}.`;
    }
  }

  return NextResponse.json({ line });
}
