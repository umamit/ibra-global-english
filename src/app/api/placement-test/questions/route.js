import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

const { url: supabaseUrl } = getSupabaseConfig();
export const dynamic = "force-dynamic";

async function generateFromGroq() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is not defined. Falling back to database questions.");
    return null;
  }

  const prompt = `Kamu adalah pakar pedagogi Bahasa Inggris yang ahli merancang soal placement test standar CEFR untuk lembaga kursus Ibra Global English.
Tugas: Rancang 15 soal pilihan ganda bahasa Inggris berjenjang untuk tes penempatan.
Pembagian level CEFR soal:
- Soal 1 s/d 5: Tingkat A1-A2 (Dasar / Easy)
- Soal 6 s/d 10: Tingkat B1-B2 (Menengah / Medium)
- Soal 11 s/d 15: Tingkat Mahir (C1/Advanced / Hard)

Setiap soal harus menyertakan properti:
- "id": UUID atau string acak unik
- "category": Kategori soal (misal: "Grammar (A1 Easy)", "Reading (B1 Medium)", "Listening (B2 Hard)")
- "question": Pertanyaan bahasa Inggris
- "options": Array berisi 4 opsi [{ "text": "opsi", "score": 0 atau 1 }] di mana hanya ada TEPAT 1 opsi dengan score 1, dan 3 opsi lainnya dengan score 0.
- "is_audio": boolean (set true jika kategori mendengarkan/listening)
- "audio_text": string naskah audio jika is_audio true, selain itu null
- "is_speaking": boolean (set true jika soal speaking)
- "target_sentence": string kalimat target pengucapan jika is_speaking true, selain itu null
- "order_index": number (1 sampai 15)

Aturan ketat:
- Format jawaban WAJIB berupa JSON array murni berisi 15 objek soal tersebut tanpa ada teks pendahuluan, penjelasan, atau blok kode markdown (jangan pakai \`\`\`json).
- Pastikan hanya ada tepat satu opsi jawaban benar dengan score: 1 untuk setiap soal.
- Semua opsi teks harus ditulis dengan rapi dan bebas dari kesalahan tik.
- Untuk soal kategori membaca (Reading / Reading Comprehension), teks bacaan pendek atau artikel pengantar WAJIB ditulis lengkap di bagian awal properti "question" sebelum kalimat pertanyaannya dimulai (misalnya: "Read the following text:\n[Teks pendek/artikel]\n\nQuestion: [Kalimat pertanyaan]"). Jangan membuat soal membaca tanpa ada artikel/teks bacaan pengantarnya!`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${GROQ_API_KEY}` 
      },
      body: JSON.stringify({ 
        model: "llama-3.3-70b-versatile", 
        temperature: 0.6, 
        max_tokens: 4000, 
        messages: [{ role: "user", content: prompt }] 
      })
    });

    if (!response.ok) {
      console.error(`Groq API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length === 15) {
      // Validate all questions
      const isValid = parsed.every(q => {
        if (!q.id || !q.category || !q.question || !Array.isArray(q.options) || q.options.length < 2) return false;
        const scores = q.options.map(o => Number(o.score)).filter(n => Number.isInteger(n));
        if (scores.length !== q.options.length) return false;
        if (scores.reduce((a, b) => a + b, 0) !== 1) return false;
        return true;
      });

      if (isValid) {
        return parsed;
      } else {
        console.warn("Some generated questions failed validation check.");
      }
    }
  } catch (err) {
    console.error("Failed to generate questions from Groq AI:", err);
  }
  return null;
}

export async function GET() {
  try {
    // 1. Coba generate dengan Groq AI secara langsung
    const dynamicQuestions = await generateFromGroq();
    if (dynamicQuestions) {
      console.log("Successfully served dynamically generated placement test questions.");
      return NextResponse.json(dynamicQuestions);
    }

    // 2. Jika gagal atau API Key tidak ada, gunakan database sebagai fallback
    console.log("Using database fallback for placement test questions.");
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon");
    const { data, error } = await supabase
      .from("placement_test_questions")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Failed to load questions:", err);
    return NextResponse.json({ error: "Gagal memuat soal." }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Endpoint publik ini hanya mendukung GET." }, { status: 405 });
}