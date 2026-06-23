/**
 * Lightweight i18n for the app shell (Phase 1: chrome — nav, account, etc.).
 *
 * Flat dotted keys, two locales. The member's choice is stored in the
 * `ob-locale` cookie (source of truth) and mirrored to profiles.locale.
 * Spiritual *content* (rituals, dream readings, horoscopes) is handled
 * separately and is not part of this dictionary.
 */

export type Locale = "en" | "es";
export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "ob-locale";

export function asLocale(v: string | null | undefined): Locale {
  return v === "es" ? "es" : "en";
}

type Dict = Record<string, string>;

const en: Dict = {
  // navigation / chrome
  "nav.tarot": "Tarot",
  "nav.astrology": "Astrology",
  "nav.dreams": "Dreams",
  "nav.altar": "Altar",
  "nav.ancestors": "Ancestors",
  "nav.rituals": "Rituals",
  "nav.account": "Account",
  "nav.accountBilling": "Account & billing",
  "nav.signOut": "Sign out",
  "nav.menu": "Menu",
  "nav.close": "Close",
  "lang.label": "Language",

  // account page
  "account.eyebrow": "Your account",
  "account.membershipOf": "{name}'s membership",
  "account.yourMembership": "Your membership",
  "account.membership": "Membership",
  "account.status": "Status",
  "account.plan": "Plan",
  "account.trialEnds": "Trial ends",
  "account.renews": "Renews",
  "account.ends": "Ends",
  "account.statusTrialToday": "Free trial — ends today",
  "account.statusTrialDays": "Free trial — {n} days left",
  "account.statusTrialDay": "Free trial — 1 day left",
  "account.statusActiveCancel": "Active — cancels at period end",
  "account.statusActive": "Active",
  "account.statusPastDue": "Payment past due",
  "account.statusGift": "Gift membership — active",
  "account.statusNone": "No active membership",
  "account.planMonthly": "Monthly ($24.95/month)",
  "account.planAnnual": "Annual ($199.95/year)",
  "account.planGift": "Gift membership",
  "account.giftTitle": "Your gift membership is active.",
  "account.giftBodyThrough": "Every tool is open to you through {date}. When your gift ends, you can continue your membership any time — your altar, ancestors, and saved rituals will be here waiting.",
  "account.giftBody": "Every tool is open to you. When your gift ends, you can continue your membership any time — your altar, ancestors, and saved rituals will be here waiting.",
  "account.manageIntro": "Update your payment method, change or cancel your plan, and view past invoices in the secure billing portal.",
  "account.beginTitle": "Begin your membership.",
  "account.beginBody": "Seven days free, then your plan. Cancel anytime. Every tool opens the moment you join.",
  "account.giveGiftEyebrow": "Give a gift",
  "account.giveGiftBody": "Know someone who could use a little guidance? Give them a season at the botanica.",
  "account.giftCta": "Gift a membership",
  "account.privacyNote": "Your readings, dreams, and ancestors are private to your account. See our",
  "account.privacyLink": "privacy policy",
  "account.signOut": "Sign out",
  "account.manageBilling": "Manage billing",
  "account.opening": "Opening...",
  "account.monthly": "Monthly · $24.95/mo",
  "account.annual": "Annual · $199.95/yr",
  "account.starting": "Starting...",
  "account.errPortal": "Could not open the billing portal. Try again.",
  "account.errCheckout": "Could not start checkout. Try again.",
  "account.errGeneric": "Something went wrong. Try again.",

  // dashboard
  "dash.greetingMorning": "Good morning",
  "dash.greetingAfternoon": "Good afternoon",
  "dash.greetingEvening": "Good evening",
  "dash.heroWelcomeTitle": "Welcome to the practice.",
  "dash.heroWelcomeBody": "Add your birth details and the astrologer will read for you each morning.",
  "dash.heroReadingFor": "The astrologer is reading for you...",
  "dash.heroSignCandle": "{sign}. The candle is lit.",
  "dash.heroSignError": "Today's reading could not be drawn just now. Refresh in a moment, or ask the astrologer directly.",
  "dash.moonEyebrow": "Tonight's moon",
  "dash.lunarGuide": "The lunar guide",
  "dash.astroEyebrow": "Today's reading",
  "dash.astroHeadline": "Your chart, your reading.",
  "dash.astroBodyFrom": "Drawn from your {sign} placement. For a longer reading rooted in your full chart, speak with the astrologer.",
  "dash.astroBodyAdd": "Add your birth date and city to receive a daily reading personal to you, and to begin conversations with the astrologer.",
  "dash.astroBodyFallback": "The astrologer is reading for you. For a longer reading rooted in your full chart, speak with the astrologer.",
  "dash.astroLink": "Ask your astrologer",
  "dash.dreamsEyebrow": "Dreams",
  "dash.dreamsHeadline": "What did the night bring?",
  "dash.dreamsBody": "Describe a dream while it's still fresh. The interpretation honors Lucumí, Espiritismo, folk Catholic, and Western traditions. Every dream ends with a ritual.",
  "dash.dreamsLink": "Interpret a dream",
  "dash.altarEyebrow": "Virtual altar",
  "dash.altarHeadline": "Light a candle.",
  "dash.altarBody": "For an intention. For protection. For someone you love who needs the prayer. Choose your candle, write your petition, and let it burn on your altar. Add it to the community altar so others hold the intention with you.",
  "dash.altarLink": "Light a candle",
  "dash.ancestorsEyebrow": "Ancestors altar",
  "dash.ancestorsHeadline": "A flame for those who came before.",
  "dash.ancestorsBody": "Memorialize the ones you carry. Their names lit. Their stories with you. Share a private link with family so they can add their light.",
  "dash.ancestorsLink": "Visit your ancestors",
  "dash.ritualsEyebrow": "The rituals library",
  "dash.ritualsHeadline": "More than four hundred rituals, organized by purpose.",
  "dash.ritualsBody": "Money drawing. Uncrossing. Road opening. Protection. Love that needs to land. Real workings from sixty-six years of practice, each with its steps, its supplies, and the day to do it. Search by your need and save the ones you return to.",
  "dash.ritualsLink": "Browse the library",
  "dash.benefitEyebrow": "A member benefit",
  "dash.benefitHeadline": "10% off at the botanica.",
  "dash.benefitBody": "Sign in to originalbotanica.com with the same email and your discount applies automatically at checkout. Every candle, oil, herb, and bath.",
  "dash.benefitLink": "Shop the botanica",
  "dash.giftEyebrow": "Give the gift of guidance",
  "dash.giftHeadline": "Know someone walking a hard road?",
  "dash.giftBody": "Give them a season at the botanica — daily tarot, dream interpretation, a place to honor their ancestors, and a spiritualist to talk with. A gift for a new practitioner, a grieving friend, or anyone who could use a little light.",
  "dash.giftCta": "Gift a membership",
  // daily tarot teaser
  "teaser.eyebrow": "Your card today",
  "teaser.title": "The card is waiting.",
  "teaser.body": "One card, pulled for you this {day}. A reading in the voice of the botanica, written for you, and a question to sit with for the day. Step into the pull when you are ready.",
  "teaser.cta": "Reveal today's card",
};

