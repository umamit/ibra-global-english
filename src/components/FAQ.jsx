"use client";

import { useState } from "react";

const FAQ_DATA = [
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

export default function FAQ() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2>Tanya Jawab (FAQ) Kursus Bobong</h2>
          <p>Pertanyaan yang sering diajukan seputar kursus bahasa Inggris Ibra Global English di Bobong, Pulau Taliabu</p>
        </div>

        <div className="faq-container">
          <div className="faq-list">
            {FAQ_DATA.map((faq) => (
              <div key={faq.id} className={`faq-item ${activeFaq === faq.id ? "active" : ""}`} data-aos="fade-up">
                <button 
                  className="faq-trigger" 
                  aria-expanded={activeFaq === faq.id} 
                  aria-controls={`faq-content-${faq.id}`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>
                <div id={`faq-content-${faq.id}`} className="faq-content" aria-hidden={activeFaq !== faq.id}>
                  <div className="faq-content-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
