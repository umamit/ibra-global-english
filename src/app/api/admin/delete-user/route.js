import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/client";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function DELETE(request) {
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

    // Gunakan service role client yang sudah terkonfigurasi di utils
    const adminClient = createServiceRoleClient();

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gagal menghapus pengguna:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
