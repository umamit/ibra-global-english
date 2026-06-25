import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const PATCH = withAdminAuth(async (request) => {
  try {
    const adminSupabase = getAdminSupabase();
      return NextResponse.json(
        { error: "Tidak diizinkan. Hanya administrator yang dapat mengubah peran." },
        { status: 403 }
      );
    }

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

    // 2. Ambil service role key
    const { url: supabaseUrl } = getSupabaseConfig();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Konfigurasi server tidak lengkap (service role key tidak ditemukan)." },
        { status: 500 }
      );
    }

    // 3. Buat admin client dengan service role key
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 4. Update di tabel profiles
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json(
        { error: "Gagal memperbarui profil: " + profileError.message },
        { status: 500 }
      );
    }

    // 5. Update di auth.users metadata dan konfirmasi email
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { role },
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: "Gagal memperbarui metadata auth: " + authError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gagal memperbarui peran pengguna:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
