"use client";

import { useState } from "react";
import { useT } from "./locale-provider";

/**
 * Client-side billing actions for the account page.
 *
 * These hit the existing Stripe routes and redirect the browser to the
 * Stripe-hosted page, so we never build or store card UI ourselves.
 */

/** Opens the Stripe Billing Portal (update card, change plan, cancel, invoices). */
export function ManageBillingButton() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || t("account.errPortal"));
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(t("account.errGeneric"));
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={open}
        disabled={loading}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("account.opening") : t("account.manageBilling")}
      </button>
      {error && <p className="form-error mt-3">{error}</p>}
    </div>
  );
}

/** Starts Stripe Checkout for a chosen plan (7-day trial). */
export function StartMembershipButtons() {
  const t = useT();
  const [loading, setLoading] = useState<null | "monthly" | "annual">(null);
  const [error, setError] = useState<string | null>(null);

  async function start(plan: "monthly" | "annual") {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || t("account.errCheckout"));
        setLoading(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(t("account.errGeneric"));
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => start("monthly")}
          disabled={loading !== null}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "monthly" ? t("account.starting") : t("account.monthly")}
        </button>
        <button
          onClick={() => start("annual")}
          disabled={loading !== null}
          className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "annual" ? t("account.starting") : t("account.annual")}
        </button>
      </div>
      {error && <p className="form-error mt-3">{error}</p>}
    </div>
  );
}
