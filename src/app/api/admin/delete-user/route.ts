import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { getAdminOrTutorUser } from "@/utils/supabase/adminAuth";
import { logActivity } from "@/utils/auditLogger";

export const DELETE = withAdminAuth(async (request: any) => {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    // Dapatkan pengguna yang sedang masuk
    const adminUser = await getAdminOrTutorUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    // Cegah admin menghapus akunnya sendiri
    if (userId === adminUser.id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri." }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Dapatkan info target sebelum dihapus
    const { data: targetProfile } = await adminSupabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", userId)
      .single();
    const targetName = targetProfile ? `${targetProfile.full_name} (${targetProfile.role})` : userId;

    // Putus koneksi semua siswa yang terhubung ke akun ini (set parent_id = NULL)
    // agar data siswa tidak ikut terhapus karena foreign key constraint
    const { error: unlinkError } = await adminSupabase
      .from("students")
      .update({ parent_id: null })
      .eq("parent_id", userId);

    if (unlinkError) {
      return NextResponse.json({ error: "Gagal memutus koneksi siswa: " + unlinkError.message }, { status: 500 });
    }

    // Hapus akun dari auth.users (otomatis hapus profiles karena CASCADE)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await logActivity(
      "Hapus Pengguna",
      `Menghapus akun pengguna ${targetName} dari sistem`
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Gagal menghapus pengguna:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
});
