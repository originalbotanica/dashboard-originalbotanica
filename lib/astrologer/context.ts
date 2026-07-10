import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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
    chart = await captureChartWheel(userId, chart);
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
    lat: geo?.lat ?? 40.8448,   // default: The Bronx
    lon: geo?.lon ?? -73.8648,
    tzone: geo?.tzone ?? -5,
  };

  return await getNatalChart(input);
}

const CHART_BUCKET = "chart-wheels";

/**
 * Capture the AstrologyAPI wheel SVG into our own Supabase Storage at
 * generation time — while its temporary URL is still alive — and point the
 * chart at that permanent copy.
 *
 * AstrologyAPI's chart_url is ephemeral: a cached link goes 403 within days,
 * which left the chart page showing an empty box. A copy on our side never
 * expires and is always served with the correct image/svg+xml content type.
 *
 * Best-effort: if the fetch or upload fails we keep the original URL and let
 * the <ChartWheel> component hide a broken image rather than break the page.
 */
async function captureChartWheel(
  userId: string,
  chart: ChartData,
): Promise<ChartData> {
  const sourceUrl = chart.chartImageUrl;
  if (!sourceUrl) return chart;

  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) return chart;
    const bytes = await res.arrayBuffer();

    const admin = createAdminClient();

    // Create the bucket once (public read) if it isn't there yet.
    const { data: bucket } = await admin.storage.getBucket(CHART_BUCKET);
    if (!bucket) {
      await admin.storage.createBucket(CHART_BUCKET, { public: true });
    }

    const path = `${userId}.svg`;
    const { error: uploadErr } = await admin.storage
      .from(CHART_BUCKET)
      .upload(path, bytes, {
        contentType: "image/svg+xml",
        upsert: true,
      });
    if (uploadErr) {
      console.error("captureChartWheel upload error:", uploadErr);
      return chart;
    }

    const { data: pub } = admin.storage.from(CHART_BUCKET).getPublicUrl(path);
    if (!pub?.publicUrl) return chart;

    // Cache-bust so a regenerated wheel replaces the old one in browsers.
    return { ...chart, chartImageUrl: `${pub.publicUrl}?v=${Date.now()}` };
  } catch (err) {
    console.error("captureChartWheel error:", err);
    return chart;
  }
}

function isMinor(birthDate: string): boolean {
  const birth = new Date(birthDate + "T00:00:00Z");
  const now = new Date();
  const ageMs = now.getTime() - birth.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  return ageYears < 18;
}
