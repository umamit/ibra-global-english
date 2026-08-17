import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    let { data, error } = await supabase
      .from("promo_banners")
      .select("id, badge_text, title, message, image_url, cta_text, cta_url")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("badge_text"))) {
      const retry = await supabase
        .from("promo_banners")
        .select("id, title, message, image_url, cta_text, cta_url")
        .eq("is_active", true)
        .limit(1)
        .single();
      data = retry.data as any;
      error = retry.error;
    }

    if (error) {
      // PGRST116 = no rows found, bukan error sebenarnya
      if (error.code === "PGRST116") {
        return NextResponse.json(null, {
          headers: { "Cache-Control": "no-store, max-age=0" },
        });
      }
      throw error;
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error("Failed to fetch active promo banner:", err);
    return NextResponse.json(null, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
