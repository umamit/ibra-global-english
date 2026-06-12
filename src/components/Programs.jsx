"use client";

const PROGRAMS_DATA = [
  {
    title: "Kids Program",
    age: "5-12 tahun",
    desc: "Program khusus anak dengan metode belajar yang fun dan interaktif",
    delay: 0,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    features: ["Materi Visual", "Games & Activities", "Story Telling"]
  },
  {
    title: "Teens Program",
    age: "13-17 tahun",
    desc: "Program remaja fokus conversation dan grammar",
    delay: 100,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      </svg>
    ),
    features: ["Speaking Practice", "Grammar", "Writing Skills"]
  },
  {
    title: "Fun Calistung",
    age: "5-7 tahun",
    desc: "Program membaca, menulis, dan berhitung yang menyenangkan bagi anak usia dini",
    delay: 200,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    features: ["Belajar Membaca", "Belajar Menulis", "Belajar Berhitung"]
  }
];

export default function Programs() {
  return (
    <section id="programs" className="programs-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Program Kursus di Bobong</h2>
          <p>Pilih program kursus bahasa Inggris dan bimbingan belajar terbaik untuk Anda di Pulau Taliabu</p>
        </div>
        
        <div className="programs-grid">
          {PROGRAMS_DATA.map((prog, idx) => (
            <div key={idx} className="program-card glowing-card" data-aos="fade-up" data-aos-delay={prog.delay}>
              <div className="program-icon-box">
                {prog.icon}
              </div>
              <h3>{prog.title}</h3>
              <p className="program-age">{prog.age}</p>
              <p className="program-desc">{prog.desc}</p>
              <ul className="program-features">
                {prog.features.map((feature, fIdx) => (
                  <li key={fIdx}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
