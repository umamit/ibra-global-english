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
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="kemitraan-section">
          <div className="kemitraan-container">
            <div className="kemitraan-section-title">
              <h2>Manfaat & Keuntungan Sekolah Mitra</h2>
              <p>Dukungan penuh untuk meningkatkan reputasi akademik dan kecakapan bahasa asing siswa Anda.</p>
            </div>

            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">🎯</div>
                <h3>Free English Diagnostic Test</h3>
                <p>Akses pemetaan kemampuan bahasa Inggris gratis untuk seluruh siswa sekolah mitra guna mengetahui level awal mereka secara akurat.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">🎟️</div>
                <h3>Voucher Khusus Siswa Mitra</h3>
                <p>Siswa dari sekolah mitra mendapatkan potongan biaya pendaftaran dan prioritas kuota kelas offline maupun online.</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">📜</div>
                <h3>Sertifikat Penghargaan Kemitraan</h3>
                <p>Sekolah menerima Piagam Kemitraan Resmi Ibra Global English sebagai pelopor pendukung literasi bahasa Inggris di Bobong.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Registration Section */}
        <section className="kemitraan-section kemitraan-form-section">
          <div className="kemitraan-container">
            <div className="kemitraan-form-card">
              <h2>Formulir Pengajuan Mitra Sekolah</h2>
              <p className="kemitraan-form-desc">Isi formulir singkat di bawah ini. Tim Ibra Global English akan menghubungi Anda untuk diskusi jadwal audiens resmi.</p>

              <form onSubmit={handleSubmit} className="kemitraan-form">
                <div className="kemitraan-form-grid">
                  <div className="form-group kemitraan-form-group">
                    <label htmlFor="institution_name">Nama Sekolah / Instansi *</label>
                    <input
                      id="institution_name"
                      type="text"
                      className="form-input"
                      required
                      placeholder="Contoh: SD Negeri 1 Bobong"
                      value={form.institution_name}
                      onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group kemitraan-form-group">
                    <label htmlFor="rep_name">Nama Penanggung Jawab / Perwakilan *</label>
                    <input
                      id="rep_name"
                      type="text"
                      className="form-input"
                      required
                      placeholder="Contoh: Bapak Ahmad, S.Pd."
                      value={form.rep_name}
                      onChange={(e) => setForm({ ...form, rep_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="kemitraan-form-grid">
                  <div className="form-group kemitraan-form-group">
                    <label htmlFor="rep_role">Jabatan Perwakilan *</label>
                    <input
                      id="rep_role"
                      type="text"
                      className="form-input"
                      required
                      placeholder="Contoh: Kepala Sekolah / Guru Bahasa Inggris"
                      value={form.rep_role}
                      onChange={(e) => setForm({ ...form, rep_role: e.target.value })}
                    />
                  </div>

                  <div className="form-group kemitraan-form-group">
                    <label htmlFor="phone">Nomor WhatsApp Aktif *</label>
                    <input
                      id="phone"
                      type="tel"
                      className="form-input"
                      required
                      placeholder="Contoh: 081234567890"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group kemitraan-form-group">
                  <label htmlFor="notes">Catatan Tambahan / Pesan Khusus (Opsional)</label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="form-input"
                    placeholder="Tuliskan harapan atau jadwal diskusi yang diinginkan..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="submit-btn kemitraan-submit-btn">
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

            <div className="kemitraan-faq-grid">
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
