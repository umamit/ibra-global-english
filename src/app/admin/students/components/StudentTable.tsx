"use client";

import React from "react";
import { StudentItem } from "../hooks/useStudentData";

interface StudentTableProps {
  students: StudentItem[];
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  onEdit: (student: StudentItem) => void;
  onDelete: (id: string, name: string) => void;
}

const STATUS_BADGE_MAP: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  aktif: {
    label: "Aktif", bg: "#d1fae5", color: "#065f46",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
  cuti: {
    label: "Cuti", bg: "#fef3c7", color: "#92400e",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  alumnus: {
    label: "Alumnus", bg: "#dbeafe", color: "#1e40af",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  },
  non_aktif: {
    label: "Non-Aktif", bg: "#f1f5f9", color: "#475569",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  },
};

const STATUS_FILTERS = [
  { id: "semua", label: "Semua" },
  { id: "aktif", label: "Aktif" },
  { id: "cuti", label: "Cuti" },
  { id: "alumnus", label: "Alumnus" },
  { id: "non_aktif", label: "Non-Aktif" },
];

export default function StudentTable({ students, statusFilter, onStatusFilterChange, onEdit, onDelete }: StudentTableProps) {
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
            <th>Program Kursus</th>
            <th>Status</th>
            <th>Orang Tua Terhubung</th>
            <th style={{ textAlign: "right" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                Tidak ada siswa ditemukan untuk filter ini. Klik &ldquo;Tambah Siswa&rdquo; untuk membuat baru!
              </td>
            </tr>
          ) : (
            filteredStudents.map((student, idx) => {
              const st = student.status || "aktif";
              const stInfo = STATUS_BADGE_MAP[st] || STATUS_BADGE_MAP.aktif;

              return (
                <tr key={student.id}>
                  <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                  <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>{student.name}</td>
                  <td>{student.age} Tahun</td>
                  <td>
                    <span className="user-badge" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.25rem 0.65rem", fontWeight: "700" }}>
                      {student.program}
                    </span>
                  </td>
                  <td>
                    <span style={{ backgroundColor: stInfo.bg, color: stInfo.color, padding: "0.25rem 0.65rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      {stInfo.icon}
                      <span>{stInfo.label}</span>
                    </span>
                  </td>
                  <td>
                    {student.profiles ? (
                      <span style={{ color: "var(--color-green)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {student.profiles.full_name}
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-gray-500)", fontStyle: "italic" }}>Belum dipasangkan</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button className="btn-portal-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", height: "auto" }} onClick={() => onEdit(student)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem" }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <span>Edit</span>
                      </button>
                      <button className="btn-portal-danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", height: "auto" }} onClick={() => onDelete(student.id, student.name)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem" }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        <span>Hapus</span>
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
