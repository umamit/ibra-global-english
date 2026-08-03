"use client";

import React from "react";
import Link from "next/link";
import { Report } from "@/types";

interface ReportTableProps {
  reports: Report[];
  loading: boolean;
  onPrint: (report: Report) => void;
  onDelete: (id: string, moduleName: string, studentName: string) => void;
}

export default function ReportTable({ reports, loading, onPrint, onDelete }: ReportTableProps) {
  if (loading) {
    return (
      <div className="portal-card" style={{ padding: "2rem" }}>
        <p style={{ color: "var(--color-gray-500)", textAlign: "center", padding: "2rem 0" }}>Memuat riwayat rapor...</p>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
        Riwayat Penerbitan Rapor &amp; Sertifikat
      </h3>
      {reports.length === 0 ? (
        <p style={{ color: "var(--color-gray-400)", textAlign: "center", padding: "2rem 0" }}>Belum ada rapor digital diterbitkan.</p>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Program</th>
                <th>Modul</th>
                <th>Nilai Rata-Rata</th>
                <th>Ulasan Tutor</th>
                <th>Sertifikat</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, idx) => {
                const isCalistung = report.students?.program === "Fun Calistung";
                const labels = isCalistung
                  ? ["Membaca", "Menulis", "Berhitung", "Keaktifan"]
                  : ["Speaking", "Grammar", "Vocab", "Active"];
                const avg = Math.round((report.speaking_score + report.grammar_score + report.vocabulary_score + report.active_score) / 4);

                return (
                  <tr key={report.id}>
                    <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                    <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>
                      {report.students?.name || <span style={{ color: "var(--color-gray-400)", fontStyle: "italic" }}>Siswa terhapus</span>}
                    </td>
                    <td>
                      <span className="user-badge" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.2rem 0.5rem", fontWeight: "700" }}>
                        {report.students?.program?.split(" ")[0] || "-"}
                      </span>
                    </td>
                    <td style={{ fontWeight: "600" }}>{report.module_name}</td>
                    <td>
                      <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.15rem" }}>
                        <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--color-primary-dark)" }}>{avg}</span>
                        <span style={{ fontSize: "0.68rem", color: "var(--color-gray-400)" }}>
                          ({labels[0]}:{report.speaking_score} {labels[1]}:{report.grammar_score} {labels[2]}:{report.vocabulary_score} {labels[3]}:{report.active_score})
                        </span>
                      </div>
                    </td>
                    <td style={{ maxWidth: "250px" }}>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-gray-600)", lineHeight: "1.4", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {report.tutor_notes || "-"}
                      </p>
                    </td>
                    <td>
                      <Link href="/admin/certificates" style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>
                        Sertifikat &rarr;
                      </Link>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button onClick={() => onPrint(report)} className="btn-portal-outline" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
                          </svg>
                          Cetak PDF
                        </button>
                        <button onClick={() => onDelete(report.id, report.module_name, report.students?.name || "Siswa")} className="btn-portal-danger" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto" }}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
