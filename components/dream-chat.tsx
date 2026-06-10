"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

const STARTER_PROMPTS = [
  "I dreamt I was being chased through a house I have never seen before.",
  "My grandmother visited me in a dream last night.",
  "I keep dreaming about water. Sometimes calm, sometimes flooding.",
  "I had a dream where I lost a tooth.",
];

export function DreamChat({
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
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/dreams/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          threadId: threadId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Error ${res.status}`);
        setMessages((m) => m.slice(0, -1));
        setStreaming(false);
        return;
      }

      // If this was a brand new thread, the API returns the new thread id
      // in the X-Thread-Id header. Route to /dreams/<id> so the URL becomes
      // shareable + bookmarkable for the journal.
      const newThreadId = res.headers.get("X-Thread-Id");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        setError("No response stream from server.");
        setMessages((m) => m.slice(0, -1));
        setStreaming(false);
        return;
      }

      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buf += chunk;
        setMessages((m) => {
          const next = m.slice();
          next[next.length - 1] = { role: "assistant", content: buf };
          return next;
        });
      }

      // After the first message in a fresh thread, navigate to the
      // permanent URL so refresh / bookmark / back button work.
      if (!threadId && newThreadId) {
        router.replace(`/dreams/${newThreadId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2"
        style={{ minHeight: "400px", maxHeight: "calc(100vh - 320px)" }}
      >
        {isEmpty ? (
          <Welcome firstName={firstName} onPick={send} />
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}
            {streaming &&
              messages[messages.length - 1]?.role === "assistant" && (
                <p className="text-sm text-[var(--foreground-subtle)] italic animate-pulse">
                  {messages[messages.length - 1].content
                    ? "Still reading..."
                    : "Reading the dream..."}
                </p>
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
            rows={3}
            placeholder={
              isEmpty
                ? "Describe the dream..."
                : "Ask a follow-up..."
            }
            className="form-input resize-none flex-1"
            style={{ minHeight: "80px" }}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ whiteSpace: "nowrap" }}
          >
            {streaming ? "..." : "Send"}
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
        Welcome, {firstName}. Tell me the dream. As much as you remember, in
        any order. The interpretation honors Lucum&iacute;, Espiritismo, folk
        Catholic, and Western dreamwork traditions. Every reading ends with a
        small ritual.
      </p>
      <p className="sublabel mb-3">Or start with</p>
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
        className={`max-w-[85%] rounded-lg px-4 py-3 leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]"
        }`}
      >
        {msg.content || (
          <span className="opacity-50 animate-pulse" aria-label="Waiting for the reading">
            ...
          </span>
        )}
      </div>
    </div>
  );
}
