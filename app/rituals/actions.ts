"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/**
 * Save or unsave a ritual for the current member.
 *
 * Writes to ritual_favorites (RLS restricts each member to their own rows).
 * Returns { ok } so the button can revert its optimistic state on failure.
 */
export async function setRitualFavorite(
  ritualId: string,
  saved: boolean,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  if (saved) {
    const { error } = await supabase.from("ritual_favorites").upsert(
      { user_id: user.id, ritual_id: ritualId, saved_at: new Date().toISOString() },
      { onConflict: "user_id,ritual_id" },
    );
    if (error) return { ok: false };
  } else {
    const { error } = await supabase
      .from("ritual_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("ritual_id", ritualId);
    if (error) return { ok: false };
  }

  revalidatePath("/rituals/saved");
  revalidatePath("/rituals");
  return { ok: true };
}
