import { getAdminSupabase } from "@/app/api/_middleware";
import { logActivity } from "@/utils/auditLogger";

const supabaseAdmin = getAdminSupabase();

export async function processStudentApproval(reg: any) {
  if (!reg.student_name || !reg.program) {
    return { success: false, error: "Data pendaftaran tidak lengkap. Nama siswa dan program harus diisi.", status: 400 };
  }

  let normalizedProgram = reg.program.trim();
  if (normalizedProgram.startsWith("Kids Program")) normalizedProgram = "Kids Program";
  else if (normalizedProgram.startsWith("Teens Program")) normalizedProgram = "Teens Program";
  else if (normalizedProgram.startsWith("Fun Calistung")) normalizedProgram = "Fun Calistung";

  const validPrograms = ["Kids Program", "Teens Program", "Fun Calistung"];
  if (!validPrograms.includes(normalizedProgram)) {
    return { success: false, error: `Program "${reg.program}" tidak valid. Harus salah satu dari: ${validPrograms.join(", ")}.`, status: 400 };
  }

  const validAge = reg.student_age && reg.student_age > 0 ? reg.student_age : 5;

  const { data: existingStudent, error: checkExistError } = await supabaseAdmin
    .from("students")
    .select("id")
    .eq("name", reg.student_name.trim())
    .eq("program", normalizedProgram)
    .maybeSingle();

  if (checkExistError) console.error("Gagal memeriksa duplikasi siswa:", checkExistError);

  if (!existingStudent) {
    const { error: insertError } = await supabaseAdmin
      .from("students")
      .insert({ name: reg.student_name.trim(), age: validAge, program: normalizedProgram, parent_id: null });

    if (insertError) {
      return { success: false, error: "Gagal menambahkan siswa ke database.", details: insertError.message, status: 500 };
    }
  }
  return { success: true, status: 200 };
}

export interface ProcessUpdateResult {
  success: boolean;
  error?: string;
  details?: string;
  message?: string;
  status: number;
}

export async function processRegistrationStatusUpdate(id: string | number, status: string, notes?: string | null): Promise<ProcessUpdateResult> {
  const { data: reg, error: fetchError } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !reg) {
    return { success: false, error: "Gagal mengambil data pendaftaran.", details: fetchError?.message, status: 500 };
  }

  if (status === "approved") {
    const approvalRes = await processStudentApproval(reg);
    if (!approvalRes.success) return approvalRes;
  }

  if (status === "rejected") {
    const { error: deleteError } = await supabaseAdmin.from("registrations").delete().eq("id", id);
    if (deleteError) throw deleteError;
    await logActivity("Tolak Pendaftaran", `Menolak & menghapus pendaftaran siswa: ${reg.student_name} (Program: ${reg.program})`);
    return { success: true, message: "Pendaftaran berhasil ditolak dan dihapus dari database.", status: 200 };
  } else {
    const { error: updateError } = await supabaseAdmin.from("registrations").update({ status, notes: notes !== undefined ? notes : reg.notes }).eq("id", id);
    if (updateError) throw updateError;
    await logActivity("Setujui Pendaftaran", `Menyetujui pendaftaran siswa: ${reg.student_name} (Program: ${reg.program})`);
    return { success: true, message: "Pendaftaran disetujui dan siswa berhasil ditambahkan ke database.", status: 200 };
  }
}
