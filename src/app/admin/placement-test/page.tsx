"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { usePlacementAdmin } from "./hooks/usePlacementAdmin";
import MetricCard from "@/components/MetricCard";
import AlertBanner from "@/components/AlertBanner";
import PortalTable from "@/components/PortalTable";
import AiDiagnosticsPanel from "./components/AiDiagnosticsPanel";
import CefrDonutChart from "./components/CefrDonutChart";
import FollowUpModal from "./components/FollowUpModal";

export default function AdminPlacementTest() {
  const {
    submissions, filteredSubmissions, loading, statusMsg, metrics,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter, levelFilter, setLevelFilter,
    followUpStudent, setFollowUpStudent, followUpMessage, setFollowUpMessage, followUpAiLoading,
    aiConnectionStatus, aiDiagnosticMessage, testAiConnection,
    handleUpdateStatus, handleDelete, triggerWhatsAppFollowUp, handleGenerateAiFollowUp,
  } = usePlacementAdmin();

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Hasil Tes Penempatan Publik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Kelola data calon siswa baru hasil pengujian kuis interaktif publik
          </p>
        </div>
      </div>

      <AlertBanner message={statusMsg.text} type={statusMsg.type} />

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <MetricCard title="Total Pendaftar Kuis" value={metrics.total} description="Semua hasil pengerjaan kuis" color="primary" />
        <MetricCard title="Belum Dihubungi (Pending)" value={metrics.pending} description="Butuh tindak lanjut segera" color="yellow" />
        <MetricCard title="Sudah Dihubungi" value={metrics.contacted} description="Tahap penawaran / konsultasi" color="accent" />
        <MetricCard title="Terdaftar (Enrolled)" value={metrics.enrolled} description="Sukses menjadi siswa Ibra" color="green" />
      </div>

      {/* Diagnostics + Donut Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }} className="report-detail-layout">
        <AiDiagnosticsPanel
          aiConnectionStatus={aiConnectionStatus}
          aiDiagnosticMessage={aiDiagnosticMessage}
          onTest={testAiConnection}
        />
        <div className="portal-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-gray-900)", alignSelf: "flex-start", width: "100%", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            Distribusi Level CEFR Siswa
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", alignSelf: "flex-start", width: "100%" }}>
            Sebaran tingkat penguasaan bahasa Inggris pendaftar tes penempatan.
          </p>
          <CefrDonutChart submissions={submissions} />
        </div>
      </div>

      {/* Filter bar */}
      <div className="portal-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 300px" }}>
            <input type="text" placeholder="Cari berdasarkan nama, email, atau nomor WhatsApp..." className="form-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ minWidth: "150px" }}>
            <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Semua Status</option>
              <option value="pending">Belum Dihubungi</option>
              <option value="contacted">Sudah Dihubungi</option>
              <option value="enrolled">Terdaftar (Enrolled)</option>
            </select>
          </div>
          <div style={{ minWidth: "150px" }}>
            <select className="form-input" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="all">Semua Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat hasil tes penempatan...</p>
        </div>
      ) : (
        <PortalTable
          headers={["No", "Calon Siswa", "WhatsApp", "Skor Kuis", "Rekomendasi Level", "Tanggal Tes", "Status Tindak Lanjut", { label: "Aksi Follow-Up", style: { textAlign: "right" } }]}
          rows={filteredSubmissions}
          emptyMessage="Tidak ada data pendaftar kuis yang sesuai dengan kriteria filter."
          renderRow={(sub: any, idx: number) => (
            <tr key={sub.id}>
              <td style={{ fontWeight: "700" }}>{idx + 1}</td>
              <td>
                <strong style={{ color: "var(--color-gray-900)" }}>{sub.full_name}</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-gray-500)" }}>{sub.email}</p>
              </td>
              <td style={{ fontWeight: "600" }}>{sub.whatsapp_number}</td>
              <td style={{ fontWeight: "800", color: "var(--color-primary-dark)", fontSize: "1.1rem" }}>
                {sub.score} <span style={{ fontSize: "0.8rem", color: "var(--color-gray-400)" }}>/ 20</span>
              </td>
              <td>
                <span className="user-badge" style={{
                  backgroundColor: ["Advanced", "C1"].includes(sub.level) ? "var(--color-green-light)" : ["Intermediate", "B1", "B2"].includes(sub.level) ? "var(--color-primary-light)" : "var(--color-accent-light)",
                  color: ["Advanced", "C1"].includes(sub.level) ? "var(--color-green-dark)" : ["Intermediate", "B1", "B2"].includes(sub.level) ? "var(--color-primary-dark)" : "var(--color-accent)",
                  fontWeight: "800", fontSize: "0.8rem", padding: "0.3rem 0.75rem",
                }}>
                  {sub.level}
                </span>
              </td>
              <td style={{ fontSize: "0.85rem" }}>
                {new Date(sub.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td>
                <select className="form-input" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", height: "auto", fontWeight: "600", width: "150px" }} value={sub.status} onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="enrolled">Enrolled</option>
                </select>
              </td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button className="btn-portal-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "inline-flex", gap: "0.25rem", alignItems: "center" }} onClick={() => triggerWhatsAppFollowUp(sub)} title="Kirim pesan penawaran otomatis via WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span>Hubungi</span>
                  </button>
                  <button className="btn-portal-danger" style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }} onClick={() => handleDelete(sub.id, sub.full_name)}>Hapus</button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {/* Follow-Up Modal */}
      {followUpStudent && (
        <FollowUpModal
          student={followUpStudent}
          message={followUpMessage}
          aiLoading={followUpAiLoading}
          onClose={() => setFollowUpStudent(null)}
          onMessageChange={setFollowUpMessage}
          onGenerateAi={handleGenerateAiFollowUp}
        />
      )}
    </div>
  );
}
