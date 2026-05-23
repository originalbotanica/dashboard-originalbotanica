import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Top-level Next.js middleware.
 * Runs on every request that matches the matcher below.
 * Refreshes the Supabase session and handles auth-gated redirects.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
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
