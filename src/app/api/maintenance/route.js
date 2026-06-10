import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

// GET: ambil status maintenance saat ini
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from("landing_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ maintenance: data?.value === "true" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: ubah status maintenance (hanya admin)
export async function POST(request) {
  try {
    // Verifikasi bahwa request berasal dari admin yang terautentikasi
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    const role = user?.user_metadata?.role;

    if (!user || role !== "admin") {
      return NextResponse.json({ error: "Tidak diizinkan. Hanya admin yang dapat mengubah mode maintenance." }, { status: 403 });
    }

    // Parse body
    const { enabled } = await request.json();
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Parameter 'enabled' harus berupa boolean." }, { status: 400 });
    }

    // Gunakan service role key untuk bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Cek apakah baris sudah ada
    const { data: existing } = await supabase
      .from("landing_settings")
      .select("id")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    let error;
    if (existing) {
      // Update baris yang sudah ada
      ({ error } = await supabase
        .from("landing_settings")
        .update({ value: String(enabled) })
        .eq("key", "maintenance_mode"));
    } else {
      // Insert baris baru
      ({ error } = await supabase
        .from("landing_settings")
        .insert({ key: "maintenance_mode", value: String(enabled) }));
    }

    if (error) throw error;

    return NextResponse.json({ success: true, maintenance: enabled });
  } catch (err) {
    console.error("Maintenance mode toggle error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
