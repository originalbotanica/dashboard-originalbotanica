"use client";

import { useState } from "react";
import { GIFT_TERMS, formatUsd, type GiftTermMonths } from "@/lib/gift";

/**
 * Gift purchase form. Collects the term, recipient + buyer details and an
 * optional message and delivery date, then hands off to Stripe Checkout
 * (one-time payment) via /api/gift/checkout.
 */
export function GiftForm() {
  const [months, setMonths] = useState<GiftTermMonths>(6);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [deliverOn, setDeliverOn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(recipientEmail)) return setError("Please enter the recipient's email.");
    if (!emailRe.test(buyerEmail)) return setError("Please enter your email.");

    setLoading(true);
    try {
      const res = await fetch("/api/gift/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          months,
          recipientName: recipientName.trim() || undefined,
          recipientEmail: recipientEmail.trim(),
          buyerEmail: buyerEmail.trim(),
          message: message.trim() || undefined,
          deliverOn: deliverOn || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const selected = GIFT_TERMS.find((t) => t.months === months)!;

  return (
    <form onSubmit={submit} className="w-full">
      {/* Term selector */}
      <fieldset className="mb-8">
        <legend className="form-label mb-3">Choose a length</legend>
        <div className="grid sm:grid-cols-3 gap-3">
          {GIFT_TERMS.map((t) => {
            const active = t.months === months;
            return (
              <button
                type="button"
                key={t.months}
                onClick={() => setMonths(t.months)}
                aria-pressed={active}
                className={`text-left rounded-xl border p-4 transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--surface-strong)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
                }`}
              >
                <div className="display text-xl text-[var(--foreground)]">{t.label}</div>
                <div className="text-[var(--accent)] text-lg mt-1">{formatUsd(t.amountCents)}</div>
                <div className="text-[var(--foreground-subtle)] text-xs mt-2 leading-snug">
                  {t.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-5">
        <div>
          <label className="form-label" htmlFor="recipientName">
            Recipient&apos;s name <span className="normal-case text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <input
            id="recipientName"
            className="form-input"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Maria"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="recipientEmail">Recipient&apos;s email</label>
          <input
            id="recipientEmail"
            type="email"
            required
            className="form-input"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="maria@example.com"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="buyerEmail">Your email</label>
          <input
            id="buyerEmail"
            type="email"
            required
            className="form-input"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <p className="text-[var(--foreground-subtle)] text-xs mt-2">
            We&apos;ll send your receipt and a copy of the gift code here.
          </p>
        </div>

        <div>
          <label className="form-label" htmlFor="message">
            A short message <span className="normal-case text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <textarea
            id="message"
            className="form-input"
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Thinking of you. May this bring you light."
          />
        </div>

        <div>
          <label className="form-label" htmlFor="deliverOn">
            Send on <span className="normal-case text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <input
            id="deliverOn"
            type="date"
            className="form-input"
            min={today}
            value={deliverOn}
            onChange={(e) => setDeliverOn(e.target.value)}
          />
          <p className="text-[var(--foreground-subtle)] text-xs mt-2">
            Leave blank to send the moment your payment goes through.
          </p>
        </div>
      </div>

      {error && <p className="form-error mt-5">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Taking you to checkout…"
          : `Continue · ${selected.label} for ${formatUsd(selected.amountCents)}`}
      </button>
      <p className="text-[var(--foreground-subtle)] text-xs mt-4 text-center">
        A one-time payment. Nothing renews, and no one is ever charged again.
      </p>
    </form>
  );
}
