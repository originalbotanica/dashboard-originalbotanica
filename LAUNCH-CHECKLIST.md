# Original Botanica Membership — Launch Checklist

A running list of pre-launch items. Tags:
- **[Lighthaus]** — needs our Craft developer (out of our direct control)
- **[Us]** — membership dashboard side (this repo)

---

## Member 10% store discount — Stripe ↔ Craft sync

**Status:** Approved 2026-06-15 — build the sync. Keep the "applied automatically at
checkout" copy exactly as-is; it becomes true once this ships (no copy change needed).
Blocked on the `members` user group (Step 1).

**Scope note:** this is NOT just the customer group. It's the group + discount rule (quick,
sub-steps) PLUS the Stripe ↔ Craft sync (the real work). The sync is what makes the discount
automatic; the group is just the container it fills.

**Goal:** Active subscribers automatically get 10% off at originalbotanica.com.
The discount turns ON when they subscribe and OFF when they cancel — no coupon codes.

**Verified 2026-06-14 in Craft (Commerce Pro 5.9.14):** the discount builder supports
this natively — Conditions → Match Customer → "User Group is one of [Members]", and
Actions → "Per Item Percentage Off" = 10. Existing user groups are only Customers /
Website Admins / Wholesale; there is no Members group, and creating one is blocked on
production (Settings → Users → Groups returns "User is not permitted" — project config
is locked in prod, which is the correct/safe setup). Nothing was saved during this check.

### Steps (in order)

1. **[Lighthaus]** Create a user group with handle `members` (Settings → Users → Groups
   in a dev environment, then deploy via project config).
2. **[Us]** Finish the discount in the live control panel once the group exists (~2 min):
   name "Members 10%", Actions → Per Item Percentage Off = 10, Conditions → Match Customer
   → "User Group is one of → Members", leave Matching Items empty (covers all products),
   enable. **Retail only:** also require the customer is NOT in the **Wholesale** group, so a
   wholesale account that subscribes never gets 10% on top of wholesale pricing (see the
   retail-only scope note below).
3. **[Lighthaus]** Build an authenticated endpoint, e.g. `POST /actions/ob-membership/sync`,
   accepting `{ email, action: "add" | "remove" }` plus a shared-secret header. It finds or
   creates the Craft user by email and adds/removes the `members` group. Idempotent; returns
   200. Decide the "subscriber has no store account yet" case: create the user by email, or
   stash it and attach the group on first login.
4. **[Us]** Add `lib/commerce-sync.ts` and call it right after `upsertSubscription` in the
   Stripe webhook — add to `members` on active/trialing, remove on cancel/unpaid/pause.
   New env vars: `CRAFT_SYNC_URL`, `CRAFT_SYNC_SECRET`. Deploys inert until the endpoint is live.
5. **[Us]** One-time backfill of current active members; nightly reconcile job so a missed
   webhook self-heals.

**Retail-only scope [Lighthaus / Us]:** the member 10% is for **retail customers only** and must
not erode margin on already-discounted goods. When building the discount rule:
- **Exclude wholesale:** require the customer is in `members` AND **not** in the `Wholesale`
  group (wholesale already buys at wholesale pricing — no stacking).
- **No stacking on sales:** exclude sale / on-promotion / clearance items so the 10% never
  applies on top of a markdown (members "get the better of the two" — the sale price or 10%).
- **Exclude services & gift cards** from the discount (Matching Items / category condition).

Customer-facing fine print reflecting this is already live in the dashboard member-benefit
section (`dash.benefitBody`, EN + ES): "Member savings apply to regularly-priced retail orders —
they don't combine with sale or wholesale pricing, and exclude services and gift cards." The
**system must enforce this**, not just the copy.

**Dependency:** the member's store login email must equal their membership email (already
implied by the dashboard's member-benefit copy).

**Open decision:** do members get the 10% during the 7-day free trial? (Recommendation: yes —
stronger acquisition; removed automatically if they don't convert.)

---

## Other Lighthaus / out-of-our-control items

- **[Lighthaus]** Point `members.originalbotanica.com` at the Vercel deployment. The app is
  live at `dashboard-originalbotanica.vercel.app`; the custom domain currently errors.
- **[Lighthaus]** Connect Mailchimp e-commerce to Craft Commerce (noted as a developer task).
- **[Lighthaus]** Set up custom SMTP for Supabase auth emails (Authentication → Emails → SMTP)
  with a real provider (Resend / SendGrid / Postmark) + a verified sending domain. The built-in
  Supabase sender is test-only and rate-limited ("email rate limit exceeded" on repeat signups);
  required so new members reliably get confirmation + password-reset emails. Also fix the product
  title typo "Basil Balm of Gilead Buds" in Craft (corrected in dashboard data only).
- **[Lighthaus / Stripe]** Point the Stripe webhook at the LIVE deployment URL for both
  test and live modes (e.g. `https://dashboard-originalbotanica.vercel.app/api/stripe/webhook`
  until the custom domain is live). The webhook is what records a subscription after checkout —
  if it points at the not-yet-live `members.originalbotanica.com`, a 4242 test checkout will
  succeed but the dashboard will still show "inactive" because the trial never registered.
- _(add new items here as they surface)_

---

## Membership-side (us) launch items

- Ritual library: link every product in every ritual to originalbotanica.com (opens in new
  tab) — ✓ done (shipped).
- Account page with subscription management (Stripe billing portal + subscribe flow) — ✓ done (shipped).
- Natal chart wheel: capture SVG to our storage + render on parchment — ✓ done (shipped).
- Mobile pass across the dashboard and chat tools — ✓ done (shipped).
- Photographic saint candles on the virtual altar (optional polish).
- Show chat usage caps to members before they hit the limit.

## Database migrations to run (Supabase SQL editor)

Apply any not-yet-run migration from `migrations/` (all are safe / `if not exists`). Most recent:
- `2026-06-25-trial-reminder.sql` — trial-ending reminder cache column.
- `2026-06-26-astrologer-recs.sql` — stores each astrologer reading's matched
  rituals + products so the "For this reading" cards can render under the reading.
