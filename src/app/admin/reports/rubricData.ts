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

export const RUBRIC_DATA_ENGLISH: AspectRubric[] = [
  {
    aspectKey: "speaking",
    titleEnglish: "Speaking (Kelancaran & Pengucapan)",
    titleCalistung: "Membaca",
    criteria: [
      { id: "sp_1", label: "Berani bercakap dan merespons pertanyaan lisan tutor secara mandiri", points: 25 },
      { id: "sp_2", label: "Pengucapan kata (pronunciation) jelas dan mudah dipahami", points: 25 },
      { id: "sp_3", label: "Mampu menjawab dan merangkai kata dalam struktur kalimat sederhana", points: 25 },
      { id: "sp_4", label: "Lancar bercakap tanpa jeda panjang atau rasa ragu berlebih", points: 25 }
    ]
  },
  {
    aspectKey: "grammar",
    titleEnglish: "Grammar (Tata Bahasa & Struktur Kalimat)",
    titleCalistung: "Menulis",
    criteria: [
      { id: "gr_1", label: "Memahami dan menerapkan pola tata bahasa modul dengan baik", points: 25 },
      { id: "gr_2", label: "Mampu menyusun bentuk kalimat positif, negatif, dan tanya sederhana", points: 25 },
      { id: "gr_3", label: "Minim kesalahan susunan kata (word order) pada latihan modul", points: 25 },
      { id: "gr_4", label: "Mampu mengoreksi sendiri kekeliruan struktur kalimat setelah diberi contoh", points: 25 }
    ]
  },
  {
    aspectKey: "vocabulary",
    titleEnglish: "Vocabulary (Kosakata & Penguasaan Kata)",
    titleCalistung: "Berhitung",
    criteria: [
      { id: "vo_1", label: "Menguasai kosakata baru yang diajarkan dalam bab modul ini", points: 25 },
      { id: "vo_2", label: "Mampu mengingat arti dan ejaan kata dengan tepat", points: 25 },
      { id: "vo_3", label: "Dapat menggunakan kata baru dalam konteks kalimat yang sesuai", points: 25 },
      { id: "vo_4", label: "Memiliki daya ingat kata yang kuat tanpa bergantung penuh pada petunjuk gambar", points: 25 }
    ]
  },
  {
    aspectKey: "active",
    titleEnglish: "Active (Keaktifan & Partisipasi Belajar)",
    titleCalistung: "Keaktifan",
    criteria: [
      { id: "ac_1", label: "Hadir tepat waktu dan mengikuti instruksi tutor dengan sangat baik", points: 25 },
      { id: "ac_2", label: "Antusias dan aktif berpartisipasi dalam sesi percakapan/diskusi kelas", points: 25 },
      { id: "ac_3", label: "Konsisten fokus dan tidak mudah terdistraksi sepanjang bimbingan", points: 25 },
      { id: "ac_4", label: "Semangat menyelesaikan semua latihan modul hingga tuntas", points: 25 }
    ]
  }
];

