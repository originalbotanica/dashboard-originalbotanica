/**
 * Shared ritual-extraction prompt and parsing.
 *
 * Used by the ingestion scripts (blog and YouTube) to turn a piece of
 * source content into a structured ritual, grounded strictly in the source.
 * The Anthropic call itself lives in each script (so they own retry and
 * rate-limit handling); this module owns the prompt, the parse, and the
 * validation so both sources stay consistent.
 */

import { PURPOSES, PURPOSE_SLUGS } from "./purposes";

export const TRADITIONS = ["lucumi", "espiritismo", "hoodoo", "folk_catholic", "general"] as const;
export const DIFFICULTIES = ["simple", "moderate", "advanced"] as const;

export type Extracted = {
  is_ritual: boolean;
  title: string;
  purpose: string;
  tradition: string;
  difficulty: string;
  summary: string;
  steps: string[];
  best_day_of_week: number | null;
  best_moon_phase: string | null;
  warnings: string | null;
};

export function buildExtractionPrompt(args: {
  sourceLabel: string; // "blog post" | "YouTube video"
  title: string;
  description?: string | null;
  body: string; // post body or video transcript
  url: string;
}): { system: string; user: string } {
  const purposeList = PURPOSES.map((p) => `- ${p.slug}: ${p.label} (${p.blurb})`).join("\n");

  const system = `You are the archivist for Original Botanica, a family-owned spiritual house in the Bronx since 1959. You are turning the house's content into a curated ritual library.

YOUR JOB
Read one ${args.sourceLabel}. Decide if it genuinely teaches a performable ritual, spell, or working (with real, followable steps). If it does, extract it into structured form. If it is only an article, history, product talk, horoscope, listicle, or general explanation with no concrete performable steps, mark is_ritual false.

ABSOLUTE RULES
- Extract only what is in the source. Never invent steps, materials, days, or claims it does not make. If the steps are not actually spelled out, set is_ritual false.
- Faithful to the source. This is the house's real practice; do not embellish or modernize it.
- Voice: grounded, warm, plain. Short sentences. No em-dashes or en-dashes anywhere. No exclamation points. No emoji. Spanish words where the source uses them.
- This is reflective spiritual practice, never a guarantee. Do not promise outcomes.

PURPOSE (choose exactly one slug that best fits):
${purposeList}

TRADITION (choose one): lucumi, espiritismo, hoodoo, folk_catholic, general
DIFFICULTY (choose one): simple, moderate, advanced

OUTPUT
Return ONE JSON object, no prose, no code fences:
{
  "is_ritual": true|false,
  "title": "<short ritual title in the house's words>",
  "purpose": "<one slug from the list>",
  "tradition": "<one value>",
  "difficulty": "<one value>",
  "summary": "<1-2 sentences: what this ritual is for and when to use it>",
  "steps": ["<step 1>", "<step 2>", "..."],
  "best_day_of_week": <0-6 where 0=Sunday, or null>,
  "best_moon_phase": "<new|waxing|full|waning or null>",
  "warnings": "<any caution the source gives, or null>"
}

If is_ritual is false, still return the object with is_ritual false and the other fields empty or null.`;

  const user = `${args.sourceLabel.toUpperCase()}
Title: ${args.title}
${args.description ? `Description: ${args.description}\n` : ""}URL: ${args.url}

CONTENT:
${args.body.slice(0, 7000)}`;

  return { system, user };
}

export function parseExtract(raw: string): Extracted | null {
  let t = (raw || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a < 0 || b < 0) return null;
  try {
    return JSON.parse(t.slice(a, b + 1)) as Extracted;
  } catch {
    return null;
  }
}

export function validExtract(e: Extracted | null): e is Extracted {
  return (
    !!e &&
    e.is_ritual === true &&
    typeof e.title === "string" && e.title.trim().length > 0 &&
    PURPOSE_SLUGS.includes(e.purpose) &&
    (TRADITIONS as readonly string[]).includes(e.tradition) &&
    (DIFFICULTIES as readonly string[]).includes(e.difficulty) &&
    Array.isArray(e.steps) && e.steps.length >= 2
  );
}

export function stripDashes(s: string): string {
  return s ? s.replace(/[ \t]+[—–][ \t]+/g, ". ").replace(/[—–]/g, ", ") : s;
}
