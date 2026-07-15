"use client";

import React, { useState } from "react";
import styles from "./digital-agency.module.css";

export default function DigitalAgencyClient() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    projectType: "Company Profile / Landing Page",
    details: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqItems = [
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

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

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

    // Nomor WhatsApp Ibra Digital
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

    // Arahkan ke WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ── Navigation Bar ── */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <a href="#" className={styles.logo}>
            <img 
              src="/assets/ide-logo.png" 
              alt="Ibra Digital Engineering Logo" 
              width={147} 
              height={80} 
              className={styles.logoImg} 
            />
          </a>
          <nav className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Keunggulan</a>
            <a href="#portfolio" className={styles.navLink}>Portofolio</a>
            <a href="#pricing" className={styles.navLink}>Paket Harga</a>
            <a href="#faq" className={styles.navLink}>FAQ</a>
            <a href="#order" className={styles.navLink}>Pesan Sekarang</a>
          </nav>
          <a href="#order" className={styles.navCTA}>Konsultasi Gratis</a>
        </div>
      </header>

      <main>
        {/* ── Hero Section ── */}
        <section className={styles.hero}>
          <span className={styles.heroTagline}>Professional Web Development</span>
          <h1 className={styles.heroTitle}>
            Desain Website <span className={styles.gradientText}>Premium & Berperforma Tinggi</span> Untuk Bisnis Anda
          </h1>
          <p className={styles.heroSubtitle}>
            Kami membangun landing page, portal bisnis, dan aplikasi web modern berbasis Next.js, Supabase, 
            dan Cloudflare. Menghadirkan estetika premium Apple HIG, keamanan data super ketat, dan kecepatan optimal.
          </p>
          <div className={styles.heroActions}>
            <a href="#order" className={styles.btnPrimary}>Mulai Proyek</a>
            <a href="#portfolio" className={styles.btnSecondary}>Lihat Karya Kami</a>
          </div>

          {/* ── Statistics / Metrics Bar ── */}
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Kepuasan Klien</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>3-5 Hari</div>
              <div className={styles.statLabel}>Launch Cepat</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>99.9%</div>
              <div className={styles.statLabel}>Uptime Server</div>
            </div>
          </div>
        </section>

        {/* ── Tech Stack Showcase Section ── */}
        <section className={styles.techShowcaseSection}>
          <div className={styles.techShowcaseTitle}>Teknologi Premium Yang Kami Gunakan</div>
          <div className={styles.techLogoGrid}>
            <div className={styles.techLogoItem}>
              <svg className={styles.techLogoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Next.js 16</span>
            </div>
            <div className={styles.techLogoItem}>
              <svg className={styles.techLogoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
              </svg>
              <span>Supabase</span>
            </div>
            <div className={styles.techLogoItem}>
              <svg className={styles.techLogoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>React 19</span>
            </div>
            <div className={styles.techLogoItem}>
              <svg className={styles.techLogoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Cloudflare</span>
            </div>
            <div className={styles.techLogoItem}>
              <svg className={styles.techLogoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <span>PostgreSQL</span>
            </div>
          </div>
        </section>


        {/* ── Keunggulan Section ── */}
        <section id="features" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Standar Kualitas Tertinggi</h2>
            <p className={styles.sectionDesc}>Setiap lini kode kami tulis dengan dedikasi penuh untuk mencapai kesempurnaan visual dan teknis.</p>
          </div>
          <div className={styles.grid}>
            {/* Keunggulan 1 */}
            <article className={styles.card}>
              <div className={styles.iconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Keamanan Tingkat Tinggi</h3>
              <p className={styles.cardText}>
                Perlindungan data optimal dengan otentikasi Supabase JWT, enkripsi SSL/HTTPS penuh, 
                serta implementasi Content Security Policy (CSP) untuk mencegah serangan siber.
              </p>
            </article>

            {/* Keunggulan 2 */}
            <article className={styles.card}>
              <div className={styles.iconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Kecepatan Ekstrim</h3>
              <p className={styles.cardText}>
                Dioptimalkan penuh menggunakan React Server Components, serverless caching, 
                dan CDN Cloudflare Edge untuk meminimalisir LCP dan memuluskan navigasi halaman.
              </p>
            </article>

            {/* Keunggulan 3 */}
            <article className={styles.card}>
              <div className={styles.iconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Estetika Premium (Apple HIG)</h3>
              <p className={styles.cardText}>
                Antarmuka visual yang modern, bersih, dan memikat mata dengan kelengkungan radius halus, 
                bayangan ambient transparan, dan mikro-animasi transisi spring yang dinamis.
              </p>
            </article>
          </div>
        </section>

        {/* ── Portfolio Section ── */}
        <section id="portfolio" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Portofolio Unggulan</h2>
            <p className={styles.sectionDesc}>Lihat implementasi nyata dari standar teknologi dan desain yang kami janjikan.</p>
          </div>
          
          <div className={styles.showcase}>
            <div className={styles.showcaseContent}>
              <span className={styles.showcaseTag}>Peak Performance Case Study</span>
              <h3 className={styles.showcaseTitle}>Portal Belajar & LMS Ibra Global English</h3>
              <p className={styles.showcaseDesc}>
                Sistem portal bimbingan belajar bahasa Inggris terintegrasi. Memiliki dasbor multi-peran (Admin, Tutor, Wali Murid, Siswa), 
                sistem absensi terproteksi, pencatatan SPP online terverifikasi, ujian penempatan (Placement Test) digital dengan timer aktif, 
                dan real-time WebSocket database syncing.
              </p>
              <div className={styles.techTags}>
                <span className={styles.techTag}>Next.js 16</span>
                <span className={styles.techTag}>Supabase Database</span>
                <span className={styles.techTag}>Prisma ORM</span>
                <span className={styles.techTag}>Tailwind CSS</span>
                <span className={styles.techTag}>Apple HIG Theme</span>
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
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)" }}>🖥️ LIVE SYSTEM VIEW</span>
                <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-green-light)", color: "var(--color-green)", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>99.9% Uptime</span>
              </div>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Realtime Attendance Logs</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Interactive Placement Quiz & Timer</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Secured Role-Based Access Control</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> WhatsApp Push Notifications</li>
              </ul>
              <div style={{ background: "var(--color-gray-50)", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontStyle: "italic" }}>
                  "Platform ini dirancang khusus untuk memotong waktu administrasi harian kursus hingga 80%."
                </span>
              </div>
            </div>
          </div>

          <div className={styles.showcase} style={{ marginTop: "40px" }}>
            <div className={styles.showcaseContent}>
              <span className={styles.showcaseTag}>School Web Portal</span>
              <h3 className={styles.showcaseTitle}>Website Resmi SD Negeri Bobong</h3>
              <p className={styles.showcaseDesc}>
                Website profil sekolah dasar negeri pertama di Bobong, Kabupaten Pulau Taliabu. Menyediakan media informasi 
                akademik resmi, kegiatan sekolah, galeri aktivitas siswa, data pendidik, serta alur pendaftaran siswa baru secara online.
              </p>
              <div className={styles.techTags}>
                <span className={styles.techTag}>Next.js</span>
                <span className={styles.techTag}>Cloudflare Pages</span>
                <span className={styles.techTag}>Tailwind CSS</span>
                <span className={styles.techTag}>Apple HIG Theme</span>
                <span className={styles.techTag}>SEO Optimized</span>
              </div>
              <div style={{ marginTop: "32px" }}>
                <a href="https://www.sdnegeribobong.sch.id" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
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
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)" }}>🖥️ LIVE SYSTEM VIEW</span>
                <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-green-light)", color: "var(--color-green)", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>99.9% Uptime</span>
              </div>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Official Academic Profiles</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Interactive Student Activity Gallery</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Online Enrollment Information</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Search Engine Optimized (.id domain)</li>
              </ul>
              <div style={{ background: "var(--color-gray-50)", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", fontStyle: "italic" }}>
                  "Hadir sebagai pelopor portal digitalisasi sekolah dasar pertama di Pulau Taliabu."
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Paket Harga Section ── */}
        <section id="pricing" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pilih Paket Solusi Anda</h2>
            <p className={styles.sectionDesc}>Investasi terbaik untuk memodernisasi operasional dan branding bisnis Anda.</p>
          </div>
          <div className={styles.grid}>
            {/* Paket 1 */}
            <div className={styles.card + " " + styles.pricingCard}>
              <h3 className={styles.cardTitle}>Landing Page Premium</h3>
              <p className={styles.cardText}>Ideal untuk portofolio, profil perusahaan, promosi event, atau bisnis lokal.</p>
              <div className={styles.price}>Mulai Rp 899.000</div>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> 1 Halaman Desain Berkelas</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Integrasi Kontak & WhatsApp</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Optimasi SEO & Metadata</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Desain Responsive Mobile-First</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Google Maps & FAQ Terintegrasi</li>
              </ul>
              <a href="#order" className={styles.btnSecondary} style={{ textAlign: "center" }}>Pilih Paket</a>
            </div>

            {/* Paket 2 */}
            <div className={styles.card + " " + styles.pricingCard + " " + styles.featuredCard}>
              <span className={styles.badge}>Populer</span>
              <h3 className={styles.cardTitle}>Portal Bisnis / Custom Web App</h3>
              <p className={styles.cardText}>Sistem web terintegrasi dengan database, dasbor admin, dan autentikasi multi-user.</p>
              <div className={styles.price}>Mulai Rp 1.999.000</div>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Desain Apple HIG Terkustomisasi</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Database Supabase / PostgreSQL</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Manajemen Role & Proteksi Rute</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Dasbor Admin & CRUD Data</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Ekspor Laporan & Unggah File</li>
              </ul>
              <a href="#order" className={styles.btnPrimary} style={{ textAlign: "center" }}>Pilih Paket</a>
            </div>

            {/* Paket 3 */}
            <div className={styles.card + " " + styles.pricingCard}>
              <h3 className={styles.cardTitle}>LMS & Sistem Edukasi</h3>
              <p className={styles.cardText}>Platform digital komplit untuk bimbingan belajar, sekolah formal, atau pelatihan mandiri.</p>
              <div className={styles.price}>Mulai Rp 2.999.000</div>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Semua Fitur Portal Bisnis</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Ujian Online / Placement Test</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Pengelolaan SPP / Tagihan Keuangan</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Realtime Chat & Absensi Harian</li>
                <li className={styles.featureItem}><span className={styles.checkIcon}>✓</span> Laporan Nilai & Grafik Kemajuan</li>
              </ul>
              <a href="#order" className={styles.btnSecondary} style={{ textAlign: "center" }}>Pilih Paket</a>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section id="faq" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pertanyaan yang Sering Diajukan</h2>
            <p className={styles.sectionDesc}>Semua yang perlu Anda ketahui tentang layanan pembuatan website kami.</p>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item, index) => {
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

        {/* ── Order/Contact Form Section ── */}
        <section id="order" className={styles.section} style={{ textCombineUpright: "all" }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mulai Proyek Website Anda</h2>
            <p className={styles.sectionDesc}>Diskusikan ide proyek Anda. Kami akan merespons secepat mungkin via WhatsApp.</p>
          </div>
          
          <div className={styles.formSection}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ fontSize: "3rem", color: "var(--color-green)", marginBottom: "16px" }}>✓</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>Permintaan Dikirim!</h3>
                <p style={{ color: "var(--color-gray-500)", marginBottom: "24px" }}>
                  Terima kasih, data Anda telah dikonfigurasi. Anda akan diarahkan ke obrolan WhatsApp kami untuk konsultasi lanjutan.
                </p>
                <button type="button" onClick={() => setSubmitted(false)} className={styles.btnSecondary}>Kirimi Formulir Lagi</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>Nama Lengkap / Nama Bisnis</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Contoh: Ibra Global English"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contact" className={styles.label}>Nomor WhatsApp / Email Kontak</label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="projectType" className={styles.label}>Tipe Proyek Website</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Company Profile / Landing Page">Landing Page Premium</option>
                    <option value="Portal Bisnis / Custom Web App">Portal Bisnis / Custom Web App</option>
                    <option value="LMS / Sistem Edukasi">LMS & Sistem Edukasi</option>
                    <option value="Custom Project Lainnya">Custom Project Lainnya</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="details" className={styles.label}>Jelaskan Singkat Kebutuhan Anda</label>
                  <textarea
                    id="details"
                    name="details"
                    required
                    placeholder="Contoh: Saya butuh website landing page kursus dengan menu pendaftaran online dan galeri foto."
                    value={formData.details}
                    onChange={handleInputChange}
                    className={styles.textarea}
                  />
                </div>

                <button type="submit" className={styles.btnPrimary} style={{ width: "100%", padding: "14px" }}>
                  Kirim & Hubungi via WhatsApp
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
          <img 
            src="/assets/ide-logo.png" 
            alt="Ibra Digital Engineering Logo" 
            width={156} 
            height={85} 
            loading="lazy"
          />
        </div>
        <p>&copy; {new Date().getFullYear()} Ibra Digital Engineering. All rights reserved.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px", fontSize: "0.85rem" }}>
          <a href="/digital-agency/terms" style={{ color: "var(--color-gray-500)", textDecoration: "none", fontWeight: "500" }}>Syarat & Ketentuan</a>
          <span style={{ color: "var(--color-gray-300)" }}>|</span>
          <a href="/digital-agency/privacy" style={{ color: "var(--color-gray-500)", textDecoration: "none", fontWeight: "500" }}>Kebijakan Privasi</a>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", marginTop: "8px" }}>
          Mitra resmi pengembangan teknologi <a href="https://www.ibraglobalenglish.uk" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "bold" }}>Ibra Global English Bobong</a>.
        </p>
      </footer>

      {/* ── Floating WhatsApp Button ── */}
      <a
        href="https://wa.me/6281357001357"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingWhatsapp}
        aria-label="Hubungi kami melalui WhatsApp"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.372a9.994 9.994 0 0 0 4.78 1.217h.005c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.18-2.92-7.062A9.925 9.925 0 0 0 12.012 2zm5.835 14.165c-.253.714-1.47 1.3-2.025 1.385-.482.072-1.107.13-3.21-.75-2.69-1.125-4.394-3.87-4.528-4.05-.135-.18-1.078-1.432-1.078-2.73 0-1.3.678-1.936.92-2.2.202-.22.506-.275.759-.275.253 0 .506.002.72.013.23.011.53-.088.828.627.303.73.99 2.42 1.078 2.6.088.18.135.385.023.605-.11.22-.242.36-.375.528-.135.165-.285.344-.12.632.165.286.733 1.22 1.572 1.97.165.14.333.286.58.385.247.1.393.077.54-.088.146-.165.626-.732.793-.984.168-.253.337-.21.56-.126.225.082 1.433.682 1.68.803s.416.182.478.292c.062.11.062.632-.19 1.347z" />
        </svg>
      </a>
    </div>
  );
}
