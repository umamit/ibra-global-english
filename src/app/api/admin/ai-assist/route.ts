import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { detectPromptInjection } from "@/utils/security";
import { getAdminOrTutorUser } from "@/utils/supabase/adminAuth";
import { getRagContext } from "@/utils/rag";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const adminSupabase = getAdminSupabase();

// Logger penggunaan AI ke dalam database
async function logAiUsage(userId: any, email: any, role: any, mode: any, tokensUsed: any, status: any, errorMessage: any = null) {
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

// Pemetaan silabus modular lembaga
function getSyllabusTopic(program: any, moduleName: any) {
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
    // English programs (Kids / Teens)
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
      // Teens
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

// Mengambil ringkasan data riil Supabase untuk basis pengetahuan Copilot
async function getRealtimeDatabaseContext() {
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

export async function POST(request: any) {
  let modeForLog = "unknown";
  let authUser: any = { id: null, email: null, role: null };
  
  try {
    const currentUser = await getAdminOrTutorUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Tidak diizinkan. Hanya Admin/Tutor." }, { status: 403 });
    }
    authUser = currentUser;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "API Key Groq belum dikonfigurasi." }, { status: 500 });
    }

    const body = await request.json();
    const { mode: rawMode, payload, messages } = body;
    const mode = rawMode || "chat";
    modeForLog = mode;

    // 1. Validasi Keamanan: Deteksi Prompt Injection
    let isMalicious = false;
    if (mode === "chat" && messages && Array.isArray(messages) && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]?.content;
      if (detectPromptInjection(lastMsg)) isMalicious = true;
    } else if (payload) {
      const payloadString = JSON.stringify(payload);
      if (detectPromptInjection(payloadString)) isMalicious = true;
    }

    if (isMalicious) {
      await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, 0, "failed", "Prompt Injection Blocked");
      return NextResponse.json({ error: "Aktivitas mencurigakan terdeteksi. Silakan gunakan bahasa yang wajar." }, { status: 400 });
    }

    let systemPrompt = "Kamu adalah asisten AI administrasi cerdas untuk Ibra Global English Bobong.";
    let userPrompt = "";

    // 2. MODE: AUTO-DRAFT (Pembuat Catatan Ulasan Rapor)
    if (mode === "auto-draft") {
      const { name, program, speaking, grammar, vocabulary, active, module_name } = payload || {};
      const isCalistung = program?.toLowerCase()?.includes("calistung");
      const syllabusTopic = getSyllabusTopic(program, module_name);

      if (isCalistung) {
        systemPrompt = `Kamu adalah asisten AI tutor bimbingan belajar Calistung (Membaca, Menulis, Berhitung) di Ibra Global English Bobong. Tugasmu adalah menulis catatan kemajuan belajar membaca, menulis, dan berhitung dasar yang profesional, memotivasi, dan konstruktif (maksimal 2 kalimat pendek) untuk siswa. Catatan ditulis dalam Bahasa Indonesia yang ramah, sopan, dan hangat untuk orang tua siswa.`;
        userPrompt = `Buat ulasan rapor untuk siswa:
Nama Siswa: ${name || "Siswa"}
Program Belajar: ${program || "Fun Calistung"}
Nilai Kompetensi Calistung:
- Membaca: ${speaking || 80}
- Menulis: ${grammar || 80}
- Berhitung: ${vocabulary || 80}
- Keaktifan di Kelas: ${active || 80}
${module_name ? `- Modul Belajar: ${module_name}` : ""}
${syllabusTopic ? `- Materi Silabus: ${syllabusTopic}` : ""}

PENTING: Program belajar siswa adalah Calistung (Membaca, Menulis, Berhitung dasar). DILARANG KERAS menyebutkan kata "Bahasa Inggris", "English", "speaking", "grammar", atau "vocabulary" dalam ulasan ini. Fokus pada perkembangan kelancaran membaca, menulis huruf/kata, berhitung dasar, serta keaktifan mereka di kelas. Tulis masukan yang konkret, spesifik, dan memotivasi berdasarkan data nilai di atas dan materi silabus pokok yang dipelajari. Jangan buat poin-poin, langsung tulis dalam 1-2 kalimat paragraf mengalir.`;
      } else {
        systemPrompt = `Kamu adalah asisten AI tutor bahasa Inggris di Ibra Global English Bobong. Tugasmu adalah menulis catatan kemajuan belajar bahasa Inggris yang profesional, memotivasi, dan konstruktif (maksimal 2 kalimat pendek) untuk siswa. Catatan ditulis dalam Bahasa Indonesia yang ramah, sopan, dan hangat untuk orang tua siswa.`;
        userPrompt = `Buat ulasan rapor untuk siswa:
Nama Siswa: ${name || "Siswa"}
Program Belajar: ${program || "General English"}
Nilai Kompetensi Bahasa Inggris:
- Speaking: ${speaking || 80}
- Grammar: ${grammar || 80}
- Vocabulary: ${vocabulary || 80}
- Keaktifan di Kelas: ${active || 80}
${module_name ? `- Modul Belajar: ${module_name}` : ""}
${syllabusTopic ? `- Materi Silabus: ${syllabusTopic}` : ""}

PENTING: Program belajar siswa adalah kursus Bahasa Inggris. Fokus ulasan harus pada kemampuan berbicara (speaking), pemahaman tata bahasa (grammar), kosakata (vocabulary) bahasa Inggris, serta keaktifan mereka dalam menggunakan Bahasa Inggris di kelas. Tulis masukan yang konkret, spesifik, dan memotivasi berdasarkan data nilai di atas dan materi silabus pokok yang dipelajari. Jangan buat poin-poin, langsung tulis dalam 1-2 kalimat paragraf mengalir.`;
      }
    } 
    // 3. MODE: ANNOUNCEMENT-POLISH (Pemoles Pengumuman)
    else if (mode === "announcement-polish") {
      const { title, content } = payload || {};
      systemPrompt = `Kamu adalah asisten hubungan masyarakat profesional di Ibra Global English Bobong. Tugasmu adalah memoles draf judul dan isi pengumuman kasar agar terdengar rapi, menarik, ramah, dan bebas dari typo.`;
      userPrompt = `Berikut adalah draf kasar pengumuman:
Judul Kasar: ${title || ""}
Isi Kasar: ${content || ""}

Poles draf di atas menjadi lebih terstruktur dengan tata bahasa yang baik. Format outputnya harus persis seperti ini:
JUDUL: [Judul baru yang menarik dan profesional]
---
[Isi pengumuman yang rapi, ramah, dan jelas menggunakan spasi paragraf yang pas. Gunakan emoji secukupnya agar menarik]`;
    } 
    // 3a. MODE: PLACEMENT-TEST-EVALUATION (Tindak Lanjut Tes Penempatan)
    else if (mode === "placement-test-evaluation") {
      const { name, score, level, course } = payload || {};
      systemPrompt = `Kamu adalah asisten penerimaan siswa baru AI (Student Admission Assistant) di Ibra Global English Bobong. Tugasmu adalah menyusun pesan follow-up WhatsApp yang profesional, hangat, ramah, dan persuasif untuk calon siswa baru yang baru saja menyelesaikan tes penempatan level (Placement Test) online.`;
      userPrompt = `Buat draf pesan tindak lanjut WhatsApp personal untuk calon siswa:
Nama Calon Siswa: ${name || "Siswa"}
Skor Ujian: ${score || 0} / 20
Level Hasil Tes: ${level || "Beginner"}
Rekomendasi Kelas/Program: ${course || "Kids Program"}

Pesan harus terstruktur dengan baik:
1. Sapaan hangat dan ucapan selamat atas penyelesaian tes.
2. Analisis singkat yang menyemangati tentang tingkat level mereka (${level}) dengan skor ${score}/20, serta apa manfaat dan keseruan program kelas (${course}) di Ibra Global English Bobong untuk tingkat mereka.
3. Ajakan/CTA yang sopan untuk berkonsultasi mengenai penawaran biaya khusus, jadwal kelas, atau trial gratis.
4. Gunakan gaya bahasa yang ramah (gunakan sapaan 'Kak [Nama]' untuk nuansa yang ramah dan dekat) serta tambahkan emoji yang relevan. Jangan terlalu kaku, tetapi tetap sopan. Tulis langsung sebagai draf siap kirim tanpa teks pembuka/penutup asisten.`;
    }
    // 3b. MODE: FINANCE-PROJECTION (Analisis Keuangan Proyektif)
    else if (mode === "finance-projection") {
      if (authUser.role !== "admin") {
        return NextResponse.json({ error: "Hanya Admin yang dapat mengakses Analisis Keuangan." }, { status: 403 });
      }
      const { selectedMonth, activeExpected, activeCollected, outstanding, collectionRate, activePaidCount, activeUnpaidCount, chartData, programBreakdown } = payload || {};
      systemPrompt = `Kamu adalah asisten analis keuangan AI (Financial Analyst Assistant) di Ibra Global English Bobong. Tugasmu adalah memberikan evaluasi taktis, ringkas, dan jelas tentang kinerja keuangan, tingkat kolektabilitas SPP bulan berjalan, serta proyeksi jangka pendek berdasarkan metrik keuangan riil yang diberikan.`;
      userPrompt = `Berikan analisis taktis untuk bulan ${selectedMonth || "berjalan"} berdasarkan data berikut:
- Target Pendapatan SPP (Expected): ${activeExpected || 0}
- Realisasi Pendapatan (Collected): ${activeCollected || 0}
- Tunggakan SPP (Outstanding): ${outstanding || 0}
- Rasio Kolektabilitas (Collection Rate): ${collectionRate || 0}%
- Jumlah Siswa Lunas: ${activePaidCount || 0} siswa
- Jumlah Siswa Belum Bayar: ${activeUnpaidCount || 0} siswa
- Distribusi Program: ${JSON.stringify(programBreakdown || [])}
- Riwayat Tren Pendapatan 6 Bulan Terakhir: ${JSON.stringify(chartData || [])}

Tulis analisis keuangan dalam format Bahasa Indonesia yang jelas, profesional, dan to-the-point dalam 3 bagian singkat (gunakan markdown):
1. **Analisis Kolektabilitas Bulan Berjalan**: Evaluasi singkat mengenai persentase kolektabilitas saat ini (${collectionRate}%). Apakah berkinerja baik atau butuh perhatian ekstra?
2. **Proyeksi Keuangan 30 Hari Ke depan**: Perkiraan nominal sisa SPP yang bisa dikumpulkan beserta program studi mana yang memberikan kontribusi terbesar atau terkecil.
3. **2 Tindakan Taktis Admin**: Dua poin rekomendasi operasional konkret untuk admin keuangan (misalnya strategi WhatsApp billing atau intensitas penagihan tunggakan). Jangan bertele-tele, langsung berikan 3 bagian tersebut.`;
    }
    // 4. MODE: INSIGHTS (Analisis Dasbor Ringkasan)
    else if (mode === "insights") {
      if (authUser.role !== "admin") {
        return NextResponse.json({ error: "Hanya Admin yang dapat melihat Insights." }, { status: 403 });
      }

      // Check Cache first if forceRefresh is not true
      const { forceRefresh } = body;
      if (!forceRefresh) {
        const { data: cachedRow, error: cacheErr } = await adminSupabase
          .from("landing_settings")
          .select("value, updated_at")
          .eq("key", "ai_insights_cache")
          .maybeSingle();

        if (!cacheErr && cachedRow) {
          try {
            const cacheData = JSON.parse(cachedRow.value);
            const cacheAge = Date.now() - new Date(cachedRow.updated_at).getTime();
            const twelveHours = 12 * 60 * 60 * 1000;
            
            if (cacheAge < twelveHours && cacheData.reply) {
              return NextResponse.json({ reply: cacheData.reply, cached: true });
            }
          } catch (e) {
            console.error("Gagal mengurai cache AI Insights:", e);
          }
        }
      }

      // Fetch dynamic stats from database to provide actual insights
      const { count: studentCount } = await adminSupabase.from("students").select("*", { count: "exact", head: true });
      const { data: attendanceData } = await adminSupabase.from("attendance").select("status");
      const { data: paymentData } = await adminSupabase.from("tuition_payments").select("status");

      // Process stats
      const totalStudents = studentCount || 0;
      
      const totalAtt = attendanceData?.length || 0;
      const presentCount = attendanceData?.filter(a => a.status === "hadir")?.length || 0;
      const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

      const paidCount = paymentData?.filter(p => p.status === "lunas")?.length || 0;
      const unpaidCount = paymentData?.filter(p => p.status === "belum_bayar")?.length || 0;
      const pendingCount = paymentData?.filter(p => p.status === "menunggu_konfirmasi")?.length || 0;

      systemPrompt = `Kamu adalah konsultan manajemen pendidikan profesional di Ibra Global English Bobong. Tugasmu adalah memberikan ulasan analisis taktis singkat dan 1 saran konkret mengenai operasional lembaga berdasarkan data statistik terkini.`;
      userPrompt = `Berikut adalah data statistik lembaga saat ini:
- Total Siswa Aktif: ${totalStudents} orang
- Persentase Kehadiran Kumulatif: ${attendanceRate}% hadir dari total catatan presensi
- Status SPP: ${paidCount} lunas, ${pendingCount} menunggu konfirmasi admin, ${unpaidCount} belum bayar.

Berikan analisis performa operasional saat ini dalam Bahasa Indonesia yang singkat dan padat (maksimal 3 poin bullet ulasan utama, dan 1 poin saran tindakan taktis yang jelas). Gunakan format teks biasa dengan baris baru (newline) dan gunakan tanda minus (-) untuk poin bullet. DILARANG KERAS menggunakan tag HTML seperti <p>, <ul>, <li>, atau format HTML lainnya.`;
    } 
    // 4a. MODE: CALENDAR-DRAFT (Penyusun Jadwal AI)
    else if (mode === "calendar-draft") {
      const { prompt: promptText } = payload || {};
      systemPrompt = `Kamu adalah AI Calendar Scheduler untuk Ibra Global English Bobong.
Tugasmu adalah membaca instruksi penjadwalan bahasa manusia bebas dari user, lalu mengubahnya menjadi daftar jadwal kelas/kegiatan terstruktur dalam format JSON array.

Tipe program yang sah:
- "Kids Program" (untuk Level 1 sampai 5)
- "Teens Program" (untuk Teen)
- "Fun Calistung" (untuk Calistung A, B, C)
- "All" (untuk kelas kosong/cadangan/event umum)

Tipe agenda yang sah:
- "class" (Kelas Rutin)
- "event" (Kegiatan Khusus)
- "holiday" (Hari Libur)

Aturan Format Output:
- Kamu wajib HANYA mengembalikan data JSON array murni tanpa penjelasan, markdown block, atau pembungkus lain.
- Format objek dalam array:
  {
    "title": "Nama Kelas / Kegiatan",
    "type": "class" | "event" | "holiday",
    "program": "Kids Program" | "Teens Program" | "Fun Calistung" | "All",
    "start_date": "YYYY-MM-DD",
    "start_time": "HH:MM",
    "end_date": "YYYY-MM-DD",
    "end_time": "HH:MM",
    "description": "Rencana Pelaksanaan Pembelajaran (RPP) singkat berisi topik utama kelas dan aktivitas utama (misal: 'Topik: Greetings & Intro. Aktivitas: Latihan roleplay perkenalan diri dan kuis kosakata'). Buat bervariasi dan menarik.",
    "instructor": "Nama Tutor (jika disebutkan, default kosong)"
  }

Contoh Input: "Jadwal Teen di Selasa dan Kamis jam 19.00-20.30 selama 2 minggu mulai tanggal 6 Juli 2026"
Contoh Output:
[
  {
    "title": "Teen",
    "type": "class",
    "program": "Teens Program",
    "start_date": "2026-07-07",
    "start_time": "19:00",
    "end_date": "2026-07-07",
    "end_time": "20:30",
    "description": "Kelas rutin mingguan - Teen",
    "instructor": ""
  },
  {
    "title": "Teen",
    "type": "class",
    "program": "Teens Program",
    "start_date": "2026-07-09",
    "start_time": "19:00",
    "end_date": "2026-07-09",
    "end_time": "20:30",
    "description": "Kelas rutin mingguan - Teen",
    "instructor": ""
  },
  {
    "title": "Teen",
    "type": "class",
    "program": "Teens Program",
    "start_date": "2026-07-14",
    "start_time": "19:00",
    "end_date": "2026-07-14",
    "end_time": "20:30",
    "description": "Kelas rutin mingguan - Teen",
    "instructor": ""
  },
  {
    "title": "Teen",
    "type": "class",
    "program": "Teens Program",
    "start_date": "2026-07-16",
    "start_time": "19:00",
    "end_date": "2026-07-16",
    "end_time": "20:30",
    "description": "Kelas rutin mingguan - Teen",
    "instructor": ""
  }
]`;
    }
    // 4b. MODE: SPP-BILLING-DRAFT (Pembuat Tagihan SPP AI)
    else if (mode === "spp-billing-draft") {
      const { name, program, month, amount, parent_name } = payload || {};
      systemPrompt = `Kamu adalah Asisten AI Keuangan di Ibra Global English Bobong.
Tugasmu adalah menulis draf pesan pengingat tagihan SPP bulanan yang sopan, ramah, dan profesional untuk dikirim via WhatsApp kepada orang tua murid.
Pesan harus memuat detail tagihan secara jelas. Gunakan Bahasa Indonesia yang ramah, sopan, serta sertakan salam penutup yang hangat. Gunakan emoji secukupnya agar pesan terlihat menarik namun tetap profesional.`;
      
      userPrompt = `Buat draf pesan WhatsApp pengingat SPP dengan rincian berikut:
- Nama Orang Tua: ${parent_name || "Bapak/Ibu Orang Tua Murid"}
- Nama Siswa/Anak: ${name || "Siswa"}
- Program Belajar: ${program || "Kids Program"}
- Bulan Tagihan: ${month || "Bulan Berjalan"}
- Nominal SPP: Rp ${amount ? amount.toLocaleString('id-ID') : "300000"}

Pesan harus memuat:
1. Sapaan hangat kepada orang tua.
2. Pemberitahuan pengingat pembayaran SPP untuk bulan terkait dengan nominal yang jelas.
3. Ajakan untuk melakukan pembayaran via transfer bank atau tunai.
4. Instruksi untuk mengirimkan bukti transfer jika membayar secara online.
5. Dilarang keras menggunakan tanda kurung kosong atau placeholder. Langsung tulis pesan utuh yang siap kirim.`;
    }
    // 4c. MODE: PROGRESS-REPORT-DRAFT (Pembuat Laporan Perkembangan Bulanan AI)
    else if (mode === "progress-report-draft") {
      const { name, program, month, focus_areas, achievements, challenges } = payload || {};
      systemPrompt = `Kamu adalah Asisten AI Akademik / Tutor Pendamping di Ibra Global English Bobong.
Tugasmu adalah menyusun laporan perkembangan bulanan (Monthly Progress Report) siswa yang informatif, ramah, profesional, dan membangun untuk dibagikan kepada orang tua murid via WhatsApp atau Rapor Bulanan.`;
      
      userPrompt = `Buat draf laporan perkembangan belajar bulanan untuk siswa:
- Nama Siswa: ${name || "Siswa"}
- Program Belajar: ${program || "General English"}
- Bulan Evaluasi: ${month || "Bulan Berjalan"}
- Fokus Materi Belajar Bulan Ini: ${focus_areas || "Materi harian sesuai silabus"}
- Pencapaian Baik Siswa: ${achievements || "Mengikuti kelas dengan antusias"}
- Tantangan / Hal yang Perlu Ditingkatkan: ${challenges || "Perlu lebih percaya diri saat berbicara"}

Tulis laporan dalam Bahasa Indonesia yang hangat, ramah, dan sopan kepada orang tua murid (gunakan sapaan hangat kepada Ayah/Bunda dari siswa). Laporan harus mengalir lancar dalam 1-2 paragraf pendek dan memotivasi siswa untuk terus belajar di bulan depan.`;
    }
    // 4d. MODE: LETTER-DRAFT (Pembuat Surat Resmi AI)
    else if (mode === "letter-draft") {
      const { instruction, recipient, subject, letter_number } = payload || {};
      systemPrompt = `Kamu adalah Asisten AI Administrasi / Sekretaris Eksekutif di PT. Ibra Global English Bobong.
Tugasmu adalah menyusun draf surat resmi lembaga yang formal, profesional, baku, dan sesuai format surat resmi Indonesia.
Format surat harus lengkap dan terstruktur, tetapi HANYA kembalikan ISI SURATNYA SAJA (mulai dari pembuka, paragraf isi, hingga penutup) dalam format HTML bersih (menggunakan tag <p>, <ul>, <li>, <strong>, dll. tanpa menyertakan Kop Surat, Nomor Surat, Penerima, Perihal, atau tanda tangan di bawah, karena bagian-bagian tersebut sudah diatur secara dinamis oleh sistem UI cetak kami).
Gunakan bahasa resmi (EYD) yang sopan, formal, dan jelas.`;

      userPrompt = `Buat draf surat resmi berdasarkan instruksi berikut:
Instruksi Konten: "${instruction || "Undangan rapat resmi"}"
Penerima: ${recipient || "Pihak Terkait"}
Perihal: ${subject || "Pemberitahuan"}
Nomor Surat: ${letter_number || "-"}

Isi surat harus formal, lengkap, dan langsung siap pakai tanpa placeholder teks yang kosong.`;
    }
    // 5. MODE: CHAT (Asisten Copilot Interaktif)
    else if (mode === "chat") {
      const dbContext = await getRealtimeDatabaseContext();
      systemPrompt = `Kamu adalah **Ibra AI Admin Copilot**, asisten AI internal khusus untuk Administrator dan Tutor di Ibra Global English Bobong.
Tugasmu adalah membantu administrasi harian, memberikan ide materi bimbingan, menyarankan tips mengajar untuk anak-anak (Kids/Calistung), memoles bahasa pengumuman, atau mempermudah tutor menyusun ulasan nilai rapor.

${dbContext}

Jawablah dengan nada yang profesional, cerdas, supportif, dan ramah. Gunakan Bahasa Indonesia.`;
    } else {
      return NextResponse.json({ error: "Mode tidak dikenal." }, { status: 400 });
    }

    // RAG: Retrieve relevant knowledge base context for admin chat mode
    let ragContext = "";
    if (mode === "chat" && messages && Array.isArray(messages) && messages.length > 0) {
      const lastAdminMsg = messages[messages.length - 1]?.content || "";
      try {
        ragContext = await getRagContext(lastAdminMsg, 3);
      } catch (ragErr: any) {
        console.warn("Admin RAG lookup failed (non-blocking):", ragErr.message);
      }
    }

    const systemPromptWithRag = ragContext ? systemPrompt + "\n\n" + ragContext : systemPrompt;

    // Prepare messages for Groq API
    let formattedMessages = [];
    if (mode === "chat" && messages && Array.isArray(messages)) {
      formattedMessages = [
        { role: "system", content: systemPromptWithRag },
        ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))
      ];
    } else {
      formattedMessages = [
        { role: "system", content: systemPromptWithRag },
        { role: "user", content: userPrompt }
      ];
    }

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: formattedMessages,
        temperature: 0.6,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Groq API error on Admin Assist:", data);
      const errMsg = data?.error?.message || "Kesalahan Groq.";
      await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, 0, "failed", errMsg);
      return NextResponse.json({ error: errMsg }, { status: response.status });
    }

    const reply = data?.choices?.[0]?.message?.content;
    const tokensUsed = data?.usage?.total_tokens || 0;
    
    // Log success usage
    await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, tokensUsed, "success");

    // Write to cache if mode was insights
    if (mode === "insights" && reply) {
      try {
        const cachePayload = {
          reply: reply,
          updated_at: new Date().toISOString()
        };
        await adminSupabase.from("landing_settings").upsert({
          key: "ai_insights_cache",
          value: JSON.stringify(cachePayload),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });
      } catch (cacheErr) {
        console.error("Gagal menulis cache AI Insights ke database:", cacheErr);
      }
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Admin Assist API error:", err);
    await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, 0, "failed", err.message);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server AI." }, { status: 500 });
  }
}
