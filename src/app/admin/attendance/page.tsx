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

      {/* Tutor Attendance Reminder Banner */}
      {activeTab === "input" && !loading && (
        (() => {
          const isToday = selectedDate === new Date().toISOString().split("T")[0];
          const filledCount = Object.values(attendanceMap).filter(e => e.isExisting).length;
          const isComplete = filledCount > 0 && filledCount >= students.length;

          if (isToday) {
            if (isComplete) {
              return (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", color: "#166534", flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#166534" }}>Absensi Hari Ini Lengkap!</h4>
                      <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#15803d" }}>Seluruh data kehadiran {students.length} siswa untuk tanggal {selectedDate} sudah diisi oleh Tutor.</p>
                    </div>
                  </div>
                </div>
              );
            } else {
              const waText = encodeURIComponent(`Halo Tutor Ibra Global English,\n\nMengingatkan untuk mengisi absensi kelas harian tanggal ${selectedDate} pada Portal Admin / Tutor. Terima kasih! 🙏`);
              return (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#92400e", flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#92400e" }}>Pengingat Absensi Harian Tutor</h4>
                      <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#b45309" }}>
                        {filledCount > 0 ? `Baru ${filledCount} dari ${students.length} siswa terisi absensinya hari ini.` : `Absensi untuk kelas hari ini (${selectedDate}) belum diisi oleh Tutor.`}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-portal"
                    style={{ backgroundColor: "#25d366", color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.9rem", fontSize: "0.82rem", borderRadius: "8px", fontWeight: 700 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    <span>Ingatkan Tutor via WA</span>
                  </a>
                </div>
              );
            }
          }
          return null;
        })()
      )}

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
                                { status: "hadir", label: "Hadir", activeBg: "#d1f2d9", activeColor: "#0f5132", border: "1px solid #198754" },
                                { status: "sakit", label: "Sakit", activeBg: "#fdeace", activeColor: "#664d03", border: "1px solid #ffc107" },
                                { status: "izin", label: "Izin", activeBg: "#c2e7ff", activeColor: "#004a77", border: "1px solid #007aff" },
                                { status: "alfa", label: "Alfa", activeBg: "#f8d7da", activeColor: "#842029", border: "1px solid #dc3545" },
                                { status: "tidak_ada_kelas", label: "Tidak ada Kelas", activeBg: "#e2e3e5", activeColor: "#41464b", border: "1px solid #6c757d" }
                              ].map(opt => {
                                const isActive = localData.status === opt.status;
                                return (
                                  <button
                                    key={opt.status}
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, opt.status)}
                                    style={{
                                      padding: "0.3rem 0.65rem",
                                      borderRadius: "var(--radius-full)",
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
