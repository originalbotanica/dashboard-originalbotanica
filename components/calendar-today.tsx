import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { t, type Locale } from "@/lib/i18n/dictionary";
import {
  easternToday,
  getObservancesFor,
  getUpcoming,
  getActiveNovena,
  addDays,
  type CalEvent,
} from "@/lib/calendar/events";

/**
 * "Today on the calendar" — the daily spiritual-calendar touchpoint on the
 * dashboard. Shows what today holds (a feast/Orisha day, a new or full moon,
 * a season turning, Mercury retrograde) with a one-tap action. If nothing
 * falls today, it gently points to the next thing coming up.
 */
export async function CalendarToday() {
  const locale = await getLocale();
  const today = easternToday();

  const todays = getObservancesFor(today);
  const event = todays[0] ?? getUpcoming(today, 90, 1)[0];
  if (!event) return null;

  const isToday = todays.length > 0;
  const line = locale === "es" ? event.es : event.en;
  const ctaLabel = locale === "es" ? event.action.es : event.action.en;
  const novena = getActiveNovena(today);

  return (
    <section
      aria-label={t(locale, "cal.todayEyebrow")}
      className="border-t border-[var(--border)]"
    >
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start gap-5 md:gap-8">
          <span
            aria-hidden
            className="mt-1.5 shrink-0 rounded-full"
            style={{
              width: 14,
              height: 14,
              background: event.color,
              boxShadow: `0 0 16px ${event.color}`,
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="eyebrow mb-1 text-[var(--foreground-muted)]">
              {isToday
                ? t(locale, "cal.todayEyebrow")
                : `${t(locale, "cal.upcomingEyebrow")} · ${relativeLabel(today, event, locale)}`}
            </p>
            <p className="display text-xl md:text-2xl leading-tight">
              {event.title}
            </p>
            <p className="text-[var(--foreground-muted)] text-sm leading-relaxed mt-1 max-w-2xl">
              {line}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
              <Link
                href={event.action.href}
                className="nav-link inline-flex items-center gap-2"
                style={{ color: event.color }}
              >
                {ctaLabel}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/calendar"
                className="nav-link text-[var(--foreground-subtle)] hover:text-[var(--accent)] inline-flex items-center gap-1.5"
              >
                {t(locale, "cal.viewAll")}
              </Link>
            </div>

            {novena && (
              <Link
                href={novena.href}
                className="mt-4 inline-flex items-center gap-2 text-sm rounded-lg border px-3 py-2"
                style={{ borderColor: `${novena.color}66`, color: novena.color }}
              >
                <span
                  aria-hidden
                  className="rounded-full"
                  style={{ width: 8, height: 8, background: novena.color }}
                />
                {t(locale, "cal.novena", { name: novena.name })} ·{" "}
                {t(locale, "cal.novenaDay", { n: novena.day, total: novena.total })}
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Tomorrow" / "in N days" for an upcoming event. */
function relativeLabel(
  today: { y: number; m: number; d: number },
  event: CalEvent,
  locale: Locale,
): string {
  let n = 0;
  let cur = today;
  // small forward walk (events shown are within ~90 days)
  for (let i = 0; i < 120; i++) {
    if (cur.y === event.y && cur.m === event.m && cur.d === event.d) {
      n = i;
      break;
    }
    cur = addDays(cur, 1);
  }
  if (n <= 0) return t(locale, "cal.today");
  if (n === 1) return t(locale, "cal.tomorrow");
  return t(locale, "cal.inDays", { n });
}
