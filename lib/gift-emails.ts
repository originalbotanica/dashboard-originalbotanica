/**
 * Gift email templates — recipient announcement + buyer confirmation.
 *
 * Warm, in the Original Botanica voice. Cream background, deep terracotta
 * accents (the app's candle-lit palette doesn't read well on email white).
 * All user-supplied text is HTML-escaped.
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
          With care, Original Botanica · The Bronx, since 1959
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

function codeBlock(code: string): string {
  return `<div style="margin:18px 0;padding:14px 16px;background:${CREAM};border:1px dashed #d8c6a4;border-radius:10px;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};margin-bottom:6px;">Gift code</div>
    <div style="font-family:'Courier New',monospace;font-size:20px;letter-spacing:0.08em;color:${INK};">${esc(code)}</div>
  </div>`;
}

const TOOLS_LINE =
  "your daily tarot pull, your birth chart and an astrologer to talk with, dream interpretation, a virtual altar to light candles, a place to honor your ancestors, and a library of rituals with everything you need to do the work";

export function giftRecipientEmail(args: {
  recipientName?: string | null;
  buyerName?: string | null;
  termLabel: string;
  code: string;
  message?: string | null;
}): { subject: string; html: string } {
  const url = `${siteUrl()}/redeem?code=${encodeURIComponent(args.code)}`;
  const from = args.buyerName ? esc(args.buyerName) : "Someone who cares about you";
  const greeting = args.recipientName ? `Dear ${esc(args.recipientName)},` : "Dear friend,";

  const messageBlock = args.message
    ? `<div style="margin:18px 0;padding:14px 18px;border-left:3px solid ${ACCENT};background:${CREAM};font-style:italic;color:${INK};">“${esc(args.message)}”<div style="font-style:normal;font-size:13px;color:${MUTED};margin-top:8px;">From ${from}</div></div>`
    : "";

  const inner = `
    <h1 style="margin:0 0 16px;font-size:25px;font-weight:normal;color:${ACCENT};">A gift has been made for you.</h1>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
      ${from} has gifted you <strong>${esc(args.termLabel)}</strong> of membership at Original Botanica,
      The Bronx botánica serving practitioners since 1959.
    </p>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
      Inside you'll find ${TOOLS_LINE}.
    </p>
    ${messageBlock}
    ${button(url, "Redeem your gift")}
    ${codeBlock(args.code)}
    <p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:${MUTED};">
      To claim it, open the button above (or visit ${siteUrl()}/redeem and enter your code).
      You'll create a free account, and your membership begins the moment you redeem.
      No card required.
    </p>`;
  const subject = args.buyerName
    ? `${args.buyerName} sent you a gift from Original Botanica`
    : "A gift for you from Original Botanica";
  return { subject, html: shell(inner) };
}

export function giftBuyerEmail(args: {
  buyerName?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  termLabel: string;
  code: string;
  deliverOnLabel?: string | null;
}): { subject: string; html: string } {
  const url = `${siteUrl()}/redeem?code=${encodeURIComponent(args.code)}`;
  const who = args.recipientName ? esc(args.recipientName) : "your recipient";
  const deliveryLine = args.deliverOnLabel
    ? `We'll deliver it to ${esc(args.recipientEmail || who)} on <strong>${esc(args.deliverOnLabel)}</strong>.`
    : args.recipientEmail
      ? `We've emailed it to <strong>${esc(args.recipientEmail)}</strong>.`
      : `Share the code below with ${who} whenever you're ready.`;

  const inner = `
    <h1 style="margin:0 0 16px;font-size:25px;font-weight:normal;color:${ACCENT};">Your gift is on its way.</h1>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">
      Thank you${args.buyerName ? `, ${esc(args.buyerName)}` : ""}. You've gifted ${who}
      <strong>${esc(args.termLabel)}</strong> of Original Botanica membership.
    </p>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">${deliveryLine}</p>
    <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:${MUTED};">
      Here's the gift code as well, in case you'd like to share or print it yourself:
    </p>
    ${codeBlock(args.code)}
    ${button(url, "View the redeem page")}
    <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">
      The gift is prepaid for the full term. Nothing will auto-renew, and no one will be charged again.
    </p>`;
  return { subject: "Your Original Botanica gift is confirmed", html: shell(inner) };
}
