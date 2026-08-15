"use client";

import React from "react";
import { StudentItem } from "../hooks/useStudentData";

interface StudentTableProps {
  students: StudentItem[];
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  onEdit: (student: StudentItem) => void;
  onDelete: (id: string, name: string) => void;
  onUpdateProgram?: (id: string, newProgram: string) => void;
}

const CEFR_LEVEL_OPTIONS = [
  { group: "A1 Foundation (Target CEFR: A1)", options: ["A1 Foundation 1", "A1 Foundation 2", "A1 Foundation 3", "A1 Foundation 4", "A1 Foundation 5"] },
  { group: "A2 Bridge (Target CEFR: A2)", options: ["A2 Bridge 1", "A2 Bridge 2", "A2 Bridge 3", "A2 Bridge 4", "A2 Bridge 5"] },
  { group: "B1 Communicator (Target CEFR: B1)", options: ["B1 Communicator 1", "B1 Communicator 2", "B1 Communicator 3", "B1 Communicator 4", "B1 Communicator 5"] },
  { group: "B2 Achiever (Target CEFR: B2)", options: ["B2 Achiever 1", "B2 Achiever 2", "B2 Achiever 3", "B2 Achiever 4", "B2 Achiever 5"] },
  { group: "C1 Professional (Target CEFR: C1)", options: ["C1 Professional 1", "C1 Professional 2", "C1 Professional 3", "C1 Professional 4", "C1 Professional 5"] },
  { group: "Fun Calistung (Usia Dini)", options: ["Fun Calistung A", "Fun Calistung B", "Fun Calistung C"] },
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
  statusFilter,
  onStatusFilterChange,
  onEdit,
  onDelete,
  onUpdateProgram,
}: StudentTableProps) {
  const getCount = (filterId: string) =>
    filterId === "semua" ? students.length : students.filter((s) => (s.status || "aktif") === filterId).length;

  const filteredStudents =
    statusFilter === "semua" ? students : students.filter((s) => (s.status || "aktif") === statusFilter);

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
            <th>Status</th>
            <th>Orang Tua Terhubung</th>
            <th style={{ textAlign: "right" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                Tidak ada siswa ditemukan untuk filter ini.
              </td>
            </tr>
          ) : (
            filteredStudents.map((student, idx) => {
              const st = student.status || "aktif";
              const stInfo = STATUS_BADGE_MAP[st] || STATUS_BADGE_MAP.aktif;

              return (
                <tr key={student.id}>
                  <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                  <td style={{ fontWeight: "700", color: "var(--color-gray-900)" }}>{student.name}</td>
                  <td>{student.age} Tahun</td>
                  <td>
                    <select
                      value={student.program || "A1 Foundation 1"}
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
                    <div style={{ display: "inline-flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button className="btn-portal-outline" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }} onClick={() => onEdit(student)}>
                        Edit
                      </button>
                      <button className="btn-portal-danger" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }} onClick={() => onDelete(student.id, student.name)}>
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
