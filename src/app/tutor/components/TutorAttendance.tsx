"use client";

import React from "react";

interface Student {
  id: string;
  name: string;
  program: string;
}

interface AttendanceRecord {
  status: string;
  notes: string;
}

interface TutorAttendanceProps {
  students: Student[];
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  attendanceLoading: boolean;
  attendanceData: Record<string, AttendanceRecord>;
  handleStatusChange: (studentId: string, status: string) => void;
  handleNotesChange: (studentId: string, notes: string) => void;
  handleSaveAttendance: () => void;
}

export default function TutorAttendance({
  students,
  attendanceDate,
  setAttendanceDate,
  attendanceLoading,
  attendanceData,
  handleStatusChange,
  handleNotesChange,
  handleSaveAttendance
}: TutorAttendanceProps) {
  if (attendanceLoading) {
    return (
      <div className="portal-card" style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <p style={{ color: "var(--color-gray-500)", fontWeight: "600" }}>Memuat lembar absensi...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="portal-card" style={{ padding: "2rem" }}>
        <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-400)" }}>Belum ada siswa terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
          Lembar Presensi Harian Siswa
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <label style={{ fontWeight: "700", fontSize: "0.85rem" }}>Pilih Tanggal:</label>
          <input
            type="date"
            className="form-input"
            style={{ width: "170px", padding: "0.45rem", fontSize: "0.85rem" }}
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>Program</th>
              <th>Kehadiran</th>
              <th>Catatan / Masukan</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => {
              const data = attendanceData[s.id] || { status: "hadir", notes: "" };
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                  <td style={{ fontWeight: "700" }}>{s.name}</td>
                  <td>
                    <span className="user-badge" style={{ fontSize: "0.75rem" }}>{s.program}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      {[
                        { value: "hadir", label: "Hadir" },
                        { value: "sakit", label: "Sakit" },
                        { value: "izin", label: "Izin" },
                        { value: "alfa", label: "Alfa" },
                        { value: "tidak_ada_kelas", label: "Tidak ada Kelas" }
                      ].map((option) => (
                        <label key={option.value} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>
                          <input
                            type="radio"
                            name={`attendance-${s.id}`}
                            checked={data.status === option.value}
                            onChange={() => handleStatusChange(s.id, option.value)}
                            style={{ accentColor: option.value === "tidak_ada_kelas" ? "var(--color-gray-400)" : "var(--color-primary)" }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: "0.35rem", fontSize: "0.85rem" }}
                      placeholder="Opsional..."
                      value={data.notes}
                      onChange={(e) => handleNotesChange(s.id, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
        <button className="btn-portal-primary" onClick={handleSaveAttendance} style={{ padding: "0.75rem 2rem" }}>
          Simpan Presensi Hari Ini
        </button>
      </div>
    </div>
  );
}
