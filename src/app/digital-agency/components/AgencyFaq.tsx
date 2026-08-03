"use client";

import React, { useState } from "react";
import styles from "../digital-agency.module.css";

const FAQ_ITEMS = [
  {
    q: "Apakah harga tersebut sudah termasuk domain dan hosting?",
    a: "Ya! Seluruh paket yang kami tawarkan sudah termasuk gratis 1 domain (.com / .id / .my.id) serta cloud hosting super cepat (Next.js & Cloudflare optimized) selama 1 tahun pertama. Anda tinggal terima beres."
  },
  {
    q: "Berapa lama estimasi waktu pengerjaan website?",
    a: "Pengerjaan Landing Page Premium membutuhkan waktu 3-5 hari kerja. Portal Bisnis/Custom Web App membutuhkan waktu 7-14 hari kerja, sedangkan LMS & Sistem Edukasi berkisar antara 14-21 hari kerja, tergantung kompleksitas fitur."
  },
  {
    q: "Bagaimana sistem pembayaran proyek website?",
    a: "Sistem pembayaran menggunakan skema termin (milestone) yang aman: DP 50% di awal sebelum proyek dimulai untuk proses desain UI/UX, dan pelunasan 50% setelah website selesai dideploy, diuji bersama, dan siap dipublikasikan."
  },
  {
    q: "Apakah saya bisa mengelola isi konten website sendiri?",
    a: "Tentu saja. Khusus untuk paket Portal Bisnis dan LMS, kami menyertakan Dasbor Admin mandiri yang sangat mudah digunakan (CRUD). Anda bisa menambah, mengubah, atau menghapus materi, laporan, dan gambar tanpa menulis kode program sama sekali."
  },
  {
    q: "Apakah ada garansi setelah website diluncurkan?",
    a: "Kami memberikan garansi pemeliharaan (maintenance) gratis selama 3 bulan pertama setelah website online. Garansi mencakup perbaikan jika terjadi error teknis, backup data berkala, serta konsultasi gratis via WhatsApp."
  }
];

export default function AgencyFaq() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className={styles.faqSectionWrapper}>
      <section id="faq" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pertanyaan yang Sering Diajukan</h2>
          <p className={styles.sectionDesc}>
            Semua yang perlu Anda ketahui tentang layanan pembuatan website kami.
          </p>
        </div>
        <div className={styles.faqList}>
          {FAQ_ITEMS.map((item, index) => {
            const isActive = activeFaq === index;
            return (
              <div 
                key={index} 
                className={`${styles.faqItem} ${isActive ? styles.faqItemActive : ""}`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className={styles.faqButton}
                  aria-expanded={isActive}
                >
                  <span className={styles.faqQuestion}>{item.q}</span>
                  <svg
                    className={`${styles.faqChevron} ${isActive ? styles.faqChevronActive : ""}`}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className={styles.faqContent}
                  style={{
                    maxHeight: isActive ? "200px" : "0",
                  }}
                >
                  <p className={styles.faqAnswer}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
