"use client";

import Link from "next/link";
import "./RegistrationSteps.css";

export default function RegistrationSteps() {
  return (
    <section className="steps-section" id="alur-pendaftaran">
      <div className="container">
        {/* Header */}
        <div className="section-header reveal" style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="badge" style={{ 
            fontSize: "0.85rem", 
            fontWeight: "800", 
            color: "var(--color-primary-dark)", 
            backgroundColor: "var(--color-primary-light)", 
            padding: "0.4rem 1.25rem", 
            borderRadius: "50px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            display: "inline-block",
            marginBottom: "1rem"
          }}>
            Alur Pendaftaran
          </span>
          <h2 style={{ fontSize: "2.25rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "1rem" }}>
            3 Langkah Mudah Bergabung
          </h2>
          <p style={{ color: "var(--color-gray-500)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Mulai perjalanan belajar bahasa Inggris Anda dengan proses yang sederhana dan transparan.
          </p>
        </div>

        {/* Stepper Flow Grid */}
        <div className="steps-grid reveal">
          {/* Step 1 */}
          <div className="step-card-item">
            <div className="step-number-badge">1</div>
            <div className="step-content-box">
              <h3>Daftar & Kuis</h3>
              <p>Lengkapi formulir singkat dan ikuti tes penempatan (Placement Test) online gratis selama 10 menit untuk mengetahui level CEFR awal Anda.</p>
              <Link href="/placement-test" className="step-action-link">
                Mulai Tes Sekarang →
              </Link>
            </div>
          </div>

          {/* Connector Arrow for Desktop */}
          <div className="step-connector" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>

          {/* Step 2 */}
          <div className="step-card-item">
            <div className="step-number-badge">2</div>
            <div className="step-content-box">
              <h3>Konsultasi Kelas</h3>
              <p>Tutor kami akan menghubungi Anda via WhatsApp untuk menganalisis hasil kuis, memberikan ulasan kemampuan bicara, dan menyarankan program terbaik.</p>
              <span className="step-status-tag">Dibantu Tutor Ahli</span>
            </div>
          </div>

          {/* Connector Arrow for Desktop */}
          <div className="step-connector" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>

          {/* Step 3 */}
          <div className="step-card-item highlight-card">
            <div className="step-number-badge step-number-badge-accent">3</div>
            <div className="step-content-box">
              <h3>Mulai Belajar</h3>
              <p>Selesaikan administrasi pendaftaran secara offline/online, dapatkan buku panduan, dan langsung bergabung dalam kelas interaktif Anda!</p>
              <span className="step-status-tag success-tag" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z"/></svg>
                <span>Lancar Bicara</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
