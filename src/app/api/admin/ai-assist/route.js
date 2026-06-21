import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/utils/supabase/config";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

const adminSupabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

// Helper untuk memeriksa autentikasi admin atau tutor
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    const role = user?.user_metadata?.role;
    return {
      isAuthenticated: !!user && (role === "admin" || role === "tutor"),
      isAdmin: role === "admin",
      role,
      user
    };
  } catch {
    return { isAuthenticated: false, isAdmin: false };
  }
}

export async function POST(request) {
  try {
    const auth = await checkAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: "Tidak diizinkan. Hanya Admin/Tutor." }, { status: 403 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "API Key Groq belum dikonfigurasi." }, { status: 500 });
    }

    const body = await request.json();
    const { mode, payload, messages } = body;

    let systemPrompt = "Kamu adalah asisten AI administrasi cerdas untuk Ibra Global English Bobong.";
    let userPrompt = "";

    // 1. MODE: AUTO-DRAFT (Pembuat Catatan Ulasan Rapor)
    if (mode === "auto-draft") {
      const { name, program, speaking, grammar, vocabulary, active } = payload || {};
      const isCalistung = program?.toLowerCase()?.includes("calistung");

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

PENTING: Program belajar siswa adalah Calistung (Membaca, Menulis, Berhitung dasar). DILARANG KERAS menyebutkan kata "Bahasa Inggris", "English", "speaking", "grammar", atau "vocabulary" dalam ulasan ini. Fokus pada perkembangan kelancaran membaca, menulis huruf/kata, berhitung dasar, serta keaktifan mereka di kelas. Tulis masukan yang konkret, spesifik, dan memotivasi berdasarkan data nilai di atas. Jangan buat poin-poin, langsung tulis dalam 1-2 kalimat paragraf mengalir.`;
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

PENTING: Program belajar siswa adalah kursus Bahasa Inggris. Fokus ulasan harus pada kemampuan berbicara (speaking), pemahaman tata bahasa (grammar), kosakata (vocabulary) bahasa Inggris, serta keaktifan mereka dalam menggunakan Bahasa Inggris di kelas. Tulis masukan yang konkret, spesifik, dan memotivasi berdasarkan data nilai di atas. Jangan buat poin-poin, langsung tulis dalam 1-2 kalimat paragraf mengalir.`;
      }
    } 
    // 2. MODE: ANNOUNCEMENT-POLISH (Pemoles Pengumuman)
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
    // 3. MODE: INSIGHTS (Analisis Dasbor Ringkasan)
    else if (mode === "insights") {
      if (!auth.isAdmin) {
        return NextResponse.json({ error: "Hanya Admin yang dapat melihat Insights." }, { status: 403 });
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

      const totalPayments = paymentData?.length || 0;
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
    // 4. MODE: CHAT (Asisten Copilot Interaktif)
    else if (mode === "chat") {
      systemPrompt = `Kamu adalah **Ibra AI Admin Copilot**, asisten AI internal khusus untuk Administrator dan Tutor di Ibra Global English Bobong.
Tugasmu adalah membantu administrasi harian, memberikan ide materi bimbingan, menyarankan tips mengajar untuk anak-anak (Kids/Calistung), memoles bahasa pengumuman, atau mempermudah tutor menyusun ulasan nilai rapor.
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
      return NextResponse.json({ error: data?.error?.message || "Kesalahan Groq." }, { status: response.status });
    }

    const reply = data?.choices?.[0]?.message?.content;
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Admin Assist API error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server AI." }, { status: 500 });
  }
}
