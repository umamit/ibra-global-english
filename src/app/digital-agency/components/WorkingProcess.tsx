"use client";

import React from "react";
import styles from "./WorkingProcess.module.css";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Analisis Kebutuhan (Analysis)",
    desc: "Riset mendalam untuk memahami kebutuhan bisnis, tujuan, dan tantangan teknis Anda guna menentukan pendekatan perangkat lunak terbaik.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Perencanaan & Skema (Planning)",
    desc: "Penyusunan rencana proyek terperinci yang mencakup milestone, timeline pengerjaan, dan alokasi arsitektur database secara transparan.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Desain UI/UX (Design)",
    desc: "Perancangan antarmuka pengguna berbasis Apple HIG 2.0 yang modern, responsif, dan estetis sesuai identitas brand serta pengalaman pengguna.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Pengodean (Development)",
    desc: "Pengembangan sistem menggunakan teknologi enterprise modern (Next.js 16, Supabase, AI Engine) berstandar keamanan dan performa tinggi.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Pengujian Ketat (Testing)",
    desc: "Pengujian kualitas (Quality Assurance) dan audit keamanan ketat (Anti-SSRF/XSS) untuk memastikan aplikasi bebas dari bug dan siap rilis.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    step: "06",
    title: "Peluncuran (Deployment)",
    desc: "Peluncuran aplikasi ke lingkungan produksi global (Vercel & Cloudflare Edge CDN) dengan pengunggahan cepat dan uptime 99.9%.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    ),
  },
  {
    step: "07",
    title: "Serah Terima (Delivery)",
    desc: "Serah terima dokumen panduan penggunaan, pelatihan admin/operasional, serta dukungan langsung untuk kelancaran transisi sistem.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    step: "08",
    title: "Pemeliharaan (Maintenance)",
    desc: "Layanan pemeliharaan berkelanjutan, pemantauan performa rutin, dan pembaruan sistem berkala agar aplikasi selalu berjalan optimal.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
          <span className={styles.sectionBadge}>Alur Kerja Kami</span>
          <h2 className={styles.sectionTitle}>Proses Kerja Sederhana & Efisien</h2>
          <p className={styles.sectionDesc}>
            Di Ibra Digital Engineering, kami menerapkan alur kerja yang terstruktur untuk memastikan setiap proyek selesai tepat waktu, sesuai anggaran, dan memenuhi standar kualitas tertinggi.
          </p>
        </div>

        <div className={styles.processGrid}>
          {PROCESS_STEPS.map((item) => (
            <article key={item.step} className={styles.processCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>{item.icon}</div>
                <span className={styles.stepNumber}>Tahap {item.step}</span>
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
