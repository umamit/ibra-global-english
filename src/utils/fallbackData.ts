export interface NavigationItem {
  label: string;
  path: string;
}

export interface Program {
  title: string;
  age: string;
  desc: string;
  iconKey: string;
  features: string[];
}

export interface Benefit {
  title: string;
  desc: string;
  iconKey: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface Video {
  title: string;
  desc: string;
  url: string;
}

export interface TaxRecord {
  id: string;
  tax_year: number;
  tax_period: string;
  tax_type: string;
  gross_revenue: number;
  tax_due: number;
  status: string;
  payment_date: string;
  ntpn_code: string;
  bpe_code: string;
}

export interface TaxAsset {
  id: string;
  name: string;
  group: string;
  purchase_date: string;
  purchase_price: number;
}

export const DEFAULT_PROGRAMS: Program[] = [
  {
    title: "Kids Program",
    age: "5-12 tahun",
    desc: "Program khusus anak dengan metode belajar yang menyenangkan (fun), interaktif, dan penuh lagu/permainan",
    iconKey: "book",
    features: ["Materi Visual", "Games & Activities", "Story Telling"]
  },
  {
    title: "Teens Program",
    age: "13-17 tahun",
    desc: "Program remaja yang berfokus pada kelancaran berbicara (conversation) dan penguasaan tata bahasa (grammar)",
    iconKey: "graduation",
    features: ["Speaking Practice", "Grammar", "Writing Skills"]
  },
  {
    title: "Fun Calistung",
    age: "5-7 tahun",
    desc: "Program membaca, menulis, dan berhitung yang menyenangkan bagi anak usia dini",
    iconKey: "users",
    features: ["Belajar Membaca", "Belajar Menulis", "Belajar Berhitung"]
  }
];

export const DEFAULT_BENEFITS: Benefit[] = [
  {
    title: "Kelas Kecil",
    desc: "Maksimal 10 siswa per kelas untuk interaksi yang lebih personal.",
    iconKey: "users"
  },
  {
    title: "Experienced Teacher",
    desc: "Pengajar berpengalaman yang ramah, interaktif, dan profesional.",
    iconKey: "award"
  },
  {
    title: "Jadwal Fleksibel",
    desc: "Sesuaikan waktu kursus dengan kesibukan harian Anda.",
    iconKey: "clock"
  },
  {
    title: "Sertifikat",
    desc: "Sertifikat resmi kelulusan setiap kali menyelesaikan satu level.",
    iconKey: "trophy"
  },
  {
    title: "Speaking Focus",
    desc: "Praktek berbicara bahasa Inggris intensif di setiap pertemuan.",
    iconKey: "message"
  },
  {
    title: "Free Placement Test",
    desc: "Tes kemampuan awal gratis untuk menentukan kelas yang tepat.",
    iconKey: "check"
  }
];

export const DEFAULT_FAQS: FAQ[] = [
  {
    id: 1,
    question: "Bagaimana jika saya atau anak saya benar-benar pemula (belum bisa bahasa Inggris)?",
    answer: "Tidak perlu khawatir. Program kami dirancang ramah untuk pemula. Tutor kami akan membimbing secara perlahan dari materi paling dasar (seperti kosa kata dasar dan pelafalan sederhana) dengan metode interaktif tanpa tekanan, sehingga siswa dapat membangun rasa percaya diri terlebih dahulu."
  },
  {
    id: 2,
    question: "Berapa kali pertemuan dalam seminggu dan berapa durasi setiap kelas?",
    answer: "Kelas biasanya diadakan 2 hingga 3 kali seminggu, bergantung pada program yang Anda pilih. Setiap sesi pertemuan berlangsung selama 90 menit (1,5 jam), yang merupakan durasi ideal untuk penyampaian materi secara terstruktur sekaligus praktek berbicara (speaking practice) yang maksimal."
  },
  {
    id: 3,
    question: "Bagaimana jika siswa berhalangan hadir pada jadwal kelas?",
    answer: "Kami menyediakan sesi kelas pengganti (make-up class) atau siswa dapat berkonsultasi langsung dengan tutor untuk mengejar materi yang tertinggal agar proses belajar tetap berkelanjutan tanpa hambatan."
  },
  {
    id: 4,
    question: "Apakah orang tua bisa memantau perkembangan belajar anak?",
    answer: "Tentu saja. Kami selalu memberikan laporan perkembangan belajar (Progress Report) secara berkala kepada orang tua siswa di setiap akhir level atau modul. Dengan laporan ini, orang tua dapat melihat perkembangan kosakata, pelafalan, serta keaktifan belajar anak secara transparan."
  },
  {
    id: 5,
    question: "Bagaimana metode pembayaran biaya kursus di Ibra Global English Bobong?",
    answer: "Pembayaran dapat dilakukan secara tunai langsung di kantor pendaftaran kami, atau melalui transfer bank ke rekening bank kami. Kami juga menawarkan fleksibilitas pembayaran bulanan untuk meringankan beban biaya pendidikan."
  },
  {
    id: 6,
    question: "Apakah Ibra Global English melayani siswa dari luar kota Bobong (seluruh wilayah Pulau Taliabu)?",
    answer: "Ya, tentu saja. Kami melayani seluruh calon peserta kursus bahasa Inggris dan bimbingan belajar dari berbagai wilayah di Kabupaten Pulau Taliabu. Jadwal dan program belajar kami dirancang fleksibel sehingga dapat diikuti oleh siswa yang berdomisili baik di dalam maupun di luar kota Bobong."
  }
];

export const DEFAULT_VIDEOS: Video[] = [
  {
    title: "Keseruan Belajar Bahasa Inggris Kids Program",
    desc: "Dokumentasi kelas interaktif yang menyenangkan dan penuh warna di Bobong, Pulau Taliabu.",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    title: "Latihan Percakapan (Speaking Practice) Kelas Teens",
    desc: "Siswa remaja aktif berdiskusi kelompok untuk melatih keberanian berbicara bahasa Inggris.",
    url: "https://www.youtube.com/embed/tgbNymZ7vqY"
  }
];

export const DEFAULT_TAX_RECORDS: TaxRecord[] = [
  {
    id: "1",
    tax_year: 2025,
    tax_period: "Tahunan",
    tax_type: "PPh Badan Pasal 31E (Fasilitas)",
    gross_revenue: 150000000,
    tax_due: 8250000,
    status: "Sudah Dilaporkan",
    payment_date: "2026-04-15",
    ntpn_code: "1234567890ABCDEF",
    bpe_code: "BPE-2025-1771-001"
  },
  {
    id: "2",
    tax_year: 2026,
    tax_period: "Mei",
    tax_type: "PPh Final 0.5% (PP 55/2022)",
    gross_revenue: 18000000,
    tax_due: 90000,
    status: "Sudah Bayar",
    payment_date: "2026-06-10",
    ntpn_code: "9876543210FEDCBA",
    bpe_code: "BPE-2026-05-002"
  }
];

export const DEFAULT_TAX_ASSETS: TaxAsset[] = [
  {
    id: "a1",
    name: "Laptop Asus Zenbook (Admin & Tutor)",
    group: "Kelompok 1",
    purchase_date: "2024-01-15",
    purchase_price: 12000000
  },
  {
    id: "a2",
    name: "Air Conditioner (AC) Daikin 1 PK",
    group: "Kelompok 2",
    purchase_date: "2025-07-20",
    purchase_price: 6000000
  }
];

export const DEFAULT_NAVIGATION_MENU: NavigationItem[] = [
  { label: "Home", path: "/#home" },
  { label: "Tentang Kami", path: "/about" },
  { label: "Program", path: "/#programs" },
  { label: "Galeri", path: "/gallery" },
  { label: "Tes Penempatan", path: "/placement-test" },
  { label: "FAQ", path: "/#faq" }
];
