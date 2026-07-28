"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Advertising pixels — Meta, TikTok, Google Ads, and GA4.
 *
 * Each one only loads if its ID is set in the environment, so nothing
 * runs (and no third-party script is served) until Jason actually
 * creates that ad account. Development never loads them.
 *
 * These are the *browser* half of conversion tracking. They're fast but
 * lossy — ad blockers and iOS drop a large share. The authoritative half
 * lives in lib/ads/conversions.ts, fired from the Stripe webhook where
 * the payment is confirmed. Events carry a shared event_id so each
 * platform de-duplicates the two copies instead of double-counting.
 */

const META = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
const GADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const GA4 = process.env.NEXT_PUBLIC_GA4_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (e: string, p?: unknown, o?: unknown) => void; page: () => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function AdPixels() {
  const pathname = usePathname();

  // Single-page navigations don't reload the page, so each pixel needs a
  // nudge on route changes or everything after the first page is missed.
  useEffect(() => {
    if (!pathname) return;
    window.fbq?.("track", "PageView");
    window.ttq?.page();
    if (GA4) window.gtag?.("event", "page_view", { page_path: pathname });
  }, [pathname]);

  return (
    <>
      {META && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META}');fbq('track','PageView');`}
        </Script>
      )}

      {TIKTOK && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");
o.type="text/javascript";o.async=!0;o.src=r+"?sdkid="+e+"&lib="+t;
var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load('${TIKTOK}');ttq.page();}(window,document,'ttq');`}
        </Script>
      )}

      {(GADS || GA4) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GADS || GA4}`}
            strategy="afterInteractive"
          />
          <Script id="google-tags" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;gtag('js',new Date());
${GA4 ? `gtag('config','${GA4}');` : ""}
${GADS ? `gtag('config','${GADS}');` : ""}`}
          </Script>
        </>
      )}
    </>
  );
}

/**
 * Fire a browser-side conversion event on all configured platforms.
 *
 * `eventId` must match the ID the server sends for the same conversion,
 * so the platforms recognize them as one event.
 */
export function trackAdEvent(
  name: "StartTrial" | "CompleteRegistration" | "Purchase",
  opts: { eventId: string; value?: number; currency?: string } = {
    eventId: "",
  },
) {
  const { eventId, value, currency = "USD" } = opts;

  // Tagged "membership" so these can be separated from store sales —
  // the same Meta pixel serves originalbotanica.com and The Practice.
  const tag = {
    content_category: "membership",
    content_name: "The Practice membership",
  };

  window.fbq?.(
    "track",
    name,
    value ? { ...tag, value, currency } : tag,
    { eventID: eventId },
  );

  const ttName =
    name === "Purchase"
      ? "CompletePayment"
      : name === "StartTrial"
        ? "Subscribe"
        : "CompleteRegistration";
  window.ttq?.track(
    ttName,
    value
      ? { content_type: "membership", value, currency }
      : { content_type: "membership" },
    { event_id: eventId },
  );

  if (GA4) {
    window.gtag?.("event", name.toLowerCase(), {
      value,
      currency,
      transaction_id: eventId,
    });
  }
}
