"use client";

import React from "react";
import styles from "./AgencyPortfolio.module.css";

export default function AgencyPortfolio() {
  return (
    <div className={styles.portfolioSectionWrapper}>
      <section id="portfolio" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Portofolio Unggulan</h2>
          <p className={styles.sectionDesc}>
            Lihat implementasi nyata dari standar teknologi dan desain yang kami janjikan.
          </p>
        </div>

        <div className={styles.showcase}>
          <div className={styles.showcaseContent}>
            <span className={styles.showcaseTag}>LMS & Educational Management System</span>
            <h3 className={styles.showcaseTitle}>Portal Belajar & LMS Ibra Global English</h3>
            <p className={styles.showcaseDesc}>
              Modern Educational Management System hulu-ke-hilir untuk bimbingan belajar. Menampilkan CMS Landing Page dinamis, Placement Test CEFR online dengan Smart Timer, SPP & Keuangan Digital terverifikasi (WA Push & Financial Analytics), Portal Orang Tua/Siswa (Rapor & Kartu SPP Digital), Jadwal Bebas Bentrok (Conflict Prevention), serta AI Engine & RAG Integration (RPP Generator, AI Executive Summary, & E-Sertifikat).
            </p>
            <div className={styles.techTags}>
              <span className={styles.techTag}>Next.js 16 (App Router)</span>
              <span className={styles.techTag}>Supabase Realtime & SSR Auth</span>
              <span className={styles.techTag}>Prisma ORM</span>
              <span className={styles.techTag}>AI Engine & RAG</span>
              <span className={styles.techTag}>Apple HIG System</span>
            </div>
            <div style={{ marginTop: "32px" }}>
              <a href="https://www.ibraglobalenglish.uk" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Kunjungi Website Utama
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.showcaseCard}>
            <div className={styles.macOSHeader}>
              <span className={`${styles.macOSDot} ${styles.macOSDotRed}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotYellow}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotGreen}`}></span>
            </div>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}><i className="fi fi-rr-computer"></i> LMS ENTERPRISE PLATFORM</span>
              <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-green-light)", color: "var(--color-green)", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>99.9% Uptime</span>
            </div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Dynamic CMS, Placement Test CEFR & Smart Timer</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> SPP Digital, WA Automation & Financial Analytics</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Conflict Prevention Schedule & Attendance Control</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Smart AI RAG (RPP & Executive Summary Generator)</li>
            </ul>
            <div style={{ background: "#ebf0f4", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontStyle: "italic" }}>
                "Platform sistem manajemen pendidikan modern terintegrasi dari hulu ke hilir."
              </span>
            </div>
          </div>
        </div>

        <div className={styles.showcase} style={{ marginTop: "40px" }}>
          <div className={styles.showcaseContent}>
            <span className={styles.showcaseTag}>School Enterprise System</span>
            <h3 className={styles.showcaseTitle}>Website Resmi & Portal Layanan Digital SD Negeri Bobong</h3>
            <p className={styles.showcaseDesc}>
              Enterprise School Management System terpadu untuk SD Negeri Bobong. Dilengkapi desain Apple HIG 2.0 Bento Glassmorphism (Dual Theme), integrasi Groq Llama-3 AI Engine (Chatbot 24/7 & AI Draft Generator), Portal PPDB Online dengan cetak A4 & WhatsApp Gateway, Portal Cek Rapor NISN Mandiri, serta Dasbor Admin/Guru 4-kategori terproteksi JWT & Audit Log.
            </p>
            <div className={styles.techTags}>
              <span className={styles.techTag}>Next.js 16 (App Router)</span>
              <span className={styles.techTag}>React 19</span>
              <span className={styles.techTag}>Supabase PostgreSQL</span>
              <span className={styles.techTag}>Groq Llama-3 AI</span>
              <span className={styles.techTag}>Jose JWT Security</span>
            </div>
            <div style={{ marginTop: "32px" }}>
              <a href="https://sdnegeribobong.sch.id" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Kunjungi Website Sekolah
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.showcaseCard}>
            <div className={styles.macOSHeader}>
              <span className={`${styles.macOSDot} ${styles.macOSDotRed}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotYellow}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotGreen}`}></span>
            </div>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}><i className="fi fi-rr-computer"></i> SCHOOL ENTERPRISE SYSTEM</span>
              <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-green-light)", color: "var(--color-green)", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>99.9% Uptime</span>
            </div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Apple HIG 2.0 Bento Glassmorphism</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Chatbot & News Generator Groq Llama-3 AI</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Portal PPDB Online, WA Gateway & Cetak A4</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Cek Rapor NISN Mandiri & Audit Log JWT</li>
            </ul>
            <div style={{ background: "#ebf0f4", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontStyle: "italic" }}>
                "Pelopor platform digitalisasi enterprise sekolah dasar berbasis AI pertama di Pulau Taliabu."
              </span>
            </div>
          </div>
        </div>

        <div className={styles.showcase} style={{ marginTop: "40px" }}>
          <div className={styles.showcaseContent}>
            <span className={styles.showcaseTag}>PWA & Native Android App</span>
            <h3 className={styles.showcaseTitle}>Sistem Presensi Digital & Absensi Geofence GPS (SD Negeri Bobong)</h3>
            <p className={styles.showcaseDesc}>
              Aplikasi PWA & Native Android APK (5.6MB) khusus Guru dan Tenaga Pendidik SD Negeri Bobong. Dilengkapi fitur Geofence GPS (radius 10m anti-fake GPS), Live Selfie Verification dengan Eye-Blink Liveness Detection, penguncian shift otomatis (Time Gate), pengajuan izin paperless, serta ekspor rekapitulasi NIP bulanan 1-klik.
            </p>
            <div className={styles.techTags}>
              <span className={styles.techTag}>React & TypeScript</span>
              <span className={styles.techTag}>Supabase Backend</span>
              <span className={styles.techTag}>Capacitor Engine</span>
              <span className={styles.techTag}>Leaflet GPS API</span>
              <span className={styles.techTag}>Apple HIG Dark Mode</span>
            </div>
            <div style={{ marginTop: "32px" }}>
              <a href="https://presensi.sdnegeribobong.sch.id" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Kunjungi Sistem Presensi
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.showcaseCard}>
            <div className={styles.macOSHeader}>
              <span className={`${styles.macOSDot} ${styles.macOSDotRed}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotYellow}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotGreen}`}></span>
            </div>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}><i className="fi fi-rr-computer"></i> GEOFENCE GPS & PWA APP</span>
              <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-green-light)", color: "var(--color-green)", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>APK 5.6 MB</span>
            </div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> GPS Geofence 10m & Polygon Map</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Live Selfie & Eye-Blink Liveness</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Auto Shift Time Gate (Pagi & Siang)</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Paperless Izin/Sakit & Rekap NIP</li>
            </ul>
            <div style={{ background: "#ebf0f4", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontStyle: "italic" }}>
                "Sistem absensi geofence ultra-akurat berstandar PWA & Android Native App."
              </span>
            </div>
          </div>
        </div>

        <div className={styles.showcase} style={{ marginTop: "40px" }}>
          <div className={styles.showcaseContent}>
            <span className={styles.showcaseTag}>Educational Learning Platform</span>
            <h3 className={styles.showcaseTitle}>Platform Ruang Ajar & Learning Hub SD Negeri Bobong</h3>
            <p className={styles.showcaseDesc}>
              Platform pembelajaran digital dan ruang ajar interaktif untuk pendidik dan peserta didik SD Negeri Bobong. Menampilkan sistem distribusi modul materi digital, repositori penugasan siswa, bank soal terstruktur, serta portal akses KBM modern yang responsif dan aman.
            </p>
            <div className={styles.techTags}>
              <span className={styles.techTag}>Next.js & TypeScript</span>
              <span className={styles.techTag}>Supabase Cloud DB</span>
              <span className={styles.techTag}>Tailwind & Apple HIG</span>
              <span className={styles.techTag}>Cloudflare DNS</span>
              <span className={styles.techTag}>Interactive E-Learning</span>
            </div>
            <div style={{ marginTop: "32px" }}>
              <a href="https://ajar.sdnegeribobong.sch.id" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Kunjungi Portal Ajar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.showcaseCard}>
            <div className={styles.macOSHeader}>
              <span className={`${styles.macOSDot} ${styles.macOSDotRed}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotYellow}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotGreen}`}></span>
            </div>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}><i className="fi fi-rr-book-alt"></i> E-LEARNING HUB</span>
              <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-green-light)", color: "var(--color-green)", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>99.9% Uptime</span>
            </div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Manajemen Modul & Ruang Ajar Digital</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Bank Soal & Penugasan Interaktif</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Portal Akses KBM Guru & Siswa</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Proteksi Cloudflare & Performa Tinggi</li>
            </ul>
            <div style={{ background: "#ebf0f4", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontStyle: "italic" }}>
                "Platform ruang ajar digital interaktif penyokong kegiatan KBM modern SD Negeri Bobong."
              </span>
            </div>
          </div>
        </div>

        <div className={styles.showcase} style={{ marginTop: "40px" }}>
          <div className={styles.showcaseContent}>
            <span className={styles.showcaseTag}>Property & Business Landing Page</span>
            <h3 className={styles.showcaseTitle}>Website Kos Fitrah — kosfitrah.uk</h3>
            <p className={styles.showcaseDesc}>
              Landing page profesional bisnis sewa kos properti di Bobong. Dibangun menggunakan HTML5, CSS3, dan Vanilla JavaScript ES6 murni. Menampilkan Hero Section animasi gradient glassmorphism, galeri 4 tipe kamar lengkap dengan spesifikasi & tabel harga (harian/bulanan/tahunan), Kalkulator Harga Real-time interaktif, FAQ accordion halus, Peta Lokasi SVG kustom (tanpa Google Maps API), serta tombol WA floating. Dihosting di Vercel dengan Cloudflare DNS & High Lighthouse Score.
            </p>
            <div className={styles.techTags}>
              <span className={styles.techTag}>HTML5 & CSS3</span>
              <span className={styles.techTag}>Vanilla JS ES6</span>
              <span className={styles.techTag}>Vercel Production</span>
              <span className={styles.techTag}>Cloudflare DNS</span>
              <span className={styles.techTag}>Lighthouse High Score</span>
            </div>
            <div style={{ marginTop: "32px" }}>
              <a href="https://kosfitrah.uk" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Kunjungi Website Kos
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.showcaseCard}>
            <div className={styles.macOSHeader}>
              <span className={`${styles.macOSDot} ${styles.macOSDotRed}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotYellow}`}></span>
              <span className={`${styles.macOSDot} ${styles.macOSDotGreen}`}></span>
            </div>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}><i className="fi fi-rr-home"></i> PROPERTY PORTAL SITE</span>
              <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-green-light)", color: "var(--color-green)", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>99.9% Uptime</span>
            </div>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Galeri 4 Tipe Kamar & Tabel Harga</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Kalkulator Harga Real-time Interaktif</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Peta Lokasi SVG Kustom & FAQ Accordion</li>
              <li className={styles.featureItem}><i className={`fi fi-rr-check ${styles.checkIcon}`}></i> Sticky Blur Nav & WA Floating Button</li>
            </ul>
            <div style={{ background: "#ebf0f4", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontStyle: "italic" }}>
                "Landing page sewa kos dengan kalkulasi instan dan performa memukau."
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
