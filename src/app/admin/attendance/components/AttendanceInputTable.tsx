"use client";

import React from "react";
import { Student, AttendanceEntry } from "../hooks/useAttendanceData";

interface AttendanceInputTableProps {
  students: Student[];
  attendanceMap: Record<string, AttendanceEntry>;
  submitting: boolean;
  onStatusChange: (studentId: string, status: string) => void;
  onNotesChange: (studentId: string, notes: string) => void;
  onSave: () => void;
}

const STATUS_OPTIONS = [
  { status: "hadir", label: "Hadir", activeBg: "#d1f2d9", activeColor: "#0f5132", border: "1px solid #198754" },
  { status: "sakit", label: "Sakit", activeBg: "#fdeace", activeColor: "#664d03", border: "1px solid #ffc107" },
  { status: "izin", label: "Izin", activeBg: "#c2e7ff", activeColor: "#004a77", border: "1px solid #007aff" },
  { status: "alfa", label: "Alfa", activeBg: "#f8d7da", activeColor: "#842029", border: "1px solid #dc3545" },
  { status: "tidak_ada_kelas", label: "Tidak ada Kelas", activeBg: "#e2e3e5", activeColor: "#41464b", border: "1px solid #6c757d" },
];

export default function AttendanceInputTable({ students, attendanceMap, submitting, onStatusChange, onNotesChange, onSave }: AttendanceInputTableProps) {
  if (students.length === 0) return null;

  return (
    <div>
      <div className="table-wrapper">
        <table className="portal-table attendance-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>Program Kursus</th>
              <th style={{ width: "380px" }}>Status Kehadiran</th>
              <th>Catatan / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const localData = attendanceMap[student.id] || { status: "hadir", notes: "" };
              return (
                <tr key={student.id}>
                  <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                  <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>{student.name}</td>
                  <td>
                    <span className="user-badge" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                      {student.program}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {STATUS_OPTIONS.map((opt) => {
                        const isActive = localData.status === opt.status;
                        return (
                          <button
                            key={opt.status}
                            type="button"
                            onClick={() => onStatusChange(student.id, opt.status)}
                            style={{
                              padding: "0.3rem 0.65rem",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              border: isActive ? opt.border : "1px solid rgba(0, 0, 0, 0.05)",
                              backgroundColor: isActive ? opt.activeBg : "#f5f5f7",
                              color: isActive ? opt.activeColor : "var(--color-gray-500, #59616e)",
                              transition: "all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Catatan opsional..."
                      className="form-input"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
                      value={localData.notes}
                      onChange={(e) => onNotesChange(student.id, e.target.value)}
                      disabled={submitting}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
        <button
          className="btn-portal-primary"
          style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}
          onClick={onSave}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <svg style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Menyimpan Presensi...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>Simpan Presensi Hari Ini</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
