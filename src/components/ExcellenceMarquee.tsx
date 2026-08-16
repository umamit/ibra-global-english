"use client";

import React from "react";
import styles from "./ExcellenceMarquee.module.css";

interface MarqueeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const MARQUEE_ITEMS: MarqueeItem[] = [
  {
    id: "ige-curriculum",
    title: "IGE Curriculum",
    subtitle: "Foundation, Bridge, Communicator, Achiever & Professional",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: "cefr",
    title: "CEFR Standardized",
    subtitle: "Kerangka Standar Bahasa Eropa (A1 - C1)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    id: "calistung",
    title: "Fun Calistung",
    subtitle: "Program Membaca, Menulis & Berhitung Anak",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
    ),
  },
  {
    id: "kids-teens",
    title: "Kids & Teens Program",
    subtitle: "Pengembangan Phonics, Speaking & Grammar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "cert",
    title: "Sertifikat Kelulusan Resmi",
    subtitle: "Bukti Pencapaian Level Siswa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a1 1 0 0 0 1 1h4" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "report",
    title: "Laporan Hasil Belajar",
    subtitle: "Evaluasi Perkembangan Siswa Periodik",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    id: "tutors",
    title: "Pengajar Berpengalaman",
    subtitle: "Tutor Dedikatif & Ramah Anak",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: "media",
    title: "Media Interaktif",
    subtitle: "Pembelajaran Visual & Audio Aset Modern",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
  },
  {
    id: "parent-portal",
    title: "Portal Orang Tua Online",
    subtitle: "Pantau Presensi & Keuangan Real-time",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
];

export default function ExcellenceMarquee() {
  // Duplikasi item untuk looping marquee yang berjalan mulus tanpa celah
  const doubleItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section className={styles.marqueeSection} aria-label="Keunggulan Ibra Global English">
      <div className={styles.marqueeTrack}>
        {doubleItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className={styles.marqueeCard}>
            <div className={styles.iconWrapper}>{item.icon}</div>
            <div className={styles.textWrapper}>
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemSubtitle}>{item.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
