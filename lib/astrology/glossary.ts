/**
 * The astrology glossary: plain-language definitions for the terms a
 * reading may use, in the house voice. Powers the tappable terms inside
 * readings (see components/astro-term.tsx and lib/astrology/detect-terms.ts).
 *
 * Definitions are deliberately short: two sentences, warm, no jargon.
 * The personal line ("In your chart: ...") is added at tap time from the
 * member's cached chart, not stored here.
 */

export type GlossaryEntry = {
  key: string;
  /** Display name per locale. */
  name: { en: string; es: string };
  /** Aliases that should light up in prose, per locale. Case-sensitive. */
  aliases: { en: string[]; es: string[] };
  def: { en: string; es: string };
  /** Planets + points get a personal "in your chart" line. */
  kind: "planet" | "point" | "sign" | "house" | "aspect" | "concept";
};

export const GLOSSARY: GlossaryEntry[] = [
  // ── Planets and points ─────────────────────────────────────────────
  {
    key: "sun", kind: "planet",
    name: { en: "The Sun", es: "El Sol" },
    aliases: { en: ["Sun"], es: ["Sol"] },
    def: {
      en: "The Sun is the center of your chart: your core self, your vitality, the person you are becoming. Your Sun sign is what most people mean when they name 'their sign.'",
      es: "El Sol es el centro de tu carta: tu esencia, tu vitalidad, la persona en la que te estás convirtiendo. Tu signo solar es lo que la mayoría llama 'su signo.'",
    },
  },
  {
    key: "moon", kind: "planet",
    name: { en: "The Moon", es: "La Luna" },
    aliases: { en: ["Moon"], es: ["Luna"] },
    def: {
      en: "The Moon is your inner life: emotions, instincts, what you need to feel safe. Where the Sun is who you are in daylight, the Moon is who you are at home.",
      es: "La Luna es tu vida interior: emociones, instintos, lo que necesitas para sentirte en paz. Si el Sol es quien eres de día, la Luna es quien eres en casa.",
    },
  },
  {
    key: "mercury", kind: "planet",
    name: { en: "Mercury", es: "Mercurio" },
    aliases: { en: ["Mercury"], es: ["Mercurio"] },
    def: {
      en: "Mercury governs the mind: how you think, speak, learn, and make deals. When a reading mentions Mercury, it is talking about your words and your wits.",
      es: "Mercurio gobierna la mente: cómo piensas, hablas, aprendes y negocias. Cuando una lectura menciona a Mercurio, habla de tus palabras y tu ingenio.",
    },
  },
  {
    key: "venus", kind: "planet",
    name: { en: "Venus", es: "Venus" },
    aliases: { en: ["Venus"], es: ["Venus"] },
    def: {
      en: "Venus is the planet of love, beauty, and what you value: romance, money, pleasure, the things and people you are drawn to. Her placement shows how you love and what you find worth keeping.",
      es: "Venus es el planeta del amor, la belleza y lo que valoras: el romance, el dinero, el placer, las personas y cosas que te atraen. Su posición muestra cómo amas y qué vale la pena conservar.",
    },
  },
  {
    key: "mars", kind: "planet",
    name: { en: "Mars", es: "Marte" },
    aliases: { en: ["Mars"], es: ["Marte"] },
    def: {
      en: "Mars is your fire: drive, desire, anger, courage. It shows how you fight for what you want and where your energy runs hottest.",
      es: "Marte es tu fuego: impulso, deseo, coraje. Muestra cómo luchas por lo que quieres y dónde arde más fuerte tu energía.",
    },
  },
  {
    key: "jupiter", kind: "planet",
    name: { en: "Jupiter", es: "Júpiter" },
    aliases: { en: ["Jupiter"], es: ["Júpiter"] },
    def: {
      en: "Jupiter is the planet of growth, luck, and abundance. Where Jupiter sits in your chart is where life tends to open doors and hand you more than you asked for.",
      es: "Júpiter es el planeta del crecimiento, la suerte y la abundancia. Donde está Júpiter en tu carta es donde la vida suele abrir puertas y darte más de lo que pediste.",
    },
  },
  {
    key: "saturn", kind: "planet",
    name: { en: "Saturn", es: "Saturno" },
    aliases: { en: ["Saturn"], es: ["Saturno"] },
    def: {
      en: "Saturn is the planet of discipline, time, and hard-won lessons. It shows where life asks you to build slowly and where your greatest mastery comes from.",
      es: "Saturno es el planeta de la disciplina, el tiempo y las lecciones ganadas con esfuerzo. Muestra dónde la vida te pide construir despacio y de dónde viene tu mayor maestría.",
    },
  },
  {
    key: "uranus", kind: "planet",
    name: { en: "Uranus", es: "Urano" },
    aliases: { en: ["Uranus"], es: ["Urano"] },
    def: {
      en: "Uranus is the planet of sudden change, freedom, and awakening. Where it touches your chart, expect the unexpected and the urge to break old molds.",
      es: "Urano es el planeta del cambio repentino, la libertad y el despertar. Donde toca tu carta, espera lo inesperado y el impulso de romper moldes.",
    },
  },
  {
    key: "neptune", kind: "planet",
    name: { en: "Neptune", es: "Neptuno" },
    aliases: { en: ["Neptune"], es: ["Neptuno"] },
    def: {
      en: "Neptune is the planet of dreams, intuition, and the unseen. It blurs edges: where it sits, you feel more, imagine more, and must watch for illusion.",
      es: "Neptuno es el planeta de los sueños, la intuición y lo invisible. Difumina los bordes: donde está, sientes más, imaginas más, y debes cuidarte de las ilusiones.",
    },
  },
  {
    key: "pluto", kind: "planet",
    name: { en: "Pluto", es: "Plutón" },
    aliases: { en: ["Pluto"], es: ["Plutón"] },
    def: {
      en: "Pluto is the planet of deep transformation: endings, rebirth, and power. Where Pluto works, life does not redecorate. It renovates down to the foundation.",
      es: "Plutón es el planeta de la transformación profunda: finales, renacimiento y poder. Donde trabaja Plutón, la vida no redecora. Renueva hasta los cimientos.",
    },
  },
  {
    key: "rising", kind: "point",
    name: { en: "Rising sign (Ascendant)", es: "Ascendente" },
    aliases: { en: ["Rising", "Ascendant", "Rising sign"], es: ["Ascendente"] },
    def: {
      en: "Your Rising sign, or Ascendant, is the sign coming over the horizon the moment you were born. It is the face you show the world and the doorway to your whole chart. It needs your birth time to calculate.",
      es: "Tu Ascendente es el signo que salía por el horizonte en el momento en que naciste. Es la cara que muestras al mundo y la puerta de entrada a toda tu carta. Se necesita tu hora de nacimiento para calcularlo.",
    },
  },
  // ── Signs ──────────────────────────────────────────────────────────
  {
    key: "aries", kind: "sign",
    name: { en: "Aries", es: "Aries" },
    aliases: { en: ["Aries"], es: ["Aries"] },
    def: {
      en: "Aries is the first fire of the zodiac: bold, direct, quick to start. Planets here act fast and lead from the front.",
      es: "Aries es el primer fuego del zodíaco: audaz, directo, rápido para empezar. Los planetas aquí actúan de inmediato y van al frente.",
    },
  },
  {
    key: "taurus", kind: "sign",
    name: { en: "Taurus", es: "Tauro" },
    aliases: { en: ["Taurus"], es: ["Tauro"] },
    def: {
      en: "Taurus is steady earth: patient, loyal, devoted to comfort and what lasts. Planets here move slowly and hold on.",
      es: "Tauro es tierra firme: paciente, leal, devoto de lo que dura. Los planetas aquí se mueven despacio y no sueltan.",
    },
  },
  {
    key: "gemini", kind: "sign",
    name: { en: "Gemini", es: "Géminis" },
    aliases: { en: ["Gemini"], es: ["Géminis"] },
    def: {
      en: "Gemini is quick air: curious, talkative, hungry for variety. Planets here think out loud and learn on the move.",
      es: "Géminis es aire veloz: curioso, conversador, con hambre de variedad. Los planetas aquí piensan en voz alta y aprenden en movimiento.",
    },
  },
  {
    key: "cancer", kind: "sign",
    name: { en: "Cancer", es: "Cáncer" },
    aliases: { en: ["Cancer"], es: ["Cáncer"] },
    def: {
      en: "Cancer is protective water: nurturing, intuitive, rooted in home and family. Planets here feel everything and guard what they love.",
      es: "Cáncer es agua protectora: cuidadora, intuitiva, arraigada al hogar y la familia. Los planetas aquí lo sienten todo y protegen lo que aman.",
    },
  },
  {
    key: "leo", kind: "sign",
    name: { en: "Leo", es: "Leo" },
    aliases: { en: ["Leo"], es: ["Leo"] },
    def: {
      en: "Leo is radiant fire: generous, proud, born to be seen. Planets here want warmth, loyalty, and a stage worthy of the heart they carry.",
      es: "Leo es fuego radiante: generoso, orgulloso, nacido para ser visto. Los planetas aquí buscan calor, lealtad y un escenario digno del corazón que llevan.",
    },
  },
  {
    key: "virgo", kind: "sign",
    name: { en: "Virgo", es: "Virgo" },
    aliases: { en: ["Virgo"], es: ["Virgo"] },
    def: {
      en: "Virgo is precise earth: observant, helpful, devoted to getting it right. Planets here serve, refine, and notice what everyone else missed.",
      es: "Virgo es tierra precisa: observadora, servicial, dedicada a hacerlo bien. Los planetas aquí sirven, pulen y notan lo que otros pasan por alto.",
    },
  },
  {
    key: "libra", kind: "sign",
    name: { en: "Libra", es: "Libra" },
    aliases: { en: ["Libra"], es: ["Libra"] },
    def: {
      en: "Libra is graceful air: fair-minded, charming, made for partnership. Planets here seek balance and beauty in everything they touch.",
      es: "Libra es aire elegante: justo, encantador, hecho para la pareja. Los planetas aquí buscan equilibrio y belleza en todo lo que tocan.",
    },
  },
  {
    key: "scorpio", kind: "sign",
    name: { en: "Scorpio", es: "Escorpio" },
    aliases: { en: ["Scorpio"], es: ["Escorpio", "Escorpión"] },
    def: {
      en: "Scorpio is deep water: intense, private, all or nothing. Planets here feel to the bone and transform whatever they commit to.",
      es: "Escorpio es agua profunda: intensa, reservada, todo o nada. Los planetas aquí sienten hasta el hueso y transforman aquello a lo que se entregan.",
    },
  },
  {
    key: "sagittarius", kind: "sign",
    name: { en: "Sagittarius", es: "Sagitario" },
    aliases: { en: ["Sagittarius"], es: ["Sagitario"] },
    def: {
      en: "Sagittarius is wandering fire: honest, optimistic, aimed at the horizon. Planets here need freedom, meaning, and room to roam.",
      es: "Sagitario es fuego viajero: honesto, optimista, apuntando al horizonte. Los planetas aquí necesitan libertad, sentido y espacio para andar.",
    },
  },
  {
    key: "capricorn", kind: "sign",
    name: { en: "Capricorn", es: "Capricornio" },
    aliases: { en: ["Capricorn"], es: ["Capricornio"] },
    def: {
      en: "Capricorn is mountain earth: ambitious, disciplined, built for the long climb. Planets here take responsibility and earn everything they hold.",
      es: "Capricornio es tierra de montaña: ambiciosa, disciplinada, hecha para la subida larga. Los planetas aquí asumen responsabilidad y se ganan todo lo que tienen.",
    },
  },
  {
    key: "aquarius", kind: "sign",
    name: { en: "Aquarius", es: "Acuario" },
    aliases: { en: ["Aquarius"], es: ["Acuario"] },
    def: {
      en: "Aquarius is electric air: independent, inventive, loyal to the future. Planets here think differently and belong to the community more than the crowd.",
      es: "Acuario es aire eléctrico: independiente, inventivo, fiel al futuro. Los planetas aquí piensan distinto y pertenecen a la comunidad más que a la multitud.",
    },
  },
  {
    key: "pisces", kind: "sign",
    name: { en: "Pisces", es: "Piscis" },
    aliases: { en: ["Pisces"], es: ["Piscis"] },
    def: {
      en: "Pisces is boundless water: compassionate, dreamy, tuned to the unseen. Planets here feel the whole room and blur the line between self and spirit.",
      es: "Piscis es agua sin orillas: compasiva, soñadora, sintonizada con lo invisible. Los planetas aquí sienten todo el cuarto y borran la línea entre el alma y el espíritu.",
    },
  },
  // ── Aspects and concepts ───────────────────────────────────────────
  {
    key: "retrograde", kind: "concept",
    name: { en: "Retrograde", es: "Retrógrado" },
    aliases: { en: ["retrograde", "Retrograde"], es: ["retrógrado", "retrógrada"] },
    def: {
      en: "A planet is retrograde when it appears to move backward across the sky. Its themes turn inward: a season to review, repair, and finish rather than launch.",
      es: "Un planeta está retrógrado cuando parece moverse hacia atrás en el cielo. Sus temas se vuelven hacia adentro: una temporada para revisar, reparar y terminar, no para lanzar.",
    },
  },
  {
    key: "transit", kind: "concept",
    name: { en: "Transit", es: "Tránsito" },
    aliases: { en: ["transit", "transiting"], es: ["tránsito", "transitando"] },
    def: {
      en: "A transit is where a planet is right now in the sky, touching a spot in your birth chart. Transits are the weather; your chart is the house it moves through.",
      es: "Un tránsito es la posición actual de un planeta en el cielo tocando un punto de tu carta natal. Los tránsitos son el clima; tu carta es la casa por donde pasa.",
    },
  },
  {
    key: "conjunction", kind: "aspect",
    name: { en: "Conjunction", es: "Conjunción" },
    aliases: { en: ["conjunction", "conjunct"], es: ["conjunción"] },
    def: {
      en: "A conjunction is two planets standing together in the same place. Their forces blend into one, for better and for stronger.",
      es: "Una conjunción es dos planetas parados en el mismo lugar. Sus fuerzas se funden en una sola, para bien y con más fuerza.",
    },
  },
  {
    key: "opposition", kind: "aspect",
    name: { en: "Opposition", es: "Oposición" },
    aliases: { en: ["opposition", "opposite"], es: ["oposición"] },
    def: {
      en: "An opposition is two planets facing each other across the sky. It creates tension that asks for balance: two truths pulling at once.",
      es: "Una oposición es dos planetas frente a frente en el cielo. Crea una tensión que pide equilibrio: dos verdades jalando a la vez.",
    },
  },
  {
    key: "square", kind: "aspect",
    name: { en: "Square", es: "Cuadratura" },
    aliases: { en: ["square"], es: ["cuadratura"] },
    def: {
      en: "A square is two planets at a hard right angle. It brings friction, and friction builds strength: the challenge that forces growth.",
      es: "Una cuadratura es dos planetas en ángulo recto. Trae fricción, y la fricción da fuerza: el reto que obliga a crecer.",
    },
  },
  {
    key: "trine", kind: "aspect",
    name: { en: "Trine", es: "Trígono" },
    aliases: { en: ["trine"], es: ["trígono"] },
    def: {
      en: "A trine is two planets in easy, flowing harmony. Gifts move freely here; the work is remembering not to take them for granted.",
      es: "Un trígono es dos planetas en armonía fluida. Los dones fluyen fácil aquí; el trabajo es no darlos por sentado.",
    },
  },
  {
    key: "natal-chart", kind: "concept",
    name: { en: "Natal chart", es: "Carta natal" },
    aliases: { en: ["natal chart", "birth chart"], es: ["carta natal", "carta astral"] },
    def: {
      en: "Your natal chart is a map of the sky at the exact moment and place you were born. Every reading here is rooted in yours, not a generic horoscope.",
      es: "Tu carta natal es un mapa del cielo en el momento y lugar exactos de tu nacimiento. Cada lectura aquí nace de la tuya, no de un horóscopo genérico.",
    },
  },
];

