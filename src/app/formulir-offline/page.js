"use client";

import { useEffect, useState } from "react";

export default function OfflineFormPage() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Force light theme color settings for printable form view
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-body-wrapper" style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "2rem 1rem" }}>
      {/* Control Buttons Panel (Hidden in print) */}
      <div className="no-print" style={{
        maxWidth: "800px",
        margin: "0 auto 1.5rem auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: "1rem 1.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        border: "1px solid #e5e7eb"
      }}>
        <div>
          <a href="/" style={{
            fontSize: "0.9rem",
            fontWeight: "700",
            color: "var(--color-primary-dark, #216c7e)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            ← Kembali ke Beranda
          </a>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button 
            onClick={handlePrint}
            style={{
              backgroundColor: "var(--color-primary, #4a9ba8)",
              color: "white",
              border: "none",
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(74, 155, 168, 0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            🖨️ Cetak Formulir (Print / Save PDF)
          </button>
        </div>
      </div>

      {/* Printable Sheet (Form) */}
      <div className="print-page" style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "3rem",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxSizing: "border-box"
      }}>
        
        {/* Kop Surat (Letterhead) */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", paddingBottom: "0.5rem" }}>
          <img 
            src="/assets/logo.png" 
            alt="Logo Ibra Global English" 
            style={{ width: "70px", height: "70px", objectFit: "contain" }} 
          />
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: "1.6rem", 
              fontWeight: "900", 
              color: "#1f2937", 
              margin: 0, 
              letterSpacing: "0.5px", 
              textTransform: "uppercase" 
            }}>
              IBRA GLOBAL ENGLISH BOBONG
            </h1>
            <p style={{ 
              fontSize: "0.85rem", 
              fontWeight: "700", 
              color: "#4b5563", 
              margin: "0.2rem 0",
              fontStyle: "italic" 
            }}>
              English Course & Bimbingan Belajar Calistung Terbaik di Pulau Taliabu
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, lineHeight: "1.4" }}>
              Alamat: Jl. TPU Bobong, Belakang Mes Tambang, Kost Fitrah Lantai 1, Bobong, Pulau Taliabu, Maluku Utara <br />
              WhatsApp: +62 813-5700-1357 | Website: www.ibraglobalenglish.uk
            </p>
          </div>
        </div>

        {/* Thick Divider Line */}
        <div style={{ borderBottom: "3px double #1f2937", marginBottom: "1rem" }}></div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", textTransform: "uppercase", color: "#111827", margin: 0, letterSpacing: "1px" }}>
            FORMULIR PENDAFTARAN SISWA BARU
          </h2>
          <span style={{ fontSize: "0.8rem", color: "#4b5563" }}>Silakan isi data di bawah ini dengan lengkap menggunakan huruf kapital</span>
        </div>

        {/* Form Sections */}
        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }} onSubmit={(e) => e.preventDefault()}>
          
          {/* Section 1: Data Siswa */}
          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "800", borderBottom: "1.5px solid #374151", paddingBottom: "0.2rem", marginBottom: "0.6rem", color: "#1f2937", textTransform: "uppercase" }}>
              A. DATA CALON SISWA
            </h3>
            
            <div className="form-print-row">
              <span className="form-print-label">Nama Lengkap</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">Nama Panggilan</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">Tempat & Tanggal Lahir</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">Jenis Kelamin</span>
              <span className="form-print-colon">:</span>
              <span style={{ display: "inline-flex", gap: "2rem", paddingTop: "0.2rem", flex: 1 }}>
                <span>[  ] Laki-laki</span>
                <span>[  ] Perempuan</span>
              </span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">Asal Sekolah & Kelas</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">Alamat Lengkap</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>
          </div>

          {/* Section 2: Data Orang Tua */}
          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "800", borderBottom: "1.5px solid #374151", paddingBottom: "0.2rem", marginBottom: "0.6rem", color: "#1f2937", textTransform: "uppercase" }}>
              B. DATA ORANG TUA / WALI
            </h3>
            
            <div className="form-print-row">
              <span className="form-print-label">Nama Orang Tua / Wali</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">Pekerjaan</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">No. WhatsApp / HP</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">Email Orang Tua / Wali</span>
              <span className="form-print-colon">:</span>
              <span className="form-print-line"></span>
            </div>

            <div className="form-print-row">
              <span className="form-print-label">Hubungan dengan Siswa</span>
              <span className="form-print-colon">:</span>
              <span style={{ display: "inline-flex", gap: "2rem", paddingTop: "0.2rem", flex: 1 }}>
                <span>[  ] Ayah</span>
                <span>[  ] Ibu</span>
                <span>[  ] Wali (Tuliskan: ..........................)</span>
              </span>
            </div>
          </div>

          {/* Section 3: Program Pilihan */}
          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "800", borderBottom: "1.5px solid #374151", paddingBottom: "0.2rem", marginBottom: "0.6rem", color: "#1f2937", textTransform: "uppercase" }}>
              C. PROGRAM YANG DIMINATI
            </h3>
            
            <p style={{ fontSize: "0.78rem", color: "#4b5563", margin: "0 0 0.5rem 0" }}>Silakan beri tanda centang (✓) pada program kursus yang dipilih:</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>[  ]</span>
                <div>
                  <strong style={{ fontSize: "0.85rem", color: "#1f2937" }}>Kids Program (Usia 5-12 tahun)</strong>
                  <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: 0 }}>Fokus pada kosakata dasar, percakapan interaktif, kuis, dan bernyanyi.</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>[  ]</span>
                <div>
                  <strong style={{ fontSize: "0.85rem", color: "#1f2937" }}>Teens Program (Usia 13-17 tahun)</strong>
                  <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: 0 }}>Fokus pada tata bahasa (grammar), menulis (writing), diskusi kelompok, dan speaking.</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>[  ]</span>
                <div>
                  <strong style={{ fontSize: "0.85rem", color: "#1f2937" }}>Fun Calistung (Usia 5-7 tahun)</strong>
                  <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: 0 }}>Bimbingan belajar membaca, menulis, dan berhitung dengan metode menyenangkan bagi anak usia dini.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Tanda Tangan */}
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "45%", textAlign: "center" }}>
              {/* Left blank for notes or general space */}
            </div>
            <div style={{ width: "45%", textAlign: "center", fontSize: "0.8rem", color: "#1f2937" }}>
              <p style={{ margin: "0 0 3.25rem 0" }}>
                Bobong, ......................................... 20.... <br />
                Orang Tua / Wali Siswa,
              </p>
              <p style={{ margin: 0, fontWeight: "bold" }}>( ........................................................ )</p>
              <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>Nama Jelas & Tanda Tangan</span>
            </div>
          </div>

        </form>
      </div>

      {/* Scoped CSS styling for printing and form elements */}
      <style jsx>{`
        .form-print-row {
          display: flex;
          align-items: flex-end;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
          color: #374151;
        }
        .form-print-label {
          width: 170px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .form-print-colon {
          width: 15px;
          flex-shrink: 0;
          font-weight: 700;
        }
        .form-print-line {
          flex-grow: 1;
          border-bottom: 1px dotted #4b5563;
          height: 1.1rem;
          margin-bottom: 2px;
        }

        @media print {
          @page {
            size: A4;
            margin: 10mm 15mm 8mm 15mm;
          }
          .print-body-wrapper {
            background-color: white !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
