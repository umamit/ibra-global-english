"use client";

const GALLERY_DATA = [
  {
    title: "Kids Interactive Study",
    desc: "Belajar seru melalui aktivitas kelompok",
    thumb: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop",
    full: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop",
    caption: "Kegiatan Belajar Kelompok Anak-Anak",
    delay: 0,
    alt: "Anak-anak belajar berkelompok dengan menyenangkan"
  },
  {
    title: "Speaking Practice Session",
    desc: "Membangun kepercayaan diri berbicara di depan umum",
    thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop",
    full: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop",
    caption: "Latihan Percakapan (Speaking Practice) Kelas Dewasa",
    delay: 100,
    alt: "Siswa kelas dewasa sedang berlatih percakapan"
  },
  {
    title: "Experienced Teaching",
    desc: "Materi disampaikan dengan metode yang mudah dipahami",
    thumb: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop",
    full: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&auto=format&fit=crop",
    caption: "Penjelasan Materi oleh Experienced Teacher",
    delay: 200,
    alt: "Pengajar menjelaskan materi di papan tulis"
  },
  {
    title: "Fun Classroom Games",
    desc: "Belajar aktif tanpa rasa bosan",
    thumb: "/assets/fun_classroom_games.jpg",
    full: "/assets/fun_classroom_games.jpg",
    caption: "Aktivitas Games & Kuis Interaktif",
    delay: 300,
    alt: "Siswa tersenyum gembira saat mengikuti kuis"
  },
  {
    title: "Interactive Study Group",
    desc: "Kolaborasi aktif antar siswa dalam memecahkan soal",
    thumb: "/assets/interactive_study_group.jpg",
    full: "/assets/interactive_study_group.jpg",
    caption: "Suasana Belajar Kelompok di Kelas",
    delay: 400,
    alt: "Siswa belajar bersama dengan ceria"
  },
  {
    title: "Teens Project Discussion",
    desc: "Meningkatkan kemampuan tata bahasa dan menulis bersama",
    thumb: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop",
    full: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop",
    caption: "Diskusi Kelompok Kelas Teens Program",
    delay: 500,
    alt: "Siswa remaja sedang berdiskusi kelompok"
  }
];

export default function Gallery({ onOpenLightbox }) {
  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Galeri Kegiatan Kami di Bobong</h2>
          <p>Melihat lebih dekat keseruan belajar bahasa Inggris di Ibra Global English Bobong</p>
        </div>
        
        <div className="gallery-grid">
          {GALLERY_DATA.map((item, idx) => (
            <div 
              key={idx}
              className="gallery-item" 
              data-aos="fade-up"
              data-aos-delay={item.delay}
              onClick={() => onOpenLightbox(item.full, item.caption)}
            >
              <img src={item.thumb} alt={item.alt} loading="lazy" />
              <div className="gallery-overlay">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
