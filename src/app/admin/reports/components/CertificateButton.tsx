"use client";

import { Report, Certificate } from "@/types";

interface Props {
  report: Report;
  certificates: Certificate[];
  onCreate: (report: Report) => void;
  onDelete: (id: string) => void;
}

export default function CertificateButton({ report, certificates, onCreate, onDelete }: Props) {
  const existingCert = certificates.find(
    (c) => c.report_id === report.id || (c.student_id === report.student_id && c.module_name?.toLowerCase() === report.module_name?.toLowerCase())
  );

  if (existingCert) {
    return (
      <div style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
        <a
          href={`/verify/${existingCert.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-portal-outline"
          style={{
            padding: "0.35rem 0.65rem",
            fontSize: "0.8rem",
            display: "inline-flex",
            gap: "0.25rem",
            alignItems: "center",
            borderColor: "var(--color-accent)",
            color: "var(--color-accent)",
            fontWeight: "bold",
            textDecoration: "none",
            borderRadius: "var(--radius-sm)"
          }}
        >
          Sertifikat
        </a>
        <button
          className="btn-portal-danger"
          style={{
            padding: "0.35rem 0.5rem",
            fontSize: "0.8rem",
            cursor: "pointer",
            borderRadius: "var(--radius-sm)"
          }}
          onClick={() => onDelete(existingCert.id)}
          title="Hapus Sertifikat"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn-portal-outline"
      style={{
        padding: "0.35rem 0.75rem",
        fontSize: "0.8rem",
        display: "inline-flex",
        gap: "0.25rem",
        alignItems: "center",
        borderColor: "var(--color-gray-400)",
        color: "var(--color-gray-600)",
        cursor: "pointer",
        borderRadius: "var(--radius-sm)"
      }}
      onClick={() => onCreate(report)}
    >
      + Sertifikat
    </button>
  );
}
