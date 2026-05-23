import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

/*
 * Brand fonts — same as the astrology site.
 *   Lora  → display / headlines (warm serif, looks like Playfair's quieter cousin)
 *   Inter → body / nav / UI (clean sans, set in ALL CAPS + tracked for nav)
 *
 * Loaded via next/font for zero layout shift and self-hosted fonts.
 */
const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://members.originalbotanica.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Original Botanica — Spiritual Membership",
    template: "%s | Original Botanica",
  },
  description:
    "Daily tarot, personal astrology, your virtual altar, ancestor altar, and a library of 200+ rituals from 66 years of practice. From Original Botanica, the Bronx, since 1959.",
  applicationName: "Original Botanica Membership",
  authors: [{ name: "Original Botanica" }],
  keywords: [
    "spiritual membership",
    "daily tarot",
    "astrology",
    "virtual altar",
    "ancestor altar",
    "rituals",
    "Santería",
    "Lucumí",
    "Espiritismo",
    "Hoodoo",
    "Bronx botanica",
    "Original Botanica",
  ],
  openGraph: {
    type: "website",
    siteName: "Original Botanica Membership",
    title: "Original Botanica — Spiritual Membership",
    description:
      "Daily tarot, personal astrology, virtual altar, ancestor altar, rituals library. Rooted in the Bronx since 1959.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Original Botanica Membership",
    description:
      "Your spiritual home online. Rooted in the Bronx since 1959.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
