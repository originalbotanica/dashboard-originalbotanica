import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /auth/signout — ends the current session and redirects home.
 * Use from a <form method="post" action="/auth/signout">.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
