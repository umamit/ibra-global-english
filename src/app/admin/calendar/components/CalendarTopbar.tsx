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
  { value: "All", label: "Semua Program & Level" },
  { value: "Foundation", label: "A1 Foundation" },
  { value: "Bridge", label: "A2 Bridge" },
  { value: "Communicator", label: "B1 Communicator" },
  { value: "Achiever", label: "B2 Achiever" },
  { value: "Professional", label: "C1 Professional" },
  { value: "Kids", label: "Kids Program" },
  { value: "Teens", label: "Teens Program" },
  { value: "Calistung", label: "Fun Calistung" },
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
            Tampilan visual agenda bimbingan belajar (Pengelolaan Jadwal Rutin, Reschedule &amp; Pending berpusat di menu <strong>Kelola Siswa</strong>)
          </p>
        </div>
        <div className="topbar-user" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn-portal-outline" onClick={onDownloadCSV} style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}>
            Ekspor CSV
          </button>
          <button className="btn-portal-outline" onClick={onSync} style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}>
            Sinkron iCal
          </button>
          <button className="btn-portal-danger" onClick={onDeleteAll} style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}>
            Kosongkan Jadwal
          </button>
          <a href="/admin/students" className="btn-portal-primary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            Kelola Jadwal di Kelola Siswa
          </a>
        </div>
      </div>

      {/* Control Bar: View Switcher, Date Navigation, & Program Filter */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
        backgroundColor: "#ffffff", padding: "0.85rem 1.25rem", borderRadius: "16px",
        border: "1px solid rgba(0, 0, 0, 0.06)", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        marginBottom: "1.25rem",
      }}>
        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              type="button"
              onClick={() => onNavigate("prev")}
              className="btn-portal-outline"
              style={{ padding: "0.35rem 0.65rem", fontSize: "0.85rem" }}
              title="Bulan Sebelumnya"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => onNavigate("next")}
              className="btn-portal-outline"
              style={{ padding: "0.35rem 0.65rem", fontSize: "0.85rem" }}
              title="Bulan Berikutnya"
            >
              &rarr;
            </button>
          </div>
          <button
            type="button"
            onClick={onGoToday}
            className="btn-portal-outline"
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: "700" }}
          >
            Hari Ini
          </button>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
            {getMonthNameIndonesian(viewMonth)} {viewYear}
          </h2>
        </div>

        {/* View Mode & Filter Options */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* View Mode Toggle */}
          <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "0.25rem", borderRadius: "10px" }}>
            <button
              type="button"
              onClick={() => onViewModeChange("split")}
              style={{
                padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: "800", borderRadius: "8px", border: "none",
                backgroundColor: viewMode === "split" ? "#ffffff" : "transparent",
                color: viewMode === "split" ? "#216c7e" : "#64748b",
                boxShadow: viewMode === "split" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("month")}
              style={{
                padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: "800", borderRadius: "8px", border: "none",
                backgroundColor: viewMode === "month" ? "#ffffff" : "transparent",
                color: viewMode === "month" ? "#216c7e" : "#64748b",
                boxShadow: viewMode === "month" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              Bulan Penuh
            </button>
          </div>

          {/* Program / Level Filter Select */}
          <select
            value={filterProgram}
            onChange={(e) => onFilterChange(e.target.value)}
            style={{
              padding: "0.4rem 0.85rem", borderRadius: "10px", border: "1px solid rgba(33, 108, 126, 0.3)",
              fontSize: "0.82rem", fontWeight: "700", color: "#164d57", backgroundColor: "#eef6f8",
              cursor: "pointer",
            }}
          >
            {PROGRAM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
