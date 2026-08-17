import { getAdminSupabase } from "@/app/api/_middleware";
import { getRagContext } from "@/utils/rag";

const adminSupabase = getAdminSupabase();

export function constructPromptForMode(mode: string, payload: any, authUserRole: string) {
  let systemPrompt = "Kamu adalah asisten AI administrasi cerdas untuk Ibra Global English Bobong.";
  let userPrompt = "";

  if (mode === "auto-draft") {
    const { name, program, speaking, grammar, vocabulary, active, module_name } = payload || {};
    const isCalistung = program?.toLowerCase()?.includes("calistung");
    if (isCalistung) {
      systemPrompt = `Kamu adalah asisten AI tutor bimbingan belajar Calistung (Membaca, Menulis, Berhitung) di Ibra Global English Bobong...`;
      userPrompt = `Buat ulasan rapor untuk siswa Calistung: ${name}...`;
    } else {
      systemPrompt = `Kamu adalah asisten AI tutor bahasa Inggris di Ibra Global English Bobong...`;
      userPrompt = `Buat ulasan rapor untuk siswa English: ${name}...`;
    }
  } else if (mode === "announcement-polish") {
    const { title, content } = payload || {};
    systemPrompt = `Kamu adalah asisten hubungan masyarakat profesional di Ibra Global English Bobong. Poles draf pengumuman.`;
    userPrompt = `Judul: ${title}\nIsi: ${content}`;
  } else if (mode === "placement-test-evaluation") {
    const { name, score, level, course } = payload || {};
    systemPrompt = `Kamu adalah asisten penerimaan siswa baru AI di Ibra Global English Bobong.`;
    userPrompt = `Siswa: ${name}, Skor: ${score}/20, Level: ${level}, Program: ${course}`;
  } else if (mode === "finance-projection") {
    const { selectedMonth, activeExpected, activeCollected, outstanding, collectionRate, activePaidCount, activeUnpaidCount, programBreakdown, chartData } = payload || {};
    systemPrompt = `Kamu adalah asisten analis keuangan AI di Ibra Global English Bobong.`;
    userPrompt = `Bulan: ${selectedMonth}, Expected: ${activeExpected}, Collected: ${activeCollected}, Outstanding: ${outstanding}, Rate: ${collectionRate}%`;
  } else if (mode === "spp-billing-draft") {
    const { name, program, month, amount, parent_name } = payload || {};
    systemPrompt = `Kamu adalah Asisten AI Keuangan di Ibra Global English Bobong.`;
    userPrompt = `Orang Tua: ${parent_name}, Siswa: ${name}, Program: ${program}, Month: ${month}, Amount: ${amount}`;
  } else if (mode === "progress-report-draft") {
    const { name, program, month, focus_areas, achievements, challenges } = payload || {};
    systemPrompt = `Kamu adalah Asisten AI Akademik di Ibra Global English Bobong.`;
    userPrompt = `Siswa: ${name}, Program: ${program}, Month: ${month}, Focus: ${focus_areas}`;
  } else if (mode === "letter-draft") {
    const { instruction, recipient, subject, letter_number } = payload || {};
    systemPrompt = `Kamu adalah Asisten AI Administrasi di PT. Ibra Global English Bobong.`;
    userPrompt = `Konten: ${instruction}, Penerima: ${recipient}, Perihal: ${subject}, No: ${letter_number}`;
  } else if (mode === "calendar-draft") {
    const { prompt: promptText } = payload || {};
    systemPrompt = `Kamu adalah AI Calendar Scheduler untuk Ibra Global English Bobong. Format array JSON.`;
    userPrompt = promptText || "";
  } else if (mode === "wa-manual-polish") {
    const { message: rawMessage, topic } = payload || {};
    systemPrompt = `Kamu adalah Asisten AI Penulis Pesan WhatsApp Resmi Ibra Global English Bobong. Tugasmu adalah menyusun atau memoles pesan WhatsApp agar sangat profesional, ramah, dan santun. Gunakan format WhatsApp yang rapi (penggunaan bold *kata*, bullet points jika ada poin-poin, dan bahasa Indonesia baku yang hangat).`;
    userPrompt = topic
      ? `Buat draf pesan WhatsApp resmi profesional dengan topik: "${topic}". Berikan HANYA teks pesan WhatsApp hasil perbaikan tanpa kalimat pembuka/penutup tambahan.`
      : `Poles dan sempurnakan pesan WhatsApp berikut agar sangat profesional dan rapi:\n${rawMessage}\n\nBerikan HANYA teks pesan WhatsApp hasil perbaikan tanpa kalimat pembuka/penutup tambahan.`;
  }

  return { systemPrompt, userPrompt };
}

export async function fetchInsightsData() {
  const { count: studentCount } = await adminSupabase.from("students").select("*", { count: "exact", head: true });
  const { data: attendanceData } = await adminSupabase.from("attendance").select("status");
  const { data: paymentData } = await adminSupabase.from("tuition_payments").select("status");

  const totalStudents = studentCount || 0;
  const totalAtt = attendanceData?.length || 0;
  const presentCount = attendanceData?.filter((a) => a.status === "hadir")?.length || 0;
  const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;
  const paidCount = paymentData?.filter((p) => p.status === "lunas")?.length || 0;
  const unpaidCount = paymentData?.filter((p) => p.status === "belum_bayar")?.length || 0;
  const pendingCount = paymentData?.filter((p) => p.status === "menunggu_konfirmasi")?.length || 0;

  const systemPrompt = `Kamu adalah konsultan manajemen pendidikan profesional di Ibra Global English Bobong. Berikan analisis taktis singkat.`;
  const userPrompt = `Siswa: ${totalStudents}, Kehadiran: ${attendanceRate}%, Lunas: ${paidCount}, Pending: ${pendingCount}, Belum Bayar: ${unpaidCount}.`;

  return { systemPrompt, userPrompt };
}

export async function executeGroqAiAssist(apiKey: string, messages: any[], systemPrompt: string, userPrompt: string, mode: string) {
  let ragContext = "";
  if (mode === "chat" && messages && Array.isArray(messages) && messages.length > 0) {
    const lastAdminMsg = messages[messages.length - 1]?.content || "";
    try { ragContext = await getRagContext(lastAdminMsg, 3); } catch {}
  }

  const systemPromptWithRag = ragContext ? systemPrompt + "\n\n" + ragContext : systemPrompt;
  const formattedMessages = mode === "chat" && messages && Array.isArray(messages)
    ? [{ role: "system", content: systemPromptWithRag }, ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))]
    : [{ role: "system", content: systemPromptWithRag }, { role: "user", content: userPrompt }];

  return await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: formattedMessages, temperature: 0.6, max_tokens: 1500 }),
  });
}
