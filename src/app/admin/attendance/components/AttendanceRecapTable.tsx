"use client";

import React from "react";
import * as XLSX from "xlsx";
import { RecapRow } from "../hooks/useAttendanceData";

interface AttendanceRecapTableProps {
  filteredRecap: RecapRow[];
  recapLoading: boolean;
  searchTerm: string;
  programFilter: string;
  selectedMonth: string;
  onSearchChange: (v: string) => void;
  onProgramFilterChange: (v: string) => void;
  onExportCSV: () => void;
}

function getAttendanceRateBadge(rate: number): React.ReactElement {
  let bgColor = "var(--color-green-light)";
  let textColor = "var(--color-green)";
  let border = "1px solid rgba(34, 197, 94, 0.2)";

  if (rate < 75) {
    bgColor = "#ffeeeb"; textColor = "#ef4444"; border = "1px solid rgba(239, 68, 68, 0.2)";
  } else if (rate < 90) {
    bgColor = "#fef9c3"; textColor = "#a16207"; border = "1px solid rgba(161, 98, 7, 0.2)";
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "0.8rem", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", backgroundColor: bgColor, color: textColor, border }}>
      {rate}%
    </span>
  );
}

export default function AttendanceRecapTable({ filteredRecap, recapLoading, searchTerm, programFilter, selectedMonth, onSearchChange, onProgramFilterChange, onExportCSV }: AttendanceRecapTableProps) {
  const handleExportExcel = () => {
    if (!filteredRecap || filteredRecap.length === 0) return;
    const dataToExport = filteredRecap.map((r, idx) => {
      const rate = r.total > 0 ? Math.round((r.hadir / r.total) * 100) : 100;
      return {
        No: idx + 1,
        "Nama Siswa": r.name,
        Program: r.program,
        "Hadir (H)": r.hadir,
        "Izin (I)": r.izin,
        "Sakit (S)": r.sakit,
        "Alpa (A)": r.alfa,
        "Persentase Kehadiran": `${rate}%`,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Presensi");
    XLSX.writeFile(workbook, `Rekap_Presensi_Ibra_${selectedMonth || "Bulan"}.xlsx`);
  };

  return (
    <div>
      {/* Search & Filter */}
      <div className="no-print" style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ padding: "0.55rem 1rem", fontSize: "0.9rem" }}
          />
        </div>
        <div style={{ width: "200px" }}>
          <select
            className="form-input"
            value={programFilter}
            onChange={(e) => onProgramFilterChange(e.target.value)}
            style={{ padding: "0.55rem 1rem", fontSize: "0.9rem" }}
          >
            <option value="">Semua Program</option>
            <option value="A1 Foundation">A1 Foundation</option>
            <option value="A2 Bridge">A2 Bridge</option>
            <option value="B1 Communicator">B1 Communicator</option>
            <option value="B2 Achiever">B2 Achiever</option>
            <option value="C1 Professional">C1 Professional</option>
            <option value="Kids Program">Kids Program</option>
            <option value="Teens Program">Teens Program</option>
            <option value="Fun Calistung">Fun Calistung</option>
          </select>
        </div>
        {filteredRecap.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem" }} className="no-print">
            <button className="btn-portal-outline" onClick={handleExportExcel} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem", backgroundColor: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span>Export Excel</span>
            </button>
            <button className="btn-portal-outline" onClick={onExportCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Export CSV</span>
            </button>
            <button className="btn-portal" onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Cetak PDF</span>
            </button>
          </div>
        )}
      </div>

      {recapLoading ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p>Memuat rekapitulasi absensi...</p>
        </div>
      ) : (
        <div className="table-wrapper attendance-print-wrapper">
          {/* Print header */}
          <div className="print-only-header" style={{ display: "none", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "3px double #000000", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "50px", height: "54px" }} width={50} height={54} />
                <div style={{ textAlign: "left" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: "900", margin: "0", color: "#000000" }}>IBRA GLOBAL ENGLISH</h2>
                  <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "#A68849", margin: "0", letterSpacing: "1px" }}>BELAJAR SERU, LANCAR BICARA</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "800", margin: "0", color: "#000000" }}>LAPORAN REKAPITULASI KEHADIRAN SISWA</h3>
                <p style={{ fontSize: "0.8rem", color: "#555555", margin: "2px 0 0" }}>Periode Bulan: {selectedMonth}</p>
              </div>
            </div>
          </div>

          <table className="portal-table attendance-recap-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Program Kursus</th>
                <th style={{ textAlign: "center" }}>Hadir</th>
                <th style={{ textAlign: "center" }}>Sakit</th>
                <th style={{ textAlign: "center" }}>Izin</th>
                <th style={{ textAlign: "center" }}>Alfa</th>
                <th style={{ textAlign: "center" }}>Tidak ada Kelas</th>
                <th style={{ textAlign: "center" }}>Total Sesi</th>
                <th style={{ textAlign: "center", width: "150px" }}>Persentase Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecap.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                    Tidak ada data rekapitulasi absensi siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRecap.map((row, idx) => {
                  const activeTotal = row.hadir + row.sakit + row.izin + row.alfa;
                  const rate = activeTotal > 0 ? Math.round((row.hadir / activeTotal) * 100) : 100;
                  return (
                    <tr key={row.id}>
                      <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                      <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>{row.name}</td>
                      <td><span className="user-badge" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>{row.program}</span></td>
                      <td style={{ textAlign: "center", fontWeight: "700", color: "var(--color-green)" }}>{row.hadir}</td>
                      <td style={{ textAlign: "center", fontWeight: "700", color: "#a16207" }}>{row.sakit}</td>
                      <td style={{ textAlign: "center", fontWeight: "700", color: "var(--color-primary)" }}>{row.izin}</td>
                      <td style={{ textAlign: "center", fontWeight: "700", color: "#ef4444" }}>{row.alfa}</td>
                      <td style={{ textAlign: "center", fontWeight: "700", color: "var(--color-gray-500)" }}>{row.tidak_ada_kelas || 0}</td>
                      <td style={{ textAlign: "center", fontWeight: "700", color: "var(--color-gray-700)" }}>{row.total}</td>
                      <td style={{ textAlign: "center" }}>{getAttendanceRateBadge(rate)}</td>
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
