/**
 * Minimal transactional email via Resend's REST API — no SDK dependency.
 *
 * If RESEND_API_KEY is not set, sending is skipped (logged, not thrown) so
 * purchases and redemptions never fail just because email isn't configured
 * yet. Set RESEND_API_KEY and EMAIL_FROM in the environment to turn it on.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export type EmailResult = { ok: boolean; skipped?: boolean; error?: string };

export function defaultFrom(): string {
  return process.env.EMAIL_FROM || "Original Botanica <gifts@originalbotanica.com>";
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email skipped — no RESEND_API_KEY] "${msg.subject}" -> ${msg.to}`);
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: defaultFrom(),
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Resend send error", res.status, text);
      return { ok: false, error: `resend_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendEmail failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
