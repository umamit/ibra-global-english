import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, dueDay } = body;

    if (!studentId || typeof dueDay !== "number" || dueDay < 1 || dueDay > 31) {
      return NextResponse.json(
        { error: "ID Siswa dan Tanggal Jatuh Tempo (1-31) wajib diisi." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    const supabase = createClient(supabaseUrl, serviceKey);

    const { error } = await supabase
      .from("students")
      .update({ due_day: dueDay })
      .eq("id", studentId);

    if (error) {
      console.error("Gagal update due_day di API:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, studentId, dueDay });
  } catch (err: any) {
    console.error("Error di update-student-due-day route:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
