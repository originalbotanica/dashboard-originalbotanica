/**
 * Wrapper around AstrologyAPI.com.
 * Auth: HTTP Basic with userId:apiKey.
 *
 * Env vars (set in Vercel when Jason provides credentials):
 *   ASTROLOGY_API_USER_ID
 *   ASTROLOGY_API_KEY
 *
 * If env vars are missing, returns mock data so the page still renders
 * during development.
 */

const BASE_URL = "https://json.astrologyapi.com/v1";

export type BirthInput = {
  day: number;       // 1-31
  month: number;     // 1-12
  year: number;      // e.g. 1990
  hour: number;      // 0-23
  min: number;       // 0-59
  lat: number;       // -90 to 90
  lon: number;       // -180 to 180
  tzone: number;     // hours offset from UTC, e.g. -5 for EST
};

export type ChartPlacement = {
  name: string;        // "Sun", "Moon", "Ascendant", "Mercury", ...
  sign: string;        // "Aries", "Taurus", ...
  full_name?: string;  // "Sun in Aries"
  house?: number;      // 1-12
  is_retro?: string;   // "true" | "false"
  normDegree?: number; // degree within sign
};

export type ChartData = {
  placements: ChartPlacement[];
  sunSign: string;
  moonSign: string;
  risingSign: string | null;  // null if birth time unknown
  chartImageUrl: string | null;
  isMocked: boolean;
};

function authHeader(): string | null {
  const userId = process.env.ASTROLOGY_API_USER_ID;
  const apiKey = process.env.ASTROLOGY_API_KEY;
  if (!userId || !apiKey) return null;
  return "Basic " + Buffer.from(`${userId}:${apiKey}`).toString("base64");
}

async function call<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const auth = authHeader();
  if (!auth) throw new Error("ASTROLOGY_API credentials missing");

  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "Accept-Language": "en",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `AstrologyAPI ${endpoint} failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  return (await res.json()) as T;
}

/**
 * Get the full natal chart: placements + chart wheel image URL.
 * Falls back to mocked data if env credentials are missing.
 */
export async function getNatalChart(input: BirthInput): Promise<ChartData> {
  if (!authHeader()) {
    return mockChart(input);
  }

  try {
    // Western horoscope → placements + houses
    const horoscope = await call<{
      planets: ChartPlacement[];
      houses?: Array<{ house: number; sign: string; degree?: number }>;
      ascendant?: number;
    }>("western_horoscope", input);

    // Natal wheel chart → image URL
    const wheel = await call<{ chart_url: string }>("natal_wheel_chart", input);

    const placements = horoscope.planets || [];
    const sunSign =
      placements.find((p) => p.name === "Sun")?.sign || "Unknown";
    const moonSign =
      placements.find((p) => p.name === "Moon")?.sign || "Unknown";

    // Rising sign lives in the houses array (1st house cusp), not the planets array.
    // Fall back to looking by name in planets in case the API ever returns it there,
    // and finally compute from ascendant degrees if all else fails.
    const risingSign =
      horoscope.houses?.find((h) => h.house === 1)?.sign ||
      placements.find((p) => /^ascendant$/i.test(p.name) || /^asc$/i.test(p.name))?.sign ||
      signFromDegrees(horoscope.ascendant) ||
      null;

    return {
      placements,
      sunSign,
      moonSign,
      risingSign,
      chartImageUrl: wheel.chart_url || null,
      isMocked: false,
    };
  } catch (err) {
    console.error("getNatalChart error:", err);
    // Return mock so the page still renders rather than 500ing
    return mockChart(input);
  }
}

/**
 * Geocode a city string to lat/lon/timezone.
 * Uses AstrologyAPI's geo_details if credentials are set, otherwise
 * a small built-in fallback table (covers a handful of common cities).
 */
export async function geocode(
  city: string,
  date: { year: number; month: number; day: number },
): Promise<{ lat: number; lon: number; tzone: number } | null> {
  if (!city) return null;

  if (authHeader()) {
    try {
      const result = await call<{
        latitude: number;
        longitude: number;
        timezone: number;
      }>("geo_details", { place: city });
      if (result?.latitude != null) {
        return {
          lat: result.latitude,
          lon: result.longitude,
          tzone: result.timezone,
        };
      }
    } catch (err) {
      console.error("geocode error:", err);
    }
  }

  // Fallback table for common places. Real geocoding lands when we have
  // the API key wired in.
  const fallbacks: Record<string, { lat: number; lon: number; tzone: number }> = {
    "the bronx": { lat: 40.8448, lon: -73.8648, tzone: -5 },
    "bronx": { lat: 40.8448, lon: -73.8648, tzone: -5 },
    "new york": { lat: 40.7128, lon: -74.006, tzone: -5 },
    "los angeles": { lat: 34.0522, lon: -118.2437, tzone: -8 },
    "chicago": { lat: 41.8781, lon: -87.6298, tzone: -6 },
    "miami": { lat: 25.7617, lon: -80.1918, tzone: -5 },
    "havana": { lat: 23.1136, lon: -82.3666, tzone: -5 },
    "san juan": { lat: 18.4655, lon: -66.1057, tzone: -4 },
    "mexico city": { lat: 19.4326, lon: -99.1332, tzone: -6 },
  };
  const key = city.toLowerCase().split(",")[0].trim();
  return fallbacks[key] || null;
}

/**
 * Convert an ecliptic longitude (degrees, 0-360) to a zodiac sign name.
 * Each sign is 30°: 0=Aries, 30=Taurus, ... 330=Pisces.
 */
function signFromDegrees(deg: number | undefined): string | null {
  if (deg == null || !Number.isFinite(deg)) return null;
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  const idx = Math.floor(((deg % 360) + 360) % 360 / 30);
  return signs[idx] || null;
}

/**
 * Mocked chart data — used when API credentials aren't set yet.
 * Returns plausible-looking placements so the UI can render.
 */
function mockChart(input: BirthInput): ChartData {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  // Pseudo-randomize by birth values so the same input returns the same mock
  const seed = (input.day + input.month * 31 + input.year + input.hour) % 12;
  const pick = (offset: number) => signs[(seed + offset + 12) % 12];

  return {
    placements: [
      { name: "Sun", sign: pick(0), full_name: `Sun in ${pick(0)}`, house: 1 },
      { name: "Moon", sign: pick(3), full_name: `Moon in ${pick(3)}`, house: 4 },
      { name: "Ascendant", sign: pick(7), full_name: `Ascendant in ${pick(7)}`, house: 1 },
      { name: "Mercury", sign: pick(1), house: 1 },
      { name: "Venus", sign: pick(2), house: 2 },
      { name: "Mars", sign: pick(5), house: 6 },
      { name: "Jupiter", sign: pick(9), house: 10 },
      { name: "Saturn", sign: pick(6), house: 7 },
    ],
    sunSign: pick(0),
    moonSign: pick(3),
    risingSign: input.hour >= 0 ? pick(7) : null,
    chartImageUrl: null,
    isMocked: true,
  };
}
