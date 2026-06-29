"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ProseBlock, buildProductLookup } from "@/lib/rag/render-prose";
import { usePacedReveal } from "@/components/use-paced-reveal";
import { FloatingProse } from "@/components/floating-prose";
import { useT } from "@/components/locale-provider";

type Msg = { role: "user" | "assistant"; content: string };

// Empty product lookup is fine for the chat: we render assistant
// messages in "optimistic" mode, so any [[Name|slug]] markup links
// to originalbotanica.com/<slug> even without a per-slug validation.
const EMPTY_LOOKUP = buildProductLookup([]);
const OB_BASE_URL = "https://originalbotanica.com";

export function AstrologerChat({
  firstName,
  threadId,
  initialMessages,
  recs,
}: {
  firstName: string;
  threadId: string | null;
  initialMessages: Msg[];
  /** "For this reading" cards, rendered by the server page under the latest reading. */
  recs?: ReactNode;
}) {
  const router = useRouter();
  const t = useT();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pendingNavRef = useRef<string | null>(null);

  // Reveal the reading at a calm, ethereal pace — words flow in as they are
  // written, rather than spilling out all at once or splashing in a block.
  const reveal = usePacedReveal(
    (text) =>
      setMessages((m) => {
        const next = m.slice();
        if (next[next.length - 1]?.role === "assistant") {
          next[next.length - 1] = { role: "assistant", content: text };
        }
        return next;
      }),
    () => {
      setStreaming(false);
      const nav = pendingNavRef.current;
      if (nav) {
        pendingNavRef.current = null;
        router.replace(`/astrology/astrologer/${nav}`);
      } else {
        // Continuing thread: refresh so the "For this reading" cards update.
        router.refresh();
      }
    },
  );

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
    reveal.reset();

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
        setMessages((m) => m.slice(0, -1));
        setStreaming(false);
        return;
      }

      const newThreadId = res.headers.get("X-Thread-Id");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        setError(t("dr.noStream"));
        setMessages((m) => m.slice(0, -1));
        setStreaming(false);
        return;
      }

      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        reveal.push(buf);
      }
      // For a new conversation, route to its permanent URL once the reveal
      // settles (handled in onSettled), so refresh/back work.
      pendingNavRef.current = !threadId && newThreadId ? newThreadId : null;
      reveal.finish();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Stopped by the member — keep what arrived and settle gracefully.
        reveal.finish();
      } else {
        reveal.reset();
        setError(err instanceof Error ? err.message : t("dr.unexpected"));
        setMessages((m) => m.slice(0, -1));
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
        {isEmpty ? (
          <Welcome firstName={firstName} onPick={send} />
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((m, i) => (
              <Message
                key={i}
                msg={m}
                animate={
                  streaming && i === messages.length - 1 && m.role === "assistant"
                }
              />
            ))}
            {streaming &&
              messages[messages.length - 1]?.role === "assistant" && (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[var(--foreground-subtle)] italic">
                    {t("achat.reading")}
                  </p>
                  <button
                    type="button"
                    onClick={stop}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    {t("dr.stop")}
                  </button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* "For this reading" cards, directly under the reading. */}
      {!streaming && recs}

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
            placeholder={t("achat.placeholder")}
            className="form-input resize-none flex-1"
            style={{ minHeight: "60px" }}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ whiteSpace: "nowrap" }}
          >
            {streaming ? "..." : t("achat.ask")}
          </button>
        </div>
        <p className="text-xs text-[var(--foreground-subtle)] mt-2">
          {t("dr.enterHint")}
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
  const t = useT();
  const starters = [
    t("achat.starter1"),
    t("achat.starter2"),
    t("achat.starter3"),
    t("achat.starter4"),
  ];
  return (
    <div className="py-8">
      <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-2xl">
        {t("achat.welcome", { name: firstName })}
      </p>
      <p className="sublabel mb-3">{t("achat.startWith")}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {starters.map((q) => (
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

function Message({ msg, animate = false }: { msg: Msg; animate?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]"
        }`}
      >
        {isUser ? (
          msg.content || <span className="opacity-50">...</span>
        ) : msg.content ? (
          animate ? (
            <FloatingProse
              text={msg.content}
              mode="astrologer"
              lookup={EMPTY_LOOKUP}
              optimisticBaseUrl={OB_BASE_URL}
              className="leading-relaxed mb-3 last:mb-0"
            />
          ) : (
            <ProseBlock
              text={msg.content}
              lookup={EMPTY_LOOKUP}
              optimisticBaseUrl={OB_BASE_URL}
              className="leading-relaxed mb-3 last:mb-0"
            />
          )
        ) : (
          <span className="opacity-50">...</span>
        )}
      </div>
    </div>
  );
}
