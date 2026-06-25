import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const DELETE = withAdminAuth(async (request) => {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }

    // Pastikan pemohon adalah admin yang sudah login
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    // Cek apakah pemohon memiliki peran admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Tidak memiliki izin." }, { status: 403 });
    }

    // Cegah admin menghapus akunnya sendiri
    if (userId === user.id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri." }, { status: 400 });
    }
    // Baca service role key — hanya dari server-only env var (tanpa NEXT_PUBLIC_)
    const { url: supabaseUrl } = getSupabaseConfig();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Konfigurasi server tidak lengkap (service role key tidak ditemukan)." }, { status: 500 });
    }

    // Buat admin client dengan service role key
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Putus koneksi semua siswa yang terhubung ke akun ini (set parent_id = NULL)
    // agar data siswa tidak ikut terhapus karena foreign key constraint
    const { error: unlinkError } = await adminClient
      .from("students")
      .update({ parent_id: null })
      .eq("parent_id", userId);

    if (unlinkError) {
      return NextResponse.json({ error: "Gagal memutus koneksi siswa: " + unlinkError.message }, { status: 500 });
    }

    // Hapus akun dari auth.users (otomatis hapus profiles karena CASCADE)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gagal menghapus pengguna:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
});
