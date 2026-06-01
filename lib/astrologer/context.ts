import { createClient } from "@/utils/supabase/server";
import {
  getNatalChart,
  geocode,
  type BirthInput,
  type ChartData,
} from "@/lib/astrology-api";

/**
 * Loads the user's full astrology context for an AI Astrologer
 * conversation: their natal chart + profile metadata.
 *
 * Lazy-materializes the chart into profiles.chart_data the first
 * time it's needed, so subsequent conversations are fast.
 *
 * SCHEMA NOTE
 * The astrology standalone site used profiles.user_id and birth_city.
 * The membership uses profiles.id and birth_place. This file is the
 * adapter that bridges the two conventions.
 */

export type AstrologerContext = {
  firstName: string;
  birthDate: string;
  birthCity: string;             // we store this as birth_place in the DB
  birthTime: string | null;
  chart: ChartData;
  isUnderEighteen: boolean;
};

export async function loadAstrologerContext(
  userId: string,
): Promise<AstrologerContext | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, birth_date, birth_time, birth_place, chart_data, chart_generated_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.birth_date || !profile?.birth_place) return null;

  let chart: ChartData;
  if (profile.chart_data) {
    chart = profile.chart_data as ChartData;
  } else {
    chart = await computeChart(
      profile.birth_date,
      profile.birth_time,
      profile.birth_place,
    );
    await supabase
      .from("profiles")
      .update({
        chart_data: chart,
        chart_generated_at: new Date().toISOString(),
        // Mirror sign columns we already have on profiles so the rest of
        // the app (dashboard hero, etc.) doesn't have to deserialize JSON.
        sun_sign: chart.sunSign || null,
        moon_sign: chart.moonSign || null,
        rising_sign: chart.risingSign || null,
      })
      .eq("id", userId);
  }

  return {
    firstName: profile.first_name || "friend",
    birthDate: profile.birth_date,
    birthCity: profile.birth_place,
    birthTime: profile.birth_time,
    chart,
    isUnderEighteen: isMinor(profile.birth_date),
  };
}

async function computeChart(
  birthDate: string,
  birthTime: string | null,
  birthPlace: string,
): Promise<ChartData> {
  const [yyyy, mm, dd] = birthDate.split("-").map(Number);
  const [hh, mn] = (birthTime || "12:00").split(":").map(Number);
  const geo = await geocode(birthPlace, {
    year: yyyy,
    month: mm,
    day: dd,
  });

  const input: BirthInput = {
    day: dd,
    month: mm,
    year: yyyy,
    hour: birthTime ? hh : 12,
    min: birthTime ? mn : 0,
    lat: geo?.lat ?? 40.8448,   // default: the Bronx
    lon: geo?.lon ?? -73.8648,
    tzone: geo?.tzone ?? -5,
  };

  return await getNatalChart(input);
}

function isMinor(birthDate: string): boolean {
  const birth = new Date(birthDate + "T00:00:00Z");
  const now = new Date();
  const ageMs = now.getTime() - birth.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  return ageYears < 18;
}
