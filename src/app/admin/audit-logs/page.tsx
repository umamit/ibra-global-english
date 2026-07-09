"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import "../../dashboard-components.css";

interface AuditLog {
  id: string;
  user_id: string | null;
  actor_name: string;
  action: string;
  details: string;
  created_at: string;
}

export default function AuditLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/audit-logs");
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Gagal mengambil log aktivitas.");
      }
      
      setLogs(result.data || []);
    } catch (err: any) {
      console.error("Error loading logs:", err);
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat memuat log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs based on search term and action filter
  const filteredLogs = logs.filter((log) => {
    const matchActor = log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchAction = actionFilter ? log.action === actionFilter : true;
    return matchActor && matchAction;
  });

  // Extract unique action types for filter options
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <div className="dashboard-content-wrapper" style={{ padding: "2rem" }}>
      {/* Page Header */}
      <div className="dashboard-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>📜 Log Aktivitas Sistem</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Riwayat log audit tindakan administrator dan aktivitas tutor di platform.
          </p>
        </div>
        <button
          className="btn-portal-outline"
          onClick={fetchLogs}
          disabled={loading}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          <svg
            className={loading ? "spin" : ""}
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div className="error-banner" style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "10px", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2" }}>
          {errorMsg}
        </div>
      )}

      {/* Filter Panel */}
      <div className="portal-card" style={{ padding: "1.5rem", marginBottom: "2rem", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-700)", display: "block", marginBottom: "0.5rem" }}>Cari Aktor / Detail</label>
            <input
              type="text"
              placeholder="Cari nama admin, tutor, atau kata kunci..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 1rem", fontSize: "0.9rem" }}
            />
          </div>
          <div style={{ width: "220px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-700)", display: "block", marginBottom: "0.5rem" }}>Tindakan</label>
            <select
              className="form-input"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 1rem", fontSize: "0.9rem" }}
            >
              <option value="">Semua Tindakan</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="portal-card" style={{ padding: "0", overflow: "hidden", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
            <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <p>Memuat log aktivitas sistem...</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ margin: "0" }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>No</th>
                  <th style={{ width: "180px" }}>Waktu Kejadian</th>
                  <th style={{ width: "200px" }}>Aktor / Pengguna</th>
                  <th style={{ width: "180px" }}>Nama Tindakan</th>
                  <th>Rincian Rincian Aktivitas</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)", fontWeight: "600" }}>
                      Belum ada log aktivitas yang tercatat atau tidak ada yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr key={log.id} style={{ transition: "background-color 0.2s ease" }}>
                      <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                      <td style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", whiteSpace: "nowrap" }}>
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td>
                        <strong style={{ color: "var(--color-gray-900)" }}>{log.actor_name}</strong>
                      </td>
                      <td>
                        <span className="user-badge" style={{
                          backgroundColor: log.action.includes("Hapus") || log.action.includes("Tolak") ? "rgba(239, 68, 68, 0.08)" : "rgba(33, 108, 126, 0.06)",
                          color: log.action.includes("Hapus") || log.action.includes("Tolak") ? "#ef4444" : "var(--color-primary-dark)",
                          fontWeight: "800",
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem"
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.9rem", color: "var(--color-gray-700)", lineHeight: "1.4", wordBreak: "break-all" }}>
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          display: inline-block;
        }
      `}} />
    </div>
  );
}
