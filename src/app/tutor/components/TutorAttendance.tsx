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
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {[
                        { value: "hadir", label: "Hadir", activeBg: "#d1f2d9", activeColor: "#0f5132", border: "1px solid #198754" },
                        { value: "sakit", label: "Sakit", activeBg: "#fdeace", activeColor: "#664d03", border: "1px solid #ffc107" },
                        { value: "izin", label: "Izin", activeBg: "#c2e7ff", activeColor: "#004a77", border: "1px solid #007aff" },
                        { value: "alfa", label: "Alfa", activeBg: "#f8d7da", activeColor: "#842029", border: "1px solid #dc3545" },
                        { value: "tidak_ada_kelas", label: "Tidak ada Kelas", activeBg: "#e2e3e5", activeColor: "#41464b", border: "1px solid #6c757d" }
                      ].map(opt => {
                        const isActive = data.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleStatusChange(s.id, opt.value)}
                            style={{
                              padding: "0.3rem 0.65rem",
                              borderRadius: "8px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              border: isActive ? opt.border : "1px solid rgba(0, 0, 0, 0.05)",
                              backgroundColor: isActive ? opt.activeBg : "#f5f5f7",
                              color: isActive ? opt.activeColor : "var(--color-gray-500, #59616e)",
                              transition: "all 0.15s ease"
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
