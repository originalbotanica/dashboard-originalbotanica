import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin Supabase client.
 *
 * Uses the SERVICE ROLE key — BYPASSES Row-Level Security.
 * Only use in Route Handlers, Server Actions, and other server-side code
 * where you've already done the necessary auth checks yourself.
 * NEVER expose this client to the browser.
 *
 * Common uses:
 *  - Stripe webhook handler updating subscription state on behalf of a user
 *  - Admin tooling that needs cross-user visibility
 *  - Backfill / migration scripts
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
