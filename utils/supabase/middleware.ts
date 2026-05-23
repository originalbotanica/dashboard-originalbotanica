import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware-side Supabase client.
 * Refreshes the user's session on every request and re-issues cookies.
 * Without this, Server Components can return stale sessions.
 *
 * Also handles redirect logic for auth-gated routes.
 *
 * Route policy (mirrors the astrology codebase patterns, adapted to the
 * membership's tool routes):
 *
 *  Anonymous users on a /dashboard, /altar, /tarot, /ancestors, /rituals
 *  path → bounce to /login.
 *
 *  Logged-in users hitting /login, /signup, /reset-password → bounce
 *  to /dashboard (no point seeing the auth pages once signed in).
 *
 *  The /auth/callback route is always reachable so Supabase can finish
 *  email-link sign-ins.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: this must be called to refresh the session token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/altar") ||
    pathname.startsWith("/tarot") ||
    pathname.startsWith("/astrology") ||
    pathname.startsWith("/ancestors") ||
    pathname.startsWith("/rituals") ||
    pathname.startsWith("/profile-setup") ||
    pathname.startsWith("/account");

  // Logged-in users on auth routes → bounce to dashboard.
  if (user && isAuthRoute && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Anonymous users on protected routes → bounce to login.
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
