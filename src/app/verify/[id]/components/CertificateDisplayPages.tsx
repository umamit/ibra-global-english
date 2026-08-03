import React from "react";

export function CertificateFrontPage({ cert, completionText, datePrefixText, qrCodeUrl }: any) {
  return (
    <div id="cert-page-1-el" className="certificate-page-1">
      <img src={cert.custom_image_url} alt="Sertifikat Ibra Global English" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
      {cert.cert_number && <div className="cert-no-overlay">{cert.cert_number}</div>}
      <div className="cert-student-name-overlay"><h2 className="cert-student-name-text">{cert.students?.name}</h2></div>
      <div className="cert-course-overlay">{completionText}</div>
      <div className="cert-date-overlay">{datePrefixText}</div>
      {cert.tutor_name && (
        <>
          <div className="cert-tutor-name-overlay">{cert.tutor_name}</div>
          <div className="cert-tutor-title-overlay">Direktur</div>
        </>
      )}
      <div className="cert-qr-overlay">
        <div className="cert-qr-box">
          <img src={qrCodeUrl} alt="Scan to Verify" loading="lazy" className="cert-qr-img" />
        </div>
        <div className="cert-qr-label-container">
          <div className="cert-qr-line" />
          <p className="cert-qr-label-title">VERIFIKASI</p>
          <p className="cert-qr-label-subtitle">ASLI ONLINE</p>
        </div>
      </div>
    </div>
  );
}

export function CertificateBackPage({ cert, report, isCalistung, avgScore }: any) {
  return (
    <div id="cert-page-2-el" className="certificate-page-2 pdf-page-break" style={{
      backgroundImage: "url('/assets/Salinan dari Salinan dari Blue and Gold Simple Elegant Certificate of Appreciation.png')",
      backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", padding: "4.5cqw 6.5cqw"
    }}>
      <div className="cert-header" style={{ textAlign: "center", paddingBottom: "0.75rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", letterSpacing: "1.5px", margin: "0 0 2px" }}>IBRA GLOBAL ENGLISH</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--color-primary-dark)", letterSpacing: "1px", fontWeight: "bold", margin: "0 0 6px", textTransform: "uppercase" }}>Lembaga Kursus & Pelatihan (LKP)</p>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", margin: "0", textTransform: "uppercase" }}>TRANSKRIP EVALUASI AKADEMIK (ACADEMIC TRANSCRIPT)</h3>
      </div>
      <div className="cert-metadata-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", margin: "1rem 0" }}>
        <table className="cert-metadata-table">
          <tbody>
            <tr><td style={{ fontWeight: "bold", width: "130px" }}>Nama Siswa</td><td>: {cert.students?.name}</td></tr>
            <tr><td style={{ fontWeight: "bold" }}>Program Belajar</td><td>: {cert.students?.program}</td></tr>
          </tbody>
        </table>
        <table className="cert-metadata-table">
          <tbody>
            <tr><td style={{ fontWeight: "bold", width: "130px" }}>Nomor Sertifikat</td><td>: {cert.cert_number || "-"}</td></tr>
            <tr><td style={{ fontWeight: "bold" }}>Tanggal Terbit</td><td>: {new Date(cert.issue_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td></tr>
          </tbody>
        </table>
      </div>
      <table className="cert-grade-table">
        <thead>
          <tr><th style={{ width: "40px", textAlign: "center" }}>No</th><th>Kompetensi Belajar (Subjects)</th><th style={{ width: "120px", textAlign: "center" }}>Skor (Score)</th><th style={{ width: "120px", textAlign: "center" }}>Predikat (Grade)</th></tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: "center" }}>1</td>
            <td style={{ fontWeight: "600" }}>{isCalistung ? "Kemampuan Membaca (Reading Skill)" : "Speaking & Pronunciation"}</td>
            <td style={{ textAlign: "center", fontWeight: "700" }}>{report?.speaking_score || 0}</td>
            <td style={{ textAlign: "center", fontWeight: "700" }}>{(report?.speaking_score || 0) >= 85 ? "A" : (report?.speaking_score || 0) >= 75 ? "B" : "C"}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>2</td>
            <td style={{ fontWeight: "600" }}>{isCalistung ? "Kemampuan Menulis (Writing Skill)" : "Grammar & Structure"}</td>
            <td style={{ textAlign: "center", fontWeight: "700" }}>{report?.grammar_score || 0}</td>
            <td style={{ textAlign: "center", fontWeight: "700" }}>{(report?.grammar_score || 0) >= 85 ? "A" : (report?.grammar_score || 0) >= 75 ? "B" : "C"}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>3</td>
            <td style={{ fontWeight: "600" }}>{isCalistung ? "Kemampuan Berhitung (Math Skill)" : "Vocabulary & Comprehension"}</td>
            <td style={{ textAlign: "center", fontWeight: "700" }}>{report?.vocabulary_score || 0}</td>
            <td style={{ textAlign: "center", fontWeight: "700" }}>{(report?.vocabulary_score || 0) >= 85 ? "A" : (report?.vocabulary_score || 0) >= 75 ? "B" : "C"}</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>4</td>
            <td style={{ fontWeight: "600" }}>Keaktifan Siswa (Class Participation)</td>
            <td style={{ textAlign: "center", fontWeight: "700" }}>{report?.active_score || 0}</td>
            <td style={{ textAlign: "center", fontWeight: "700" }}>{(report?.active_score || 0) >= 85 ? "A" : (report?.active_score || 0) >= 75 ? "B" : "C"}</td>
          </tr>
          <tr className="average-row">
            <td colSpan={2} style={{ textAlign: "right" }}>RATA-RATA / AVERAGE</td>
            <td style={{ textAlign: "center", fontSize: "0.9rem" }}>{avgScore}</td>
            <td style={{ textAlign: "center", fontSize: "0.85rem" }}>{cert.grade}</td>
          </tr>
        </tbody>
      </table>
      <div className="cert-footer-grid" style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
        <div style={{ textAlign: "center", paddingBottom: "1rem", width: "200px" }}>
          <p className="cert-sign-off-date" style={{ margin: "0 0 56px", fontSize: "0.75rem", color: "var(--color-gray-600)" }}>Bobong, {new Date(cert.issue_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p style={{ margin: "0 0 4px", fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-gray-900)" }}>{cert.tutor_name}</p>
          <div style={{ borderTop: "1px solid var(--color-gray-400)", width: "140px", margin: "4px auto" }} />
          <p style={{ margin: "0", fontSize: "0.7rem", color: "var(--color-gray-500)" }}>Direktur</p>
        </div>
      </div>
    </div>
  );
}
