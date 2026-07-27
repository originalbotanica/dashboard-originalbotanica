import Link from "next/link";
import Image from "next/image";

/**
 * A full-bleed banner card for the dashboard — Jimmy's art direction.
 *
 * Each of his graphics is a wide plate: photography on one side, sacred
 * geometry fading into darkness on the other. The copy sits on the dark
 * side so nothing competes with the image, and a gradient scrim keeps
 * the text legible at every width.
 *
 * `status` is the live line — "Burning · 4 days left", "3 flames lit" —
 * that makes the card a dashboard instead of a brochure. `urgent` gives
 * that line the accent color when something is waiting on the member.
 */
export function DashBanner({
  image,
  photoSide,
  eyebrow,
  headline,
  headlineNode,
  body,
  status,
  urgent = false,
  href,
  linkLabel,
  external = false,
  priority = false,
  afterNode,
}: {
  image: string;
  /** Which side of the artwork holds the photograph. Copy goes opposite. */
  photoSide: "left" | "right";
  eyebrow: string;
  headline?: string;
  headlineNode?: React.ReactNode;
  body: string;
  status?: string | null;
  urgent?: boolean;
  href: string;
  linkLabel: string;
  external?: boolean;
  priority?: boolean;
  afterNode?: React.ReactNode;
}) {
  const textOnLeft = photoSide === "right";

  const inner = (
    <>
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 1100px"
        className="object-cover"
      />
      {/* Scrim: deepen the copy side so the words always hold. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: textOnLeft
            ? "linear-gradient(90deg, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.86) 38%, rgba(10,8,6,0.35) 62%, rgba(10,8,6,0.1) 100%)"
            : "linear-gradient(270deg, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.86) 38%, rgba(10,8,6,0.35) 62%, rgba(10,8,6,0.1) 100%)",
        }}
      />
      {/* On phones the plate is short and the copy needs a full scrim. */}
      <div
        aria-hidden
        className="absolute inset-0 md:hidden"
        style={{ background: "rgba(10,8,6,0.72)" }}
      />

      <div
        className={`relative flex ${
          textOnLeft ? "justify-start" : "justify-end"
        }`}
      >
        <div className="w-full md:w-[52%] px-7 py-8 md:px-12 md:py-11">
          <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{eyebrow}</p>
          <h2 className="display text-xl md:text-3xl leading-tight mb-3">
            {headlineNode ?? headline}
          </h2>
          {status && (
            <p
              className={`text-sm mb-3 tracking-wide ${
                urgent
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground-subtle)]"
              }`}
            >
              {status}
            </p>
          )}
          <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-5 max-w-md">
            {body}
          </p>
          <span className="nav-link text-[var(--accent)] inline-flex items-center gap-2">
            {linkLabel}
            <span aria-hidden>→</span>
          </span>
          {afterNode}
        </div>
      </div>
    </>
  );

  const cls =
    "group relative block overflow-hidden rounded-xl border border-[var(--border)] bg-[#0a0806] min-h-[15rem] md:min-h-0 md:aspect-[1600/519] transition-colors hover:border-[var(--accent)]";

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
