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
    id: "fb-1",
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
    id: "fb-2",
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
  },
  {
    id: "fb-3",
    category: "Grammar (A1)",
    question: "They ________ soccer in the yard right now.",
    options: [
      { text: "plays", score: 0 },
      { text: "are playing", score: 1 },
      { text: "played", score: 0 },
      { text: "is playing", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 3
  },
  {
    id: "fb-4",
    category: "Reading (A1)",
    question: "Read and answer: 'Bob is 10 years old. He has a cat named Whiskers.' How old is Bob?",
    options: [
      { text: "8 years old", score: 0 },
      { text: "10 years old", score: 1 },
      { text: "12 years old", score: 0 },
      { text: "5 years old", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 4
  },
  {
    id: "fb-5",
    category: "Vocabulary (A2)",
    question: "If you feel extremely tired, you are ________.",
    options: [
      { text: "angry", score: 0 },
      { text: "excited", score: 0 },
      { text: "exhausted", score: 1 },
      { text: "bored", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 5
  },
  {
    id: "fb-6",
    category: "Grammar (A2)",
    question: "Where ________ you go for your vacation last year?",
    options: [
      { text: "do", score: 0 },
      { text: "did", score: 1 },
      { text: "have", score: 0 },
      { text: "are", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 6
  },
  {
    id: "fb-7",
    category: "Grammar (A2)",
    question: "I have been living in Bobong ________ three years.",
    options: [
      { text: "since", score: 0 },
      { text: "for", score: 1 },
      { text: "during", score: 0 },
      { text: "in", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 7
  },
  {
    id: "fb-8",
    category: "Vocabulary (A2)",
    question: "The school library has a wide ________ of books.",
    options: [
      { text: "selection", score: 1 },
      { text: "select", score: 0 },
      { text: "selective", score: 0 },
      { text: "selector", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 8
  },
  {
    id: "fb-9",
    category: "Reading (B1)",
    question: "Read and answer: 'Sarah loves reading. She reads a new book every week. Her favorite genre is mystery.' What kind of books does Sarah like most?",
    options: [
      { text: "Comics", score: 0 },
      { text: "Science Fiction", score: 0 },
      { text: "Mystery", score: 1 },
      { text: "History", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 9
  },
  {
    id: "fb-10",
    category: "Grammar (B1)",
    question: "If I ________ his phone number, I would have called him yesterday.",
    options: [
      { text: "know", score: 0 },
      { text: "had known", score: 1 },
      { text: "knew", score: 0 },
      { text: "have known", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 10
  },
  {
    id: "fb-11",
    category: "Grammar (B1)",
    question: "By the time the teacher arrived, the students ________ the classroom.",
    options: [
      { text: "already clean", score: 0 },
      { text: "had already cleaned", score: 1 },
      { text: "clean", score: 0 },
      { text: "have cleaned", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 11
  },
  {
    id: "fb-12",
    category: "Vocabulary (B1)",
    question: "To 'postpone' a meeting means to ________.",
    options: [
      { text: "cancel it", score: 0 },
      { text: "delay or reschedule it", score: 1 },
      { text: "start it on time", score: 0 },
      { text: "shorten it", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 12
  },
  {
    id: "fb-13",
    category: "Grammar (B2)",
    question: "He is looking forward to ________ his grandparents next month.",
    options: [
      { text: "visit", score: 0 },
      { text: "visiting", score: 1 },
      { text: "visited", score: 0 },
      { text: "visits", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 13
  },
  {
    id: "fb-14",
    category: "Vocabulary (B2)",
    question: "Her explanation was so ________ that everyone understood the complex topic instantly.",
    options: [
      { text: "vague", score: 0 },
      { text: "ambiguous", score: 0 },
      { text: "lucid", score: 1 },
      { text: "intricate", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 14
  },
  {
    id: "fb-15",
    category: "Reading (B2)",
    question: "Read and answer: 'Despite the challenging terrain and unpredictable weather, the expedition successfully reached the summit of Mount Taliabu, demonstrating exemplary resilience and teamwork.' What is the main message of the text?",
    options: [
      { text: "The weather was nice on the mountain.", score: 0 },
      { text: "The team failed to reach the summit.", score: 0 },
      { text: "The team succeeded through determination and cooperation.", score: 1 },
      { text: "Mount Taliabu is easy to climb.", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 15
  },
  {
    id: "fb-16",
    category: "Listening (B1)",
    question: "Klik tombol putar untuk mendengarkan audio, kemudian pilih jawaban yang tepat untuk pertanyaan: What time does the speaker wake up?",
    options: [
      { text: "6:00 AM", score: 0 },
      { text: "6:30 AM", score: 1 },
      { text: "7:00 AM", score: 0 },
      { text: "7:30 AM", score: 0 }
    ],
    is_audio: true,
    audio_text: "Every morning, I wake up at half past six, drink a glass of warm water, and do some light stretching before starting my day.",
    is_speaking: false,
    order_index: 16
  },
  {
    id: "fb-17",
    category: "Listening (B2)",
    question: "Klik tombol putar untuk mendengarkan audio, kemudian pilih jawaban yang tepat untuk pertanyaan: Where is the speaker planning to go next week?",
    options: [
      { text: "Jakarta", score: 0 },
      { text: "Taliabu Island (Bobong)", score: 1 },
      { text: "Bali", score: 0 },
      { text: "Makassar", score: 0 }
    ],
    is_audio: true,
    audio_text: "I am really looking forward to my trip to Bobong next week. I want to visit the beautiful beaches and practice my English.",
    is_speaking: false,
    order_index: 17
  },
  {
    id: "fb-18",
    category: "Speaking (A2)",
    question: "Klik tombol mikrofon dan ucapkan kalimat berikut dengan jelas: 'English is fun and easy to learn.'",
    options: [
      { text: "Pass (>= 70% accuracy)", score: 1 },
      { text: "Try Again", score: 0 }
    ],
    is_audio: false,
    is_speaking: true,
    target_sentence: "English is fun and easy to learn.",
    order_index: 18
  },
  {
    id: "fb-19",
    category: "Speaking (B1)",
    question: "Klik tombol mikrofon dan ucapkan kalimat berikut dengan jelas: 'I would like to enroll in the Teens Program next month.'",
    options: [
      { text: "Pass (>= 70% accuracy)", score: 1 },
      { text: "Try Again", score: 0 }
    ],
    is_audio: false,
    is_speaking: true,
    target_sentence: "I would like to enroll in the Teens Program next month.",
    order_index: 19
  },
  {
    id: "fb-20",
    category: "Writing/Translation (B2)",
    question: "Pilih terjemahan yang paling tepat untuk kalimat: 'Saya berharap saya bisa pergi ke luar negeri tahun depan.'",
    options: [
      { text: "I wish I could go abroad next year.", score: 1 },
      { text: "I hope I can went abroad next year.", score: 0 },
      { text: "I wish I can go to out country next year.", score: 0 },
      { text: "I hope I could go abroad next year.", score: 0 }
    ],
    is_audio: false,
    is_speaking: false,
    order_index: 20
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
