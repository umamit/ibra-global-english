"use client";

import React from "react";
import { Registration } from "../hooks/useStudentData";

interface RegistrationTableProps {
  registrations: Registration[];
  regLoading: boolean;
  errorMsg: string;
  waSendingId: string | null;
  waFeedback: { id: string | null; success: boolean | null; msg: string };
  onApprove: (reg: Registration) => void;
  onOpenReject: (id: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  approved: { bg: "var(--color-green-light)", text: "var(--color-green)", label: " Disetujui" },
  rejected: { bg: "rgba(239,68,68,0.1)", text: "var(--color-red)", label: " Ditolak" },
  pending: { bg: "rgba(234,179,8,0.1)", text: "#b45309", label: " Menunggu" },
};

export default function RegistrationTable({ registrations, regLoading, errorMsg, waSendingId, waFeedback, onApprove, onOpenReject }: RegistrationTableProps) {
  const pendingRegs = registrations.filter((r) => r.status !== "approved");

  return (
    <div>
      {errorMsg && (
        <div style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--color-red)", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontWeight: "600" }}>
          {errorMsg}
        </div>
      )}
      {regLoading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "28px", height: "28px" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table registration-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Usia</th>
                <th>Program</th>
                <th>Orang Tua</th>
                <th>WhatsApp</th>
                <th>Waktu Daftar</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                    Tidak ada pendaftaran yang perlu ditindaklanjuti.
                  </td>
                </tr>
              ) : (
                pendingRegs.map((reg, idx) => {
                  const statusColor = STATUS_COLORS[reg.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={reg.id}>
                      <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                      <td style={{ fontWeight: "600" }}>{reg.student_name}</td>
                      <td>{reg.student_age ? `${reg.student_age} thn` : "-"}</td>
                      <td>
                        <span className="user-badge" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.2rem 0.55rem", fontWeight: "700", fontSize: "0.78rem" }}>
                          {reg.program?.split(" ")[0]}
                        </span>
                      </td>
                      <td>
                        <div>{reg.parent_name || <span style={{ color: "var(--color-gray-400)", fontStyle: "italic" }}>-</span>}</div>
                        {reg.parent_email && <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginTop: "0.1rem" }}>{reg.parent_email}</div>}
                      </td>
                      <td>
                        <a href={`https://wa.me/${reg.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontWeight: "600", textDecoration: "none" }}>
                          {reg.whatsapp}
                        </a>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                        {new Date(reg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <span style={{ backgroundColor: statusColor.bg, color: statusColor.text, padding: "0.2rem 0.6rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.78rem" }}>
                          {statusColor.label}
                        </span>
                        {reg.status === "rejected" && reg.notes && (
                          <p style={{ fontSize: "0.72rem", color: "var(--color-gray-400)", marginTop: "0.2rem", fontStyle: "italic" }}>{reg.notes}</p>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {reg.status === "pending" && (
                          <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-end" }}>
                            <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                              <button
                                className="btn-portal-primary"
                                style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto" }}
                                onClick={() => onApprove(reg)}
                                disabled={waSendingId === reg.id}
                              >
                                {waSendingId === reg.id ? " Mengirim WA..." : "Setujui"}
                              </button>
                              <button
                                className="btn-portal-danger"
                                style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", height: "auto" }}
                                onClick={() => onOpenReject(reg.id)}
                                disabled={waSendingId === reg.id}
                              >
                                Tolak
                              </button>
                            </div>
                            {waFeedback.id === reg.id && waFeedback.msg && (
                              <span style={{
                                fontSize: "0.72rem",
                                color: waFeedback.success === true ? "var(--color-green)" : waFeedback.success === false ? "var(--color-red)" : "#b45309",
                                fontWeight: "600",
                                maxWidth: "200px",
                                textAlign: "right",
                              }}>
                                {waFeedback.msg}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
