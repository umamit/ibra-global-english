export interface RubricCriterion {
  id: string;
  label: string;
  points: number;
}

export interface AspectRubric {
  aspectKey: string; // 'speaking' | 'grammar' | 'vocabulary' | 'active'
  titleEnglish: string;
  titleCalistung: string;
  criteria: RubricCriterion[];
}

export const RUBRIC_DATA_MATH: AspectRubric[] = [
  {
    aspectKey: "speaking",
    titleEnglish: "Operasi Hitung (Konsep Dasar)",
    titleCalistung: "Operasi Hitung (Konsep Dasar)",
    criteria: [
      { id: "mt_1", label: "Memahami konsep nilai tempat, bilangan, dan urutan angka", points: 25 },
      { id: "mt_2", label: "Mampu menyelesaikan penjumlahan dan pengurangan secara mandiri", points: 25 },
      { id: "mt_3", label: "Menguasai perkalian dan pembagian dasar sesuai jenjang", points: 25 },
      { id: "mt_4", label: "Cepat dan tepat dalam perhitungan mental aritmatika dasar", points: 25 }
    ]
  },
  {
    aspectKey: "grammar",
    titleEnglish: "Penalaran & Logika Soal Cerita",
    titleCalistung: "Penalaran & Logika Soal Cerita",
    criteria: [
      { id: "ml_1", label: "Mampu membaca dan memahami maksud informasi dalam soal cerita", points: 25 },
      { id: "ml_2", label: "Tepat merumuskan kalimat matematika dari persoalan kontekstual", points: 25 },
      { id: "ml_3", label: "Mampu menerapkan strategi pemecahan masalah bertahap", points: 25 },
      { id: "ml_4", label: "Kritis dalam memeriksa kembali kebenaran jawaban akhir", points: 25 }
    ]
  },
  {
    aspectKey: "vocabulary",
    titleEnglish: "Ketelitian & Kerapian Pengerjaan",
    titleCalistung: "Ketelitian & Kerapian Pengerjaan",
    criteria: [
      { id: "mk_1", label: "Menulis langkah-langkah penyelesaian rumus dengan rapi dan runtut", points: 25 },
      { id: "mk_2", label: "Teliti dalam membaca tanda operasi hitung (+, -, x, :)", points: 25 },
      { id: "mk_3", label: "Minim kesalahan perhitungan ceroboh (careless mistakes)", points: 25 },
      { id: "mk_4", label: "Mampu menemukan dan memperbaiki sendiri kekeliruan hitung", points: 25 }
    ]
  },
  {
    aspectKey: "active",
    titleEnglish: "Keaktifan & Kemandirian Belajar",
    titleCalistung: "Keaktifan & Kemandirian Belajar",
    criteria: [
      { id: "ma_1", label: "Fokus, tertib, dan tidak mudah menyerah saat menghadapi soal rumit", points: 25 },
      { id: "ma_2", label: "Antusias mencoba berbagai variasi latihan matematika di kelas", points: 25 },
      { id: "ma_3", label: "Mandiri dalam mengerjakan tugas tanpa ketergantungan konstan", points: 25 },
      { id: "ma_4", label: "Memiliki rasa ingin tahu tinggi dan berani bertanya hal yang belum dipahami", points: 25 }
    ]
  }
];

export function getMathDraftNotes(achievedLabels: string[]): string {
  if (achievedLabels.length === 0) {
    return "Siswa memerlukan bimbingan rutin dalam memperkuat pemahaman konsep hitung dan latihan soal cerita matematika.";
  }
  const top = achievedLabels.slice(0, 3).join(", ");
  return `Ananda menunjukkan penguasaan matematika yang sangat baik: ${top}. Terus pertahankan ketelitian dan latihan soal berhitung di rumah.`;
}
