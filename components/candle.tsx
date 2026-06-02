import Image from "next/image";

/**
 * Layered candle flame, ported from ancestors-originalbotanica.
 *
 * The flame is built from 7 stacked div layers (halo + outer + mid +
 * inner + tip + blue + light-cast) with mix-blend-mode: screen so they
 * combine into a believable flame. All animations are CSS keyframes
 * defined in globals.css.
 *
 * Pass `lit={false}` to render an unlit candle (no flame visible).
 * Pass `photoUrl` to overlay a circular portrait on the candle body
 * (used on the memorial detail page for the loved one's face).
 * Pass `size="large"` for the memorial detail page hero candle.
 */
export function Candle({
  lit = true,
  photoUrl,
  alt = "A prayer candle",
  size = "default",
}: {
  lit?: boolean;
  photoUrl?: string | null;
  alt?: string;
  size?: "default" | "large";
}) {
  const candleWidth = size === "large" ? 120 : 80;
  const candleHeight = size === "large" ? 200 : 130;

  return (
    <div
      className={`candle-wrapper ${lit ? "is-lit" : ""} ${
        size === "large" ? "candle-large" : ""
      }`}
    >
      <div className="flame-overlay" aria-hidden>
        <div className="flame-halo" />
        <div className="flame-outer" />
        <div className="flame-mid" />
        <div className="flame-inner" />
        <div className="flame-tip" />
        <div className="flame-blue" />
        <div className="flame-light-cast" />
      </div>
      <Image
        src="/white-candle.png"
        alt={alt}
        width={candleWidth}
        height={candleHeight}
        className="h-auto"
      />
      {photoUrl && (
        // Using a plain <img> so the small overlay isn't subject to
        // Next.js Image's host validation for member-uploaded photos.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="candle-photo-overlay"
          aria-hidden
        />
      )}
    </div>
  );
}
