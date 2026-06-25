import { NextResponse } from "next/server";
import { sendDueTrialReminders } from "@/lib/trial-reminder";

/**
 * Daily trial-ending reminders.
 *
 * Emails every member whose free trial ends within the next ~36 hours so the
 * first charge is never a surprise. Scheduled by vercel.json -> crons.
 *
 * Auth: allowed when called by Vercel Cron (sets the `x-vercel-cron` header)
 * or with `Authorization: Bearer <CRON_SECRET>` for manual runs.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const isVercelCron = request.headers.get("x-vercel-cron") !== null;
  const secret = process.env.CRON_SECRET;
  const authed =
    isVercelCron ||
    (!!secret && request.headers.get("authorization") === `Bearer ${secret}`);

  if (!authed) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const sent = await sendDueTrialReminders();
  return NextResponse.json({ sent });
}
