// SEO Schema Data for Ibra Global English

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.ibraglobalenglish.uk/#website",
  "name": "PT. IBRA Global English",
  "alternateName": ["PT IBRA Global English", "Ibra Global English Bobong", "Ibra Global English"],
  "url": "https://www.ibraglobalenglish.uk/"
};

export const educationalOrgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": "https://www.ibraglobalenglish.uk/#organization",
  "name": "PT. IBRA Global English",
  "alternateName": "Ibra Global English Bobong",
  "image": "https://www.ibraglobalenglish.uk/assets/logo.png",
  "logo": "https://www.ibraglobalenglish.uk/assets/logo.png",
  "url": "https://www.ibraglobalenglish.uk/",
  "telephone": "+6281357001357",
  "email": "admin@ibraglobalenglish.uk",
  "priceRange": "$$",
  "currenciesAccepted": "IDR",
  "paymentAccepted": "Cash, Bank Transfer",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001",
    "addressLocality": "Bobong, Taliabu Barat",
    "addressRegion": "Kabupaten Pulau Taliabu, Maluku Utara",
    "postalCode": "97794",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -1.8841,
    "longitude": 124.3644
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "08:00",
      "closes": "21:00"
    }
  ],
  "description": "Kursus Bahasa Inggris offline dan bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu dengan metode interaktif, fun, dan tutor berpengalaman.",
  "sameAs": [
    "https://maps.app.goo.gl/weuM3h6yCu3rK3ov8",
    "https://www.facebook.com/IbraGlobalEnglish",
    "https://www.instagram.com/ibraglobalenglish/"
  ],
  "offers": { "@type": "Offer", "category": "English Language Course" }
};

export const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SiteNavigationElement",
      "name": "Program Belajar",
      "description": "Pilihan program belajar bahasa Inggris anak, remaja, dan bimbingan calistung.",
      "url": "https://www.ibraglobalenglish.uk/#programs"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Placement Test Online",
      "description": "Tes penempatan level bahasa Inggris online gratis bersertifikat digital.",
      "url": "https://www.ibraglobalenglish.uk/placement-test"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Kalender Akademik",
      "description": "Jadwal resmi KBM, ujian evaluasi, dan kalender kegiatan belajar mengajar.",
      "url": "https://www.ibraglobalenglish.uk/calendar"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Kemitraan Sekolah",
      "description": "Program kemitraan resmi untuk sekolah dan instansi di Pulau Taliabu.",
      "url": "https://www.ibraglobalenglish.uk/kemitraan"
    },
    {
      "@type": "SiteNavigationElement",
      "name": "Tentang Kami",
      "description": "Profil lembaga, SK Kemenkumham, visi misi, dan tim tutor profesional.",
      "url": "https://www.ibraglobalenglish.uk/about"
    }
  ]
};

export const coursesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "Course",
      "position": 1,
      "name": "Kids Program (Kursus Bahasa Inggris Anak)",
      "description": "Program belajar bahasa Inggris interaktif untuk usia 5-12 tahun dengan metode fun learning, games, lagu, dan visual untuk membangun kecintaan berbahasa Inggris sejak dini.",
      "url": "https://www.ibraglobalenglish.uk/#programs",
      "provider": {
        "@type": "EducationalOrganization",
        "@id": "https://www.ibraglobalenglish.uk/#organization",
        "name": "PT. IBRA Global English"
      },
      "educationalLevel": "Beginner / Elementary",
      "inLanguage": "id, en"
    },
    {
      "@type": "Course",
      "position": 2,
      "name": "Teens Program (Kursus Bahasa Inggris Remaja)",
      "description": "Program peningkatan kemampuan berbicara (speaking practice), tata bahasa (grammar), kosakata, serta melatih kepercayaan diri presentasi dan diskusi untuk usia 13-17 tahun.",
      "url": "https://www.ibraglobalenglish.uk/#programs",
      "provider": {
        "@type": "EducationalOrganization",
        "@id": "https://www.ibraglobalenglish.uk/#organization",
        "name": "PT. IBRA Global English"
      },
      "educationalLevel": "Intermediate / Upper-Intermediate",
      "inLanguage": "id, en"
    },
    {
      "@type": "Course",
      "position": 3,
      "name": "Fun Calistung (Bimbingan Baca, Tulis & Hitung)",
      "description": "Bimbingan belajar dasar membaca, menulis, dan berhitung untuk anak usia 5-7 tahun dengan pendekatan ramah anak dan metode bermain sambil belajar.",
      "url": "https://www.ibraglobalenglish.uk/#programs",
      "provider": {
        "@type": "EducationalOrganization",
        "@id": "https://www.ibraglobalenglish.uk/#organization",
        "name": "PT. IBRA Global English"
      },
      "educationalLevel": "Preschool / Kindergarten",
      "inLanguage": "id"
    }
  ]
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Bagaimana jika saya atau anak saya benar-benar pemula (belum bisa bahasa Inggris)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tidak perlu khawatir. Program kami dirancang ramah untuk pemula. Tutor kami akan membimbing secara perlahan dari materi paling dasar dengan metode interaktif tanpa tekanan, sehingga siswa dapat membangun rasa percaya diri terlebih dahulu."
      }
    },
    {
      "@type": "Question",
      "name": "Berapa kali pertemuan dalam seminggu dan berapa durasi setiap kelas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kelas biasanya diadakan 2 hingga 3 kali seminggu, bergantung pada program yang Anda pilih. Setiap sesi pertemuan berlangsung selama 75 hingga 90 menit, durasi ideal untuk penyampaian materi sekaligus praktik berbicara (speaking practice) yang maksimal."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana jika siswa berhalangan hadir pada jadwal kelas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kami menyediakan sesi kelas pengganti (make-up class) atau siswa dapat berkonsultasi langsung dengan tutor untuk mengejar materi yang tertinggal agar proses belajar tetap berkelanjutan tanpa hambatan."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah orang tua bisa memantau perkembangan belajar anak?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tentu saja. Kami selalu memberikan laporan perkembangan belajar (Progress Report) secara berkala kepada orang tua siswa di setiap akhir level atau modul melalui portal Orang Tua resmi."
      }
    },
    {
      "@type": "Question",
      "name": "Bagaimana metode pembayaran biaya kursus di Ibra Global English Bobong?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pembayaran dapat dilakukan secara tunai langsung di kantor pendaftaran kami, atau melalui transfer bank ke rekening bank resmi kami dengan konfirmasi instan di portal Orang Tua."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah Ibra Global English melayani siswa dari luar kota Bobong (seluruh wilayah Pulau Taliabu)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya, tentu saja. Kami melayani seluruh calon peserta kursus bahasa Inggris dan bimbingan belajar dari berbagai wilayah di Kabupaten Pulau Taliabu dengan jadwal belajar yang fleksibel."
      }
    }
  ]
};
