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
