import { lunarEventsForMonth, sunLongitude } from "@/lib/astrology/sky";
import { getSaintCandle } from "@/lib/altar/catalog";

/**
 * The spiritual calendar.
 *
 * Surfaces what each day holds in the traditions Original Botanica serves —
 * saint / Orisha feast days, the new and full moons, the turning of the
 * seasons, and Mercury retrograde — and ties each to an action in The
 * Practice (light a candle, honor an ancestor, read tonight's moon, ask the
 * astrologer).
 *
 * Durable by design: moons and equinoxes/solstices are *computed* from the
 * local sky engine (never a stale table), and feast days are fixed calendar
 * dates that recur every year. Only Mercury retrograde is a curated, dated
 * list (astronomical ephemeris we don't compute) and needs a yearly refresh.
 *
 * Feast-day dates follow the widely-kept Cuban Lucumí / Santería calendar;
 * Orisha associations are given where they are well established and phrased
 * as honoring both together, since houses vary.
 */

export type CalType = "feast" | "lunar" | "seasonal" | "planet";

export type CalEvent = {
  id: string;
  y: number;
  m: number; // 1-12
  d: number; // 1-31, US Eastern
  type: CalType;
  /** Display title, e.g. "Santa Bárbara · Changó". */
  title: string;
  /** Short line, English. */
  en: string;
  /** Short line, Spanish. */
  es: string;
  /** Accent color for the card. */
  color: string;
  /** Where the day's action goes, and its label in each language. */
  action: { href: string; en: string; es: string };
};

const CANDLE = (intention: string) =>
  `/altar/virtual/new?intention=${encodeURIComponent(intention)}`;

// ── Feast days (recurring every year) ─────────────────────────────────────
type Feast = {
  m: number;
  d: number;
  id: string;
  title: string;
  en: string;
  es: string;
  color: string;
  action: CalEvent["action"];
};

