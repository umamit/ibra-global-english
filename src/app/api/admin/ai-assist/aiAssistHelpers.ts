import { getAdminSupabase } from "@/app/api/_middleware";

const adminSupabase = getAdminSupabase();

export async function logAiUsage(userId: any, email: any, role: any, mode: any, tokensUsed: any, status: any, errorMessage: any = null) {
  try {
    const { error } = await adminSupabase.from("ai_usage_logs").insert({
      user_id: userId || null,
      email: email || null,
      role: role || null,
      mode: mode,
      tokens_used: tokensUsed || null,
      status: status,
      error_message: errorMessage || null
    });
    if (error) {
      console.warn("Failed to write to ai_usage_logs table (make sure migrations are run):", error.message);
    }
  } catch (e: any) {
    console.warn("Error inserting AI log:", e.message);
  }
}

export function getSyllabusTopic(program: any, moduleName: any) {
  if (!moduleName) return "";
  const nameLower = moduleName.toLowerCase();
  
  if (program?.toLowerCase()?.includes("calistung")) {
    if (nameLower.includes("1") || nameLower.includes("huruf") || nameLower.includes("abjad") || nameLower.includes("phonics") || nameLower.includes("fonik")) {
      return "Pengenalan Huruf A-Z & Bunyi Fonik dasar";
    }
    if (nameLower.includes("2") || nameLower.includes("suku kata") || nameLower.includes("membaca")) {
      return "Membaca Suku Kata Terbuka (ba, bi, bu, be, bo)";
    }
    if (nameLower.includes("3") || nameLower.includes("kata dasar") || nameLower.includes("kalimat")) {
      return "Membaca Kata Dasar & Kalimat Pendek";
    }
    if (nameLower.includes("4") || nameLower.includes("menulis")) {
      return "Menulis Huruf Abjad & Angka Dasar (1-20)";
    }
    if (nameLower.includes("5") || nameLower.includes("tambah") || nameLower.includes("penjumlahan")) {
      return "Berhitung Dasar - Penjumlahan Sederhana (1-10)";
    }
    if (nameLower.includes("6") || nameLower.includes("kurang") || nameLower.includes("pengurangan")) {
      return "Berhitung Dasar - Pengurangan Sederhana (1-10)";
    }
    return "Membaca, menulis, atau berhitung dasar sesuai dengan tingkat usianya";
  } else {
    if (program?.toLowerCase()?.includes("kids")) {
      if (nameLower.includes("1") || nameLower.includes("intro") || nameLower.includes("greeting")) {
        return "Self Introduction & Greetings (Perkenalan diri & Salam)";
      }
      if (nameLower.includes("2") || nameLower.includes("family") || nameLower.includes("keluarga")) {
        return "Family Members (Anggota Keluarga)";
      }
      if (nameLower.includes("3") || nameLower.includes("animal") || nameLower.includes("color") || nameLower.includes("hewan")) {
        return "Animals & Colors Vocabulary (Kosa kata Hewan & Warna)";
      }
      if (nameLower.includes("4") || nameLower.includes("daily") || nameLower.includes("activity") || nameLower.includes("rutinitas")) {
        return "Daily Activities & Simple Present Tense (Aktivitas Harian)";
      }
      if (nameLower.includes("5") || nameLower.includes("place") || nameLower.includes("preposition") || nameLower.includes("tempat")) {
        return "Public Places & Prepositions (Tempat Umum & Kata Depan)";
      }
      if (nameLower.includes("6") || nameLower.includes("number") || nameLower.includes("shopping") || nameLower.includes("belanja")) {
        return "Numbers & Simple Shopping (Angka & Percakapan Belanja)";
      }
    } else {
      if (nameLower.includes("1") || nameLower.includes("presentation") || nameLower.includes("interest")) {
        return "Self Presentation & Interests (Presentasi diri & Hobi)";
      }
      if (nameLower.includes("2") || nameLower.includes("describe") || nameLower.includes("description") || nameLower.includes("deskripsi")) {
        return "Describing People, Places, and Objects (Mendeskripsikan Orang/Tempat)";
      }
      if (nameLower.includes("3") || nameLower.includes("past") || nameLower.includes("recount") || nameLower.includes("lampau")) {
        return "Simple Past Tense & Personal Recounts (Masa Lampau & Cerita Pengalaman)";
      }
      if (nameLower.includes("4") || nameLower.includes("opinion") || nameLower.includes("diskusi") || nameLower.includes("pendapat")) {
        return "Asking & Giving Opinions (Meminta & Memberi Pendapat)";
      }
      if (nameLower.includes("5") || nameLower.includes("plan") || nameLower.includes("future") || nameLower.includes("rencana")) {
        return "Future Plans & Expressing Intentions (Rencana Masa Depan)";
      }
      if (nameLower.includes("6") || nameLower.includes("modal") || nameLower.includes("conditional") || nameLower.includes("pengandaian")) {
        return "Modal Auxiliaries & Conditional Sentences (Kata Kerja Bantu & Kalimat Pengandaian)";
      }
    }
    return "Percakapan, tata bahasa, dan kosa kata bahasa Inggris";
  }
}

export async function getRealtimeDatabaseContext() {
  try {
    const { data: studentsList } = await adminSupabase
      .from("students")
      .select("id, name, program, parent_id, profiles:parent_id(full_name)");
    
    const { data: attendanceData } = await adminSupabase
      .from("attendance")
      .select("student_id, status");
      
    const { data: paymentData } = await adminSupabase
      .from("tuition_payments")
      .select("student_id, month, status, amount");
      
    const totalStudents = studentsList?.length || 0;
    
    const studentDetailedList = (studentsList || []).map(s => {
      const studentAtt = (attendanceData || []).filter(a => a.student_id === s.id);
      const totalAtt = studentAtt.length;
      const presentCount = studentAtt.filter(a => a.status === "hadir").length;
      const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;
      
      const parentName = s.profiles && !Array.isArray(s.profiles) ? (s.profiles as any).full_name : "-";
      
      const studentPayments = (paymentData || []).filter(p => p.student_id === s.id);
      const unpaidMonths = studentPayments
        .filter(p => p.status === "belum_bayar")
        .map(p => p.month)
        .join(", ");
        
      const pendingMonths = studentPayments
        .filter(p => p.status === "menunggu_konfirmasi")
        .map(p => p.month)
        .join(", ");
        
      return `- Nama: ${s.name} | Program: ${s.program} | Orang Tua: ${parentName} | Kehadiran: ${attRate}% | Belum Bayar SPP: [${unpaidMonths || "Nihil"}] | Menunggu Konfirmasi: [${pendingMonths || "Nihil"}]`;
    }).join("\n");
    
    return `
[DATA RIIL LIVE DATABASE SISWA & KEUANGAN SAAT INI]
Total Siswa Aktif: ${totalStudents} orang

Rincian Detail Siswa & Status Pembayaran/Kehadiran:
${studentDetailedList}

(PENTING: Gunakan data di atas untuk menjawab secara akurat jika admin/tutor bertanya secara detail mengenai performa absen siswa tertentu atau siapa saja yang menunggak SPP pada bulan-bulan tertentu!)
`;
  } catch (err) {
    console.error("Gagal memuat konteks database riil:", err);
    return "";
  }
}
