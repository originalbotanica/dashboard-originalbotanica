import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WHEEL_DECK } from "@/lib/tarot/wheel-deck";

/**
 * Branded social preview for a shared card. When a member shares their card,
 * this is the image that shows in the link preview (iMessage, X, Facebook,
 * WhatsApp): the card art beside the card name and the Original Botanica mark,
 * with an invite to pull your own. Orientation isn't available to OG routes,
 * so the art shows upright; the page itself shows the correct orientation.
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A tarot card from Original Botanica";

async function loadCardImage(image: string): Promise<string> {
  const rel = image.replace(/^\//, "");
  // Prefer the filesystem (dev + bundled); fall back to the deployment origin.
  try {
    const file = await readFile(join(process.cwd(), "public", rel));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    /* fall through */
  }
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (base) {
    try {
      const res = await fetch(`${base}/${rel}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
      }
    } catch {
      /* ignore */
    }
  }
  return "";
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = WHEEL_DECK.find((c) => c.id === id);
  const dataUri = card ? await loadCardImage(card.image) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: "56px",
          padding: "70px",
          background:
            "radial-gradient(120% 120% at 30% 20%, #2a2018 0%, #14100b 60%)",
          color: "#f2e9d6",
        }}
      >
        {dataUri ? (
          <img
            src={dataUri}
            width={300}
            height={518}
            style={{ borderRadius: 16 }}
          />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              color: "#e8ac7c",
              textTransform: "uppercase",
            }}
          >
            Original Botanica
          </div>
          <div style={{ fontSize: 76, fontWeight: 600, marginTop: 14, lineHeight: 1.04 }}>
            {card ? card.name : "Tarot Today"}
          </div>
          <div style={{ fontSize: 30, color: "#b8a48c", marginTop: 26 }}>
            A card from the spinning wheel.
          </div>
          <div style={{ fontSize: 27, color: "#e8ac7c", marginTop: 40 }}>
            Pull your own at members.originalbotanica.com
          </div>
          <div style={{ fontSize: 22, color: "#7a6c5b", marginTop: 12 }}>
            The Bronx, since 1959
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
