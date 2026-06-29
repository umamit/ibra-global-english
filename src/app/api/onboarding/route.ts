import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 },
      );
    }

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: "Peran (role) harus ditentukan." },
        { status: 400 },
      );
    }

    // Hanya izinkan siswa, tutor, dan parent. Admin dilarang keras didaftarkan lewat onboarding!
    const allowedRoles = ["student", "tutor", "parent"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Peran tidak valid untuk proses onboarding." },
        { status: 400 },
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Update/Upsert di tabel profiles
    const fullName =
      user.user_metadata?.full_name || (user.email ?? "").split("@")[0];
    const { error: profileError } = await adminSupabase.from("profiles").upsert(
      {
        id: user.id,
        role: role,
        full_name: fullName,
        email: user.email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("Error upserting profile:", profileError);
      return NextResponse.json(
        { error: "Gagal menyimpan data profil: " + profileError.message },
        { status: 500 },
      );
    }

    // 2. Update app_metadata.role di auth.users agar JWT baru memuat role yang valid
    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: { role },
        user_metadata: { role },
      },
    );

    if (authError) {
      console.error("Error updating auth metadata:", authError);
      return NextResponse.json(
        {
          error:
            "Gagal menyelaraskan kredensial pengguna: " + authError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error in onboarding route:", err);
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
