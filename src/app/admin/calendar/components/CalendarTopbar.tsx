"use client";

import React from "react";
import { getMonthNameIndonesian } from "../hooks/useCalendarData";

interface CalendarTopbarProps {
  viewMonth: number;
  viewYear: number;
  filterProgram: string;
  onFilterChange: (program: string) => void;
  onNavigate: (dir: "prev" | "next") => void;
  onGoToday: () => void;
  onDownloadCSV: () => void;
  onAddAgenda: () => void;
  onAiScheduler: () => void;
  onSync: () => void;
  onDeleteAll: () => void;
  onPendingModal: () => void;
  onUpdateDB: () => void;
}

const PROGRAM_OPTIONS = [
  { value: "All", label: "Semua Program" },
  { value: "Kids Program Level 1", label: "Kids Program Level 1" },
  { value: "Kids Program Level 2", label: "Kids Program Level 2" },
  { value: "Kids Program Level 4", label: "Kids Program Level 4" },
  { value: "Kids Program Level 5", label: "Kids Program Level 5" },
  { value: "Teens Program", label: "Teens Program" },
  { value: "Fun Calistung A", label: "Fun Calistung A" },
  { value: "Fun Calistung B", label: "Fun Calistung B" },
  { value: "Fun Calistung C", label: "Fun Calistung C" },
];

export default function CalendarTopbar({
  viewMonth,
  viewYear,
  filterProgram,
  onFilterChange,
  onNavigate,
  onGoToday,
  onDownloadCSV,
  onAddAgenda,
  onAiScheduler,
  onSync,
  onDeleteAll,
  onPendingModal,
  onUpdateDB,
}: CalendarTopbarProps) {
  return (
    <>
      {/* Page Header */}
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Kelola Jadwal &amp; Kalender Akademik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Buat jadwal kelas rutin, liburan sekolah, serta kegiatan bimbingan belajar Ibra Global English Bobong
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn-portal-outline" onClick={onUpdateDB}
            style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
            <span>Perbarui DB (Auto Fix)</span>
          </button>
          <button type="button" className="btn-portal-outline" onClick={onAiScheduler}
            style={{ border: "1px dashed var(--color-accent)", color: "var(--color-accent-dark)" }}>
            <span> Susun via AI</span>
          </button>
          <button type="button" className="btn-portal-outline" onClick={onSync}>
            <span> Sinkronkan ke HP</span>
          </button>
          <button type="button" className="btn-portal-outline" onClick={onDeleteAll}
            style={{ borderColor: "#ef4444", color: "#ef4444" }}>
            <span>️ Hapus Semua</span>
          </button>
          <button type="button" className="btn-portal-primary" onClick={onPendingModal}
            style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}>
            <span>+ Catat Kelas Pending</span>
          </button>
          <button className="btn-portal-primary" onClick={onAddAgenda}>
            <span>+ Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* Filter & Print Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          backgroundColor: "white",
          padding: "1rem 1.5rem",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
        }}
        className="no-print"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontWeight: "700", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Pilih Level / Kelas:</span>
          <select
            value={filterProgram}
            onChange={(e) => onFilterChange(e.target.value)}
            style={{
              padding: "0.5rem 2rem 0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--color-gray-200)",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "var(--color-gray-800)",
              backgroundColor: "#f9fafb",
              cursor: "pointer",
            }}
          >
            {PROGRAM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={onDownloadCSV}
            className="btn-portal-outline"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-accent-dark, #a68849)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
            }}
          >
            <span> Unduh Excel (CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-portal-outline"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
            }}
          >
            <span>️ Cetak Jadwal ({filterProgram === "All" ? "Semua" : filterProgram})</span>
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          backgroundColor: "white",
          padding: "1rem 1.5rem",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
        }}
      >
        <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
          {getMonthNameIndonesian(viewMonth)} {viewYear}
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-portal-outline" style={{ padding: "0.45rem 1rem", borderRadius: "8px" }}
            onClick={() => onNavigate("prev")} aria-label="Tampilkan bulan sebelumnya">
            ◀ Bulan Lalu
          </button>
          <button className="btn-portal-outline" style={{ padding: "0.45rem 1rem", borderRadius: "8px" }}
            onClick={onGoToday} aria-label="Kembali ke hari ini">
            Hari Ini
          </button>
          <button className="btn-portal-outline" style={{ padding: "0.45rem 1rem", borderRadius: "8px" }}
            onClick={() => onNavigate("next")} aria-label="Tampilkan bulan berikutnya">
            Bulan Depan ▶
          </button>
        </div>
      </div>
    </>
  );
}