/** House meanings, indexed 1-12, used for "Nth house" detection. */
export const HOUSES: { en: string; es: string }[] = [
  {
    en: "The 1st house is you: your body, your presence, how you begin things and how the world first meets you.",
    es: "La casa 1 eres tú: tu cuerpo, tu presencia, cómo empiezas las cosas y cómo te conoce el mundo.",
  },
  {
    en: "The 2nd house governs money, possessions, and self-worth: what you have and what you believe you deserve.",
    es: "La casa 2 gobierna el dinero, los bienes y la autoestima: lo que tienes y lo que crees merecer.",
  },
  {
    en: "The 3rd house governs communication, siblings, and your daily rounds: the words, errands, and neighbors of your life.",
    es: "La casa 3 gobierna la comunicación, los hermanos y tu día a día: las palabras, los mandados y los vecinos de tu vida.",
  },
  {
    en: "The 4th house is home and roots: family, ancestry, the private ground your life is built on.",
    es: "La casa 4 es el hogar y las raíces: la familia, los ancestros, el suelo privado sobre el que se construye tu vida.",
  },
  {
    en: "The 5th house is joy: romance, creativity, children, and the things you do for the love of doing them.",
    es: "La casa 5 es la alegría: el romance, la creatividad, los hijos y lo que haces por puro amor a hacerlo.",
  },
  {
    en: "The 6th house governs daily work, habits, and health: the small routines that quietly shape everything.",
    es: "La casa 6 gobierna el trabajo diario, los hábitos y la salud: las pequeñas rutinas que en silencio lo moldean todo.",
  },
  {
    en: "The 7th house is partnership: marriage, close bonds, contracts, and the people who mirror you.",
    es: "La casa 7 es la pareja: el matrimonio, los vínculos cercanos, los contratos y las personas que te reflejan.",
  },
  {
    en: "The 8th house is the deep water: shared money, intimacy, loss, and transformation. What is given, owed, and reborn.",
    es: "La casa 8 es el agua profunda: el dinero compartido, la intimidad, las pérdidas y la transformación. Lo que se da, se debe y renace.",
  },
  {
    en: "The 9th house is the far horizon: travel, higher learning, faith, and the beliefs that give life meaning.",
    es: "La casa 9 es el horizonte lejano: los viajes, los estudios superiores, la fe y las creencias que dan sentido a la vida.",
  },
  {
    en: "The 10th house is your public life: career, reputation, and the legacy you are building where everyone can see.",
    es: "La casa 10 es tu vida pública: la carrera, la reputación y el legado que construyes a la vista de todos.",
  },
  {
    en: "The 11th house is community: friendships, networks, and the hopes you carry for the future.",
    es: "La casa 11 es la comunidad: las amistades, las redes y las esperanzas que guardas para el futuro.",
  },
  {
    en: "The 12th house is the hidden room: solitude, spirit, dreams, and what works on you from behind the veil.",
    es: "La casa 12 es el cuarto oculto: la soledad, el espíritu, los sueños y lo que obra en ti detrás del velo.",
  },
];

const byKey = new Map(GLOSSARY.map((g) => [g.key, g]));
export function glossaryEntry(key: string): GlossaryEntry | undefined {
  return byKey.get(key);
}
