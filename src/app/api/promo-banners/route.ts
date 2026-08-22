import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    const [bannersRes, intervalRes] = await Promise.all([
      supabase
        .from("promo_banners")
        .select("id, badge_text, title, message, image_url, cta_text, cta_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("landing_settings")
        .select("value")
        .eq("key", "promo_carousel_interval")
        .single(),
    ]);

    let data = bannersRes.data;
    let error = bannersRes.error;

    if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("badge_text"))) {
      const retry = await supabase
        .from("promo_banners")
        .select("id, title, message, image_url, cta_text, cta_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      data = retry.data as any;
      error = retry.error;
    }

    const interval = intervalRes.data?.value ? Math.max(1, parseInt(intervalRes.data.value, 10)) : 5;

    return NextResponse.json(
      {
        banners: data || [],
        interval,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (err) {
    console.error("Failed to fetch active promo banners:", err);
    return NextResponse.json(
      { banners: [], interval: 5 },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
