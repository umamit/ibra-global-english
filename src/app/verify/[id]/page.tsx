"use client";

import { useCertificateVerify } from "@/hooks/useCertificateVerify";
import Link from "next/link";
import "./verify.css";
import { PrintCertificateStyles } from "./components/PrintCertificateStyles";
import { CertificateFrontPage, CertificateBackPage } from "./components/CertificateDisplayPages";

export default function VerifyCertificate() {
  const { id, loading, cert, isGeneratingPDF, setIsGeneratingPDF } = useCertificateVerify();

  if (loading) {
    return (
      <div className="auth-wrapper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
        <div style={{ textAlign: "center", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", marginBottom: "1rem", color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p style={{ fontWeight: "700" }}>Memverifikasi Kode Sertifikat Digital...</p>
        </div>
      </div>
    );
  }

  const report = cert?.reports;
  const isCalistung = cert?.students?.program?.toLowerCase()?.includes("calistung");
  const avgScore = report ? Math.round((report.speaking_score + report.grammar_score + report.vocabulary_score + report.active_score) / 4) : 0;
  const qrCodeUrl = cert ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/verify/" + cert.id : "https://ibra.com/verify/" + cert.id)}` : "";
  const formattedDate = cert ? new Date(cert.issue_date).toLocaleDateString(isCalistung ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" }) : "";
  const completionText = isCalistung ? `telah menyelesaikan program Calistung ${cert?.module_name || ""}` : `for successfully completing the ${cert?.module_name || ""}`;
  const datePrefixText = isCalistung ? `Diterbitkan tanggal: ${formattedDate}` : `Issued on: ${formattedDate}`;

  const handleDownloadPDF = async () => {
    if (!cert) return;
    setIsGeneratingPDF(true);
    try {
      const origin = encodeURIComponent(window.location.origin);
      const res = await fetch(`/api/generate-certificate?id=${cert.id}&origin=${origin}`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Server error: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sertifikat-ige-${cert.cert_number || cert.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Gagal membuat PDF: ${err.message || err}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem" }} className="verify-page-wrapper">
      <PrintCertificateStyles />
      <div className="cert-outer-wrapper" style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}>
        <div className="no-print" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontWeight: "800", textDecoration: "none" }}>
              ← Beranda Utama Ibra
            </Link>
            <button className="btn-portal-primary" onClick={handleDownloadPDF} disabled={isGeneratingPDF} aria-label="Download sertifikat sebagai PDF" style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center", cursor: isGeneratingPDF ? "wait" : "pointer", opacity: isGeneratingPDF ? 0.7 : 1 }}>
              {isGeneratingPDF ? <span>Sedang Generate PDF...</span> : <span>Download Sertifikat PDF</span>}
            </button>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} className={cert ? "verify-title-success" : "verify-title-error"}>
            {cert ? <span>Sertifikat Terverifikasi Asli</span> : <span>Sertifikat Tidak Valid</span>}
          </h1>
          <p className="verify-subtitle" style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>Sistem Verifikasi Kelulusan LKP Ibra Global English Bobong</p>
        </div>

        {cert ? (
          <>
            <div id="certificate-print-area" className="certificate-print-container" style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              <CertificateFrontPage cert={cert} completionText={completionText} datePrefixText={datePrefixText} qrCodeUrl={qrCodeUrl} />
              <CertificateBackPage cert={cert} report={report} isCalistung={isCalistung} avgScore={avgScore} />
            </div>
            <div className="verify-legal-card">
              <div style={{ width: "50px", height: "50px", flexShrink: 0 }}><img src="/assets/logo.png" alt="Logo PT. Ibra Global English" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: "bold", color: "var(--color-gray-900)" }}>Informasi Hukum & Legalitas Lembaga</h4>
                <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--color-gray-600)", lineHeight: "1.6" }}>Sertifikat ini diterbitkan secara sah oleh <strong>PT. Ibra Global English</strong> (Perseroan Perorangan) dengan SK Pendirian: <strong>AHU-A096371.AH.01.30.Tahun 2026</strong> dan NIB: <strong>2806230044842</strong>.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="invalid-cert-card">
            <h3 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>Sertifikat Tidak Ditemukan</h3>
            <p style={{ color: "var(--color-gray-600)", fontSize: "0.95rem", maxWidth: "550px", margin: "0 auto", lineHeight: "1.6" }}>Maaf, tanda pengenal sertifikat digital ini tidak terdaftar di pangkalan data Ibra Global English Bobong.</p>
            <Link href="/" className="btn-portal-outline" style={{ marginTop: "2rem", display: "inline-block", textDecoration: "none" }}>Kembali ke Beranda Utama</Link>
          </div>
        )}
      </div>
    </div>
  );
}
