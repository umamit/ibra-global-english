"use client";

import React from "react";
import { LogItem } from "../hooks/useWhatsAppDashboard";

const TYPE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  approval: { label: "Persetujuan", color: "#166534", bg: "#dcfce7" },
  rejection: { label: "Penolakan", color: "#991b1b", bg: "#fee2e2" },
  manual: { label: "Manual", color: "#1e40af", bg: "#dbeafe" },
  absence: { label: "Absensi", color: "#92400e", bg: "#fef3c7" },
  certificate: { label: "Sertifikat", color: "#6b21a8", bg: "#f3e8ff" },
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  SENT: { label: " Terkirim", color: "#166534", bg: "#dcfce7" },
  SIMULATED: { label: "◎ Simulasi", color: "#92400e", bg: "#fef3c7" },
  FAILED: { label: " Gagal", color: "#991b1b", bg: "#fee2e2" },
  UNKNOWN: { label: "? Tidak diketahui", color: "#6b7280", bg: "#f3f4f6" },
};

interface WaLogTableProps {
  logs: LogItem[];
  logsLoading: boolean;
  onRefresh: () => void;
}

export default function WaLogTable({ logs, logsLoading, onRefresh }: WaLogTableProps) {
  return (
    <div className="portal-card" style={{ padding: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h3 style={{ fontWeight: "800", fontSize: "1rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Riwayat Log Pengiriman
        </h3>
        <button onClick={onRefresh} className="btn-portal-outline" style={{ height: "auto", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Refresh Log</button>
      </div>

      {logsLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[...Array(4)].map((_, i) => (<div key={i} className="skeleton-pulse" style={{ height: "52px", borderRadius: "8px" }} />))}
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-400)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem", display: "block", opacity: 0.4 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p style={{ fontSize: "0.9rem" }}>Belum ada riwayat pengiriman pesan.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="portal-table" style={{ fontSize: "0.83rem" }}>
            <thead>
              <tr><th>Waktu</th><th>Tipe</th><th>Nomor Tujuan</th><th>Status</th><th>Pesan</th></tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((log, idx) => {
                const tStyle = TYPE_LABEL[log.type] || { label: log.type || "-", color: "#6b7280", bg: "#f3f4f6" };
                const sStyle = STATUS_STYLE[log.status] || STATUS_STYLE.UNKNOWN;
                const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
                return (
                  <tr key={idx}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--color-gray-500)", fontSize: "0.78rem" }}>{dateStr}</td>
                    <td><span style={{ backgroundColor: tStyle.bg, color: tStyle.color, padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{tStyle.label}</span></td>
                    <td style={{ fontFamily: "monospace", fontWeight: "600" }}>
                      {log.phone ? <a href={`https://wa.me/${log.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "none" }}>{log.phone}</a> : "-"}
                    </td>
                    <td><span style={{ backgroundColor: sStyle.bg, color: sStyle.color, padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{sStyle.label}</span></td>
                    <td style={{ maxWidth: "300px" }}><span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--color-gray-600)", lineHeight: 1.4 }}>{log.message || log.raw || "-"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {logs.length > 50 && <p style={{ textAlign: "center", padding: "0.75rem 0", fontSize: "0.8rem", color: "var(--color-gray-400)" }}>Menampilkan 50 pesan terbaru dari total {logs.length} log.</p>}
        </div>
      )}
    </div>
  );
}
