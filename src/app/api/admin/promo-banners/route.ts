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
      "badge_text",
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
    let { data, error } = await supabase
      .from("promo_banners")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("badge_text"))) {
      const fallbackData = { ...updateData };
      delete fallbackData.badge_text;
      const retry = await supabase
        .from("promo_banners")
        .update(fallbackData)
        .eq("id", id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("Failed to update promo banner:", err);
    return NextResponse.json({ error: err?.message || "Gagal menyimpan perubahan." }, { status: 500 });
  }
});

// POST – tambah banner / flyer baru
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const allowedFields = [
      "is_active",
      "badge_text",
      "title",
      "message",
      "image_url",
      "cta_text",
      "cta_url",
    ];

    const insertData: Record<string, unknown> = {
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    for (const key of allowedFields) {
      if (key in body) insertData[key] = body[key];
    }

    const supabase = getAdminSupabase();
    let { data, error } = await supabase
      .from("promo_banners")
      .insert([insertData])
      .select()
      .single();

    if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("badge_text"))) {
      const fallbackData = { ...insertData };
      delete fallbackData.badge_text;
      const retry = await supabase
        .from("promo_banners")
        .insert([fallbackData])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create promo banner:", err);
    return NextResponse.json({ error: err?.message || "Gagal membuat banner baru." }, { status: 500 });
  }
});

// DELETE – hapus banner
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { error } = await supabase.from("promo_banners").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete promo banner:", err);
    return NextResponse.json({ error: err?.message || "Gagal menghapus banner." }, { status: 500 });
  }
});

