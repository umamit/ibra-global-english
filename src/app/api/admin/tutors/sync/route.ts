import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch tutor/admin profiles
    const { data: profs, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["tutor", "admin", "teacher"]);

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    const { data: existingTutors } = await supabase.from("tutors").select("name");
    const existingNames = (existingTutors || []).map((t) => (t.name || "").toLowerCase());

    let insertedCount = 0;

    for (const p of profs || []) {
      const name = p.full_name || p.email || "";
      if (!name) continue;

      const nameClean = name.split("(")[0].trim();
      const isAlreadyAdded = existingNames.some((n) => n.includes(nameClean.toLowerCase()));

      if (!isAlreadyAdded) {
        const roleLabel =
          p.role === "admin"
            ? "Admin Keuangan & Staf Pendidikan"
            : "Tutor / Pengajar";

        await supabase.from("tutors").insert({
          name: nameClean,
          role: roleLabel,
          bio: "",
          image_url: "",
          display_order: 1,
          is_active: true,
        });

        insertedCount++;
      }
    }

    return NextResponse.json({ success: true, insertedCount });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
