import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { logActivity } from "@/utils/auditLogger";

export const PATCH = withAdminAuth(async (request: any) => {
  try {
    const adminSupabase = getAdminSupabase();
    
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId dan role diperlukan." },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "tutor", "student", "parent"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Peran tidak valid." },
        { status: 400 }
      );
    }

    // Dapatkan nama profil yang diubah terlebih dahulu
    const { data: targetProfile } = await adminSupabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    const targetName = targetProfile?.full_name || userId;

    // Update di tabel profiles
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json(
        { error: "Gagal memperbarui profil: " + profileError.message },
        { status: 500 }
      );
    }

    // Update di auth.users (app_metadata untuk keamanan & user_metadata untuk keselarasan) dan konfirmasi email
    const { error: authError } = await adminSupabase.auth.admin.updateUserById(userId, {
      app_metadata: { role },
      user_metadata: { role },
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Gagal memperbarui metadata auth: " + authError.message },
        { status: 500 }
      );
    }

    await logActivity(
      "Ubah Peran Pengguna",
      `Mengubah peran pengguna ${targetName} menjadi ${role}`
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Gagal memperbarui peran pengguna:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
});
