export const dynamic = 'force-dynamic';

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DailyAttendance() {
  const supabase = createClient();

  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Peta absensi lokal: { [studentId]: { status: 'hadir'|'sakit'|'izin'|'alfa', notes: '...' } }
  const [attendanceMap, setAttendanceMap] = useState({});

  const getIndonesianDay = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
  };

  const getIndonesianDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  useEffect(() => {
    // Set default date ke hari ini (zona waktu lokal)
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    setSelectedDate(localToday.toISOString().split("T")[0]);
  }, []);

  const loadAttendanceAndStudents = async () => {
    if (!selectedDate) return;
    setLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      // 1. Ambil semua siswa
      const { data: studentList, error: errS } = await supabase
        .from("students")
        .select("id, name, program")
        .order("name", { ascending: true });

      if (errS) throw errS;

      // 2. Ambil absensi hari terpilih jika sudah ada
      const { data: attendanceList, error: errA } = await supabase
        .from("attendance")
        .select("student_id, status, notes")
        .eq("date", selectedDate);

      if (errA) throw errA;

      // 3. Gabungkan data ke dalam map state
      const initialMap = {};
      studentList.forEach((student) => {
        // Cari apakah ada data absensi untuk siswa ini
        const recorded = attendanceList?.find((a) => a.student_id === student.id);
        initialMap[student.id] = {
          status: recorded ? recorded.status : "hadir", // Default jika belum tercatat: hadir
          notes: recorded ? recorded.notes || "" : "",
          isExisting: !!recorded,
        };
      });

      setStudents(studentList || []);
      setAttendanceMap(initialMap);
    } catch (err) {
      console.error("Gagal mengambil data absensi:", err);
      setStatusMsg({ type: "error", text: "Gagal memuat absensi: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceAndStudents();
  }, [selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setSubmitting(true);
    setStatusMsg({ type: "", text: "" });

    try {
      // Siapkan payload upsert untuk absensi harian
      const upsertPayload = students.map((student) => ({
        student_id: student.id,
        date: selectedDate,
        status: attendanceMap[student.id]?.status || "hadir",
        notes: attendanceMap[student.id]?.notes?.trim() || null,
      }));

      // Di Supabase, kita dapat melakukan upsert dengan mencocokkan constraint unik harian
      const { error } = await supabase
        .from("attendance")
        .upsert(upsertPayload, {
          onConflict: "student_id, date",
        });

      if (error) throw error;

      setStatusMsg({
        type: "success",
        text: `Absensi untuk tanggal ${selectedDate} berhasil disimpan!`,
      });

      // Reload data
      loadAttendanceAndStudents();
    } catch (err) {
      console.error("Gagal menyimpan absensi:", err);
      setStatusMsg({ type: "error", text: "Gagal menyimpan absensi: " + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Absensi Harian</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Pencatatan kehadiran kelas tutor harian untuk <strong style={{ color: "var(--color-primary-dark)" }}>{selectedDate ? `${getIndonesianDay(selectedDate)}, ${getIndonesianDate(selectedDate)}` : "-"}</strong>
          </p>
        </div>
        <div className="topbar-user" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Pemilih Tanggal */}
          <label htmlFor="attendance-date" style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>
            Pilih Tanggal:
          </label>
          <input
            type="date"
            id="attendance-date"
            className="form-input"
            style={{ width: "180px", padding: "0.45rem 1rem", fontSize: "0.85rem" }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"}
          style={{ marginBottom: "1.5rem" }}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p>Memuat lembar kehadiran siswa...</p>
        </div>
      ) : (
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
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                      Belum ada siswa terdaftar di bimbingan belajar. Daftarkan siswa terlebih dahulu di menu "Kelola Siswa".
                    </td>
                  </tr>
                ) : (
                  students.map((student, idx) => {
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
                          <div style={{ display: "flex", gap: "1rem" }}>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={localData.status === "hadir"}
                                onChange={() => handleStatusChange(student.id, "hadir")}
                                style={{ accentColor: "var(--color-primary)" }}
                              />
                              <span className={localData.status === "hadir" ? "badge-hadir" : ""} style={{ padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)" }}>Hadir</span>
                            </label>

                            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={localData.status === "sakit"}
                                onChange={() => handleStatusChange(student.id, "sakit")}
                                style={{ accentColor: "var(--color-yellow)" }}
                              />
                              <span className={localData.status === "sakit" ? "badge-sakit" : ""} style={{ padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)" }}>Sakit</span>
                            </label>

                            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={localData.status === "izin"}
                                onChange={() => handleStatusChange(student.id, "izin")}
                                style={{ accentColor: "var(--color-primary)" }}
                              />
                              <span className={localData.status === "izin" ? "badge-izin" : ""} style={{ padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)" }}>Izin</span>
                            </label>

                            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}>
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                checked={localData.status === "alfa"}
                                onChange={() => handleStatusChange(student.id, "alfa")}
                                style={{ accentColor: "#ef4444" }}
                              />
                              <span className={localData.status === "alfa" ? "badge-alfa" : ""} style={{ padding: "0.2rem 0.5rem", borderRadius: "var(--radius-sm)" }}>Alfa</span>
                            </label>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Catatan opsional..."
                            className="form-input"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
                            value={localData.notes}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            disabled={submitting}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {students.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn-portal-primary"
                style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}
                onClick={handleSaveAttendance}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
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
          )}
        </div>
      )}
    </div>
  );
}
