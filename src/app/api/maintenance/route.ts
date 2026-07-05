import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const dynamic = 'force-dynamic';

const adminSupabase = getAdminSupabase();

// GET: ambil status maintenance saat ini
export async function GET() {
  try {
    const supabase = adminSupabase;

    const { data, error } = await supabase
      .from("landing_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ maintenance: data?.value === "true" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: ubah status maintenance (hanya admin)
export const POST = withAdminAuth(async (request: Request) => {
  try {
    // Parse body
    const { enabled } = await request.json();
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Parameter 'enabled' harus berupa boolean." }, { status: 400 });
    }

    const supabase = adminSupabase;

    // Gunakan upsert langsung pada Primary Key 'key' untuk menghindari database column id error
    const { error } = await supabase
      .from("landing_settings")
      .upsert({ key: "maintenance_mode", value: String(enabled) });

    if (error) throw error;

    return NextResponse.json({ success: true, maintenance: enabled });
  } catch (err: any) {
    console.error("Maintenance mode toggle error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});