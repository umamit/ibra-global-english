import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

const { url: supabaseUrl } = getSupabaseConfig();
export const dynamic = "force-dynamic";

const TOPICS = [
  "technology and digital era",
  "environmental challenges and ecology",
  "global cuisine and food culture",
  "modern job search and career paths",
  "traveling adventures and destinations",
  "sports, fitness and health",
  "art, music and cultural expressions",
  "space exploration and astronomy",
  "history and ancient civilizations",
  "financial literacy and economy",
  "hobbies and creative writing",
  "education and future of learning",
  "social media and communication",
  "climate change and green energy",
  "human psychology and behavior",
  "movies, theater and storytelling",
  "transportation and city life",
  "science discoveries and innovations",
  "shopping, fashion and design",
  "family relationships and friendship",
  "volunteering and community service",
  "myths, legends and folklore",
  "nature, wildlife and conservation",
  "business ethics and entrepreneurship"
];

async function generateFromGroq() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.warn(
      "GROQ_API_KEY is not defined. Falling back to database questions.",
    );
    return null;
  }

  const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  const prompt = `Kamu adalah pakar pedagogi Bahasa Inggris bersertifikat CEFR yang merancang soal placement test untuk lembaga kursus Ibra Global English.
Tugas: Rancang tepat 15 soal pilihan ganda bahasa Inggris yang mencakup 5 level CEFR dan 6 tipe soal berbeda.

Untuk memastikan tes kali ini unik dan bervariasi, fokuskan tema utama naskah, kalimat, dan teks bacaan pada konteks: "${randomTopic}".

Pembagian soal berdasarkan level CEFR (masing-masing 3 soal):
- Soal 1, 2, 3:  Level A1 (Pemula Mutlak)
- Soal 4, 5, 6:  Level A2 (Pemula Dasar)
- Soal 7, 8, 9:  Level B1 (Menengah Awal)
- Soal 10, 11, 12: Level B2 (Menengah Atas)
- Soal 13, 14, 15: Level C1 (Mahir)

DIREKTIF TINGKAT KESULITAN MAKSIMAL (WAJIB DIPATUHI):
- Tingkat kesulitan untuk setiap level harus diset pada batas MAKSIMAL standar kompetensi CEFR masing-masing agar tes benar-benar menantang dan akurat.
- Soal level B2 dan C1 harus menggunakan tata bahasa tingkat tinggi yang kompleks (seperti: inversion, mixed conditionals, relative clauses, subjunctive mood), teks membaca yang panjang dengan argumen akademis/filosofis, pertanyaan pemahaman yang kritis (bukan sekadar mencocokkan kata), serta pilihan kosakata (vocabulary) tingkat tinggi.

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
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 1.0,
          max_tokens: 6000,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    if (!response.ok) {
      console.error(`Groq API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
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
    // 1. Coba generate dengan Groq AI secara langsung
    const dynamicQuestions = await generateFromGroq();
    if (dynamicQuestions) {
      console.log(
        "Successfully served dynamically generated placement test questions.",
      );
      return NextResponse.json(dynamicQuestions, {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      });
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
    return NextResponse.json(data || [], {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    });
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
