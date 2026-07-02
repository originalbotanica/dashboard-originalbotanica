/**
 * Trial-ending reminder email — warm, in the Original Botanica voice.
 *
 * Sent before a member's free trial ends so the first charge is never a
 * surprise. Same cream / terracotta palette as the gift emails. All
 * user-supplied text is HTML-escaped.
 */

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://members.originalbotanica.com";
}

const ACCENT = "#a8552c";
const INK = "#2b2117";
const MUTED = "#6b5d4b";
const CREAM = "#f7f1e6";

function shell(inner: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffdf8;border:1px solid #e7dcc6;border-radius:14px;overflow:hidden;">
        <tr><td style="background:${INK};padding:22px 32px;text-align:center;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:0.04em;color:#f2e9d6;">ORIGINAL BOTANICA</span>
        </td></tr>
        <tr><td style="padding:36px 32px;font-family:Georgia,'Times New Roman',serif;color:${INK};">
          ${inner}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #eee2cd;text-align:center;font-family:Georgia,serif;font-size:12px;color:${MUTED};">
          With care, Original Botanica · the Bronx, since 1959
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr>
    <td style="background:${ACCENT};border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:13px 30px;font-family:Georgia,serif;font-size:15px;color:#fffdf8;text-decoration:none;">${label}</a>
    </td></tr></table>`;
}

const PLAN_LABEL: Record<string, string> = {
  monthly: "monthly membership",
  annual: "annual membership",
};

/**
 * The reminder a member receives shortly before their free trial ends.
 *
 * @param firstName    member's first name (optional)
 * @param endDateLabel human date the trial ends, e.g. "July 2, 2026"
 * @param plan         "monthly" | "annual" | null — shapes the wording
 */
export function trialReminderEmail(args: {
  firstName?: string | null;
  endDateLabel: string;
  plan?: string | null;
}): { subject: string; html: string } {
  const accountUrl = `${siteUrl()}/account`;
  const hello = args.firstName ? `Dear ${esc(args.firstName)},` : "Dear friend,";
  const planLabel =
    (args.plan && PLAN_LABEL[args.plan]) || "membership";

  const inner = `
    <h1 style="margin:0 0 16px;font-size:23px;font-weight:normal;color:${INK};">A gentle note about your trial</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${INK};">${hello}</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${INK};">
      Your free trial of The Practice ends on <strong>${esc(args.endDateLabel)}</strong>.
      The day it ends, your ${planLabel} begins and your card is charged for the
      first time. We wanted you to know ahead of time, with no surprises.
    </p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${INK};">
      If The Practice has become part of your days, from your daily tarot and your
      astrologer to the altar, your ancestors, and the rituals library, there's
      nothing you need to do. It all simply continues. If the timing isn't
      right, you can cancel anytime from your account, and you won't be charged.
    </p>
    ${button(accountUrl, "Manage your membership")}
    <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">
      However you choose, we're glad you spent this week with us.
    </p>`;

  return {
    subject: "Your free trial ends soon",
    html: shell(inner),
  };
}
