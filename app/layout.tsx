import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFooter } from "@/components/site-footer";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale } from "@/lib/i18n/server";
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
    default: "The Practice: Your Spiritual Home Online",
    template: "%s | The Practice",
  },
  description:
    "Daily tarot, personal astrology, your virtual altar, ancestor altar, and a library of hundreds of rituals from 66 years of practice. From Original Botanica, the Bronx, since 1959.",
  applicationName: "The Practice",
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
    siteName: "The Practice, from Original Botanica",
    title: "The Practice: Your Spiritual Home Online",
    description:
      "Daily tarot, personal astrology, virtual altar, ancestor altar, rituals library. Rooted in the Bronx since 1959.",
    url: "/",
    locale: "en_US",
    // Default share image for every page; individual pages can override.
    images: [
      {
        url: "https://dlkhclkmyx18n.cloudfront.net/Banners/original-botanica.png",
        width: 1200,
        height: 800,
        alt: "Original Botanica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Practice, from Original Botanica",
    description:
      "Your spiritual home online. Rooted in the Bronx since 1959.",
    images: ["https://dlkhclkmyx18n.cloudfront.net/Banners/original-botanica.png"],
  },
  // Index the production site; keep Vercel preview deployments out of Google
  // so they never compete with the real domain.
  robots:
    process.env.VERCEL_ENV === "preview"
      ? { index: false, follow: false }
      : { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <LocaleProvider locale={locale}>
          {children}
          <SiteFooter />
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
