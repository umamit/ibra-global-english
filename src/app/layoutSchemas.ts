// SEO Schema Data for Ibra Global English
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PT. IBRA Global English",
  "alternateName": ["PT IBRA Global English", "Ibra Global English Bobong", "Ibra Global English"],
  "url": "https://www.ibraglobalenglish.uk/"
};

export const educationalOrgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "PT. IBRA Global English",
  "alternateName": "Ibra Global English Bobong",
  "image": "https://www.ibraglobalenglish.uk/assets/logo.png",
  "url": "https://www.ibraglobalenglish.uk/",
  "telephone": "+6281357001357",
  "email": "admin@ibraglobalenglish.uk",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001",
    "addressLocality": "Bobong, Taliabu Barat",
    "addressRegion": "Kabupaten Pulau Taliabu, Maluku Utara",
    "postalCode": "97794",
    "addressCountry": "ID"
  },
  "description": "Kursus Bahasa Inggris offline dan bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu dengan metode interaktif, fun, dan tutor berpengalaman.",
  "sameAs": ["https://maps.app.goo.gl/weuM3h6yCu3rK3ov8", "https://www.facebook.com/IbraGlobalEnglish", "https://www.instagram.com/ibraglobalenglish/"],
  "offers": { "@type": "Offer", "category": "English Language Course" }
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Bagaimana jika saya atau anak saya benar-benar pemula (belum bisa bahasa Inggris)?", "acceptedAnswer": { "@type": "Answer", "text": "Tidak perlu khawatir. Program kami dirancang ramah untuk pemula. Tutor kami akan membimbing secara perlahan dari materi paling dasar (seperti kosa kata dasar dan pelafalan sederhana) dengan metode interaktif tanpa tekanan, sehingga siswa dapat membangun rasa percaya diri terlebih dahulu." } },
    { "@type": "Question", "name": "Berapa kali pertemuan dalam seminggu dan berapa durasi setiap kelas?", "acceptedAnswer": { "@type": "Answer", "text": "Kelas biasanya diadakan 2 hingga 3 kali seminggu, bergantung pada program yang Anda pilih. Setiap sesi pertemuan berlangsung selama 90 menit (1,5 jam), yang merupakan durasi ideal untuk penyampaian materi secara terstruktur sekaligus praktek berbicara (speaking practice) yang maksimal." } },
    { "@type": "Question", "name": "Bagaimana jika siswa berhalangan hadir pada jadwal kelas?", "acceptedAnswer": { "@type": "Answer", "text": "Kami menyediakan sesi kelas pengganti (make-up class) atau siswa dapat berkonsultasi langsung dengan tutor untuk mengejar materi yang tertinggal agar proses belajar tetap berkelanjutan tanpa hambatan." } },
    { "@type": "Question", "name": "Apakah orang tua bisa memantau perkembangan belajar anak?", "acceptedAnswer": { "@type": "Answer", "text": "Tentu saja. Kami selalu memberikan laporan perkembangan belajar (Progress Report) secara berkala kepada orang tua siswa di setiap akhir level atau modul. Dengan laporan ini, orang tua dapat melihat perkembangan kosakata, pelafalan, serta keaktifan belajar anak secara transparan." } },
    { "@type": "Question", "name": "Bagaimana metode pembayaran biaya kursus di Ibra Global English Bobong?", "acceptedAnswer": { "@type": "Answer", "text": "Pembayaran dapat dilakukan secara tunai langsung di kantor pendaftaran kami, atau melalui transfer bank ke rekening bank kami. Kami juga menawarkan fleksibilitas pembayaran bulanan untuk meringankan beban biaya pendidikan." } },
    { "@type": "Question", "name": "Apakah Ibra Global English melayani siswa dari luar kota Bobong (seluruh wilayah Pulau Taliabu)?", "acceptedAnswer": { "@type": "Answer", "text": "Ya, tentu saja. Kami melayani seluruh calon peserta kursus bahasa Inggris dan bimbingan belajar dari berbagai wilayah di Kabupaten Pulau Taliabu. Jadwal dan program belajar kami dirancang fleksibel sehingga dapat diikuti oleh siswa yang berdomisili baik di dalam maupun di luar kota Bobong." } }
  ]
};

export const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Beranda", "item": "https://www.ibraglobalenglish.uk/" },
    { "@type": "ListItem", "position": 2, "name": "Kemitraan Sekolah", "item": "https://www.ibraglobalenglish.uk/kemitraan" },
    { "@type": "ListItem", "position": 3, "name": "Placement Test", "item": "https://www.ibraglobalenglish.uk/placement-test" },
    { "@type": "ListItem", "position": 4, "name": "Galeri Kegiatan", "item": "https://www.ibraglobalenglish.uk/gallery" },
    { "@type": "ListItem", "position": 5, "name": "Tentang Kami", "item": "https://www.ibraglobalenglish.uk/about" }
  ]
};
