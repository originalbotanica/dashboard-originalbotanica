# Launch checklist — The Practice

Everything that has to happen to move from
`dashboard-originalbotanica.vercel.app` to
**`members.originalbotanica.com`** and go live.

Ordered so nothing breaks mid-flight. Items marked **[Lighthaus]** need
the developer; the rest Jason can do (with Claude walking through them).

---

## 1. Domain

- **[Lighthaus]** DNS at the registrar: add a CNAME record —
  `members` → `cname.vercel-dns.com`
  (Vercel shows the exact target when the domain is added.)
- In Vercel → **Settings → Domains**, add `members.originalbotanica.com`
  and wait for the certificate to issue (usually minutes).
- Vercel → **Environment Variables**: set
  `NEXT_PUBLIC_SITE_URL = https://members.originalbotanica.com`, redeploy.

## 2. Things that break if the domain changes and they don't

- **Supabase → Authentication → URL Configuration:** set Site URL to the
  new domain and add it to Redirect URLs. *Sign-in and email confirmation
  links break without this.*
- **Stripe → Developers → Webhooks:** update the endpoint to
  `https://members.originalbotanica.com/api/stripe/webhook`.
  *Subscriptions stop syncing without this.*
- **Meta → Business Settings → Brand Safety → Domains:** add and verify
  `members.originalbotanica.com`. **[Lighthaus]** may need to add the
  verification TXT record to DNS. *Required for accurate iOS reporting.*
- **Google Analytics → Admin → Data streams:** stream URL should be the
  new domain.

## 3. Payments — the go-live switch

- Stripe: move from **Sandbox to Live mode**.
- **PRICE CHANGE (Aug 2):** the annual plan is now **$199.95/yr** (was
  $299.95). All app copy is updated, but the Stripe **price object** must
  match: create a new recurring price of $199.95/year (7-day trial) on the
  membership product — in the current test mode AND in live mode at launch —
  and point `STRIPE_PRICE_ANNUAL` in Vercel at the new price ID. Until the
  test-mode price is swapped, annual checkout will still charge the old
  $299.95 test price while the pages say $199.95. The 12-month gift also
  dropped to $199.95 (code change, nothing to do in Stripe — gift prices are
  created on the fly).
- Replace in Vercel: `STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL` (live-mode price IDs).
- Update the product description in Stripe — it still says **10% off**;
  the offer is now **20%**.
- Run one real card through checkout and confirm the subscription appears
  in Supabase.

## 4. The store side

- **[Lighthaus]** Craft Commerce: change the member discount rule from
  **10% to 20%** off. *The site now promises 20% everywhere — this must
  match before launch.*
- **[Lighthaus]** Confirm members are matched to the shop account by
  email so the discount applies automatically at checkout.
- **[Lighthaus]** Mailchimp e-commerce is still not connected to Craft
  Commerce (long-standing item).

## 5. Email

- **[Lighthaus]** If transactional email sends from an
  `originalbotanica.com` address, confirm SPF/DKIM cover the sender so
  gift and account emails don't land in spam.
- Mailchimp: stage the launch emails (notes in `launch-notes.md`). Every
  email mentions **20% off**; the altar email teaches charging the flame.

## 6. Content sign-off

- In-house spiritualists to bless: the **offerings menu** and its lineage
  labels, and the two new prayers (**Peace**, **San Deshacedor**).
- Decide whether the member **feedback box** stays after launch — one
  flag in `components/feedback-box.tsx` (`FEEDBACK_ENABLED`).

## 7. Housekeeping

- Take the next Next.js patch release (two low-severity advisories in a
  build dependency).
- Decide what happens to the old `altar.originalbotanica.com` — redirect
  to The Practice, or leave running.

---

## Ad tracking status

| Platform | State |
|---|---|
| Meta pixel `1223585932980843` ("The Practice") | **Live** — browser events confirmed 7/28 |
| Meta Conversions API | Installed; fires on first real trial/purchase |
| Google Analytics 4 | Pending — needs `G-` measurement ID |
| TikTok | Pending — needs pixel ID + Events API token |
| Google Ads | Pending — needs `AW-` conversion ID |

Full instructions in `AD-TRACKING-SETUP.md`.
