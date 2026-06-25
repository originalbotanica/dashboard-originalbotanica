import { getUpcoming, easternToday, addDays } from "@/lib/calendar/events";

/**
 * GET /api/calendar/ics
 *
 * The spiritual calendar's upcoming observances as a downloadable .ics file
 * (feast/Orisha days, moons, seasons, Mercury retrograde) — all-day events a
 * member can drop into Apple/Google/Outlook calendars. No personal data, so
 * it's safe to serve without auth.
 */
export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

const pad = (n: number) => String(n).padStart(2, "0");
const dstr = (e: { y: number; m: number; d: number }) =>
  `${e.y}${pad(e.m)}${pad(e.d)}`;

export async function GET() {
  const today = easternToday();
  const events = getUpcoming(today, 200, 80);
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Practice//Spiritual Calendar//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:The Practice",
  ];

  for (const e of events) {
    const end = addDays({ y: e.y, m: e.m, d: e.d }, 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@thepractice`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dstr(e)}`,
      `DTEND;VALUE=DATE:${dstr(end)}`,
      `SUMMARY:${esc(e.title)}`,
      `DESCRIPTION:${esc(e.en)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="the-practice-calendar.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
