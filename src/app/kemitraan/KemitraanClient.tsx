"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import AIChatWidget from "@/components/AIChatWidget";
import MarqueeBanner from "@/components/MarqueeBanner";
import { SITE_CONFIG } from "@/config/siteConfig";
import "./kemitraan.css";

interface FAQItem {
  question: string;
  answer: string;
}

const KEMITRAAN_FAQS: FAQItem[] = [
  {
    question: "Apakah pihak sekolah / instansi mitra perlu mengeluarkan anggaran/biaya?",
    answer: "SAMA SEKALI TIDAK. Kerja sama ini 100% GRATIS untuk sekolah/instansi mitra. Pihak sekolah tidak perlu mengalokasikan anggaran sekolah atau dana BOS sepeser pun."
  },
  {
    question: "Siapa yang membayarkan biaya kursus siswa?",
    answer: "Biaya kursus (SPP bulanan) dibayarkan mandiri oleh orang tua murid. Sebagai siswa dari sekolah mitra, orang tua murid justru mendapatkan keuntungan khusus berupa Bebas Biaya Pendaftaran dan Voucher Potongan Khusus."
  },
  {
    question: "Apakah sesi Diagnostic Test gratis mengganggu jam pelajaran sekolah?",
    answer: "Tidak mengganggu. Pelaksanaan Diagnostic Test gratis disesuaikan sepenuhnya dengan waktu luang yang disepakati sekolah (misal saat jam pelajaran seni/olahraga atau sesi kegiatan ekstra)."
  },
  {
    question: "Bagaimana cara sekolah kami mendaftar menjadi mitra rujukan resmi?",
    answer: "Sangat mudah. Pihak Kepala Sekolah, Guru, atau Perwakilan Sekolah cukup mengisi formulir di bawah ini atau menghubungi WhatsApp resmi Direksi Ibra Global English Bobong untuk diskusi singkat."
  }
];

