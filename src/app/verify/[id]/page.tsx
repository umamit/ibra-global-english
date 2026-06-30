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

  const completionText = cert?.students?.program?.toLowerCase()?.includes("calistung")
    ? `telah menyelesaikan program Calistung ${cert?.module_name || ""}`
    : `for successfully completing the ${cert?.module_name || ""}`;

  const datePrefixText = cert?.students?.program?.toLowerCase()?.includes("calistung")
    ? `Diterbitkan tanggal: ${formattedDate}`
    : `Issued on: ${formattedDate}`;

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem" }} className="verify-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html, .verify-page-wrapper {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .certificate-print-container {
            width: 297mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: none !important;
            display: block !important;
          }
          .certificate-page-1, .certificate-page-2 {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            page-break-after: always !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .certificate-page-1 {
            border: none !important;
          }
          .certificate-page-2 {
            border: none !important;
            page-break-before: always !important;
            background-color: #faf7f2 !important;
            color: #1d1d1f !important;
            padding: 4.6mm 9.5mm !important;
          }

          /* Explicitly map container query units (cqw) to print mm values for PDF generation */
          .cert-student-name-text {
            font-size: 15.4mm !important;
            letter-spacing: 0.45mm !important;
          }
          .cert-no-overlay {
            font-size: 5.3mm !important;
            top: 30.8% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
          .cert-course-overlay {
            font-size: 6.2mm !important;
            top: 62.5% !important;
          }
          .cert-date-overlay {
            font-size: 5.9mm !important;
            top: 67% !important;
          }
          .cert-tutor-name-overlay {
            font-size: 5.3mm !important;
            top: 79.5% !important;
            left: 29.5% !important;
          }
          .cert-tutor-title-overlay {
            font-size: 3.2mm !important;
            top: 84.5% !important;
            left: 29.5% !important;
          }
          .cert-grade-table th, .cert-grade-table td {
            padding: 1.2mm 2.1mm !important;
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
            top: 6.5mm !important;
            left: 6.5mm !important;
            right: 6.5mm !important;
            bottom: 6.5mm !important;
            border-width: 0.74mm !important;
          }
          .cert-back-inner-gold-line {
            top: 8.6mm !important;
            left: 8.6mm !important;
            right: 8.6mm !important;
            bottom: 8.6mm !important;
            border-width: 0.3mm !important;
          }
        }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}} />

      <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}>

        {/* Navigation & Verification Banner */}
        <div className="no-print" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontWeight: "800", textDecoration: "none" }}>
              ← Beranda Utama Ibra
            </Link>
            <button
              className="btn-portal-primary"
              onClick={() => window.print()}
              style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center", cursor: "pointer" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Cetak Sertifikat (Bolak-Balik)</span>
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
          <div className="certificate-print-container" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* ==================== PAGE 1: DEPAN (Canva Design) ==================== */}
            <div className="certificate-page-1">
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
                  <div className="cert-tutor-title-overlay">Tutor</div>
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
            <div className="certificate-page-2">
              {/* Inner Borders Matching Front Template */}
              <div className="cert-back-inner-frame" />
              <div className="cert-back-inner-gold-line" />

              {/* Top-Left Diagonal Ribbon */}
              <svg style={{ position: "absolute", top: 0, left: 0, width: "18cqw", height: "18cqw", zIndex: 6, pointerEvents: "none" }} viewBox="0 0 100 100">
                <path d="M-10,35 Q 25,25 35,-10 M-10,45 Q 35,35 45,-10 M-10,55 Q 45,45 55,-10 M-10,65 Q 55,55 65,-10" fill="none" stroke="#1c3d3a" strokeWidth="4" />
                <path d="M-10,40 Q 30,30 40,-10 M-10,50 Q 40,40 50,-10" fill="none" stroke="#a68849" strokeWidth="1.5" />
              </svg>

              {/* Bottom-Right Diagonal Ribbon */}
              <svg style={{ position: "absolute", bottom: 0, right: 0, width: "18cqw", height: "18cqw", transform: "rotate(180deg)", zIndex: 6, pointerEvents: "none" }} viewBox="0 0 100 100">
                <path d="M-10,35 Q 25,25 35,-10 M-10,45 Q 35,35 45,-10 M-10,55 Q 45,45 55,-10 M-10,65 Q 55,55 65,-10" fill="none" stroke="#1c3d3a" strokeWidth="4" />
                <path d="M-10,40 Q 30,30 40,-10 M-10,50 Q 40,40 50,-10" fill="none" stroke="#a68849" strokeWidth="1.5" />
              </svg>

              {/* Top-Right Floral Ornament */}
              <svg style={{ position: "absolute", top: "1.2cqw", right: "1.2cqw", width: "12cqw", height: "12cqw", zIndex: 6, pointerEvents: "none", color: "#1c3d3a" }} viewBox="0 0 100 100">
                <path d="M85,15 C75,15 65,25 65,35 C65,45 75,45 85,35 C95,25 85,15 85,15 Z M65,35 C55,35 45,45 45,55 C45,65 55,65 65,55 C75,45 65,35 65,35 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M78,22 C72,20 68,24 68,28 C68,32 72,32 78,28 C84,24 78,22 78,22 Z" fill="none" stroke="#a68849" strokeWidth="1.5" />
                <circle cx="55" cy="45" r="2.5" fill="#a68849" />
                <circle cx="75" cy="25" r="2" fill="#1c3d3a" />
              </svg>

              {/* Bottom-Left Floral Ornament */}
              <svg style={{ position: "absolute", bottom: "1.2cqw", left: "1.2cqw", width: "12cqw", height: "12cqw", transform: "rotate(180deg)", zIndex: 6, pointerEvents: "none", color: "#1c3d3a" }} viewBox="0 0 100 100">
                <path d="M85,15 C75,15 65,25 65,35 C65,45 75,45 85,35 C95,25 85,15 85,15 Z M65,35 C55,35 45,45 45,55 C45,65 55,65 65,55 C75,45 65,35 65,35 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M78,22 C72,20 68,24 68,28 C68,32 72,32 78,28 C84,24 78,22 78,22 Z" fill="none" stroke="#a68849" strokeWidth="1.5" />
                <circle cx="55" cy="45" r="2.5" fill="#a68849" />
                <circle cx="75" cy="25" r="2" fill="#1c3d3a" />
              </svg>

              {/* Elegant Faded Background Logo */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.04,
                width: "350px",
                height: "350px",
                backgroundImage: "url('/assets/logo.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                pointerEvents: "none"
              }} />

              {/* Header */}
              <div className="cert-header" style={{ textAlign: "center", borderBottom: "2px solid var(--color-accent)", paddingBottom: "0.75rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", letterSpacing: "1.5px", margin: "0 0 2px" }}>
                  IBRA GLOBAL ENGLISH
                </h2>
                <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", letterSpacing: "1px", fontWeight: "bold", margin: "0 0 6px", textTransform: "uppercase" }}>
                  Lembaga Kursus & Pelatihan (LKP) Dinas Pendidikan Bobong
                </p>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", margin: "0", textTransform: "uppercase" }}>
                  TRANSKRIP EVALUASI AKADEMIK (ACADEMIC TRANSCRIPT)
                </h3>
              </div>

              {/* Student Metadata Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", margin: "1rem 0" }}>
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

              {/* Review Notes & Teacher Sign-off Footer Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "2rem", alignItems: "flex-end", marginTop: "0.5rem" }}>

                {/* Notes */}
                <div className="tutor-review-box">
                  <p className="title" style={{ margin: "0 0 3px 0", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase" }}>Catatan Guru (Tutor Review Notes)</p>
                  <p className="content" style={{ margin: "0", fontSize: "0.75rem", fontStyle: "italic", lineHeight: "1.4" }}>
                    &ldquo;{report?.tutor_notes || "Siswa menunjukkan pemahaman yang luar biasa serta keaktifan tinggi selama pengerjaan modul bimbingan ini. Terus tingkatkan kompetensi bahasa Inggrisnya!"}&rdquo;
                  </p>
                </div>

                {/* Sign-off */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 40px", fontSize: "0.75rem", color: "var(--color-gray-600)" }}>
                    Bobong, {new Date(cert.issue_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <div style={{ borderTop: "1px solid var(--color-gray-300)", width: "140px", margin: "4px auto" }} />
                  <p style={{ margin: "0", fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-gray-900)" }}>{cert.tutor_name}</p>
                  <p style={{ margin: "0", fontSize: "0.7rem", color: "var(--color-gray-500)" }}>Tutor Pendamping</p>
                </div>

              </div>

            </div>

          </div>
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
