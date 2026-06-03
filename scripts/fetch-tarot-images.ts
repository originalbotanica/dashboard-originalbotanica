/**
 * Download the 78 Rider-Waite-Smith tarot card images into /public/tarot.
 *
 * The Rider-Waite-Smith deck (illustrated by Pamela Colman Smith, published
 * 1909) is in the public domain in the United States. The images are pulled
 * from Wikimedia Commons via its stable Special:FilePath endpoint and saved
 * by card id so the app can reference them as /tarot/<id>.jpg.
 *
 * Run from the repo root:
 *   npx tsx scripts/fetch-tarot-images.ts
 *
 * Safe to re-run. Existing, healthy files are skipped. Failures are listed at
 * the end so you can re-run to fill any gaps.
 */

import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { DECK, type TarotCard } from "../lib/tarot/deck";

const OUT_DIR = join(process.cwd(), "public", "tarot");
const WIDTH = 600; // scaled down so the bundle stays light (~5-8 MB total)
const MIN_BYTES = 3000; // anything smaller is almost certainly an error page

// Major arcana: card id -> Wikimedia Commons file name (without extension).
const MAJOR_FILES: Record<string, string> = {
  "the-fool": "RWS_Tarot_00_Fool",
  "the-magician": "RWS_Tarot_01_Magician",
  "the-high-priestess": "RWS_Tarot_02_High_Priestess",
  "the-empress": "RWS_Tarot_03_Empress",
  "the-emperor": "RWS_Tarot_04_Emperor",
  "the-hierophant": "RWS_Tarot_05_Hierophant",
  "the-lovers": "RWS_Tarot_06_Lovers",
  "the-chariot": "RWS_Tarot_07_Chariot",
  strength: "RWS_Tarot_08_Strength",
  "the-hermit": "RWS_Tarot_09_Hermit",
  "wheel-of-fortune": "RWS_Tarot_10_Wheel_of_Fortune",
  justice: "RWS_Tarot_11_Justice",
  "the-hanged-man": "RWS_Tarot_12_Hanged_Man",
  death: "RWS_Tarot_13_Death",
  temperance: "RWS_Tarot_14_Temperance",
  "the-devil": "RWS_Tarot_15_Devil",
  "the-tower": "RWS_Tarot_16_Tower",
  "the-star": "RWS_Tarot_17_Star",
  "the-moon": "RWS_Tarot_18_Moon",
  "the-sun": "RWS_Tarot_19_Sun",
  judgement: "RWS_Tarot_20_Judgement",
  "the-world": "RWS_Tarot_21_World",
};

const SUIT_PREFIX: Record<string, string> = {
  wands: "Wands",
  cups: "Cups",
  swords: "Swords",
  pentacles: "Pents",
};

const RANK_NUMBER: Record<string, number> = {
  Ace: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7,
  Eight: 8, Nine: 9, Ten: 10, Page: 11, Knight: 12, Queen: 13, King: 14,
};

function commonsFileName(card: TarotCard): string {
  if (card.arcana === "major") {
    const f = MAJOR_FILES[card.id];
    if (!f) throw new Error(`No Commons file mapped for major: ${card.id}`);
    return `${f}.jpg`;
  }
  const prefix = SUIT_PREFIX[card.suit as string];
  const num = RANK_NUMBER[card.numeral];
  if (!prefix || !num) {
    throw new Error(`Cannot map minor card: ${card.id} (${card.numeral})`);
  }
  return `${prefix}${String(num).padStart(2, "0")}.jpg`;
}

function sourceUrl(card: TarotCard): string {
  const file = encodeURIComponent(commonsFileName(card));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${WIDTH}`;
}

async function alreadyHealthy(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isFile() && s.size >= MIN_BYTES;
  } catch {
    return false;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function download(card: TarotCard): Promise<void> {
  const dest = join(OUT_DIR, `${card.id}.jpg`);
  if (await alreadyHealthy(dest)) {
    console.log(`skip   ${card.id} (already present)`);
    return;
  }
  const url = sourceUrl(card);

  // Wikimedia rate-limits bursts (HTTP 429). Back off and retry.
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "OriginalBotanica-Dashboard/1.0 (daily tarot card; contact jason@originalbotanica.com)",
      },
      redirect: "follow",
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after")) || 0;
      const wait = Math.max(retryAfter * 1000, 2000 * attempt);
      console.log(`429 ${card.id}, waiting ${(wait / 1000).toFixed(0)}s (try ${attempt}/${maxAttempts})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < MIN_BYTES) {
      throw new Error(`Suspiciously small (${buf.byteLength} bytes): ${url}`);
    }
    await writeFile(dest, buf);
    console.log(`saved  ${card.id}  (${(buf.byteLength / 1024).toFixed(0)} KB)`);
    return;
  }
  throw new Error(`Gave up after ${maxAttempts} attempts (429): ${url}`);
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Fetching ${DECK.length} cards into ${OUT_DIR}\n`);

  const failures: string[] = [];
  for (const card of DECK) {
    try {
      await download(card);
    } catch (err) {
      console.error(`FAIL   ${card.id}: ${(err as Error).message}`);
      failures.push(card.id);
    }
    // Be polite to Wikimedia. Slower cadence avoids the 429 wall.
    await sleep(800);
  }

  console.log("\nDone.");
  if (failures.length) {
    console.error(`\n${failures.length} failed: ${failures.join(", ")}`);
    console.error("Re-run the script to retry just the missing ones.");
    process.exitCode = 1;
  } else {
    console.log("All 78 cards present.");
  }
}

main();
