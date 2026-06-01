import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAnthropic, ASTROLOGER_MODEL } from "@/lib/astrologer/anthropic";
import { loadAstrologerContext } from "@/lib/astrologer/context";
import { buildSystemPrompt } from "@/lib/astrologer/prompt";
import {
  checkUsageWithinCap,
  incrementUsage,
} from "@/lib/astrologer/usage";
import { getSubscriptionStatus } from "@/lib/subscription";
import { stripDashes } from "@/lib/llm/sanitize";

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
  try {
    const body = await request.json();
    userMessage = String(body.message || "").trim();
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

  // Get or create the user's rolling thread
  let { data: thread } = await supabase
    .from("astrologer_threads")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!thread) {
    const { data: created } = await supabase
      .from("astrologer_threads")
      .insert({ user_id: user.id, title: "Your reading" })
      .select("id")
      .single();
    thread = created;
  }

  if (!thread?.id) {
    return NextResponse.json(
      { error: "Could not create or load a conversation thread" },
      { status: 500 },
    );
  }

  // Save the user's message
  await supabase.from("astrologer_messages").insert({
    thread_id: thread.id,
    user_id: user.id,
    role: "user",
    content: userMessage,
  });

  // Load recent history (chronological, with consecutive-role collapse)
  const { data: historyRows } = await supabase
    .from("astrologer_messages")
    .select("role, content")
    .eq("thread_id", thread.id)
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

  // Build the system prompt with the user's chart inline.
  // No retrievedRituals param in Part 1 (RAG comes in Part 2).
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
  const threadId = thread.id;
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
        // Persist the assistant message (sanitize em-dashes)
        const cleanText = stripDashes(assistantText).trim();
        if (cleanText) {
          await adminSupabase.from("astrologer_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "assistant",
            content: cleanText,
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
    },
  });
}
