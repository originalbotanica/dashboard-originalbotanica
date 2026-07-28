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
 * The UTC offset a timezone was actually using on a given date — which
 * is the whole ballgame for a birth chart.
 *
 * A birth at 10:40 PM on June 9, 1989 in New Jersey happened at UTC-4
 * (daylight time), not UTC-5. Feed the chart engine -5 and you've moved
 * the birth an hour later: the rising sign shifts by up to half a sign
 * and every house cusp is wrong. Two-thirds of birthdays fall inside
 * daylight time, so this is not an edge case.
 *
 * Intl carries the full historical timezone database, so this is correct
 * for old DST rules too (the US moved its dates in 1987 and 2007).
 */
function offsetForZoneAt(
  iana: string,
  y: number,
  mo: number,
  d: number,
  hh: number,
  mn: number,
): number | null {
  const read = (at: Date): number | null => {
    try {
      const s = new Intl.DateTimeFormat("en-US", {
        timeZone: iana,
        timeZoneName: "longOffset",
      }).format(at);
      const m = s.match(/GMT([+-])(\d{1,2}):(\d{2})/);
      if (!m) return 0; // "GMT" with no offset = UTC
      const sign = m[1] === "-" ? -1 : 1;
      return sign * (Number(m[2]) + Number(m[3]) / 60);
    } catch {
      return null;
    }
  };
  // The local time is known but the instant isn't yet, so read the
  // offset once to approximate the instant, then read it again there.
  const naive = Date.UTC(y, mo - 1, d, hh, mn);
  const first = read(new Date(naive));
  if (first === null) return null;
  return read(new Date(naive - first * 3_600_000));
}

/**
 * Common birthplaces with their IANA timezone, so the offset can be
 * resolved for the actual birth date rather than assumed.
 */
const PLACES: Record<
  string,
  { lat: number; lon: number; zone: string }
> = {
  "the bronx": { lat: 40.8448, lon: -73.8648, zone: "America/New_York" },
  bronx: { lat: 40.8448, lon: -73.8648, zone: "America/New_York" },
  "new york": { lat: 40.7128, lon: -74.006, zone: "America/New_York" },
  brooklyn: { lat: 40.6782, lon: -73.9442, zone: "America/New_York" },
  queens: { lat: 40.7282, lon: -73.7949, zone: "America/New_York" },
  manhattan: { lat: 40.7831, lon: -73.9712, zone: "America/New_York" },
  "los angeles": { lat: 34.0522, lon: -118.2437, zone: "America/Los_Angeles" },
  chicago: { lat: 41.8781, lon: -87.6298, zone: "America/Chicago" },
  miami: { lat: 25.7617, lon: -80.1918, zone: "America/New_York" },
  havana: { lat: 23.1136, lon: -82.3666, zone: "America/Havana" },
  "san juan": { lat: 18.4655, lon: -66.1057, zone: "America/Puerto_Rico" },
  "mexico city": { lat: 19.4326, lon: -99.1332, zone: "America/Mexico_City" },
  "santo domingo": { lat: 18.4861, lon: -69.9312, zone: "America/Santo_Domingo" },
  "port-au-prince": { lat: 18.5944, lon: -72.3074, zone: "America/Port-au-Prince" },
};

/**
 * Geocode a city string to lat/lon and the UTC offset in force on the
 * birth date (daylight saving included).
 */
export async function geocode(
  city: string,
  date: { year: number; month: number; day: number; hour?: number; min?: number },
): Promise<{ lat: number; lon: number; tzone: number } | null> {
  if (!city) return null;
  const hour = date.hour ?? 12;
  const min = date.min ?? 0;

  if (authHeader()) {
    try {
      const result = await call<{
        latitude: number;
        longitude: number;
        timezone: number;
        timezone_name?: string;
      }>("geo_details", { place: city });

      if (result?.latitude != null) {
        // Prefer a real timezone name so DST is resolved for the birth
        // date. Some responses include one; when they don't, ask the
        // API's own DST-aware endpoint before trusting the raw number.
        let tzone: number | null = null;

        if (result.timezone_name) {
          tzone = offsetForZoneAt(
            result.timezone_name,
            date.year,
            date.month,
            date.day,
            hour,
            min,
          );
        }

        if (tzone === null) {
          try {
            const dst = await call<{ timezone: number }>("timezone_with_dst", {
              latitude: result.latitude,
              longitude: result.longitude,
              date: `${date.day}-${date.month}-${date.year}`,
            });
            if (typeof dst?.timezone === "number") tzone = dst.timezone;
          } catch {
            /* fall through to the raw offset */
          }
        }

        return {
          lat: result.latitude,
          lon: result.longitude,
          tzone: tzone ?? result.timezone,
        };
      }
    } catch (err) {
      console.error("geocode error:", err);
    }
  }

  const key = city.toLowerCase().split(",")[0].trim();
  const place = PLACES[key];
  if (!place) return null;
  const tzone = offsetForZoneAt(
    place.zone,
    date.year,
    date.month,
    date.day,
    hour,
    min,
  );
  return { lat: place.lat, lon: place.lon, tzone: tzone ?? -5 };
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
