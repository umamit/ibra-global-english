"use client";

import React from "react";
import styles from "./AgencyPricing.module.css";

export default function AgencyPricing() {
  return (
    <div className={styles.pricingSectionWrapper}>
      <section id="pricing" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pilih Paket Solusi Anda</h2>
          <p className={styles.sectionDesc}>
            Investasi terbaik untuk memodernisasi operasional dan branding bisnis Anda.
          </p>
        </div>
        <div className={styles.grid}>
          {/* Paket 1 */}
          <div className={`${styles.card} ${styles.pricingCard}`}>
            <h3 className={styles.cardTitle}>Landing Page Premium</h3>
            <p className={styles.cardText}>Ideal untuk portofolio, profil perusahaan, promosi event, atau bisnis lokal.</p>
            <div className={styles.price}>Mulai Rp 899.000</div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> 1 Halaman Desain Berkelas</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Integrasi Kontak & WhatsApp</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Optimasi SEO & Metadata</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Desain Responsive Mobile-First</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Google Maps & FAQ Terintegrasi</li>
            </ul>
            <a href="#order" className={styles.btnSecondary} style={{ textAlign: "center" }}>Pilih Paket</a>
          </div>

          {/* Paket 2 */}
          <div className={`${styles.card} ${styles.pricingCard} ${styles.featuredCard}`}>
            <span className={styles.badge}>Populer</span>
            <h3 className={styles.cardTitle}>Portal Bisnis / Custom Web App</h3>
            <p className={styles.cardText}>Sistem web terintegrasi dengan database, dasbor admin, dan autentikasi multi-user.</p>
            <div className={styles.price}>Mulai Rp 1.999.000</div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Desain Apple HIG Terkustomisasi</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Database Supabase / PostgreSQL</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Manajemen Role & Proteksi Rute</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Dasbor Admin & CRUD Data</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Ekspor Laporan & Unggah File</li>
            </ul>
            <a href="#order" className={styles.btnPrimary} style={{ textAlign: "center" }}>Pilih Paket</a>
          </div>

          {/* Paket 3 */}
          <div className={`${styles.card} ${styles.pricingCard}`}>
            <h3 className={styles.cardTitle}>LMS & Sistem Edukasi</h3>
            <p className={styles.cardText}>Platform digital komplit untuk bimbingan belajar, sekolah formal, atau pelatihan mandiri.</p>
            <div className={styles.price}>Mulai Rp 2.999.000</div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Semua Fitur Portal Bisnis</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Ujian Online / Placement Test</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Pengelolaan SPP / Tagihan Keuangan</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Realtime Chat & Absensi Harian</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Laporan Nilai & Grafik Kemajuan</li>
            </ul>
            <a href="#order" className={styles.btnSecondary} style={{ textAlign: "center" }}>Pilih Paket</a>
          </div>
        </div>
      </section>
    </div>
  );
}
