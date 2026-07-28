import { createAdminClient } from "@/utils/supabase/admin";
import { type Attribution, sha256Lower } from "./attribution";

/**
 * Server-side conversion reporting — the authoritative half.
 *
 * Browser pixels miss a large share of conversions (ad blockers, iOS,
 * Safari). Worse, the ones they miss look like wasted ad spend, so
 * campaigns that are actually working get killed. These calls report the
 * conversion from our own server at the moment Stripe confirms money,
 * which no blocker can prevent.
 *
 * Every call carries an `eventId` matching the browser event, so each
 * platform de-duplicates rather than counting the sale twice.
 *
 * All of this is best-effort and non-blocking: an ad platform being down
 * must never break a payment webhook.
 */

export type ConversionEvent =
  | "StartTrial"      // signed up, trial began — no money yet
  | "Purchase"        // first (or renewal) payment succeeded
  | "GiftPurchase";   // one-time gift membership bought

export type ConversionInput = {
  event: ConversionEvent;
  eventId: string;
  /** Dollars. Omitted for trial starts. */
  value?: number;
  currency?: string;
  email?: string | null;
  attribution?: Attribution | null;
  /** Best-effort request context for match quality. */
  ip?: string | null;
  userAgent?: string | null;
  sourceUrl?: string;
};

/** Look up the ad click stored on the member's profile at signup. */
export async function attributionForUser(
  userId: string,
): Promise<{ attribution: Attribution | null; email: string | null }> {
  try {
    const { data } = await createAdminClient()
      .from("profiles")
      .select("attribution, email")
      .eq("id", userId)
      .maybeSingle();
    return {
      attribution: (data?.attribution as Attribution) ?? null,
      email: data?.email ?? null,
    };
  } catch {
    return { attribution: null, email: null };
  }
}

/** Report one conversion to every configured platform. Never throws. */
export async function reportConversion(input: ConversionInput): Promise<void> {
  await Promise.allSettled([
    sendMeta(input),
    sendTikTok(input),
    sendGoogleAds(input),
  ]);
}

/* ── Meta Conversions API ─────────────────────────────────────────── */

async function sendMeta(i: ConversionInput): Promise<void> {
  const pixel = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return;

  const userData: Record<string, unknown> = {};
  if (i.email) userData.em = [await sha256Lower(i.email)];
  if (i.attribution?.fbc) userData.fbc = i.attribution.fbc;
  if (i.attribution?.fbp) userData.fbp = i.attribution.fbp;
  if (i.ip) userData.client_ip_address = i.ip;
  if (i.userAgent) userData.client_user_agent = i.userAgent;

  // Meta's own event names.
  const eventName =
    i.event === "StartTrial"
      ? "StartTrial"
      : i.event === "GiftPurchase"
        ? "Purchase"
        : "Purchase";

  // Tagged so membership sales can be told apart from store sales in
  // Meta reporting — the same pixel serves both. In Events Manager,
  // create a Custom Conversion filtered on content_category =
  // "membership" to see The Practice on its own.
  const customData: Record<string, unknown> = {
    content_category: "membership",
    content_name:
      i.event === "GiftPurchase" ? "Gift membership" : "The Practice membership",
  };
  if (i.value != null) {
    customData.value = i.value;
    customData.currency = i.currency ?? "USD";
  }

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: i.eventId,
        action_source: "website",
        event_source_url: i.sourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  await fetch(
    `https://graph.facebook.com/v21.0/${pixel}/events?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  ).catch(() => undefined);
}

/* ── TikTok Events API ────────────────────────────────────────────── */

async function sendTikTok(i: ConversionInput): Promise<void> {
  const pixel =
    process.env.TIKTOK_PIXEL_ID || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!pixel || !token) return;

  const eventName =
    i.event === "StartTrial" ? "Subscribe" : "CompletePayment";

  const user: Record<string, unknown> = {};
  if (i.email) user.email = await sha256Lower(i.email);
  if (i.attribution?.ttclid) user.ttclid = i.attribution.ttclid;
  if (i.ip) user.ip = i.ip;
  if (i.userAgent) user.user_agent = i.userAgent;

  const body = {
    event_source: "web",
    event_source_id: pixel,
    data: [
      {
        event: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: i.eventId,
        user,
        page: i.sourceUrl ? { url: i.sourceUrl } : undefined,
        properties: {
          content_type: "membership",
          content_name:
            i.event === "GiftPurchase"
              ? "Gift membership"
              : "The Practice membership",
          ...(i.value != null
            ? { value: i.value, currency: i.currency ?? "USD" }
            : {}),
        },
      },
    ],
  };

  await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Token": token,
    },
    body: JSON.stringify(body),
  }).catch(() => undefined);
}

/* ── Google Ads (offline click conversions) ───────────────────────── */

/**
 * Google's conversion upload needs OAuth against the Ads API, which is a
 * heavier setup than Meta's or TikTok's token. Until those credentials
 * exist we record the conversion locally so nothing is lost: the gclid,
 * the value, and the time are all kept, and can be uploaded in bulk from
 * Google Ads (Tools → Conversions → Uploads) — or wired to the API later
 * without changing anything else.
 */
async function sendGoogleAds(i: ConversionInput): Promise<void> {
  const gclid = i.attribution?.gclid;
  if (!gclid) return;
  try {
    await createAdminClient().from("google_ads_conversions").insert({
      gclid,
      event: i.event,
      event_id: i.eventId,
      value: i.value ?? null,
      currency: i.currency ?? "USD",
      occurred_at: new Date().toISOString(),
    });
  } catch {
    /* table not present yet — nothing else depends on this */
  }
}