const FEASTS: Feast[] = [
  {
    m: 1,
    d: 6,
    id: "reyes",
    title: "Día de Reyes — Three Kings",
    en: "Epiphany. A day of blessing for the year ahead; light a candle for protection and clear roads.",
    es: "Epifanía. Un día de bendición para el año; enciende una vela por protección y caminos abiertos.",
    color: "#e8ac7c",
    action: { href: CANDLE("Blessings for the year ahead"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 2,
    d: 2,
    id: "candelaria",
    title: "La Candelaria · Oyá",
    en: "Candlemas, honored with Oyá, keeper of the gates of change. Light a candle for transformation.",
    es: "La Candelaria, honrada con Oyá, guardiana de los cambios. Enciende una vela por la transformación.",
    color: "#b98cf0",
    action: { href: CANDLE("Honoring Oyá on La Candelaria"), en: "Light a candle for Oyá", es: "Vela para Oyá" },
  },
  {
    m: 6,
    d: 13,
    id: "san-antonio",
    title: "San Antonio · Eleguá",
    en: "St. Anthony, honored with Eleguá, who opens the roads. Light a red and black candle to clear the way.",
    es: "San Antonio, honrado con Eleguá, quien abre los caminos. Enciende una vela roja y negra para abrir camino.",
    color: "#f0855a",
    action: { href: CANDLE("Honoring Eleguá — open my roads"), en: "Light a candle for Eleguá", es: "Vela para Eleguá" },
  },
  {
    m: 6,
    d: 24,
    id: "san-juan",
    title: "San Juan Bautista",
    en: "The feast of St. John the Baptist — a night of cleansing waters. Light a candle for renewal.",
    es: "La fiesta de San Juan Bautista — noche de aguas de limpieza. Enciende una vela por la renovación.",
    color: "#7bb6f2",
    action: { href: CANDLE("Cleansing and renewal on San Juan"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 7,
    d: 25,
    id: "santiago",
    title: "Santiago Apóstol · Oggún",
    en: "St. James, honored with Oggún, the worker of iron and strength. Light a candle for the strength to push through.",
    es: "Santiago, honrado con Oggún, dueño del hierro y la fuerza. Enciende una vela por la fuerza para seguir.",
    color: "#86cf9a",
    action: { href: CANDLE("Honoring Oggún — strength for the work"), en: "Light a candle for Oggún", es: "Vela para Oggún" },
  },
  {
    m: 9,
    d: 7,
    id: "regla",
    title: "La Virgen de Regla · Yemayá",
    en: "Honored with Yemayá, mother of the ocean. Light a blue candle for protection, motherhood, and deep healing.",
    es: "Honrada con Yemayá, madre del mar. Enciende una vela azul por protección, maternidad y sanación profunda.",
    color: "#7bb6f2",
    action: { href: CANDLE("Honoring Yemayá — protection and healing"), en: "Light a candle for Yemayá", es: "Vela para Yemayá" },
  },
  {
    m: 9,
    d: 8,
    id: "caridad",
    title: "La Caridad del Cobre · Ochún",
    en: "Cuba's patroness, honored with Ochún, Orisha of love, sweetness, and rivers. Light a yellow candle for love and abundance.",
    es: "Patrona de Cuba, honrada con Ochún, Orisha del amor, la dulzura y los ríos. Enciende una vela amarilla por amor y abundancia.",
    color: "#e8c34a",
    action: { href: CANDLE("Honoring Ochún — love and abundance"), en: "Light a candle for Ochún", es: "Vela para Ochún" },
  },
  {
    m: 9,
    d: 24,
    id: "mercedes",
    title: "Las Mercedes · Obatalá",
    en: "Our Lady of Mercy, honored with Obatalá, father of peace and clarity. Light a white candle for calm and wisdom.",
    es: "La Virgen de las Mercedes, honrada con Obatalá, padre de la paz y la claridad. Enciende una vela blanca por calma y sabiduría.",
    color: "#efe7d6",
    action: { href: CANDLE("Honoring Obatalá — peace and clarity"), en: "Light a candle for Obatalá", es: "Vela para Obatalá" },
  },
  {
    m: 9,
    d: 29,
    id: "san-miguel",
    title: "San Miguel Arcángel",
    en: "The archangel of protection. Light a candle and ask for his shield over you and your home.",
    es: "El arcángel de la protección. Enciende una vela y pide su escudo sobre ti y tu hogar.",
    color: "#7bb6f2",
    action: { href: CANDLE("San Miguel — protect me and mine"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 10,
    d: 4,
    id: "san-francisco",
    title: "San Francisco · Orula",
    en: "St. Francis, honored with Orula, who holds wisdom and destiny. Light a candle for guidance on your path.",
    es: "San Francisco, honrado con Orula, dueño de la sabiduría y el destino. Enciende una vela por guía en tu camino.",
    color: "#86cf9a",
    action: { href: CANDLE("Honoring Orula — wisdom and guidance"), en: "Light a candle for Orula", es: "Vela para Orula" },
  },
  {
    m: 11,
    d: 2,
    id: "difuntos",
    title: "Día de los Difuntos — All Souls",
    en: "The day of the faithful departed. Honor your ancestors — light their flame and speak their names.",
    es: "El día de los fieles difuntos. Honra a tus ancestros — enciende su llama y di sus nombres.",
    color: "#ec9aa6",
    action: { href: "/ancestors", en: "Honor your ancestors", es: "Honra a tus ancestros" },
  },
  {
    m: 12,
    d: 4,
    id: "barbara",
    title: "Santa Bárbara · Changó",
    en: "Honored with Changó, Orisha of fire, thunder, and justice. Light a red candle for power, courage, and victory.",
    es: "Honrada con Changó, Orisha del fuego, el trueno y la justicia. Enciende una vela roja por poder, valor y victoria.",
    color: "#f0552f",
    action: { href: CANDLE("Honoring Changó — courage and victory"), en: "Light a candle for Changó", es: "Vela para Changó" },
  },
  {
    m: 12,
    d: 17,
    id: "lazaro",
    title: "San Lázaro · Babalú-Ayé",
    en: "Honored with Babalú-Ayé, who heals sickness and suffering. Light a candle for health and relief.",
    es: "Honrado con Babalú-Ayé, quien sana la enfermedad y el sufrimiento. Enciende una vela por la salud y el alivio.",
    color: "#b98cf0",
    action: { href: CANDLE("Honoring Babalú-Ayé — health and healing"), en: "Light a candle for Babalú-Ayé", es: "Vela para Babalú-Ayé" },
  },
  {
    m: 1, d: 21, id: "altagracia",
    title: "Virgen de Altagracia",
    en: "Protectress of the Dominican people. Light a candle for protection and blessings on your home.",
    es: "Protectora del pueblo dominicano. Enciende una vela por protección y bendiciones para tu hogar.",
    color: "#5b8fd8",
    action: { href: CANDLE("Virgen de Altagracia — protection"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 5, d: 13, id: "fatima",
    title: "Nuestra Señora de Fátima",
    en: "Our Lady of Fátima. Light a candle for peace, conversion, and protection.",
    es: "Nuestra Señora de Fátima. Enciende una vela por la paz, la conversión y la protección.",
    color: "#7bb6f2",
    action: { href: CANDLE("Our Lady of Fátima — peace and protection"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 6, d: 27, id: "perpetua",
    title: "Our Lady of Perpetual Help",
    en: "For those in urgent need. Light a candle when you need help that cannot wait.",
    es: "Para quienes están en necesidad urgente. Enciende una vela cuando necesites ayuda que no puede esperar.",
    color: "#6f8fd0",
    action: { href: CANDLE("Our Lady of Perpetual Help — help in urgent need"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 7, d: 16, id: "carmen",
    title: "Virgen del Carmen",
    en: "Patroness of the sea and safe passage. Light a candle for protection over travelers and sailors.",
    es: "Patrona del mar y del buen camino. Enciende una vela por protección para viajeros y marineros.",
    color: "#b98a5e",
    action: { href: CANDLE("Virgen del Carmen — protection and safe passage"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 7, d: 17, id: "san-alejo",
    title: "San Alejo",
    en: "Invoked to keep enemies and harmful people far away. Light a candle for distance from trouble.",
    es: "Se le invoca para alejar a los enemigos y a las personas dañinas. Enciende una vela para alejar los problemas.",
    color: "#9b7bd0",
    action: { href: CANDLE("San Alejo — keep enemies and harm away"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 7, d: 26, id: "santa-ana",
    title: "Santa Ana",
    en: "Mother of the Virgin Mary. Light a candle for family, mothers, and fertility.",
    es: "Madre de la Virgen María. Enciende una vela por la familia, las madres y la fertilidad.",
    color: "#cdae5a",
    action: { href: CANDLE("Santa Ana — family and fertility"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 7, d: 29, id: "santa-marta",
    title: "Santa Marta la Dominadora",
    en: "Santa Marta la Dominadora, who tamed the dragon. Light a candle for peace and dominion over a hard situation.",
    es: "Santa Marta la Dominadora, que amansó al dragón. Enciende una vela por paz y dominio sobre una situación difícil.",
    color: "#3f8f5a",
    action: { href: CANDLE("Santa Marta la Dominadora — peace and dominion"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 9, d: 15, id: "dolorosa",
    title: "Nuestra Señora de los Dolores",
    en: "Our Lady of Sorrows. Light a candle for comfort in grief and hardship.",
    es: "Nuestra Señora de los Dolores. Enciende una vela por consuelo en el dolor y la dificultad.",
    color: "#6f7bbf",
    action: { href: CANDLE("Our Lady of Sorrows — comfort in grief"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 10, d: 2, id: "guardian-angel",
    title: "Holy Guardian Angels",
    en: "The feast of the Guardian Angels. Light a candle and ask yours to watch over you.",
    es: "La fiesta de los Ángeles de la Guarda. Enciende una vela y pide al tuyo que te cuide.",
    color: "#8fb6e8",
    action: { href: CANDLE("My guardian angel — watch over me"), en: "Light a candle", es: "Enciende una vela" },
  },
  {
    m: 12, d: 12, id: "guadalupe",
    title: "Virgen de Guadalupe",
    en: "Patroness of the Americas. Light a candle for protection and grace over you and your family.",
    es: "Patrona de las Américas. Enciende una vela por protección y gracia para ti y tu familia.",
    color: "#3fae8f",
    action: { href: CANDLE("Our Lady of Guadalupe — protection and grace"), en: "Light a candle", es: "Enciende una vela" },
  },
];

// ── Mercury retrograde — curated, dated (yearly refresh) ───────────────────
const MERCURY_RETRO: Array<{ y: number; m: number; d: number; sign: string }> = [
  { y: 2026, m: 2, d: 26, sign: "Pisces" },
  { y: 2026, m: 6, d: 29, sign: "Cancer" },
  { y: 2026, m: 10, d: 24, sign: "Scorpio" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

/** Today's date in US Eastern as {y,m,d}. */
export function easternToday(now: Date = new Date()): { y: number; m: number; d: number } {
  const s = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // yyyy-mm-dd
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

const key = (e: { y: number; m: number; d: number }) =>
  e.y * 10000 + e.m * 100 + e.d;

/** Equinoxes and solstices for a year, computed from solar longitude. */
function seasonalForYear(year: number): CalEvent[] {
  const targets: Array<{ lon: number; id: string; en: string; es: string; title: string }> = [
    { lon: 0, id: "equinox-spring", title: "Spring Equinox", en: "Light and dark in balance — a threshold for new intentions.", es: "Luz y oscuridad en equilibrio — un umbral para nuevas intenciones." },
    { lon: 90, id: "solstice-summer", title: "Summer Solstice", en: "The longest day. The sun at its height — a time for growth and gratitude.", es: "El día más largo. El sol en su cúspide — tiempo de crecimiento y gratitud." },
    { lon: 180, id: "equinox-fall", title: "Autumn Equinox", en: "Balance again, and a turn inward. A time to harvest and release.", es: "De nuevo el equilibrio, y un giro hacia adentro. Tiempo de cosechar y soltar." },
    { lon: 270, id: "solstice-winter", title: "Winter Solstice", en: "The longest night. The year's quiet bottom — rest, and set seeds for the light's return.", es: "La noche más larga. El fondo silencioso del año — descansa y siembra para el regreso de la luz." },
  ];
  const out: CalEvent[] = [];
  for (const t of targets) {
    const ts = solarCrossing(year, t.lon);
    if (ts == null) continue;
    const e = easternToday(new Date(ts));
    out.push({
      id: `${t.id}-${year}`,
      ...e,
      type: "seasonal",
      title: t.title,
      en: t.en,
      es: t.es,
      color: "#86cf9a",
      action: { href: CANDLE(`Intentions for the ${t.title.toLowerCase()}`), en: "Light a candle", es: "Enciende una vela" },
    });
  }
  return out;
}

/** Timestamp (ms) when the sun reaches `targetLon`, scanning the year in 6h steps. */
function solarCrossing(year: number, targetLon: number): number | null {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 2);
  const STEP = 3_600_000; // hourly — sun longitude is precise, so the day is exact
  let prev = sunLongitude(new Date(start - STEP));
  for (let t = start; t < end; t += STEP) {
    const cur = sunLongitude(new Date(t));
    if (targetLon === 0) {
      if (prev > 300 && cur < 60) return t; // wrap ~360 → ~0
    } else if (prev < targetLon && cur >= targetLon) {
      return t;
    }
    prev = cur;
  }
  return null;
}

/** Easter Sunday (Gregorian computus). */
function easterSunday(year: number): { y: number; m: number; d: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const mth = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * mth + 114) / 31);
  const day = ((h + l - 7 * mth + 114) % 31) + 1;
  return { y: year, m: month, d: day };
}

/** Movable feasts computed from Easter. Sacred Heart = Easter + 68 days. */
function movableFeastsForYear(year: number): CalEvent[] {
  const sh = addDays(easterSunday(year), 68);
  return [
    {
      id: `sacred-heart-${year}`,
      ...sh,
      type: "feast",
      title: "Sacred Heart of Jesus",
      en: "The Sacred Heart of Jesus. Light a candle for love, mercy, and healing.",
      es: "El Sagrado Corazón de Jesús. Enciende una vela por amor, misericordia y sanación.",
      color: "#f0552f",
      action: { href: "/altar/saint/sacred-heart", en: "Light a candle", es: "Enciende una vela" },
    },
  ];
}

function feastEventsForYear(year: number): CalEvent[] {
  return FEASTS.map((f) => {
    // If this feast has a dedicated saint/Orisha candle, send the action
    // straight to that candle (skips the desire picker).
    const action = getSaintCandle(f.id)
      ? { ...f.action, href: `/altar/saint/${f.id}` }
      : f.action;
    return {
      id: `${f.id}-${year}`,
      y: year,
      m: f.m,
      d: f.d,
      type: "feast" as const,
      title: f.title,
      en: f.en,
      es: f.es,
      color: f.color,
      action,
    };
  });
}

function lunarEventsForRange(
  startY: number,
  startM: number,
  endY: number,
  endM: number,
): CalEvent[] {
  const out: CalEvent[] = [];
  let y = startY;
  let m = startM;
  while (y < endY || (y === endY && m <= endM)) {
    for (const ev of lunarEventsForMonth(y, m)) {
      const full = ev.kind === "full";
      out.push({
        id: `${full ? "full" : "new"}-${y}-${m}-${ev.day}`,
        y,
        m,
        d: ev.day,
        type: "lunar",
        title: full ? `Full Moon in ${ev.sign}` : `New Moon in ${ev.sign}`,
        en: full
          ? "The moon is full — a night to give thanks and release what is finished."
          : "The dark moon — plant your intentions for the cycle ahead.",
        es: full
          ? "Luna llena — noche para dar gracias y soltar lo que terminó."
          : "Luna nueva — siembra tus intenciones para el ciclo que viene.",
        color: full ? "#eef0f4" : "#7b86b8",
        action: { href: "/astrology/moon", en: "Tonight's moon", es: "La luna de hoy" },
      });
    }
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

function mercuryEvents(): CalEvent[] {
  return MERCURY_RETRO.map((r) => ({
    id: `mercury-${r.y}-${r.m}`,
    y: r.y,
    m: r.m,
    d: r.d,
    type: "planet" as const,
    title: "Mercury Retrograde begins",
    en: `Mercury turns retrograde in ${r.sign}. Slow down with messages, signings, and travel — and reflect.`,
    es: `Mercurio se vuelve retrógrado en ${r.sign}. Ve con calma con mensajes, contratos y viajes — y reflexiona.`,
    color: "#b98cf0",
    action: { href: "/astrology/astrologer", en: "Ask your astrologer", es: "Pregunta a tu astrólogo" },
  }));
}

/** All events between two Eastern dates (inclusive), sorted ascending. */
export function getEventsBetween(
  from: { y: number; m: number; d: number },
  to: { y: number; m: number; d: number },
): CalEvent[] {
  const events: CalEvent[] = [];
  for (let year = from.y; year <= to.y; year++) {
    events.push(...feastEventsForYear(year));
    events.push(...movableFeastsForYear(year));
    events.push(...seasonalForYear(year));
  }
  events.push(...mercuryEvents());
  events.push(...lunarEventsForRange(from.y, from.m, to.y, to.m));

  const lo = key(from);
  const hi = key(to);
  return events
    .filter((e) => key(e) >= lo && key(e) <= hi)
    .sort((a, b) => key(a) - key(b));
}

/** Observances falling on a specific Eastern day. */
export function getObservancesFor(day: { y: number; m: number; d: number }): CalEvent[] {
  return getEventsBetween(day, day);
}

/** Add days to an Eastern date (via UTC noon to avoid DST edges). */
export function addDays(day: { y: number; m: number; d: number }, n: number) {
  const t = Date.UTC(day.y, day.m - 1, day.d, 12) + n * 86_400_000;
  const dt = new Date(t);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

// ── Novenas (nine-day observances leading to a feast) ──────────────────────
const NOVENAS: Array<{ feastId: string; m: number; d: number; name: string; color: string }> = [
  { feastId: "caridad", m: 9, d: 8, name: "Ochún · La Caridad", color: "#e8c34a" },
  { feastId: "mercedes", m: 9, d: 24, name: "Obatalá · Las Mercedes", color: "#efe7d6" },
  { feastId: "barbara", m: 12, d: 4, name: "Changó · Santa Bárbara", color: "#f0552f" },
  { feastId: "lazaro", m: 12, d: 17, name: "Babalú-Ayé · San Lázaro", color: "#9b7bd0" },
];

export type ActiveNovena = {
  name: string;
  day: number;
  total: number;
  color: string;
  href: string;
};

/** If a nine-day novena is running today (ending on its feast), which one. */
export function getActiveNovena(
  today: { y: number; m: number; d: number },
): ActiveNovena | null {
  for (const n of NOVENAS) {
    for (const yr of [today.y, today.y - 1, today.y + 1]) {
      const feast = { y: yr, m: n.m, d: n.d };
      const start = addDays(feast, -8);
      if (key(today) >= key(start) && key(today) <= key(feast)) {
        const day =
          Math.round(
            (Date.UTC(today.y, today.m - 1, today.d) -
              Date.UTC(start.y, start.m - 1, start.d)) /
              86_400_000,
          ) + 1;
        return { name: n.name, day, total: 9, color: n.color, href: `/altar/saint/${n.feastId}` };
      }
    }
  }
  return null;
}

/** The next upcoming events from today (inclusive), up to `limit`. */
export function getUpcoming(
  fromDay: { y: number; m: number; d: number },
  windowDays = 75,
  limit = 12,
): CalEvent[] {
  const to = addDays(fromDay, windowDays);
  return getEventsBetween(fromDay, to).slice(0, limit);
}
