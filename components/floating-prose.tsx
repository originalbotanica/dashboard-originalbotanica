"use client";

import { parseProse, type ProductLookup } from "@/lib/rag/render-prose";
import { materialUrl } from "@/lib/rituals/material-link";

/**
 * Renders reading prose where every word is wrapped in its own
 * <span class="float-word">, so each word drifts up and fades into place
 * as it appears (see .float-word in globals.css). Used for the live,
 * streaming reading in the astrologer and dream tools.
 *
 * The animation is mount-once: because the revealed text only grows and
 * each word keeps a stable position/key, a word animates the first time
 * it renders and is never replayed as later words arrive.
 *
 * Product references ([[Name|slug]] for the astrologer, [[Name]] for
 * dreams) are preserved as links and float in as a single unit.
 */

type Seg =
  | { kind: "text"; text: string }
  | { kind: "link"; name: string; href: string }
  | { kind: "bold"; text: string };

function astrologerSegs(
  p: string,
  lookup: ProductLookup,
  base?: string,
): Seg[] {
  return parseProse(p).map((t): Seg => {
    if (t.type === "text") return { kind: "text", text: t.text };
    if (t.type === "bold") return { kind: "bold", text: t.text };
    const prod = lookup.byslug.get(t.slug);
    const href = prod
      ? prod.url
      : base
        ? `${base.replace(/\/$/, "")}/${t.slug}`
        : "";
    return href ? { kind: "link", name: t.name, href } : { kind: "text", text: t.name };
  });
}

const DREAM_RE = /\[\[([^\][]+)\]\]/g;

function dreamSegs(p: string): Seg[] {
  const out: Seg[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  DREAM_RE.lastIndex = 0;
  while ((m = DREAM_RE.exec(p)) !== null) {
    if (m.index > last) out.push({ kind: "text", text: p.slice(last, m.index) });
    const name = m[1].trim();
    out.push({ kind: "link", name, href: materialUrl({ name }) });
    last = m.index + m[0].length;
  }
  if (last < p.length) out.push({ kind: "text", text: p.slice(last) });
  return out;
}

const LINK_CLASS =
  "text-accent hover:text-accent-strong underline decoration-accent/40 hover:decoration-accent underline-offset-2 transition-colors";

export function FloatingProse({
  text,
  mode,
  lookup,
  optimisticBaseUrl,
  className = "",
}: {
  text: string;
  mode: "astrologer" | "dream";
  lookup?: ProductLookup;
  optimisticBaseUrl?: string;
  className?: string;
}) {
  const paragraphs = text.split(/\n\n+/);
  let k = 0; // stable, monotonically-increasing word key across the message

  return (
    <>
      {paragraphs.map((p, pi) => {
        const segs =
          mode === "astrologer"
            ? astrologerSegs(p, lookup ?? { byslug: new Map() }, optimisticBaseUrl)
            : dreamSegs(p);

        return (
          <p key={pi} className={className}>
            {segs.flatMap((seg) => {
              if (seg.kind === "text") {
                // Break into word(+trailing space) chunks so each word
                // floats in on its own; whitespace stays attached.
                const chunks = seg.text.match(/\S+\s*|\s+/g) ?? [];
                return chunks.map((c) => (
                  <span key={k++} className="float-word">
                    {c}
                  </span>
                ));
              }
              if (seg.kind === "bold") {
                return [
                  <span key={k++} className="float-word">
                    <strong className="text-foreground font-semibold">
                      {seg.text}
                    </strong>{" "}
                  </span>,
                ];
              }
              return [
                <span key={k++} className="float-word">
                  <a
                    href={seg.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                  >
                    {seg.name}
                  </a>
                </span>,
              ];
            })}
          </p>
        );
      })}
    </>
  );
}
