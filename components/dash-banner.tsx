import Link from "next/link";
import Image from "next/image";

/**
 * A banner card for the dashboard — Jimmy's art direction.
 *
 * His graphics are wide plates (roughly 3:1): photography on one side,
 * sacred geometry fading into darkness on the other.
 *
 * Desktop keeps that composition — the plate fills the card and the copy
 * sits over the dark half.
 *
 * Phones can't: cropping a 3:1 plate into a narrow card cuts to the
 * middle of the image, which on these plates is the empty fade — the
 * photograph disappears and the card looks black. So on mobile the card
 * stacks instead: a band of the artwork on top, anchored to the side the
 * photograph actually lives on, with the copy beneath it.
 *
 * `status` is the live line — "Burning · 4 days left", "3 flames lit" —
 * that makes this a dashboard instead of a brochure. `urgent` turns that
 * line accent-gold when something is waiting on the member.
 */
export function DashBanner({
  image,
  photoSide,
  eyebrow,
  headline,
  headlineNode,
  body,
  bodyNode,
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
  /** Rich body (e.g. the reading's own words) in place of `body`. */
  bodyNode?: React.ReactNode;
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
      {/* The artwork. In flow on phones (a band at the top of the card),
          absolutely filling the plate from md up. */}
      <div className="relative h-40 w-full sm:h-48 md:absolute md:inset-0 md:h-full">
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 1100px"
          className="object-cover"
          // Hold the photographed side in frame when the crop is narrow.
          style={{
            objectPosition: photoSide === "left" ? "left center" : "right center",
          }}
        />
        {/* Desktop scrim: deepen the copy side so the words always hold. */}
        <div
          aria-hidden
          className="hidden md:block absolute inset-0"
          style={{
            background: textOnLeft
              ? "linear-gradient(90deg, rgba(10,8,6,0.94) 0%, rgba(10,8,6,0.88) 38%, rgba(10,8,6,0.35) 62%, rgba(10,8,6,0.1) 100%)"
              : "linear-gradient(270deg, rgba(10,8,6,0.94) 0%, rgba(10,8,6,0.88) 38%, rgba(10,8,6,0.35) 62%, rgba(10,8,6,0.1) 100%)",
          }}
        />
        {/* Mobile: only a soft foot, so the photograph stays visible and
            the card's own background carries the copy below. */}
        <div
          aria-hidden
          className="md:hidden absolute inset-x-0 bottom-0 h-16"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,8,6,0) 0%, rgba(10,8,6,0.85) 100%)",
          }}
        />
      </div>

      {/* The copy. Beneath the art on phones; over the dark half from md. */}
      <div
        className={`relative px-6 py-6 md:px-12 md:py-11 md:w-[52%] md:h-full md:flex md:flex-col md:justify-center ${
          textOnLeft ? "" : "md:ml-auto"
        }`}
      >
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{eyebrow}</p>
        {/* Clamped so a long line can never spill past the plate. */}
        <h2
          className="display text-xl md:text-3xl leading-tight mb-3 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {headlineNode ?? headline}
        </h2>
        {status && (
          <p
            className={`text-sm mb-3 tracking-wide ${
              urgent ? "text-[var(--accent)]" : "text-[var(--foreground-subtle)]"
            }`}
          >
            {status}
          </p>
        )}
        {/* whitespace-pre-line so copy can choose its own break points
            (the tarot line breaks after "the botanica." to clear the card). */}
        <div
          className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-5 max-w-md overflow-hidden whitespace-pre-line"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 4,
          }}
        >
          {bodyNode ?? body}
        </div>
        <span className="nav-link text-[var(--accent)] inline-flex items-center gap-2">
          {linkLabel}
          <span aria-hidden>→</span>
        </span>
        {afterNode}
      </div>
    </>
  );

  const cls =
    "group relative block overflow-hidden rounded-xl border border-[var(--border)] bg-[#0a0806] md:aspect-[1600/519] transition-colors hover:border-[var(--accent)]";

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
