import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

// GET – semua banner (admin)
export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("promo_banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Failed to fetch promo banners:", err);
    return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });
  }
}

// PATCH – update banner (toggle aktif, edit konten)
export const PATCH = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    }

    const allowedFields = [
      "is_active",
      "title",
      "message",
      "image_url",
      "cta_text",
      "cta_url",
    ];

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowedFields) {
      if (key in fields) updateData[key] = fields[key];
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("promo_banners")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    console.error("Failed to update promo banner:", err);
    return NextResponse.json({ error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
});
