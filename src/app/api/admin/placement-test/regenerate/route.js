import { NextResponse } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";
import { getAdminSupabase } from "@/app/api/_middleware";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const adminSupabase = getAdminSupabase();
export const dynamic = "force-dynamic";

function buildPrompt(category, mode, existingQuestion) {
  const levelLabel = category.includes("Easy") || category.includes("A1") ? "A1" : category.includes("Medium") || category.includes("B1") ? "B1" : category.includes("Hard") || category.includes("B2") ? "B2" : category.includes("Advanced") || category.includes("C1") ? "C1" : "A2";

  if (mode === "all") {
    return `Kamu adalah pakar pedagogi Bahasa Inggris yang ahli merancang soal placement test standar CEFR untuk lembaga kursus Ibra Global English.
Tugas: Buat 1 soal pilihan ganda CEFR ${levelLabel} untuk kategori "${category}" yang valid dan edukatif.
Format jawaban WAJIB JSON murni tanpa teks lain:
{"category":"${category}","question":"pertanyaan bahasa Inggris yang jelas dan natural","options":[{"text":"opsi A","score":1},{"text":"opsi B","score":0},{"text":"opsi C","score":0},{"text":"opsi D","score":0}],"is_audio":false,"audio_text":null,"is_speaking":false,"target_sentence":null,"cefr_level":"${levelLabel}"}
Aturan ketat:
- Hanya gunakan kosakata dan struktur kalimat sesuai level CEFR ${levelLabel}.
- 4 opsi, jawaban benar hanya 1 (score=1), sisanya score=0.
- Pertanyaan harus measurable dan unambiguous.
- Jangan tambahkan penjelasan di luar JSON.`;
  }

  if (mode === "category") {
    return `Kamu adalah pakar pedagogi Bahasa Inggris yang ahli merancang soal placement test standar CEFR untuk lembaga kursus Ibra Global English.
Tugas: Buat 1 soal pilihan ganda CEFR ${levelLabel} untuk kategori "${category}" yang valid dan edukatif.
Format jawaban WAJIB JSON murni tanpa teks lain:
{"category":"${category}","question":"string","options":[{"text":"string","score":0|1},{"text":"string","score":0|1},{"text":"string","score":0|1},{"text":"string","score":0|1}],"is_audio":false,"audio_text":null,"is_speaking":false,"target_sentence":null,"cefr_level":"${levelLabel}"}
Aturan ketat:
- Hanya gunakan kosakata dan struktur kalimat sesuai level CEFR ${levelLabel}.
- Jawaban benar hanya 1 (score=1).
- Pertanyaan harus measurable dan unambiguous.
- Jangan tambahkan penjelasan di luar JSON.`;
  }

  return `Kamu adalah pakar pedagogi Bahasa Inggris yang ahli merancang soal placement test standar CEFR untuk lembaga kursus Ibra Global English.
Tugas: Buat 1 soal pilihan ganda pengganti untuk soal sebelumnya.
Format jawaban WAJIB JSON murni tanpa teks lain:
{"category":"${category}","question":"string","options":[{"text":"string","score":0|1},{"text":"string","score":0|1},{"text":"string","score":0|1},{"text":"string","score":0|1}],"is_audio":false,"audio_text":null,"is_speaking":false,"target_sentence":null,"cefr_level":"${levelLabel}"}
Soal sebelumnya: ${existingQuestion ? JSON.stringify(existingQuestion) : "tidak ada"}
Aturan ketat:
- Harus berbeda isi dengan soal sebelumnya.
- Hanya ada 1 jawaban benar.
- Jangan tambahkan penjelasan di luar JSON.`;
}

async function generateQuestionFromAI(prompt) {
  if (!GROQ_API_KEY) return null;
  let response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.6, max_tokens: 800, messages: [{ role: "user", content: prompt }] })
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try { return JSON.parse(cleaned); } catch { return null; }
}

