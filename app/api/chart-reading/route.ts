import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { loadAstrologerContext } from "@/lib/astrologer/context";
import { getOrGenerateChartReading } from "@/lib/astrology/chart-reading";
import { getLocale } from "@/lib/i18n/server";

// First-ever visit writes the reading (~30s); cached and instant afterward.
export const maxDuration = 60;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) return NextResponse.json({ error: "no profile" }, { status: 400 });

  const context = await loadAstrologerContext(user.id);
  if (!context || context.isUnderEighteen || context.chart.isMocked) {
    return NextResponse.json({ error: "unavailable" }, { status: 400 });
  }

  const locale = await getLocale();
  const reading = await getOrGenerateChartReading(
    user.id,
    context,
    profile.first_name,
    locale,
  ).catch(() => null);

  if (!reading) return NextResponse.json({ error: "generation failed" }, { status: 502 });
  return NextResponse.json({ reading });
}
