"use client";

import React from "react";
import { StudentItem } from "../hooks/useStudentData";

interface StudentTableProps {
  students: StudentItem[];
  scheduleCounts?: Record<string, number>;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  onEdit: (student: StudentItem) => void;
  onDelete: (id: string, name: string) => void;
  onUpdateProgram?: (id: string, newProgram: string) => void;
  onScheduleStudent?: (student: StudentItem) => void;
}

const CEFR_LEVEL_OPTIONS = [
  { group: "A1 Foundation (Target CEFR: A1)", options: ["A1 Foundation 1", "A1 Foundation 2", "A1 Foundation 3", "A1 Foundation 4", "A1 Foundation 5"] },
  { group: "A2 Bridge (Target CEFR: A2)", options: ["A2 Bridge 1", "A2 Bridge 2", "A2 Bridge 3", "A2 Bridge 4", "A2 Bridge 5"] },
  { group: "B1 Communicator (Target CEFR: B1)", options: ["B1 Communicator 1", "B1 Communicator 2", "B1 Communicator 3", "B1 Communicator 4", "B1 Communicator 5"] },
  { group: "B2 Achiever (Target CEFR: B2)", options: ["B2 Achiever 1", "B2 Achiever 2", "B2 Achiever 3", "B2 Achiever 4", "B2 Achiever 5"] },
  { group: "C1 Professional (Target CEFR: C1)", options: ["C1 Professional 1", "C1 Professional 2", "C1 Professional 3", "C1 Professional 4", "C1 Professional 5"] },
  { group: "Usia Dini", options: ["Fun Calistung"] },
];

const STATUS_BADGE_MAP: Record<string, { label: string; bg: string; color: string }> = {
  aktif: { label: "Aktif", bg: "#d1fae5", color: "#065f46" },
  cuti: { label: "Cuti", bg: "#fef3c7", color: "#92400e" },
  alumnus: { label: "Alumnus", bg: "#dbeafe", color: "#1e40af" },
  non_aktif: { label: "Non-Aktif", bg: "#f1f5f9", color: "#475569" },
};

const STATUS_FILTERS = [
  { id: "semua", label: "Semua" },
  { id: "aktif", label: "Aktif" },
  { id: "cuti", label: "Cuti" },
  { id: "alumnus", label: "Alumnus" },
  { id: "non_aktif", label: "Non-Aktif" },
];

