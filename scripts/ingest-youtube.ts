/**
 * Build ritual library entries from the Original Botanica YouTube channel.
 *
 * Uses yt-dlp (https://github.com/yt-dlp/yt-dlp) to list the channel's videos
 * and pull each one's captions (manual if present, else auto-generated), then
 * runs the same grounded extraction as the blog pipeline and upserts published
 * rituals tagged as YouTube sources (with a link back to the video).
 *
 * Prerequisite: yt-dlp on PATH.  brew install yt-dlp   (or: pipx install yt-dlp)
 *
 * Required env (.env.local auto-loaded):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 *
 * Usage:
 *   npx tsx scripts/ingest-youtube.ts --limit=5 --dry     # sample, no writes
 *   npx tsx scripts/ingest-youtube.ts                      # all videos, publish
 */

import { readFileSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { getPurpose } from "../lib/rituals/purposes";
import {
  buildExtractionPrompt,
  parseExtract,
  validExtract,
  stripDashes,
} from "../lib/rituals/extract";

const execFileAsync = promisify(execFile);
const CHANNEL = "https://www.youtube.com/@OriginalBotanica/videos";
const MODEL = "claude-sonnet-4-5";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- env ----------
function loadEnv() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!SUPABASE_URL || !SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing SUPABASE / ANTHROPIC env vars");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ---------- yt-dlp ----------
// Resolve how to invoke yt-dlp: the standalone binary if on PATH, else the
// pip module (python3 -m yt_dlp), which works after `pip3 install --user yt-dlp`.
let YTDLP: string[] = ["yt-dlp"];

// Authenticate so YouTube serves captions (it gates auto-captions behind a PO
// token for anonymous requests). Prefer a pre-exported cookies file
// (YT_COOKIES_FILE) so we read the keychain once, not per video; otherwise
// fall back to reading the browser directly (YT_COOKIES_BROWSER=chrome|safari).
const COOKIES_FILE = process.env.YT_COOKIES_FILE;
const COOKIES_BROWSER = process.env.YT_COOKIES_BROWSER;
const COOKIE_ARGS = COOKIES_FILE
  ? ["--cookies", COOKIES_FILE]
  : COOKIES_BROWSER
    ? ["--cookies-from-browser", COOKIES_BROWSER]
    : [];

async function ytdlp(args: string[], opts?: { maxBuffer?: number }) {
  return execFileAsync(YTDLP[0], [...YTDLP.slice(1), ...COOKIE_ARGS, ...args], opts);
}

async function ensureYtDlp(): Promise<void> {
  try {
    await execFileAsync("yt-dlp", ["--version"]);
    YTDLP = ["yt-dlp"];
    return;
  } catch {}
  try {
    await execFileAsync("python3", ["-m", "yt_dlp", "--version"]);
    YTDLP = ["python3", "-m", "yt_dlp"];
    return;
  } catch {}
  console.error("yt-dlp not found. Install it: pip3 install --user yt-dlp  (or brew install yt-dlp)");
  process.exit(1);
}

type Video = { id: string; title: string; url: string };

async function listVideos(limit?: number): Promise<Video[]> {
  // Flat playlist listing: one JSON object per line.
  const args = ["--flat-playlist", "--print", "%(id)s\t%(title)s"];
  if (limit) args.push("--playlist-end", String(limit));
  args.push("--", CHANNEL);
  const { stdout } = await ytdlp(args, { maxBuffer: 64 * 1024 * 1024 });
  const videos: Video[] = [];
  for (const line of stdout.split("\n")) {
    const [id, ...rest] = line.split("\t");
    if (id && id.trim()) {
      videos.push({ id: id.trim(), title: rest.join("\t").trim(), url: `https://www.youtube.com/watch?v=${id.trim()}` });
    }
  }
  return videos;
}

/** Pull captions for a video and return plain transcript text, or "" if none. */
async function getTranscript(video: Video): Promise<{ text: string; description: string }> {
  const dir = mkdtempSync(join(tmpdir(), "yt-"));
  try {
    await ytdlp(
      [
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs", "en.*,en",
        "--sub-format", "vtt",
        "--write-info-json",
        "-o", join(dir, "%(id)s.%(ext)s"),
        "--", video.url,
      ],
      { maxBuffer: 64 * 1024 * 1024 },
    );
    const files = readdirSync(dir);
    const vtt = files.find((f) => f.endsWith(".vtt"));
    const info = files.find((f) => f.endsWith(".info.json"));
    let description = "";
    if (info) {
      try {
        const j = JSON.parse(readFileSync(join(dir, info), "utf8"));
        description = (j.description || "").slice(0, 1500);
      } catch {}
    }
    const text = vtt ? vttToText(readFileSync(join(dir, vtt), "utf8")) : "";
    return { text, description };
  } catch (err) {
    console.warn(`  caption fetch failed for ${video.id}:`, (err as Error).message);
    return { text: "", description: "" };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Strip VTT timestamps/cue-settings and dedupe the rolling auto-caption repeats. */
function vttToText(vtt: string): string {
  const out: string[] = [];
  let last = "";
  for (let line of vtt.split("\n")) {
    line = line.trim();
    if (!line) continue;
    if (line === "WEBVTT" || line.startsWith("Kind:") || line.startsWith("Language:")) continue;
    if (line.includes("-->")) continue;
    if (/^\d+$/.test(line)) continue;
    line = line.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(); // inline timing tags
    if (!line || line === last) continue;
    out.push(line);
    last = line;
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

async function extract(video: Video, transcript: string, description: string) {
  const { system, user } = buildExtractionPrompt({
    sourceLabel: "YouTube video",
    title: video.title,
    description,
    body: transcript,
    url: video.url,
  });
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1200,
        system,
        messages: [{ role: "user", content: user }],
      });
      const txt = res.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
      return parseExtract(txt);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if ((status === 429 || status === 529 || status === 500) && attempt < 4) {
        await sleep(1500 * attempt);
        continue;
      }
      console.warn(`  extract error ${video.id}:`, (err as Error).message);
      return null;
    }
  }
  return null;
}

// ---------- main ----------
async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;
  const dry = process.argv.includes("--dry");

  await ensureYtDlp();
  console.log(`Listing videos from ${CHANNEL}${limit ? ` (limit ${limit})` : ""}...`);
  const videos = await listVideos(limit);
  console.log(`Found ${videos.length} videos.\n`);

  let rituals = 0, skipped = 0, noCaption = 0, failed = 0;

  for (const v of videos) {
    const { text, description } = await getTranscript(v);
    if (!text || text.length < 200) {
      noCaption++;
      console.log(`nocap  ${v.id} (${v.title.slice(0, 50)})`);
      await sleep(300);
      continue;
    }
    const e = await extract(v, text, description);
    if (!validExtract(e)) {
      skipped++;
      console.log(`skip   ${v.id} (not a ritual)`);
      await sleep(300);
      continue;
    }
    const purpose = getPurpose(e.purpose)!;
    const steps = e.steps.map(stripDashes);
    const row = {
      slug: `yt-${v.id}`,
      title_en: stripDashes(e.title),
      body_en: steps.join("\n\n"),
      summary: stripDashes(e.summary || ""),
      steps,
      purpose: e.purpose,
      intention: purpose.intention,
      tradition: e.tradition,
      difficulty: e.difficulty,
      best_day_of_week: typeof e.best_day_of_week === "number" ? e.best_day_of_week : null,
      best_moon_phase: e.best_moon_phase || null,
      materials: [] as unknown[],
      keywords: [] as string[],
      warnings: e.warnings ? stripDashes(e.warnings) : null,
      image_url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      source_url: v.url,
      source_type: "youtube",
      source_credit: "Original Botanica YouTube",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (dry) {
      console.log(`\n--- ${v.id} -> ${e.purpose} / ${e.tradition}\nTitle: ${row.title_en}\nSummary: ${row.summary}\nSteps: ${steps.length}`);
      rituals++;
    } else {
      const { error } = await supabase.from("rituals").upsert(row, { onConflict: "slug" });
      if (error) { failed++; console.log(`DBFAIL ${v.id}: ${error.message}`); }
      else { rituals++; console.log(`saved  ${v.id} -> ${e.purpose}`); }
    }
    await sleep(400);
  }

  console.log(`\nDone. rituals=${rituals} skipped=${skipped} no-captions=${noCaption} failed=${failed}${dry ? "  [DRY]" : ""}`);
}

main().catch((err) => { console.error("FATAL:", err); process.exit(1); });
