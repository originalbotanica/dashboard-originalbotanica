/**
 * Gift-a-Membership: terms, pricing, and helpers.
 *
 * A gift is a ONE-TIME purchase of a fixed-term membership (no auto-renew).
 * Pricing is defined here, not in Stripe, so the checkout can build a
 * one-off price on the fly and Jason can change tiers without touching Stripe.
 */

import { randomInt } from "crypto";

export type GiftTermMonths = 3 | 6 | 12;

export type GiftTerm = {
  months: GiftTermMonths;
  amountCents: number;
  label: string; // "3 months"
  tagline: string; // a short, warm descriptor
};

export const GIFT_TERMS: GiftTerm[] = [
  { months: 3, amountCents: 7995, label: "3 months", tagline: "A season of guidance" },
  { months: 6, amountCents: 14995, label: "6 months", tagline: "Half a year of practice" },
  { months: 12, amountCents: 29995, label: "12 months", tagline: "A full year, our best value" },
];

export function giftTerm(months: number): GiftTerm | null {
  return GIFT_TERMS.find((t) => t.months === months) ?? null;
}

/** "$69" for whole dollars, "$74.85" otherwise. */
export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function termLabel(months: number): string {
  return giftTerm(months)?.label ?? `${months} months`;
}

/**
 * A human-friendly, unambiguous gift code: OB-GIFT-XXXX-XXXX.
 * The alphabet omits easily-confused characters (0/O, 1/I/L).
 * Uniqueness is enforced by the DB unique constraint; the caller retries
 * on the rare collision.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateGiftCode(): string {
  // These codes gate paid memberships, so use a CSPRNG (not Math.random)
  // to pick alphabet indices — the codes must be unpredictable, not just
  // unique. randomInt is unbiased over the range.
  const block = () =>
    Array.from(
      { length: 4 },
      () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)],
    ).join("");
  return `OB-GIFT-${block()}-${block()}`;
}

/** Normalize user-entered codes: trim, uppercase, collapse spaces. */
export function normalizeGiftCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

/** Add whole months to a date, returning a new Date. */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
