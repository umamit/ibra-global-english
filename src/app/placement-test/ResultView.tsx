import React from "react";
import Button from "@/components/Button";

interface PlacementResult {
  id: string;
  score: number;
  level: string;
  description: string;
  programRecommendation: string;
  studyTimeAdvice: string;
}

interface ResultViewProps {
  userData: {
    fullName: string;
    email: string;
    whatsapp: string;
  };
  finalResult: PlacementResult;
  questionsLength: number;
  issueDateStr: string;
  onRestart: () => void;
}

export default function ResultView({
  userData,
  finalResult,
  questionsLength,
  issueDateStr,
  onRestart
}: ResultViewProps) {
  const getWhatsAppURL = () => {
    const targetPhone = "6281357001357";
    const text = `Halo Ibra Global English Bobong!\nSaya baru saja menyelesaikan *Tes Penempatan Bahasa Inggris Online* di website.\n\n*Nama:* ${userData.fullName}\n*Rekomendasi Level:* ${finalResult.level}\n*Skor Tes:* ${finalResult.score} / ${questionsLength}\n*Nomor Tes:* ${finalResult.id.slice(0, 8).toUpperCase()}\n\nSaya ingin berkonsultasi mengenai kelas yang sesuai dengan hasil pengujian saya. Terima kasih!`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media screen {
          .print-only {
            display: none !important;
          }
        }
        @media print {
          /* Hide everything on screen */
          body *, html * {
            visibility: hidden !important;
          }
          /* Show print-only */
          .print-only, .print-only * {
            visibility: visible !important;
          }
          .print-only {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background-color: white !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          @page {
            size: A4 portrait !important;
            margin: 0 !important;
          }
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            height: 297mm !important;
          }
        }
      `}} />

      {/* SUCCESS RESULT VIEW FOR SCREEN */}
      <div className="no-print">
        <div className="placement-result-card">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "60px", height: "64px" }} />
            <div style={{ textAlign: "left" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: "900", margin: "0", letterSpacing: "1px", color: "var(--color-gray-950)" }}>IBRA GLOBAL ENGLISH</h2>
              <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", margin: "0", letterSpacing: "2px" }}>BELAJAR SERU, LANCAR BICARA</p>
            </div>
          </div>

          <div style={{ width: "100%", height: "2px", background: "linear-gradient(to right, transparent, var(--color-accent), transparent)", margin: "1.5rem 0" }}></div>

          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", fontStyle: "italic", color: "var(--color-gray-500)", marginBottom: "1rem" }}>
            Placement Test Statement of Result
          </h3>

          <p style={{ fontSize: "1rem", color: "var(--color-gray-600)", margin: "0 0 1.5rem" }}>
            Sertifikat digital ini diberikan secara resmi kepada:
          </p>

          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0 0 0.5rem", fontFamily: "Georgia, serif" }}>
            {userData.fullName}
          </h1>
          
          <p style={{ fontSize: "0.95rem", color: "var(--color-gray-500)", marginBottom: "2rem" }}>
            untuk menyelesaikan ujian evaluasi kompetensi Bahasa Inggris umum online.
          </p>

          <div className="form-grid" style={{ gap: "2rem", maxWidth: "500px", margin: "0 auto 2.5rem" }}>
            <div className="result-sub-box">
              <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Skor Capaian</p>
              <p style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-primary)" }}>{finalResult.score} <span style={{ fontSize: "1.1rem", color: "var(--color-gray-400)" }}>/ {questionsLength}</span></p>
            </div>
            <div className="result-sub-box">
              <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Rekomendasi Tingkat</p>
              <p style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-accent)" }}>{finalResult.level}</p>
            </div>
          </div>

          <div style={{ maxWidth: "550px", margin: "0 auto 2rem", padding: "0 1.5rem" }}>
            <p style={{ fontSize: "0.95rem", color: "var(--color-gray-700)", lineHeight: "1.6", fontWeight: "600" }}>
              &ldquo;{finalResult.description}&rdquo;
            </p>
          </div>

          {/* Program & Study Time Recommendations */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "550px", margin: "0 auto 2.5rem", padding: "0 1.5rem" }}>
            <div className="rec-card-primary">
              <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "var(--color-primary-dark)", marginBottom: "6px", letterSpacing: "0.5px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 18.8v-4L2 13v6a1 1 0 0 0 1 1h3Z"/><path d="M21.5 12v6h-1.18a1 1 0 0 0-.96.72l-.72 2.56a1 1 0 0 1-1.92 0l-.72-2.56a1 1 0 0 0-.96-.72H15v-6"/></svg>
                <span>Program yang Direkomendasikan</span>
              </p>
              <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-primary-dark)", lineHeight: "1.4" }}>{finalResult.programRecommendation}</p>
            </div>
            <div className="rec-card-accent">
              <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "6px", letterSpacing: "0.5px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Saran Waktu Belajar</span>
              </p>
              <p className="rec-card-accent-text">{finalResult.studyTimeAdvice}</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 1.5rem" }}>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", margin: "0" }}>Tanggal Terbit:</p>
              <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)" }}>{issueDateStr}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", margin: "0" }}>Nomor Verifikasi:</p>
              <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", textTransform: "uppercase" }}>IBRA-OPT-{finalResult.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
          <Button
            href={getWhatsAppURL()}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            style={{ display: "flex", gap: "0.5rem", alignItems: "center", textDecoration: "none", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>Daftar Kelas via WhatsApp</span>
          </Button>

          <Button onClick={handlePrint} variant="placement-action" style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Cetak Sertifikat</span>
          </Button>

          <Button onClick={onRestart} variant="placement-action" style={{ padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}>
            Ulangi Tes
          </Button>

          <Button href="/" variant="placement-action" style={{ display: "flex", gap: "0.5rem", alignItems: "center", textDecoration: "none", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Keluar Tes</span>
          </Button>
        </div>
      </div>

      {/* PRINT-ONLY VIEW FOR THE STATEMENT OF RESULT */}
      <div className="print-only" style={{ width: "210mm", height: "297mm", boxSizing: "border-box" }}>
        <div style={{ backgroundColor: "white", padding: "2cm", border: "10px double #A68849", textAlign: "center", fontFamily: "Georgia, serif", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Header */}
          <div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "60px", height: "64px" }} />
              <div style={{ textAlign: "left" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "900", margin: "0", letterSpacing: "1px", color: "black" }}>IBRA GLOBAL ENGLISH</h2>
                <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "#A68849", margin: "0", letterSpacing: "2px" }}>BELAJAR SERU, LANCAR BICARA</p>
              </div>
            </div>
            <hr style={{ borderColor: "#A68849", margin: "0 0 1rem" }} />
            <h3 style={{ fontStyle: "italic", fontSize: "1.2rem", margin: "1rem 0", color: "black" }}>Placement Test Statement of Result</h3>
          </div>

          {/* Recipient info */}
          <div>
            <p style={{ margin: "1rem 0", color: "black" }}>Sertifikat digital ini diberikan secara resmi kepada:</p>
            <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#216c7e", margin: "1rem 0" }}>{userData.fullName}</h1>
            <p style={{ margin: "1rem 0", color: "black" }}>untuk menyelesaikan ujian evaluasi kompetensi Bahasa Inggris umum online.</p>
          </div>

          {/* Score display */}
          <div style={{ display: "flex", justifyContent: "center", gap: "2.5cm", margin: "1.5rem 0" }}>
            <div style={{ border: "1px solid #ddd", padding: "1rem", minWidth: "4cm" }}>
              <p style={{ fontSize: "0.8rem", margin: "0 0 0.5rem", color: "black" }}>SKOR CAPAIAN</p>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0", color: "black" }}>{finalResult.score} / {questionsLength}</p>
            </div>
            <div style={{ border: "1px solid #ddd", padding: "1rem", minWidth: "4cm" }}>
              <p style={{ fontSize: "0.8rem", margin: "0 0 0.5rem", color: "black" }}>REKOMENDASI TINGKAT</p>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0", color: "black" }}>{finalResult.level}</p>
            </div>
          </div>

          {/* Description advice */}
          <div style={{ maxWidth: "85%", margin: "0 auto" }}>
            <p style={{ fontStyle: "italic", margin: "1rem 0", lineHeight: "1.6", color: "black" }}>&ldquo;{finalResult.description}&rdquo;</p>
          </div>

          {/* Sign-off signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2cm", padding: "0 1rem" }}>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "0.8rem", margin: "0", color: "black" }}>Tanggal Terbit:</p>
              <p style={{ fontSize: "0.9rem", fontWeight: "bold", color: "black" }}>{issueDateStr}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.8rem", margin: "0", color: "black" }}>Nomor Verifikasi:</p>
              <p style={{ fontSize: "0.9rem", fontWeight: "bold", color: "black" }}>IBRA-OPT-{finalResult.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
