import React from "react";
import RadarChart from "@/components/RadarChart";

export function ReportCardItem({ report, selectedChild, certificates, onSetPrintReport }: any) {
  const isCalistung = selectedChild?.program?.toLowerCase()?.includes("calistung");
  const existingCert = certificates.find((c: any) => c.report_id === report.id || (selectedChild && c.student_id === selectedChild.id && c.module_name?.toLowerCase() === report.module_name?.toLowerCase()));

  return (
    <div className="portal-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-gray-150)", paddingBottom: "1rem" }} className="flex-wrap gap-2">
        <div>
          <h4 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{report.module_name}</h4>
          <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "2px" }}>
            Diterbitkan pada {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-portal-outline" style={{ padding: "0.5rem 1.15rem", fontSize: "0.8rem", display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={() => onSetPrintReport(report)}>
            <span>Cetak Rapor PDF</span>
          </button>
          {existingCert && (
            <a href={`/verify/${existingCert.id}`} target="_blank" rel="noopener noreferrer" className="btn-portal-outline" style={{ padding: "0.5rem 1.15rem", fontSize: "0.8rem", display: "inline-flex", gap: "0.5rem", alignItems: "center", borderColor: "var(--color-accent)", color: "var(--color-accent)", fontWeight: "bold", textDecoration: "none", borderRadius: "var(--radius-md)" }}>
              <span>Lihat Sertifikat</span>
            </a>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", alignItems: "center" }} className="report-detail-layout">
        <div className="stats-grid" style={{ marginBottom: 0 }}>
          <div className="stat-card" style={{ borderTop: "3px solid var(--color-primary)" }}><p className="stat-value" style={{ color: "var(--color-primary-dark)" }}>{report.speaking_score}</p><p className="stat-label">{isCalistung ? "Membaca" : "Speaking"}</p></div>
          <div className="stat-card" style={{ borderTop: "3px solid var(--color-primary)" }}><p className="stat-value" style={{ color: "var(--color-primary-dark)" }}>{report.grammar_score}</p><p className="stat-label">{isCalistung ? "Menulis" : "Grammar"}</p></div>
          <div className="stat-card" style={{ borderTop: "3px solid var(--color-primary)" }}><p className="stat-value" style={{ color: "var(--color-primary-dark)" }}>{report.vocabulary_score}</p><p className="stat-label">{isCalistung ? "Berhitung" : "Vocabulary"}</p></div>
          <div className="stat-card" style={{ borderTop: "3px solid var(--color-accent)" }}><p className="stat-value" style={{ color: "var(--color-accent)" }}>{report.active_score}</p><p className="stat-label">{isCalistung ? "Keaktifan" : "Active"}</p></div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <RadarChart speaking={report.speaking_score} grammar={report.grammar_score} vocabulary={report.vocabulary_score} active={report.active_score} isCalistung={isCalistung} />
        </div>
      </div>

      {report.tutor_notes && (
        <div style={{ borderLeft: "4px solid var(--color-accent)", paddingLeft: "1.25rem", marginTop: "2rem", backgroundColor: "rgba(166, 136, 73, 0.03)", padding: "1.25rem", borderRadius: "0 8px 8px 0" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Catatan Tutor Pendamping</p>
          <p style={{ fontSize: "0.9rem", color: "var(--color-gray-700)", fontStyle: "italic", lineHeight: "1.6", margin: "0" }}>&ldquo;{report.tutor_notes}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
