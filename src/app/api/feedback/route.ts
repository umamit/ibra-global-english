import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// POST: Parents submit class feedback
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const body = await request.json();
    const { tutorId, rating, comments } = body;

    if (!tutorId || !rating) {
      return NextResponse.json(
        { error: "Tutor dan rating (1-5) wajib diisi." },
        { status: 400 }
      );
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json(
        { error: "Rating harus berupa angka antara 1 dan 5." },
        { status: 400 }
      );
    }

    const adminSupabase = getAdminSupabase();

    // Fetch parent profile name
    const { data: parentProfile, error: profileErr } = await adminSupabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (profileErr || !parentProfile) {
      return NextResponse.json(
        { error: "Profil orang tua tidak ditemukan." },
        { status: 404 }
      );
    }

    if (parentProfile.role !== "parent" && parentProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Hanya akun dengan peran Orang Tua yang dapat memberikan penilaian." },
        { status: 403 }
      );
    }

    // Fetch tutor name
    const { data: tutorData, error: tutorErr } = await adminSupabase
      .from("tutors")
      .select("name")
      .eq("id", tutorId)
      .single();

    if (tutorErr || !tutorData) {
      return NextResponse.json(
        { error: "Tutor tidak ditemukan." },
        { status: 404 }
      );
    }

    // Insert feedback
    const { error: insertErr } = await adminSupabase
      .from("class_feedback")
      .insert({
        parent_id: user.id,
        parent_name: parentProfile.full_name,
        tutor_id: tutorId,
        tutor_name: tutorData.name,
        rating: ratingVal,
        comments: comments || null,
        created_at: new Date().toISOString(),
      });

    if (insertErr) {
      console.error("Gagal menyimpan umpan balik:", insertErr);
      return NextResponse.json(
        { error: "Gagal menyimpan umpan balik: " + insertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Server error saat menyimpan feedback:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// GET: Admin fetches all feedback
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const adminSupabase = getAdminSupabase();

    // Verify admin role
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak. Khusus Administrator." }, { status: 403 });
    }

    const { data, error } = await adminSupabase
      .from("class_feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data umpan balik:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data umpan balik: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("Server error saat mengambil feedback:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
