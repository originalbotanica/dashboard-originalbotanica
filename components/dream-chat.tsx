"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { materialUrl } from "@/lib/rituals/material-link";

// Supplies the reading recommends arrive wrapped in [[ ]]. Turn each into a
// link to its originalbotanica.com page (matching the rituals library), so
// the closing ritual is shoppable. Plain text and household items are left
// untouched.
const SUPPLY_RE = /\[\[([^\][]+)\]\]/g;

// A handful of slow-rising embers for the atmospheric backdrop. Fixed values
// (no Math.random) so server and client render identically — no hydration
// mismatch. Each: horizontal position, rise duration, start delay, size.
const MOTES = [
  { left: "8%", dur: "11s", delay: "0s", size: 4 },
  { left: "18%", dur: "14s", delay: "5s", size: 3 },
  { left: "27%", dur: "9s", delay: "2s", size: 5 },
  { left: "39%", dur: "13s", delay: "7s", size: 3 },
  { left: "48%", dur: "10s", delay: "1s", size: 4 },
  { left: "58%", dur: "15s", delay: "4s", size: 3 },
  { left: "67%", dur: "9.5s", delay: "8s", size: 5 },
  { left: "76%", dur: "12s", delay: "3s", size: 4 },
  { left: "85%", dur: "13.5s", delay: "6s", size: 3 },
  { left: "93%", dur: "10.5s", delay: "1.5s", size: 4 },
];

function DreamBackdrop() {
  return (
    <div className="dream-backdrop" aria-hidden="true">
      <div className="dream-glow" />
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="dream-mote"
          style={{
            left: m.left,
            width: m.size,
            height: m.size,
            animationDuration: m.dur,
            animationDelay: m.delay,
          }}
        />
      ))}
    </div>
  );
}

function renderDreamContent(content: string) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  SUPPLY_RE.lastIndex = 0;
  while ((m = SUPPLY_RE.exec(content)) !== null) {
    if (m.index > last) nodes.push(content.slice(last, m.index));
    const name = m[1].trim();
    nodes.push(
      <a
        key={key++}
        href={materialUrl({ name })}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--accent)] hover:underline"
      >
        {name}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < content.length) nodes.push(content.slice(last));
  return nodes;
}

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

    // Buffer the whole reading, then reveal it all at once (like the
    // Compatibility reading) instead of streaming word-by-word.
    let buf = "";
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch("/api/dreams/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          threadId: threadId || undefined,
        }),
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

      if (!threadId && newThreadId) {
        router.replace(`/dreams/${newThreadId}`);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
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
    <div className="relative flex flex-col flex-1 min-h-0">
      <DreamBackdrop />
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto pr-2"
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
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-[var(--foreground-subtle)] italic animate-pulse">
                  Reading the dream…
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
        className="relative z-10 mt-6 border-t border-[var(--border)] pt-4"
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
            placeholder={isEmpty ? "Describe the dream..." : "Ask a follow-up..."}
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
        <p className="text-xs text-[var(--foreground-subtle)] mt-1">
          Your dreams are private to your account.
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
  // The dreamer's own words stay as a quiet bubble, right-aligned. The reading
  // is set as serif prose with no bubble, revealed all at once with a gentle
  // fade over the candlelit backdrop.
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg px-4 py-3 leading-relaxed whitespace-pre-wrap break-words bg-[var(--accent)] text-[var(--accent-foreground)]">
          {msg.content}
        </div>
      </div>
    );
  }

  if (!msg.content) return null;

  const paragraphs = msg.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="max-w-[44rem] reading-fade">
      {paragraphs.map((p, i) => (
        <p key={i} className="dream-line">
          {renderDreamContent(p)}
        </p>
      ))}
    </div>
  );
}
