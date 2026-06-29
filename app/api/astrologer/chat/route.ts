import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAnthropic, ASTROLOGER_MODEL } from "@/lib/astrologer/anthropic";
import { loadAstrologerContext } from "@/lib/astrologer/context";
import { buildSystemPrompt } from "@/lib/astrologer/prompt";
import { getLocale } from "@/lib/i18n/server";
import {
  checkUsageWithinCap,
  incrementUsage,
} from "@/lib/astrologer/usage";
import { getSubscriptionStatus } from "@/lib/subscription";
import { stripDashes } from "@/lib/llm/sanitize";
import {
  retrieveRituals,
  metadataFromRituals,
} from "@/lib/rag/retrieve";
import { formatCommonSuppliesForPrompt } from "@/lib/rag/common-supplies";

/**
 * POST /api/astrologer/chat
 *
 * Body: { message: string }
 *
 * Streams a Claude response as plain text chunks. Persists both the
 * user message and the assistant message to astrologer_messages. Uses
 * a single rolling thread per user.
 *
 * Gated on:
 *   - Authentication
 *   - Active subscription (or trial)
 *   - Daily soft cap on message count
 *
 * PART 1 SCOPE
 * No RAG retrieval. The astrologer answers from the user's chart alone.
 * Part 2 brings back the inline Original Botanica product recommendations.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY_MESSAGES = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Subscription gate
  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) {
    return NextResponse.json(
      {
        error:
          "An active subscription is required to talk to the astrologer.",
      },
      { status: 402 },
    );
  }

  // Body
  let userMessage = "";
  let providedThreadId: string | null = null;
  try {
    const body = await request.json();
    userMessage = String(body.message || "").trim();
    providedThreadId = body.threadId ? String(body.threadId) : null;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!userMessage) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // Daily soft-cap rate limit
  const usage = await checkUsageWithinCap(user.id);
  if (!usage.withinCap) {
    return NextResponse.json(
      {
        error:
          "You have had a full day with us. Come back tomorrow. Your readings will be here.",
      },
      { status: 429 },
    );
  }

  // Load the user's chart context (lazy-computes on first visit)
  const context = await loadAstrologerContext(user.id);
  if (!context) {
    return NextResponse.json(
      {
        error:
          "Please finish your profile (birth date and city) before starting a reading.",
      },
      { status: 400 },
    );
  }

  // Use the requested conversation, or start a new one.
  let threadId: string;
  if (providedThreadId) {
    const { data: owned } = await supabase
      .from("astrologer_threads")
      .select("id")
      .eq("id", providedThreadId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!owned) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }
    threadId = providedThreadId;
  } else {
    const { data: created, error: createErr } = await supabase
      .from("astrologer_threads")
      .insert({ user_id: user.id, title: titleFromMessage(userMessage) })
      .select("id")
      .single();
    if (createErr || !created?.id) {
      return NextResponse.json(
        { error: "Could not start a new conversation" },
        { status: 500 },
      );
    }
    threadId = created.id;
  }

  // Save the user's message
  await supabase.from("astrologer_messages").insert({
    thread_id: threadId,
    user_id: user.id,
    role: "user",
    content: userMessage,
  });

  // Load recent history (chronological, with consecutive-role collapse)
  const { data: historyRows } = await supabase
    .from("astrologer_messages")
    .select("role, content")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(MAX_HISTORY_MESSAGES);

  const chronological = (historyRows || []).reverse();
  const history: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const row of chronological) {
    const role = row.role as "user" | "assistant";
    const last = history[history.length - 1];
    if (last && last.role === role) {
      history[history.length - 1] = { role, content: row.content };
    } else {
      history.push({ role, content: row.content });
    }
  }

  // RAG retrieval grounds the "For this reading" cards. We kick it off here
  // but do NOT block the first token on it — the vector search adds seconds
  // of dead air before the reading begins. Instead the reading streams right
  // away, and we await this promise after the stream to persist the matched
  // ritual/product slugs (the cards then arrive on the post-stream refresh).
  const retrievalPromise = retrieveRituals(userMessage, 3).catch((e) => {
    console.error("Astrologer retrieval error:", e);
    return [];
  });

  // Inline product links in the reading body are grounded on the always-
  // available common supplies (a static list, no network call), so they keep
  // working without waiting on the vector search.
  const ritualsContext = formatCommonSuppliesForPrompt();

  // Build the system prompt with the user's chart and the retrieved
  // archive context inline.
  const currentDate = new Date().toISOString().slice(0, 10);
  const system = buildSystemPrompt({
    firstName: context.firstName,
    birthDate: context.birthDate,
    birthCity: context.birthCity,
    birthTime: context.birthTime,
    sunSign: context.chart.sunSign,
    moonSign: context.chart.moonSign,
    risingSign: context.chart.risingSign,
    placements: context.chart.placements,
    currentDate,
    retrievedRituals: ritualsContext,
    locale: await getLocale(),
  });

  // Underage hard-stop (the prompt also has a guardrail, this is belt-and-suspenders)
  if (context.isUnderEighteen) {
    return NextResponse.json(
      {
        error:
          "We do not give chart readings for anyone under 18. If this birth date is wrong, you can update it in your profile.",
      },
      { status: 403 },
    );
  }

  // Stream Claude's response
  const anthropic = getAnthropic();
  const encoder = new TextEncoder();
  const adminSupabase = createAdminClient();
  const userId = user.id;

  const stream = new ReadableStream({
    async start(controller) {
      let assistantText = "";
      try {
        const claudeStream = await anthropic.messages.stream({
          model: ASTROLOGER_MODEL,
          max_tokens: 1500,
          system,
          messages: history,
        });

        for await (const event of claudeStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text;
            assistantText += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        }
      } catch (err) {
        console.error("Astrologer stream error:", err);
        controller.enqueue(
          encoder.encode("\n\nSomething went wrong reading the chart. Please try again."),
        );
      } finally {
        // The reading is written. Now fold in the RAG matches (which ran in
        // parallel) so the "For this reading" cards can render on refresh.
        const retrieved = await retrievalPromise;
        const ragMeta = metadataFromRituals(retrieved);
        const ritualSlugs = (ragMeta.sources || [])
          .map((s) => s.slug)
          .filter(Boolean);
        const productSlugs = ragMeta.product_slugs || [];

        // Persist the assistant message (sanitize em-dashes)
        const cleanText = stripDashes(assistantText).trim();
        if (cleanText) {
          await adminSupabase.from("astrologer_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "assistant",
            content: cleanText,
            ritual_slugs: ritualSlugs,
            product_slugs: productSlugs,
          });
        }
        // Increment usage (best-effort)
        await incrementUsage(userId).catch(() => {});
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "X-Thread-Id": threadId,
    },
  });
}

/** A short conversation title from the member's first message. */
function titleFromMessage(msg: string): string {
  const clean = msg.replace(/\s+/g, " ").trim();
  const words = clean.split(" ").slice(0, 6).join(" ");
  const title = words.length > 48 ? words.slice(0, 48).trim() + "…" : words;
  return title || "Your reading";
}
