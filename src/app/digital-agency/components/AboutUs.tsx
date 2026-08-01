"use client";

import React from "react";
import styles from "./AboutUs.module.css";

const SERVICES_LIST = [
  "Pengembangan Aplikasi Web Enterprise",
  "Pengembangan Aplikasi Mobile (Android Native & PWA)",
  "Integrasi Kecerdasan Buatan (Groq AI & LLM)",
  "Layanan Infrastruktur Cloud & Edge CDN",
  "Konsultasi IT & Keamanan Siber (Security Audit)",
  "Solusi Perangkat Lunak Kustom (LMS & Absensi Geofence)",
];

export default function AboutUs() {
  return (
    <section className={styles.aboutSection} id="about">
      <div className={styles.aboutContainer}>
        {/* Left Column: Information & Services Checklist */}
        <div className={styles.aboutContent}>
          <span className={styles.aboutBadge}>Tentang Kami</span>
          <h2 className={styles.aboutTitle}>
            Mitra Teknologi Terpadu Anda untuk Web, Mobile, dan Solusi Perangkat Lunak Kustom
          </h2>
          <p className={styles.aboutDesc}>
            Di Ibra Digital Engineering, kami berdedikasi untuk menjembatani kebutuhan operasional bisnis dan instansi dengan dunia teknologi digital modern. Misi kami adalah memberdayakan lembaga pendidikan dan perusahaan agar bertransisi secara mulus ke era digital dengan sistem yang aman, cepat, dan berestetika tinggi.
          </p>

          <div className={styles.servicesGrid}>
            {SERVICES_LIST.map((service, index) => (
              <div key={index} className={styles.serviceCheckItem}>
                <div className={styles.checkIconWrapper}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>{service}</span>
              </div>
            ))}
          </div>

          <div className={styles.aboutActions}>
            <a href="#order" className={styles.btnPrimary}>
              Konsultasi Layanan
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>

            <div className={styles.contactBox}>
              <div className={styles.phoneIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <div className={styles.contactTextLabel}>Hubungi Tim Rekayasa</div>
                <a href="https://wa.me/6282297839396" target="_blank" rel="noopener noreferrer" className={styles.contactPhoneNumber}>
                  +62 822-9783-9396
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Visual Showcase Card */}
        <div className={styles.aboutCardVisual}>
          <div className={styles.visualHeader}>
            <span className={`${styles.visualDot} ${styles.visualDotRed}`}></span>
            <span className={`${styles.visualDot} ${styles.visualDotYellow}`}></span>
            <span className={`${styles.visualDot} ${styles.visualDotGreen}`}></span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-primary)", marginLeft: "auto" }}>
              ENTERPRISE STACK
            </span>
          </div>

          <div className={styles.visualList}>
            <div className={styles.visualItem}>
              <div className={styles.checkIconWrapper} style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div className={styles.visualItemTitle}>Arsitektur Modern & Scalable</div>
                <div className={styles.visualItemSub}>Next.js 16 + Supabase PostgreSQL Serverless</div>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.checkIconWrapper} style={{ backgroundColor: "rgba(56, 189, 248, 0.12)", color: "#0284C7" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div>
                <div className={styles.visualItemTitle}>Layanan Cross-Platform</div>
                <div className={styles.visualItemSub}>Web App, Tablet, PWA & APK Android Native</div>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.checkIconWrapper} style={{ backgroundColor: "rgba(245, 80, 54, 0.12)", color: "#F55036" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <div>
                <div className={styles.visualItemTitle}>Otomasisasi Kecerdasan Buatan (AI)</div>
                <div className={styles.visualItemSub}>Chatbot 24/7, Sentiment Analysis & AI Generators</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