export default function StudentTable({
  students,
  scheduleCounts = {},
  statusFilter,
  onStatusFilterChange,
  onEdit,
  onDelete,
  onUpdateProgram,
  onScheduleStudent,
}: StudentTableProps) {
  const getCount = (filterId: string) =>
    filterId === "semua" ? students.length : students.filter((s) => (s.status || "aktif") === filterId).length;

  const filteredStudents =
    statusFilter === "semua" ? students : students.filter((s) => (s.status || "aktif") === statusFilter);

  const handlePrintIdCard = (student: StudentItem) => {
    if (typeof window === "undefined") return;
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(student.id)}`;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu ID Siswa - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f1f5f9; }
            .card { width: 320px; background: linear-gradient(135deg, #164d57 0%, #216c7e 100%); border-radius: 20px; color: #fff; padding: 20px; box-sizing: border-box; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
            .logo { height: 38px; margin-bottom: 6px; }
            .title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #A68849; margin-bottom: 14px; }
            .qr-box { background: #fff; padding: 10px; border-radius: 16px; display: inline-block; margin-bottom: 14px; }
            .qr-box img { width: 160px; height: 160px; display: block; }
            .name { font-size: 17px; font-weight: 800; margin-bottom: 4px; color: #ffffff; }
            .program { font-size: 12px; color: #e2e8f0; margin-bottom: 10px; }
            .footer { font-size: 10px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="https://ibraglobalenglish.uk/assets/logo.png" class="logo" alt="Logo" />
            <div class="title">KARTU ABSENSI RESMI SISWA</div>
            <div class="qr-box"><img src="${qrUrl}" alt="QR Code" /></div>
            <div class="name">${student.name}</div>
            <div class="program">${student.program || "Kids Program"}</div>
            <div class="footer">LKP Ibra Global English Bobong</div>
          </div>
          <script>setTimeout(() => { window.print(); }, 600);</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="table-wrapper">
      {/* Status Filter Bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-gray-700)", marginRight: "0.25rem" }}>
          Filter Status:
        </span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onStatusFilterChange(f.id)}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: statusFilter === f.id ? 800 : 600,
              borderRadius: "20px",
              border: "1px solid",
              borderColor: statusFilter === f.id ? "var(--color-primary)" : "var(--color-gray-300)",
              backgroundColor: statusFilter === f.id ? "var(--color-primary-light)" : "var(--color-surface)",
              color: statusFilter === f.id ? "var(--color-primary-dark)" : "var(--color-gray-700)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {f.label} ({getCount(f.id)})
          </button>
        ))}
      </div>

      <table className="portal-table student-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Siswa</th>
            <th>Usia</th>
            <th>Level &amp; Target CEFR</th>
            <th>Status Jadwal</th>
            <th>Status Siswa</th>
            <th>Orang Tua Terhubung</th>
            <th style={{ textAlign: "right" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                Tidak ada siswa ditemukan untuk filter ini.
              </td>
            </tr>
          ) : (
            filteredStudents.map((student, idx) => {
              const st = student.status || "aktif";
              const stInfo = STATUS_BADGE_MAP[st] || STATUS_BADGE_MAP.aktif;
              const schedCount = scheduleCounts[student.id] || 0;
              const isInactive = st !== "aktif";

              return (
                <tr key={student.id} style={{ opacity: isInactive ? 0.55 : 1, backgroundColor: isInactive ? "var(--color-gray-50)" : "transparent" }}>
                  <td style={{ fontWeight: "700", color: isInactive ? "var(--color-gray-400)" : undefined }}>{idx + 1}</td>
                  <td style={{ fontWeight: "700", color: isInactive ? "var(--color-gray-400)" : "var(--color-gray-900)" }}>{student.name}</td>
                  <td style={{ color: isInactive ? "var(--color-gray-400)" : undefined }}>{student.age} Tahun</td>
                  <td>
                    <select
                      value={student.program || "Fun Calistung"}
                      onChange={(e) => onUpdateProgram && onUpdateProgram(student.id, e.target.value)}
                      style={{
                        padding: "0.35rem 0.75rem",
                        borderRadius: "10px",
                        border: "1px solid rgba(33, 108, 126, 0.3)",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        color: "var(--color-primary-dark, #164d57)",
                        backgroundColor: "var(--color-bg-teal-50, #eef6f8)",
                        cursor: "pointer",
                      }}
                    >
                      {CEFR_LEVEL_OPTIONS.map((grp) => (
                        <optgroup key={grp.group} label={grp.group}>
                          {grp.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td>
                    {schedCount > 0 ? (
                      <span style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "0.25rem 0.6rem", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Terjadwal ({schedCount} Sesi)</span>
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem", fontStyle: "italic" }}>
                        Belum Ada Jadwal
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ backgroundColor: stInfo.bg, color: stInfo.color, padding: "0.25rem 0.65rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800" }}>
                      {stInfo.label}
                    </span>
                  </td>
                  <td>
                    {student.profiles ? (
                      <span style={{ color: "var(--color-green)", fontWeight: "700" }}>
                        {student.profiles.full_name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-gray-500)", fontStyle: "italic" }}>Belum dipasangkan</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.4rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn-portal-outline"
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem", borderColor: "#216c7e", color: "#216c7e", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        onClick={() => handlePrintIdCard(student)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                        <span>Cetak QR</span>
                      </button>
                      <button
                        type="button"
                        className="btn-portal-outline"
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem", borderColor: "#A68849", color: "#8c6f32" }}
                        onClick={() => onScheduleStudent && onScheduleStudent(student)}
                      >
                        + Jadwal
                      </button>
                      <button className="btn-portal-outline" style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }} onClick={() => onEdit(student)}>
                        Edit
                      </button>
                      <button className="btn-portal-danger" style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }} onClick={() => onDelete(student.id, student.name)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
