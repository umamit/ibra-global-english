import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/utils/supabase/config";
import { checkAdminAuth } from "@/utils/supabase/adminAuth";

const { url: supabaseUrl } = getSupabaseConfig();

// Server-side only: uses service role key to bypass RLS
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key",
  { auth: { persistSession: false } }
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { student_name, student_age, parent_name, parent_email, whatsapp, program } = body;

    // Validasi minimal
    if (!student_name || !whatsapp || !program) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Nama siswa, WhatsApp, dan program wajib diisi." },
        { status: 400 }
      );
    }

    // Validasi nomor WhatsApp minimal 9 digit
    const numericWa = whatsapp.replace(/[^0-9]/g, "");
    if (numericWa.length < 9) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    // Insert ke tabel registrations
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        student_name: student_name.trim(),
        student_age: student_age ? parseInt(student_age) : null,
        parent_name: parent_name ? parent_name.trim() : null,
        parent_email: parent_email ? parent_email.trim() : null,
        whatsapp: numericWa,
        program: program.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Gagal menyimpan pendaftaran:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan pendaftaran. Silakan coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error("Server error saat pendaftaran:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// GET: Ambil semua data pendaftaran (untuk admin)
export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Tidak diizinkan. Hanya admin yang diizinkan." }, { status: 403 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update status pendaftaran (approve/reject)
export async function PATCH(req) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Tidak diizinkan. Hanya admin yang diizinkan." }, { status: 403 });
  }
  try {
    const { id, status, notes } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib diisi." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("registrations")
      .update({ status, notes: notes || null })
      .eq("id", id);

    if (error) throw error;

    // Jika disetujui, auto-insert ke tabel students
    if (status === "approved") {
      const { data: reg, error: fetchError } = await supabaseAdmin
        .from("registrations")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Gagal mengambil data pendaftaran:", fetchError);
        return NextResponse.json(
          { 
            success: false, 
            error: "Gagal mengambil data pendaftaran untuk insert siswa.",
            details: fetchError.message 
          },
          { status: 500 }
        );
      }

      if (reg) {
        // Validasi data sebelum insert
        if (!reg.student_name || !reg.program) {
          return NextResponse.json(
            { 
              success: false, 
              error: "Data pendaftaran tidak lengkap. Nama siswa dan program harus diisi." 
            },
            { status: 400 }
          );
        }

        // Validasi program sesuai constraint database
        const validPrograms = ['Kids Program', 'Teens Program', 'Fun Calistung'];
        if (!validPrograms.includes(reg.program)) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Program "${reg.program}" tidak valid. Program harus salah satu dari: ${validPrograms.join(', ')}.` 
            },
            { status: 400 }
          );
        }

        const validAge = reg.student_age && reg.student_age > 0 ? reg.student_age : 5;

        const { data: studentData, error: insertError } = await supabaseAdmin
          .from("students")
          .insert({
            name: reg.student_name.trim(),
            age: validAge,
            program: reg.program.trim(),
            parent_id: null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Gagal insert ke tabel students:", insertError);
          return NextResponse.json(
            { 
              success: false, 
              error: "Gagal menambahkan siswa ke database.",
              details: insertError.message,
              hint: "Pastikan program yang dipilih sesuai: Kids Program, Teens Program, atau Fun Calistung"
            },
            { status: 500 }
          );
        }

      }
    }

    return NextResponse.json({ 
      success: true, 
      message: status === "approved" ? "Pendaftaran disetujui dan siswa berhasil ditambahkan ke database." : "Status pendaftaran berhasil diperbarui."
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
