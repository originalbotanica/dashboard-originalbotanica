import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getAnthropic, ASTROLOGER_MODEL } from "@/lib/astrologer/anthropic";
import { buildDreamSystemPrompt, dreamTitleFromMessage } from "@/lib/dreams/prompt";
import { getLocale } from "@/lib/i18n/server";
import {
  checkDreamUsageWithinCap,
  incrementDreamUsage,
} from "@/lib/dreams/usage";
import { getSubscriptionStatus } from "@/lib/subscription";
import { stripDashes } from "@/lib/llm/sanitize";
import { retrieveRituals, metadataFromRituals } from "@/lib/rag/retrieve";

/**
 * POST /api/dreams/chat
 *
 * Body: { message: string, threadId?: string }
 *
 * If threadId is omitted, a new dream thread is created and its id is
 * returned in the X-Thread-Id response header (so the client can route
 * the user to /dreams/<id> after the first message).
 *
 * Streams Claude's interpretation as plain text. Persists both user
 * and assistant messages to dream_messages.
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
          "An active subscription is required to use the Dream Interpreter.",
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

  // Rate limit
  const usage = await checkDreamUsageWithinCap(user.id);
  if (!usage.withinCap) {
    return NextResponse.json(
      {
        error:
          "You have done deep dream work today. Come back tomorrow. The journal will be waiting.",
      },
      { status: 429 },
    );
  }

  // Fetch the user's first name for the system prompt
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();
  const firstName = profile?.first_name || "friend";

  // Get or create the thread. Use a string-typed var so the streaming
  // closure and response header below don't have to deal with `string | null`.
  let threadId: string;
  if (providedThreadId) {
    // Confirm the user owns this thread (RLS enforces it but verify)
    const { data: thread } = await supabase
      .from("dream_threads")
      .select("id")
      .eq("id", providedThreadId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!thread) {
      return NextResponse.json(
        { error: "Dream thread not found" },
        { status: 404 },
      );
    }
    threadId = providedThreadId;
  } else {
    // New thread. Title from this first message.
    const title = dreamTitleFromMessage(userMessage);
    const { data: created, error: createErr } = await supabase
      .from("dream_threads")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    if (createErr || !created?.id) {
      return NextResponse.json(
        { error: "Could not start a new dream thread" },
        { status: 500 },
      );
    }
    threadId = created.id;
  }

  // Save the user's message
  await supabase.from("dream_messages").insert({
    thread_id: threadId,
    user_id: user.id,
    role: "user",
    content: userMessage,
  });

  // Touch the thread updated_at so the journal sorts by recent activity
  await supabase
    .from("dream_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  // Load recent history with the consecutive-role collapse pattern
  const { data: historyRows } = await supabase
    .from("dream_messages")
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

  const currentDate = new Date().toISOString().slice(0, 10);
  const system = buildDreamSystemPrompt({ firstName, currentDate, locale: await getLocale() });

  // Archive rituals + shop supplies that fit the dream, surfaced as a
  // tappable "For this dream" cards block under the reading. The dream prompt
  // does not use this, so we run it in parallel and never block the first
  // token on it — the interpretation streams right away and we await this
  // after the stream to persist the matched slugs (cards arrive on refresh).
  const retrievalPromise = retrieveRituals(userMessage, 3).catch((e) => {
    console.error("Dream interpreter retrieval error:", e);
    return [];
  });

  const anthropic = getAnthropic();
  const encoder = new TextEncoder();
  const adminSupabase = createAdminClient();
  const userId = user.id;
  const capturedThreadId = threadId;

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
        console.error("Dream interpreter stream error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\nSomething went wrong reading the dream. Please try again.",
          ),
        );
      } finally {
        // The interpretation is written. Fold in the RAG matches (which ran
        // in parallel) so the "For this dream" cards render on refresh.
        const retrieved = await retrievalPromise;
        const ragMeta = metadataFromRituals(retrieved);
        const ritualSlugs = (ragMeta.sources || [])
          .map((s) => s.slug)
          .filter(Boolean);
        const productSlugs = ragMeta.product_slugs || [];

        const cleanText = stripDashes(assistantText).trim();
        if (cleanText) {
          await adminSupabase.from("dream_messages").insert({
            thread_id: capturedThreadId,
            user_id: userId,
            role: "assistant",
            content: cleanText,
            ritual_slugs: ritualSlugs,
            product_slugs: productSlugs,
          });
        }
        await incrementDreamUsage(userId).catch(() => {});
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
