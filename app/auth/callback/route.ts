import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Email-link callback. Handles both:
 *   - Email confirmation after signup
 *   - Password-reset email link
 *
 * Supabase appends a ?code=... query param; we exchange it for a session
 * and redirect to the `next` path (or /dashboard if none).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could%20not%20verify%20your%20link.%20Please%20try%20again.`,
  );
}
