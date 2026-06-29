export interface QuestionOption {
  text: string;
  score: number;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  options: QuestionOption[];
  is_audio: boolean;
  is_speaking: boolean;
  order_index: number;
  audio_text?: string | null;
  target_sentence?: string | null;
}

export interface PlacementResult {
  score: number;
  level: string;
  description: string;
  programRecommendation: string;
  studyTimeAdvice: string;
  id: string;
}

export const FALLBACK_QUESTIONS: Question[] = [
  {
    id: "fallback-1",
    category: "Grammar (A1)",
    question: "She ________ her breakfast at 7 AM every day.",
    options: [
      { text: "eat", score: 0 },
      { text: "eats", score: 1 },
      { text: "eating", score: 0 },
      { text: "eaten", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 1
  },
  {
    id: "fallback-2",
    category: "Vocabulary (A1)",
    question: "My father's sister is my ________.",
    options: [
      { text: "Aunt", score: 1 },
      { text: "Uncle", score: 0 },
      { text: "Grandmother", score: 0 },
      { text: "Cousin", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 2
  }
];

export function calculateSpeechAccuracy(transcribed: string, target: string): number {
  const clean = (str: string) =>
    str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .trim()
      .split(/\s+/);
  
  const wordsTranscribed = clean(transcribed);
  const wordsTarget = clean(target);
  
  if (wordsTarget.length === 0) return 0;
  
  let matchCount = 0;
  wordsTarget.forEach((w: string) => {
    if (wordsTranscribed.includes(w)) {
      matchCount++;
    }
  });
  
  return Math.round((matchCount / wordsTarget.length) * 100);
}

export function determineLevelDetails(totalScore: number) {
  let determinedLevel = "A1";
  let levelDescription = "Dapat memahami dan menggunakan ungkapan yang sudah dikenal, kosakata sangat dasar, dan frasa pendek. Direkomendasikan untuk memulai dari program Kids Program atau Basic Calistung.";
  let programRecommendation = "Kids Program (Kelas Dasar) atau Fun Calistung";
  let studyTimeAdvice = "Belajar rutin 3-4 kali seminggu selama 3-6 bulan untuk mencapai level A2.";

  if (totalScore >= 13) {
    determinedLevel = "C1";
    levelDescription = "Mampu memahami berbagai teks panjang dan kompleks, mengekspresikan diri secara lancar dan spontan tanpa memerlukan upaya keras untuk menemukan ungkapan yang tepat.";
    programRecommendation = "Teens Program (Advanced Class) — Persiapan IELTS/TOEFL";
    studyTimeAdvice = "Pertahankan level dengan latihan berbicara dan menulis secara aktif 5 kali seminggu.";
  } else if (totalScore >= 10) {
    determinedLevel = "B2";
    levelDescription = "Dapat memahami gagasan utama teks kompleks, berinteraksi dengan penutur asli dengan cukup lancar, dan menulis teks rinci tentang berbagai topik.";
    programRecommendation = "Teens Program (Upper-Intermediate Class)";
    studyTimeAdvice = "Belajar intensif 4-5 kali seminggu selama 4-6 bulan untuk mencapai level C1.";
  } else if (totalScore >= 6) {
    determinedLevel = "B1";
    levelDescription = "Dapat memahami poin utama input yang jelas tentang topik yang sudah dikenal, berhadapan dengan situasi yang mungkin timbul saat bepergian di area berbahasa Inggris.";
    programRecommendation = "Teens Program (Intermediate Class)";
    studyTimeAdvice = "Belajar rutin 4 kali seminggu selama 4-6 bulan untuk mencapai level B2.";
  } else if (totalScore >= 3) {
    determinedLevel = "A2";
    levelDescription = "Dapat memahami kalimat dan ungkapan yang sering digunakan terkait bidang yang paling relevan, berkomunikasi dalam tugas sederhana dan rutin.";
    programRecommendation = "Kids Program (Elementary Class) atau Teens Program (Beginner Class)";
    studyTimeAdvice = "Belajar rutin 3-4 kali seminggu selama 4-5 bulan untuk mencapai level B1.";
  }

  return {
    level: determinedLevel,
    description: levelDescription,
    programRecommendation,
    studyTimeAdvice
  };
}
