import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

const { url: supabaseUrl } = getSupabaseConfig();
export const dynamic = "force-dynamic";

async function generateFromGemini() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.warn(
      "GEMINI_API_KEY is not defined. Falling back to database questions.",
    );
    return null;
  }

  const prompt = `Kamu adalah pakar pedagogi Bahasa Inggris bersertifikat CEFR yang merancang soal placement test untuk lembaga kursus Ibra Global English.
Tugas: Rancang tepat 15 soal pilihan ganda bahasa Inggris yang mencakup 5 level CEFR dan 6 tipe soal berbeda.

Pembagian soal berdasarkan level CEFR (masing-masing 3 soal):
- Soal 1, 2, 3:  Level A1 (Pemula Mutlak)
- Soal 4, 5, 6:  Level A2 (Pemula Dasar)
- Soal 7, 8, 9:  Level B1 (Menengah Awal)
- Soal 10, 11, 12: Level B2 (Menengah Atas)
- Soal 13, 14, 15: Level C1 (Mahir)

Distribusi tipe soal yang WAJIB ada dalam 15 soal tersebut:
- 3 soal Grammar (struktur kalimat, tenses, agreement)
- 3 soal Vocabulary (kosakata kontekstual)
- 3 soal Reading Comprehension (WAJIB ada teks bacaan pendek sebelum pertanyaan)
- 2 soal Listening (is_audio: true, sertakan audio_text naskah percakapan atau monolog pendek)
- 2 soal Speaking (is_speaking: true, sertakan target_sentence kalimat yang harus diucapkan)
- 2 soal Writing/Translation (memilih terjemahan atau melengkapi kalimat tertulis)

Setiap soal WAJIB memiliki properti berikut:
- "id": string unik acak (8 karakter alfanumerik)
- "category": string deskriptif misal "Grammar (A1)", "Reading (B2)", "Listening (B1)", "Speaking (C1)"
- "question": teks pertanyaan lengkap dalam bahasa Inggris
- "options": array 4 objek [{ "text": "string", "score": 0 atau 1 }] — tepat 1 score bernilai 1
- "is_audio": boolean — true hanya untuk soal Listening
- "audio_text": string naskah audio (wajib diisi jika is_audio true, selain itu null)
- "is_speaking": boolean — true hanya untuk soal Speaking
- "target_sentence": string kalimat target pengucapan (wajib diisi jika is_speaking true, selain itu null)
- "order_index": integer 1 sampai 15
- "cefr_level": string salah satu dari "A1", "A2", "B1", "B2", "C1"

Aturan ketat:
- Output HARUS berupa JSON array murni 15 objek, tanpa teks pendahuluan, penjelasan, atau markdown code fence.
- Tepat 1 opsi jawaban benar (score: 1) di setiap soal.
- Soal Reading WAJIB diawali dengan teks artikel/paragraf pendek sebelum pertanyaan dimulai.
- Soal Listening: audio_text berisi percakapan atau narasi pendek (3-5 kalimat).
- Soal Speaking: target_sentence berisi satu kalimat yang harus diucapkan peserta.
- Tingkat kesulitan soal harus benar-benar sesuai level CEFR masing-masing.

DIREKTIF ANTI-GAGAL (WAJIB DIPATUHI):
- DILARANG KERAS membuat pertanyaan yang jawabannya sudah tertulis di dalam kalimat tanya itu sendiri (Contoh PROHIBITED: Text: "My name is John" -> Question: "What is John's name?").
- Jika melanggar aturan ini, seluruh output JSON akan dianggap gagal dan ditolak oleh sistem.
- Pertanyaan harus selalu menggunakan kata ganti pihak ketiga (the writer, the speaker, the man, the woman) jika menanyakan subjek dalam teks.

[CONTOH LOGIKA SOAL YANG SALAH (JANGAN DITIRU)]
{
  "question": "Read the text: 'My name is John.' What is John's name?",
  "reason_of_failure": "Membocorkan jawaban di dalam pertanyaan."
}

[CONTOH LOGIKA SOAL YANG BENAR (WAJIB DITIRU)]
{
  "question": "Read the text: 'My name is John.' What is the speaker's name?",
  "reason_of_success": "Benar, menggunakan kata 'the speaker'."
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 6000,
          },
        }),
      },
    );

    if (!response.ok) {
      console.error(`Gemini API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Helper untuk me-escape newline nyata di dalam string JSON agar tidak memicu JSON parse error
    const escapeRawNewlines = (str: string): string => {
      let inString = false;
      let escaped = false;
      let result = "";
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"' && !escaped) {
          inString = !inString;
        }
        if (inString && (char === "\n" || char === "\r")) {
          result += "\\n";
        } else {
          result += char;
        }
        if (char === "\\" && !escaped) {
          escaped = true;
        } else {
          escaped = false;
        }
      }
      return result;
    };

    const escapedText = escapeRawNewlines(cleaned);
    const parsed = JSON.parse(escapedText);

    if (Array.isArray(parsed) && parsed.length === 15) {
      // Validate all questions
      type PlacementOption = { text: string; score: number };
      type PlacementQuestion = {
        id: string;
        category: string;
        question: string;
        options: PlacementOption[];
      };
      const isValid = (parsed as PlacementQuestion[]).every((q) => {
        if (
          !q.id ||
          !q.category ||
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length < 2
        )
          return false;
        const scores = q.options
          .map((o: PlacementOption) => Number(o.score))
          .filter((n: number) => Number.isInteger(n));
        if (scores.length !== q.options.length) return false;
        if (scores.reduce((a: number, b: number) => a + b, 0) !== 1)
          return false;
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
    // 1. Coba generate dengan Gemini AI secara langsung
    const dynamicQuestions = await generateFromGemini();
    if (dynamicQuestions) {
      console.log(
        "Successfully served dynamically generated placement test questions via Gemini.",
      );
      return NextResponse.json(dynamicQuestions);
    }

    // 2. Jika gagal atau API Key tidak ada, gunakan database sebagai fallback
    console.log("Using database fallback for placement test questions.");
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon",
    );
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
  return NextResponse.json(
    { error: "Endpoint publik ini hanya mendukung GET." },
    { status: 405 },
  );
}
