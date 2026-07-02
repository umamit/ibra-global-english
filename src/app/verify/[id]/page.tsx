"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import "./verify.css";

interface CertStudents {
  name: string;
  program: string;
}

interface CertReport {
  speaking_score: number;
  grammar_score: number;
  vocabulary_score: number;
  active_score: number;
  tutor_notes?: string;
}

interface CertData {
  id: string;
  cert_number?: string;
  issue_date: string;
  module_name: string;
  grade: string;
  tutor_name: string;
  student_id: string;
  custom_image_url: string;
  students?: CertStudents;
  reports?: CertReport | null;
}

export default function VerifyCertificate() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [cert, setCert] = useState<CertData | null>(null);
  const [theme, setTheme] = useState<string>("light");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem("theme") || "light";
    setTimeout(() => {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }, 0);

    if (!id) return;

    async function fetchCertificate() {
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*, students(*), reports(*)")
          .eq("id", id)
          .single();

        if (error) throw error;

        let finalCert: CertData = data as CertData;
        // Fallback to fetch report if report_id relation is not fully loaded or null
        if (!finalCert.reports && finalCert.student_id) {
          const { data: repData } = await supabase
            .from("reports")
            .select("*")
            .eq("student_id", finalCert.student_id)
            .ilike("module_name", finalCert.module_name)
            .limit(1)
            .maybeSingle();
          if (repData) {
            finalCert = { ...finalCert, reports: repData as CertReport };
          }
        }
        setCert(finalCert);
      } catch (err) {
        console.error("Gagal memvalidasi sertifikat:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="auth-wrapper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
        <div style={{ textAlign: "center", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p style={{ fontWeight: "700" }}>Memverifikasi Kode Sertifikat Digital...</p>
        </div>
      </div>
    );
  }

  // Calculate scores if report exists
  const report = cert?.reports;
  const isCalistung = cert?.students?.program?.toLowerCase()?.includes("calistung");
  const avgScore = report ? Math.round((report.speaking_score + report.grammar_score + report.vocabulary_score + report.active_score) / 4) : 0;

  const qrCodeUrl = cert ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/verify/" + cert.id : "https://ibra.com/verify/" + cert.id)}` : "";

  const formattedDate = cert ? new Date(cert.issue_date).toLocaleDateString(
    cert.students?.program?.toLowerCase()?.includes("calistung") ? "id-ID" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  ) : "";

  const handleDownloadPDF = async () => {
    if (!cert) return;
    setIsGeneratingPDF(true);

    try {
      const origin = encodeURIComponent(window.location.origin);
      const res = await fetch(`/api/generate-certificate?id=${cert.id}&origin=${origin}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(body.error || `Server error: ${res.status}`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `sertifikat-ige-${cert.cert_number || cert.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Gagal membuat PDF: ${msg}`);
      console.error("PDF download error:", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };


  const completionText = cert?.students?.program?.toLowerCase()?.includes("calistung")
    ? `telah menyelesaikan program Calistung ${cert?.module_name || ""}`
    : `for successfully completing the ${cert?.module_name || ""}`;

  const datePrefixText = cert?.students?.program?.toLowerCase()?.includes("calistung")
    ? `Diterbitkan tanggal: ${formattedDate}`
    : `Issued on: ${formattedDate}`;

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem" }} className="verify-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 297mm !important;
            overflow: hidden !important;
          }
          .verify-page-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            min-height: unset !important;
            background: #ffffff !important;
            width: 297mm !important;
            max-width: 297mm !important;
            overflow: hidden !important;
          }
          .cert-outer-wrapper {
            max-width: 297mm !important;
            width: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          .certificate-print-container {
            display: block !important;
            width: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
            background: none !important;
            box-shadow: none !important;
          }
          .certificate-page-1 {
            display: block !important;
            width: 297mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            aspect-ratio: unset !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .certificate-page-2 {
            width: 297mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            aspect-ratio: unset !important;
            page-break-before: always !important;
            break-before: page !important;
            page-break-after: avoid !important;
            background-color: #fdfaf6 !important;
            color: #1d1d1f !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            display: block !important;
          }
          /* Scale inner content to ensure nothing overflows 210mm */
          .certificate-page-2 > * {
            transform-origin: top left;
          }
          .certificate-page-2 .cert-back-inner-wrapper {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            width: 100% !important;
            height: 210mm !important;
            padding: 8mm 12mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          /* Tighten spacing for print only */
          .cert-header {
            padding-bottom: 3px !important;
            margin-bottom: 0 !important;
          }
          .cert-metadata-grid {
            margin: 4px 0 !important;
            gap: 1rem !important;
          }
          .cert-footer-grid {
            margin-top: 4px !important;
            gap: 1rem !important;
          }
          .tutor-review-box {
            padding: 4px 8px !important;
          }
          .cert-sign-off-date {
            margin-bottom: 16px !important;
          }

          /* Map cqw → mm for A4 landscape (1cqw = 2.97mm) */
          .cert-student-name-text {
            font-size: 15.4mm !important;
            letter-spacing: 0.45mm !important;
          }
          .cert-no-overlay {
            font-size: 5.3mm !important;
            top: 29.0% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
          .cert-course-overlay {
            font-size: 6.2mm !important;
            top: 61.5% !important;
          }
          .cert-date-overlay {
            font-size: 5.9mm !important;
            top: 66.0% !important;
          }
          .cert-tutor-name-overlay {
            font-size: 5.3mm !important;
            top: 79.5% !important;
            left: 29.5% !important;
          }
          .cert-tutor-title-overlay {
            font-size: 3.2mm !important;
            top: 83.2% !important;
            left: 29.5% !important;
          }
          .cert-grade-table th, .cert-grade-table td {
            padding: 1mm 2mm !important;
            font-size: 0.65rem !important;
          }
          .cert-qr-overlay {
            bottom: 9% !important;
            left: 78.5% !important;
            width: 65.3mm !important;
          }
          .cert-qr-box {
            padding: 1.8mm !important;
            border-width: 0.45mm !important;
            border-radius: 2.4mm !important;
            width: 29.7mm !important;
            height: 29.7mm !important;
          }
          .cert-qr-line {
            border-top-width: 0.45mm !important;
            width: 41.5mm !important;
            margin: 1.2mm auto !important;
          }
          .cert-qr-label-title {
            font-size: 3.4mm !important;
            letter-spacing: 0.3mm !important;
          }
          .cert-qr-label-subtitle {
            font-size: 2.7mm !important;
          }
          .cert-back-inner-frame {
            top: 4mm !important;
            left: 4mm !important;
            right: 4mm !important;
            bottom: 4mm !important;
            border-width: 0.74mm !important;
          }
          .cert-back-inner-gold-line {
            top: 6mm !important;
            left: 6mm !important;
            right: 6mm !important;
            bottom: 6mm !important;
            border-width: 0.3mm !important;
          }
        }
      `}} />

      <div className="cert-outer-wrapper" style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}>

        {/* Navigation & Verification Banner */}
        <div className="no-print" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontWeight: "800", textDecoration: "none" }}>
              ← Beranda Utama Ibra
            </Link>
            <button
              className="btn-portal-primary"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              aria-label="Download sertifikat sebagai PDF"
              style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center", cursor: isGeneratingPDF ? "wait" : "pointer", opacity: isGeneratingPDF ? 0.7 : 1 }}
            >
              {isGeneratingPDF ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Sedang Generate PDF...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Download Sertifikat PDF</span>
                </>
              )}
            </button>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} className={cert ? "verify-title-success" : "verify-title-error"}>
            {cert ? "✓ Sertifikat Terverifikasi Asli" : "✗ Sertifikat Tidak Valid"}
          </h1>
          <p className="verify-subtitle" style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Sistem Verifikasi Kelulusan LKP Ibra Global English Bobong (Dinas Pendidikan)
          </p>
        </div>

        {cert ? (
          <>
            <div id="certificate-print-area" className="certificate-print-container" style={{ display: "flex", flexDirection: "column", gap: "0" }}>

            {/* ==================== PAGE 1: DEPAN (Canva Design) ==================== */}
            <div id="cert-page-1-el" className="certificate-page-1">
              {/* Canva Image Background */}
              <img
                src={cert.custom_image_url}
                alt="Sertifikat Ibra Global English"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />

              {/* Dynamic Certificate Number Overlay */}
              {cert.cert_number && (
                <div className="cert-no-overlay">
                  {cert.cert_number}
                </div>
              )}

              {/* Dynamic Student Name Overlay (Center) */}
              <div className="cert-student-name-overlay">
                <h2 className="cert-student-name-text">
                  {cert.students?.name}
                </h2>
              </div>

              {/* Dynamic Completion Course Overlay */}
              <div className="cert-course-overlay">
                {completionText}
              </div>

              {/* Dynamic Date Issued Overlay */}
              <div className="cert-date-overlay">
                {datePrefixText}
              </div>

              {/* Dynamic Tutor Signature Overlay (Bottom Left) */}
              {cert.tutor_name && (
                <>
                  <div className="cert-tutor-name-overlay">{cert.tutor_name}</div>
                  <div className="cert-tutor-title-overlay">Direktur</div>
                </>
              )}

              {/* Dynamic QR Code Verification Overlay (Bottom Right) */}
              <div className="cert-qr-overlay">
                <div className="cert-qr-box">
                  <img
                    src={qrCodeUrl}
                    alt="Scan to Verify"
                    loading="lazy"
                    className="cert-qr-img"
                  />
                </div>
                <div className="cert-qr-label-container">
                  <div className="cert-qr-line" />
                  <p className="cert-qr-label-title">VERIFIKASI</p>
                  <p className="cert-qr-label-subtitle">ASLI ONLINE</p>
                </div>
              </div>
            </div>

            {/* ==================== PAGE 2: BELAKANG (Grade Transcript) ==================== */}
            <div id="cert-page-2-el" className="certificate-page-2 pdf-page-break" style={{
              backgroundImage: "url('/assets/Salinan dari Salinan dari Blue and Gold Simple Elegant Certificate of Appreciation.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              padding: "4.5cqw 6.5cqw"
            }}>

              {/* Header */}
              <div className="cert-header" style={{ textAlign: "center", paddingBottom: "0.75rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", letterSpacing: "1.5px", margin: "0 0 2px" }}>
                  IBRA GLOBAL ENGLISH
                </h2>
                <p style={{ fontSize: "0.75rem", color: "var(--color-primary-dark)", letterSpacing: "1px", fontWeight: "bold", margin: "0 0 6px", textTransform: "uppercase" }}>
                  Lembaga Kursus & Pelatihan (LKP)
                </p>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", margin: "0", textTransform: "uppercase" }}>
                  TRANSKRIP EVALUASI AKADEMIK (ACADEMIC TRANSCRIPT)
                </h3>
              </div>

              {/* Student Metadata Info Grid */}
              <div className="cert-metadata-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", margin: "1rem 0" }}>
                <table className="cert-metadata-table">
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: "bold", width: "130px" }}>Nama Siswa</td>
                      <td>: {cert.students?.name}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>Program Belajar</td>
                      <td>: {cert.students?.program}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="cert-metadata-table">
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: "bold", width: "130px" }}>Nomor Sertifikat</td>
                      <td>: {cert.cert_number || "-"}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>Tanggal Terbit</td>
                      <td>: {new Date(cert.issue_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Grades Table */}
              <table className="cert-grade-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px", textAlign: "center" }}>No</th>
                    <th>Kompetensi Belajar (Subjects)</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Skor (Score)</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Predikat (Grade)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "center" }}>1</td>
                    <td style={{ fontWeight: "600" }}>
                      {isCalistung ? "Kemampuan Membaca (Reading Skill)" : "Speaking & Pronunciation"}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      {report?.speaking_score || 0}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      {(report?.speaking_score || 0) >= 85 ? "A" : (report?.speaking_score || 0) >= 75 ? "B" : "C"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "center" }}>2</td>
                    <td style={{ fontWeight: "600" }}>
                      {isCalistung ? "Kemampuan Menulis (Writing Skill)" : "Grammar & Structure"}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      {report?.grammar_score || 0}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      {(report?.grammar_score || 0) >= 85 ? "A" : (report?.grammar_score || 0) >= 75 ? "B" : "C"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "center" }}>3</td>
                    <td style={{ fontWeight: "600" }}>
                      {isCalistung ? "Kemampuan Berhitung (Math Skill)" : "Vocabulary & Comprehension"}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      {report?.vocabulary_score || 0}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      {(report?.vocabulary_score || 0) >= 85 ? "A" : (report?.vocabulary_score || 0) >= 75 ? "B" : "C"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "center" }}>4</td>
                    <td style={{ fontWeight: "600" }}>
                      Keaktifan Siswa (Class Participation)
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      {report?.active_score || 0}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>
                      {(report?.active_score || 0) >= 85 ? "A" : (report?.active_score || 0) >= 75 ? "B" : "C"}
                    </td>
                  </tr>
                  <tr className="average-row">
                    <td colSpan={2} style={{ textAlign: "right" }}>RATA-RATA / AVERAGE</td>
                    <td style={{ textAlign: "center", fontSize: "0.9rem" }}>
                      {avgScore}
                    </td>
                    <td style={{ textAlign: "center", fontSize: "0.85rem" }}>
                      {cert.grade}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Teacher Sign-off Footer */}
              <div className="cert-footer-grid" style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>

                {/* Sign-off */}
                <div style={{ textAlign: "center", paddingBottom: "1rem", width: "200px" }}>
                  <p className="cert-sign-off-date" style={{ margin: "0 0 56px", fontSize: "0.75rem", color: "var(--color-gray-600)" }}>
                    Bobong, {new Date(cert.issue_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p style={{ margin: "0 0 4px", fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-gray-900)" }}>{cert.tutor_name}</p>
                  <div style={{ borderTop: "1px solid var(--color-gray-400)", width: "140px", margin: "4px auto" }} />
                  <p style={{ margin: "0", fontSize: "0.7rem", color: "var(--color-gray-500)" }}>Direktur</p>
                </div>

              </div>

            </div>

          </div>
          
          {/* Legal Information Card */}
          <div className="verify-legal-card">
            <div style={{ width: "50px", height: "50px", flexShrink: 0 }}>
              <img src="/assets/logo.png" alt="Logo PT. Ibra Global English" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: "bold", color: "var(--color-gray-900)" }}>Informasi Hukum & Legalitas Lembaga</h4>
              <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: "1.6" }}>
                Sertifikat ini diterbitkan secara sah oleh <strong>PT. Ibra Global English</strong> (Perseroan Perorangan) yang berbadan hukum resmi berdasarkan Keputusan Menteri Hukum dan Hak Asasi Manusia Republik Indonesia dengan Nomor SK Pendirian: <strong>AHU-A096371.AH.01.30.Tahun 2026</strong>, NIB: <strong>2806230044842</strong>, dan NPWP: <strong>1000 0000 0996 6538</strong>.
              </p>
            </div>
          </div>
          </>
        ) : (
          /* INVALID CERTIFICATE ERROR CARD */
          <div className="invalid-cert-card">
            <svg style={{ color: "var(--color-red)", width: "56px", height: "56px", marginBottom: "1.5rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>Sertifikat Tidak Ditemukan</h3>
            <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", maxWidth: "550px", margin: "0 auto", lineHeight: "1.6" }}>
              Maaf, tanda pengenal sertifikat digital ini tidak terdaftar di pangkalan data Ibra Global English Bobong atau telah ditarik kembali oleh administrator. Silakan periksa kembali tautan verifikasi Anda.
            </p>
            <button className="btn-portal-outline" onClick={() => router.push("/")} style={{ marginTop: "2rem", cursor: "pointer" }}>
              Kembali ke Beranda Utama
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
