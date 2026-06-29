"use client";

import React from "react";
import RadarChart from "@/components/RadarChart";

interface PrintReportViewProps {
  printReport: any;
  contactAddress: string;
  onClose: () => void;
}

export default function PrintReportView({ printReport, contactAddress, onClose }: PrintReportViewProps) {
  const isCalistung = printReport.students?.program === "Fun Calistung";

  return (
    <div style={{ padding: "1.5rem", backgroundColor: "white", minHeight: "100vh" }}>
      <div className="no-print" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>
          * Anda sedang melihat pratinjau cetak. Tekan Ctrl+P atau Cmd+P jika dialog print tidak terbuka otomatis.
        </p>
        <button className="btn-portal-outline" onClick={onClose} style={{ cursor: "pointer" }}>
          ← Kembali ke Portal
        </button>
      </div>

      {/* PRINT-OPTIMIZED REPORT LAYOUT */}
      <div className="printable-report" style={{ border: "2px solid #ddd", padding: "2.5rem", borderRadius: "12px", maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Official Header Kop Surat */}
        <div className="report-header-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px double var(--color-primary)", paddingBottom: "1rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "64px", height: "64px" }} />
            <div style={{ textAlign: "left" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0", color: "var(--color-primary)" }}>IBRA GLOBAL ENGLISH</h1>
              <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", margin: "0" }}>Belajar Seru, Lancar Bicara</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", margin: "2px 0 0" }}>{contactAddress}</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>E-RAPOR DIGITAL</h2>
            <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", margin: "0" }}>REKAP HASIL EVALUASI MODUL</p>
          </div>
        </div>

        <div className="student-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "8px" }}>
          <div>
            <p style={{ margin: "0 0 6px" }}><strong>Nama Siswa:</strong> {printReport.students?.name}</p>
            <p style={{ margin: "0" }}><strong>Program Belajar:</strong> {printReport.students?.program} {printReport.students?.age ? `(Usia ${printReport.students?.age} tahun)` : ""}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 6px" }}><strong>ID Evaluasi:</strong> IBRA-REP-{printReport.id.slice(0, 8).toUpperCase()}</p>
            <p style={{ margin: "0" }}><strong>Tanggal Terbit:</strong> {new Date(printReport.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1.5px solid var(--color-gray-300)", paddingBottom: "0.5rem", marginBottom: "1.5rem", color: "var(--color-gray-800)" }}>
          A. DETAIL EVALUASI KOMPETENSI MODUL: {printReport.module_name.toUpperCase()}
        </h3>

        {/* Grid Layout containing Score Cards on Left and visual SVG Radar Chart on Right */}
        <div className="report-scores-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center", marginBottom: "2.5rem" }}>
          
          {/* Scores List */}
          <div className="form-grid" style={{ gap: "1rem", marginBottom: 0 }}>
            <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
              <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.speaking_score}</p>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                {isCalistung ? "Membaca" : "Speaking"}
              </p>
            </div>
            <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
              <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.grammar_score}</p>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                {isCalistung ? "Menulis" : "Grammar"}
              </p>
            </div>
            <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
              <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.vocabulary_score}</p>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                {isCalistung ? "Berhitung" : "Vocabulary"}
              </p>
            </div>
            <div style={{ border: "1px solid var(--color-gray-200)", padding: "1.25rem", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>
              <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0" }}>{printReport.active_score}</p>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)", textTransform: "uppercase", marginTop: "4px" }}>
                {isCalistung ? "Keaktifan" : "Active"}
              </p>
            </div>
          </div>

          {/* Visual SVG Radar Chart */}
          <div>
            <RadarChart 
              speaking={printReport.speaking_score} 
              grammar={printReport.grammar_score} 
              vocabulary={printReport.vocabulary_score} 
              active={printReport.active_score} 
              isCalistung={isCalistung}
            />
          </div>

        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1.5px solid var(--color-gray-300)", paddingBottom: "0.5rem", marginBottom: "1rem", color: "var(--color-gray-800)" }}>
          B. ULASAN & CATATAN MASUKAN TUTOR
        </h3>

        <div className="report-notes-container" style={{ borderLeft: "4px solid var(--color-accent)", margin: "1.5rem 0 3rem", backgroundColor: "var(--color-gray-50)", padding: "1.25rem", borderRadius: "0 8px 8px 0" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--color-gray-700)", fontStyle: "italic", lineHeight: "1.6", margin: "0" }}>
            &ldquo;{printReport.tutor_notes || "Siswa menunjukkan pemahaman yang luar biasa serta keaktifan tinggi selama pengerjaan modul bimbingan ini. Terus latih kemampuan bercakapnya."}&rdquo;
          </p>
        </div>

        {/* Signature Block */}
        <div className="signature-block" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginTop: "4rem" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 4.5rem" }}>Mengetahui,<br /><strong>Orang Tua / Wali Siswa</strong></p>
            <p style={{ margin: "0", fontWeight: "bold" }}>___________________________</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 4.5rem" }}>Bobong, Pulau Taliabu<br /><strong>Tutor Pendamping</strong></p>
            <p style={{ margin: "0", fontWeight: "bold" }}>___________________________</p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: "4px 0 0" }}>Ibra Global English</p>
          </div>
        </div>

      </div>
    </div>
  );
}
