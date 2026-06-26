"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProseBlock, buildProductLookup } from "@/lib/rag/render-prose";

type Msg = { role: "user" | "assistant"; content: string };

// Empty product lookup is fine for the chat: we render assistant
// messages in "optimistic" mode, so any [[Name|slug]] markup links
// to originalbotanica.com/<slug> even without a per-slug validation.
// Claude is prompted not to invent slugs, so broken links are rare.
const EMPTY_LOOKUP = buildProductLookup([]);
const OB_BASE_URL = "https://originalbotanica.com";

const STARTER_PROMPTS = [
  "What is my chart trying to teach me right now?",
  "What does my Saturn placement want from me?",
  "How is the current sky affecting my love life?",
  "Give me a ritual for this week.",
];

export function AstrologerChat({
  firstName,
  threadId,
  initialMessages,
}: {
  firstName: string;
  threadId: string | null;
  initialMessages: Msg[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setStreaming(true);

    // Buffer the whole reading, then reveal it at once (like the Compatibility
    // reading) instead of streaming word-by-word — calmer, easier to read.
    let buf = "";
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch("/api/astrologer/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, threadId: threadId || undefined }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Error ${res.status}`);
        setStreaming(false);
        return;
      }

      const newThreadId = res.headers.get("X-Thread-Id");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        setError("No response stream from server.");
        setStreaming(false);
        return;
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
      }

      setMessages((m) => [...m, { role: "assistant", content: buf }]);
      setStreaming(false);

      // On a brand-new conversation, route to its permanent URL so
      // refresh/back work.
      if (!threadId && newThreadId) {
        router.replace(`/astrology/astrologer/${newThreadId}`);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Stopped by the member — keep whatever arrived.
        if (buf.trim()) {
          setMessages((m) => [...m, { role: "assistant", content: buf }]);
        }
        setStreaming(false);
      } else {
        setError(err instanceof Error ? err.message : "Unexpected error");
        setStreaming(false);
      }
    }
  }

  const stop = () => abortRef.current?.abort();

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2"
        style={{ minHeight: "240px", maxHeight: "calc(100dvh - 300px)" }}
      >
        {isEmpty && !streaming ? (
          <Welcome firstName={firstName} onPick={send} />
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}
            {streaming && (
              <div className="flex items-center gap-3">
                <p className="text-xs text-[var(--foreground-subtle)] italic">
                  Reading the chart…
                </p>
                <button
                  type="button"
                  onClick={stop}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Stop
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="form-error mt-3">{error}</p>}

      <form
        className="mt-6 border-t border-[var(--border)] pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            disabled={streaming}
            rows={2}
            placeholder="Ask your astrologer..."
            className="form-input resize-none flex-1"
            style={{ minHeight: "60px" }}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ whiteSpace: "nowrap" }}
          >
            {streaming ? "..." : "Ask"}
          </button>
        </div>
        <p className="text-xs text-[var(--foreground-subtle)] mt-2">
          Press Enter to send. Shift+Enter for a new line.
        </p>
      </form>
    </div>
  );
}

function Welcome({
  firstName,
  onPick,
}: {
  firstName: string;
  onPick: (q: string) => void;
}) {
  return (
    <div className="py-8">
      <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-2xl">
        Welcome, {firstName}. I have your chart in front of me. What&rsquo;s on
        your mind? Every reading ends with a little of the work to do.
      </p>
      <p className="sublabel mb-3">Start with</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {STARTER_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="text-left border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] reading-fade"
        }`}
      >
        {isUser ? (
          msg.content || <span className="opacity-50">...</span>
        ) : msg.content ? (
          <ProseBlock
            text={msg.content}
            lookup={EMPTY_LOOKUP}
            optimisticBaseUrl={OB_BASE_URL}
            className="leading-relaxed mb-3 last:mb-0"
          />
        ) : (
          <span className="opacity-50">...</span>
        )}
      </div>
    </div>
  );
}
