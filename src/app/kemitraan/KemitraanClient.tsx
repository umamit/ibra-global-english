"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import AIChatWidget from "@/components/AIChatWidget";
import MarqueeBanner from "@/components/MarqueeBanner";
import { useKemitraan } from "@/hooks/useKemitraan";
import "./kemitraan.css";

export default function KemitraanClient() {
  const {
    theme,
    toggleTheme,
    openFaqIndex,
    toggleFaq,
    form,
    setForm,
    handleSubmit,
    faqs,
  } = useKemitraan();

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
                💡
              </div>
              <div className="fee-notice-content">
                <h4>Transparansi Biaya & Model Kemitraan</h4>
                <p>
                  Kerja sama kemitraan ini <strong>100% Bebas Biaya (Tanpa Anggaran Sekolah/BOS)</strong>. Pihak sekolah cukup memberikan rekomendasi resmi dan memfasilitasi informasi Diagnostic Test gratis. Biaya belajar siswa dibayarkan secara mandiri oleh orang tua murid dengan penawaran voucher khusus mitra.
                </p>
              </div>
            </div>

            <div className="kemitraan-cta-row">
              <a href="#form-kemitraan" className="kemitraan-btn-primary">
                Ajukan Kerja Sama Sekolah
              </a>
              <a href="/docs/Proposal_Kemitraan_Ibra_Global_English.pdf" download target="_blank" rel="noopener noreferrer" className="kemitraan-btn-secondary">
                📄 Unduh Proposal Kemitraan (PDF)
              </a>
            </div>
          </div>
        </section>

        {/* Benefits Grid Section */}
        <section className="kemitraan-section">
          <div className="kemitraan-container">
            <div className="kemitraan-section-title">
              <h2>Keuntungan Kemitraan Bagi Sekolah & Instansi</h2>
              <p>Mengapa bermitra dengan Ibra Global English Bobong adalah langkah strategis bagi sekolah Anda?</p>
            </div>

            <div className="kemitraan-grid">
              <div className="kemitraan-card">
                <div className="kemitraan-card-icon">🎯</div>
                <h3>Free English Diagnostic Test</h3>
                <p>
                  Siswa sekolah mitra mendapatkan fasilitas evaluasi / tes pemetaan kemampuan bahasa Inggris secara <strong>GRATIS</strong> langsung oleh tim akademik profesional kami.
                </p>
              </div>

              <div className="kemitraan-card">
                <div className="kemitraan-card-icon">🏷️</div>
                <h3>Voucher Khusus Siswa Sekolah Mitra</h3>
                <p>
                  Siswa yang mendaftar dari sekolah mitra mendapatkan potongan khusus bebas biaya pendaftaran awal dan diskon biaya program bulanan.
                </p>
              </div>

              <div className="kemitraan-card">
                <div className="kemitraan-card-icon">📊</div>
                <h3>Laporan Perkembangan Akademik Berkala</h3>
                <p>
                  Pihak sekolah akan mendapatkan ringkasan laporan perkembangan nilai dan capaian level CEFR siswa yang mengikuti program di tempat kami sebagai bahan evaluasi prestasi sekolah.
                </p>
              </div>

              <div className="kemitraan-card">
                <div className="kemitraan-card-icon">🏆</div>
                <h3>Dukungan Lomba & Event Bahasa Inggris</h3>
                <p>
                  Kami siap memberikan bimbingan intensif dan dukungan gratis bagi siswa mitra yang mewakili sekolah dalam kompetisi pidato, debat, atau olimpiade bahasa Inggris tingkat daerah maupun nasional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section id="form-kemitraan" className="kemitraan-form-section">
          <div className="kemitraan-container">
            <div className="kemitraan-form-card">
              <div className="kemitraan-form-header">
                <h2>Formulir Pengajuan Kemitraan Sekolah / Instansi</h2>
                <p>Isi data singkat di bawah ini. Tim Direksi Ibra Global English Bobong akan segera menghubungi Anda melalui WhatsApp untuk diskusi lebih lanjut.</p>
              </div>

              <form onSubmit={handleSubmit} className="kemitraan-form">
                <div className="kemitraan-form-group">
                  <label htmlFor="institution_name">Nama Sekolah / Instansi *</label>
                  <input
                    id="institution_name"
                    type="text"
                    required
                    placeholder="Contoh: SD Negeri 1 Bobong / SMP Negeri 2 Taliabu"
                    value={form.institution_name}
                    onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                  />
                </div>

                <div className="kemitraan-form-grid">
                  <div className="kemitraan-form-group">
                    <label htmlFor="rep_name">Nama Lengkap Perwakilan *</label>
                    <input
                      id="rep_name"
                      type="text"
                      required
                      placeholder="Contoh: Ibu Rahmawati, S.Pd."
                      value={form.rep_name}
                      onChange={(e) => setForm({ ...form, rep_name: e.target.value })}
                    />
                  </div>

                  <div className="kemitraan-form-group">
                    <label htmlFor="rep_role">Jabatan / Peran</label>
                    <input
                      id="rep_role"
                      type="text"
                      placeholder="Contoh: Kepala Sekolah / Guru Bahasa Inggris / Kesiswaan"
                      value={form.rep_role}
                      onChange={(e) => setForm({ ...form, rep_role: e.target.value })}
                    />
                  </div>
                </div>

                <div className="kemitraan-form-group">
                  <label htmlFor="phone">Nomor WhatsApp Aktif *</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="kemitraan-form-group">
                  <label htmlFor="notes">Catatan Tambahan / Pesan Khusus (Opsional)</label>
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder="Tuliskan harapan atau jadwal diskusi yang diinginkan..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="kemitraan-submit-btn">
                  Kirim Pengajuan via WhatsApp Official 💬
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="kemitraan-section">
          <div className="kemitraan-container">
            <div className="kemitraan-section-title">
              <h2>Pertanyaan Sering Diajukan (FAQ Kemitraan)</h2>
              <p>Jawaban atas pertanyaan seputar skema dan pelaksanaan kerja sama sekolah mitra.</p>
            </div>

            <div className="kemitraan-faq-wrapper">
              {faqs.map((faq, idx) => (
                <div key={idx} className={`kemitraan-faq-item ${openFaqIndex === idx ? "active" : ""}`}>
                  <button
                    type="button"
                    className="kemitraan-faq-question"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={openFaqIndex === idx}
                  >
                    <span>{faq.question}</span>
                    <span className="kemitraan-faq-chevron">{openFaqIndex === idx ? "−" : "+"}</span>
                  </button>
                  {openFaqIndex === idx && (
                    <div className="kemitraan-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SocialFloat />
      <AIChatWidget />
    </>
  );
}
