import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

const { url: supabaseUrl } = getSupabaseConfig();

const TOPICS = [
  "technology and digital era", "environmental challenges and ecology", "global cuisine and food culture",
  "modern job search and career paths", "traveling adventures and destinations", "sports, fitness and health",
  "art, music and cultural expressions", "space exploration and astronomy", "history and ancient civilizations",
  "financial literacy and economy", "hobbies and creative writing", "education and future of learning",
  "social media and communication", "climate change and green energy", "human psychology and behavior",
  "movies, theater and storytelling", "transportation and city life", "science discoveries and innovations",
  "shopping, fashion and design", "family relationships and friendship", "volunteering and community service",
  "myths, legends and folklore", "nature, wildlife and conservation", "business ethics and entrepreneurship"
];

export function escapeRawNewlines(str: string): string {
  let inString = false;
  let escaped = false;
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !escaped) inString = !inString;
    if (inString && (char === "\n" || char === "\r")) result += "\\n";
    else result += char;
    escaped = char === "\\" && !escaped;
  }
  return result;
}

export function validatePlacementQuestions(parsed: any[]): boolean {
  type PlacementOption = { text: string; score: number };
  type PlacementQuestion = { id: string; category: string; question: string; options: PlacementOption[] };

  return (parsed as PlacementQuestion[]).every((q) => {
    if (!q.id || !q.category || !q.question || !Array.isArray(q.options) || q.options.length < 2) return false;
    const scores = q.options.map((o: PlacementOption) => Number(o.score)).filter((n: number) => Number.isInteger(n));
    if (scores.length !== q.options.length) return false;
    return scores.reduce((a: number, b: number) => a + b, 0) === 1;
  });
}

export async function generateFromGroq() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return null;

  const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const prompt = `Kamu adalah pakar pedagogi Bahasa Inggris bersertifikat CEFR... Tema: "${randomTopic}". Rancang tepat 20 soal pilihan ganda...`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 1.0, max_tokens: 8000, messages: [{ role: "user", content: prompt }] }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(escapeRawNewlines(cleaned));

    if (Array.isArray(parsed) && parsed.length === 20 && validatePlacementQuestions(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to generate questions from Groq AI:", err);
  }
  return null;
}

export async function fetchDatabaseQuestionsFallback() {
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon");
  const { data, error } = await supabase.from("placement_test_questions").select("*").order("order_index", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}
