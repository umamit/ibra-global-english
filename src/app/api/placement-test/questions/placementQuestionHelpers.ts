import { getAdminSupabase } from "@/app/api/_middleware";

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
    const scores = q.options.map((o: PlacementOption) => Number(o.score)).filter((n: number) => !isNaN(n));
    if (scores.length !== q.options.length) return false;
    return scores.reduce((a: number, b: number) => a + b, 0) === 1;
  });
}

export async function generateFromGroq() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const prompt = `Kamu adalah pakar pedagogi Bahasa Inggris bersertifikat CEFR. Buatkan 20 soal pilihan ganda evaluasiPlacement Test Bahasa Inggris dengan tema "${randomTopic}". Format persis JSON array of 20 objects dengan properti: id (string), category (string: A1/A2/B1/B2/C1), question (string), options (array of 4 objects { text: string, score: 0 atau 1 }). Hanya output JSON array murni tanpa markdown fence.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.9,
          max_tokens: 8000,
          messages: [{ role: "user", content: prompt }]
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(escapeRawNewlines(cleaned));

      if (Array.isArray(parsed) && parsed.length === 20 && validatePlacementQuestions(parsed)) {
        return parsed;
      }
    } catch (err) {
      console.error(`Percobaan ${attempt} pembuatan soal Groq AI gagal:`, err);
    }
  }

  return null;
}