export const RUBRIC_DATA_CALISTUNG: AspectRubric[] = [
  {
    aspectKey: "speaking",
    titleEnglish: "Speaking",
    titleCalistung: "Membaca (Literasi Dasar)",
    criteria: [
      { id: "mb_1", label: "Mengenal dan membunyikan huruf kapital & kecil (A-Z) dengan jelas", points: 25 },
      { id: "mb_2", label: "Mampu mengeja gabungan suku kata terbuka (ba-bi-bu-be-bo, dll)", points: 25 },
      { id: "mb_3", label: "Lancar membaca kata sederhana 2-3 suku kata (misal: sa-ya, bu-ku)", points: 25 },
      { id: "mb_4", label: "Mampu membaca kalimat pendek secara lancar dan memahami artinya", points: 25 }
    ]
  },
  {
    aspectKey: "grammar",
    titleEnglish: "Grammar",
    titleCalistung: "Menulis (Motorik Halus)",
    criteria: [
      { id: "mn_1", label: "Posisi memegang pensil & kontrol motorik halus sudah baik dan stabil", points: 25 },
      { id: "mn_2", label: "Menyalin/menulis huruf dan angka dengan bentuk rapi & proporsional", points: 25 },
      { id: "mn_3", label: "Penulisan tidak terbalik (tidak tertukar b/d, p/q, atau angka 2/3/5)", points: 25 },
      { id: "mn_4", label: "Mampu menuliskan kata atau kalimat pendek dari instruksi/dikte tutor", points: 25 }
    ]
  },
  {
    aspectKey: "vocabulary",
    titleEnglish: "Vocabulary",
    titleCalistung: "Berhitung (Numerasi Dasar)",
    criteria: [
      { id: "bh_1", label: "Mengenal dan membilang urutan angka dengan tepat (1 sampai 20+)", points: 25 },
      { id: "bh_2", label: "Memahami konsep jumlah & membilang objek/gambar dengan cermat", points: 25 },
      { id: "bh_3", label: "Mampu melakukan operasi penjumlahan dasar dengan/tanpa alat bantu", points: 25 },
      { id: "bh_4", label: "Mampu melakukan pengurangan sederhana & memecahkan soal logika bergambar", points: 25 }
    ]
  },
  {
    aspectKey: "active",
    titleEnglish: "Active",
    titleCalistung: "Keaktifan & Kemandirian",
    criteria: [
      { id: "ka_1", label: "Ceria, fokus, dan antusias mengikuti sesi permainan edukatif", points: 25 },
      { id: "ka_2", label: "Dapat mendengarkan dan mengikuti instruksi tutor dengan baik", points: 25 },
      { id: "ka_3", label: "Mandiri dalam mengerjakan latihan tanpa selalu tergantung pada tuntunan", points: 25 },
      { id: "ka_4", label: "Disiplin merapikan alat tulis & menunjukkan dorongan belajar yang baik", points: 25 }
    ]
  }
];

export function calculateScoreFromRubric(selectedIds: string[], aspectRubrics: AspectRubric[]): {
  speaking: number;
  grammar: number;
  vocabulary: number;
  active: number;
} {
  const scores = {
    speaking: 0,
    grammar: 0,
    vocabulary: 0,
    active: 0
  };

  aspectRubrics.forEach(rubric => {
    let total = 0;
    rubric.criteria.forEach(c => {
      if (selectedIds.includes(c.id)) {
        total += c.points;
      }
    });
    (scores as Record<string, number>)[rubric.aspectKey] = Math.min(100, Math.max(0, total));
  });

  return scores;
}

export function generateDraftNotesFromRubric(selectedIds: string[], isCalistung: boolean): string {
  const rubrics = isCalistung ? RUBRIC_DATA_CALISTUNG : RUBRIC_DATA_ENGLISH;
  const achievedLabels: string[] = [];

  rubrics.forEach(r => {
    r.criteria.forEach(c => {
      if (selectedIds.includes(c.id)) {
        achievedLabels.push(c.label.toLowerCase());
      }
    });
  });

  if (achievedLabels.length === 0) {
    return isCalistung
      ? "Siswa masih memerlukan bimbingan rutin untuk mencapai indikator membaca, menulis, dan berhitung modul."
      : "Siswa memerlukan latihan lebih intensif pada modul ini untuk meningkatkan kelancaran percakapan dan tata bahasa.";
  }

  const topAchievements = achievedLabels.slice(0, 3).join(", ");
  if (isCalistung) {
    return `Ananda menunjukkan perkembangan yang sangat baik dalam indikator modul ini: ${topAchievements}. Terus latih konsistensi membaca dan berhitung di rumah.`;
  } else {
    return `Siswa menunjukkan pencapaian baik pada indikator modul ini: ${topAchievements}. Terus pertahankan kelancaran dan rasa percaya dirinya dalam berkomunikasi.`;
  }
}
