import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side Anthropic client.
 * env: ANTHROPIC_API_KEY
 */

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY env var not set");
  cached = new Anthropic({ apiKey });
  return cached;
}

/**
 * Model selection. Sonnet is the default — good quality, low cost,
 * fast. Bump deliberately when needed.
 */
export const ASTROLOGER_MODEL = "claude-sonnet-4-5";

/**
 * Interactive chat (astrologer + dreams). The member waits for the whole
 * reading before it appears, so the budget is 5 to 8 seconds end to end.
 * Haiku writes several times faster than Sonnet and holds the house voice
 * well at reading length. Background generations (forecast, compatibility,
 * daily tarot) stay on ASTROLOGER_MODEL where latency doesn't matter.
 */
export const CHAT_MODEL = "claude-haiku-4-5";
