import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

// GET – Ambil testimoni (Publik: hanya yang disetujui / is_active=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    const supabase = getAdminSupabase();
    let query = supabase.from("testimonials").select("*").order("created_at", { ascending: false });

    if (!showAll) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Gagal memuat testimoni:", error);
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error API testimonials GET:", err);
    return NextResponse.json({ data: [] });
  }
}

// POST – Pengiriman Ulasan/Testimoni Publik oleh Siswa/Orang Tua/Alumni (Status awal: Pending, is_active: false)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, role, text, rating } = body;

    // Validasi dasar
    if (!author || typeof author !== "string" || author.trim().length < 2) {
      return NextResponse.json({ error: "Nama wajib diisi minimal 2 karakter." }, { status: 400 });
    }
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json({ error: "Pesan ulasan wajib diisi minimal 10 karakter." }, { status: 400 });
    }

    const numericRating = Math.min(Math.max(parseInt(rating) || 5, 1), 5);
    const cleanRole = role && typeof role === "string" ? role.trim() : "Orang Tua / Siswa";

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("testimonials")
      .insert([
        {
          author: author.trim(),
          role: cleanRole,
          text: text.trim(),
          rating: numericRating,
          is_active: false, // Kurasi Admin: tidak langsung tampil sebelum disetujui
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      // Jika kolom status belum ada di DB, fallback simpan is_active = false
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("testimonials")
        .insert([
          {
            author: author.trim(),
            role: cleanRole,
            text: text.trim(),
            rating: numericRating,
            is_active: false,
          },
        ])
        .select();

      if (fallbackError) {
        console.error("Gagal menyimpan testimoni publik:", fallbackError);
        return NextResponse.json({ error: "Gagal menyimpan ulasan. Silakan coba lagi." }, { status: 500 });
      }
      return NextResponse.json({ success: true, data: fallbackData });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error API testimonials POST:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PATCH – Admin: Setujui (Approve / Publish), Tolak, atau Edit Testimoni
export const PATCH = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, is_active, status, author, role, text, rating } = body;

    if (!id) {
      return NextResponse.json({ error: "ID testimoni diperlukan." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (typeof is_active === "boolean") updatePayload.is_active = is_active;
    if (status) updatePayload.status = status;
    if (author) updatePayload.author = author;
    if (role) updatePayload.role = role;
    if (text) updatePayload.text = text;
    if (rating) updatePayload.rating = rating;

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("testimonials")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Gagal update testimoni admin:", error);
      return NextResponse.json({ error: "Gagal memperbarui testimoni." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error API testimonials PATCH:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
});
