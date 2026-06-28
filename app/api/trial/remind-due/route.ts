import { NextResponse } from "next/server";
import { sendDueTrialReminders } from "@/lib/trial-reminder";

/**
 * Daily trial-ending reminders.
 *
 * Emails every member whose free trial ends within the next ~36 hours so the
 * first charge is never a surprise. Scheduled by vercel.json -> crons.
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>`. Vercel Cron sends this
 * header automatically when the CRON_SECRET env var is set. We do NOT trust the
 * `x-vercel-cron` header — any client can set it on a request to the public URL.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authed =
    !!secret && request.headers.get("authorization") === `Bearer ${secret}`;

  if (!authed) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const sent = await sendDueTrialReminders();
  return NextResponse.json({ sent });
}
