import { NextResponse } from "next/server";
import { deliverDueGifts } from "@/lib/gift-fulfill";

/**
 * Daily delivery of scheduled gifts.
 *
 * Sends the recipient email for any paid gift whose chosen delivery date has
 * arrived (gifts with no date are delivered immediately on payment, in the
 * webhook). Scheduled by vercel.json -> crons.
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

  const delivered = await deliverDueGifts();
  return NextResponse.json({ delivered });
}
