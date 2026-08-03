"use client";

import React, { useState } from "react";
import styles from "../digital-agency.module.css";

export default function AgencyOrderForm() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    projectType: "Company Profile / Landing Page",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contact || !formData.details) {
      alert("Mohon lengkapi semua bidang formulir sebelum mengirim.");
      return;
    }

    const phoneNumber = "6281357001357";
    const textMessage = `Halo Ibra Digital, saya *${formData.name}* ingin memesan website.

*Detail Pesanan:*
- *Tipe Proyek:* ${formData.projectType}
- *Kontak Saya:* ${formData.contact}
- *Rincian Kebutuhan:*
${formData.details}

Mohon hubungi saya kembali. Terima kasih!`;

    const encodedText = encodeURIComponent(textMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  return (
    <div className={styles.contactSectionWrapper}>
      <section id="order" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Success Starts with the Right Strategy</h2>
          <p className={styles.sectionDesc}>
            Diskusikan kebutuhan SEO, Branding, atau Web & App Development bisnis Anda. Kami siap menjadi partner pertumbuhan digital Anda.
          </p>
        </div>
        
        <div className={styles.formSection}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "3rem", color: "var(--color-green)", marginBottom: "16px" }}>
                <i className="fi fi-rr-check-circle"></i>
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>Permintaan Dikirim!</h3>
              <p style={{ color: "var(--color-gray-500)", marginBottom: "24px" }}>
                Terima kasih, data Anda telah dikonfigurasi. Anda akan diarahkan ke obrolan WhatsApp kami untuk konsultasi lanjutan.
              </p>
              <button type="button" onClick={() => setSubmitted(false)} className={styles.btnSecondary}>
                Kirimi Formulir Lagi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>Nama Lengkap / Nama Bisnis</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Contoh: Ibra Global English"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact" className={styles.formLabel}>Nomor WhatsApp / Email Kontak</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="projectType" className={styles.formLabel}>Tipe Proyek Website</label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="Company Profile / Landing Page">Landing Page Premium</option>
                  <option value="Portal Bisnis / Custom Web App">Portal Bisnis / Custom Web App</option>
                  <option value="LMS / Sistem Edukasi">LMS & Sistem Edukasi</option>
                  <option value="Custom Project Lainnya">Custom Project Lainnya</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="details" className={styles.formLabel}>Jelaskan Singkat Kebutuhan Anda</label>
                <textarea
                  id="details"
                  name="details"
                  required
                  placeholder="Contoh: Saya butuh website landing page kursus dengan menu pendaftaran online dan galeri foto."
                  value={formData.details}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                />
              </div>

              <button type="submit" className={styles.btnSubmit}>
                Kirim & Hubungi via WhatsApp
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
