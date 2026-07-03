import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("promo_banners")
      .select("id, title, message, image_url, cta_text, cta_url")
      .eq("is_active", true)
      .limit(1)
      .single();

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
