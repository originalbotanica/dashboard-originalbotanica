"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

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

export async function createAncestorAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const relation = String(formData.get("relation") || "").trim() || null;
  const birth_date = String(formData.get("birth_date") || "").trim() || null;
  const death_date = String(formData.get("death_date") || "").trim() || null;
  const dedication = String(formData.get("dedication") || "").trim() || null;
  const photo_url = String(formData.get("photo_url") || "").trim() || null;
  const is_public = formData.get("is_public") === "on";

  if (!name) {
    return redirect("/ancestors/new?error=Please%20enter%20a%20name");
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

  const name = String(formData.get("name") || "").trim();
  const relation = String(formData.get("relation") || "").trim() || null;
  const birth_date = String(formData.get("birth_date") || "").trim() || null;
  const death_date = String(formData.get("death_date") || "").trim() || null;
  const dedication = String(formData.get("dedication") || "").trim() || null;
  const photo_url = String(formData.get("photo_url") || "").trim() || null;
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

/**
 * Anonymous "add a light" — increments the light_count on a public
 * memorial. Called from the public /candle/[hash] page so visitors
 * (member or not) can leave a small acknowledgment.
 */
export async function addLightAction(hash: string): Promise<{ ok: boolean }> {
  if (!hash) return { ok: false };
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
  revalidatePath(`/candle/${hash}`);
  return { ok: true };
}
