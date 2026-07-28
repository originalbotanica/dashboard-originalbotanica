import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE,
  attributionFromUrl,
  encodeAttribution,
} from "@/lib/ads/attribution";

/**
 * Top-level Next.js middleware.
 * Runs on every request that matches the matcher below.
 * Refreshes the Supabase session, handles auth-gated redirects, and
 * remembers ad attribution on the visit that arrives from an ad.
 */
export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Ad click? Remember it. The first touch wins: if someone clicked an ad
  // last week and arrives organically today, the ad still gets the credit
  // (we only overwrite when a fresh click ID comes in).
  const attr = attributionFromUrl(
    new URL(request.url),
    request.headers.get("referer"),
  );
  if (attr) {
    response.cookies.set(ATTRIBUTION_COOKIE, encodeAttribution(attr), {
      maxAge: ATTRIBUTION_MAX_AGE,
      httpOnly: false, // the pixel layer reads this in the browser too
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *  - static files (_next/static, _next/image)
     *  - favicon, sitemap, robots
     *  - common image extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
