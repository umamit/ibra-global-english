"use client";

const BENEFITS_DATA = [
  {
    title: "Kelas Kecil",
    desc: "Maksimal 10 siswa per kelas untuk interaksi yang lebih personal.",
    delay: 0,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    title: "Experienced Teacher",
    desc: "Pengajar berpengalaman yang interaktif dan profesional.",
    delay: 100,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    )
  },
  {
    title: "Jadwal Fleksibel",
    desc: "Sesuaikan waktu kursus dengan kesibukan harian Anda.",
    delay: 200,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  {
    title: "Sertifikat",
    desc: "Sertifikat resmi kelulusan setiap kali menyelesaikan satu level.",
    delay: 300,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 3 0 0 0 12 0V2Z" />
      </svg>
    )
  },
  {
    title: "Speaking Focus",
    desc: "Praktek berbicara bahasa Inggris intensif di setiap pertemuan.",
    delay: 400,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    )
  },
  {
    title: "Free Placement Test",
    desc: "Tes kemampuan awal gratis untuk menentukan kelas yang tepat.",
    delay: 500,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    )
  }
];

export default function Benefits() {
  return (
    <section id="benefits" className="benefits-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Mengapa Pilih Ibra Global English Bobong?</h2>
          <p>Keunggulan kursus bahasa Inggris kami di Pulau Taliabu</p>
        </div>
        
        <div className="benefits-grid">
          {BENEFITS_DATA.map((b, idx) => (
            <div key={idx} className="benefit-card" data-aos="fade-up" data-aos-delay={b.delay}>
              <div className="benefit-icon-box">
                {b.icon}
              </div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
