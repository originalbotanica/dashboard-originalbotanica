/**
 * Locale-aware names for zodiac signs and planets/points.
 *
 * Stored chart values are English (e.g. "Gemini", "Mercury"). These helpers
 * render them in the member's language, falling back to the original value for
 * anything not in the map (so an unexpected point name never breaks the page).
 */

type Locale = "en" | "es";

const SIGN_ES: Record<string, string> = {
  Aries: "Aries",
  Taurus: "Tauro",
  Gemini: "Géminis",
  Cancer: "Cáncer",
  Leo: "Leo",
  Virgo: "Virgo",
  Libra: "Libra",
  Scorpio: "Escorpio",
  Sagittarius: "Sagitario",
  Capricorn: "Capricornio",
  Aquarius: "Acuario",
  Pisces: "Piscis",
};

const PLANET_ES: Record<string, string> = {
  Sun: "Sol",
  Moon: "Luna",
  Ascendant: "Ascendente",
  Rising: "Ascendente",
  Mercury: "Mercurio",
  Venus: "Venus",
  Mars: "Marte",
  Jupiter: "Júpiter",
  Saturn: "Saturno",
  Uranus: "Urano",
  Neptune: "Neptuno",
  Pluto: "Plutón",
  Chiron: "Quirón",
  "North Node": "Nodo Norte",
  "South Node": "Nodo Sur",
};

/** Zodiac sign name in the given locale. */
export function signName(value: string | null | undefined, locale: Locale): string {
  if (!value) return "—";
  return locale === "es" ? SIGN_ES[value] ?? value : value;
}

/** Planet / point name in the given locale. */
export function planetName(value: string, locale: Locale): string {
  return locale === "es" ? PLANET_ES[value] ?? value : value;
}

const MOON_PHASE_ES: Record<string, string> = {
  "New Moon": "Luna Nueva",
  "Waxing Crescent": "Luna Creciente",
  "First Quarter": "Cuarto Creciente",
  "Waxing Gibbous": "Gibosa Creciente",
  "Full Moon": "Luna Llena",
  "Waning Gibbous": "Gibosa Menguante",
  "Last Quarter": "Cuarto Menguante",
  "Waning Crescent": "Luna Menguante",
};

/** Moon phase name in the given locale. */
export function moonPhaseName(value: string, locale: Locale): string {
  return locale === "es" ? MOON_PHASE_ES[value] ?? value : value;
}
