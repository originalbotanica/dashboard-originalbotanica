import Link from "next/link";
import { redirect } from "next/navigation";
import { MemberNav } from "@/components/member-nav";
import { createClient } from "@/utils/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import {
  easternToday,
  getUpcoming,
  getEventsBetween,
  getActiveNovena,
  addDays,
  type CalEvent,
} from "@/lib/calendar/events";
import { CalendarMonthGrid } from "@/components/calendar-month-grid";

export const metadata = {
  title: "The spiritual calendar",
  description:
    "Saint and Orisha feast days, the new and full moons, and the turning of the seasons, with an action for each.",
};

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");

  const locale = await getLocale();
  const intl = locale === "es" ? "es-ES" : "en-US";
  const today = easternToday();
  const todayKey = today.y * 10000 + today.m * 100 + today.d;
  const events = getUpcoming(today, 120, 40);

  const gridFrom = { y: today.y, m: today.m, d: 1 };
  const gridEvents = getEventsBetween(gridFrom, addDays(gridFrom, 280));
  const novena = getActiveNovena(today);

  // Group by month for headers.
  const groups: { label: string; items: CalEvent[] }[] = [];
  for (const e of events) {
    const label = new Date(Date.UTC(e.y, e.m - 1, 1)).toLocaleDateString(intl, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(e);
    else groups.push({ label, items: [e] });
  }

  return (
    <main className="min-h-screen">
      <MemberNav />

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <p className="eyebrow mb-3 text-[var(--accent)]">{t(locale, "nav.calendar")}</p>
        <h1 className="display text-4xl md:text-5xl leading-tight mb-4">
          {t(locale, "cal.pageTitle")}
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed max-w-2xl mb-5">
          {t(locale, "cal.pageIntro")}
        </p>
        <a
          href="/api/calendar/ics"
          download
          className="nav-link text-[var(--accent)] inline-flex items-center gap-2 text-sm mb-10"
        >
          {t(locale, "cal.addToCalendar")}
          <span aria-hidden>↓</span>
        </a>

        {novena && (
          <Link
            href={novena.href}
            className="flex items-center gap-3 rounded-xl border px-4 py-3 mb-10 text-sm"
            style={{ borderColor: `${novena.color}66`, color: novena.color }}
          >
            <span
              aria-hidden
              className="rounded-full"
              style={{ width: 9, height: 9, background: novena.color, boxShadow: `0 0 10px ${novena.color}` }}
            />
            {t(locale, "cal.novena", { name: novena.name })} ·{" "}
            {t(locale, "cal.novenaDay", { n: novena.day, total: novena.total })}
            <span aria-hidden className="ml-auto">→</span>
          </Link>
        )}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2.5 sm:p-6 md:p-7 mb-14">
          <CalendarMonthGrid events={gridEvents} today={today} locale={locale} />
        </div>

        {groups.length === 0 ? (
          <p className="text-[var(--foreground-muted)]">{t(locale, "cal.empty")}</p>
        ) : (
          <div className="space-y-12">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="eyebrow mb-5 text-[var(--foreground-subtle)] capitalize">
                  {g.label}
                </p>
                <ul className="space-y-4">
                  {g.items.map((e) => {
                    const isToday = e.y * 10000 + e.m * 100 + e.d === todayKey;
                    const dateLabel = new Date(
                      Date.UTC(e.y, e.m - 1, e.d),
                    ).toLocaleDateString(intl, {
                      weekday: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    });
                    return (
                      <li
                        key={e.id}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 flex gap-4"
                        style={
                          isToday
                            ? { borderColor: e.color }
                            : undefined
                        }
                      >
                        <div className="shrink-0 w-14 text-center">
                          <div
                            aria-hidden
                            className="mx-auto mb-2 rounded-full"
                            style={{
                              width: 12,
                              height: 12,
                              background: e.color,
                              boxShadow: `0 0 12px ${e.color}`,
                            }}
                          />
                          <p className="text-xs text-[var(--foreground-subtle)] leading-tight capitalize">
                            {dateLabel}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="display text-lg leading-tight">
                              {e.title}
                            </h2>
                            {isToday && (
                              <span
                                className="eyebrow text-[11px] px-2 py-0.5 rounded-full"
                                style={{ color: e.color, border: `1px solid ${e.color}` }}
                              >
                                {t(locale, "cal.today")}
                              </span>
                            )}
                          </div>
                          <p className="text-[var(--foreground-muted)] text-sm leading-relaxed mt-1">
                            {locale === "es" ? e.es : e.en}
                          </p>
                          <Link
                            href={e.action.href}
                            className="nav-link inline-flex items-center gap-2 mt-3 text-sm"
                            style={{ color: e.color }}
                          >
                            {locale === "es" ? e.action.es : e.action.en}
                            <span aria-hidden>→</span>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
