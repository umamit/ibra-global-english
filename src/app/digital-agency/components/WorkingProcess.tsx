"use client";

import React from "react";
import styles from "./WorkingProcess.module.css";

/* ── SVG Shape (hanya ujungnya yang akan terlihat) ── */
const ShapeDown = () => (
  <svg
    className={styles.cardShape}
    viewBox="0 0 305 146"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M274.465 115.014L35.5518 104.253L0 139.669V24.883C0 11.1442 11.1913 -0.000549316 24.9875 -0.000549316H280.012C293.809 -0.000549316 305 11.1442 305 24.883V145.422L274.465 115.014Z"
      fill="currentColor"
    />
  </svg>
);

const ShapeUp = () => (
  <svg
    className={styles.cardShape}
    viewBox="0 0 305 145"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M274.465 30.698L35.5518 41.3918L0 6.19539V120.27C0 133.924 11.1913 145 24.9875 145H280.012C293.809 145 305 133.924 305 120.27V0.478516L274.465 30.698Z"
      fill="currentColor"
    />
  </svg>
);

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Analisis Kebutuhan",
    desc: "Kami melakukan riset mendalam untuk memahami kebutuhan bisnis, tujuan, dan tantangan teknis Anda. Tahap ini membantu menentukan pendekatan terbaik untuk memenuhi kebutuhan Anda.",
    iconPosition: "bottom" as const,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Perencanaan",
    desc: "Tim kami membuat rencana proyek terperinci yang mencakup milestone, timeline pengerjaan, dan alokasi sumber daya. Ini menjamin kejelasan dan efisiensi di seluruh siklus pengembangan.",
    iconPosition: "top" as const,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Desain UI/UX",
    desc: "Kami merancang antarmuka dan pengalaman pengguna yang ramah, selaras dengan identitas brand dan ekspektasi pelanggan Anda. Desain kami berfokus pada fungsionalitas dan estetika.",
    iconPosition: "bottom" as const,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Pengodean",
    desc: "Pengembang kami bekerja dengan teknologi dan praktik terbaik terbaru untuk menciptakan perangkat lunak berkualitas tinggi. Kami menjaga komunikasi yang jelas di setiap tahap kunci.",
    iconPosition: "top" as const,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Pengujian Ketat",
    desc: "Setelah pengodean selesai, kami melakukan pengujian ketat dan jaminan kualitas (QA) sebelum peluncuran. Kami memastikan produk memberikan nilai terbaik untuk bisnis Anda.",
    iconPosition: "bottom" as const,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    step: "06",
    title: "Peluncuran",
    desc: "Kami mengelola peluncuran solusi Anda untuk memastikan integrasi yang lancar ke dalam infrastruktur yang ada, mengatur lingkungan, dan memastikan downtime minimal.",
    iconPosition: "top" as const,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    ),
  },
  {
    step: "07",
    title: "Serah Terima & Dukungan",
    desc: "Setelah solusi Anda diterapkan, kami melakukan pengujian komprehensif untuk memastikan semuanya bekerja sempurna, serta memberikan dukungan berkelanjutan pasca-peluncuran.",
    iconPosition: "bottom" as const,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    step: "08",
    title: "Pemeliharaan",
    desc: "Untuk memastikan sistem Anda terus berkinerja optimal, kami menawarkan pemeliharaan menyeluruh, pembaruan rutin, hingga pemantauan performa infrastruktur IT.",
    iconPosition: "top" as const,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

export default function WorkingProcess() {
  return (
    <section className={styles.processSection} id="process">
      <div className={styles.processContainer}>

        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Proses Kerja Kami</span>
          <h2 className={styles.sectionTitle}>Proses Kerja Sederhana &amp; Efisien</h2>
          <p className={styles.sectionDesc}>
            Di Ibra Digital Engineering, kami menerapkan alur kerja yang terstruktur untuk memastikan
            setiap proyek selesai tepat waktu, sesuai anggaran, dan memenuhi standar kualitas tertinggi.
          </p>
        </div>

        <div className={styles.processGrid}>
          {PROCESS_STEPS.map((item) => {
            const isDown = item.iconPosition === "bottom";
            return (
              <div
                key={item.step}
                className={`${styles.processCardWrapper} ${isDown ? styles.typeDown : styles.typeUp}`}
              >
                {/* Kartu putih — LAPISAN ATAS (z-index: 2) */}
                <article className={styles.processCard}>
                  {item.iconPosition === "top" && (
                    <div className={styles.iconBadge}>{item.icon}</div>
                  )}
                  <span className={styles.stepNumber}>{item.step}</span>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardText}>{item.desc}</p>
                  {item.iconPosition === "bottom" && (
                    <div className={styles.iconBadge}>{item.icon}</div>
                  )}
                </article>

                {/*
                 * SVG strip — LAPISAN BAWAH (z-index: 1)
                 * Wrapper berukuran fixed (44px), overflow:hidden
                 * sehingga hanya UJUNG SVG yang terlihat.
                 * align-items: flex-end → tampilkan bagian BAWAH SVG (typeDown)
                 * align-items: flex-start → tampilkan bagian ATAS SVG (typeUp)
                 */}
                <div className={`${styles.shapeWrapper} ${isDown ? styles.shapeDown : styles.shapeUp}`}>
                  {isDown ? <ShapeDown /> : <ShapeUp />}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