const es: Dict = {
  "nav.tarot": "Tarot",
  "nav.astrology": "Astrología",
  "nav.dreams": "Sueños",
  "nav.altar": "Altar",
  "nav.ancestors": "Ancestros",
  "nav.rituals": "Rituales",
  "nav.account": "Cuenta",
  "nav.accountBilling": "Cuenta y facturación",
  "nav.signOut": "Cerrar sesión",
  "nav.menu": "Menú",
  "nav.close": "Cerrar",
  "lang.label": "Idioma",

  // account page
  "account.eyebrow": "Tu cuenta",
  "account.membershipOf": "Membresía de {name}",
  "account.yourMembership": "Tu membresía",
  "account.membership": "Membresía",
  "account.status": "Estado",
  "account.plan": "Plan",
  "account.trialEnds": "La prueba termina",
  "account.renews": "Se renueva",
  "account.ends": "Termina",
  "account.statusTrialToday": "Prueba gratis — termina hoy",
  "account.statusTrialDays": "Prueba gratis — quedan {n} días",
  "account.statusTrialDay": "Prueba gratis — queda 1 día",
  "account.statusActiveCancel": "Activa — se cancela al final del período",
  "account.statusActive": "Activa",
  "account.statusPastDue": "Pago vencido",
  "account.statusGift": "Membresía de regalo — activa",
  "account.statusNone": "Sin membresía activa",
  "account.planMonthly": "Mensual ($24.95/mes)",
  "account.planAnnual": "Anual ($199.95/año)",
  "account.planGift": "Membresía de regalo",
  "account.giftTitle": "Tu membresía de regalo está activa.",
  "account.giftBodyThrough": "Todas las herramientas están abiertas para ti hasta el {date}. Cuando termine tu regalo, puedes continuar tu membresía cuando quieras — tu altar, tus ancestros y tus rituales guardados estarán aquí esperándote.",
  "account.giftBody": "Todas las herramientas están abiertas para ti. Cuando termine tu regalo, puedes continuar tu membresía cuando quieras — tu altar, tus ancestros y tus rituales guardados estarán aquí esperándote.",
  "account.manageIntro": "Actualiza tu método de pago, cambia o cancela tu plan y consulta tus facturas en el portal de facturación seguro.",
  "account.beginTitle": "Comienza tu membresía.",
  "account.beginBody": "Siete días gratis, luego tu plan. Cancela cuando quieras. Cada herramienta se abre en el momento en que te unes.",
  "account.giveGiftEyebrow": "Haz un regalo",
  "account.giveGiftBody": "¿Conoces a alguien que necesite un poco de guía? Regálale una temporada en la botánica.",
  "account.giftCta": "Regalar una membresía",
  "account.privacyNote": "Tus lecturas, sueños y ancestros son privados de tu cuenta. Consulta nuestra",
  "account.privacyLink": "política de privacidad",
  "account.signOut": "Cerrar sesión",
  "account.manageBilling": "Administrar facturación",
  "account.opening": "Abriendo...",
  "account.monthly": "Mensual · $24.95/mes",
  "account.annual": "Anual · $199.95/año",
  "account.starting": "Comenzando...",
  "account.errPortal": "No se pudo abrir el portal de facturación. Inténtalo de nuevo.",
  "account.errCheckout": "No se pudo iniciar el pago. Inténtalo de nuevo.",
  "account.errGeneric": "Algo salió mal. Inténtalo de nuevo.",

  // dashboard
  "dash.greetingMorning": "Buenos días",
  "dash.greetingAfternoon": "Buenas tardes",
  "dash.greetingEvening": "Buenas noches",
  "dash.heroWelcomeTitle": "Bienvenido a la práctica.",
  "dash.heroWelcomeBody": "Agrega tus datos de nacimiento y el astrólogo leerá para ti cada mañana.",
  "dash.heroReadingFor": "El astrólogo está leyendo para ti...",
  "dash.heroSignCandle": "{sign}. La vela está encendida.",
  "dash.heroSignError": "La lectura de hoy no se pudo realizar en este momento. Actualiza en un momento, o consulta directamente al astrólogo.",
  "dash.moonEyebrow": "La luna de esta noche",
  "dash.lunarGuide": "La guía lunar",
  "dash.astroEyebrow": "La lectura de hoy",
  "dash.astroHeadline": "Tu carta, tu lectura.",
  "dash.astroBodyFrom": "Basada en tu posición de {sign}. Para una lectura más profunda arraigada en tu carta completa, habla con el astrólogo.",
  "dash.astroBodyAdd": "Agrega tu fecha de nacimiento y ciudad para recibir una lectura diaria personal, y para comenzar conversaciones con el astrólogo.",
  "dash.astroBodyFallback": "El astrólogo está leyendo para ti. Para una lectura más profunda arraigada en tu carta completa, habla con el astrólogo.",
  "dash.astroLink": "Consulta a tu astrólogo",
  "dash.dreamsEyebrow": "Sueños",
  "dash.dreamsHeadline": "¿Qué trajo la noche?",
  "dash.dreamsBody": "Describe un sueño mientras aún está fresco. La interpretación honra las tradiciones Lucumí, Espiritismo, católica popular y occidental. Cada sueño termina con un ritual.",
  "dash.dreamsLink": "Interpretar un sueño",
  "dash.altarEyebrow": "Altar virtual",
  "dash.altarHeadline": "Enciende una vela.",
  "dash.altarBody": "Por una intención. Por protección. Por alguien que amas y necesita la oración. Elige tu vela, escribe tu petición y déjala arder en tu altar. Agrégala al altar comunitario para que otros sostengan la intención contigo.",
  "dash.altarLink": "Encender una vela",
  "dash.ancestorsEyebrow": "Altar de ancestros",
  "dash.ancestorsHeadline": "Una llama para quienes vinieron antes.",
  "dash.ancestorsBody": "Honra a los que llevas contigo. Sus nombres encendidos. Sus historias contigo. Comparte un enlace privado con tu familia para que puedan añadir su luz.",
  "dash.ancestorsLink": "Visita a tus ancestros",
  "dash.ritualsEyebrow": "La biblioteca de rituales",
  "dash.ritualsHeadline": "Más de cuatrocientos rituales, organizados por propósito.",
  "dash.ritualsBody": "Atracción de dinero. Descruce. Apertura de caminos. Protección. Amor que necesita llegar. Trabajos reales de sesenta y seis años de práctica, cada uno con sus pasos, sus materiales y el día para hacerlo. Busca por tu necesidad y guarda los que vuelvas a usar.",
  "dash.ritualsLink": "Explorar la biblioteca",
  "dash.benefitEyebrow": "Un beneficio de membresía",
  "dash.benefitHeadline": "10% de descuento en la botánica.",
  "dash.benefitBody": "Inicia sesión en originalbotanica.com con el mismo correo y tu descuento se aplica automáticamente al pagar. Cada vela, aceite, hierba y baño.",
  "dash.benefitLink": "Compra en la botánica",
  "dash.giftEyebrow": "Regala el don de la guía",
  "dash.giftHeadline": "¿Conoces a alguien que esté pasando por un camino difícil?",
  "dash.giftBody": "Regálale una temporada en la botánica — tarot diario, interpretación de sueños, un lugar para honrar a sus ancestros y un espiritualista con quien hablar. Un regalo para un nuevo practicante, un amigo en duelo, o cualquiera que necesite un poco de luz.",
  "dash.giftCta": "Regalar una membresía",
  // daily tarot teaser
  "teaser.eyebrow": "Tu carta de hoy",
  "teaser.title": "La carta está esperando.",
  "teaser.body": "Una carta, sacada para ti este {day}. Una lectura en la voz de la botánica, escrita para ti, y una pregunta para contemplar durante el día. Entra en la tirada cuando estés listo.",
  "teaser.cta": "Revela la carta de hoy",
};

const MESSAGES: Record<Locale, Dict> = { en, es };

/** Translate a key for a locale, with optional {var} interpolation. */
export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const table = MESSAGES[locale] || MESSAGES.en;
  let s = table[key] ?? MESSAGES.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}