function isValidQuestion(q) {
  if (!q || typeof q.question !== "string" || !Array.isArray(q.options) || q.options.length < 2) return false;
  const scores = q.options.map(o => Number(o.score)).filter(n => Number.isInteger(n));
  if (scores.length !== q.options.length) return false;
  if (scores.reduce((a, b) => a + b, 0) !== 1) return false;
  return true;
}

async function getAuthEmail(request) {
  try {
    const mod = await import("@/utils/supabase/adminAuth");
    const user = await mod.getCurrentUser?.();
    return user?.email || null;
  } catch {
    return null;
  }
}

export const POST = withAdminAuth(async (request) => {
  const body = await request.json().catch(() => ({}));
  const { replaceAll = false, id, category, mode = "apply" } = body;

  let selectedRows = [];
  if (replaceAll) {
    const { data, error } = await adminSupabase.from("placement_test_questions").select("*").order("order_index", { ascending: true });
    if (error) throw error;
    selectedRows = data || [];
  } else if (id) {
    const { data, error } = await adminSupabase.from("placement_test_questions").select("*").eq("id", id).single();
    if (error) throw error;
    selectedRows = data ? [data] : [];
  } else if (category) {
    const { data, error } = await adminSupabase.from("placement_test_questions").select("*").eq("category", category).order("order_index", { ascending: true });
    if (error) throw error;
    selectedRows = data || [];
  }

  if (!selectedRows.length) return NextResponse.json({ error: "Tidak ada soal yang cocok untuk di-regenerate." }, { status: 400 });

  const results = [];
  const adminEmail = await getAuthEmail(request);

  for (const row of selectedRows) {
    const prompt = buildPrompt(row.category, replaceAll ? "all" : category ? "category" : "single", row);
    const generated = await generateQuestionFromAI(prompt);

    const logEntry = {
      admin_email: adminEmail,
      category: row.category,
      target_id: row.id,
      action: replaceAll ? "replace_all" : category ? "replace_category" : "replace_single",
      status: generated ? (isValidQuestion(generated) ? "success" : "invalid") : "failed",
      old_question: row.question,
      new_question: generated?.question || null,
      ai_raw_response: generated ? JSON.stringify(generated) : null,
      error_message: generated && !isValidQuestion(generated) ? "Validasi gagal: harus ada tepat 1 jawaban benar (score=1) dan minimal 2 opsi." : null,
    };

    if (!generated) {
      await adminSupabase.from("placement_test_regenerate_logs").insert(logEntry);
      results.push({ id: row.id, status: "failed", message: "Gagal generate dari AI.", preview: null });
      continue;
    }

    if (!isValidQuestion(generated)) {
      await adminSupabase.from("placement_test_regenerate_logs").insert(logEntry);
      results.push({ id: row.id, status: "invalid", message: "Soal dari AI tidak lolos validasi (score jawaban tidak valid).", preview: generated });
      continue;
    }

    if (mode === "preview") {
      results.push({ id: row.id, status: "preview", message: "Soal siap diterapkan.", preview: generated });
      continue;
    }

    const { data, error } = await adminSupabase.from("placement_test_questions").update({
      category: generated.category || row.category,
      question: generated.question,
      options: generated.options,
      is_audio: !!generated.is_audio,
      audio_text: generated.audio_text || null,
      is_speaking: !!generated.is_speaking,
      target_sentence: generated.target_sentence || null,
      updated_at: new Date().toISOString()
    }).eq("id", row.id).select("*").single();

    if (error) {
      logEntry.status = "failed";
      logEntry.error_message = error.message;
      await adminSupabase.from("placement_test_regenerate_logs").insert(logEntry);
      results.push({ id: row.id, status: "failed", message: error.message, preview: generated });
    } else {
      await adminSupabase.from("placement_test_regenerate_logs").insert(logEntry);
      results.push({ id: row.id, status: "success", data, preview: generated });
    }
  }

  return NextResponse.json({ results });
});
