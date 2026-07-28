/**
 * Ad attribution — remembering where a member came from.
 *
 * Someone clicks a Facebook ad on Tuesday, signs up Wednesday, and their
 * first payment lands the following Wednesday when the trial ends. The
 * ad platforms can only credit that payment if we hand back the click ID
 * they gave us on the way in. So we capture it at the landing, keep it in
 * a cookie, save it to the profile at signup, and read it back out when
 * Stripe tells us the money arrived.
 *
 * What we keep is the platforms' own click IDs and the campaign tags we
 * put on our own ad links — no personal information.
 */

export const ATTRIBUTION_COOKIE = "ob_attr";
/** Long enough to cover click → signup → trial end → first payment. */
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 90;

export type Attribution = {
  /** Meta click ID (fbclid), formatted for the Conversions API. */
  fbc?: string;
  /** Meta browser ID from the _fbp cookie the pixel sets. */
  fbp?: string;
  /** TikTok click ID. */
  ttclid?: string;
  /** Google Ads click ID. */
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** First page they landed on, and where they came from. */
  landing?: string;
  referrer?: string;
  /** When the click happened (ms), needed for Meta's fbc format. */
  ts?: number;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/**
 * Read attribution out of a landing URL. Returns null when the visit
 * carries no ad markers at all (most organic visits), so we don't write
 * cookies for people who didn't come from an ad.
 */
export function attributionFromUrl(
  url: URL,
  referrer?: string | null,
): Attribution | null {
  const p = url.searchParams;
  const now = Date.now();
  const attr: Attribution = {};

  const fbclid = p.get("fbclid");
  // Meta wants fbc in the shape: fb.1.<timestamp>.<fbclid>
  if (fbclid) attr.fbc = `fb.1.${now}.${fbclid}`;

  const ttclid = p.get("ttclid");
  if (ttclid) attr.ttclid = ttclid;

  const gclid = p.get("gclid") || p.get("wbraid") || p.get("gbraid");
  if (gclid) attr.gclid = gclid;

  for (const k of UTM_KEYS) {
    const v = p.get(k);
    if (v) attr[k] = v.slice(0, 200);
  }

  if (Object.keys(attr).length === 0) return null;

  attr.ts = now;
  attr.landing = `${url.pathname}${url.search}`.slice(0, 300);
  if (referrer) attr.referrer = referrer.slice(0, 300);
  return attr;
}

export function encodeAttribution(attr: Attribution): string {
  return encodeURIComponent(JSON.stringify(attr));
}

export function decodeAttribution(raw: string | undefined): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return typeof parsed === "object" && parsed ? (parsed as Attribution) : null;
  } catch {
    return null;
  }
}

/** Hash an email the way Meta and TikTok require for matching. */
export async function sha256Lower(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
