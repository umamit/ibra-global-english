import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

// GET – Ambil durasi carousel promo saat ini
export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data } = await supabase
      .from("landing_settings")
      .select("value")
      .eq("key", "promo_carousel_interval")
      .single();

    const interval = data?.value ? Math.max(1, parseInt(data.value, 10)) : 5;
    return NextResponse.json({ interval });
  } catch (err) {
    console.error("Failed to fetch promo carousel interval:", err);
    return NextResponse.json({ interval: 5 });
  }
}

// POST – Simpan durasi carousel promo baru
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const interval = Math.max(1, Math.min(60, parseInt(body.interval, 10) || 5));

    const supabase = getAdminSupabase();
    const { error } = await supabase.from("landing_settings").upsert(
      {
        key: "promo_carousel_interval",
        value: String(interval),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) throw error;
    return NextResponse.json({ success: true, interval });
  } catch (err: any) {
    console.error("Failed to save promo carousel interval:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal menyimpan durasi." },
      { status: 500 }
    );
  }
});
