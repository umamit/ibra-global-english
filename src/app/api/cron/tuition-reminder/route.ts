import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";
import { sendBulkWhatsappMessages } from "@/app/api/whatsapp-simulator/whatsappHelpers";

export async function GET() {
  return handleTuitionReminders();
}

export async function POST() {
  return handleTuitionReminders();
}

async function handleTuitionReminders() {
  try {
    const supabase = getAdminSupabase();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthNameIndo = monthNames[now.getMonth()];

    // 1. Ambil data seluruh siswa aktif & profil orang tua
    const { data: students, error: studentErr } = await supabase
      .from("students")
      .select("id, name, program, parent_id, profiles:parent_id ( full_name, phone )");

    if (studentErr) throw studentErr;
    if (!students || students.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada data siswa.", remindedCount: 0 });
    }

    // 2. Ambil status SPP bulan ini
    const { data: payments } = await supabase
      .from("tuition_payments")
      .select("student_id, status")
      .eq("month", currentMonth);

    const verifiedStudentIds = new Set(
      (payments || [])
        .filter((p: { status: string }) => p.status === "verified")
        .map((p: { student_id: string }) => p.student_id)
    );

    // 3. Saring siswa yang belum bayar/verifikasi
    const unverifiedStudents = students.filter((s: { id: string }) => !verifiedStudentIds.has(s.id));

    if (unverifiedStudents.length === 0) {
      return NextResponse.json({ success: true, message: "Seluruh siswa telah melunasi SPP bulan ini.", remindedCount: 0 });
    }

    let remindedCount = 0;
    const results: Array<{ studentName: string; parentPhone: string; status: string }> = [];

    for (const student of unverifiedStudents) {
      const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
      const phone = profile?.phone || "";
      const parentName = profile?.full_name || "Orang Tua";

      if (!phone || phone.trim().length < 9) continue;

      const message = `Yth. Bapak/Ibu ${parentName},\n\nSalam dari *Ibra Global English Bobong*.\n\nKami menginformasikan bahwa tagihan SPP untuk ananda *${student.name}* (${student.program}) periode bulan *${monthNameIndo} ${now.getFullYear()}* saat ini dalam status jatuh tempo.\n\nMohon dapat melakukan pembayaran melalui Transfer Bank Mandiri dan mengunggah bukti pembayaran di Portal Orang Tua (https://www.ibraglobalenglish.uk/parent).\n\nTerima kasih atas kerja sama Bapak/Ibu.`;

      const sendRes = await sendBulkWhatsappMessages(phone, message, "tuition-reminder");
      remindedCount++;
      results.push({ studentName: student.name, parentPhone: phone, status: sendRes.success ? "Sent" : "Failed" });
    }

    return NextResponse.json({
      success: true,
      currentMonth,
      totalUnpaid: unverifiedStudents.length,
      remindedCount,
      details: results,
    });
  } catch (err: unknown) {
    console.error("Gagal menjalankan pengingat SPP otomatis:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
