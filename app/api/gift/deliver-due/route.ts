import { NextResponse } from "next/server";
import { deliverDueGifts } from "@/lib/gift-fulfill";

/**
 * Daily delivery of scheduled gifts.
 *
 * Sends the recipient email for any paid gift whose chosen delivery date has
 * arrived (gifts with no date are delivered immediately on payment, in the
 * webhook). Scheduled by vercel.json -> crons.
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

  const delivered = await deliverDueGifts();
  return NextResponse.json({ delivered });
}
