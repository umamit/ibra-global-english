"use client";

import React from "react";
import styles from "./WorkingProcess.module.css";

/* ── Data Langkah Proses (Bahasa Indonesia) ── */
const PROCESS_STEPS = [
  {
    step: "01",
    title: "Analisis Kebutuhan",
    desc: "Kami melakukan riset mendalam untuk memahami kebutuhan bisnis, tujuan, dan tantangan teknis Anda. Tahap ini membantu menentukan pendekatan terbaik.",
    iconPosition: "bottom" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Perencanaan",
    desc: "Tim kami membuat rencana proyek terperinci yang mencakup milestone, timeline pengerjaan, dan alokasi sumber daya secara efisien.",
    iconPosition: "top" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Desain UI/UX",
    desc: "Kami merancang antarmuka dan pengalaman pengguna yang ramah, selaras dengan identitas brand dan ekspektasi pelanggan Anda.",
    iconPosition: "bottom" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Pengodean",
    desc: "Pengembang kami bekerja dengan teknologi modern dan standar industri tinggi untuk menciptakan solusi perangkat lunak yang andal.",
    iconPosition: "top" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Pengujian Ketat",
    desc: "Sebelum peluncuran, kami melakukan pengujian komprehensif (QA) untuk memastikan performa maksimal dan bebas dari bug.",
    iconPosition: "bottom" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    step: "06",
    title: "Peluncuran",
    desc: "Kami mengelola peluncuran sistem secara profesional untuk menjamin stabilitas integrasi dengan infrastruktur yang ada.",
    iconPosition: "top" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    ),
  },
  {
    step: "07",
    title: "Serah Terima & Dukungan",
    desc: "Memberikan dokumentasi lengkap, pelatihan tim, serta bantuan teknis berkelanjutan pasca-peluncuran sistem Anda.",
    iconPosition: "bottom" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    step: "08",
    title: "Pemeliharaan",
    desc: "Layanan pemeliharaan sistem berkala, pembaruan keamanan, dan pemantauan performa agar aplikasi selalu optimal.",
    iconPosition: "top" as const,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

export default function WorkingProcess() {
  return (
    <section className={styles.processSection} id="process">
      <div className={styles.processContainer}>

        {/* Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Alur Pengerjaan Proyek</span>
          <h2 className={styles.sectionTitle}>Proses Kerja Terstruktur &amp; Efisien</h2>
          <p className={styles.sectionDesc}>
            Di Ibra Digital Engineering, kami menerapkan metodologi transparan untuk memastikan
            setiap solusi teknologi terbangun tepat waktu dengan standar kualitas tertinggi.
          </p>
        </div>

        {/* Grid Kartu */}
        <div className={styles.processGrid}>
          {PROCESS_STEPS.map((item) => {
            const isDown = item.iconPosition === "bottom";
            return (
              <div
                key={item.step}
                className={`${styles.processCardWrapper} ${isDown ? styles.typeDown : styles.typeUp}`}
              >
                {/* Back Layer Aksen (Lapisan Belakang yang mengintip di Atas / Bawah) */}
                <div className={styles.backAccentLayer}>
                  <span className={styles.accentBadgeText}>STEP {item.step}</span>
                </div>

                {/* Main Card (Lapisan Depan Utama - White Card) */}
                <article className={styles.mainCard}>
                  {item.iconPosition === "top" && (
                    <div className={styles.iconContainer}>{item.icon}</div>
                  )}

                  <div className={styles.cardHeaderInfo}>
                    <span className={styles.stepTag}>{item.step}</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  </div>

                  <p className={styles.cardText}>{item.desc}</p>

                  {item.iconPosition === "bottom" && (
                    <div className={styles.iconContainer}>{item.icon}</div>
                  )}
                </article>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
