import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { detectPromptInjection } from "@/utils/security";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const adminSupabase = getAdminSupabase();
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

// Logger penggunaan AI ke dalam database
async function logAiUsage(userId, email, role, mode, tokensUsed, status, errorMessage = null) {
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
  } catch (e) {
    console.warn("Error inserting AI log:", e.message);
  }
}

// Pemetaan silabus modular lembaga
function getSyllabusTopic(program, moduleName) {
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
    const { data: studentsList } = await adminSupabase.from("students").select("name, program");
    const { data: attendanceData } = await adminSupabase.from("attendance").select("status");
    const { data: paymentData } = await adminSupabase.from("tuition_payments").select("status");
    
    const totalStudents = studentsList?.length || 0;
    const studentNames = studentsList?.map(s => `- ${s.name} (${s.program})`).join("\n") || "Belum ada siswa.";
    
    const totalAtt = attendanceData?.length || 0;
    const presentCount = attendanceData?.filter(a => a.status === "hadir")?.length || 0;
    const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;
    
    const paidCount = paymentData?.filter(p => p.status === "lunas")?.length || 0;
    const unpaidCount = paymentData?.filter(p => p.status === "belum_bayar")?.length || 0;
    const pendingCount = paymentData?.filter(p => p.status === "menunggu_konfirmasi")?.length || 0;
    
    return `
[DATA RIIL LEMBAGA SAAT INI (DATABASE LIVE CONTEXT)]
- Total Siswa Aktif: ${totalStudents} orang
- Daftar Siswa & Programnya:
${studentNames}
- Persentase Kehadiran Kelas Kumulatif: ${attendanceRate}% hadir
- Status SPP Bulan Ini: ${paidCount} lunas, ${pendingCount} menunggu konfirmasi admin, ${unpaidCount} belum bayar.
(Gunakan data riil live ini secara spesifik untuk menjawab jika tutor atau admin bertanya mengenai jumlah siswa, status SPP, absensi, atau daftar nama mereka!)
`;
  } catch (err) {
    console.error("Gagal memuat konteks database riil:", err);
    return "";
  }
}

export async function POST(request) {
  let modeForLog = "unknown";
  let authUser = { id: null, email: null, role: null };
  
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
    const { mode, payload, messages } = body;
    modeForLog = mode || "unknown";

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

Berikan analisis performa operasional saat ini dalam Bahasa Indonesia yang singkat dan padat (maksimal 3 poin bullet ulasan utama, dan 1 poin saran tindakan taktis yang jelas). Gunakan format HTML paragraf atau bullet biasa.`;
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

    // Prepare messages for Groq API
    let formattedMessages = [];
    if (mode === "chat" && messages && Array.isArray(messages)) {
      formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))
      ];
    } else {
      formattedMessages = [
        { role: "system", content: systemPrompt },
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
        max_tokens: 800,
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
  } catch (err) {
    console.error("Admin Assist API error:", err);
    await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, 0, "failed", err.message);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server AI." }, { status: 500 });
  }
}
