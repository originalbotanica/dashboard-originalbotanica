"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSubscriptionStatus } from "@/lib/subscription";
import { containsProhibitedLanguage } from "@/lib/moderation";
import { localMidnight } from "@/lib/altar/altar";

/** How many new memorials a member may add in a rolling 24-hour window.
 *  Memorials are lasting records, so this is purely an anti-spam guard;
 *  it's generous enough that honoring loved ones is never blocked. */
const ANCESTOR_DAILY_LIMIT = 5;

/**
 * Server actions for the Ancestors altar.
 *
 * Create / update / delete memorials, plus the photo upload to
 * Supabase Storage and the anonymous "add my light" counter used on
 * the public shareable /candle/[hash] pages.
 */

function makeHash(): string {
  // Short, URL-friendly, lower-collision-rate hash for shareable URLs.
  const raw = randomBytes(8).toString("base64url").replace(/[-_]/g, "");
  return "c" + raw.slice(0, 9);
}

/**
 * A memorial photo must live in our own Supabase Storage (that's where the
 * upload route puts it). The URL arrives from a hidden form field, so a
 * member could otherwise point it at any external address — rendered as a
 * raw <img> on the public /candle/[hash] page, that would hotlink off-site
 * or beacon a viewer's IP. Accept only our storage origin; drop anything else.
 */
function safePhotoUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const supaHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
    const ok =
      u.protocol === "https:" &&
      u.host === supaHost &&
      u.pathname.includes("/storage/v1/object/public/");
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function createAncestorAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) redirect("/tools/ancestors");

  const name = String(formData.get("name") || "").trim();
  const relation = String(formData.get("relation") || "").trim() || null;
  const birth_date = String(formData.get("birth_date") || "").trim() || null;
  const death_date = String(formData.get("death_date") || "").trim() || null;
  const dedication = String(formData.get("dedication") || "").trim() || null;
  const photo_url = safePhotoUrl(
    String(formData.get("photo_url") || "").trim() || null,
  );
  const is_public = formData.get("is_public") === "on";

  if (!name) {
    return redirect("/ancestors/new?error=Please%20enter%20a%20name");
  }
  if (containsProhibitedLanguage(name, dedication)) {
    return redirect(
      "/ancestors/new?error=" +
        encodeURIComponent(
          "Please keep the name and dedication respectful of this sacred space.",
        ),
    );
  }

  // Gentle daily rate limit on new memorials (anti-spam only).
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count: addedToday } = await supabase
    .from("ancestors")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("added_at", since);
  if ((addedToday ?? 0) >= ANCESTOR_DAILY_LIMIT) {
    return redirect(
      "/ancestors/new?error=" +
        encodeURIComponent(
          `You've added ${ANCESTOR_DAILY_LIMIT} memorials today. Please return tomorrow to honor another.`,
        ),
    );
  }

  // Try a few hashes in case of (extremely unlikely) collision.
  let hash = makeHash();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: clash } = await supabase
      .from("ancestors")
      .select("id")
      .eq("hash", hash)
      .maybeSingle();
    if (!clash) break;
    hash = makeHash();
  }

  const { data: created, error } = await supabase
    .from("ancestors")
    .insert({
      user_id: user.id,
      name,
      relation,
      birth_date,
      death_date,
      dedication,
      photo_url,
      hash,
      is_public,
      flame_lit: true,
    })
    .select("id")
    .single();

  if (error || !created) {
    return redirect(
      `/ancestors/new?error=${encodeURIComponent(error?.message || "Could not save the memorial")}`,
    );
  }

  revalidatePath("/ancestors");
  redirect(`/ancestors/${created.id}`);
}

