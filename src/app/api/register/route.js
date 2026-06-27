import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { registrationSchema, registrationUpdateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const supabaseAdmin = getAdminSupabase();

export async function POST(req) {
  try {
    const body = await req.json();
    const validation = registrationSchema.safeParse(body);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json(
        { error: `Data tidak valid: ${errorMessages}` },
        { status: 400 }
      );
    }

    const { student_name, student_age, parent_name, parent_email, whatsapp, program } = validation.data;

    // Insert ke tabel registrations
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        student_name,
        student_age: student_age || null,
        parent_name: parent_name || null,
        parent_email: parent_email || null,
        whatsapp,
        program,
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
export const GET = withAdminAuth(async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data pendaftaran:", error);
      return NextResponse.json(
        {
          error: "Gagal memuat data pendaftaran dari database.",
          details: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("Server error saat mengambil pendaftaran:", err);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan server saat memuat pendaftaran.",
        details: err.message,
      },
      { status: 500 }
    );
  }
});

// PATCH: Update status pendaftaran (approve/reject)
export const PATCH = withAdminAuth(async (req) => {
  try {
    const body = await req.json();
    const patchValidation = registrationUpdateSchema.safeParse(body);

    if (!patchValidation.success) {
      const errorMessages = patchValidation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json({ error: `Data tidak valid: ${errorMessages}` }, { status: 400 });
    }

    const { id, status, notes } = patchValidation.data;

    // 1. Dapatkan data pendaftaran terlebih dahulu
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
          error: "Gagal mengambil data pendaftaran untuk memproses persetujuan.",
          details: fetchError.message 
        },
        { status: 500 }
      );
    }

    // 2. Jika disetujui, auto-insert ke tabel students terlebih dahulu sebelum mengubah status registrations
    if (status === "approved") {
      if (!reg.student_name || !reg.program) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Data pendaftaran tidak lengkap. Nama siswa dan program harus diisi." 
          },
          { status: 400 }
        );
      }

      // Normalisasi program (buang suffix usia seperti " (5-12 tahun)" jika ada)
      let normalizedProgram = reg.program.trim();
      if (normalizedProgram.startsWith("Kids Program")) {
        normalizedProgram = "Kids Program";
      } else if (normalizedProgram.startsWith("Teens Program")) {
        normalizedProgram = "Teens Program";
      } else if (normalizedProgram.startsWith("Fun Calistung")) {
        normalizedProgram = "Fun Calistung";
      }

      // Validasi program sesuai constraint database
      const validPrograms = ['Kids Program', 'Teens Program', 'Fun Calistung'];
      if (!validPrograms.includes(normalizedProgram)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Program "${reg.program}" tidak valid. Program harus mengandung salah satu dari: ${validPrograms.join(', ')}.` 
          },
          { status: 400 }
        );
      }

      const validAge = reg.student_age && reg.student_age > 0 ? reg.student_age : 5;

      // Cek duplikasi siswa sebelum memasukkan data baru
      const { data: existingStudent, error: checkExistError } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq("name", reg.student_name.trim())
        .eq("program", normalizedProgram)
        .maybeSingle();

      if (checkExistError) {
        console.error("Gagal memeriksa duplikasi siswa:", checkExistError);
      }

      if (!existingStudent) {
        const { error: insertError } = await supabaseAdmin
          .from("students")
          .insert({
            name: reg.student_name.trim(),
            age: validAge,
            program: normalizedProgram,
            parent_id: null,
          });

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

    // 3. Update status di database registrations atau HAPUS jika ditolak (reject)
    if (status === "rejected") {
      const { error: deleteError } = await supabaseAdmin
        .from("registrations")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return NextResponse.json({ 
        success: true, 
        message: "Pendaftaran berhasil ditolak dan dihapus dari database."
      }, { status: 200 });
    } else {
      const { error: updateError } = await supabaseAdmin
        .from("registrations")
        .update({ status, notes: notes || null })
        .eq("id", id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        message: "Pendaftaran disetujui dan siswa berhasil ditambahkan ke database."
      }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
