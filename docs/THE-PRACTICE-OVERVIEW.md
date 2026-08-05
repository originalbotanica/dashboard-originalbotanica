# The Practice — Project Briefing

*Context document for AI assistants and collaborators. Written August 2, 2026.
No credentials or secrets appear in this document; it is safe to share.*

## What it is

**The Practice** is Original Botanica's digital membership — a virtual
spiritual home at what will be **members.originalbotanica.com** (currently in
final testing at dashboard-originalbotanica.vercel.app). Members pay
**$29.95/month** (or $199.95/year, both with a 7-day free trial) for a private
dashboard of daily spiritual tools. The tagline: **"Your virtual spiritual
home."**

Membership also includes **20% off everything at originalbotanica.com**, the
company's e-commerce store.

## Who is behind it

**Original Botanica** is a family-owned botanica in the Bronx, New York,
serving its community since **1959** — one of the oldest botanicas in the
country. The store (originalbotanica.com, ~$2.2M/yr revenue) sells spiritual
products: prayer candles, oils, baths, incense, statuary, and sacred tools
across many traditions. Owner: **Jason**. The Practice is Jason's project to
extend the botanica's guidance and community online. The main store site is
built and maintained separately by the agency **Lighthaus Design**.

## The six member tools

1. **Your Astrologer** — a personal AI astrologer, rooted in the member's real
   natal chart (birth date, time, place; charts computed with professional
   astrology data, DST-correct). Members chat with the astrologer, get a
   personalized daily reading on their dashboard, a monthly forecast, and
   compatibility readings. Conversations are saved as an ongoing relationship.

2. **Tarot Today** — one card pulled per day on a spinning tarot fortune
   wheel, interpreted in the voice of the botanica, with reflection and
   suggested next steps.

3. **Dream Journal** — members describe a dream while it's fresh; the
   interpretation honors Lucumí, Espiritismo, folk Catholic, and Western
   traditions. Every dream becomes a journal entry they can revisit and
   discuss further. Every dream ends with a suggested ritual.

4. **The Virtual Altar** — members light a virtual 7-day candle with a written
   intention (a "desire"), choose from dozens of real candle designs from the
   botanica's shelves, and return daily to "feed the flame." Candles burn down
   realistically over seven days. Each candle has a private prayer and can be
   shared via a public link so friends can visit the flame. Traditional
   prayers (in English and Spanish) accompany the lighting.

5. **Ancestors Altar** — "A flame for those who came before." Members create
   memorials for deceased loved ones (name, relationship, photo), keep an
   eternal flame lit for each, and set daily offerings on the altar: fresh
   water, flowers, black coffee, a bowl of fruit, or ancestor money — each
   framed with respect for the tradition it comes from. Offerings persist for
   seven days. Memorial pages can be shared publicly so family can visit.

6. **Ritual Library ("The Archive")** — "66 years of practice, organized by
   purpose." Hundreds of real rituals from the botanica's archive, searchable
   by need (love, money drawing, protection, cleansing, gambling & luck, road
   opening, etc.), with difficulty levels and the traditions they come from.
   Rituals link to the physical supplies at originalbotanica.com. Members can
   save favorites.

Plus: a **spiritual calendar** (saint and Orisha feast days, new/full moons,
seasonal turning points, with an ICS feed members can subscribe to), **gift
memberships** (buy a season of The Practice for someone; they redeem a code),
and full **English/Spanish** bilingual support throughout.

## Brand voice (how The Practice speaks)

The voice is a **wise, warm elder who welcomes everyone** — spiritually
authoritative but never academic, never preachy. Five attributes: grounded &
knowledgeable, warm & welcoming, empowering & practical, spiritually
inclusive, rooted & authentic. It honors Santería/Lucumí, Hoodoo, Wicca, folk
Catholicism, and Espiritismo equally and never treats the sacred as trendy.

Preferred terms: "spiritual work" (not spell casting), "ritual" (not spell),
"practitioner" (not witch/bruja), "sacred tools" (not occult products),
"spiritualist" (not psychic), "intention" (not wish), "Orishas" always
capitalized, "the Bronx" always with "the." Never: fear-mongering,
gatekeeping, hype, urgency tactics, ALL CAPS.

Key phrases: "Sacred Energy You Can Feel" · "Let Our Spiritualists Help You
Manifest Your Dreams."

## How it's built (plain-English)

A modern web app (Next.js/React) hosted on Vercel, with a Supabase database
handling accounts, member data, and uploaded photos. Stripe runs the
subscriptions and gift purchases. The AI readings (astrologer, tarot, dreams)
are powered by Anthropic's Claude, grounded in real astrological calculations
and the botanica's own ritual archive. Transactional email goes through
Resend. Conversion tracking is wired for Meta and Google Analytics. Members'
dreams, prayers, and personal data are private to their accounts.

## Current status (August 2026)

- Feature-complete and in **private tester phase** — testers join via gift
  codes; feedback is collected through an in-app feedback box.
- Launch is imminent. Remaining launch steps: switch Stripe from test mode to
  live, point members.originalbotanica.com at the app, connect the store's
  20% member discount, and send the launch email campaign (Mailchimp, 70K
  list).
- Post-launch roadmap ideas: welcome email series, ancestor-date reminders
  (light their candle on a birthday or anniversary), the astrologer's daily
  candle recommendation.

## Numbers worth knowing

- $29.95/month or $199.95/year, 7-day free trial on both
- 20% member discount at originalbotanica.com (store side handled by
  Lighthaus)
- Store context: ~135K sessions/month, $147 average order, 70K email list,
  2x/week email cadence (Tuesday content, Friday ritual/seasonal)
- Business est. 1959, Webster Avenue, the Bronx