export async function updateAncestorAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return redirect("/ancestors");

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) redirect("/tools/ancestors");

  const name = String(formData.get("name") || "").trim();
  const relation = String(formData.get("relation") || "").trim() || null;
  const birth_date = String(formData.get("birth_date") || "").trim() || null;
  const death_date = String(formData.get("death_date") || "").trim() || null;
  const dedication = String(formData.get("dedication") || "").trim() || null;
  const photo_url = safePhotoUrl(
    String(formData.get("photo_url") || "").trim() || null,
  );
  const is_public = formData.get("is_public") === "on";

  if (!name) {
    return redirect(
      `/ancestors/${id}?error=Please%20enter%20a%20name`,
    );
  }

  const { error } = await supabase
    .from("ancestors")
    .update({
      name,
      relation,
      birth_date,
      death_date,
      dedication,
      photo_url,
      is_public,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return redirect(
      `/ancestors/${id}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/ancestors");
  revalidatePath(`/ancestors/${id}`);
  redirect(`/ancestors/${id}?saved=1`);
}

export async function deleteAncestorAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return redirect("/ancestors");

  await supabase
    .from("ancestors")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/ancestors");
  redirect("/ancestors");
}

/* ── Offerings ─────────────────────────────────────────────────────────
 *
 * A second devotional act on a memorial, beside the candle: set fresh
 * water, flowers, or black coffee on the altar, or send ancestor money.
 * Each offering is honest about its own lineage in the UI — ancestor
 * money is presented as a practice from Chinese folk religion embraced
 * by many modern practitioners, never folded into the Lucumí/Espiritismo
 * frame. Offerings are traditionally refreshed weekly; we allow one per
 * memorial per day per person as a gentle anti-spam rhythm.
 */

export type OfferingType =
  | "water"
  | "flowers"
  | "coffee"
  | "fruit"
  | "ancestor_money";

const OFFERING_TYPES: OfferingType[] = [
  "water",
  "flowers",
  "coffee",
  "fruit",
  "ancestor_money",
];

export type OfferingResult =
  | { ok: true }
  | { ok: false; code: "today" | "error" };

/** Member offering on their own memorial. */
export async function makeOfferingAction(
  ancestorId: string,
  type: string,
): Promise<OfferingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "error" };

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) return { ok: false, code: "error" };

  if (!OFFERING_TYPES.includes(type as OfferingType))
    return { ok: false, code: "error" };

  // Memorial must belong to this member.
  const { data: memorial } = await supabase
    .from("ancestors")
    .select("id")
    .eq("id", ancestorId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!memorial) return { ok: false, code: "error" };

  // One offering per memorial per calendar day per member — resets at
  // the member's own midnight, like the candle-lighting limit.
  const memberTz = (await headers()).get("x-vercel-ip-timezone");
  const since = localMidnight(memberTz).toISOString();
  const { count } = await supabase
    .from("ancestor_offerings")
    .select("id", { count: "exact", head: true })
    .eq("ancestor_id", ancestorId)
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= 1) return { ok: false, code: "today" };

  const { error } = await supabase.from("ancestor_offerings").insert({
    ancestor_id: ancestorId,
    user_id: user.id,
    offering_type: type,
  });
  if (error) return { ok: false, code: "error" };

  revalidatePath(`/ancestors/${ancestorId}`);
  return { ok: true };
}

/**
 * Anonymous family/guest offering from the public /candle/[hash] page.
 * Mirrors addLightAction: cookie-throttled to one per memorial per day
 * per browser; writes through the admin client with no user attached.
 */
export async function makeGuestOfferingAction(
  hash: string,
  type: string,
): Promise<OfferingResult> {
  if (!hash) return { ok: false, code: "error" };
  if (!OFFERING_TYPES.includes(type as OfferingType))
    return { ok: false, code: "error" };

  const jar = await cookies();
  const cookieKey = `ob_off_${hash}`;
  if (jar.get(cookieKey)) return { ok: false, code: "today" };

  const admin = createAdminClient();
  const { data: memorial } = await admin
    .from("ancestors")
    .select("id, is_public")
    .eq("hash", hash)
    .maybeSingle();
  if (!memorial?.is_public) return { ok: false, code: "error" };

  const { error } = await admin.from("ancestor_offerings").insert({
    ancestor_id: memorial.id,
    user_id: null,
    offering_type: type,
  });
  if (error) return { ok: false, code: "error" };

  // The cookie lapses at the visitor's next local midnight, so "one a
  // day" means the calendar day, not a rolling 24 hours.
  const visitorTz = (await headers()).get("x-vercel-ip-timezone");
  const untilMidnight = Math.max(
    60,
    Math.floor(
      (localMidnight(visitorTz).getTime() + 86_400_000 - Date.now()) / 1000,
    ),
  );
  jar.set(cookieKey, "1", {
    maxAge: untilMidnight,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath(`/candle/${hash}`);
  return { ok: true };
}

/**
 * Anonymous "add a light" — increments the light_count on a public
 * memorial. Called from the public /candle/[hash] page so visitors
 * (member or not) can leave a small acknowledgment.
 */
export async function addLightAction(hash: string): Promise<{ ok: boolean }> {
  if (!hash) return { ok: false };

  // One light per visitor per memorial: a cookie stops the same browser from
  // inflating the count by clicking repeatedly. Not bulletproof, but it keeps
  // the number honest for normal visitors.
  const jar = await cookies();
  const cookieKey = `ob_lit_${hash}`;
  if (jar.get(cookieKey)) return { ok: true };

  const admin = createAdminClient();
  const { data: memorial } = await admin
    .from("ancestors")
    .select("id, light_count, is_public")
    .eq("hash", hash)
    .maybeSingle();
  if (!memorial?.is_public) return { ok: false };
  await admin
    .from("ancestors")
    .update({ light_count: (memorial.light_count || 0) + 1 })
    .eq("id", memorial.id);

  jar.set(cookieKey, "1", {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath(`/candle/${hash}`);
  return { ok: true };
}
