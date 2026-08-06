/**
 * Voice A/B: generate astrologer readings with the OLD vs NEW system prompt
 * for the same questions, so the voice change can be judged before shipping.
 *
 * The old prompt is reconstructed inline (pre-Aug-5 TEACH AS YOU GO +
 * PERSONALIZATION sections); the new one comes from lib/astrologer/prompt.
 *
 * Usage: npx tsx scripts/qa-voice-test.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "../lib/astrologer/prompt";
import { CHAT_MODEL } from "../lib/astrologer/anthropic";

function loadEnv() {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    process.env[m[1]] ??= v;
  }
}
loadEnv();

const chartArgs = {
  firstName: "Maria",
  birthDate: "1988-07-14",
  birthCity: "Bronx, New York",
  birthTime: "09:30",
  sunSign: "Cancer",
  moonSign: "Scorpio",
  risingSign: "Virgo",
  placements: [
    { name: "Mercury", sign: "Leo", house: 11 },
    { name: "Venus", sign: "Gemini", house: 10 },
    { name: "Mars", sign: "Aries", house: 8 },
    { name: "Jupiter", sign: "Taurus", house: 9 },
    { name: "Saturn", sign: "Capricorn", house: 5 },
  ],
  currentDate: new Date().toISOString().slice(0, 10),
  locale: "en" as const,
};

// The pre-revision sections, restored verbatim so the comparison is honest.
function oldPrompt(): string {
  let p = buildSystemPrompt(chartArgs);
  p = p.replace(
    /- You are talking WITH a person[^\n]*\n/,
    "",
  );
  p = p.replace(
    /PLAIN WORDS FIRST[\s\S]*?only carrying it in words a neighbor would use\./,
    `TEACH AS YOU GO (PLAIN LANGUAGE)
- Assume the reader knows nothing about astrology. Every reading must land for a complete beginner who has never heard of houses, rulers, or transits.
- The first time you name any astrological term (a planet, sign, house, aspect, transit, or planetary ruler), define it in a few plain words inside the same sentence. Example: "Saturn, the planet of discipline and time," or "your 4th house, the part of your chart that governs home and roots,".
- Do this the way a patient elder explains while they teach: woven into the sentence, never a glossary, never a lecture, never textbook-stiff.
- When you prescribe a ritual on a specific day, name that day's planetary ruler in plain terms. Example: "On Saturday, the day of Saturn, the planet of structure,".
- The depth never drops. You are not simplifying the meaning, only making sure the plain words carry it.`,
  );
  p = p.replace(
    /PERSONALIZATION[\s\S]*?not as a tour of the wheel\./,
    `PERSONALIZATION
- You have access to Maria's full natal chart below.
- Always reference specific placements (e.g. "your Moon in Cancer in the 4th house") rather than speaking generically.`,
  );
  p = p.replace(/CONVERSATION, NOT PERFORMANCE[\s\S]*?apparatus of a reading\.\n/, "");
  return p;
}

const QUESTIONS = [
  "Money has been really tight lately and I'm stressed about it. What does my chart say?",
  "I met someone new last month and I really like him. What should I know?",
];

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const newP = buildSystemPrompt(chartArgs);
  const oldP = oldPrompt();

  for (const q of QUESTIONS) {
    console.log("\n" + "=".repeat(70));
    console.log("QUESTION:", q);
    for (const [label, sys] of [
      ["OLD VOICE", oldP],
      ["NEW VOICE", newP],
    ] as const) {
      const res = await client.messages.create({
        model: CHAT_MODEL,
        max_tokens: 1024,
        system: sys,
        messages: [{ role: "user", content: q }],
      });
      const text = res.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("");
      const words = text.split(/\s+/).length;
      console.log(`\n--- ${label} (${words} words) ---\n${text}`);
    }
  }
}

main();
