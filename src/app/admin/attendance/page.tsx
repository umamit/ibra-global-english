"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";

interface Student {
  id: string;
  name: string;
  program: string;
}

interface AttendanceEntry {
  status: string;
  notes: string;
  isExisting: boolean;
}

interface RecapRow {
  id: string;
  name: string;
  program: string;
  hadir: number;
  sakit: number;
  izin: number;
  alfa: number;
  tidak_ada_kelas: number;
  total: number;
}

interface StatusMsg {
  type: string;
  text: string;
}

export default function DailyAttendance() {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    return localToday.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<StatusMsg>({ type: "", text: "" });

  // Peta absensi lokal: { [studentId]: { status: 'hadir'|'sakit'|'izin'|'alfa', notes: '...' } }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceEntry>>({});

  // Rekapitulasi Absensi State
  const [activeTab, setActiveTab] = useState<string>("input"); // "input" | "rekap"
  const [recapData, setRecapData] = useState<RecapRow[]>([]);
  const [recapLoading, setRecapLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("");

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const loadRecapData = async (): Promise<void> => {
    setRecapLoading(true);
    try {
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDayDate = new Date(year, month, 0);
      const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(lastDayDate.getDate()).padStart(2, "0")}`;

      const { data: attendanceList, error: errA } = await supabase
        .from("attendance")
        .select("student_id, status")
        .gte("date", firstDay)
        .lte("date", lastDay);

      if (errA) throw errA;

      const { data: studentList, error: errS } = await supabase
        .from("students")
        .select("id, name, program")
        .order("name", { ascending: true });

      if (errS) throw errS;

      const recapMap: Record<string, RecapRow> = {};
      studentList?.forEach((student: Student) => {
        recapMap[student.id] = {
          id: student.id,
          name: student.name,
          program: student.program,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alfa: 0,
          tidak_ada_kelas: 0,
          total: 0,
        };
      });

      attendanceList?.forEach((rec: { student_id: string; status: string }) => {
        const row = recapMap[rec.student_id];
        if (row) {
          const status = rec.status;
          if (status === "hadir") row.hadir++;
          else if (status === "sakit") row.sakit++;
          else if (status === "izin") row.izin++;
          else if (status === "alfa") row.alfa++;
          else if (status === "tidak_ada_kelas") row.tidak_ada_kelas++;
          row.total++;
        }
      });

      setRecapData(Object.values(recapMap));
    } catch (err) {
      console.error("Gagal memuat rekapitulasi absensi:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: "error", text: "Gagal memuat rekapitulasi: " + msg });
    } finally {
      setRecapLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!cancelled && activeTab === "rekap") {
        await loadRecapData();
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedMonth]);

  const filteredRecap = recapData.filter((row) => {
    const matchName = row.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProgram = programFilter ? row.program === programFilter : true;
    return matchName && matchProgram;
  });

  // Export rekapitulasi absensi ke CSV
  const exportRecapCSV = () => {
    const headers = ["No", "Nama Siswa", "Program", "Hadir", "Sakit", "Izin", "Alfa", "Tidak ada Kelas", "Total Sesi", "Kehadiran (%)"];
    const rows = filteredRecap.map((row, idx) => {
      const activeTotal = row.hadir + row.sakit + row.izin + row.alfa;
      const pct = activeTotal > 0 ? Math.round((row.hadir / activeTotal) * 100) : 100;
      return [
        idx + 1,
        row.name,
        row.program,
        row.hadir,
        row.sakit,
        row.izin,
        row.alfa,
        row.tidak_ada_kelas || 0,
        row.total,
        `${pct}%`
      ];
    });
    const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekapitulasi_absensi_${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getIndonesianDay = (dateStr: string): string => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
  };

  const getIndonesianDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const loadAttendanceAndStudents = async (): Promise<void> => {
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
      const initialMap: Record<string, AttendanceEntry> = {};
      studentList.forEach((student: Student) => {
        // Cari apakah ada data absensi untuk siswa ini
        const recorded = attendanceList?.find((a: { student_id: string }) => a.student_id === student.id);
        initialMap[student.id] = {
          status: recorded ? (recorded as { status: string }).status : "", // Empty default - admin must explicitly choose
          notes: recorded ? ((recorded as { notes?: string }).notes || "") : "",
          isExisting: !!recorded,
        };
      });

      setStudents(studentList || []);
      setAttendanceMap(initialMap);
    } catch (err) {
      console.error("Gagal mengambil data absensi:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: "error", text: "Gagal memuat absensi: " + msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAttendanceAndStudents();
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleSaveAttendance = async (): Promise<void> => {
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

      posthog.capture("admin_attendance_submitted", {
        date: selectedDate,
        student_count: students.length,
      });
      setStatusMsg({
        type: "success",
        text: `Absensi untuk tanggal ${selectedDate} berhasil disimpan!`,
      });

      // Reload data
      loadAttendanceAndStudents();
    } catch (err) {
      console.error("Gagal menyimpan absensi:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: "error", text: "Gagal menyimpan absensi: " + msg });
    } finally {
      setSubmitting(false);
    }
  };

  const getAttendanceRateBadge = (rate: number): React.ReactElement => {
    let bgColor = "var(--color-green-light)";
    let textColor = "var(--color-green)";
    let border = "1px solid rgba(34, 197, 94, 0.2)";

    if (rate < 75) {
      bgColor = "#ffeeeb";
      textColor = "#ef4444";
      border = "1px solid rgba(239, 68, 68, 0.2)";
    } else if (rate < 90) {
      bgColor = "#fef9c3";
      textColor = "#a16207";
      border = "1px solid rgba(161, 98, 7, 0.2)";
    }

    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "0.8rem",
        padding: "0.25rem 0.75rem",
        borderRadius: "var(--radius-full)",
        backgroundColor: bgColor,
        color: textColor,
        border: border
      }}>
        {rate}%
      </span>
    );
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          {activeTab === "input" ? (
            <>
              <h1>Absensi Harian</h1>
              <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
                Pencatatan kehadiran kelas tutor harian untuk <strong style={{ color: "var(--color-primary-dark)" }}>{selectedDate ? `${getIndonesianDay(selectedDate)}, ${getIndonesianDate(selectedDate)}` : "-"}</strong>
              </p>
            </>
          ) : (
            <>
              <h1>Rekapitulasi Absensi</h1>
              <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
                Akumulasi dan persentase kehadiran seluruh siswa selama bimbingan belajar
              </p>
            </>
          )}
        </div>
        {activeTab === "input" && (
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
        )}
        {activeTab === "rekap" && (
          <div className="topbar-user" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="no-print">
              <label htmlFor="recap-month" style={{ fontWeight: "700", fontSize: "0.85rem", color: "var(--color-gray-700)" }}>
                Bulan:
              </label>
              <input
                type="month"
                id="recap-month"
                className="form-input"
                style={{ width: "160px", padding: "0.45rem 1rem", fontSize: "0.85rem" }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={recapLoading}
              />
            </div>
            {filteredRecap.length > 0 && (
              <div style={{ display: "flex", gap: "0.5rem" }} className="no-print">
                <button
                  className="btn-portal-outline"
                  onClick={exportRecapCSV}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Export CSV</span>
                </button>
                <button
                  className="btn-portal"
                  onClick={() => window.print()}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  <span>Cetak PDF</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="no-print" style={{
        display: "flex",
        borderBottom: "2px solid var(--color-gray-100)",
        marginBottom: "1.75rem",
        gap: "0.5rem"
      }}>
        <button
          onClick={() => setActiveTab("input")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 1.25rem",
            fontWeight: activeTab === "input" ? "800" : "500",
            color: activeTab === "input" ? "var(--color-primary-dark)" : "var(--color-gray-500)",
            borderBottom: activeTab === "input" ? "3px solid var(--color-primary)" : "3px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            fontSize: "1rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span>Input Absensi Harian</span>
        </button>
        <button
          onClick={() => setActiveTab("rekap")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 1.25rem",
            fontWeight: activeTab === "rekap" ? "800" : "500",
            color: activeTab === "rekap" ? "var(--color-primary-dark)" : "var(--color-gray-500)",
            borderBottom: activeTab === "rekap" ? "3px solid var(--color-primary)" : "3px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            fontSize: "1rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <span>Rekapitulasi Kehadiran</span>
        </button>
      </div>

      {statusMsg.text && (
        <div
          className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"}
          style={{ marginBottom: "1.5rem" }}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {activeTab === "input" ? (
        loading ? (
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
                      <td colSpan={5} style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                        Belum ada siswa terdaftar di bimbingan belajar. Daftarkan siswa terlebih dahulu di menu &ldquo;Kelola Siswa&rdquo;.
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
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                              {[
                                { status: "hadir", label: "Hadir", activeBg: "#e6f4ea", activeColor: "#137333", border: "1px solid rgba(19, 115, 51, 0.15)" },
                                { status: "sakit", label: "Sakit", activeBg: "#fef7e0", activeColor: "#b06000", border: "1px solid rgba(176, 96, 0, 0.15)" },
                                { status: "izin", label: "Izin", activeBg: "#eef6f8", activeColor: "var(--color-primary-dark, #164d57)", border: "1px solid rgba(33, 108, 126, 0.15)" },
                                { status: "alfa", label: "Alfa", activeBg: "#fce8e6", activeColor: "#c5221f", border: "1px solid rgba(197, 34, 31, 0.15)" },
                                { status: "tidak_ada_kelas", label: "Tidak ada Kelas", activeBg: "#f1f3f4", activeColor: "#5f6368", border: "1px solid rgba(95, 99, 104, 0.15)" }
                              ].map(opt => {
                                const isActive = localData.status === opt.status;
                                return (
                                  <button
                                    key={opt.status}
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, opt.status)}
                                    style={{
                                      padding: "0.3rem 0.65rem",
                                      borderRadius: "8px",
                                      fontSize: "0.78rem",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      border: isActive ? opt.border : "1px solid rgba(0, 0, 0, 0.05)",
                                      backgroundColor: isActive ? opt.activeBg : "#f5f5f7",
                                      color: isActive ? opt.activeColor : "var(--color-gray-500, #59616e)",
                                      transition: "all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
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
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
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
        )
      ) : (
        <div>
          {/* Search & Filter Controls */}
          <div className="no-print" style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <input
                type="text"
                placeholder="Cari nama siswa..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "0.55rem 1rem", fontSize: "0.9rem" }}
              />
            </div>
            <div style={{ width: "200px" }}>
              <select
                className="form-input"
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                style={{ padding: "0.55rem 1rem", fontSize: "0.9rem" }}
              >
                <option value="">Semua Program</option>
                <option value="Kids Program">Kids Program</option>
                <option value="Teens Program">Teens Program</option>
                <option value="Fun Calistung">Fun Calistung</option>
              </select>
            </div>
          </div>

          {recapLoading ? (
            <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
              <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <p>Memuat rekapitulasi absensi...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <style dangerouslySetInnerHTML={{__html: `
                .print-only-header {
                  display: none;
                }
                @media print {
                  .print-only-header {
                    display: block !important;
                  }
                  /* Gunakan full-width dan bersihkan latar belakang untuk cetakan */
                  .attendance-recap-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                  }
                  .attendance-recap-table th, .attendance-recap-table td {
                    border: 1px solid #ddd !important;
                    padding: 8px !important;
                    color: black !important;
                  }
                }
              `}} />
              
              {/* Header Cetak (Hanya tampil saat di-print) */}
              <div className="print-only-header" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "3px double #000000", paddingBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "50px", height: "54px" }} />
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
                          <td>
                            <span className="user-badge" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                              {row.program}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: "var(--color-green)" }}>{row.hadir}</td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: "#a16207" }}>{row.sakit}</td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: "var(--color-primary)" }}>{row.izin}</td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: "#ef4444" }}>{row.alfa}</td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: "var(--color-gray-500)" }}>{row.tidak_ada_kelas || 0}</td>
                          <td style={{ textAlign: "center", fontWeight: "700", color: "var(--color-gray-700)" }}>{row.total}</td>
                          <td style={{ textAlign: "center" }}>
                            {getAttendanceRateBadge(rate)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