export default function KemitraanClient() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [form, setForm] = useState({
    institution_name: "",
    rep_name: "",
    rep_role: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setTimeout(() => {
      setTheme(initialTheme === "dark" ? "dark" : "light");
    }, 0);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.institution_name || !form.rep_name || !form.phone) {
      alert("Mohon lengkapi Nama Sekolah/Instansi, Nama Perwakilan, dan Nomor WhatsApp.");
      return;
    }

    const targetPhone = SITE_CONFIG.contact.phoneRaw;
    const message = `Halo Ibra Global English, saya ingin mengajukan diskusi *Kemitraan Rekomendasi Resmi*.\n\n*Nama Sekolah/Instansi:* ${form.institution_name}\n*Nama Perwakilan:* ${form.rep_name} (${form.rep_role || "Perwakilan"})\n*Nomor WhatsApp:* ${form.phone}\n*Catatan/Pesan:* ${form.notes || "-"}`;
    const encoded = encodeURIComponent(message);

    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, "_blank");
  };

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} hasMarquee={true} />
      <MarqueeBanner />

      <main className="kemitraan-wrapper">
        {/* Hero Section */}
        <section className="kemitraan-hero-section">
          <div className="kemitraan-container">
            <span className="kemitraan-eyebrow">Program Mitra Rekomendasi Resmi</span>
            <h1 className="kemitraan-hero-headline">
              Tingkatkan Prestasi Bahasa Inggris Siswa Anda — Mari Bergabung Menjadi Mitra Sekolah Pertama Ibra Global English di Bobong
            </h1>
            <p className="kemitraan-hero-subhead">
              Ibra Global English Bobong mengundang Sekolah (SD/SMP/SMA) dan Dinas/Instansi di Kabupaten Pulau Taliabu untuk bergabung sebagai mitra rujukan resmi. Dapatkan akses Diagnostic Test gratis dan voucher pendaftaran khusus untuk siswa Anda.
            </p>

            {/* Banner Transparansi Biaya */}
            <div className="fee-notice-banner" style={{ maxWidth: "800px", marginInline: "auto", marginTop: "2rem" }}>
              <div className="fee-notice-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="fee-notice-text" style={{ textAlign: "left" }}>
                <h3>100% Bebas Biaya untuk Sekolah & Instansi</h3>
                <p>
                  Kerja sama ini <strong>tidak menggunakan anggaran sekolah/dana BOS</strong>. Pihak sekolah memfasilitasi rujukan & tes gratis, dan biaya SPP bulanan dibayarkan mandiri oleh orang tua murid dengan voucher pendaftaran khusus.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="kemitraan-container" style={{ paddingBottom: "5rem" }}>
          {/* Value Proposition Cards */}
          <section className="kemitraan-section">
            <h2 className="kemitraan-section-title">Keuntungan Utama untuk Sekolah & Instansi Mitra</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3>Diagnostic Test Gratis</h3>
                <p>
                  Siswa di sekolah mitra berhak mengikuti tes pemetaan kemampuan bahasa Inggris gratis untuk mengukur level awal bahasa Inggris secara objektif.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <h3>Voucher & Potongan Pendaftaran</h3>
                <p>
                  Siswa rekomendasi dari sekolah mitra mendapatkan pendaftaran bebas biaya admin serta voucher potongan pendaftaran khusus di Ibra Global English Bobong.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3>Laporan Capaian untuk Sekolah</h3>
                <p>
                  Pihak sekolah menerima Laporan CapaianPrestasi (Skor Speaking, Kehadiran, Evaluasi Grammar, & Sertifikat Level CEFR) untuk portofolio & akreditasi.
                </p>
              </div>
            </div>
          </section>

          {/* 3-Step Timeline */}
          <section className="kemitraan-section">
            <h2 className="kemitraan-section-title">3 Langkah Mudah Menjadi Mitra Sekolah Pertama</h2>
            <div className="timeline-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Diskusi & Penandatanganan Bebas Biaya</h4>
                  <p>Kesepakatan rujukan sederhana — 100% gratis tanpa mengenakan biaya apapun kepada pihak sekolah/instansi mitra.</p>
                </div>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Sesi Diagnostic Test Gratis</h4>
                  <p>Tim Ibra Global English memfasilitasi tes pemetaan bahasa Inggris gratis bagi siswa di sekolah mitra.</p>
                </div>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Pembelajaran & Laporan Progress</h4>
                  <p>Siswa belajar di gedung Ibra Global English Bobong, dan sekolah menerima laporan hasil belajar berkala.</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Kemitraan */}
          <section className="kemitraan-section">
            <h2 className="kemitraan-section-title">Pertanyaan Sering Ditanyakan (FAQ Kemitraan)</h2>
            <div className="kemitraan-faq-grid">
              {KEMITRAAN_FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="kemitraan-faq-item"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  >
                    <div className="faq-question-row">
                      <h4>{faq.question}</h4>
                      <span className="faq-toggle-icon" style={{ transform: isOpen ? "rotate(45deg)" : "none" }}>
                        +
                      </span>
                    </div>
                    {isOpen && <div className="faq-answer">{faq.answer}</div>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Form Ajakan Kemitraan */}
          <section className="kemitraan-section">
            <div className="kemitraan-form-card">
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, textAlign: "center", marginBottom: "0.5rem", color: "var(--color-gray-900)" }}>
                Formulir Pengajuan Diskusi Kemitraan
              </h2>
              <p style={{ fontSize: "0.92rem", color: "var(--color-gray-600)", textAlign: "center", marginBottom: "1.75rem", lineHeight: 1.6 }}>
                Isi formulir ringkas di bawah ini untuk menjadwalkan diskusi santai bersama Direksi Ibra Global English Bobong via WhatsApp.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="institution_name">Nama Sekolah / Instansi / Dinas *</label>
                  <input
                    type="text"
                    id="institution_name"
                    className="form-input"
                    placeholder="Contoh: SD Negeri 1 Bobong / SMP N 2 Taliabu"
                    value={form.institution_name}
                    onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rep_name">Nama Lengkap Perwakilan *</label>
                  <input
                    type="text"
                    id="rep_name"
                    className="form-input"
                    placeholder="Contoh: Bapak Ahmad / Ibu Maria"
                    value={form.rep_name}
                    onChange={(e) => setForm({ ...form, rep_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rep_role">Jabatan / Peran di Sekolah/Instansi</label>
                  <input
                    type="text"
                    id="rep_role"
                    className="form-input"
                    placeholder="Contoh: Kepala Sekolah / Guru Bahasa Inggris / Staf"
                    value={form.rep_role}
                    onChange={(e) => setForm({ ...form, rep_role: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Nomor WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    placeholder="Contoh: 081357001357"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Pesan / Catatan Tambahan (Opsional)</label>
                  <textarea
                    id="notes"
                    className="form-input"
                    style={{ minHeight: "85px", resize: "vertical" }}
                    placeholder="Contoh: Berminat mengadakan Diagnostic Test gratis untuk siswa kelas 5 & 6."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="submit-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Kirim Pengajuan Diskusi via WhatsApp
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <SocialFloat />
      <AIChatWidget />
      <Footer />
    </>
  );
}
