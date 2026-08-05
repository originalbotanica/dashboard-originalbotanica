# Ad conversion tracking — setup guide

Everything is built. Nothing runs until you add the IDs below, so the site
behaves exactly as it does today until you're ready to advertise.

Add each value in **Vercel → your project → Settings → Environment
Variables**, then redeploy. Add only the platforms you're actually using —
each one is independent.

---

## What gets measured

| Moment | What's reported | Value |
|---|---|---|
| Someone starts a free trial | `StartTrial` | no money yet |
| Trial converts to a paying member | `Purchase` | $29.95 (or $199.95 annual) |
| Every renewal after that | `Purchase` | the amount charged |
| Someone buys a gift membership | `Purchase` | the gift price |

Two copies of each event are sent — one from the browser, one from our
server the moment Stripe confirms the money. They share an ID so the
platforms count them once. The server copy is the one that survives ad
blockers and iPhone privacy settings, which is where most tracking fails.

---

## Meta (Facebook + Instagram)

Instagram needs no separate setup — Meta ads on Facebook and Instagram
share one pixel.

**Create a new pixel dedicated to The Practice.** The store's existing
pixel (`190400753145730`) should stay on originalbotanica.com. Keeping
them separate means membership conversions never get mixed into store
campaign optimization, and each product's reporting stands alone.

1. **Events Manager → Connect Data Sources → Web → Meta Pixel.** Name it
   "The Practice." Copy the pixel ID.
2. Same pixel → **Settings → Conversions API → Generate access token.**
   Copy it (starts `EAA`) and paste it straight into Vercel — never into
   email or chat; it's a key to the ad account.
3. **Business Settings → Brand Safety → Domains:** add and verify
   `members.originalbotanica.com`. Meta requires a verified domain for
   accurate iOS reporting.

```
NEXT_PUBLIC_META_PIXEL_ID = <the new pixel ID>
META_CAPI_TOKEN           = EAA...
```

Events are also tagged `content_category = membership`, so even if the
pixels are ever merged, membership can still be filtered out on its own
via a Custom Conversion.

### Retargeting store customers

You don't need a shared pixel for this. In Meta, build a Custom Audience
from the *store* pixel (people who viewed or purchased at
originalbotanica.com) and target it from a Practice campaign. Best
converting audience you have, and reporting stays clean.

## TikTok

1. **TikTok Ads Manager → Assets → Events → Web Events.** Create a pixel
   if you don't have one; copy the Pixel ID.
2. Same pixel → **Settings → Events API → Generate Access Token.**

```
NEXT_PUBLIC_TIKTOK_PIXEL_ID = C8ABC...
TIKTOK_ACCESS_TOKEN         = ...
```

## Google Ads + Analytics

1. **Google Ads → Tools → Conversions.** Your conversion tag ID looks
   like `AW-123456789`.
2. **Google Analytics → Admin → Data Streams** for the GA4 ID
   (`G-XXXXXXX`). Optional but recommended — it's where you'll see the
   whole funnel.

```
NEXT_PUBLIC_GOOGLE_ADS_ID = AW-123456789
NEXT_PUBLIC_GA4_ID        = G-XXXXXXX
```

**Note on Google:** Meta and TikTok accept a simple token, but Google's
conversion upload requires full OAuth against their Ads API — a heavier
setup that's rarely worth it at the start. Until that's wired, every
Google conversion is recorded in the `google_ads_conversions` table with
its click ID, value, and time. You can export those and upload them in
bulk (Google Ads → Tools → Conversions → Uploads), or I can wire the API
later. Nothing is lost either way.

---

## Tagging your ads

The click IDs (`fbclid`, `ttclid`, `gclid`) are added automatically by the
platforms. What you should add yourself is UTM tags, so reports read in
plain language:

```
https://members.originalbotanica.com/?utm_source=facebook&utm_medium=paid&utm_campaign=launch-oct&utm_content=candle-video
```

Use the same `utm_source` names consistently: `facebook`, `instagram`,
`tiktok`, `google`.

---

## Before you spend money

1. **Run one test purchase** in Stripe test mode and confirm the event
   appears in Meta Events Manager (Test Events tab) and TikTok.
2. **Check the Meta pixel's Event Match Quality** score after a few real
   conversions — it should be "Good" or better.
3. **Read the ad policies.** Meta and TikTok restrict spiritual, occult,
   and divination advertising, and accounts do get rejected. Sell access
   to the tradition and the practice, not outcomes — never "this will
   bring you money/love." Your brand voice already avoids promises and
   fear-based urgency, which is exactly right; keep ad creative to the
   same standard.

---

## Judging the results

Trial starts are cheap and misleading — many never convert. The number
that decides your spend is **cost per paying member**: ad spend divided by
members who made it past the trial. Compare that to what a member is worth
over their lifetime (at $29.95/month, even six months is ~$180), and you
have your answer on whether to scale a campaign or kill it.

Give each campaign a full trial cycle plus a week before judging it —
anything sooner and you're reading trial starts, not revenue.

---

## When the domain becomes members.originalbotanica.com

Three things to update at the same time as the DNS switch:

1. **Vercel:** `NEXT_PUBLIC_SITE_URL = https://members.originalbotanica.com`
2. **Meta:** verify the domain (Business Settings → Brand Safety → Domains)
3. **GA4:** the data stream URL should be the new domain

Attribution itself doesn't care about the domain — click IDs are captured
from whatever URL the ad lands on.

---

## Turning it off

Delete the environment variables and redeploy. No pixels load, no events
are sent, and the attribution cookie stops being written.
