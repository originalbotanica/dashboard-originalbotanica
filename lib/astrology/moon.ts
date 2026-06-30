/**
 * Moon phase — pure astronomy, no API.
 *
 * The moon's phase is a deterministic function of the date, so we compute it
 * locally: no key, no network, nothing to break. Accuracy is well within a
 * few hours, which is all a spiritual lunar guide needs.
 *
 * We expose both an 8-phase display name and a 4-phase "bucket" that maps to
 * the rituals.best_moon_phase tags (new | waxing | full | waning), so the
 * lunar guide can recommend rituals timed to tonight's moon.
 */

const SYNODIC = 29.530588853; // mean length of a lunar month, in days
// A known new moon: 2000-01-06 18:14 UTC.
const REF_NEW = Date.UTC(2000, 0, 6, 18, 14, 0);

export type MoonBucket = "new" | "waxing" | "full" | "waning";

export type MoonInfo = {
  phaseName: string; // 8-phase display, e.g. "Waxing Gibbous"
  bucket: MoonBucket;
  illumination: number; // 0..1 fraction lit
  illuminationPct: number; // rounded percent
  ageDays: number; // days since new
  waxing: boolean;
  daysToNew: number; // whole days until the next new moon
  daysToFull: number; // whole days until the next full moon
};

export function getMoon(now: Date = new Date()): MoonInfo {
  const elapsedDays = (now.getTime() - REF_NEW) / 86_400_000;
  let age = elapsedDays % SYNODIC;
  if (age < 0) age += SYNODIC;

  const phase = age / SYNODIC; // 0..1
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const waxing = phase < 0.5;

  const daysToNew = Math.round((SYNODIC - age) % SYNODIC);
  const fullAge = SYNODIC / 2;
  let toFull = fullAge - age;
  if (toFull < 0) toFull += SYNODIC;
  const daysToFull = Math.round(toFull);

  return {
    phaseName: phaseName(age),
    bucket: bucket(age, waxing),
    illumination,
    illuminationPct: Math.round(illumination * 100),
    ageDays: age,
    waxing,
    daysToNew,
    daysToFull,
  };
}

function phaseName(age: number): string {
  if (age < 1.0 || age >= 28.5) return "New Moon";
  if (age < 6.4) return "Waxing Crescent";
  if (age < 8.4) return "First Quarter";
  if (age < 13.8) return "Waxing Gibbous";
  if (age < 15.8) return "Full Moon";
  if (age < 21.3) return "Waning Gibbous";
  if (age < 23.2) return "Last Quarter";
  return "Waning Crescent";
}

function bucket(age: number, waxing: boolean): MoonBucket {
  if (age < 1.0 || age >= 28.5) return "new";
  if (age >= 13.8 && age < 15.8) return "full";
  return waxing ? "waxing" : "waning";
}

export type MoonGuidance = {
  title: string;
  body: string;
  goodFor: string[];
};

/** What each phase is good for, in the voice of the house. */
export function moonGuidance(b: MoonBucket, locale: "en" | "es" = "en"): MoonGuidance {
  const es = locale === "es";
  switch (b) {
    case "new":
      return es
        ? {
            title: "Planta lo que quieres que crezca.",
            body: "La luna oscura es la semilla en la tierra. Comienza aquí. Fija intenciones, abre caminos, empieza el trabajo sobre el que quieres construir. Lo que comienzas bajo la luna nueva crece con ella.",
            goodFor: ["Nuevos comienzos", "Abrir caminos", "Fijar intenciones"],
          }
        : {
            title: "Plant what you want to grow.",
            body: "The dark moon is the seed in the soil. Begin here. Set intentions, open roads, start the work you mean to build on. What you start under the new moon grows with it.",
            goodFor: ["New beginnings", "Road opening", "Setting intentions"],
          };
    case "waxing":
      return es
        ? {
            title: "Atráelo hacia ti.",
            body: "La luna está creciendo y también todo lo que llamas ahora. Este es el momento de atraer: dinero, amor, éxito, bendiciones. Construye, aumenta, invita. La marea sube a tu favor.",
            goodFor: ["Atraer dinero", "Amor y atracción", "Éxito y crecimiento"],
          }
        : {
            title: "Draw it toward you.",
            body: "The moon is growing and so is anything you call in now. This is the time to attract: money, love, success, blessings. Build, increase, invite. The tide is rising in your favor.",
            goodFor: ["Money drawing", "Love and attraction", "Success and growth"],
          };
    case "full":
      return es
        ? {
            title: "La luna está en su máximo poder.",
            body: "Esta noche la luna es más fuerte. Carga tus aguas, piedras y herramientas en su luz. Da gracias. Haz el trabajo que necesita verdadera fuerza, y suelta lo que estás listo para dejar ir.",
            goodFor: ["Cargar herramientas", "Trabajos poderosos", "Gratitud y liberación"],
          }
        : {
            title: "The moon is at full power.",
            body: "Tonight the moon is strongest. Charge your waters, stones, and tools in its light. Give thanks. Do the work that needs real force behind it, and release what you are ready to let go.",
            goodFor: ["Charging tools", "Powerful workings", "Gratitude and release"],
          };
    case "waning":
      return es
        ? {
            title: "Envíalo lejos.",
            body: "La luna está menguando, y lo que sueltas mengua con ella. Este es el momento de limpiar, desterrar, descruzar y cortar lo que ya no te sirve. Despeja el terreno para que la próxima luna nueva tenga espacio.",
            goodFor: ["Limpieza", "Descruce y reversión", "Destierro"],
          }
        : {
            title: "Send it away.",
            body: "The moon is shrinking, and what you release shrinks with it. This is the time to cleanse, banish, uncross, and cut what no longer serves you. Clear the ground so the next new moon has room.",
            goodFor: ["Cleansing", "Uncrossing and reversal", "Banishing"],
          };
  }
}

/** A simple emoji for compact spots. */
export function moonEmoji(b: MoonBucket, waxing: boolean): string {
  if (b === "new") return "🌑";
  if (b === "full") return "🌕";
  return waxing ? "🌒" : "🌘";
}
