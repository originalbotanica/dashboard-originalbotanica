import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Original Botanica product images from the e-commerce CloudFront.
      { protocol: "https", hostname: "dlkhclkmyx18n.cloudfront.net" },
      // Supabase storage (member-uploaded ancestor photos, etc.)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // Internationalization is handled at the App Router level via a [lang]
  // segment + dictionaries in /i18n. We do not use the legacy `i18n` config
  // option from pages router.
  async redirects() {
    return [
      // Guessable URLs found in QA: send them somewhere real.
      { source: "/altar", destination: "/altar/virtual", permanent: false },
      { source: "/tools", destination: "/", permanent: false },
      { source: "/join", destination: "/signup", permanent: false },
      { source: "/subscribe/cancel", destination: "/subscribe", permanent: false },
    ];
  },
};

export default nextConfig;
