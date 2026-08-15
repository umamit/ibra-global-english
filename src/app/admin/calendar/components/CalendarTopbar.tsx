"use client";

import React from "react";
import { getMonthNameIndonesian } from "../hooks/useCalendarData";

interface CalendarTopbarProps {
  viewMonth: number;
  viewYear: number;
  filterProgram: string;
  viewMode: "split" | "month";
  onViewModeChange: (mode: "split" | "month") => void;
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
  { value: "Kids Program Level 2", label: "Kids Program Level 2" },
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
  viewMode,
  onViewModeChange,
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
            <span>Perbarui DB</span>
          </button>
          <button type="button" className="btn-portal-outline" onClick={onAiScheduler}
            style={{ border: "1px dashed var(--color-accent)", color: "#8c6f32" }}>
            <span>Susun via AI</span>
          </button>
          <button type="button" className="btn-portal-outline" onClick={onSync}>
            <span>Sinkronkan HP</span>
          </button>
          <button type="button" className="btn-portal-outline" onClick={onDeleteAll}
            style={{ borderColor: "#ef4444", color: "#ef4444" }}>
            <span>Hapus Semua</span>
          </button>
          <button type="button" className="btn-portal-primary" onClick={onPendingModal}
            style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}>
            <span>+ Kelas Pending</span>
          </button>
          <button className="btn-portal-primary" onClick={onAddAgenda}>
            <span>+ Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* Filter, View Mode & Action Bar */}
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
          flexWrap: "wrap",
          gap: "1rem",
        }}
        className="no-print"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* View Mode Toggle Buttons */}
          <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "3px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <button
              type="button"
              onClick={() => onViewModeChange("split")}
              style={{
                padding: "0.4rem 0.85rem", fontSize: "0.82rem", fontWeight: "800", borderRadius: "8px", border: "none", cursor: "pointer",
                backgroundColor: viewMode === "split" ? "var(--color-primary, #216c7e)" : "transparent",
                color: viewMode === "split" ? "#ffffff" : "#64748b",
                transition: "all 0.2s ease",
              }}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("month")}
              style={{
                padding: "0.4rem 0.85rem", fontSize: "0.82rem", fontWeight: "800", borderRadius: "8px", border: "none", cursor: "pointer",
                backgroundColor: viewMode === "month" ? "var(--color-primary, #216c7e)" : "transparent",
                color: viewMode === "month" ? "#ffffff" : "#64748b",
                transition: "all 0.2s ease",
              }}
            >
              Grid Month
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontWeight: "700", color: "var(--color-gray-700)", fontSize: "0.85rem" }}>Filter:</span>
            <select
              value={filterProgram}
              onChange={(e) => onFilterChange(e.target.value)}
              style={{
                padding: "0.4rem 1.5rem 0.4rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--color-gray-200)",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--color-gray-800)",
                backgroundColor: "#f8fafc",
                cursor: "pointer",
              }}
            >
              {PROGRAM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={onDownloadCSV}
            className="btn-portal-outline"
            style={{
              borderColor: "var(--color-accent)",
              color: "#8c6f32",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 0.85rem",
              fontSize: "0.82rem",
            }}
          >
            <span>CSV (Excel)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-portal-outline"
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}
          >
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>
    </>
  );
}
