import { getMoon } from "./moon";

/**
 * Today's sky, computed locally. No API, no cost, nothing to break.
 *
 * Low-precision solar and lunar ecliptic longitudes (truncated series from
 * Meeus, Astronomical Algorithms). Accuracy is a fraction of a degree, which
 * is far more than a "Moon in Pisces" line needs. The moon moves about half
 * a degree per hour, so even a few hours of error never shifts the sign by
 * more than the boundary minutes around an ingress.
 */

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

const DEG = Math.PI / 180;

function norm360(d: number): number {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

function julianCenturies(date: Date): number {
  const jd = date.getTime() / 86_400_000 + 2440587.5;
  return (jd - 2451545.0) / 36525;
}

/** Sun's apparent ecliptic longitude, degrees. Accuracy ~0.01 deg. */
export function sunLongitude(date: Date = new Date()): number {
  const T = julianCenturies(date);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  return norm360(L0 + C);
}

/** Moon's ecliptic longitude, degrees. Accuracy ~0.3 deg. */
export function moonLongitude(date: Date = new Date()): number {
  const T = julianCenturies(date);
  const Lp = 218.3164477 + 481267.88123421 * T; // mean longitude
  const D = (297.8501921 + 445267.1114034 * T) * DEG; // mean elongation
  const M = (357.5291092 + 35999.0502909 * T) * DEG; // sun mean anomaly
  const Mp = (134.9633964 + 477198.8675055 * T) * DEG; // moon mean anomaly
  const F = (93.272095 + 483202.0175233 * T) * DEG; // argument of latitude

  const lon =
    Lp +
    6.288774 * Math.sin(Mp) +
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057066 * Math.sin(2 * D - M - Mp) +
    0.053322 * Math.sin(2 * D + Mp) +
    0.045758 * Math.sin(2 * D - M);
  return norm360(lon);
}

export function signOfLongitude(lon: number): ZodiacSign {
  return ZODIAC_SIGNS[Math.floor(norm360(lon) / 30) % 12];
}

export type SkyAspect = {
  name: "conjunct" | "sextile" | "square" | "trine" | "opposite";
  /** One line of house guidance for the aspect. */
  meaning: string;
};

const ASPECTS: Array<{ angle: number; orb: number; aspect: SkyAspect }> = [
  {
    angle: 0,
    orb: 8,
    aspect: {
      name: "conjunct",
      meaning: "Will and feeling move as one. Set intentions with confidence.",
    },
  },
  {
    angle: 60,
    orb: 5,
    aspect: {
      name: "sextile",
      meaning: "An open door. Small efforts carry further than usual today.",
    },
  },
  {
    angle: 90,
    orb: 6,
    aspect: {
      name: "square",
      meaning:
        "Head and heart pull in different directions. Go gently with yourself and others.",
    },
  },
  {
    angle: 120,
    orb: 6,
    aspect: {
      name: "trine",
      meaning: "The current runs easy. A good day for work you have put off.",
    },
  },
  {
    angle: 180,
    orb: 8,
    aspect: {
      name: "opposite",
      meaning:
        "Everything is illuminated, including what you would rather not see. Release what is finished.",
    },
  },
];

export type TodaysSky = {
  moonSign: ZodiacSign;
  sunSign: ZodiacSign;
  waxing: boolean;
  phaseName: string;
  /** Moon-sun aspect currently in orb, if any. */
  aspect: SkyAspect | null;
};

export type LunarEvent = {
  kind: "new" | "full";
  /** Day of month, 1-31, in US Eastern time. */
  day: number;
  /** The sign the moon stands in at the event. */
  sign: ZodiacSign;
};

/**
 * Real new and full moon dates for a month, computed from sun-moon
 * elongation. Used to anchor the forecast's key dates so the lunar events
 * it names are the actual ones.
 */
export function lunarEventsForMonth(year: number, month: number): LunarEvent[] {
  const events: LunarEvent[] = [];
  // Scan hourly so the event lands on the right Eastern calendar day and
  // the moon's sign is read at the event itself, not hours later.
  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 1);
  let prev = elongation(new Date(start - 3_600_000));
  for (let t = start; t < end; t += 3_600_000) {
    const d = new Date(t);
    const cur = elongation(d);
    const easternDay = Number(
      d.toLocaleDateString("en-US", {
        day: "numeric",
        timeZone: "America/New_York",
      }),
    );
    const easternMonth = Number(
      d.toLocaleDateString("en-US", {
        month: "numeric",
        timeZone: "America/New_York",
      }),
    );
    if (easternMonth === month) {
      // New moon: elongation wraps past 360 back toward 0.
      if (cur < prev) {
        events.push({
          kind: "new",
          day: easternDay,
          sign: signOfLongitude(moonLongitude(d)),
        });
      }
      // Full moon: elongation crosses 180.
      if (prev < 180 && cur >= 180) {
        events.push({
          kind: "full",
          day: easternDay,
          sign: signOfLongitude(moonLongitude(d)),
        });
      }
    }
    prev = cur;
  }
  return events;
}

/** Moon's elongation from the sun, 0..360 degrees. */
function elongation(date: Date): number {
  return norm360(moonLongitude(date) - sunLongitude(date));
}

export function getTodaysSky(date: Date = new Date()): TodaysSky {
  const sunLon = sunLongitude(date);
  const moonLon = moonLongitude(date);
  const moon = getMoon(date);

  let sep = Math.abs(moonLon - sunLon);
  if (sep > 180) sep = 360 - sep;

  let aspect: SkyAspect | null = null;
  for (const a of ASPECTS) {
    if (Math.abs(sep - a.angle) <= a.orb) {
      aspect = a.aspect;
      break;
    }
  }

  return {
    moonSign: signOfLongitude(moonLon),
    sunSign: signOfLongitude(sunLon),
    waxing: moon.waxing,
    phaseName: moon.phaseName,
    aspect,
  };
}
